from rest_framework import serializers
from .models import MentorRequest

class MentorRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_username = serializers.CharField(source='student.username', read_only=True)
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    subject_name = serializers.CharField(source='topic.subject.name', read_only=True)

    class Meta:
        model = MentorRequest
        fields = [
            'id', 'student', 'student_name', 'student_username',
            'topic', 'topic_name', 'subject_name', 'status',
            'reason', 'attempts_summary', 'mentor_notes', 'created_at', 'updated_at'
        ]
