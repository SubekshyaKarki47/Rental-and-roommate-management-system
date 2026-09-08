from django.db import models
from django.conf import settings
from apps.properties.models import Property


class RentalApplication(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Review'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        WITHDRAWN = 'WITHDRAWN', 'Withdrawn'

    class EmploymentStatus(models.TextChoices):
        EMPLOYED = 'EMPLOYED', 'Employed (Full-Time)'
        PART_TIME = 'PART_TIME', 'Employed (Part-Time)'
        SELF_EMPLOYED = 'SELF_EMPLOYED', 'Self-Employed / Freelancer'
        STUDENT = 'STUDENT', 'Student'
        UNEMPLOYED = 'UNEMPLOYED', 'Unemployed'
        OTHER = 'OTHER', 'Other'

    class CreditScoreRange(models.TextChoices):
        EXCELLENT_750_PLUS = 'EXCELLENT', 'Excellent (750+)'
        GOOD_700_749 = 'GOOD', 'Good (700-749)'
        FAIR_650_699 = 'FAIR', 'Fair (650-699)'
        POOR_BELOW_650 = 'POOR', 'Below 650'
        NOT_APPLICABLE = 'NA', 'Not Applicable / Student'

    tenant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rental_applications'
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    move_in_date = models.DateField()
    monthly_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00
    )
    employment_status = models.CharField(
        max_length=30,
        choices=EmploymentStatus.choices,
        default=EmploymentStatus.EMPLOYED
    )
    credit_score_range = models.CharField(
        max_length=20,
        choices=CreditScoreRange.choices,
        default=CreditScoreRange.NOT_APPLICABLE
    )
    message = models.TextField(blank=True, help_text="Cover message to landlord")

    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=25, blank=True)
    emergency_contact_relation = models.CharField(max_length=50, blank=True)

    # Guarantor details
    guarantor_name = models.CharField(max_length=100, blank=True)
    guarantor_contact = models.CharField(max_length=50, blank=True)

    # Landlord review
    landlord_notes = models.TextField(blank=True, help_text="Private notes for landlord")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['property', 'status']),
        ]

    def __str__(self):
        return f"Application #{self.id} by {self.tenant.email} for {self.property.title} ({self.status})"
