from rest_framework import generics, permissions
from .models import Subject, Topic
from .serializers import SubjectSerializer, TopicSerializer

class SubjectListView(generics.ListAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny]

class SubjectDetailView(generics.RetrieveAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny]

class TopicListView(generics.ListAPIView):
    serializer_class = TopicSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        subject_id = self.kwargs.get('subject_id')
        if subject_id:
            return Topic.objects.filter(subject_id=subject_id)
        return Topic.objects.all()
