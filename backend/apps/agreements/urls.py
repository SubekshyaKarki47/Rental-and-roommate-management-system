from django.urls import path
from apps.agreements.views import (
    AgreementListCreateView,
    AgreementDetailView,
    AgreementSignView,
    AgreementHtmlView,
)

urlpatterns = [
    path('', AgreementListCreateView.as_view(), name='agreement-list-create'),
    path('<int:pk>/', AgreementDetailView.as_view(), name='agreement-detail'),
    path('<int:pk>/sign/', AgreementSignView.as_view(), name='agreement-sign'),
    path('<int:pk>/html/', AgreementHtmlView.as_view(), name='agreement-html-view'),
]
