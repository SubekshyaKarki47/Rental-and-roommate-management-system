from rest_framework import permissions
from .models import User


class IsTenant(permissions.BasePermission):
    """Allows access only to authenticated users with TENANT role."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == User.Role.TENANT
        )


class IsLandlord(permissions.BasePermission):
    """Allows access only to authenticated users with LANDLORD role."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == User.Role.LANDLORD
        )


class IsAdminUserRole(permissions.BasePermission):
    """Allows access only to authenticated users with ADMIN role or staff status."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == User.Role.ADMIN or request.user.is_staff or request.user.is_superuser)
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allows access only to object owners or platform admins."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == User.Role.ADMIN or request.user.is_staff:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user
