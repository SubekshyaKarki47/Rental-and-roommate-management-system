from django.urls import path
from .views import (
    PropertyListCreateView,
    PropertyDetailView,
    PropertyFavoriteToggleView,
    PropertyFavoriteListView,
    PropertyCompareView,
    MyListingsView,
)

urlpatterns = [
    path('', PropertyListCreateView.as_view(), name='property_list_create'),
    path('favorites/', PropertyFavoriteListView.as_view(), name='property_favorites_list'),
    path('compare/', PropertyCompareView.as_view(), name='property_compare'),
    path('my-listings/', MyListingsView.as_view(), name='my_listings'),
    path('<int:pk>/', PropertyDetailView.as_view(), name='property_detail'),
    path('<int:pk>/favorite/', PropertyFavoriteToggleView.as_view(), name='property_favorite_toggle'),
]
