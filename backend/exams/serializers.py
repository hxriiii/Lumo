from rest_framework import serializers
from .models import Question, Test, TestQuestion, Answer

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'options', 'difficulty', 'concept_tag']

class QuestionResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'options', 'correct_answer', 'explanation', 'difficulty', 'concept_tag']

class AnswerSerializer(serializers.ModelSerializer):
    question = QuestionResultSerializer(read_only=True)

    class Meta:
        model = Answer
        fields = ['id', 'question', 'selected_option', 'is_correct']

class TestSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    subject_name = serializers.CharField(source='topic.subject.name', read_only=True)
    questions = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = ['id', 'topic', 'topic_name', 'subject_name', 'difficulty', 'total_questions', 'completed', 'created_at', 'questions']

    def get_questions(self, obj):
        test_questions = obj.test_questions.all().select_related('question')
        return QuestionSerializer([tq.question for tq in test_questions], many=True).data
