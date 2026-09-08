from django.db import models
from django.conf import settings
from apps.properties.models import Property


class Report(models.Model):
    class Reason(models.TextChoices):
        SCAM_FRAUD = 'SCAM_FRAUD', 'Scam / Fraudulent Listing'
        INACCURATE_LISTING = 'INACCURATE_LISTING', 'Inaccurate Photos or Information'
        HARASSMENT = 'HARASSMENT', 'Harassment or Inappropriate Behavior'
        OFFENSIVE_CONTENT = 'OFFENSIVE_CONTENT', 'Offensive / Discrimination'
        SAFETY_HAZARD = 'SAFETY_HAZARD', 'Safety or Structural Hazard'
        OTHER = 'OTHER', 'Other'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Review'
        INVESTIGATING = 'INVESTIGATING', 'Under Investigation'
        RESOLVED = 'RESOLVED', 'Resolved / Action Taken'
        DISMISSED = 'DISMISSED', 'Dismissed / No Violation'

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports_submitted'
    )
    reported_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports_against'
    )
    reported_property = models.ForeignKey(
        Property,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports'
    )
    reason = models.CharField(
        max_length=40,
        choices=Reason.choices,
        default=Reason.SCAM_FRAUD
    )
    details = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    admin_notes = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report #{self.id} ({self.reason}) - Status: {self.status}"
