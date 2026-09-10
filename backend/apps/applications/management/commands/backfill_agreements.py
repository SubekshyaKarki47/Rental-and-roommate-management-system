import datetime

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.agreements.models import RentalAgreement
from apps.agreements.services.generator import generate_standard_nepali_clauses
from apps.applications.models import RentalApplication


class Command(BaseCommand):
    help = 'Create missing rental agreements for approved applications.'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        approved_applications = RentalApplication.objects.filter(
            status=RentalApplication.Status.APPROVED
        ).select_related('property', 'property__landlord', 'tenant')

        for application in approved_applications:
            start_date = application.move_in_date or timezone.localdate()
            end_date = start_date + datetime.timedelta(days=365)
            _, created = RentalAgreement.objects.get_or_create(
                property=application.property,
                tenant=application.tenant,
                landlord=application.property.landlord,
                defaults={
                    'title': f'Tenancy Agreement - {application.property.title}',
                    'monthly_rent': application.property.monthly_rent,
                    'security_deposit': application.property.security_deposit,
                    'start_date': start_date,
                    'end_date': end_date,
                    'terms_clauses': generate_standard_nepali_clauses(
                        property_title=application.property.title,
                        monthly_rent=float(application.property.monthly_rent),
                        deposit=float(application.property.security_deposit),
                    ),
                    'landlord_signed': True,
                    'landlord_signature_data': application.property.landlord.full_name,
                    'landlord_signed_at': timezone.now(),
                },
            )
            if not created and not agreement.landlord_signed:
                agreement.landlord_signed = True
                agreement.landlord_signature_data = application.property.landlord.full_name
                agreement.landlord_signed_at = timezone.now()
                agreement.save(update_fields=[
                    'landlord_signed',
                    'landlord_signature_data',
                    'landlord_signed_at',
                    'updated_at',
                ])
                updated_count += 1
            created_count += int(created)

        self.stdout.write(self.style.SUCCESS(
            f'Agreement backfill complete. Created {created_count}, '
            f'updated {updated_count} agreement(s).'
        ))
