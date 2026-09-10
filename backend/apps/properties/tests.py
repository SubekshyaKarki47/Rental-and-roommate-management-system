from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User, LandlordProfile
from .models import Property, PropertyFavorite


class PropertyAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.list_url = reverse('property_list_create')
        self.compare_url = reverse('property_compare')

        # Landlord user
        self.landlord = User.objects.create_user(
            email='landlord_test@example.com',
            password='Password123!',
            role=User.Role.LANDLORD,
            first_name='Kiran',
            last_name='Shrestha'
        )
        LandlordProfile.objects.create(user=self.landlord, business_name='Shrestha Properties')

        # Tenant user
        self.tenant = User.objects.create_user(
            email='tenant_test@example.com',
            password='Password123!',
            role=User.Role.TENANT,
            first_name='Anuj',
            last_name='Dahal'
        )

        # Create two sample properties
        self.prop1 = Property.objects.create(
            landlord=self.landlord,
            title='Apartment in Baneshwor',
            description='Nice 2BHK flat',
            property_type=Property.PropertyType.APARTMENT,
            address='Shantinagar',
            area='Baneshwor',
            city='Kathmandu',
            monthly_rent=25000,
            bedrooms=2,
            bathrooms=1,
            has_wifi=True,
            status=Property.Status.ACTIVE
        )

        self.prop2 = Property.objects.create(
            landlord=self.landlord,
            title='Studio in Jhamsikhel',
            description='Cozy studio',
            property_type=Property.PropertyType.STUDIO,
            address='Jhamsikhel Road',
            area='Jhamsikhel',
            city='Lalitpur',
            monthly_rent=18000,
            bedrooms=1,
            bathrooms=1,
            has_wifi=False,
            status=Property.Status.ACTIVE
        )

    def test_public_property_listing(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check pagination results
        results = response.data.get('results', response.data)
        self.assertGreaterEqual(len(results), 2)

    def test_filter_by_price_and_bedrooms(self):
        # Filter for price <= 20000
        response = self.client.get(self.list_url, {'max_price': 20000})
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], 'Studio in Jhamsikhel')

        # Filter for 2 bedrooms
        response = self.client.get(self.list_url, {'bedrooms': 2})
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], 'Apartment in Baneshwor')

    def test_property_detail_and_view_count(self):
        initial_views = self.prop1.views_count
        detail_url = reverse('property_detail', kwargs={'pk': self.prop1.pk})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Apartment in Baneshwor')
        self.prop1.refresh_from_db()
        self.assertEqual(self.prop1.views_count, initial_views + 1)

    def test_landlord_can_create_property(self):
        self.client.force_authenticate(user=self.landlord)
        payload = {
            'title': 'New Studio in Sanepa',
            'description': 'Modern flat with balcony',
            'property_type': 'STUDIO',
            'address': 'Sanepa Chowk',
            'area': 'Sanepa',
            'city': 'Lalitpur',
            'monthly_rent': 20000,
            'security_deposit': 20000,
            'bedrooms': 1,
            'bathrooms': 1,
            'furnishing': 'FURNISHED',
            'has_wifi': True,
            'image_urls': ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267']
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Property.objects.filter(title='New Studio in Sanepa').exists())

        created = Property.objects.get(title='New Studio in Sanepa')
        self.assertEqual(created.status, Property.Status.ACTIVE)

        self.client.force_authenticate(user=self.tenant)
        tenant_response = self.client.get(self.list_url)
        results = tenant_response.data.get('results', tenant_response.data)
        self.assertIn(created.id, [item['id'] for item in results])

    def test_tenant_cannot_create_property(self):
        self.client.force_authenticate(user=self.tenant)
        payload = {
            'title': 'Unauthorized Property',
            'description': 'Should fail',
            'monthly_rent': 20000,
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_favorite_toggle(self):
        self.client.force_authenticate(user=self.tenant)
        fav_url = reverse('property_favorite_toggle', kwargs={'pk': self.prop1.pk})

        # First toggle: should add favorite
        response = self.client.post(fav_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['favorited'])
        self.assertTrue(PropertyFavorite.objects.filter(user=self.tenant, property=self.prop1).exists())

        # Second toggle: should remove favorite
        response = self.client.post(fav_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['favorited'])
        self.assertFalse(PropertyFavorite.objects.filter(user=self.tenant, property=self.prop1).exists())

    def test_property_comparison_endpoint(self):
        response = self.client.post(self.compare_url, {'ids': [self.prop1.pk, self.prop2.pk]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['properties']), 2)
