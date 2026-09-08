from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, TenantProfile, LandlordProfile
from .serializers import (
    UserRegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer,
    TenantOnboardingSerializer,
    TenantProfileSerializer,
    LandlordProfileSerializer,
)
from .permissions import IsTenant


class CustomTokenObtainPairView(TokenObtainPairView):
    """Obtain JWT tokens with user metadata and role."""
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """Register a new user (Tenant or Landlord) and return tokens immediately."""
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for immediate login
        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['first_name'] = user.first_name
        refresh['last_name'] = user.last_name
        refresh['is_verified'] = user.is_verified

        user_data = UserSerializer(user).data

        return Response({
            'user': user_data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Account created successfully.'
        }, status=status.HTTP_201_CREATED)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """Retrieve or update the authenticated user's profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class TenantOnboardingView(APIView):
    """Submit the tenant onboarding questionnaire."""
    permission_classes = [permissions.IsAuthenticated, IsTenant]

    def get(self, request):
        profile, _ = TenantProfile.objects.get_or_create(user=request.user)
        serializer = TenantProfileSerializer(profile)
        return Response(serializer.data)

    def post(self, request):
        profile, _ = TenantProfile.objects.get_or_create(user=request.user)
        serializer = TenantOnboardingSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'message': 'Onboarding preferences saved successfully.',
            'profile': TenantProfileSerializer(profile).data
        }, status=status.HTTP_200_OK)


class SwitchRoleView(APIView):
    """Allow switching between TENANT and LANDLORD profiles, prohibiting ADMIN escalation."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        target_role = request.data.get('role')
        if target_role not in [User.Role.TENANT, User.Role.LANDLORD]:
            return Response(
                {'error': 'Can only switch between TENANT and LANDLORD roles.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user
        if user.role == target_role:
            return Response({'message': f'Role is already {target_role}.'})

        user.role = target_role
        user.save()

        # Ensure respective profile exists
        if target_role == User.Role.TENANT:
            TenantProfile.objects.get_or_create(user=user)
        elif target_role == User.Role.LANDLORD:
            LandlordProfile.objects.get_or_create(user=user)

        # Refresh token payload
        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['first_name'] = user.first_name
        refresh['last_name'] = user.last_name
        refresh['is_verified'] = user.is_verified

        return Response({
            'message': f'Switched role to {target_role}.',
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
