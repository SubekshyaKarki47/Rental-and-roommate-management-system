from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User
from apps.properties.models import Property
from apps.maintenance.models import MaintenanceRequest, MaintenanceComment


class MaintenanceTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.landlord = User.objects.create_user(
            email='landlord_maint@nepal.com',
            password='Password123!',
            role=User.Role.LANDLORD,
            first_name='Suraj',
            last_name='Maharjan'
        )
        self.tenant = User.objects.create_user(
            email='tenant_maint@nepal.com',
            password='Password123!',
            role=User.Role.TENANT,
            first_name='Rohan',
            last_name='Karki'
        )
        self.property = Property.objects.create(
            landlord=self.landlord,
            title='Apartment in Thamel',
            address='Thamel Marg',
            city='Kathmandu',
            monthly_rent=35000
        )

    def test_maintenance_ticket_lifecycle(self):
        # 1. Tenant submits maintenance ticket
        self.client.force_authenticate(user=self.tenant)
        data = {
            'property': self.property.id,
            'title': 'Bathroom Geyser Not Heating',
            'description': 'Water heater trips circuit breaker when switched on.',
            'category': 'ELECTRICAL',
            'priority': 'HIGH'
        }
        res = self.client.post(reverse('maintenance-list-create'), data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        ticket_id = res.data['id']

        # 2. Landlord comments
        self.client.force_authenticate(user=self.landlord)
        comment_url = reverse('maintenance-add-comment', kwargs={'pk': ticket_id})
        c_res = self.client.post(comment_url, {'comment': 'Electrician technician scheduled for tomorrow at 11am.'})
        self.assertEqual(c_res.status_code, status.HTTP_201_CREATED)

        # 3. Landlord resolves ticket
        detail_url = reverse('maintenance-detail', kwargs={'pk': ticket_id})
        patch_res = self.client.patch(detail_url, {'status': 'RESOLVED', 'resolution_notes': 'Replaced heating coil'})
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)

        ticket = MaintenanceRequest.objects.get(id=ticket_id)
        self.assertEqual(ticket.status, MaintenanceRequest.Status.RESOLVED)
        self.assertIsNotNone(ticket.resolved_at)
        self.assertEqual(ticket.comments.count(), 1)
