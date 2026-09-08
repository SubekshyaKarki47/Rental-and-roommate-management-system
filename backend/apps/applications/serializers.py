from rest_framework import serializers
from apps.applications.models import RentalApplication
from apps.users.serializers import UserSerializer
from apps.properties.serializers import PropertyListSerializer


class RentalApplicationSerializer(serializers.ModelSerializer):
    tenant = UserSerializer(read_only=True)
    property_details = PropertyListSerializer(source='property', read_only=True)

    class Meta:
        model = RentalApplication
        fields = [
            'id',
            'tenant',
            'property',
            'property_details',
            'status',
            'move_in_date',
            'monthly_income',
            'employment_status',
            'credit_score_range',
            'message',
            'emergency_contact_name',
            'emergency_contact_phone',
            'emergency_contact_relation',
            'guarantor_name',
            'guarantor_contact',
            'landlord_notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'tenant', 'status', 'created_at', 'updated_at']


class RentalApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentalApplication
        fields = [
            'id',
            'property',
            'move_in_date',
            'monthly_income',
            'employment_status',
            'credit_score_range',
            'message',
            'emergency_contact_name',
            'emergency_contact_phone',
            'emergency_contact_relation',
            'guarantor_name',
            'guarantor_contact',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        user = self.context['request'].user
        property_obj = attrs.get('property')
        
        # Landlords can't apply to their own properties
        if property_obj.landlord == user:
            raise serializers.ValidationError("Landlords cannot apply to their own properties.")
            
        # Check if already applied and pending
        existing = RentalApplication.objects.filter(
            tenant=user,
            property=property_obj,
            status=RentalApplication.Status.PENDING
        ).exists()
        if existing:
            raise serializers.ValidationError("You already have a pending application for this property.")

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        return RentalApplication.objects.create(tenant=user, **validated_data)


class RentalApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentalApplication
        fields = ['status', 'landlord_notes']

    def validate_status(self, value):
        if value not in [RentalApplication.Status.APPROVED, RentalApplication.Status.REJECTED]:
            raise serializers.ValidationError("Status can only be updated to APPROVED or REJECTED.")
        return value
