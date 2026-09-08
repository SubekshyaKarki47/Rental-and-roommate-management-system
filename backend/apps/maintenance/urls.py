from django.urls import path
from apps.maintenance.views import (
    MaintenanceListCreateView,
    MaintenanceDetailView,
    MaintenanceAddCommentView,
    MaintenanceStatsView,
)

urlpatterns = [
    path('', MaintenanceListCreateView.as_view(), name='maintenance-list-create'),
    path('stats/', MaintenanceStatsView.as_view(), name='maintenance-stats'),
    path('<int:pk>/', MaintenanceDetailView.as_view(), name='maintenance-detail'),
    path('<int:pk>/comment/', MaintenanceAddCommentView.as_view(), name='maintenance-add-comment'),
]
