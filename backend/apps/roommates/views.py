from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.shortcuts import get_object_or_404

from apps.users.models import User, TenantProfile
from apps.roommates.models import RoommateMatch
from apps.roommates.services.compatibility import calculate_compatibility
from apps.roommates.serializers import (
    RoommateMatchSerializer,
    RoommateProfileDiscoverySerializer,
)


class RoommateDiscoveryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        my_profile = getattr(user, 'tenant_profile', None)

        # Retrieve eligible users: tenants, exclude current user
        qs = User.objects.filter(role=User.Role.TENANT).exclude(id=user.id).select_related('tenant_profile')

        # Filter out blocked users
        blocked_ids = RoommateMatch.objects.filter(
            Q(requester=user, status=RoommateMatch.Status.BLOCKED) |
            Q(target_user=user, status=RoommateMatch.Status.BLOCKED)
        ).values_list('requester_id', 'target_user_id')
        blocked_flat = {uid for pair in blocked_ids for uid in pair if uid != user.id}
        if blocked_flat:
            qs = qs.exclude(id__in=blocked_flat)

        # Filters from query params
        lifestyle = request.query_params.get('lifestyle')
        if lifestyle:
            qs = qs.filter(tenant_profile__lifestyle_type=lifestyle.upper())

        cleanliness = request.query_params.get('cleanliness')
        if cleanliness:
            qs = qs.filter(tenant_profile__cleanliness_level=cleanliness.upper())

        sleep = request.query_params.get('sleep')
        if sleep:
            qs = qs.filter(tenant_profile__sleep_schedule=sleep.upper())

        pets = request.query_params.get('pets')
        if pets is not None:
            qs = qs.filter(tenant_profile__pets_allowed=(pets.lower() == 'true'))

        smoking = request.query_params.get('smoking')
        if smoking is not None:
            qs = qs.filter(tenant_profile__smoking_preference=(smoking.lower() == 'true'))

        location = request.query_params.get('location')
        if location:
            qs = qs.filter(tenant_profile__preferred_locations__icontains=location)

        min_score = request.query_params.get('min_score')
        min_score_val = int(min_score) if min_score and min_score.isdigit() else 0

        # Existing connection / request statuses
        sent_matches = dict(RoommateMatch.objects.filter(requester=user).values_list('target_user_id', 'status'))
        received_matches = dict(RoommateMatch.objects.filter(target_user=user).values_list('requester_id', 'status'))

        connection_status_map = {}
        for other_id in qs.values_list('id', flat=True):
            if sent_matches.get(other_id) == RoommateMatch.Status.ACCEPTED or received_matches.get(other_id) == RoommateMatch.Status.ACCEPTED:
                connection_status_map[other_id] = 'CONNECTED'
            elif other_id in sent_matches:
                connection_status_map[other_id] = f"SENT_{sent_matches[other_id]}"
            elif other_id in received_matches:
                connection_status_map[other_id] = f"RECEIVED_{received_matches[other_id]}"

        # Calculate compatibility for each candidate
        candidates = list(qs)
        compatibility_map = {}
        scored_candidates = []

        for candidate in candidates:
            c_profile = getattr(candidate, 'tenant_profile', None)
            comp_res = calculate_compatibility(my_profile, c_profile)
            if comp_res['score'] >= min_score_val:
                compatibility_map[candidate.id] = comp_res
                scored_candidates.append((candidate, comp_res['score']))

        # Sort descending by compatibility score
        scored_candidates.sort(key=lambda x: x[1], reverse=True)
        final_candidates = [c[0] for c in scored_candidates]

        serializer = RoommateProfileDiscoverySerializer(
            final_candidates,
            many=True,
            context={
                'request': request,
                'compatibility_map': compatibility_map,
                'connection_status_map': connection_status_map,
            }
        )
        return Response(serializer.data)


