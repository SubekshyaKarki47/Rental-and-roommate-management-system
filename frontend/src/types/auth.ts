export type UserRole = 'TENANT' | 'LANDLORD' | 'ADMIN';

export interface TenantProfile {
  id: number;
  age_range?: string;
  occupation_status?: string;
  university_or_company?: string;
  preferred_locations: string[];
  min_budget: number;
  max_budget: number;
  preferred_move_in_date?: string;
  bedrooms_preferred: number;
  furnishing_preference: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED' | 'ANY';
  lifestyle_type: 'QUIET' | 'SOCIAL' | 'FLEXIBLE';
  pets_allowed: boolean;
  smoking_preference: boolean;
  cleanliness_level: 'VERY_CLEAN' | 'MODERATE' | 'RELAXED';
  sleep_schedule: 'EARLY_BIRD' | 'NIGHT_OWL' | 'FLEXIBLE';
  bio?: string;
  is_onboarding_completed: boolean;
}

export interface LandlordProfile {
  id: number;
  business_name?: string;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  response_time_minutes: number;
  rating: number;
  total_reviews: number;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  role: UserRole;
  phone_number?: string;
  avatar?: string;
  is_verified: boolean;
  is_staff?: boolean;
  tenant_profile?: TenantProfile;
  landlord_profile?: LandlordProfile;
  has_completed_onboarding?: boolean;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
  message?: string;
}

export interface TenantOnboardingPayload {
  age_range: string;
  occupation_status: string;
  university_or_company: string;
  preferred_locations: string[];
  min_budget: number;
  max_budget: number;
  preferred_move_in_date?: string;
  bedrooms_preferred: number;
  furnishing_preference: string;
  lifestyle_type: string;
  pets_allowed: boolean;
  smoking_preference: boolean;
  cleanliness_level: string;
  sleep_schedule: string;
  bio?: string;
}
