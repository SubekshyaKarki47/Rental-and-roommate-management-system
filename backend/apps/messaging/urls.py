from django.urls import path
from apps.messaging.views import (
    ConversationListView,
    StartConversationView,
    ConversationMessagesView,
    TotalUnreadMessagesView,
)

urlpatterns = [
    path('conversations/', ConversationListView.as_view(), name='conversation-list'),
    path('conversations/start/', StartConversationView.as_view(), name='conversation-start'),
    path('conversations/<int:conversation_id>/messages/', ConversationMessagesView.as_view(), name='conversation-messages'),
    path('unread-count/', TotalUnreadMessagesView.as_view(), name='unread-messages-count'),
]
