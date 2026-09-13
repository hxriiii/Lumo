from rest_framework import serializers
from .models import AdaptiveDecision

class AdaptiveDecisionSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    subject_name = serializers.CharField(source='topic.subject.name', read_only=True)

    class Meta:
        model = AdaptiveDecision
        fields = ['id', 'test_result', 'student', 'topic', 'topic_name', 'subject_name', 'decision', 'next_difficulty', 'reason', 'weak_areas', 'recommended_action', 'confidence', 'created_at']
