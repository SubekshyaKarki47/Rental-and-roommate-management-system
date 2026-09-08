from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User
from apps.messaging.models import Conversation, Message


class MessagingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.u1 = User.objects.create_user(email='msg1@nepal.com', password='Password123!', role=User.Role.TENANT, first_name='Suman')
        self.u2 = User.objects.create_user(email='msg2@nepal.com', password='Password123!', role=User.Role.LANDLORD, first_name='Pradip')

    def test_start_conversation_and_send_message(self):
        self.client.force_authenticate(user=self.u1)
        res = self.client.post(reverse('conversation-start'), {
            'recipient_id': self.u2.id,
            'message': 'Hello, is the flat still available?'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        conv_id = res.data['id']

        # u2 checks unread messages count
        self.client.force_authenticate(user=self.u2)
        unread_res = self.client.get(reverse('unread-messages-count'))
        self.assertEqual(unread_res.data['unread_count'], 1)

        # u2 opens conversation -> marks as read
        messages_url = reverse('conversation-messages', kwargs={'conversation_id': conv_id})
        msgs_res = self.client.get(messages_url)
        self.assertEqual(msgs_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(msgs_res.data), 1)

        unread_res_after = self.client.get(reverse('unread-messages-count'))
        self.assertEqual(unread_res_after.data['unread_count'], 0)
