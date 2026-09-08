from rest_framework import serializers
from apps.agreements.models import RentalAgreement
from apps.users.serializers import UserSerializer
from apps.properties.serializers import PropertyListSerializer
from apps.agreements.services.generator import generate_standard_nepali_clauses


class RentalAgreementSerializer(serializers.ModelSerializer):
    landlord = UserSerializer(read_only=True)
    tenant = UserSerializer(read_only=True)
    property_details = PropertyListSerializer(source='property', read_only=True)

    class Meta:
        model = RentalAgreement
        fields = [
            'id',
            'property',
            'property_details',
            'landlord',
            'tenant',
            'title',
            'monthly_rent',
            'security_deposit',
            'start_date',
            'end_date',
            'terms_clauses',
            'additional_rules',
            'status',
            'landlord_signed',
            'landlord_signature_data',
            'landlord_signed_at',
            'tenant_signed',
            'tenant_signature_data',
            'tenant_signed_at',
            'executed_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'landlord',
            'status',
            'landlord_signed',
            'landlord_signature_data',
            'landlord_signed_at',
            'tenant_signed',
            'tenant_signature_data',
            'tenant_signed_at',
            'executed_at',
            'created_at',
            'updated_at',
        ]


class CreateRentalAgreementSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentalAgreement
        fields = [
            'id',
            'property',
            'tenant',
            'title',
            'monthly_rent',
            'security_deposit',
            'start_date',
            'end_date',
            'additional_rules',
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        user = self.context['request'].user
        prop = validated_data['property']
        monthly_rent = validated_data['monthly_rent']
        deposit = validated_data['security_deposit']

        # Auto generate standard Nepali clauses
        clauses = generate_standard_nepali_clauses(
            property_title=prop.title,
            monthly_rent=float(monthly_rent),
            deposit=float(deposit)
        )

        return RentalAgreement.objects.create(
            landlord=user,
            terms_clauses=clauses,
            **validated_data
        )


class SignAgreementSerializer(serializers.Serializer):
    signature_data = serializers.CharField(required=True, help_text="Signature text or base64 SVG/PNG")
