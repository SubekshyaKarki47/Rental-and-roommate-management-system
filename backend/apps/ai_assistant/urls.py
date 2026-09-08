from django.urls import path
from apps.ai_assistant.views import (
    AISearchParserView,
    AIListingGeneratorView,
    AIRoommateExplainerView,
)

urlpatterns = [
    path('parse-search/', AISearchParserView.as_view(), name='ai-parse-search'),
    path('generate-listing/', AIListingGeneratorView.as_view(), name='ai-generate-listing'),
    path('roommate-explainer/<int:target_user_id>/', AIRoommateExplainerView.as_view(), name='ai-roommate-explainer'),
]
