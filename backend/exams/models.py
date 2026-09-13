from django.db import models
from django.contrib.auth.models import User
from subjects.models import Topic

DIFFICULTY_CHOICES = (
    ('easy', 'Easy'),
    ('medium', 'Medium'),
    ('hard', 'Hard'),
)

class Question(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='questions')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='easy')
    text = models.TextField()
    options = models.JSONField(help_text='List of 4 string options')
    correct_answer = models.CharField(max_length=255)
    explanation = models.TextField()
    concept_tag = models.CharField(max_length=100, blank=True, default='')

    class Meta:
        indexes = [
            models.Index(fields=['topic', 'difficulty']),
        ]

    def __str__(self):
        return f"[{self.topic.name} | {self.difficulty}] {self.text[:50]}"

class Test(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tests')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='tests')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='easy')
    total_questions = models.IntegerField(default=10)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Test #{self.id} - {self.student.username} - {self.topic.name} ({self.difficulty})"

class TestQuestion(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='test_questions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['order']

class Answer(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    class Meta:
        unique_together = ('test', 'question')
