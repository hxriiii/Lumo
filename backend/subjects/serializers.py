from rest_framework import serializers
from .models import Subject, Topic, DocumentNote, DocumentChunk

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

class DocumentChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentChunk
        fields = ['id', 'chunk_index', 'content', 'word_count', 'created_at']

class DocumentNoteSerializer(serializers.ModelSerializer):
    chunk_count = serializers.IntegerField(source='chunks.count', read_only=True)
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    subject_name = serializers.CharField(source='topic.subject.name', read_only=True)
    chunks = DocumentChunkSerializer(many=True, read_only=True)

    class Meta:
        model = DocumentNote
        fields = ['id', 'topic', 'topic_name', 'subject_name', 'title', 'file', 'raw_text', 'file_type', 'chunk_count', 'chunks', 'uploaded_at']
