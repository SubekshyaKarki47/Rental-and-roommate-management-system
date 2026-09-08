from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from apps.users.models import User
from apps.properties.models import Property
from apps.rentals.models import Lease, RentPayment


class RentalPaymentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.landlord = User.objects.create_user(
            email='landlord_rent@nepal.com',
            password='Password123!',
            role=User.Role.LANDLORD,
            first_name='Gopal',
            last_name='Adhikari'
        )
        self.tenant = User.objects.create_user(
            email='tenant_rent@nepal.com',
            password='Password123!',
            role=User.Role.TENANT,
            first_name='Kavita',
            last_name='Gurung'
        )
        self.property = Property.objects.create(
            landlord=self.landlord,
            title='1BHK Apartment in Jhamsikhel',
            monthly_rent=22000,
            address='Jhamsikhel',
            city='Lalitpur'
        )
        self.lease = Lease.objects.create(
            property=self.property,
            landlord=self.landlord,
            tenant=self.tenant,
            monthly_rent=22000,
            security_deposit=22000,
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timezone.timedelta(days=365)
        )
        self.payment = RentPayment.objects.create(
            lease=self.lease,
            amount=22000,
            month_for='September 2026',
            due_date=timezone.now().date(),
            status=RentPayment.Status.PENDING
        )

    def test_simulate_digital_payment(self):
        self.client.force_authenticate(user=self.tenant)
        pay_url = reverse('payment-simulate-pay', kwargs={'payment_id': self.payment.id})
        res = self.client.post(pay_url, {'payment_method': 'ESEWA', 'notes': 'Paid via eSewa'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, RentPayment.Status.PAID)
        self.assertEqual(self.payment.payment_method, 'ESEWA')
        self.assertTrue(self.payment.transaction_reference.startswith('ESW-'))
        self.assertTrue(self.payment.receipt_number.startswith('RCPT-'))
