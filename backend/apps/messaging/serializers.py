from rest_framework import serializers
from apps.messaging.models import Conversation, Message
from apps.users.serializers import UserSerializer
from apps.properties.serializers import PropertyListSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = [
            'id',
            'conversation',
            'sender',
            'content',
            'attachment',
            'is_read',
            'created_at',
        ]
        read_only_fields = ['id', 'conversation', 'sender', 'is_read', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    property_details = PropertyListSerializer(source='property', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id',
            'participants',
            'property',
            'property_details',
            'last_message',
            'unread_count',
            'created_at',
            'updated_at',
        ]

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return {
                'id': last_msg.id,
                'sender_id': last_msg.sender_id,
                'sender_name': last_msg.sender.full_name,
                'content': last_msg.content,
                'created_at': last_msg.created_at,
            }
        return None

    def get_unread_count(self, obj):
        user = self.context.get('request').user if 'request' in self.context else None
        if user and user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=user).count()
        return 0


class SendMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['content', 'attachment']
