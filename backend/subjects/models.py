from django.db import models

class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def topics(self):
        return Topic.objects.filter(module__subject=self)

    def __str__(self):
        return self.name

class Module(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='modules')
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        unique_together = ('subject', 'name')

    def __str__(self):
        return f"{self.subject.name} - {self.name}"

class Topic(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']
        unique_together = ('module', 'name')

    @property
    def subject(self):
        return self.module.subject if self.module else None

    @property
    def effective_subject(self):
        return self.module.subject if self.module else None

    def __str__(self):
        prefix = self.module.name if self.module else "No Module"
        return f"{prefix} - {self.name}"


DOCUMENT_TYPE_CHOICES = (
    ('notes', 'Notes'),
    ('reference', 'Reference'),
    ('syllabus', 'Syllabus'),
    ('cheatsheet', 'Cheat Sheet'),
)

INDEXING_STATUS_CHOICES = (
    ('pending', 'Pending'),
    ('indexing', 'Indexing'),
    ('indexed', 'Indexed'),
    ('failed', 'Failed'),
)

class ModuleDocument(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='learning_materials/pdfs/', blank=True, null=True)
    file_path = models.CharField(max_length=500, blank=True, default='', help_text='Storage path or URI reference')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES, default='notes')
    indexing_status = models.CharField(max_length=20, choices=INDEXING_STATUS_CHOICES, default='pending')
    file_size_bytes = models.BigIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['module', 'id']
        indexes = [
            models.Index(fields=['module', 'indexing_status']),
        ]

    def __str__(self):
        return f"[{self.module.name}] {self.title} ({self.document_type})"

