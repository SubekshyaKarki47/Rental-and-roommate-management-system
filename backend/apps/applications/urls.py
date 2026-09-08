from django.urls import path
from apps.applications.views import (
    ApplicationListCreateView,
    ApplicationDetailView,
    ApplicationWithdrawView,
    ApplicationStatusUpdateView,
    LandlordApplicationStatsView,
)

urlpatterns = [
    path('', ApplicationListCreateView.as_view(), name='application-list-create'),
    path('stats/', LandlordApplicationStatsView.as_view(), name='application-stats'),
    path('<int:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
    path('<int:pk>/withdraw/', ApplicationWithdrawView.as_view(), name='application-withdraw'),
    path('<int:pk>/status/', ApplicationStatusUpdateView.as_view(), name='application-status-update'),
]
