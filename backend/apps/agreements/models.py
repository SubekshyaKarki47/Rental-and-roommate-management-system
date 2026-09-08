from django.db import models
from django.conf import settings
from apps.properties.models import Property


class RentalAgreement(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PENDING_SIGNATURES = 'PENDING_SIGNATURES', 'Awaiting Signatures'
        EXECUTED = 'EXECUTED', 'Fully Executed & Signed'
        TERMINATED = 'TERMINATED', 'Terminated'

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='agreements'
    )
    landlord = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='agreements_as_landlord'
    )
    tenant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='agreements_as_tenant'
    )
    title = models.CharField(max_length=255)
    monthly_rent = models.DecimalField(max_digits=12, decimal_places=2)
    security_deposit = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    start_date = models.DateField()
    end_date = models.DateField()
    terms_clauses = models.JSONField(default=list, blank=True)
    additional_rules = models.TextField(blank=True)
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.PENDING_SIGNATURES
    )

    # Landlord Digital Signature
    landlord_signed = models.BooleanField(default=False)
    landlord_signature_data = models.TextField(blank=True)
    landlord_signed_at = models.DateTimeField(null=True, blank=True)

    # Tenant Digital Signature
    tenant_signed = models.BooleanField(default=False)
    tenant_signature_data = models.TextField(blank=True)
    tenant_signed_at = models.DateTimeField(null=True, blank=True)

    executed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Agreement: {self.title} ({self.status}) - {self.tenant.email}"
