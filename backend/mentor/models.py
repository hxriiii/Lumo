from django.db import models
from django.contrib.auth.models import User
from subjects.models import Subject, Module, Topic

STATUS_CHOICES = (
    ('pending', 'Pending Review'),
    ('assigned', 'Assigned'),
    ('in_review', 'In Review'),
    ('resolved', 'Resolved'),
)

class SubjectMentor(models.Model):
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subject_mentorships')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='mentors')
    is_active = models.BooleanField(default=True)
    bio = models.TextField(blank=True, default='')
    max_students = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('mentor', 'subject')

    def __str__(self):
        return f"{self.mentor.username} - Mentor for {self.subject.name}"

class MentorRequest(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentor_requests')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='mentor_requests', null=True, blank=True)
    assigned_mentor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_mentorships')
    module = models.ForeignKey(Module, on_delete=models.SET_NULL, null=True, blank=True, related_name='mentor_requests')
    topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True, blank=True, related_name='mentor_requests')
    concept_tag = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reason = models.TextField()
    attempts_summary = models.TextField()
    mentor_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['subject', 'status']),
            models.Index(fields=['student', 'subject']),
        ]

    def save(self, *args, **kwargs):
        if not self.subject_id and self.topic:
            self.subject = self.topic.effective_subject if hasattr(self.topic, 'effective_subject') else getattr(self.topic, 'subject', None)
        if not self.module_id and self.topic and hasattr(self.topic, 'module') and self.topic.module:
            self.module = self.topic.module
        super().save(*args, **kwargs)

    def __str__(self):
        sub_name = self.subject.name if self.subject else (self.topic.name if self.topic else "General")
        return f"MentorRequest #{self.id} for {self.student.username} on {sub_name}"

