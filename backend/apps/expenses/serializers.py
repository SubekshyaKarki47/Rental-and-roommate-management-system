from rest_framework import serializers
from decimal import Decimal
from apps.expenses.models import Expense, ExpenseParticipant, Settlement
from apps.users.serializers import UserSerializer
from apps.expenses.services.calculator import calculate_equal_splits


class ExpenseParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ExpenseParticipant
        fields = ['id', 'user', 'share_amount', 'is_settled', 'settled_at']


class ExpenseSerializer(serializers.ModelSerializer):
    paid_by = UserSerializer(read_only=True)
    participants = ExpenseParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id',
            'title',
            'total_amount',
            'paid_by',
            'property',
            'category',
            'split_type',
            'receipt_image',
            'date',
            'notes',
            'participants',
            'created_at',
        ]
        read_only_fields = ['id', 'paid_by', 'created_at']


class ExpenseCreateSerializer(serializers.ModelSerializer):
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=True
    )
    custom_shares = serializers.DictField(
        child=serializers.DecimalField(max_digits=12, decimal_places=2),
        write_only=True,
        required=False
    )

    class Meta:
        model = Expense
        fields = [
            'title',
            'total_amount',
            'property',
            'category',
            'split_type',
            'receipt_image',
            'date',
            'notes',
            'participant_ids',
            'custom_shares',
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        participant_ids = validated_data.pop('participant_ids')
        custom_shares = validated_data.pop('custom_shares', {})
        total_amount = validated_data['total_amount']
        split_type = validated_data.get('split_type', Expense.SplitType.EQUAL)

        expense = Expense.objects.create(paid_by=user, **validated_data)

        # Make sure payer is included in participants if equal split
        all_participant_ids = list(set(participant_ids))

        if split_type == Expense.SplitType.EQUAL:
            splits = calculate_equal_splits(total_amount, all_participant_ids)
            for split in splits:
                ExpenseParticipant.objects.create(
                    expense=expense,
                    user_id=split['user_id'],
                    share_amount=split['share_amount'],
                    # If the participant is the payer, their share is already settled
                    is_settled=(split['user_id'] == user.id)
                )
        else:
            # Custom exact shares
            for p_id in all_participant_ids:
                share = custom_shares.get(str(p_id), custom_shares.get(p_id, Decimal('0.00')))
                ExpenseParticipant.objects.create(
                    expense=expense,
                    user_id=p_id,
                    share_amount=share,
                    is_settled=(p_id == user.id)
                )

        return expense


class SettlementSerializer(serializers.ModelSerializer):
    payer = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = Settlement
        fields = [
            'id',
            'payer',
            'receiver',
            'amount',
            'method',
            'notes',
            'created_at',
        ]
        read_only_fields = ['id', 'payer', 'created_at']


class CreateSettlementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settlement
        fields = [
            'receiver',
            'amount',
            'method',
            'notes',
        ]

    def create(self, validated_data):
        payer = self.context['request'].user
        receiver = validated_data['receiver']
        amount = validated_data['amount']

        settlement = Settlement.objects.create(payer=payer, **validated_data)

        # Mark corresponding unsettled participant obligations as settled
        unsettled = ExpenseParticipant.objects.filter(
            user=payer,
            expense__paid_by=receiver,
            is_settled=False
        ).order_by('id')

        remaining = amount
        for part in unsettled:
            if remaining <= 0:
                break
            if part.share_amount <= remaining:
                part.is_settled = True
                part.save()
                remaining -= part.share_amount
            else:
                # Partially settled - could split or mark
                part.is_settled = True
                part.save()
                break

        return settlement
