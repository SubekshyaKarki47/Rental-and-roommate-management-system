from rest_framework import serializers
from apps.moderation.models import Report
from apps.users.serializers import UserSerializer
from apps.properties.serializers import PropertyListSerializer


class ReportSerializer(serializers.ModelSerializer):
    reporter = UserSerializer(read_only=True)
    reported_user_details = UserSerializer(source='reported_user', read_only=True)
    reported_property_details = PropertyListSerializer(source='reported_property', read_only=True)

    class Meta:
        model = Report
        fields = [
            'id',
            'reporter',
            'reported_user',
            'reported_user_details',
            'reported_property',
            'reported_property_details',
            'reason',
            'details',
            'status',
            'admin_notes',
            'resolved_at',
            'created_at',
        ]
        read_only_fields = ['id', 'reporter', 'resolved_at', 'created_at']


class CreateReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            'reported_user',
            'reported_property',
            'reason',
            'details',
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        return Report.objects.create(reporter=user, **validated_data)
