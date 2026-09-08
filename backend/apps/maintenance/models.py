from django.db import models
from django.conf import settings
from apps.properties.models import Property


class MaintenanceRequest(models.Model):
    class Category(models.TextChoices):
        PLUMBING = 'PLUMBING', 'Plumbing & Water'
        ELECTRICAL = 'ELECTRICAL', 'Electrical & Wiring'
        APPLIANCE = 'APPLIANCE', 'Appliances (Fridge, Geyser)'
        STRUCTURAL = 'STRUCTURAL', 'Walls, Doors & Locks'
        INTERNET = 'INTERNET', 'WiFi / Router'
        OTHER = 'OTHER', 'Other Maintenance'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low (Non-urgent)'
        MEDIUM = 'MEDIUM', 'Medium (Normal)'
        HIGH = 'HIGH', 'High (Urgent)'
        EMERGENCY = 'EMERGENCY', 'Emergency (Immediate hazard)'

    class Status(models.TextChoices):
        SUBMITTED = 'SUBMITTED', 'Submitted'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        RESOLVED = 'RESOLVED', 'Resolved'
        CANCELLED = 'CANCELLED', 'Cancelled'

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='maintenance_requests'
    )
    tenant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='maintenance_tickets'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.PLUMBING
    )
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUBMITTED
    )
    photo = models.ImageField(
        upload_to='maintenance/photos/',
        null=True,
        blank=True
    )
    resolution_notes = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.priority}] {self.title} - {self.property.title} ({self.status})"


class MaintenanceComment(models.Model):
    request = models.ForeignKey(
        MaintenanceRequest,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user.email} on #{self.request_id}"
