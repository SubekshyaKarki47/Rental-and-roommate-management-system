from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User, TenantProfile, LandlordProfile


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Enhance JWT token claims with user role, name, and profile status."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['is_verified'] = user.is_verified
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'role': self.user.role,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'phone_number': self.user.phone_number,
            'is_verified': self.user.is_verified,
            'has_completed_onboarding': getattr(
                getattr(self.user, 'tenant_profile', None), 'is_onboarding_completed', False
            ) if self.user.role == User.Role.TENANT else True,
        }
        return data


class TenantProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantProfile
        fields = [
            'id', 'age_range', 'occupation_status', 'university_or_company',
            'preferred_locations', 'min_budget', 'max_budget', 'preferred_move_in_date',
            'bedrooms_preferred', 'furnishing_preference', 'lifestyle_type',
            'pets_allowed', 'smoking_preference', 'cleanliness_level', 'sleep_schedule',
            'bio', 'is_onboarding_completed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LandlordProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandlordProfile
        fields = [
            'id', 'business_name', 'verification_status', 'id_document',
            'response_time_minutes', 'rating', 'total_reviews', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'verification_status', 'rating', 'total_reviews', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    tenant_profile = TenantProfileSerializer(read_only=True)
    landlord_profile = LandlordProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role',
            'phone_number', 'avatar', 'is_verified', 'tenant_profile',
            'landlord_profile', 'created_at'
        ]
        read_only_fields = ['id', 'is_verified', 'created_at']


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(
        choices=[User.Role.TENANT, User.Role.LANDLORD],
        default=User.Role.TENANT
    )

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone_number', 'role']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Explicit security rule: Prohibit user from declaring ADMIN role during registration
        if attrs.get('role') == User.Role.ADMIN:
            raise serializers.ValidationError({"role": "Admin accounts cannot be registered publicly."})

        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        role = validated_data.get('role', User.Role.TENANT)
        user = User.objects.create_user(**validated_data)

        # Automatically initialize profile based on selected role
        if role == User.Role.TENANT:
            TenantProfile.objects.create(user=user)
        elif role == User.Role.LANDLORD:
            LandlordProfile.objects.create(user=user)

        return user


class TenantOnboardingSerializer(serializers.ModelSerializer):
    """Serializer for tenant onboarding flow."""

    class Meta:
        model = TenantProfile
        fields = [
            'age_range', 'occupation_status', 'university_or_company',
            'preferred_locations', 'min_budget', 'max_budget',
            'preferred_move_in_date', 'bedrooms_preferred', 'furnishing_preference',
            'lifestyle_type', 'pets_allowed', 'smoking_preference',
            'cleanliness_level', 'sleep_schedule', 'bio'
        ]

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.is_onboarding_completed = True
        instance.save()
        return instance
