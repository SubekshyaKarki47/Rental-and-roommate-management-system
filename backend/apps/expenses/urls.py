from django.urls import path
from apps.expenses.views import (
    ExpenseListCreateView,
    ExpenseDetailView,
    ExpenseDashboardStatsView,
    SettleUpView,
)

urlpatterns = [
    path('', ExpenseListCreateView.as_view(), name='expense-list-create'),
    path('stats/', ExpenseDashboardStatsView.as_view(), name='expense-stats'),
    path('settle/', SettleUpView.as_view(), name='expense-settle'),
    path('<int:pk>/', ExpenseDetailView.as_view(), name='expense-detail'),
]
