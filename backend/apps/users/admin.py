from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, TenantProfile, LandlordProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_verified', 'is_staff')
    list_filter = ('role', 'is_verified', 'is_staff', 'is_superuser')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone_number', 'avatar')}),
        ('Role & Permissions', {'fields': ('role', 'is_verified', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'role', 'password', 'phone_number'),
        }),
    )
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)


@admin.register(TenantProfile)
class TenantProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'age_range', 'occupation_status', 'min_budget', 'max_budget', 'lifestyle_type', 'is_onboarding_completed')
    list_filter = ('lifestyle_type', 'is_onboarding_completed', 'pets_allowed', 'smoking_preference')
    search_fields = ('user__email', 'university_or_company')


@admin.register(LandlordProfile)
class LandlordProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'business_name', 'verification_status', 'rating', 'total_reviews')
    list_filter = ('verification_status',)
    search_fields = ('user__email', 'business_name')
