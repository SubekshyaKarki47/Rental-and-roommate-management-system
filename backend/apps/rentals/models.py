from django.db import models
from django.conf import settings
from apps.properties.models import Property


class Lease(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active Tenancy'
        TERMINATED = 'TERMINATED', 'Terminated'
        EXPIRED = 'EXPIRED', 'Expired'
        PENDING = 'PENDING', 'Pending Commencement'

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='leases'
    )
    landlord = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='leases_as_landlord'
    )
    tenant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='leases_as_tenant'
    )
    room_number = models.CharField(max_length=50, blank=True, help_text="e.g. Room 201 or Entire Flat")
    monthly_rent = models.DecimalField(max_digits=12, decimal_places=2)
    security_deposit = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    start_date = models.DateField()
    end_date = models.DateField()
    rent_due_day = models.PositiveSmallIntegerField(default=1, help_text="Day of month when rent is due (1-31)")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    terms = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Lease: {self.property.title} ({self.tenant.email}) - NPR {self.monthly_rent}/mo"


class RentPayment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PAID = 'PAID', 'Paid'
        OVERDUE = 'OVERDUE', 'Overdue'
        FAILED = 'FAILED', 'Failed'

    class PaymentMethod(models.TextChoices):
        ESEWA = 'ESEWA', 'eSewa'
        KHALTI = 'KHALTI', 'Khalti'
        BANK_TRANSFER = 'BANK_TRANSFER', 'ConnectIPS / Bank Transfer'
        CASH = 'CASH', 'Cash'
        SIMULATED = 'SIMULATED', 'Simulated Digital Payment'

    lease = models.ForeignKey(
        Lease,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    month_for = models.CharField(max_length=50, help_text="e.g. September 2026 / Ashwin 2083")
    due_date = models.DateField()
    paid_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_method = models.CharField(
        max_length=30,
        choices=PaymentMethod.choices,
        default=PaymentMethod.SIMULATED
    )
    transaction_reference = models.CharField(max_length=100, blank=True)
    receipt_number = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-due_date']

    def __str__(self):
        return f"Payment NPR {self.amount} for {self.month_for} ({self.status}) - Lease #{self.lease_id}"
