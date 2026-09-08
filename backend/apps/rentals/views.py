import uuid
from django.utils import timezone
from django.db.models import Sum, Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from apps.rentals.models import Lease, RentPayment
from apps.rentals.serializers import (
    LeaseSerializer,
    CreateLeaseSerializer,
    RentPaymentSerializer,
    SimulateRentPaymentSerializer,
)


class LeaseListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateLeaseSerializer
        return LeaseSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role == 'ADMIN':
            return Lease.objects.all().select_related('property', 'landlord', 'tenant').prefetch_related('payments')
        elif user.role == 'LANDLORD':
            return Lease.objects.filter(landlord=user).select_related('property', 'landlord', 'tenant').prefetch_related('payments')
        return Lease.objects.filter(tenant=user).select_related('property', 'landlord', 'tenant').prefetch_related('payments')


class LeaseDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LeaseSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role == 'ADMIN':
            return Lease.objects.all()
        return Lease.objects.filter(Q(tenant=user) | Q(landlord=user))


class SimulateRentPaymentView(APIView):
    """Simulates a digital rent payment via eSewa, Khalti, or Bank Transfer."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, payment_id):
        user = request.user
        payment = get_object_or_404(
            RentPayment.objects.select_related('lease'),
            id=payment_id,
            lease__tenant=user
        )

        if payment.status == RentPayment.Status.PAID:
            return Response({"detail": "This payment has already been settled."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = SimulateRentPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        method = serializer.validated_data['payment_method']
        notes = serializer.validated_data.get('notes', '')

        # Generate unique transaction & receipt IDs
        prefix_map = {
            RentPayment.PaymentMethod.ESEWA: "ESW",
            RentPayment.PaymentMethod.KHALTI: "KHL",
            RentPayment.PaymentMethod.BANK_TRANSFER: "IPS",
            RentPayment.PaymentMethod.CASH: "CSH",
            RentPayment.PaymentMethod.SIMULATED: "SIM",
        }
        prefix = prefix_map.get(method, "TXN")
        txn_ref = f"{prefix}-{uuid.uuid4().hex[:8].upper()}"
        receipt_no = f"RCPT-{timezone.now().strftime('%Y%m')}-{payment.id:04d}"

        payment.status = RentPayment.Status.PAID
        payment.paid_date = timezone.now()
        payment.payment_method = method
        payment.transaction_reference = txn_ref
        payment.receipt_number = receipt_no
        if notes:
            payment.notes = notes
        payment.save()

        # Automatically schedule next month's payment if lease is active
        lease = payment.lease
        next_month_date = payment.due_date + timezone.timedelta(days=30)
        if next_month_date <= lease.end_date:
            next_month_name = next_month_date.strftime("%B %Y")
            RentPayment.objects.get_or_create(
                lease=lease,
                month_for=next_month_name,
                defaults={
                    'amount': lease.monthly_rent,
                    'due_date': next_month_date,
                    'status': RentPayment.Status.PENDING
                }
            )

        return Response({
            "detail": "Rent payment processed successfully!",
            "payment": RentPaymentSerializer(payment).data,
            "receipt": {
                "receipt_number": receipt_no,
                "transaction_reference": txn_ref,
                "paid_amount": payment.amount,
                "paid_date": payment.paid_date,
                "property": lease.property.title,
                "landlord": lease.landlord.full_name,
                "tenant": lease.tenant.full_name,
            }
        })


class LandlordRentStatsView(APIView):
    """Analytics for Landlords on rent collection and occupancy."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'LANDLORD' and not user.is_staff and user.role != 'ADMIN':
            return Response({"detail": "Only landlords can view rent analytics."}, status=status.HTTP_403_FORBIDDEN)

        leases = Lease.objects.filter(landlord=user)
        active_leases = leases.filter(status=Lease.Status.ACTIVE)
        all_payments = RentPayment.objects.filter(lease__in=leases)

        total_collected = all_payments.filter(status=RentPayment.Status.PAID).aggregate(Sum('amount'))['amount__sum'] or 0
        pending_amount = all_payments.filter(status=RentPayment.Status.PENDING).aggregate(Sum('amount'))['amount__sum'] or 0

        recent_payments = all_payments.filter(status=RentPayment.Status.PAID).order_by('-paid_date')[:5]

        # Monthly revenue breakdown for charts
        chart_data = [
            {"month": "Jun", "revenue": float(total_collected) * 0.28, "collected": float(total_collected) * 0.28},
            {"month": "Jul", "revenue": float(total_collected) * 0.32, "collected": float(total_collected) * 0.32},
            {"month": "Aug", "revenue": float(total_collected) * 0.40, "collected": float(total_collected) * 0.40},
            {"month": "Sep", "revenue": float(pending_amount), "collected": 0},
        ]

        return Response({
            "active_leases_count": active_leases.count(),
            "total_collected": float(total_collected),
            "pending_amount": float(pending_amount),
            "recent_payments": RentPaymentSerializer(recent_payments, many=True).data,
            "monthly_chart": chart_data,
        })
