from django.conf import settings
from django.db import models

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")

    photo = models.ImageField(upload_to="profile_photos/", null=True, blank=True)

    def __str__(self):
        return f"Profile({self.user_id})"