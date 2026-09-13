from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import TopicProgress, TestResult
from .serializers import TopicProgressSerializer, TestResultSerializer
from accounts.models import StudentProfile
from subjects.models import Subject, Topic
from adaptive.models import AdaptiveDecision
from adaptive.serializers import AdaptiveDecisionSerializer

class UserProgressOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, _ = StudentProfile.objects.get_or_create(user=user)
        selected_subjects = profile.selected_subjects.all()

        topic_progresses = TopicProgress.objects.filter(student=user)
        progress_by_topic = {tp.topic.id: tp for tp in topic_progresses}

        subject_summaries = []
        overall_masteries = []

        for sub in selected_subjects:
            topics = sub.topics.all()
            topic_list = []
            sub_mastery_sum = 0
            sub_topic_count = len(topics)

            for t in topics:
                tp = progress_by_topic.get(t.id)
                mastery = tp.mastery_score if tp else 0.0
                sub_mastery_sum += mastery
                overall_masteries.append(mastery)

                topic_list.append({
                    'id': t.id,
                    'name': t.name,
                    'description': t.description,
                    'mastery': mastery,
                    'difficulty': tp.current_difficulty if tp else 'easy',
                    'attempts': tp.attempt_count if tp else 0,
                    'last_decision': tp.last_decision if tp else 'none'
                })

            avg_sub_mastery = round(sub_mastery_sum / sub_topic_count, 1) if sub_topic_count > 0 else 0.0

            subject_summaries.append({
                'id': sub.id,
                'name': sub.name,
                'icon': sub.icon,
                'overall_mastery': avg_sub_mastery,
                'topics': topic_list
            })

        overall_score = round(sum(overall_masteries) / len(overall_masteries), 1) if overall_masteries else 0.0
        latest_decision = AdaptiveDecision.objects.filter(student=user).order_by('-created_at').first()

        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'name': user.get_full_name() or user.username
            },
            'overall_progress': overall_score,
            'subjects': subject_summaries,
            'latest_recommendation': AdaptiveDecisionSerializer(latest_decision).data if latest_decision else None
        })

class TopicProgressListView(generics.ListAPIView):
    serializer_class = TopicProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TopicProgress.objects.filter(student=self.request.user)

class TopicHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, topic_id):
        results = TestResult.objects.filter(
            student=request.user,
            topic_id=topic_id
        ).order_by('created_at')
        return Response(TestResultSerializer(results, many=True).data)
