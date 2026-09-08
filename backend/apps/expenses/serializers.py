from rest_framework import serializers
from decimal import Decimal
from django.utils import timezone
from apps.users.models import User
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
        if user.id not in all_participant_ids:
            all_participant_ids.append(user.id)

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
    payer = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False
    )
    receiver = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=True
    )

    class Meta:
        model = Settlement
        fields = [
            'payer',
            'receiver',
            'amount',
            'method',
            'notes',
        ]

    def validate(self, attrs):
        request_user = self.context['request'].user
        payer = attrs.get('payer')
        receiver = attrs.get('receiver')

        if not payer:
            payer = request_user

        # User must either be the payer or receiver
        if request_user != payer and request_user != receiver and not request_user.is_staff:
            raise serializers.ValidationError("You must be either the payer or receiver in this settlement.")

        if payer == receiver:
            raise serializers.ValidationError("Payer and receiver cannot be the same user.")

        attrs['payer'] = payer
        return attrs

    def create(self, validated_data):
        payer = validated_data['payer']
        receiver = validated_data['receiver']
        amount = validated_data['amount']

        settlement = Settlement.objects.create(**validated_data)

        # Mark corresponding unsettled participant obligations as settled
        # Payer is debtor (unsettled participant share)
        # Receiver is creditor (paid_by for the expense)
        unsettled = list(ExpenseParticipant.objects.filter(
            user=payer,
            expense__paid_by=receiver,
            is_settled=False
        ).order_by('id'))

        # Fallback if debts were indirectly simplified across the household network
        if not unsettled:
            unsettled = list(ExpenseParticipant.objects.filter(
                user=payer,
                is_settled=False
            ).order_by('id'))

        remaining = amount
        for part in unsettled:
            if remaining <= 0:
                break
            part.is_settled = True
            part.settled_at = timezone.now()
            part.save()
            remaining -= part.share_amount

        return settlement
