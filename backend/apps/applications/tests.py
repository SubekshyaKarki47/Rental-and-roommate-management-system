from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User
from apps.properties.models import Property
from apps.applications.models import RentalApplication


class RentalApplicationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.landlord = User.objects.create_user(
            email='landlord_app@nepalrent.com',
            password='TestPassword123!',
            role=User.Role.LANDLORD,
            first_name='Ram',
            last_name='Khadka'
        )
        self.tenant = User.objects.create_user(
            email='tenant_app@nepalrent.com',
            password='TestPassword123!',
            role=User.Role.TENANT,
            first_name='Sita',
            last_name='Sharma'
        )
        self.property = Property.objects.create(
            landlord=self.landlord,
            title='2BHK in Lazimpat',
            description='Spacious 2BHK flat near Radisson',
            property_type=Property.PropertyType.APARTMENT,
            address='Lazimpat Road',
            area='Lazimpat',
            city='Kathmandu',
            monthly_rent=30000,
            bedrooms=2,
            bathrooms=1,
            status=Property.Status.ACTIVE
        )

    def test_tenant_submit_application(self):
        self.client.force_authenticate(user=self.tenant)
        data = {
            'property': self.property.id,
            'move_in_date': '2026-10-01',
            'monthly_income': 75000.00,
            'employment_status': 'EMPLOYED',
            'credit_score_range': 'EXCELLENT',
            'message': 'Hi, I am interested in this flat!',
            'emergency_contact_name': 'Hari Sharma',
            'emergency_contact_phone': '9841234567',
        }
        res = self.client.post(reverse('application-list-create'), data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(RentalApplication.objects.count(), 1)
        app = RentalApplication.objects.first()
        self.assertEqual(app.status, RentalApplication.Status.PENDING)
        self.assertEqual(app.tenant, self.tenant)

    def test_landlord_approve_application(self):
        app = RentalApplication.objects.create(
            tenant=self.tenant,
            property=self.property,
            move_in_date='2026-10-01',
            monthly_income=80000
        )
        self.client.force_authenticate(user=self.landlord)
        update_url = reverse('application-status-update', kwargs={'pk': app.id})
        res = self.client.patch(update_url, {'status': 'APPROVED', 'landlord_notes': 'Verified income'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual(app.status, RentalApplication.Status.APPROVED)
        self.assertEqual(app.landlord_notes, 'Verified income')

    def test_landlord_stats(self):
        RentalApplication.objects.create(
            tenant=self.tenant,
            property=self.property,
            move_in_date='2026-10-01',
            monthly_income=80000,
            status=RentalApplication.Status.PENDING
        )
        self.client.force_authenticate(user=self.landlord)
        res = self.client.get(reverse('application-stats'))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['total_applications'], 1)
        self.assertEqual(res.data['pending_applications'], 1)
