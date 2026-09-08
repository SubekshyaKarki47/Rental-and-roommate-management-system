from decimal import Decimal, ROUND_FLOOR
from typing import List, Dict, Any


def calculate_equal_splits(total_amount: Decimal, participant_ids: List[int]) -> List[Dict[str, Any]]:
    """
    Splits total_amount equally across participants with penny/paise precision.
    The sum of all returned share amounts is guaranteed to equal total_amount exactly.
    """
    n = len(participant_ids)
    if n == 0:
        return []

    # Total in cents/paise
    total_cents = int(round(float(total_amount) * 100))
    base_share_cents = total_cents // n
    remainder_cents = total_cents % n

    splits = []
    for i, user_id in enumerate(participant_ids):
        # Distribute remaining cents to early participants
        cents = base_share_cents + (1 if i < remainder_cents else 0)
        share = Decimal(cents) / Decimal(100)
        splits.append({
            'user_id': user_id,
            'share_amount': share
        })

    return splits


def simplify_debts(net_balances: Dict[int, Decimal]) -> List[Dict[str, Any]]:
    """
    Takes a map of user_id -> net_balance (positive means others owe them, negative means they owe others)
    and computes the minimal set of settlement transactions.
    """
    # Separate into debtors (negative) and creditors (positive)
    debtors = []
    creditors = []

    for user_id, balance in net_balances.items():
        val = float(balance)
        if round(val, 2) < -0.01:
            debtors.append({'user_id': user_id, 'amount': abs(val)})
        elif round(val, 2) > 0.01:
            creditors.append({'user_id': user_id, 'amount': val})

    debtors.sort(key=lambda x: x['amount'], reverse=True)
    creditors.sort(key=lambda x: x['amount'], reverse=True)

    transactions = []
    d_idx = 0
    c_idx = 0

    while d_idx < len(debtors) and c_idx < len(creditors):
        debtor = debtors[d_idx]
        creditor = creditors[c_idx]

        settled_amt = min(debtor['amount'], creditor['amount'])
        if settled_amt > 0.01:
            transactions.append({
                'from_user_id': debtor['user_id'],
                'to_user_id': creditor['user_id'],
                'amount': round(settled_amt, 2)
            })

        debtor['amount'] -= settled_amt
        creditor['amount'] -= settled_amt

        if debtor['amount'] < 0.01:
            d_idx += 1
        if creditor['amount'] < 0.01:
            c_idx += 1

    return transactions
