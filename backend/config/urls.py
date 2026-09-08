from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/properties/', include('apps.properties.urls')),
    path('api/applications/', include('apps.applications.urls')),
    path('api/roommates/', include('apps.roommates.urls')),
    path('api/messages/', include('apps.messaging.urls')),
    path('api/rentals/', include('apps.rentals.urls')),
    path('api/expenses/', include('apps.expenses.urls')),
    path('api/maintenance/', include('apps.maintenance.urls')),
    path('api/agreements/', include('apps.agreements.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/moderation/', include('apps.moderation.urls')),
    path('api/ai/', include('apps.ai_assistant.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
