from django.urls import path
from apps.rentals.views import (
    LeaseListCreateView,
    LeaseDetailView,
    SimulateRentPaymentView,
    LandlordRentStatsView,
)

urlpatterns = [
    path('leases/', LeaseListCreateView.as_view(), name='lease-list-create'),
    path('leases/<int:pk>/', LeaseDetailView.as_view(), name='lease-detail'),
    path('payments/<int:payment_id>/pay/', SimulateRentPaymentView.as_view(), name='payment-simulate-pay'),
    path('stats/', LandlordRentStatsView.as_view(), name='rent-stats'),
]
