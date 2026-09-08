from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count

from apps.maintenance.models import MaintenanceRequest, MaintenanceComment
from apps.maintenance.serializers import (
    MaintenanceRequestSerializer,
    MaintenanceRequestCreateSerializer,
    MaintenanceStatusUpdateSerializer,
    MaintenanceCommentSerializer,
)


class MaintenanceListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MaintenanceRequestCreateSerializer
        return MaintenanceRequestSerializer

    def get_queryset(self):
        user = self.request.user
        qs = MaintenanceRequest.objects.select_related('property', 'tenant').prefetch_related('comments', 'comments__user')

        status_param = self.request.query_params.get('status')
        priority_param = self.request.query_params.get('priority')

        if user.is_staff or user.role == 'ADMIN':
            pass
        elif user.role == 'LANDLORD':
            qs = qs.filter(property__landlord=user)
        else:
            qs = qs.filter(tenant=user)

        if status_param:
            qs = qs.filter(status=status_param.upper())
        if priority_param:
            qs = qs.filter(priority=priority_param.upper())

        return qs


class MaintenanceDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return MaintenanceStatusUpdateSerializer
        return MaintenanceRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role == 'ADMIN':
            return MaintenanceRequest.objects.all()
        return MaintenanceRequest.objects.filter(
            Q(tenant=user) | Q(property__landlord=user)
        )

    def perform_update(self, serializer):
        req = serializer.save()
        if req.status == MaintenanceRequest.Status.RESOLVED and not req.resolved_at:
            req.resolved_at = timezone.now()
            req.save()


class MaintenanceAddCommentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        req = get_object_or_404(
            MaintenanceRequest,
            Q(tenant=user) | Q(property__landlord=user) | Q(tenant__isnull=False),
            pk=pk
        )
        comment_text = request.data.get('comment', '').strip()
        if not comment_text:
            return Response({"detail": "Comment text is required."}, status=status.HTTP_400_BAD_REQUEST)

        comment = MaintenanceComment.objects.create(
            request=req,
            user=user,
            comment=comment_text
        )
        return Response(MaintenanceCommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class MaintenanceStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.is_staff or user.role == 'ADMIN':
            qs = MaintenanceRequest.objects.all()
        elif user.role == 'LANDLORD':
            qs = MaintenanceRequest.objects.filter(property__landlord=user)
        else:
            qs = MaintenanceRequest.objects.filter(tenant=user)

        return Response({
            'total': qs.count(),
            'submitted': qs.filter(status=MaintenanceRequest.Status.SUBMITTED).count(),
            'in_progress': qs.filter(status=MaintenanceRequest.Status.IN_PROGRESS).count(),
            'resolved': qs.filter(status=MaintenanceRequest.Status.RESOLVED).count(),
            'emergency': qs.filter(priority=MaintenanceRequest.Priority.EMERGENCY).count(),
        })
