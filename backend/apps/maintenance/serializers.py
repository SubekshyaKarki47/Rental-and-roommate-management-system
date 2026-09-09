from rest_framework import serializers
from apps.maintenance.models import MaintenanceRequest, MaintenanceComment
from apps.users.serializers import UserSerializer
from apps.properties.serializers import PropertyListSerializer


class MaintenanceCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = MaintenanceComment
        fields = ['id', 'user', 'comment', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class MaintenanceRequestSerializer(serializers.ModelSerializer):
    tenant = UserSerializer(read_only=True)
    property_details = PropertyListSerializer(source='property', read_only=True)
    comments = MaintenanceCommentSerializer(many=True, read_only=True)

    class Meta:
        model = MaintenanceRequest
        fields = [
            'id',
            'property',
            'property_details',
            'tenant',
            'title',
            'description',
            'category',
            'priority',
            'status',
            'photo',
            'resolution_notes',
            'resolved_at',
            'comments',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'tenant', 'resolved_at', 'created_at', 'updated_at']


class MaintenanceRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRequest
        fields = [
            'id',
            'property',
            'title',
            'description',
            'category',
            'priority',
            'photo',
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        user = self.context['request'].user
        return MaintenanceRequest.objects.create(tenant=user, **validated_data)


class MaintenanceStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRequest
        fields = ['status', 'resolution_notes']

    def to_internal_value(self, data):
        data = data.copy()
        if 'status' in data and isinstance(data['status'], str):
            val = data['status'].upper()
            if val == 'OPEN':
                data['status'] = MaintenanceRequest.Status.SUBMITTED
            elif val in dict(MaintenanceRequest.Status.choices):
                data['status'] = val
        return super().to_internal_value(data)
