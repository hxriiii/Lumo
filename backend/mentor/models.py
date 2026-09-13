from django.db import models
from django.contrib.auth.models import User
from subjects.models import Topic

STATUS_CHOICES = (
    ('pending', 'Pending Review'),
    ('in_review', 'In Review'),
    ('resolved', 'Resolved'),
)

class MentorRequest(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentor_requests')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='mentor_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reason = models.TextField()
    attempts_summary = models.TextField()
    mentor_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"MentorRequest #{self.id} for {self.student.username} on {self.topic.name}"
