from django.urls import path
from apps.notifications.views import NotificationListView, NotificationMarkReadView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('mark-all-read/', NotificationMarkReadView.as_view(), name='notification-mark-all-read'),
    path('<int:pk>/read/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
]
