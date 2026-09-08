from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.moderation.models import Report
from apps.moderation.serializers import ReportSerializer, CreateReportSerializer
from apps.users.models import User, LandlordProfile
from apps.properties.models import Property
from apps.applications.models import RentalApplication


class IsAdminUserOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_staff or request.user.role == 'ADMIN'))


class ReportCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CreateReportSerializer


class AdminDashboardMetricsView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        total_users = User.objects.count()
        total_tenants = User.objects.filter(role=User.Role.TENANT).count()
        total_landlords = User.objects.filter(role=User.Role.LANDLORD).count()

        total_properties = Property.objects.count()
        active_properties = Property.objects.filter(is_available=True).count()
        verified_properties = Property.objects.filter(is_verified=True).count()

        pending_landlord_verifications = LandlordProfile.objects.filter(
            verification_status=LandlordProfile.VerificationStatus.PENDING
        ).count()

        pending_reports = Report.objects.filter(status=Report.Status.PENDING).count()
        total_applications = RentalApplication.objects.count()

        recent_reports = Report.objects.all().select_related(
            'reporter', 'reported_user', 'reported_property'
        )[:10]

        return Response({
            'metrics': {
                'total_users': total_users,
                'total_tenants': total_tenants,
                'total_landlords': total_landlords,
                'total_properties': total_properties,
                'active_properties': active_properties,
                'verified_properties': verified_properties,
                'pending_verifications': pending_landlord_verifications,
                'pending_reports': pending_reports,
                'total_applications': total_applications,
            },
            'recent_reports': ReportSerializer(recent_reports, many=True).data
        })


class AdminReportActionView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def patch(self, request, pk):
        report = get_object_or_404(Report, pk=pk)
        new_status = request.data.get('status')
        notes = request.data.get('admin_notes', '')

        if new_status:
            report.status = new_status
            if new_status in [Report.Status.RESOLVED, Report.Status.DISMISSED]:
                report.resolved_at = timezone.now()
        if notes:
            report.admin_notes = notes
        report.save()

        return Response(ReportSerializer(report).data)


class AdminVerifyLandlordView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def post(self, request, user_id):
        landlord = get_object_or_404(User, id=user_id, role=User.Role.LANDLORD)
        profile, _ = LandlordProfile.objects.get_or_create(user=landlord)
        profile.verification_status = LandlordProfile.VerificationStatus.VERIFIED
        profile.verified_at = timezone.now()
        profile.save()
        return Response({"detail": f"Landlord {landlord.email} verified successfully."})


class AdminPropertyActionView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def patch(self, request, property_id):
        prop = get_object_or_404(Property, id=property_id)
        if 'is_verified' in request.data:
            prop.is_verified = bool(request.data['is_verified'])
        if 'is_featured' in request.data:
            prop.is_featured = bool(request.data['is_featured'])
        if 'is_available' in request.data:
            prop.is_available = bool(request.data['is_available'])
        prop.save()
        return Response({"detail": f"Property #{prop.id} updated successfully."})
