from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, TenantProfile, LandlordProfile


class AuthAndRBACTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.onboarding_url = reverse('tenant_onboarding')
        self.switch_role_url = reverse('switch_role')

    def test_tenant_registration_success(self):
        payload = {
            'email': 'tenant@example.com',
            'password': 'SecurePassword123!',
            'password_confirm': 'SecurePassword123!',
            'first_name': 'Aarav',
            'last_name': 'Sharma',
            'role': User.Role.TENANT,
            'phone_number': '9800000000'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], User.Role.TENANT)
        
        # Verify TenantProfile automatically created
        user = User.objects.get(email='tenant@example.com')
        self.assertTrue(hasattr(user, 'tenant_profile'))
        self.assertFalse(user.tenant_profile.is_onboarding_completed)

    def test_landlord_registration_success(self):
        payload = {
            'email': 'landlord@example.com',
            'password': 'SecurePassword123!',
            'password_confirm': 'SecurePassword123!',
            'first_name': 'Binod',
            'last_name': 'Adhikari',
            'role': User.Role.LANDLORD,
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='landlord@example.com')
        self.assertTrue(hasattr(user, 'landlord_profile'))

    def test_prevent_admin_registration_escalation(self):
        payload = {
            'email': 'hacker@example.com',
            'password': 'SecurePassword123!',
            'password_confirm': 'SecurePassword123!',
            'first_name': 'Hacker',
            'last_name': 'User',
            'role': User.Role.ADMIN,
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email='hacker@example.com').exists())

    def test_password_mismatch_fails(self):
        payload = {
            'email': 'mismatch@example.com',
            'password': 'Password123!',
            'password_confirm': 'DifferentPassword!',
            'first_name': 'Test',
            'last_name': 'User',
            'role': User.Role.TENANT,
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_jwt_login_success(self):
        user = User.objects.create_user(
            email='loginuser@example.com',
            password='Password123!',
            first_name='Subekshya',
            last_name='Karki',
            role=User.Role.TENANT
        )
        TenantProfile.objects.create(user=user)

        response = self.client.post(self.login_url, {
            'email': 'loginuser@example.com',
            'password': 'Password123!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['email'], 'loginuser@example.com')
        self.assertEqual(response.data['user']['role'], User.Role.TENANT)

    def test_tenant_onboarding_submission(self):
        tenant = User.objects.create_user(
            email='onboard@example.com',
            password='Password123!',
            role=User.Role.TENANT
        )
        TenantProfile.objects.create(user=tenant)

        # Authenticate
        self.client.force_authenticate(user=tenant)

        onboarding_data = {
            'age_range': '20-25',
            'occupation_status': 'Computer Science Student',
            'university_or_company': 'Tribhuvan University',
            'preferred_locations': ['Baneshwor', 'Koteshwor', 'Lalitpur'],
            'min_budget': 12000,
            'max_budget': 22000,
            'bedrooms_preferred': 2,
            'lifestyle_type': 'QUIET',
            'cleanliness_level': 'VERY_CLEAN',
            'smoking_preference': False,
            'pets_allowed': False,
            'bio': 'Quiet CS student looking for like-minded roommate.'
        }

        response = self.client.post(self.onboarding_url, onboarding_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        tenant.tenant_profile.refresh_from_db()
        self.assertTrue(tenant.tenant_profile.is_onboarding_completed)
        self.assertEqual(tenant.tenant_profile.university_or_company, 'Tribhuvan University')
        self.assertEqual(tenant.tenant_profile.min_budget, 12000)

    def test_landlord_cannot_access_tenant_onboarding(self):
        landlord = User.objects.create_user(
            email='landlord_onboard@example.com',
            password='Password123!',
            role=User.Role.LANDLORD
        )
        LandlordProfile.objects.create(user=landlord)

        self.client.force_authenticate(user=landlord)
        response = self.client.post(self.onboarding_url, {'min_budget': 10000}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_prevent_switching_to_admin(self):
        user = User.objects.create_user(
            email='switch@example.com',
            password='Password123!',
            role=User.Role.TENANT
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(self.switch_role_url, {'role': 'ADMIN'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        user.refresh_from_db()
        self.assertEqual(user.role, User.Role.TENANT)
