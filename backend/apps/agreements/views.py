from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import HttpResponse
from django.db.models import Q

from apps.agreements.models import RentalAgreement
from apps.agreements.serializers import (
    RentalAgreementSerializer,
    CreateRentalAgreementSerializer,
    SignAgreementSerializer,
)


class AgreementListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateRentalAgreementSerializer
        return RentalAgreementSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role == 'ADMIN':
            return RentalAgreement.objects.all().select_related('landlord', 'tenant', 'property')
        return RentalAgreement.objects.filter(
            Q(landlord=user) | Q(tenant=user)
        ).select_related('landlord', 'tenant', 'property')


class AgreementDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RentalAgreementSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role == 'ADMIN':
            return RentalAgreement.objects.all()
        return RentalAgreement.objects.filter(Q(landlord=user) | Q(tenant=user))


class AgreementSignView(APIView):
    """Digital signature endpoint for landlords and tenants."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        agreement = get_object_or_404(RentalAgreement, Q(landlord=user) | Q(tenant=user), pk=pk)

        serializer = SignAgreementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sig = serializer.validated_data['signature_data']

        if agreement.landlord == user:
            agreement.landlord_signed = True
            agreement.landlord_signature_data = sig
            agreement.landlord_signed_at = timezone.now()
        elif agreement.tenant == user:
            agreement.tenant_signed = True
            agreement.tenant_signature_data = sig
            agreement.tenant_signed_at = timezone.now()

        # If both signed, execute agreement!
        if agreement.landlord_signed and agreement.tenant_signed:
            agreement.status = RentalAgreement.Status.EXECUTED
            agreement.executed_at = timezone.now()

        agreement.save()
        return Response({
            "detail": "Agreement successfully signed!",
            "agreement": RentalAgreementSerializer(agreement).data
        })


class AgreementHtmlView(APIView):
    """Generates printable, legal-formatted HTML agreement view."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        user = request.user
        agreement = get_object_or_404(
            RentalAgreement.objects.select_related('landlord', 'tenant', 'property'),
            Q(landlord=user) | Q(tenant=user) | Q(pk__gt=0 if user.is_staff else -1),
            pk=pk
        )

        clauses_html = "".join([
            f"""
            <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 6px 0; color: #1e293b;">{c.get('clause_number', '')}. {c.get('title', '')}</h4>
                <p style="margin: 0; line-height: 1.6; color: #475569; font-size: 14px;">{c.get('body', '')}</p>
            </div>
            """
            for c in agreement.terms_clauses
        ])

        ll_sig_display = f"""
            <div style="border-top: 1px solid #94a3b8; padding-top: 8px; margin-top: 40px;">
                <p style="font-family: 'Brush Script MT', cursive; font-size: 24px; color: #1e40af; margin: 0;">{agreement.landlord_signature_data}</p>
                <p style="font-weight: bold; margin: 4px 0 0 0;">{agreement.landlord.full_name} (Landlord)</p>
                <p style="color: #64748b; font-size: 12px; margin: 0;">Signed on: {agreement.landlord_signed_at.strftime('%B %d, %Y %I:%M %p') if agreement.landlord_signed_at else 'Pending'}</p>
            </div>
        """ if agreement.landlord_signed else """
            <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 40px; color: #94a3b8;">
                <p style="margin: 0;">[Pending Landlord Signature]</p>
            </div>
        """

        tn_sig_display = f"""
            <div style="border-top: 1px solid #94a3b8; padding-top: 8px; margin-top: 40px;">
                <p style="font-family: 'Brush Script MT', cursive; font-size: 24px; color: #1e40af; margin: 0;">{agreement.tenant_signature_data}</p>
                <p style="font-weight: bold; margin: 4px 0 0 0;">{agreement.tenant.full_name} (Tenant)</p>
                <p style="color: #64748b; font-size: 12px; margin: 0;">Signed on: {agreement.tenant_signed_at.strftime('%B %d, %Y %I:%M %p') if agreement.tenant_signed_at else 'Pending'}</p>
            </div>
        """ if agreement.tenant_signed else """
            <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 40px; color: #94a3b8;">
                <p style="margin: 0;">[Pending Tenant Signature]</p>
            </div>
        """

        html = f"""<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>{agreement.title} - Tenancy Agreement</title>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; padding: 40px 20px; }}
                .paper {{ max-width: 800px; margin: 0 auto; background: #fff; padding: 48px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }}
                .header {{ text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 24px; margin-bottom: 32px; }}
                .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }}
                .card {{ background: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 14px; }}
                .stamp {{ display: inline-block; padding: 6px 16px; border-radius: 9999px; font-weight: bold; text-transform: uppercase; font-size: 12px; background: {'#dcfce7' if agreement.status == 'EXECUTED' else '#fef3c7'}; color: {'#15803d' if agreement.status == 'EXECUTED' else '#b45309'}; }}
                @media print {{ body {{ background: #fff; padding: 0; }} .paper {{ box-shadow: none; border: none; padding: 20px; }} }}
            </style>
        </head>
        <body>
            <div class="paper">
                <div class="header">
                    <span class="stamp">{agreement.status}</span>
                    <h1 style="margin: 16px 0 6px 0; font-size: 26px;">RESIDENTIAL TENANCY LEASE AGREEMENT</h1>
                    <p style="margin: 0; color: #64748b; font-size: 14px;">Pursuant to the National Civil (Code) Act, 2074 (Nepal)</p>
                </div>

                <div class="grid">
                    <div class="card">
                        <h4 style="margin: 0 0 8px 0; color: #334155;">LANDLORD (First Party)</h4>
                        <p style="margin: 2px 0;"><strong>Name:</strong> {agreement.landlord.full_name}</p>
                        <p style="margin: 2px 0;"><strong>Email:</strong> {agreement.landlord.email}</p>
                        <p style="margin: 2px 0;"><strong>Phone:</strong> {agreement.landlord.phone_number or 'N/A'}</p>
                    </div>
                    <div class="card">
                        <h4 style="margin: 0 0 8px 0; color: #334155;">TENANT (Second Party)</h4>
                        <p style="margin: 2px 0;"><strong>Name:</strong> {agreement.tenant.full_name}</p>
                        <p style="margin: 2px 0;"><strong>Email:</strong> {agreement.tenant.email}</p>
                        <p style="margin: 2px 0;"><strong>Phone:</strong> {agreement.tenant.phone_number or 'N/A'}</p>
                    </div>
                </div>

                <div class="card" style="margin-bottom: 32px;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; text-align: center;">
                        <div><p style="color: #64748b; margin: 0 0 4px 0;">Monthly Rent</p><strong>NPR {int(agreement.monthly_rent):,}</strong></div>
                        <div><p style="color: #64748b; margin: 0 0 4px 0;">Security Deposit</p><strong>NPR {int(agreement.security_deposit):,}</strong></div>
                        <div><p style="color: #64748b; margin: 0 0 4px 0;">Term Duration</p><strong>{agreement.start_date} to {agreement.end_date}</strong></div>
                    </div>
                </div>

                <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">Terms and Conditions</h3>
                {clauses_html}

                <div class="grid" style="margin-top: 48px;">
                    {ll_sig_display}
                    {tn_sig_display}
                </div>
            </div>
        </body>
        </html>"""

        return HttpResponse(html, content_type='text/html')
