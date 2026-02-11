from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Profile (models.Model):
    user = models.OneToOneField(User,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    avatar = models.ImageField(
        upload_to="avatars/", 
        null=True,
        blank=True
    )

    def __str__(self):
        return self.user.email