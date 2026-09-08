from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from apps.users.models import User
from apps.expenses.models import Expense, ExpenseParticipant, Settlement
from apps.expenses.services.calculator import calculate_equal_splits, simplify_debts


class ExpenseSplittingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.u1 = User.objects.create_user(email='exp1@nepal.com', password='Pass123!_User', role=User.Role.TENANT)
        self.u2 = User.objects.create_user(email='exp2@nepal.com', password='Pass123!_User', role=User.Role.TENANT)
        self.u3 = User.objects.create_user(email='exp3@nepal.com', password='Pass123!_User', role=User.Role.TENANT)

    def test_penny_perfect_equal_split_three_ways(self):
        # 100.00 split 3 ways must sum to exactly 100.00 (e.g. 33.34, 33.33, 33.33)
        splits = calculate_equal_splits(Decimal('100.00'), [self.u1.id, self.u2.id, self.u3.id])
        total_sum = sum(s['share_amount'] for s in splits)
        self.assertEqual(total_sum, Decimal('100.00'))
        self.assertEqual(len(splits), 3)

    def test_create_expense_api_flow(self):
        self.client.force_authenticate(user=self.u1)
        data = {
            'title': 'Broadlink WiFi Bill - Bhadra',
            'total_amount': '2550.00',
            'category': 'INTERNET',
            'split_type': 'EQUAL',
            'participant_ids': [self.u1.id, self.u2.id, self.u3.id]
        }
        res = self.client.post(reverse('expense-list-create'), data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ExpenseParticipant.objects.count(), 3)

        # u1 is the payer, so u1's participant record should be is_settled=True
        u1_part = ExpenseParticipant.objects.get(user=self.u1)
        self.assertTrue(u1_part.is_settled)
        # u2's participant record should be unsettled
        u2_part = ExpenseParticipant.objects.get(user=self.u2)
        self.assertFalse(u2_part.is_settled)

    def test_debt_simplification(self):
        # u1 is owed 1000, u2 owes 600, u3 owes 400
        balances = {
            self.u1.id: Decimal('1000.00'),
            self.u2.id: Decimal('-600.00'),
            self.u3.id: Decimal('-400.00'),
        }
        transactions = simplify_debts(balances)
        self.assertEqual(len(transactions), 2)
        total_settled = sum(t['amount'] for t in transactions)
        self.assertAlmostEqual(total_settled, 1000.00)
