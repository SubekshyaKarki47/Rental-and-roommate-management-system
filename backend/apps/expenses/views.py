from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.db.models import Sum, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from decimal import Decimal
from collections import defaultdict

from apps.expenses.models import Expense, ExpenseParticipant, Settlement
from apps.expenses.serializers import (
    ExpenseSerializer,
    ExpenseCreateSerializer,
    SettlementSerializer,
    CreateSettlementSerializer,
)
from apps.expenses.services.calculator import simplify_debts
from apps.users.models import User


class ExpenseListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ExpenseCreateSerializer
        return ExpenseSerializer

    def get_queryset(self):
        user = self.request.user
        return Expense.objects.filter(
            Q(paid_by=user) | Q(participants__user=user)
        ).distinct().select_related('paid_by').prefetch_related('participants', 'participants__user')


class ExpenseDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        user = self.request.user
        return Expense.objects.filter(
            Q(paid_by=user) | Q(participants__user=user)
        ).distinct()

    def perform_destroy(self, instance):
        if instance.paid_by != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("Only the expense payer can delete this expense.")
        instance.delete()


class ExpenseDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # 1. Total unsettled amount you owe others
        you_owe = ExpenseParticipant.objects.filter(
            user=user,
            is_settled=False
        ).exclude(expense__paid_by=user).aggregate(Sum('share_amount'))['share_amount__sum'] or Decimal('0.00')

        # 2. Total unsettled amount others owe you
        others_owe_you = ExpenseParticipant.objects.filter(
            expense__paid_by=user,
            is_settled=False
        ).exclude(user=user).aggregate(Sum('share_amount'))['share_amount__sum'] or Decimal('0.00')

        # 3. Net balance
        net_balance = others_owe_you - you_owe

        # 4. Total spent by household across user's relevant expenses
        total_spent = Expense.objects.filter(
            Q(paid_by=user) | Q(participants__user=user)
        ).distinct().aggregate(Sum('total_amount'))['total_amount__sum'] or Decimal('0.00')

        # 5. Build net balances per pair of users for debt simplification
        unsettled_parts = ExpenseParticipant.objects.filter(is_settled=False).select_related('expense', 'expense__paid_by', 'user')
        # Filter to network of current user
        user_rel_expenses = Expense.objects.filter(Q(paid_by=user) | Q(participants__user=user)).values_list('id', flat=True)
        unsettled_parts = unsettled_parts.filter(expense_id__in=user_rel_expenses)

        net_matrix = defaultdict(lambda: Decimal('0.00'))
        for part in unsettled_parts:
            payer_id = part.expense.paid_by_id
            borrower_id = part.user_id
            if payer_id != borrower_id:
                # borrower owes payer
                net_matrix[borrower_id] -= part.share_amount
                net_matrix[payer_id] += part.share_amount

        # Simplified debts
        simplified = simplify_debts(dict(net_matrix))

        # Enrich simplified debts with user names
        user_ids = {tx['from_user_id'] for tx in simplified} | {tx['to_user_id'] for tx in simplified}
        user_lookup = {u.id: u.full_name for u in User.objects.filter(id__in=user_ids)}
        for tx in simplified:
            tx['from_user_name'] = user_lookup.get(tx['from_user_id'], 'User')
            tx['to_user_name'] = user_lookup.get(tx['to_user_id'], 'User')
            tx['is_current_user_payer'] = (tx['from_user_id'] == user.id)
            tx['is_current_user_receiver'] = (tx['to_user_id'] == user.id)

        # Recent settlements
        recent_settlements = Settlement.objects.filter(
            Q(payer=user) | Q(receiver=user)
        ).select_related('payer', 'receiver')[:5]

        return Response({
            'total_spent': float(total_spent),
            'you_owe': float(you_owe),
            'others_owe_you': float(others_owe_you),
            'net_balance': float(net_balance),
            'simplified_settlements': simplified,
            'recent_settlements': SettlementSerializer(recent_settlements, many=True).data,
        })


class SettleUpView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CreateSettlementSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        settlement = serializer.save()
        return Response({
            'detail': f"Settled NPR {settlement.amount} with {settlement.receiver.full_name}.",
            'settlement': SettlementSerializer(settlement).data
        }, status=status.HTTP_201_CREATED)


class ExpenseParticipantSettleView(APIView):
    """Directly mark an expense participant's share as settled."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        participant = get_object_or_404(ExpenseParticipant, pk=pk)
        if request.user != participant.expense.paid_by and request.user != participant.user and not request.user.is_staff:
            raise PermissionDenied("You do not have permission to settle this participant share.")

        participant.is_settled = True
        participant.settled_at = timezone.now()
        participant.save()

        Settlement.objects.create(
            payer=participant.user,
            receiver=participant.expense.paid_by,
            amount=participant.share_amount,
            method='CASH',
            notes=f"Settled split share for '{participant.expense.title}'"
        )

        return Response({
            'detail': f"Marked share for {participant.user.full_name} as settled.",
            'participant_id': participant.id,
            'is_settled': True
        })

