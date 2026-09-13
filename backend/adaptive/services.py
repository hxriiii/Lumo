import json
import requests
from django.conf import settings
from progress.models import TopicProgress, TestResult, QuestionResult
from .models import AdaptiveDecision

class AdaptiveEngine:
    """
    Hybrid Adaptive Decision Engine:
    1. Calculates objective metrics (score, trend, attempt count, mastery).
    2. Constructs structured context payload for Grok API.
    3. Calls Grok LLM (or falls back to deterministic rule engine).
    4. Validates output contract and stores AdaptiveDecision.
    """

    @classmethod
    def analyze_and_decide(cls, test_result: TestResult):
        student = test_result.student
        topic = test_result.topic
        test = test_result.test

        # Get or create TopicProgress
        progress, _ = TopicProgress.objects.get_or_create(
            student=student,
            topic=topic,
            defaults={'current_difficulty': test.difficulty}
        )

        # Fetch recent test results for this topic
        previous_results = TestResult.objects.filter(
            student=student,
            topic=topic
        ).order_by('created_at')

        recent_scores = [r.score for r in previous_results]
        attempt_count = len(recent_scores)
        mastery_score = sum(recent_scores) / attempt_count if attempt_count > 0 else test_result.score

        # Determine score trend
        if len(recent_scores) >= 2:
            if recent_scores[-1] > recent_scores[-2] + 5:
                trend = 'improving'
            elif recent_scores[-1] < recent_scores[-2] - 5:
                trend = 'declining'
            else:
                trend = 'stable'
        else:
            trend = 'stable'

        # Collect weak areas / missed concept tags
        wrong_questions = QuestionResult.objects.filter(
            test_result=test_result,
            is_correct=False
        ).select_related('question')

        weak_areas = list(set([
            q.question.concept_tag or f"Concept in Q{q.question.id}"
            for q in wrong_questions
        ]))

        # Payload context for Grok LLM
        payload_context = {
            "student": {
                "id": student.id,
                "name": student.get_full_name() or student.username
            },
            "subject": topic.subject.name,
            "topic": topic.name,
            "current_difficulty": test.difficulty,
            "current_result": {
                "score": test_result.score,
                "correct": test_result.correct_count,
                "wrong": test_result.total_count - test_result.correct_count,
                "time_taken_seconds": test_result.time_taken_seconds
            },
            "previous_results": [
                {"difficulty": r.test.difficulty, "score": r.score}
                for r in previous_results
            ],
            "topic_mastery": round(mastery_score, 1),
            "attempt_count": attempt_count,
            "reinforcement_attempts": progress.reinforcement_count,
            "score_trend": trend,
            "weak_areas": weak_areas,
            "certification_threshold": 80.0
        }

        # Try Grok LLM first
        decision_data = cls._call_grok_api(payload_context)

        # If Grok API fails or key is missing, run fallback deterministic engine
        if not decision_data:
            decision_data = cls._deterministic_fallback(payload_context)

        # Update TopicProgress state based on decision
        new_decision = decision_data['decision']
        new_difficulty = decision_data['next_difficulty']

        progress.mastery_score = round(mastery_score, 1)
        progress.last_score = test_result.score
        progress.average_score = round(mastery_score, 1)
        progress.attempt_count = attempt_count
        progress.trend = trend
        progress.last_decision = new_decision

        if test_result.score > progress.best_score:
            progress.best_score = test_result.score

        if new_decision == 'reinforce':
            progress.reinforcement_count += 1
            progress.current_difficulty = new_difficulty
        elif new_decision == 'advance':
            progress.current_difficulty = new_difficulty

        progress.save()

        # Save AdaptiveDecision record
        adaptive_record = AdaptiveDecision.objects.create(
            test_result=test_result,
            student=student,
            topic=topic,
            decision=new_decision,
            next_difficulty=new_difficulty,
            reason=decision_data.get('reason', 'Evaluated based on performance trends.'),
            weak_areas=decision_data.get('weak_areas', weak_areas),
            recommended_action=decision_data.get('recommended_action', 'Continue practice.'),
            confidence=decision_data.get('confidence', 0.9)
        )

        return adaptive_record

    @classmethod
    def _call_grok_api(cls, context):
        api_key = getattr(settings, 'GROK_API_KEY', '')
        api_url = getattr(settings, 'GROK_API_URL', 'https://api.x.ai/v1/chat/completions')

        if not api_key:
            return None

        prompt = f"""
You are the Grok Adaptive Learning Agent. Analyze the following student performance context and determine the next optimal learning step.

Learner Context:
{json.dumps(context, indent=2)}

You MUST respond strictly with a valid JSON object with the following schema:
{{
  "decision": "reinforce" | "advance" | "mentor",
  "next_difficulty": "easy" | "medium" | "hard",
  "reason": "Detailed explanation of your decision",
  "weak_areas": ["List of weak topics/concepts"],
  "recommended_action": "Actionable instructions for the student",
  "confidence": 0.95
}}

Decision Rules:
- 'advance': Score >= 85% and consistent high performance. Advance on same topic first: easy -> medium -> hard.
- 'reinforce': Score < 70% or mastery < 80%. Keep current difficulty or target practice on weak concepts.
- 'mentor': Score consistently < 50% across 3+ attempts despite reinforcement attempts.
"""

        try:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "grok-beta",
                "messages": [
                    {"role": "system", "content": "You are an adaptive AI education decision engine. Return JSON only."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2,
                "response_format": {"type": "json_object"}
            }

            response = requests.post(api_url, headers=headers, json=payload, timeout=10)
            if response.status_code == 200:
                res_json = response.json()
                content = res_json['choices'][0]['message']['content']
                parsed = json.loads(content)
                if cls._validate_contract(parsed):
                    return parsed
        except Exception as e:
            print(f"Grok API call exception: {e}")
        
        return None

    @classmethod
    def _validate_contract(cls, data):
        if not isinstance(data, dict):
            return False
        if data.get('decision') not in ['reinforce', 'advance', 'mentor']:
            return False
        if data.get('next_difficulty') not in ['easy', 'medium', 'hard']:
            return False
        return True

    @classmethod
    def _deterministic_fallback(cls, context):
        score = context['current_result']['score']
        difficulty = context['current_difficulty']
        attempts = context['attempt_count']
        reinforcement_count = context['reinforcement_attempts']
        recent_scores = [r['score'] for r in context['previous_results']]

        # Rule 1: Check for MENTOR referral
        # Trigger mentor if repeated low performance (<50%) over 3+ attempts with prior reinforcement
        consistently_failing = len(recent_scores) >= 3 and all(s < 50 for s in recent_scores[-3:])
        if consistently_failing or (score < 45 and reinforcement_count >= 2 and attempts >= 3):
            return {
                "decision": "mentor",
                "next_difficulty": difficulty,
                "reason": "Repeated low performance across multiple attempts despite reinforcement interventions.",
                "weak_areas": context['weak_areas'],
                "recommended_action": "Refer to human mentor for 1-on-1 concept clarification.",
                "confidence": 0.95
            }

        # Rule 2: Check for ADVANCE
        if score >= 85:
            if difficulty == 'easy':
                next_diff = 'medium'
            elif difficulty == 'medium':
                next_diff = 'hard'
            else:
                next_diff = 'hard'
            
            return {
                "decision": "advance",
                "next_difficulty": next_diff,
                "reason": f"Mastery demonstrated with a high score of {score}%. Ready for higher difficulty level.",
                "weak_areas": context['weak_areas'],
                "recommended_action": f"Proceed to {next_diff.upper()} exam on {context['topic']}.",
                "confidence": 0.92
            }

        # Rule 3: Check for REINFORCE
        if score < 70 or context['topic_mastery'] < 80:
            return {
                "decision": "reinforce",
                "next_difficulty": difficulty if score >= 55 else ('easy' if difficulty == 'medium' else 'easy'),
                "reason": f"Current score ({score}%) is below mastery threshold (80%). Reinforcement recommended.",
                "weak_areas": context['weak_areas'],
                "recommended_action": "Complete targeted practice questions on weak concepts before retaking assessment.",
                "confidence": 0.90
            }

        # Baseline default
        return {
            "decision": "reinforce",
            "next_difficulty": difficulty,
            "reason": "Performance is steady. Additional practice will help solidify understanding.",
            "weak_areas": context['weak_areas'],
            "recommended_action": "Review explanations and attempt practice questions.",
            "confidence": 0.85
        }
