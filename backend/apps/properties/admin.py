from django.contrib import admin
from .models import Property, PropertyImage, PropertyFavorite


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'landlord', 'area', 'city', 'monthly_rent', 'property_type', 'status', 'is_verified', 'is_featured')
    list_filter = ('status', 'property_type', 'is_verified', 'is_featured', 'city', 'furnishing')
    search_fields = ('title', 'area', 'address', 'landlord__email')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [PropertyImageInline]


@admin.register(PropertyFavorite)
class PropertyFavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'property', 'created_at')
    search_fields = ('user__email', 'property__title')
