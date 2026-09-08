from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User, TenantProfile
from apps.roommates.models import RoommateMatch
from apps.roommates.services.compatibility import calculate_compatibility


class RoommateCompatibilityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            email='roommate1@nepalrent.com',
            password='Password123!',
            role=User.Role.TENANT,
            first_name='Aayush',
            last_name='Giri'
        )
        self.profile1 = TenantProfile.objects.create(
            user=self.user1,
            lifestyle_type=TenantProfile.Lifestyle.QUIET,
            sleep_schedule=TenantProfile.SleepSchedule.EARLY_BIRD,
            cleanliness_level=TenantProfile.Cleanliness.VERY_CLEAN,
            smoking_preference=False,
            pets_allowed=False,
            min_budget=15000,
            max_budget=25000,
            preferred_locations=['Patan', 'Jhamsikhel']
        )

        self.user2 = User.objects.create_user(
            email='roommate2@nepalrent.com',
            password='Password123!',
            role=User.Role.TENANT,
            first_name='Bibek',
            last_name='Thapa'
        )
        self.profile2 = TenantProfile.objects.create(
            user=self.user2,
            lifestyle_type=TenantProfile.Lifestyle.QUIET,
            sleep_schedule=TenantProfile.SleepSchedule.EARLY_BIRD,
            cleanliness_level=TenantProfile.Cleanliness.VERY_CLEAN,
            smoking_preference=False,
            pets_allowed=False,
            min_budget=18000,
            max_budget=30000,
            preferred_locations=['Patan', 'Kupondole']
        )

    def test_compatibility_scoring(self):
        comp = calculate_compatibility(self.profile1, self.profile2)
        # Both are Quiet, Early Bird, Very Clean, Non-smoker, No pets, overlapping budget in Patan
        self.assertGreaterEqual(comp['score'], 80)
        self.assertIn('cleanliness', comp['breakdown'])
        self.assertTrue(comp['breakdown']['smoking']['is_synergy'])

    def test_mutual_roommate_match(self):
        self.client.force_authenticate(user=self.user1)
        # user1 requests user2
        res1 = self.client.post(reverse('roommate-request'), {'target_user_id': self.user2.id})
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertEqual(res1.data['status'], 'PENDING')

        # user2 now also requests user1 -> instant mutual ACCEPTED match!
        self.client.force_authenticate(user=self.user2)
        res2 = self.client.post(reverse('roommate-request'), {'target_user_id': self.user1.id})
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.data['status'], 'ACCEPTED')
