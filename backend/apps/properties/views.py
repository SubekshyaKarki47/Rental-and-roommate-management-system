from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, F
from django.shortcuts import get_object_or_404

from .models import Property, PropertyFavorite
from .serializers import (
    PropertyListSerializer,
    PropertyDetailSerializer,
    PropertyCreateUpdateSerializer,
    PropertyFavoriteSerializer,
)
from apps.users.permissions import IsLandlord, IsAdminUserRole


class PropertyListCreateView(generics.ListCreateAPIView):
    """List properties with search, filtering, and sorting; or create a new property (Landlords)."""

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsLandlord()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PropertyCreateUpdateSerializer
        return PropertyListSerializer

    def get_queryset(self):
        queryset = Property.objects.all().prefetch_related('images')

        # Public viewers only see Active properties
        user = self.request.user
        if not (user.is_authenticated and (user.role == 'ADMIN' or user.is_staff)):
            queryset = queryset.filter(status=Property.Status.ACTIVE)

        # Search query (title, description, area, city, address)
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(area__icontains=search_query) |
                Q(city__icontains=search_query) |
                Q(address__icontains=search_query)
            )

        # Location filter
        location = self.request.query_params.get('location', '').strip()
        if location:
            queryset = queryset.filter(
                Q(area__icontains=location) | Q(city__icontains=location)
            )

        # Price range filter
        min_price = self.request.query_params.get('min_price')
        if min_price:
            queryset = queryset.filter(monthly_rent__gte=min_price)

        max_price = self.request.query_params.get('max_price')
        if max_price:
            queryset = queryset.filter(monthly_rent__lte=max_price)

        # Property type filter
        property_type = self.request.query_params.get('property_type')
        if property_type and property_type != 'ALL':
            queryset = queryset.filter(property_type=property_type)

        # Bedrooms & Bathrooms
        bedrooms = self.request.query_params.get('bedrooms')
        if bedrooms:
            queryset = queryset.filter(bedrooms__gte=bedrooms)

        bathrooms = self.request.query_params.get('bathrooms')
        if bathrooms:
            queryset = queryset.filter(bathrooms__gte=bathrooms)

        # Furnishing
        furnishing = self.request.query_params.get('furnishing')
        if furnishing and furnishing != 'ALL':
            queryset = queryset.filter(furnishing=furnishing)

        # Amenities booleans
        if self.request.query_params.get('wifi') == 'true':
            queryset = queryset.filter(has_wifi=True)
        if self.request.query_params.get('parking') == 'true':
            queryset = queryset.filter(has_parking=True)
        if self.request.query_params.get('water') == 'true':
            queryset = queryset.filter(has_24h_water=True)
        if self.request.query_params.get('kitchen') == 'true':
            queryset = queryset.filter(has_kitchen=True)
        if self.request.query_params.get('pets') == 'true':
            queryset = queryset.filter(pets_allowed=True)
        if self.request.query_params.get('balcony') == 'true':
            queryset = queryset.filter(has_balcony=True)

        # Sorting
        sort = self.request.query_params.get('sort', 'recommended')
        if sort == 'lowest_price':
            queryset = queryset.order_by('monthly_rent')
        elif sort == 'highest_price':
            queryset = queryset.order_by('-monthly_rent')
        elif sort == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort == 'highest_rated':
            queryset = queryset.order_by('-rating', '-total_reviews')
        else:
            queryset = queryset.order_by('-is_featured', '-rating', '-created_at')

        return queryset


class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a property."""
    queryset = Property.objects.all().select_related('landlord', 'landlord__landlord_profile').prefetch_related('images')

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PropertyCreateUpdateSerializer
        return PropertyDetailSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment views counter atomically
        Property.objects.filter(pk=instance.pk).update(views_count=F('views_count') + 1)
        instance.refresh_from_db(fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            if request.user.role != 'ADMIN' and not request.user.is_staff and obj.landlord != request.user:
                self.permission_denied(
                    request,
                    message='You do not have permission to modify this property listing.'
                )


class PropertyFavoriteToggleView(APIView):
    """Toggle a property in the user's saved list."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        property_obj = get_object_or_404(Property, pk=pk)
        fav = PropertyFavorite.objects.filter(user=request.user, property=property_obj).first()

        if fav:
            fav.delete()
            return Response({'favorited': False, 'message': 'Removed from saved properties.'})
        else:
            PropertyFavorite.objects.create(user=request.user, property=property_obj)
            return Response({'favorited': True, 'message': 'Saved to favorites!'})


class PropertyFavoriteListView(generics.ListAPIView):
    """List all properties saved by the authenticated user."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PropertyFavoriteSerializer

    def get_queryset(self):
        return PropertyFavorite.objects.filter(user=self.request.user).select_related('property').prefetch_related('property__images')


class PropertyCompareView(APIView):
    """Fetch 2 to 3 properties side-by-side for comparison matrix."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ids = request.data.get('ids', [])
        if not isinstance(ids, list) or len(ids) < 2 or len(ids) > 3:
            return Response(
                {'error': 'Please select between 2 and 3 properties to compare.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        properties = Property.objects.filter(id__in=ids).prefetch_related('images')
        serializer = PropertyDetailSerializer(properties, many=True, context={'request': request})
        return Response({'properties': serializer.data})


class MyListingsView(generics.ListAPIView):
    """Fetch listings belonging to the authenticated landlord."""
    permission_classes = [permissions.IsAuthenticated, IsLandlord]
    serializer_class = PropertyListSerializer

    def get_queryset(self):
        return Property.objects.filter(landlord=self.request.user).prefetch_related('images')
