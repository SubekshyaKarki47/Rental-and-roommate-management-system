from django.urls import path
from apps.roommates.views import (
    RoommateDiscoveryView,
    RoommateRequestView,
    RoommateRespondView,
    RoommateConnectionsView,
    RoommateCompatibilityDetailView,
)

urlpatterns = [
    path('discover/', RoommateDiscoveryView.as_view(), name='roommate-discover'),
    path('request/', RoommateRequestView.as_view(), name='roommate-request'),
    path('respond/<int:match_id>/', RoommateRespondView.as_view(), name='roommate-respond'),
    path('connections/', RoommateConnectionsView.as_view(), name='roommate-connections'),
    path('<int:target_user_id>/compatibility/', RoommateCompatibilityDetailView.as_view(), name='roommate-compatibility-detail'),
]
