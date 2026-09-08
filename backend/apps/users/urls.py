from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    CurrentUserView,
    TenantOnboardingView,
    SwitchRoleView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('onboarding/', TenantOnboardingView.as_view(), name='tenant_onboarding'),
    path('switch-role/', SwitchRoleView.as_view(), name='switch_role'),
]
