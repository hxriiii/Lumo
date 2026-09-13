from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import Question, Test, TestQuestion, Answer
from .serializers import TestSerializer, QuestionSerializer, QuestionResultSerializer
from subjects.models import Topic
from progress.models import TopicProgress, TestResult, QuestionResult
from adaptive.services import AdaptiveEngine
from adaptive.serializers import AdaptiveDecisionSerializer

class StartTestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        topic_id = request.data.get('topic_id')
        difficulty = request.data.get('difficulty', 'easy')

        try:
            topic = Topic.objects.get(id=topic_id)
        except Topic.DoesNotExist:
            return Response({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if student has an existing progress difficulty preference if difficulty not supplied
        progress, _ = TopicProgress.objects.get_or_create(
            student=request.user,
            topic=topic,
            defaults={'current_difficulty': difficulty}
        )

        if not request.data.get('difficulty'):
            difficulty = progress.current_difficulty

        # Query matching questions
        matching_questions = list(Question.objects.filter(topic=topic, difficulty=difficulty))
        
        # Fallback to any difficulty questions if not enough matching
        if len(matching_questions) < 3:
            matching_questions = list(Question.objects.filter(topic=topic))

        if not matching_questions:
            return Response({'error': f'No questions available for topic {topic.name}'}, status=status.HTTP_400_BAD_REQUEST)

        # Take up to 10 questions
        selected = matching_questions[:10]

        test = Test.objects.create(
            student=request.user,
            topic=topic,
            difficulty=difficulty,
            total_questions=len(selected)
        )

        for index, q in enumerate(selected, start=1):
            TestQuestion.objects.create(test=test, question=q, order=index)

        return Response(TestSerializer(test).data, status=status.HTTP_201_CREATED)

class TestDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            test = Test.objects.get(pk=pk, student=request.user)
            return Response(TestSerializer(test).data)
        except Test.DoesNotExist:
            return Response({'error': 'Test not found'}, status=status.HTTP_404_NOT_FOUND)

class SubmitTestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            test = Test.objects.get(pk=pk, student=request.user)
        except Test.DoesNotExist:
            return Response({'error': 'Test not found'}, status=status.HTTP_404_NOT_FOUND)

        if test.completed:
            return Response({'error': 'Test has already been submitted'}, status=status.HTTP_400_BAD_REQUEST)

        submitted_answers = request.data.get('answers', [])  # list of {question_id, selected_option}
        time_taken = request.data.get('time_taken_seconds', 0)

        correct_count = 0
        total_count = test.test_questions.count()
        question_results_data = []

        # Create TestResult wrapper first
        test_result = TestResult.objects.create(
            test=test,
            student=request.user,
            topic=test.topic,
            correct_count=0,
            total_count=total_count,
            time_taken_seconds=time_taken
        )

        for ans in submitted_answers:
            q_id = ans.get('question_id')
            selected = ans.get('selected_option', '').strip()
            try:
                question = Question.objects.get(id=q_id)
                is_correct = (selected.lower() == question.correct_answer.strip().lower())
                if is_correct:
                    correct_count += 1

                Answer.objects.create(
                    test=test,
                    question=question,
                    selected_option=selected,
                    is_correct=is_correct
                )

                QuestionResult.objects.create(
                    test_result=test_result,
                    question=question,
                    selected_option=selected,
                    correct_option=question.correct_answer,
                    is_correct=is_correct
                )
                
                question_results_data.append({
                    'question_id': question.id,
                    'text': question.text,
                    'options': question.options,
                    'selected_option': selected,
                    'correct_answer': question.correct_answer,
                    'explanation': question.explanation,
                    'is_correct': is_correct,
                    'concept_tag': question.concept_tag
                })

            except Question.DoesNotExist:
                continue

        score_pct = round((correct_count / total_count * 100.0), 1) if total_count > 0 else 0.0
        test_result.score = score_pct
        test_result.correct_count = correct_count
        test_result.save()

        test.completed = True
        test.completed_at = timezone.now()
        test.save()

        # Run Adaptive Decision Engine
        adaptive_decision = AdaptiveEngine.analyze_and_decide(test_result)

        # Check if mentor referral triggered
        if adaptive_decision.decision == 'mentor':
            from mentor.models import MentorRequest
            MentorRequest.objects.get_or_create(
                student=request.user,
                topic=test.topic,
                defaults={
                    'reason': adaptive_decision.reason,
                    'attempts_summary': f"Failed after {test_result.test.difficulty} exam with score {score_pct}%. Weak concepts: {', '.join(adaptive_decision.weak_areas)}"
                }
            )

        return Response({
            'test_id': test.id,
            'topic_name': test.topic.name,
            'difficulty': test.difficulty,
            'score': score_pct,
            'correct_count': correct_count,
            'total_count': total_count,
            'time_taken_seconds': time_taken,
            'question_results': question_results_data,
            'adaptive_decision': AdaptiveDecisionSerializer(adaptive_decision).data
        })
