from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from apps.users.models import User
from apps.properties.models import Property
from apps.agreements.models import RentalAgreement


class RentalAgreementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.landlord = User.objects.create_user(
            email='landlord_agr@nepal.com',
            password='Password123!',
            role=User.Role.LANDLORD,
            first_name='Manoj',
            last_name='Basnet'
        )
        self.tenant = User.objects.create_user(
            email='tenant_agr@nepal.com',
            password='Password123!',
            role=User.Role.TENANT,
            first_name='Pooja',
            last_name='Rai'
        )
        self.property = Property.objects.create(
            landlord=self.landlord,
            title='2BHK Flat in Sanepa',
            monthly_rent=28000,
            address='Sanepa',
            city='Lalitpur'
        )

    def test_agreement_generation_and_dual_signatures(self):
        # 1. Landlord creates agreement
        self.client.force_authenticate(user=self.landlord)
        data = {
            'property': self.property.id,
            'tenant': self.tenant.id,
            'title': 'Lease Agreement for 2BHK Flat in Sanepa',
            'monthly_rent': 28000,
            'security_deposit': 28000,
            'start_date': str(timezone.now().date()),
            'end_date': str(timezone.now().date() + timezone.timedelta(days=365)),
        }
        create_res = self.client.post(reverse('agreement-list-create'), data)
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        agr_id = create_res.data['id']

        # Verify standard Nepali clauses were attached
        agr = RentalAgreement.objects.get(id=agr_id)
        self.assertGreaterEqual(len(agr.terms_clauses), 5)

        # 2. Landlord signs
        sign_url = reverse('agreement-sign', kwargs={'pk': agr_id})
        res_sign1 = self.client.post(sign_url, {'signature_data': 'Manoj Basnet'})
        self.assertEqual(res_sign1.status_code, status.HTTP_200_OK)
        agr.refresh_from_db()
        self.assertTrue(agr.landlord_signed)
        self.assertNotEqual(agr.status, RentalAgreement.Status.EXECUTED)

        # 3. Tenant signs -> becomes EXECUTED!
        self.client.force_authenticate(user=self.tenant)
        res_sign2 = self.client.post(sign_url, {'signature_data': 'Pooja Rai'})
        self.assertEqual(res_sign2.status_code, status.HTTP_200_OK)
        agr.refresh_from_db()
        self.assertTrue(agr.tenant_signed)
        self.assertEqual(agr.status, RentalAgreement.Status.EXECUTED)
        self.assertIsNotNone(agr.executed_at)

    def test_tenant_can_list_agreements_from_paginated_endpoint(self):
        agreement = RentalAgreement.objects.create(
            property=self.property,
            landlord=self.landlord,
            tenant=self.tenant,
            title='Lease Agreement for 2BHK Flat in Sanepa',
            monthly_rent=28000,
            security_deposit=28000,
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timezone.timedelta(days=365),
        )

        self.client.force_authenticate(user=self.tenant)
        response = self.client.get(reverse('agreement-list-create'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(response.data['results'][0]['id'], agreement.id)
