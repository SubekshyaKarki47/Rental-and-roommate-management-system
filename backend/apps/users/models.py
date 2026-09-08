from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular User with the given email and password."""
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom User model with email as primary identity and role-based segregation."""

    class Role(models.TextChoices):
        TENANT = 'TENANT', _('Tenant / Roommate')
        LANDLORD = 'LANDLORD', _('Landlord / Property Owner')
        ADMIN = 'ADMIN', _('Platform Administrator')

    username = None
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.TENANT)
    phone_number = models.CharField(max_length=30, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def full_name(self):
        name = f"{self.first_name} {self.last_name}".strip()
        return name if name else self.email


class TenantProfile(models.Model):
    """Tenant and Roommate seeker profile storing budget, lifestyle, and onboarding preferences."""

    class Lifestyle(models.TextChoices):
        QUIET = 'QUIET', _('Quiet & Studious')
        SOCIAL = 'SOCIAL', _('Social & Outgoing')
        FLEXIBLE = 'FLEXIBLE', _('Flexible & Balanced')

    class FurnishingPreference(models.TextChoices):
        FURNISHED = 'FURNISHED', _('Furnished')
        SEMI_FURNISHED = 'SEMI_FURNISHED', _('Semi-Furnished')
        UNFURNISHED = 'UNFURNISHED', _('Unfurnished')
        ANY = 'ANY', _('Any')

    class SleepSchedule(models.TextChoices):
        EARLY_BIRD = 'EARLY_BIRD', _('Early Bird')
        NIGHT_OWL = 'NIGHT_OWL', _('Night Owl')
        FLEXIBLE = 'FLEXIBLE', _('Flexible')

    class Cleanliness(models.TextChoices):
        VERY_CLEAN = 'VERY_CLEAN', _('Very Clean')
        MODERATE = 'MODERATE', _('Moderately Clean')
        RELAXED = 'RELAXED', _('Relaxed')

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='tenant_profile')
    age_range = models.CharField(max_length=50, blank=True)
    occupation_status = models.CharField(max_length=100, blank=True)
    university_or_company = models.CharField(max_length=150, blank=True)
    preferred_locations = models.JSONField(default=list, blank=True)
    min_budget = models.DecimalField(max_digits=10, decimal_places=2, default=10000)
    max_budget = models.DecimalField(max_digits=10, decimal_places=2, default=30000)
    preferred_move_in_date = models.DateField(blank=True, null=True)
    bedrooms_preferred = models.PositiveSmallIntegerField(default=1)
    furnishing_preference = models.CharField(
        max_length=30,
        choices=FurnishingPreference.choices,
        default=FurnishingPreference.ANY
    )
    lifestyle_type = models.CharField(
        max_length=30,
        choices=Lifestyle.choices,
        default=Lifestyle.FLEXIBLE
    )
    pets_allowed = models.BooleanField(default=False)
    smoking_preference = models.BooleanField(default=False)
    cleanliness_level = models.CharField(
        max_length=30,
        choices=Cleanliness.choices,
        default=Cleanliness.MODERATE
    )
    sleep_schedule = models.CharField(
        max_length=30,
        choices=SleepSchedule.choices,
        default=SleepSchedule.FLEXIBLE
    )
    bio = models.TextField(blank=True)
    is_onboarding_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"TenantProfile: {self.user.email}"


class LandlordProfile(models.Model):
    """Landlord profile storing business name, verification and rating."""

    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending Verification')
        VERIFIED = 'VERIFIED', _('Verified')
        REJECTED = 'REJECTED', _('Rejected')

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='landlord_profile')
    business_name = models.CharField(max_length=150, blank=True)
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )
    id_document = models.FileField(upload_to='landlord_docs/', blank=True, null=True)
    response_time_minutes = models.PositiveIntegerField(default=60)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)
    total_reviews = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"LandlordProfile: {self.user.email} - {self.verification_status}"
