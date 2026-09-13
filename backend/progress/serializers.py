from rest_framework import serializers
from .models import TopicProgress, TestResult, QuestionResult

class TopicProgressSerializer(serializers.ModelSerializer):
    topic_id = serializers.IntegerField(source='topic.id', read_only=True)
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    subject_id = serializers.IntegerField(source='topic.subject.id', read_only=True)
    subject_name = serializers.CharField(source='topic.subject.name', read_only=True)

    class Meta:
        model = TopicProgress
        fields = [
            'id', 'topic_id', 'topic_name', 'subject_id', 'subject_name',
            'current_difficulty', 'mastery_score', 'average_score',
            'best_score', 'last_score', 'attempt_count', 'reinforcement_count',
            'trend', 'last_decision', 'updated_at'
        ]

class TestResultSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    difficulty = serializers.CharField(source='test.difficulty', read_only=True)

    class Meta:
        model = TestResult
        fields = ['id', 'test', 'topic_name', 'difficulty', 'score', 'correct_count', 'total_count', 'time_taken_seconds', 'created_at']
