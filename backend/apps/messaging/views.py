from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.utils import timezone

from apps.messaging.models import Conversation, Message
from apps.messaging.serializers import (
    ConversationSerializer,
    MessageSerializer,
    SendMessageSerializer,
)
from apps.users.models import User
from apps.properties.models import Property


class ConversationListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ConversationSerializer

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages', 'property')


class StartConversationView(APIView):
    """Start or retrieve an existing conversation between current user and recipient."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        recipient_id = request.data.get('recipient_id')
        property_id = request.data.get('property_id')
        initial_message = request.data.get('message', '').strip()

        if not recipient_id:
            return Response({"detail": "recipient_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        if int(recipient_id) == request.user.id:
            return Response({"detail": "Cannot message yourself."}, status=status.HTTP_400_BAD_REQUEST)

        recipient = get_object_or_404(User, id=recipient_id)
        prop = get_object_or_404(Property, id=property_id) if property_id else None

        # Look for existing conversation with both participants and the same property
        existing_convs = Conversation.objects.filter(participants=request.user).filter(participants=recipient)
        if prop:
            conv = existing_convs.filter(property=prop).first()
        else:
            conv = existing_convs.filter(property__isnull=True).first()

        if not conv:
            conv = Conversation.objects.create(property=prop)
            conv.participants.add(request.user, recipient)

        if initial_message:
            Message.objects.create(
                conversation=conv,
                sender=request.user,
                content=initial_message
            )
            conv.updated_at = timezone.now()
            conv.save()

        serializer = ConversationSerializer(conv, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ConversationMessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, conversation_id):
        conv = get_object_or_404(Conversation, id=conversation_id, participants=request.user)
        # Mark unread messages sent by others as read
        conv.messages.exclude(sender=request.user).filter(is_read=False).update(is_read=True)

        messages = conv.messages.select_related('sender').all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request, conversation_id):
        conv = get_object_or_404(Conversation, id=conversation_id, participants=request.user)
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        msg = Message.objects.create(
            conversation=conv,
            sender=request.user,
            content=serializer.validated_data['content'],
            attachment=serializer.validated_data.get('attachment', None)
        )
        conv.updated_at = timezone.now()
        conv.save()

        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)


class TotalUnreadMessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Message.objects.filter(
            conversation__participants=request.user,
            is_read=False
        ).exclude(sender=request.user).count()
        return Response({"unread_count": count})
