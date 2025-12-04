from django.db import models

# Create your models here.

class Note(models.Model):
    NOTE_TYPE_CHOICES = (
        ('note', 'Nota'),
        ('reminder', 'recordatorio'),
    )

    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    note_type = models.CharField(
        max_length=20, 
        choices = NOTE_TYPE_CHOICES,
        default='note'
    )

    reminder_datetime = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha/hora del recordatorio (opcional)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.note_type})"
    