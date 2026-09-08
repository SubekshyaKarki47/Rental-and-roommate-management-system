from rest_framework import serializers
from apps.roommates.models import RoommateMatch
from apps.users.models import User, TenantProfile
from apps.users.serializers import UserSerializer, TenantProfileSerializer


class RoommateMatchSerializer(serializers.ModelSerializer):
    requester = UserSerializer(read_only=True)
    target_user = UserSerializer(read_only=True)

    class Meta:
        model = RoommateMatch
        fields = [
            'id',
            'requester',
            'target_user',
            'status',
            'compatibility_score',
            'match_notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'requester', 'created_at', 'updated_at']


class RoommateProfileDiscoverySerializer(serializers.ModelSerializer):
    tenant_profile = TenantProfileSerializer(read_only=True)
    bio = serializers.CharField(source='tenant_profile.bio', read_only=True, default='')
    compatibility = serializers.SerializerMethodField()
    connection_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'avatar',
            'bio',
            'phone_number',
            'tenant_profile',
            'compatibility',
            'connection_status',
        ]

    def get_compatibility(self, obj):
        # Precalculated in view context or computed on the fly
        precalc = self.context.get('compatibility_map', {}).get(obj.id)
        if precalc:
            return precalc
        return {"score": 75, "summary": "Compatible", "breakdown": {}}

    def get_connection_status(self, obj):
        # Returns current relationship status: None, 'SENT', 'RECEIVED', 'ACCEPTED'
        return self.context.get('connection_status_map', {}).get(obj.id, None)
