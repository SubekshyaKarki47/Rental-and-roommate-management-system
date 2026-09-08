from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
import datetime

from apps.users.models import User, TenantProfile, LandlordProfile
from apps.properties.models import Property, PropertyImage, PropertyFavorite
from apps.applications.models import RentalApplication
from apps.roommates.models import RoommateMatch
from apps.roommates.services.compatibility import calculate_compatibility
from apps.messaging.models import Conversation, Message
from apps.rentals.models import Lease, RentPayment
from apps.expenses.models import Expense, ExpenseParticipant, Settlement
from apps.maintenance.models import MaintenanceRequest, MaintenanceComment
from apps.agreements.models import RentalAgreement
from apps.agreements.services.generator import generate_standard_nepali_clauses
from apps.notifications.models import Notification


class Command(BaseCommand):
    help = 'Master seed command for RoomMateHub with comprehensive Kathmandu Valley data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting RoomMateHub comprehensive demo data seeding...'))

        # 1. Admin User
        admin, _ = User.objects.get_or_create(
            email='admin@roommatehub.com',
            defaults={
                'first_name': 'Aayush',
                'last_name': 'Admin',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin.set_password('AdminPassword123!')
        admin.save()
        self.stdout.write(self.style.SUCCESS('Admin user ready: admin@roommatehub.com / AdminPassword123!'))

        # 2. Landlords
        landlords_data = [
            {
                'email': 'suresh.shrestha@nepalrent.com',
                'first_name': 'Suresh',
                'last_name': 'Shrestha',
                'phone': '9851023456',
                'business_name': 'Shrestha Real Estate & Residency',
                'is_verified': True,
            },
            {
                'email': 'sunita.maharjan@nepalrent.com',
                'first_name': 'Sunita',
                'last_name': 'Maharjan',
                'phone': '9841987654',
                'business_name': 'Patan Heritage Living',
                'is_verified': True,
            },
            {
                'email': 'bikash.adhikari@nepalrent.com',
                'first_name': 'Bikash',
                'last_name': 'Adhikari',
                'phone': '9860112233',
                'business_name': 'Baneshwor Apartment Co.',
                'is_verified': True,
            },
        ]

        landlords = []
        for l_data in landlords_data:
            user, _ = User.objects.get_or_create(
                email=l_data['email'],
                defaults={
                    'first_name': l_data['first_name'],
                    'last_name': l_data['last_name'],
                    'phone_number': l_data['phone'],
                    'role': User.Role.LANDLORD,
                }
            )
            user.set_password('Password123!')
            user.save()
            LandlordProfile.objects.get_or_create(
                user=user,
                defaults={
                    'business_name': l_data['business_name'],
                    'verification_status': LandlordProfile.VerificationStatus.VERIFIED if l_data['is_verified'] else LandlordProfile.VerificationStatus.PENDING,
                    'rating': Decimal('4.85'),
                    'total_reviews': 14,
                }
            )
            landlords.append(user)

        # 3. Tenants
        tenants_data = [
            {
                'email': 'anuj.dahal@gmail.com',
                'first_name': 'Anuj',
                'last_name': 'Dahal',
                'phone': '9813000001',
                'lifestyle': TenantProfile.Lifestyle.QUIET,
                'sleep': TenantProfile.SleepSchedule.EARLY_BIRD,
                'clean': TenantProfile.Cleanliness.VERY_CLEAN,
                'smoking': False,
                'pets': False,
                'min_budget': 15000,
                'max_budget': 28000,
                'locations': ['Baneshwor', 'Kupondole', 'Patan'],
                'occupation': 'Senior Software Engineer',
                'org': 'Deerwalk Tech',
                'bio': 'Quiet tech professional working remotely 3 days a week. Looking for clean flatmates.'
            },
            {
                'email': 'pratik.sharma@gmail.com',
                'first_name': 'Pratik',
                'last_name': 'Sharma',
                'phone': '9813000002',
                'lifestyle': TenantProfile.Lifestyle.QUIET,
                'sleep': TenantProfile.SleepSchedule.EARLY_BIRD,
                'clean': TenantProfile.Cleanliness.VERY_CLEAN,
                'smoking': False,
                'pets': False,
                'min_budget': 16000,
                'max_budget': 25000,
                'locations': ['Baneshwor', 'Sanepa', 'Patan'],
                'occupation': 'Data Analyst',
                'org': 'Cotiviti Nepal',
                'bio': 'Enjoys early morning walks, fitness, and keeping common areas spotless.'
            },
            {
                'email': 'shristi.karki@gmail.com',
                'first_name': 'Shristi',
                'last_name': 'Karki',
                'phone': '9813000003',
                'lifestyle': TenantProfile.Lifestyle.FLEXIBLE,
                'sleep': TenantProfile.SleepSchedule.FLEXIBLE,
                'clean': TenantProfile.Cleanliness.MODERATE,
                'smoking': False,
                'pets': True,
                'min_budget': 12000,
                'max_budget': 22000,
                'locations': ['Jhamsikhel', 'Sanepa'],
                'occupation': 'Architecture Student',
                'org': 'Pulchowk Campus IOE',
                'bio': 'Final year architecture student. Pet friendly, loves plants and quiet coffee corners.'
            },
            {
                'email': 'roshan.bhattarai@gmail.com',
                'first_name': 'Roshan',
                'last_name': 'Bhattarai',
                'phone': '9813000004',
                'lifestyle': TenantProfile.Lifestyle.SOCIAL,
                'sleep': TenantProfile.SleepSchedule.NIGHT_OWL,
                'clean': TenantProfile.Cleanliness.MODERATE,
                'smoking': False,
                'pets': False,
                'min_budget': 18000,
                'max_budget': 35000,
                'locations': ['Thamel', 'Lazimpat', 'Baluwatar'],
                'occupation': 'Digital Marketing Lead',
                'org': 'Creative Hub Nepal',
                'bio': 'Social foodie who loves weekend board game nights and exploring local cafes.'
            },
        ]

        tenants = []
        for t_data in tenants_data:
            user, _ = User.objects.get_or_create(
                email=t_data['email'],
                defaults={
                    'first_name': t_data['first_name'],
                    'last_name': t_data['last_name'],
                    'phone_number': t_data['phone'],
                    'role': User.Role.TENANT,
                }
            )
            user.set_password('Password123!')
            user.save()
            TenantProfile.objects.get_or_create(
                user=user,
                defaults={
                    'lifestyle_type': t_data['lifestyle'],
                    'sleep_schedule': t_data['sleep'],
                    'cleanliness_level': t_data['clean'],
                    'smoking_preference': t_data['smoking'],
                    'pets_allowed': t_data['pets'],
                    'min_budget': t_data['min_budget'],
                    'max_budget': t_data['max_budget'],
                    'preferred_locations': t_data['locations'],
                    'occupation_status': t_data['occupation'],
                    'university_or_company': t_data['org'],
                    'bio': t_data['bio'],
                    'is_onboarding_completed': True,
                }
            )
            tenants.append(user)

        # 4. Properties
        prop1, _ = Property.objects.get_or_create(
            title='Modern 2BHK Apartment with Private Balcony',
            defaults={
                'landlord': landlords[0],
                'description': 'Bright and airy 2BHK apartment in peaceful Shantinagar, New Baneshwor. Features parquet flooring, 24-hour deep-well water supply, modular kitchen, and sunny balcony.',
                'property_type': Property.PropertyType.APARTMENT,
                'address': 'Shantinagar Gate No. 2, New Baneshwor',
                'area': 'Baneshwor',
                'city': 'Kathmandu',
                'latitude': 27.691520,
                'longitude': 85.341520,
                'monthly_rent': 25000,
                'security_deposit': 25000,
                'bedrooms': 2,
                'bathrooms': 1,
                'floor': 3,
                'area_sqft': 750,
                'furnishing': Property.Furnishing.FURNISHED,
                'has_wifi': True,
                'has_parking': True,
                'has_24h_water': True,
                'has_electricity_backup': True,
                'has_kitchen': True,
                'has_balcony': True,
                'is_verified': True,
                'is_featured': True,
                'status': Property.Status.ACTIVE,
            }
        )
        PropertyImage.objects.get_or_create(
            property=prop1,
            image_url='https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80',
            defaults={'is_primary': True}
        )

        prop2, _ = Property.objects.get_or_create(
            title='Sunny Studio Flat near Pulchowk Campus',
            defaults={
                'landlord': landlords[1],
                'description': 'Newly renovated compact studio apartment just 5 mins from Pulchowk Engineering Campus. Fully equipped with study desk, 100Mbps fiber internet, and solar hot water.',
                'property_type': Property.PropertyType.STUDIO,
                'address': 'Kupondole Height',
                'area': 'Kupondole',
                'city': 'Lalitpur',
                'latitude': 27.689100,
                'longitude': 85.314200,
                'monthly_rent': 16000,
                'security_deposit': 16000,
                'bedrooms': 1,
                'bathrooms': 1,
                'floor': 2,
                'area_sqft': 400,
                'furnishing': Property.Furnishing.FURNISHED,
                'has_wifi': True,
                'has_24h_water': True,
                'is_verified': True,
                'status': Property.Status.ACTIVE,
            }
        )
        PropertyImage.objects.get_or_create(
            property=prop2,
            image_url='https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80',
            defaults={'is_primary': True}
        )

        # 5. Roommate Matches
        p1 = tenants[0].tenant_profile
        p2 = tenants[1].tenant_profile
        comp12 = calculate_compatibility(p1, p2)

        match1, _ = RoommateMatch.objects.get_or_create(
            requester=tenants[0],
            target_user=tenants[1],
            defaults={
                'status': RoommateMatch.Status.ACCEPTED,
                'compatibility_score': comp12['score'],
                'match_notes': comp12,
            }
        )
        # Reciprocal
        RoommateMatch.objects.get_or_create(
            requester=tenants[1],
            target_user=tenants[0],
            defaults={
                'status': RoommateMatch.Status.ACCEPTED,
                'compatibility_score': comp12['score'],
                'match_notes': comp12,
            }
        )

        # 6. Rental Applications
        app1, _ = RentalApplication.objects.get_or_create(
            tenant=tenants[0],
            property=prop1,
            defaults={
                'status': RentalApplication.Status.APPROVED,
                'move_in_date': timezone.now().date(),
                'monthly_income': 95000,
                'employment_status': RentalApplication.EmploymentStatus.EMPLOYED,
                'credit_score_range': RentalApplication.CreditScoreRange.EXCELLENT_750_PLUS,
                'message': 'Excited to move into this flat with my co-tenant.',
                'emergency_contact_name': 'Hari Dahal',
                'emergency_contact_phone': '9841234567',
                'landlord_notes': 'Verified salary slip and company ID.',
            }
        )

        app2, _ = RentalApplication.objects.get_or_create(
            tenant=tenants[2],
            property=prop2,
            defaults={
                'status': RentalApplication.Status.PENDING,
                'move_in_date': timezone.now().date() + timezone.timedelta(days=14),
                'monthly_income': 30000,
                'employment_status': RentalApplication.EmploymentStatus.STUDENT,
                'credit_score_range': RentalApplication.CreditScoreRange.GOOD_700_749,
                'message': 'Student at Pulchowk, looking for peaceful study space.',
                'emergency_contact_name': 'Ram Karki',
                'emergency_contact_phone': '9841999888',
            }
        )

        # 7. Active Lease & Rent Ledger
        lease1, _ = Lease.objects.get_or_create(
            property=prop1,
            landlord=landlords[0],
            tenant=tenants[0],
            defaults={
                'monthly_rent': 25000,
                'security_deposit': 25000,
                'start_date': timezone.now().date() - timezone.timedelta(days=30),
                'end_date': timezone.now().date() + timezone.timedelta(days=335),
                'rent_due_day': 1,
                'status': Lease.Status.ACTIVE,
                'room_number': 'Flat 302',
            }
        )

        # Last month's paid rent
        RentPayment.objects.get_or_create(
            lease=lease1,
            month_for='August 2026',
            defaults={
                'amount': 25000,
                'due_date': timezone.now().date() - timezone.timedelta(days=30),
                'paid_date': timezone.now() - timezone.timedelta(days=29),
                'status': RentPayment.Status.PAID,
                'payment_method': RentPayment.PaymentMethod.ESEWA,
                'transaction_reference': 'ESW-9A4B8C1D',
                'receipt_number': 'RCPT-202608-0001',
                'notes': 'Paid promptly via eSewa digital wallet',
            }
        )

        # Current month's pending rent
        RentPayment.objects.get_or_create(
            lease=lease1,
            month_for='September 2026',
            defaults={
                'amount': 25000,
                'due_date': timezone.now().date() + timezone.timedelta(days=5),
                'status': RentPayment.Status.PENDING,
                'payment_method': RentPayment.PaymentMethod.SIMULATED,
            }
        )

        # 8. Shared Expenses & Settlements
        exp1, _ = Expense.objects.get_or_create(
            title='Vianet Fiber Internet 150Mbps',
            defaults={
                'total_amount': Decimal('2400.00'),
                'paid_by': tenants[0],
                'property': prop1,
                'category': Expense.Category.INTERNET,
                'split_type': Expense.SplitType.EQUAL,
                'date': timezone.now().date() - timezone.timedelta(days=2),
                'notes': 'Monthly unlimited high-speed fiber internet subscription',
            }
        )
        ExpenseParticipant.objects.get_or_create(
            expense=exp1,
            user=tenants[0],
            defaults={'share_amount': Decimal('1200.00'), 'is_settled': True}
        )
        ExpenseParticipant.objects.get_or_create(
            expense=exp1,
            user=tenants[1],
            defaults={'share_amount': Decimal('1200.00'), 'is_settled': False}
        )

        exp2, _ = Expense.objects.get_or_create(
            title='Bhatbhateni Household & Cleaning Supplies',
            defaults={
                'total_amount': Decimal('1850.00'),
                'paid_by': tenants[1],
                'property': prop1,
                'category': Expense.Category.HOUSEHOLD,
                'split_type': Expense.SplitType.EQUAL,
                'date': timezone.now().date() - timezone.timedelta(days=1),
                'notes': 'Dishwasher detergent, mop refills, trash bags',
            }
        )
        ExpenseParticipant.objects.get_or_create(
            expense=exp2,
            user=tenants[1],
            defaults={'share_amount': Decimal('925.00'), 'is_settled': True}
        )
        ExpenseParticipant.objects.get_or_create(
            expense=exp2,
            user=tenants[0],
            defaults={'share_amount': Decimal('925.00'), 'is_settled': False}
        )

        # 9. Maintenance Tickets
        maint1, _ = MaintenanceRequest.objects.get_or_create(
            title='Kitchen Tap Slow Leak',
            defaults={
                'property': prop1,
                'tenant': tenants[0],
                'description': 'The hot water mixer tap in the kitchen sink has a steady drip.',
                'category': MaintenanceRequest.Category.PLUMBING,
                'priority': MaintenanceRequest.Priority.MEDIUM,
                'status': MaintenanceRequest.Status.IN_PROGRESS,
            }
        )
        MaintenanceComment.objects.get_or_create(
            request=maint1,
            user=landlords[0],
            defaults={'comment': 'Contacted local plumber in Baneshwor. Arriving tomorrow at 10 AM.'}
        )

        # 10. Rental Agreement with Digital Signatures
        clauses = generate_standard_nepali_clauses(
            property_title=prop1.title,
            monthly_rent=25000,
            deposit=25000
        )
        RentalAgreement.objects.get_or_create(
            property=prop1,
            tenant=tenants[0],
            landlord=landlords[0],
            defaults={
                'title': f'Tenancy Lease Agreement - {prop1.title}',
                'monthly_rent': 25000,
                'security_deposit': 25000,
                'start_date': timezone.now().date(),
                'end_date': timezone.now().date() + timezone.timedelta(days=365),
                'terms_clauses': clauses,
                'status': RentalAgreement.Status.EXECUTED,
                'landlord_signed': True,
                'landlord_signature_data': 'Suresh Shrestha',
                'landlord_signed_at': timezone.now() - timezone.timedelta(days=1),
                'tenant_signed': True,
                'tenant_signature_data': 'Anuj Dahal',
                'tenant_signed_at': timezone.now() - timezone.timedelta(hours=12),
                'executed_at': timezone.now() - timezone.timedelta(hours=12),
            }
        )

        # 11. In-App Notifications
        Notification.objects.get_or_create(
            recipient=tenants[0],
            title='Rent Due Reminder',
            defaults={
                'message': 'Your September rent of NPR 25,000 for Modern 2BHK Apartment is due in 5 days.',
                'category': Notification.Category.RENT,
                'action_url': '/rentals',
                'is_read': False,
            }
        )
        Notification.objects.get_or_create(
            recipient=tenants[0],
            title='New Shared Expense Added',
            defaults={
                'message': 'Pratik Sharma added NPR 1,850 for Bhatbhateni Household Supplies. Your share: NPR 925.',
                'category': Notification.Category.EXPENSE,
                'action_url': '/expenses',
                'is_read': False,
            }
        )

        self.stdout.write(self.style.SUCCESS('Master seed data completed successfully!'))
