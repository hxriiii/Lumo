import json
import re
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

        # Retrieve past conversation turns for memory context (up to 10 past messages)
        past_qs = ChatMessage.objects.filter(student=request.user)
        if topic:
            past_qs = past_qs.filter(topic=topic)
        
        past_messages = list(past_qs.exclude(id=student_msg.id).order_by('-created_at')[:10])
        past_messages.reverse() # Chronological order

        chat_history = [
            {'role': 'user' if m.sender == 'student' else 'model', 'text': m.text}
            for m in past_messages
        ]

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

            # Retrieve RAG note chunks for topic matching user query
            from subjects.rag_service import search_rag_chunks
            rag_chunks = search_rag_chunks(topic.id, user_message_text, top_k=3)
            if rag_chunks:
                context['rag_notes'] = [c.content for c in rag_chunks]

        # Generate response using Gemini with History or Fallback
        bot_response_text = self._generate_ai_response(user_message_text, context, chat_history)

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

    def _generate_ai_response(self, user_prompt, context, chat_history=None):
        chat_history = chat_history or []
        rag_str = "\n".join(context.get('rag_notes', []))
        rag_context_prompt = f"\nRelevant RAG Study Notes Context:\n{rag_str}\n" if rag_str else ""

        system_prompt = f"""
You are the Lumo Gemini AI Learning Coach, a friendly, intelligent, empathetic, and highly effective AI tutor.
Student Name: {context.get('student_name')}
Topic: {context.get('topic_name')} ({context.get('subject_name')})
Topic Mastery Level: {context.get('mastery_score', 'N/A')}%
Current Difficulty Level: {context.get('difficulty', 'N/A')}
Identified Weak Areas: {', '.join(context.get('weak_areas', []))}
{rag_context_prompt}
Important Rules:
1. Maintain active conversation memory. Acknowledge and remember what the student previously said in past messages.
2. Answer calculations, math queries, conceptual questions, or general conversation directly and accurately.
3. Provide clear, step-by-step guidance tailored to the student's learning query.
4. Do NOT repeat a generic hello/welcome template if you are already in an ongoing conversation.
"""

        # Priority 1: Google Gemini API Call with Chat History Memory
        from subjects.gemini_service import call_gemini_chat_with_history
        gemini_reply = call_gemini_chat_with_history(
            system_instruction=system_prompt,
            chat_history=chat_history,
            current_user_text=user_prompt,
            temperature=0.5
        )
        if gemini_reply:
            return gemini_reply.strip()

        # Priority 2: Grok API Call
        api_key = getattr(settings, 'GROK_API_KEY', '')
        api_url = getattr(settings, 'GROK_API_URL', 'https://api.x.ai/v1/chat/completions')
        if api_key:
            try:
                messages_payload = [{"role": "system", "content": system_prompt}]
                for h in chat_history:
                    messages_payload.append({
                        "role": "user" if h['role'] == 'user' else "assistant",
                        "content": h['text']
                    })
                messages_payload.append({"role": "user", "content": user_prompt})

                headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
                payload = {
                    "model": "grok-beta",
                    "messages": messages_payload,
                    "temperature": 0.5
                }
                res = requests.post(api_url, headers=headers, json=payload, timeout=10)
                if res.status_code == 200:
                    return res.json()['choices'][0]['message']['content']
            except Exception as e:
                print(f"Chatbot Grok call error: {e}")

        # Priority 3: Smart Dynamic Fallback Engine (Math, Conversational & Follow-up Aware)
        topic_str = context.get('topic_name', 'your subject')
        q_clean = user_prompt.strip()

        # Check for simple arithmetic / math query (e.g. 1+1, 25 * 4, 100/5)
        math_match = re.match(r'^[\d\s\+\-\*\/\.\(\)]+$', q_clean)
        if math_match:
            try:
                # Safe simple eval for basic math expressions
                allowed_chars = set("0123456789+-*/.() ")
                if set(q_clean).issubset(allowed_chars):
                    calc_res = eval(q_clean, {"__builtins__": None}, {})
                    return f"**{q_clean} = {calc_res}** 🧮\n\nIs there a specific formula in **{topic_str}** you would like to plug numbers into?"
            except Exception:
                pass

        q_lower = q_clean.lower()

        # Check if user says hi / hello
        if q_lower in ["hi", "hello", "hey", "hlo", "greetings"]:
            if len(chat_history) > 0:
                last_user_msg = chat_history[-2]['text'] if len(chat_history) >= 2 else ""
                return f"Hey {context.get('student_name', 'there')}! I'm right here with you continuing our study on **{topic_str}**. What concept or formula should we tackle next?"
            return f"Hello {context.get('student_name', 'Learner')}! Ready to master **{topic_str}**? Ask me any question, calculation, or practice hint!"

        if "why" in q_lower or "wrong" in q_lower or "explain" in q_lower:
            weak_list = context.get('weak_areas', [])
            weak_str = f" in concepts like {', '.join(weak_list)}" if weak_list else ""
            return (
                f"Great question about **{topic_str}**{weak_str}! Here is how to break it down:\n\n"
                f"1. **Core Concept**: Identify the governing law or definition for {topic_str}.\n"
                f"2. **Step-by-Step**: Substitute the given values into the formula accurately.\n"
                f"3. **Verification**: Check if the physical/logical units match.\n\n"
                f"Would you like me to give you a practice problem for this?"
            )

        if "practice" in q_lower or "question" in q_lower or "quiz" in q_lower:
            return (
                f"Here is a quick practice check for **{topic_str}**:\n\n"
                f"**Question**: In {topic_str}, what happens to output when the key variable doubles under linear conditions?\n"
                f"A) Doubles proportionally\n"
                f"B) Quadruples (squared)\n"
                f"C) Decreases by half\n"
                f"D) Remains unchanged\n\n"
                f"Reply with your choice (A, B, C, or D)!"
            )

        if "hint" in q_lower:
            return f"💡 **Hint for {topic_str}**: Check whether the relationship between key variables is linear or inversely proportional!"

        # Conversational continuation referencing chat history
        if len(chat_history) > 0:
            return f"Got it! Following up on our discussion for **{topic_str}**: You mentioned *'{q_clean}'*. Let's analyze how this connects to key principles in your current level ({context.get('difficulty', 'easy')})."

        return (
            f"I hear you regarding **'{q_clean}'** in **{topic_str}**! "
            f"How can I help you explore this concept further today?"
        )
