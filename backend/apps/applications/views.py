from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404

from apps.applications.models import RentalApplication
from apps.applications.serializers import (
    RentalApplicationSerializer,
    RentalApplicationCreateSerializer,
    RentalApplicationStatusUpdateSerializer,
)
from apps.properties.models import Property


class ApplicationListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RentalApplicationCreateSerializer
        return RentalApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = RentalApplication.objects.select_related(
            'tenant', 'tenant__tenant_profile', 'property', 'property__landlord'
        ).prefetch_related('property__images')

        # Filter by query params if provided
        status_filter = self.request.query_params.get('status')
        property_id = self.request.query_params.get('property_id')

        if user.is_staff or user.role == 'ADMIN':
            pass
        elif user.role == 'LANDLORD':
            queryset = queryset.filter(property__landlord=user)
        else:
            # Default to tenant's own applications
            queryset = queryset.filter(tenant=user)

        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())
        if property_id:
            queryset = queryset.filter(property_id=property_id)

        return queryset


class ApplicationDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RentalApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role == 'ADMIN':
            return RentalApplication.objects.all()
        # Tenant can see their own; Landlord can see their property's applications
        return RentalApplication.objects.filter(
            Q(tenant=user) | Q(property__landlord=user)
        )


class ApplicationWithdrawView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        app = get_object_or_404(RentalApplication, pk=pk, tenant=request.user)
        if app.status != RentalApplication.Status.PENDING:
            return Response(
                {"detail": f"Cannot withdraw an application with status {app.status}."},
                status=status.HTTP_400_BAD_REQUEST
            )
        app.status = RentalApplication.Status.WITHDRAWN
        app.save()
        return Response({"detail": "Application successfully withdrawn.", "status": app.status})


class ApplicationStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        user = request.user
        if user.is_staff or user.role == 'ADMIN':
            app = get_object_or_404(RentalApplication, pk=pk)
        else:
            app = get_object_or_404(RentalApplication, pk=pk, property__landlord=user)

        serializer = RentalApplicationStatusUpdateSerializer(app, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Return full updated application
        full_serializer = RentalApplicationSerializer(app)
        return Response(full_serializer.data)


class LandlordApplicationStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'LANDLORD' and not user.is_staff and user.role != 'ADMIN':
            return Response({"detail": "Only landlords or admins can access application stats."}, status=status.HTTP_403_FORBIDDEN)

        landlord_properties = Property.objects.filter(landlord=user)
        total_properties = landlord_properties.count()
        apps = RentalApplication.objects.filter(property__landlord=user)

        stats = {
            "total_applications": apps.count(),
            "pending_applications": apps.filter(status=RentalApplication.Status.PENDING).count(),
            "approved_applications": apps.filter(status=RentalApplication.Status.APPROVED).count(),
            "rejected_applications": apps.filter(status=RentalApplication.Status.REJECTED).count(),
            "total_properties": total_properties,
            "property_breakdown": [
                {
                    "property_id": prop.id,
                    "title": prop.title,
                    "total_apps": apps.filter(property=prop).count(),
                    "pending_apps": apps.filter(property=prop, status=RentalApplication.Status.PENDING).count()
                }
                for prop in landlord_properties
            ]
        }
        return Response(stats)
