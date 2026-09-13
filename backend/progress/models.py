from django.db import models
from django.contrib.auth.models import User
from subjects.models import Topic
from exams.models import Test, Question

class TopicProgress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='topic_progresses')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='progresses')
    current_difficulty = models.CharField(max_length=10, default='easy')
    mastery_score = models.FloatField(default=0.0)
    average_score = models.FloatField(default=0.0)
    best_score = models.FloatField(default=0.0)
    last_score = models.FloatField(default=0.0)
    attempt_count = models.IntegerField(default=0)
    reinforcement_count = models.IntegerField(default=0)
    trend = models.CharField(max_length=20, default='stable')
    last_decision = models.CharField(max_length=20, default='reinforce')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'topic')

    def __str__(self):
        return f"{self.student.username} - {self.topic.name}: {self.mastery_score}% ({self.current_difficulty})"

class TestResult(models.Model):
    test = models.OneToOneField(Test, on_delete=models.CASCADE, related_name='result')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='test_results')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='test_results')
    score = models.FloatField(default=0.0)
    correct_count = models.IntegerField(default=0)
    total_count = models.IntegerField(default=0)
    time_taken_seconds = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Result Test #{self.test.id}: {self.score}%"

class QuestionResult(models.Model):
    test_result = models.ForeignKey(TestResult, on_delete=models.CASCADE, related_name='question_results')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

class SubjectProgress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subject_progresses')
    subject = models.ForeignKey('subjects.Subject', on_delete=models.CASCADE, related_name='progresses')
    overall_mastery = models.FloatField(default=0.0)
    topics_completed = models.IntegerField(default=0)
    total_topics = models.IntegerField(default=0)
    total_tests_taken = models.IntegerField(default=0)
    status = models.CharField(max_length=20, default='in_progress')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Subject Progresses'
        unique_together = ('student', 'subject')

    def __str__(self):
        return f"{self.student.username} - {self.subject.name}: {self.overall_mastery}%"

class ConceptMastery(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='concept_masteries')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='concept_masteries')
    concept_tag = models.CharField(max_length=100)
    correct_count = models.IntegerField(default=0)
    total_count = models.IntegerField(default=0)
    mastery_score = models.FloatField(default=0.0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Concept Masteries'
        unique_together = ('student', 'topic', 'concept_tag')

    def __str__(self):
        return f"{self.student.username} - {self.concept_tag}: {self.mastery_score}%"

