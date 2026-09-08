from django.urls import path
from apps.expenses.views import (
    ExpenseListCreateView,
    ExpenseDetailView,
    ExpenseDashboardStatsView,
    SettleUpView,
    ExpenseParticipantSettleView,
)

urlpatterns = [
    path('', ExpenseListCreateView.as_view(), name='expense-list-create'),
    path('stats/', ExpenseDashboardStatsView.as_view(), name='expense-stats'),
    path('settle/', SettleUpView.as_view(), name='expense-settle'),
    path('participants/<int:pk>/settle/', ExpenseParticipantSettleView.as_view(), name='participant-settle'),
    path('<int:pk>/', ExpenseDetailView.as_view(), name='expense-detail'),
]
