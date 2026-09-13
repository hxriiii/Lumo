from rest_framework import serializers
from .models import Subject, Topic

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'subject', 'name', 'description', 'order']

class SubjectSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)
    topic_count = serializers.IntegerField(source='topics.count', read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'name', 'description', 'icon', 'topics', 'topic_count']
