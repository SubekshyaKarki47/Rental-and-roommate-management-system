from django.db import models
from django.conf import settings


class RoommateMatch(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Connected'
        DECLINED = 'DECLINED', 'Declined'
        BLOCKED = 'BLOCKED', 'Blocked'

    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_roommate_requests'
    )
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_roommate_requests'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    compatibility_score = models.PositiveSmallIntegerField(default=0)
    match_notes = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('requester', 'target_user')
        indexes = [
            models.Index(fields=['requester', 'status']),
            models.Index(fields=['target_user', 'status']),
        ]

    def __str__(self):
        return f"Match: {self.requester.email} -> {self.target_user.email} ({self.status}, {self.compatibility_score}%)"
