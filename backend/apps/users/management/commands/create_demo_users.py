from django.core.management.base import BaseCommand
from apps.users.models import User, TenantProfile, LandlordProfile


class Command(BaseCommand):
    help = 'Creates demo users for RoomMateHub (Admin, Landlord, Tenant)'

    def handle(self, *args, **options):
        # Admin
        if not User.objects.filter(email='admin@roommatehub.com').exists():
            admin = User.objects.create_superuser(
                email='admin@roommatehub.com',
                password='AdminPassword123!',
                first_name='System',
                last_name='Admin',
                role=User.Role.ADMIN,
                is_verified=True,
            )
            self.stdout.write(self.style.SUCCESS(f'Created Admin: {admin.email}'))
        else:
            self.stdout.write('Admin user already exists.')

        # Landlord
        if not User.objects.filter(email='landlord@roommatehub.com').exists():
            landlord = User.objects.create_user(
                email='landlord@roommatehub.com',
                password='LandlordPassword123!',
                first_name='Suresh',
                last_name='Pradhan',
                role=User.Role.LANDLORD,
                is_verified=True,
                phone_number='+977 9841234567'
            )
            LandlordProfile.objects.create(
                user=landlord,
                business_name='Kathmandu Valley Living Spaces',
                verification_status=LandlordProfile.VerificationStatus.VERIFIED,
                rating=4.9,
                total_reviews=18
            )
            self.stdout.write(self.style.SUCCESS(f'Created Landlord: {landlord.email}'))
        else:
            self.stdout.write('Landlord user already exists.')

        # Tenant
        if not User.objects.filter(email='tenant@roommatehub.com').exists():
            tenant = User.objects.create_user(
                email='tenant@roommatehub.com',
                password='TenantPassword123!',
                first_name='Aarav',
                last_name='Shrestha',
                role=User.Role.TENANT,
                is_verified=True,
                phone_number='+977 9812345678'
            )
            TenantProfile.objects.create(
                user=tenant,
                age_range='20-25',
                occupation_status='Engineering Student',
                university_or_company='Pulchowk Campus',
                preferred_locations=['Patan', 'Jhamsikhel', 'Kupondole'],
                min_budget=15000,
                max_budget=25000,
                bedrooms_preferred=2,
                furnishing_preference=TenantProfile.FurnishingPreference.FURNISHED,
                lifestyle_type=TenantProfile.Lifestyle.QUIET,
                cleanliness_level=TenantProfile.Cleanliness.VERY_CLEAN,
                sleep_schedule=TenantProfile.SleepSchedule.EARLY_BIRD,
                pets_allowed=False,
                smoking_preference=False,
                bio='Civil engineering senior looking for a clean, study-friendly apartment near Pulchowk.',
                is_onboarding_completed=True
            )
            self.stdout.write(self.style.SUCCESS(f'Created Tenant: {tenant.email}'))
        else:
            self.stdout.write('Tenant user already exists.')
