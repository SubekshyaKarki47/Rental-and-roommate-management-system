from decimal import Decimal
import datetime

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.agreements.models import RentalAgreement
from apps.agreements.services.generator import generate_standard_nepali_clauses
from apps.properties.models import Property, PropertyImage
from apps.users.models import LandlordProfile, User


class Command(BaseCommand):
    help = 'Create one demo landlord with ten active rental properties.'

    landlord_email = 'demo.landlord@roommatehub.com'
    landlord_password = 'DemoLandlord123!'

    properties = [
        ('Sunlit 2BHK in Baneshwor', 'APARTMENT', 'Shantinagar, Baneshwor', 'Baneshwor', 'Kathmandu', 28000, 2, 1, 850, 'FURNISHED'),
        ('Compact Studio near Pulchowk', 'STUDIO', 'Kupondole Heights', 'Kupondole', 'Lalitpur', 18000, 1, 1, 430, 'FURNISHED'),
        ('Private Room in Patan Flat', 'ROOM', 'Patan Dhoka Road', 'Patan', 'Lalitpur', 11000, 1, 1, 240, 'FURNISHED'),
        ('Family Flat in Lazimpat', 'FLAT', 'Lazimpat Road', 'Lazimpat', 'Kathmandu', 35000, 3, 2, 1200, 'SEMI_FURNISHED'),
        ('Modern 1BHK in Jhamsikhel', 'APARTMENT', 'Moksh Marg, Jhamsikhel', 'Jhamsikhel', 'Lalitpur', 22000, 1, 1, 650, 'FURNISHED'),
        ('Quiet Room near Kirtipur Campus', 'ROOM', 'Naya Bazar, Kirtipur', 'Kirtipur', 'Kathmandu', 9000, 1, 1, 210, 'FURNISHED'),
        ('Spacious 2BHK in Maharajgunj', 'APARTMENT', 'Teaching Hospital Road', 'Maharajgunj', 'Kathmandu', 30000, 2, 2, 950, 'UNFURNISHED'),
        ('Rooftop Studio in Thamel', 'STUDIO', 'Chaksibari Marg', 'Thamel', 'Kathmandu', 20000, 1, 1, 500, 'FURNISHED'),
        ('New 3BHK House in Sanepa', 'HOUSE', 'Ring Road Extension', 'Sanepa', 'Lalitpur', 48000, 3, 2, 1500, 'SEMI_FURNISHED'),
        ('Affordable Flat in Koteshwor', 'FLAT', 'Tinkune Road', 'Koteshwor', 'Kathmandu', 16000, 2, 1, 700, 'UNFURNISHED'),
    ]

    image_urls = [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1560185008-b033106af5c3?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&auto=format&fit=crop&q=80',
    ]

    def handle(self, *args, **options):
        landlord, _ = User.objects.get_or_create(
            email=self.landlord_email,
            defaults={
                'first_name': 'Demo',
                'last_name': 'Landlord',
                'role': User.Role.LANDLORD,
                'is_verified': True,
                'phone_number': '+977 9800000010',
            },
        )
        landlord.role = User.Role.LANDLORD
        landlord.is_verified = True
        landlord.set_password(self.landlord_password)
        landlord.save(update_fields=['role', 'is_verified', 'password'])
        LandlordProfile.objects.update_or_create(
            user=landlord,
            defaults={
                'business_name': 'RoomMateHub Demo Rentals',
                'verification_status': LandlordProfile.VerificationStatus.VERIFIED,
                'rating': Decimal('4.80'),
                'total_reviews': 25,
            },
        )

        for index, (title, property_type, address, area, city, rent, bedrooms, bathrooms, area_sqft, furnishing) in enumerate(self.properties):
            property_obj, _ = Property.objects.update_or_create(
                title=title,
                defaults={
                    'landlord': landlord,
                    'description': f'{title} with reliable water, electricity backup, and a convenient neighborhood location.',
                    'property_type': property_type,
                    'address': address,
                    'area': area,
                    'city': city,
                    'monthly_rent': rent,
                    'security_deposit': rent,
                    'bedrooms': bedrooms,
                    'bathrooms': bathrooms,
                    'floor': 2,
                    'area_sqft': area_sqft,
                    'furnishing': furnishing,
                    'has_wifi': True,
                    'has_parking': True,
                    'has_24h_water': True,
                    'has_electricity_backup': True,
                    'has_kitchen': True,
                    'has_balcony': True,
                    'pets_allowed': False,
                    'smoking_allowed': False,
                    'status': Property.Status.ACTIVE,
                    'is_verified': True,
                    'is_featured': True,
                },
            )
            primary_image = property_obj.images.order_by('id').first()
            if primary_image:
                primary_image.image_url = self.image_urls[index]
                primary_image.is_primary = True
                primary_image.save(update_fields=['image_url', 'is_primary'])
            else:
                PropertyImage.objects.create(
                    property=property_obj,
                    image_url=self.image_urls[index],
                    is_primary=True,
                )

        tenant, _ = User.objects.get_or_create(
            email='tenant@roommatehub.com',
            defaults={
                'first_name': 'Demo',
                'last_name': 'Tenant',
                'role': User.Role.TENANT,
                'is_verified': True,
                'phone_number': '+977 9812345678',
            },
        )
        tenant.role = User.Role.TENANT
        tenant.is_verified = True
        tenant.set_password('TenantPassword123!')
        tenant.save(update_fields=['role', 'is_verified', 'password'])

        demo_property = Property.objects.get(title=self.properties[0][0], landlord=landlord)
        start_date = timezone.localdate()
        RentalAgreement.objects.get_or_create(
            property=demo_property,
            landlord=landlord,
            tenant=tenant,
            defaults={
                'title': f'Tenancy Agreement - {demo_property.title}',
                'monthly_rent': demo_property.monthly_rent,
                'security_deposit': demo_property.security_deposit,
                'start_date': start_date,
                'end_date': start_date + datetime.timedelta(days=365),
                'terms_clauses': generate_standard_nepali_clauses(
                    property_title=demo_property.title,
                    monthly_rent=float(demo_property.monthly_rent),
                    deposit=float(demo_property.security_deposit),
                ),
                'status': RentalAgreement.Status.PENDING_SIGNATURES,
                'landlord_signed': True,
                'landlord_signature_data': landlord.full_name,
                'landlord_signed_at': timezone.now(),
            },
        )

        self.stdout.write(self.style.SUCCESS(
            f'Demo landlord ready: {self.landlord_email} / {self.landlord_password}'
        ))
        self.stdout.write(self.style.SUCCESS('Created or updated 10 active properties.'))
        self.stdout.write(self.style.SUCCESS(
            'Demo tenant ready: tenant@roommatehub.com / TenantPassword123!'
        ))
        self.stdout.write(self.style.SUCCESS(
            'Created or kept one demo agreement for the tenant dashboard.'
        ))
