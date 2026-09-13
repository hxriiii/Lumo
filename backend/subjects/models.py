from django.db import models

class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='book')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Topic(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']
        unique_together = ('subject', 'name')

    def __str__(self):
        return f"{self.subject.name} - {self.name}"

class DocumentNote(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/', null=True, blank=True)
    raw_text = models.TextField(blank=True)
    file_type = models.CharField(max_length=10, default='pdf')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.topic.name}] {self.title}"

class DocumentChunk(models.Model):
    document = models.ForeignKey(DocumentNote, on_delete=models.CASCADE, related_name='chunks')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='chunks')
    chunk_index = models.IntegerField(default=0)
    content = models.TextField()
    word_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['document', 'chunk_index']

    def __str__(self):
        return f"Chunk #{self.chunk_index} of {self.document.title}"
