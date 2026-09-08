from django.db import models
from django.conf import settings


class Notification(models.Model):
    class Category(models.TextChoices):
        APPLICATION = 'APPLICATION', 'Rental Application'
        MESSAGE = 'MESSAGE', 'New Message'
        RENT = 'RENT', 'Rent & Ledger'
        EXPENSE = 'EXPENSE', 'Shared Expense'
        MAINTENANCE = 'MAINTENANCE', 'Maintenance Ticket'
        AGREEMENT = 'AGREEMENT', 'Lease Agreement'
        SYSTEM = 'SYSTEM', 'System Alert'

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.SYSTEM
    )
    action_url = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
        ]

    def __str__(self):
        return f"Notification for {self.recipient.email}: {self.title}"
