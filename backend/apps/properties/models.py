from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone

builtin_property = property


class Property(models.Model):
    """Property listing representing an apartment, flat, room, or house."""

    class PropertyType(models.TextChoices):
        APARTMENT = 'APARTMENT', 'Apartment'
        STUDIO = 'STUDIO', 'Studio'
        FLAT = 'FLAT', 'Flat'
        ROOM = 'ROOM', 'Private Room'
        HOUSE = 'HOUSE', 'House'
        PENTHOUSE = 'PENTHOUSE', 'Penthouse'

    class Furnishing(models.TextChoices):
        FURNISHED = 'FURNISHED', 'Furnished'
        SEMI_FURNISHED = 'SEMI_FURNISHED', 'Semi-Furnished'
        UNFURNISHED = 'UNFURNISHED', 'Unfurnished'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PENDING_VERIFICATION = 'PENDING_VERIFICATION', 'Pending Verification'
        ACTIVE = 'ACTIVE', 'Active'
        RENTED = 'RENTED', 'Rented'
        SUSPENDED = 'SUSPENDED', 'Suspended'
        ARCHIVED = 'ARCHIVED', 'Archived'

    class GenderPreference(models.TextChoices):
        ANY = 'ANY', 'Any Gender'
        FEMALE_ONLY = 'FEMALE_ONLY', 'Female Only'
        MALE_ONLY = 'MALE_ONLY', 'Male Only'

    landlord = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='properties'
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    description = models.TextField()
    property_type = models.CharField(
        max_length=30,
        choices=PropertyType.choices,
        default=PropertyType.APARTMENT
    )

    # Location details
    address = models.CharField(max_length=255)
    area = models.CharField(max_length=100)
    city = models.CharField(max_length=100, default='Kathmandu')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, default=27.717242)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, default=85.323960)

    # Rent & Financials
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    utilities_included = models.JSONField(default=list, blank=True)
    additional_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    minimum_stay_months = models.PositiveSmallIntegerField(default=6)
    available_from = models.DateField(default=timezone.localdate)

    # Physical Specifications
    bedrooms = models.PositiveSmallIntegerField(default=1)
    bathrooms = models.PositiveSmallIntegerField(default=1)
    floor = models.PositiveSmallIntegerField(default=1)
    area_sqft = models.PositiveIntegerField(default=600)
    furnishing = models.CharField(
        max_length=30,
        choices=Furnishing.choices,
        default=Furnishing.FURNISHED
    )

    # Amenities
    has_wifi = models.BooleanField(default=True)
    has_parking = models.BooleanField(default=True)
    has_24h_water = models.BooleanField(default=True)
    has_electricity_backup = models.BooleanField(default=True)
    has_kitchen = models.BooleanField(default=True)
    has_washing_machine = models.BooleanField(default=False)
    has_balcony = models.BooleanField(default=False)
    has_elevator = models.BooleanField(default=False)
    has_cctv = models.BooleanField(default=False)
    pets_allowed = models.BooleanField(default=False)
    smoking_allowed = models.BooleanField(default=False)
    gender_preference = models.CharField(
        max_length=30,
        choices=GenderPreference.choices,
        default=GenderPreference.ANY
    )

    # Platform Moderation & Metrics
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    is_verified = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)
    total_reviews = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', '-created_at']
        verbose_name_plural = 'Properties'

    def __str__(self):
        return f"{self.title} ({self.area}, Rs. {self.monthly_rent})"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"{self.title}-{self.area}")
            unique_slug = base_slug
            num = 1
            while Property.objects.filter(slug=unique_slug).exclude(pk=self.pk).exists():
                unique_slug = f"{base_slug}-{num}"
                num += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)

    @property
    def primary_image_url(self):
        primary = self.images.filter(is_primary=True).first()
        if primary:
            return primary.display_url
        first_img = self.images.first()
        if first_img:
            return first_img.display_url
        return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80'


class PropertyImage(models.Model):
    """Property gallery images supporting both URL and direct file uploads (JPEG, PNG, SVG, WEBP)."""

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image_url = models.URLField(max_length=600, blank=True)
    image = models.FileField(upload_to='properties/', blank=True, null=True)
    caption = models.CharField(max_length=150, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Image for {self.property.title} ({'Primary' if self.is_primary else 'Gallery'})"

    @builtin_property
    def display_url(self):
        if self.image:
            url = self.image.url
            if url.startswith('/'):
                return f"http://localhost:8000{url}"
            return url
        return self.image_url


class PropertyFavorite(models.Model):
    """Saved properties for authenticated users."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorites'
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='favorited_by'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'property')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} saved {self.property.title}"
