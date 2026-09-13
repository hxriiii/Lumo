from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import MentorRequest
from .serializers import MentorRequestSerializer
from subjects.models import Topic

class MentorRequestListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if getattr(request.user.profile, 'is_mentor', False) or request.user.is_staff:
            requests = MentorRequest.objects.all().order_by('-created_at')
        else:
            requests = MentorRequest.objects.filter(student=request.user).order_by('-created_at')
        return Response(MentorRequestSerializer(requests, many=True).data)

    def post(self, request):
        topic_id = request.data.get('topic_id')
        reason = request.data.get('reason', 'Requested 1-on-1 mentor support.')
        attempts_summary = request.data.get('attempts_summary', 'Student requested intervention.')

        try:
            topic = Topic.objects.get(id=topic_id)
        except Topic.DoesNotExist:
            return Response({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)

        req, created = MentorRequest.objects.get_or_create(
            student=request.user,
            topic=topic,
            defaults={
                'reason': reason,
                'attempts_summary': attempts_summary
            }
        )

        return Response(MentorRequestSerializer(req).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class MentorRequestDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            req = MentorRequest.objects.get(pk=pk)
            serializer = MentorRequestSerializer(req, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except MentorRequest.DoesNotExist:
            return Response({'error': 'Mentor request not found'}, status=status.HTTP_404_NOT_FOUND)
