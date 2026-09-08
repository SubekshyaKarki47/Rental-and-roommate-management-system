import re
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from apps.users.models import User
from apps.roommates.services.compatibility import calculate_compatibility


class AISearchParserView(APIView):
    """Parses natural language rental queries into structured filter parameters."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        query = request.data.get('query', '').strip().lower()
        if not query:
            return Response({"filters": {}})

        filters = {}

        # Bedrooms detection (e.g. 1bhk, 2 bhk, 3 bedroom, 2 bed)
        bhk_match = re.search(r'(\d+)\s*(bhk|bed|bedroom|rooms?)', query)
        if bhk_match:
            filters['bedrooms'] = int(bhk_match.group(1))

        # Bathrooms detection (e.g. 1 bath, 2 attached)
        bath_match = re.search(r'(\d+)\s*(bath|bathroom|attached)', query)
        if bath_match:
            filters['bathrooms'] = int(bath_match.group(1))

        # Price detection (e.g. under 25000, below 30k, max 20,000, 15000)
        price_k_match = re.search(r'(?:under|below|less than|max|within)?\s*(\d{1,3})\s*k\b', query)
        if price_k_match:
            filters['max_price'] = int(price_k_match.group(1)) * 1000
        else:
            price_match = re.search(r'(?:under|below|less than|max|within|budget of)?\s*(?:npr|rs\.?)?\s*(\d{4,6})', query)
            if price_match:
                filters['max_price'] = int(price_match.group(1))

        # Kathmandu Valley Neighborhoods
        locations = [
            'thamel', 'jhamsikhel', 'patan', 'bakhundole', 'lazimpat', 'baluwatar',
            'baneshwor', 'koteshwor', 'chabahil', 'sanepa', 'kupondole', 'dillibazar',
            'maharajgunj', 'bhaktapur', 'lalitpur', 'kathmandu', 'sitapaila', 'kalanki',
            'naxal', 'budhanilkantha', 'jawalakhel', 'kumaripati', 'pulchowk'
        ]
        for loc in locations:
            if re.search(rf'\b{loc}\b', query):
                filters['city_or_area'] = loc.title()
                break

        # Property type
        if 'apartment' in query or 'flat' in query:
            filters['property_type'] = 'APARTMENT'
        elif 'room' in query or 'single' in query:
            filters['property_type'] = 'SINGLE_ROOM'
        elif 'house' in query or 'villa' in query:
            filters['property_type'] = 'HOUSE'
        elif 'studio' in query:
            filters['property_type'] = 'STUDIO'

        # Amenities
        amenities = []
        amenity_keywords = {
            'wifi': 'High-Speed WiFi',
            'internet': 'High-Speed WiFi',
            'parking': 'Bike & Car Parking',
            'bike': 'Bike Parking',
            'balcony': 'Private Balcony',
            'solar': 'Solar Water Heater',
            'geyser': 'Geyser / Hot Water',
            'water': '24/7 Water Supply',
            'furnished': 'Fully Furnished',
            'rooftop': 'Rooftop Terrace',
            'kitchen': 'Modular Kitchen',
            'inverter': 'Power Backup / Inverter',
            'generator': 'Power Backup / Inverter'
        }
        for kw, amen in amenity_keywords.items():
            if re.search(rf'\b{kw}\b', query) and amen not in amenities:
                amenities.append(amen)

        if amenities:
            filters['amenities'] = amenities

        return Response({
            "query": query,
            "parsed_filters": filters,
            "interpretation": f"Searching for {filters.get('bedrooms', 'any')}-bed in {filters.get('city_or_area', 'Kathmandu Valley')} under NPR {filters.get('max_price', 'any budget'):,}" if filters.get('max_price') else "Parsed search criteria successfully."
        })


class AIListingGeneratorView(APIView):
    """Generates listing descriptions, titles, and price suggestions for landlords."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        title_hint = request.data.get('title', 'Spacious Flat')
        location = request.data.get('city_or_area', 'Kathmandu')
        bedrooms = request.data.get('bedrooms', 2)
        bathrooms = request.data.get('bathrooms', 1)
        furnishing = request.data.get('furnishing_status', 'SEMI_FURNISHED').replace('_', ' ').title()
        rent = request.data.get('rent_amount', 25000)
        amenities = request.data.get('amenities', ['24/7 Water Supply', 'High-Speed WiFi'])

        amenities_str = ", ".join(amenities[:4]) if amenities else "essential utilities"

        catchy_title = f"Modern {bedrooms}BHK {furnishing} Flat in Prime {location}"
        description = (
            f"Step into this bright and well-ventilated {bedrooms}-bedroom, {bathrooms}-bathroom residence "
            f"located in the vibrant neighborhood of {location}. Perfect for students, working professionals, "
            f"or young families seeking quiet residential charm with immediate access to public transit, "
            f"grocery hubs, and cafes.\n\n"
            f"Key Highlights:\n"
            f"• Excellent natural sunlight and peaceful surroundings\n"
            f"• Verified amenities: {amenities_str}\n"
            f"• Dedicated water reservoir and reliable supply\n"
            f"• Clear lease terms with digital payment support on RoomMateHub\n\n"
            f"Schedule a visit or send an application today to secure your new home!"
        )

        market_benchmark = {
            "suggested_range": f"NPR {int(float(rent) * 0.95):,} - NPR {int(float(rent) * 1.1):,}",
            "market_competitiveness": "Well-priced for the current Kathmandu rental index",
            "recommended_deposit": f"NPR {int(float(rent)):,} (1 Month Rent)"
        }

        return Response({
            "generated_title": catchy_title,
            "generated_description": description,
            "market_benchmark": market_benchmark,
        })


class AIRoommateExplainerView(APIView):
    """Provides conversational AI breakdown explaining compatibility between two roommates."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, target_user_id):
        target = get_object_or_404(User, id=target_user_id)
        my_profile = getattr(request.user, 'tenant_profile', None)
        target_profile = getattr(target, 'tenant_profile', None)

        comp = calculate_compatibility(my_profile, target_profile)
        score = comp['score']

        strengths = []
        considerations = []

        for key, item in comp['breakdown'].items():
            if item.get('is_synergy'):
                strengths.append(f"• {item['label']}: {item['description']}")
            elif item['score'] < item['max'] * 0.5:
                considerations.append(f"• {item['label']}: {item['description']}")

        analysis = (
            f"Compatibility Overview ({score}% Match):\n"
            f"{comp['summary']}\n\n"
            f"Shared Synergies:\n" + ("\n".join(strengths[:3]) if strengths else "• Balanced lifestyle baselines\n") + "\n\n"
            f"Points to Discuss:\n" + ("\n".join(considerations[:2]) if considerations else "• Agree on chore sharing and utility bill division.")
        )

        return Response({
            "score": score,
            "summary": comp['summary'],
            "ai_narrative": analysis,
            "breakdown": comp['breakdown']
        })
