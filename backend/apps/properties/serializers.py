from rest_framework import serializers
from .models import Property, PropertyImage, PropertyFavorite
from apps.users.models import User


class PropertyImageSerializer(serializers.ModelSerializer):
    display_url = serializers.ReadOnlyField()

    class Meta:
        model = PropertyImage
        fields = ['id', 'image_url', 'image', 'display_url', 'caption', 'is_primary', 'order']


class PropertyLandlordSerializer(serializers.ModelSerializer):
    business_name = serializers.SerializerMethodField()
    verification_status = serializers.SerializerMethodField()
    response_time_minutes = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'email', 'avatar',
            'business_name', 'verification_status', 'response_time_minutes',
            'rating', 'total_reviews'
        ]

    def get_business_name(self, obj):
        profile = getattr(obj, 'landlord_profile', None)
        return profile.business_name if profile else ''

    def get_verification_status(self, obj):
        profile = getattr(obj, 'landlord_profile', None)
        return profile.verification_status if profile else 'PENDING'

    def get_response_time_minutes(self, obj):
        profile = getattr(obj, 'landlord_profile', None)
        return profile.response_time_minutes if profile else 60

    def get_rating(self, obj):
        profile = getattr(obj, 'landlord_profile', None)
        return float(profile.rating) if profile else 5.0

    def get_total_reviews(self, obj):
        profile = getattr(obj, 'landlord_profile', None)
        return profile.total_reviews if profile else 0


class PropertyListSerializer(serializers.ModelSerializer):
    primary_image = serializers.ReadOnlyField(source='primary_image_url')
    images = PropertyImageSerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()
    current_tenant = serializers.SerializerMethodField()
    lease_expiry = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'slug', 'property_type', 'address', 'area', 'city',
            'latitude', 'longitude', 'monthly_rent', 'security_deposit',
            'bedrooms', 'bathrooms', 'floor', 'area_sqft', 'furnishing',
            'has_wifi', 'has_parking', 'has_24h_water', 'has_electricity_backup',
            'has_kitchen', 'has_washing_machine', 'has_balcony', 'has_elevator',
            'pets_allowed', 'smoking_allowed', 'gender_preference',
            'status', 'is_verified', 'is_featured', 'rating', 'total_reviews',
            'primary_image', 'images', 'is_favorited', 'current_tenant', 'lease_expiry', 'created_at'
        ]

    def get_is_favorited(self, obj):
        user = self.context.get('request', None) and self.context['request'].user
        if user and user.is_authenticated:
            return PropertyFavorite.objects.filter(user=user, property=obj).exists()
        return False

    def get_current_tenant(self, obj):
        lease = getattr(obj, 'leases', None) and obj.leases.filter(status='ACTIVE').select_related('tenant').first()
        if lease and lease.tenant:
            return lease.tenant.get_full_name() or lease.tenant.email
        approved_app = getattr(obj, 'applications', None) and obj.applications.filter(status='APPROVED').select_related('tenant').first()
        if approved_app and approved_app.tenant:
            return approved_app.tenant.get_full_name() or approved_app.tenant.email
        return None

    def get_lease_expiry(self, obj):
        lease = getattr(obj, 'leases', None) and obj.leases.filter(status='ACTIVE').first()
        if lease and lease.end_date:
            return lease.end_date.strftime('%b %Y')
        approved_app = getattr(obj, 'applications', None) and obj.applications.filter(status='APPROVED').first()
        if approved_app and approved_app.move_in_date:
            return f"From {approved_app.move_in_date.strftime('%b %d, %Y')}"
        return None


