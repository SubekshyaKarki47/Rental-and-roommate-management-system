"""
Deterministic 10-Factor Roommate Compatibility Calculator
Scores between 0 and 100 based on lifestyle, habits, budget, and location harmony.
"""
from typing import Dict, Any


def calculate_compatibility(profile_a, profile_b) -> Dict[str, Any]:
    if not profile_a or not profile_b:
        return {
            "score": 50,
            "summary": "Partial profile data available.",
            "breakdown": {}
        }

    score = 0
    breakdown = {}

    # 1. Cleanliness (Weight: 15)
    c_a, c_b = profile_a.cleanliness_level, profile_b.cleanliness_level
    if c_a == c_b:
        clean_pts = 15
        clean_desc = "Identical cleanliness expectations"
    elif 'MODERATE' in (c_a, c_b):
        clean_pts = 10
        clean_desc = "Compatible cleanliness habits"
    else:
        clean_pts = 3
        clean_desc = "Divergent cleanliness habits (Relaxed vs Very Clean)"
    score += clean_pts
    breakdown["cleanliness"] = {
        "score": clean_pts,
        "max": 15,
        "label": "Cleanliness & Organization",
        "description": clean_desc,
        "a_value": c_a,
        "b_value": c_b,
        "is_synergy": clean_pts >= 10
    }

    # 2. Smoking Compatibility (Weight: 15)
    s_a, s_b = profile_a.smoking_preference, profile_b.smoking_preference
    if s_a == s_b:
        smoke_pts = 15
        smoke_desc = "Aligned smoking policy (" + ("Smoker" if s_a else "Non-smoker") + ")"
    else:
        smoke_pts = 0
        smoke_desc = "Smoking habit mismatch (potential conflict)"
    score += smoke_pts
    breakdown["smoking"] = {
        "score": smoke_pts,
        "max": 15,
        "label": "Smoking Preference",
        "description": smoke_desc,
        "a_value": "Smoker" if s_a else "Non-Smoker",
        "b_value": "Smoker" if s_b else "Non-Smoker",
        "is_synergy": smoke_pts == 15
    }

    # 3. Sleep Schedule (Weight: 12)
    sl_a, sl_b = profile_a.sleep_schedule, profile_b.sleep_schedule
    if sl_a == sl_b:
        sleep_pts = 12
        sleep_desc = f"Synchronized circadian rhythm ({sl_a})"
    elif sl_a == 'FLEXIBLE' or sl_b == 'FLEXIBLE':
        sleep_pts = 9
        sleep_desc = "Flexible sleep schedule adapts well"
    else:
        sleep_pts = 2
        sleep_desc = "Opposite sleep hours (Early Bird vs Night Owl)"
    score += sleep_pts
    breakdown["sleep"] = {
        "score": sleep_pts,
        "max": 12,
        "label": "Sleep & Quiet Hours",
        "description": sleep_desc,
        "a_value": sl_a,
        "b_value": sl_b,
        "is_synergy": sleep_pts >= 9
    }

    # 4. Lifestyle / Social Energy (Weight: 12)
    l_a, l_b = profile_a.lifestyle_type, profile_b.lifestyle_type
    if l_a == l_b:
        life_pts = 12
        life_desc = f"Matching social rhythm ({l_a})"
    elif l_a == 'FLEXIBLE' or l_b == 'FLEXIBLE':
        life_pts = 9
        life_desc = "Adaptable social energy"
    else:
        life_pts = 3
        life_desc = "Quiet study vibe vs Lively social vibe"
    score += life_pts
    breakdown["lifestyle"] = {
        "score": life_pts,
        "max": 12,
        "label": "Social & Host Lifestyle",
        "description": life_desc,
        "a_value": l_a,
        "b_value": l_b,
        "is_synergy": life_pts >= 9
    }

    # 5. Pet Compatibility (Weight: 12)
    p_a, p_b = profile_a.pets_allowed, profile_b.pets_allowed
    if p_a == p_b:
        pet_pts = 12
        pet_desc = "Both agree on pets (" + ("Pet-friendly" if p_a else "No pets preferred") + ")"
    elif p_a or p_b:
        pet_pts = 4
        pet_desc = "One prefers pets, one prefers pet-free environment"
    else:
        pet_pts = 12
        pet_desc = "Both comfortable without pets"
    score += pet_pts
    breakdown["pets"] = {
        "score": pet_pts,
        "max": 12,
        "label": "Pet Friendliness",
        "description": pet_desc,
        "a_value": "Pet-friendly" if p_a else "No pets",
        "b_value": "Pet-friendly" if p_b else "No pets",
        "is_synergy": pet_pts >= 10
    }

    # 6. Budget Overlap (Weight: 12)
    min_a, max_a = float(profile_a.min_budget), float(profile_a.max_budget)
    min_b, max_b = float(profile_b.min_budget), float(profile_b.max_budget)
    overlap_min = max(min_a, min_b)
    overlap_max = min(max_a, max_b)

    if overlap_min <= overlap_max:
        budget_pts = 12
        budget_desc = f"Harmonious budget range overlap (NPR {int(overlap_min):,} - {int(overlap_max):,})"
    else:
        gap = overlap_min - overlap_max
        if gap <= 5000:
            budget_pts = 6
            budget_desc = "Close budgets with minor NPR gap"
        else:
            budget_pts = 1
            budget_desc = "Discrepant monthly rent budgets"
    score += budget_pts
    breakdown["budget"] = {
        "score": budget_pts,
        "max": 12,
        "label": "Budget Compatibility",
        "description": budget_desc,
        "a_value": f"NPR {int(min_a):,} - {int(max_a):,}",
        "b_value": f"NPR {int(min_b):,} - {int(max_b):,}",
        "is_synergy": budget_pts >= 10
    }

    # 7. Location Overlap (Weight: 10)
    locs_a = set(loc.lower().strip() for loc in (profile_a.preferred_locations or []))
    locs_b = set(loc.lower().strip() for loc in (profile_b.preferred_locations or []))
    common_locs = locs_a.intersection(locs_b)

    if common_locs:
        loc_pts = 10
        loc_desc = f"Shared target neighborhoods: {', '.join([l.title() for l in list(common_locs)[:3]])}"
    elif not locs_a or not locs_b:
        loc_pts = 6
        loc_desc = "Flexible location preferences"
    else:
        loc_pts = 3
        loc_desc = "Different preferred areas in Kathmandu Valley"
    score += loc_pts
    breakdown["location"] = {
        "score": loc_pts,
        "max": 10,
        "label": "Neighborhood Preference",
        "description": loc_desc,
        "a_value": [l.title() for l in profile_a.preferred_locations or []],
        "b_value": [l.title() for l in profile_b.preferred_locations or []],
        "is_synergy": loc_pts >= 8
    }

    # 8. Furnishing Preference (Weight: 4)
    f_a, f_b = profile_a.furnishing_preference, profile_b.furnishing_preference
    if f_a == f_b or f_a == 'ANY' or f_b == 'ANY':
        furn_pts = 4
        furn_desc = "Aligned interior furnishing preferences"
    else:
        furn_pts = 2
        furn_desc = "Distinct furnishing setup expectations"
    score += furn_pts
    breakdown["furnishing"] = {
        "score": furn_pts,
        "max": 4,
        "label": "Furnishing Preference",
        "description": furn_desc,
        "a_value": f_a,
        "b_value": f_b,
        "is_synergy": furn_pts == 4
    }

    # 9. Bedroom Count Compatibility (Weight: 4)
    b_a, b_b = profile_a.bedrooms_preferred, profile_b.bedrooms_preferred
    diff = abs(b_a - b_b)
    if diff == 0:
        bed_pts = 4
        bed_desc = f"Both seeking {b_a}-bedroom flat setup"
    elif diff == 1:
        bed_pts = 3
        bed_desc = "Complementary bedroom preferences"
    else:
        bed_pts = 1
        bed_desc = "Substantial room size/count difference"
    score += bed_pts
    breakdown["bedrooms"] = {
        "score": bed_pts,
        "max": 4,
        "label": "Layout & Space Needs",
        "description": bed_desc,
        "a_value": f"{b_a} Bed",
        "b_value": f"{b_b} Bed",
        "is_synergy": bed_pts >= 3
    }

    # 10. Occupation / Routine Harmony (Weight: 4)
    occ_a = (profile_a.occupation_status or '').lower()
    occ_b = (profile_b.occupation_status or '').lower()
    both_student = 'student' in occ_a and 'student' in occ_b
    both_working = any(w in occ_a for w in ['engineer', 'dev', 'analyst', 'employed', 'officer']) and \
                 any(w in occ_b for w in ['engineer', 'dev', 'analyst', 'employed', 'officer'])
    if both_student or both_working:
        occ_pts = 4
        occ_desc = "Shared routine and day-to-day work rhythm"
    else:
        occ_pts = 3
        occ_desc = "Complementary daily schedules"
    score += occ_pts
    breakdown["occupation"] = {
        "score": occ_pts,
        "max": 4,
        "label": "Schedule & Occupation Harmony",
        "description": occ_desc,
        "a_value": profile_a.occupation_status or 'Not specified',
        "b_value": profile_b.occupation_status or 'Not specified',
        "is_synergy": True
    }

    # Summary generator
    if score >= 85:
        summary = "Exceptional compatibility! Highly aligned lifestyles, budget, and habits."
    elif score >= 70:
        summary = "Great match. Minor differences that can be easily coordinated."
    elif score >= 55:
        summary = "Moderate compatibility. Discuss quiet hours and household expectations."
    else:
        summary = "Lower compatibility. Lifestyle habits and schedules may require compromise."

    return {
        "score": min(100, max(0, score)),
        "summary": summary,
        "breakdown": breakdown
    }
