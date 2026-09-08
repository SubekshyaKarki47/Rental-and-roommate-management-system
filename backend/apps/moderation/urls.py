from django.urls import path
from apps.moderation.views import (
    ReportCreateView,
    AdminDashboardMetricsView,
    AdminReportActionView,
    AdminVerifyLandlordView,
    AdminPropertyActionView,
)

urlpatterns = [
    path('reports/', ReportCreateView.as_view(), name='report-create'),
    path('admin/metrics/', AdminDashboardMetricsView.as_view(), name='admin-metrics'),
    path('admin/reports/<int:pk>/', AdminReportActionView.as_view(), name='admin-report-action'),
    path('admin/landlords/<int:user_id>/verify/', AdminVerifyLandlordView.as_view(), name='admin-verify-landlord'),
    path('admin/properties/<int:property_id>/action/', AdminPropertyActionView.as_view(), name='admin-property-action'),
]
