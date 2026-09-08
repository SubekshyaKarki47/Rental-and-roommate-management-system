from rest_framework import serializers
from django.utils import timezone
import datetime
from apps.rentals.models import Lease, RentPayment
from apps.users.serializers import UserSerializer
from apps.properties.serializers import PropertyListSerializer


class RentPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentPayment
        fields = [
            'id',
            'lease',
            'amount',
            'month_for',
            'due_date',
            'paid_date',
            'status',
            'payment_method',
            'transaction_reference',
            'receipt_number',
            'notes',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class LeaseSerializer(serializers.ModelSerializer):
    property_details = PropertyListSerializer(source='property', read_only=True)
    landlord = UserSerializer(read_only=True)
    tenant = UserSerializer(read_only=True)
    payments = RentPaymentSerializer(many=True, read_only=True)
    next_payment = serializers.SerializerMethodField()

    class Meta:
        model = Lease
        fields = [
            'id',
            'property',
            'property_details',
            'landlord',
            'tenant',
            'room_number',
            'monthly_rent',
            'security_deposit',
            'start_date',
            'end_date',
            'rent_due_day',
            'status',
            'terms',
            'payments',
            'next_payment',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'landlord', 'created_at', 'updated_at']

    def get_next_payment(self, obj):
        pending = obj.payments.filter(status=RentPayment.Status.PENDING).order_by('due_date').first()
        if pending:
            today = timezone.now().date()
            days_left = (pending.due_date - today).days
            return {
                'id': pending.id,
                'amount': pending.amount,
                'month_for': pending.month_for,
                'due_date': pending.due_date,
                'days_left': days_left,
                'is_overdue': days_left < 0,
            }
        return None


class CreateLeaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lease
        fields = [
            'property',
            'tenant',
            'room_number',
            'monthly_rent',
            'security_deposit',
            'start_date',
            'end_date',
            'rent_due_day',
            'terms',
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        lease = Lease.objects.create(landlord=user, **validated_data)
        
        # Generate initial upcoming rent payment
        due_date = lease.start_date
        month_name = due_date.strftime("%B %Y")
        RentPayment.objects.create(
            lease=lease,
            amount=lease.monthly_rent,
            month_for=month_name,
            due_date=due_date,
            status=RentPayment.Status.PENDING
        )
        return lease


class SimulateRentPaymentSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(
        choices=RentPayment.PaymentMethod.choices,
        default=RentPayment.PaymentMethod.SIMULATED
    )
    notes = serializers.CharField(required=False, allow_blank=True, default='')
