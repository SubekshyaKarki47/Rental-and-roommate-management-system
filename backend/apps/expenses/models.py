from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.properties.models import Property


class Expense(models.Model):
    class SplitType(models.TextChoices):
        EQUAL = 'EQUAL', 'Split Equally'
        EXACT = 'EXACT', 'Exact Amounts'
        PERCENTAGE = 'PERCENTAGE', 'By Percentage'

    class Category(models.TextChoices):
        GROCERIES = 'GROCERIES', 'Groceries & Food'
        UTILITIES = 'UTILITIES', 'Water & Electricity'
        INTERNET = 'INTERNET', 'WiFi / Internet'
        HOUSEHOLD = 'HOUSEHOLD', 'Cleaning & Household'
        ENTERTAINMENT = 'ENTERTAINMENT', 'Entertainment & Outings'
        OTHER = 'OTHER', 'Other'

    title = models.CharField(max_length=200)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='expenses_paid'
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='expenses'
    )
    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.GROCERIES
    )
    split_type = models.CharField(
        max_length=20,
        choices=SplitType.choices,
        default=SplitType.EQUAL
    )
    receipt_image = models.ImageField(
        upload_to='expenses/receipts/',
        null=True,
        blank=True
    )
    date = models.DateField(default=timezone.localdate)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.title} (NPR {self.total_amount}) paid by {self.paid_by.email}"


class ExpenseParticipant(models.Model):
    expense = models.ForeignKey(
        Expense,
        on_delete=models.CASCADE,
        related_name='participants'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='expense_obligations'
    )
    share_amount = models.DecimalField(max_digits=12, decimal_places=2)
    is_settled = models.BooleanField(default=False)
    settled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('expense', 'user')

    def __str__(self):
        status = "Settled" if self.is_settled else "Owed"
        return f"{self.user.email}: NPR {self.share_amount} for {self.expense.title} ({status})"


class Settlement(models.Model):
    class Method(models.TextChoices):
        ESEWA = 'ESEWA', 'eSewa'
        KHALTI = 'KHALTI', 'Khalti'
        BANK = 'BANK', 'Bank Transfer'
        CASH = 'CASH', 'Cash'

    payer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='settlements_paid'
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='settlements_received'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(
        max_length=20,
        choices=Method.choices,
        default=Method.ESEWA
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Settlement: {self.payer.email} paid {self.receiver.email} NPR {self.amount}"
