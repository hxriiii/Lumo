import json
import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from subjects.models import Topic
from progress.models import TopicProgress
from adaptive.models import AdaptiveDecision

class ChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        topic_id = request.query_params.get('topic_id')
        messages = ChatMessage.objects.filter(student=request.user)
        if topic_id:
            messages = messages.filter(topic_id=topic_id)
        return Response(ChatMessageSerializer(messages.order_by('created_at'), many=True).data)

    def post(self, request):
        user_message_text = request.data.get('message', '').strip()
        topic_id = request.data.get('topic_id')

        if not user_message_text:
            return Response({'error': 'Message text is required'}, status=status.HTTP_400_BAD_REQUEST)

        topic = None
        if topic_id:
            try:
                topic = Topic.objects.get(id=topic_id)
            except Topic.DoesNotExist:
                pass

        # Save student message
        student_msg = ChatMessage.objects.create(
            student=request.user,
            topic=topic,
            sender='student',
            text=user_message_text
        )

        # Build Context for AI Tutor
        context = {
            'student_name': request.user.get_full_name() or request.user.username,
            'topic_name': topic.name if topic else 'General Learning',
            'subject_name': topic.subject.name if topic else 'General',
        }

        if topic:
            try:
                tp = TopicProgress.objects.get(student=request.user, topic=topic)
                context['mastery_score'] = tp.mastery_score
                context['difficulty'] = tp.current_difficulty
            except TopicProgress.DoesNotExist:
                context['mastery_score'] = 0.0
                context['difficulty'] = 'easy'

            latest_decision = AdaptiveDecision.objects.filter(
                student=request.user, topic=topic
            ).order_by('-created_at').first()

            if latest_decision:
                context['weak_areas'] = latest_decision.weak_areas
                context['latest_decision'] = latest_decision.decision

        # Generate response using Grok or Fallback
        bot_response_text = self._generate_ai_response(user_message_text, context)

        # Save assistant message
        assistant_msg = ChatMessage.objects.create(
            student=request.user,
            topic=topic,
            sender='assistant',
            text=bot_response_text
        )

        return Response({
            'student_message': ChatMessageSerializer(student_msg).data,
            'assistant_message': ChatMessageSerializer(assistant_msg).data
        })

    def _generate_ai_response(self, user_prompt, context):
        rag_str = "\n".join(context.get('rag_notes', []))
        rag_context_prompt = f"\nRelevant RAG Study Notes Context:\n{rag_str}\n" if rag_str else ""

        system_prompt = f"""
You are the Lumo Gemini AI Learning Coach, an empathetic, encouraging, and highly effective AI tutor companion.
Student Name: {context.get('student_name')}
Topic: {context.get('topic_name')} ({context.get('subject_name')})
Topic Mastery Level: {context.get('mastery_score', 'N/A')}%
Current Difficulty Level: {context.get('difficulty', 'N/A')}
Identified Weak Areas: {', '.join(context.get('weak_areas', []))}
{rag_context_prompt}
Your goal: Provide clear, concise, step-by-step explanations, helpful hints, or tailored practice question hints based on the student's question and relevant study notes.
Keep your response engaging, easy to follow, and directly relevant to the student's learning query.
"""

        # Priority 1: Google Gemini API Call
        from subjects.gemini_service import call_gemini_api
        gemini_reply = call_gemini_api(user_prompt, system_instruction=system_prompt, temperature=0.5)
        if gemini_reply:
            return gemini_reply.strip()

        # Priority 2: Grok API Call
        api_key = getattr(settings, 'GROK_API_KEY', '')
        api_url = getattr(settings, 'GROK_API_URL', 'https://api.x.ai/v1/chat/completions')
        if api_key:
            try:
                headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
                payload = {
                    "model": "grok-beta",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.5
                }
                res = requests.post(api_url, headers=headers, json=payload, timeout=10)
                if res.status_code == 200:
                    return res.json()['choices'][0]['message']['content']
            except Exception as e:
                print(f"Chatbot Grok call error: {e}")


        # Fallback intelligent tutor response engine
        topic_str = context.get('topic_name', 'your subject')
        weak_list = context.get('weak_areas', [])
        weak_str = f" in concepts like {', '.join(weak_list)}" if weak_list else ""

        q_lower = user_prompt.lower()
        if "why" in q_lower or "wrong" in q_lower or "explain" in q_lower:
            return (
                f"Great question! When studying **{topic_str}**, precision is key{weak_str}. "
                f"Here is a simple way to approach it:\n\n"
                f"1. **Core Principle**: Identify the fundamental physical or technical law governing this topic.\n"
                f"2. **Common Trap**: Watch out for unit conversions or subtle conceptual definitions.\n"
                f"3. **Tip**: Try breaking the question into given data, formula/logic, and step-by-step substitution.\n\n"
                f"Would you like me to give you a quick 1-question practice hint to test this?"
            )
        elif "practice" in q_lower or "question" in q_lower or "quiz" in q_lower:
            return (
                f"Here is a targeted practice check for **{topic_str}**:\n\n"
                f"**Question**: Which factor directly influences the result when working with key formulas in {topic_str}?\n"
                f"A) Constant proportional scaling\n"
                f"B) Inverse square relationship\n"
                f"C) Temperature alone\n"
                f"D) Neither of the above\n\n"
                f"Reply with your option choice and I will evaluate it for you!"
            )
        elif "hint" in q_lower:
            return f"💡 **Hint for {topic_str}**: Focus on how the core variables depend on each other. Check whether the relationship is linear or exponential!"
        else:
            return (
                f"Hello {context.get('student_name', 'Learner')}! I am your AI Coach for **{topic_str}**. "
                f"Your current mastery level is **{context.get('mastery_score', 0)}%**. "
                f"How can I help you prepare today? You can ask me to explain a concept, give a hint, or test you with a practice question."
            )