class PropertyDetailSerializer(serializers.ModelSerializer):
    landlord = PropertyLandlordSerializer(read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()
    primary_image = serializers.ReadOnlyField(source='primary_image_url')

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'slug', 'description', 'property_type',
            'address', 'area', 'city', 'latitude', 'longitude',
            'monthly_rent', 'security_deposit', 'utilities_included', 'additional_fees',
            'minimum_stay_months', 'available_from',
            'bedrooms', 'bathrooms', 'floor', 'area_sqft', 'furnishing',
            'has_wifi', 'has_parking', 'has_24h_water', 'has_electricity_backup',
            'has_kitchen', 'has_washing_machine', 'has_balcony', 'has_elevator',
            'has_cctv', 'pets_allowed', 'smoking_allowed', 'gender_preference',
            'status', 'is_verified', 'is_featured', 'views_count', 'rating', 'total_reviews',
            'primary_image', 'images', 'landlord', 'is_favorited', 'created_at', 'updated_at'
        ]

    def get_is_favorited(self, obj):
        user = self.context.get('request', None) and self.context['request'].user
        if user and user.is_authenticated:
            return PropertyFavorite.objects.filter(user=user, property=obj).exists()
        return False


class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    image_urls = serializers.ListField(
        child=serializers.CharField(), required=False, write_only=True
    )

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'description', 'property_type',
            'address', 'area', 'city', 'latitude', 'longitude',
            'monthly_rent', 'security_deposit', 'utilities_included', 'additional_fees',
            'minimum_stay_months', 'available_from',
            'bedrooms', 'bathrooms', 'floor', 'area_sqft', 'furnishing',
            'has_wifi', 'has_parking', 'has_24h_water', 'has_electricity_backup',
            'has_kitchen', 'has_washing_machine', 'has_balcony', 'has_elevator',
            'has_cctv', 'pets_allowed', 'smoking_allowed', 'gender_preference',
            'status', 'image_urls'
        ]

    def create(self, validated_data):
        import base64
        import uuid
        from django.core.files.base import ContentFile

        image_urls = validated_data.pop('image_urls', [])
        request = self.context.get('request')
        user = request.user if request else None
        property_obj = Property.objects.create(landlord=user, **validated_data)

        # 1. Handle direct file uploads (JPEG, PNG, SVG, WEBP) from request.FILES
        uploaded_files = []
        if request and request.FILES:
            uploaded_files = (
                request.FILES.getlist('images')
                or request.FILES.getlist('images[]')
                or request.FILES.getlist('uploaded_images')
                or request.FILES.getlist('photos')
            )
            for i, img_file in enumerate(uploaded_files):
                PropertyImage.objects.create(
                    property=property_obj,
                    image=img_file,
                    is_primary=(i == 0),
                    order=i
                )

        # 2. Handle Data URLs (base64) or standard URLs
        existing_count = property_obj.images.count()
        for i, item_str in enumerate(image_urls):
            is_primary = (existing_count == 0 and i == 0)
            if item_str.startswith('data:'):
                try:
                    format_header, imgstr = item_str.split(';base64,')
                    ext = 'jpg'
                    if 'svg' in format_header:
                        ext = 'svg'
                    elif 'png' in format_header:
                        ext = 'png'
                    elif 'jpeg' in format_header or 'jpg' in format_header:
                        ext = 'jpg'
                    elif 'webp' in format_header:
                        ext = 'webp'

                    filename = f"prop_{property_obj.id}_{uuid.uuid4().hex[:8]}.{ext}"
                    content_file = ContentFile(base64.b64decode(imgstr), name=filename)
                    PropertyImage.objects.create(
                        property=property_obj,
                        image=content_file,
                        is_primary=is_primary,
                        order=existing_count + i
                    )
                    continue
                except Exception:
                    pass

            PropertyImage.objects.create(
                property=property_obj,
                image_url=item_str,
                is_primary=is_primary,
                order=existing_count + i
            )

        return property_obj


class PropertyFavoriteSerializer(serializers.ModelSerializer):
    property = PropertyListSerializer(read_only=True)

    class Meta:
        model = PropertyFavorite
        fields = ['id', 'property', 'notes', 'created_at']
