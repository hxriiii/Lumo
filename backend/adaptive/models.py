from django.db import models
from django.contrib.auth.models import User
from subjects.models import Topic
from progress.models import TestResult

DECISION_CHOICES = (
    ('reinforce', 'Reinforce'),
    ('advance', 'Advance'),
    ('mentor', 'Mentor'),
)

class AdaptiveDecision(models.Model):
    test_result = models.ForeignKey(TestResult, on_delete=models.CASCADE, related_name='adaptive_decisions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='adaptive_decisions')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='adaptive_decisions')
    decision = models.CharField(max_length=20, choices=DECISION_CHOICES)
    next_difficulty = models.CharField(max_length=10)
    reason = models.TextField()
    weak_areas = models.JSONField(default=list)
    recommended_action = models.TextField()
    confidence = models.FloatField(default=0.9)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Decision for {self.student.username} on {self.topic.name}: {self.decision.upper()}"
