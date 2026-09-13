from django.db import models
from django.contrib.auth.models import User
from subjects.models import Topic

class ChatMessage(models.Model):
    SENDER_CHOICES = (
        ('student', 'Student'),
        ('assistant', 'Assistant'),
    )
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_messages')
    sender = models.CharField(max_length=20, choices=SENDER_CHOICES)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.sender}] {self.student.username}: {self.text[:30]}"