class RoommateRequestView(APIView):
    """Send connection request or swipe right on a roommate."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        target_user_id = request.data.get('target_user_id')
        if not target_user_id:
            return Response({"detail": "target_user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        if int(target_user_id) == request.user.id:
            return Response({"detail": "You cannot connect with yourself."}, status=status.HTTP_400_BAD_REQUEST)

        target_user = get_object_or_404(User, id=target_user_id)

        # Check if reciprocal request exists
        reciprocal = RoommateMatch.objects.filter(
            requester=target_user,
            target_user=request.user
        ).first()

        # Calculate compatibility
        my_profile = getattr(request.user, 'tenant_profile', None)
        target_profile = getattr(target_user, 'tenant_profile', None)
        comp = calculate_compatibility(my_profile, target_profile)

        if reciprocal:
            if reciprocal.status == RoommateMatch.Status.PENDING:
                # Instant mutual match!
                reciprocal.status = RoommateMatch.Status.ACCEPTED
                reciprocal.compatibility_score = comp['score']
                reciprocal.match_notes = comp
                reciprocal.save()

                match, _ = RoommateMatch.objects.update_or_create(
                    requester=request.user,
                    target_user=target_user,
                    defaults={
                        'status': RoommateMatch.Status.ACCEPTED,
                        'compatibility_score': comp['score'],
                        'match_notes': comp,
                    }
                )
                return Response({
                    "detail": "It's a Match! You both connected.",
                    "status": "ACCEPTED",
                    "match": RoommateMatchSerializer(match).data
                })

        # Otherwise create / update pending request
        match, created = RoommateMatch.objects.update_or_create(
            requester=request.user,
            target_user=target_user,
            defaults={
                'status': RoommateMatch.Status.PENDING,
                'compatibility_score': comp['score'],
                'match_notes': comp,
            }
        )
        return Response({
            "detail": "Roommate connection request sent.",
            "status": match.status,
            "match": RoommateMatchSerializer(match).data
        })


class RoommateRespondView(APIView):
    """Accept, decline, or block a roommate match."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, match_id):
        new_status = request.data.get('status', '').upper()
        if new_status not in [RoommateMatch.Status.ACCEPTED, RoommateMatch.Status.DECLINED, RoommateMatch.Status.BLOCKED]:
            return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)

        match = get_object_or_404(RoommateMatch, id=match_id, target_user=request.user)
        match.status = new_status
        match.save()

        # If accepted, make sure reverse match is also accepted
        if new_status == RoommateMatch.Status.ACCEPTED:
            RoommateMatch.objects.update_or_create(
                requester=request.user,
                target_user=match.requester,
                defaults={
                    'status': RoommateMatch.Status.ACCEPTED,
                    'compatibility_score': match.compatibility_score,
                    'match_notes': match.match_notes,
                }
            )

        return Response({
            "detail": f"Request {new_status.lower()}.",
            "match": RoommateMatchSerializer(match).data
        })


class RoommateConnectionsView(APIView):
    """List connected roommates and pending requests."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        connected = RoommateMatch.objects.filter(
            requester=user,
            status=RoommateMatch.Status.ACCEPTED
        ).select_related('target_user', 'target_user__tenant_profile')

        pending_received = RoommateMatch.objects.filter(
            target_user=user,
            status=RoommateMatch.Status.PENDING
        ).select_related('requester', 'requester__tenant_profile')

        pending_sent = RoommateMatch.objects.filter(
            requester=user,
            status=RoommateMatch.Status.PENDING
        ).select_related('target_user', 'target_user__tenant_profile')

        return Response({
            "connections": RoommateMatchSerializer(connected, many=True).data,
            "pending_received": RoommateMatchSerializer(pending_received, many=True).data,
            "pending_sent": RoommateMatchSerializer(pending_sent, many=True).data,
        })


class RoommateCompatibilityDetailView(APIView):
    """Get full itemized 10-factor breakdown between current user and target user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, target_user_id):
        target = get_object_or_404(User, id=target_user_id)
        my_profile = getattr(request.user, 'tenant_profile', None)
        target_profile = getattr(target, 'tenant_profile', None)

        result = calculate_compatibility(my_profile, target_profile)
        result['target_user'] = {
            "id": target.id,
            "full_name": target.full_name,
            "email": target.email,
            "avatar": target.avatar.url if target.avatar else None,
            "occupation": getattr(target_profile, 'occupation_status', ''),
            "university_or_company": getattr(target_profile, 'university_or_company', ''),
        }
        return Response(result)
