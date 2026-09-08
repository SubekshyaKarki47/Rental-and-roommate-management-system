export type PropertyType = 'APARTMENT' | 'STUDIO' | 'FLAT' | 'ROOM' | 'HOUSE' | 'PENTHOUSE';
export type FurnishingType = 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';
export type PropertyStatus = 'DRAFT' | 'PENDING_VERIFICATION' | 'ACTIVE' | 'RENTED' | 'SUSPENDED' | 'ARCHIVED';

export interface PropertyImage {
  id: number;
  image_url?: string;
  image?: string;
  display_url: string;
  caption?: string;
  is_primary: boolean;
  order: number;
}

export interface PropertyLandlord {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  business_name?: string;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  response_time_minutes: number;
  rating: number;
  total_reviews: number;
}

export interface Property {
  id: number;
  title: string;
  slug: string;
  description?: string;
  property_type: PropertyType;
  address: string;
  area: string;
  city: string;
  latitude: number | string;
  longitude: number | string;
  monthly_rent: number;
  security_deposit: number;
  utilities_included?: string[];
  additional_fees?: number;
  minimum_stay_months?: number;
  available_from?: string;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  area_sqft: number;
  furnishing: FurnishingType;
  has_wifi: boolean;
  has_parking: boolean;
  has_24h_water: boolean;
  has_electricity_backup: boolean;
  has_kitchen: boolean;
  has_washing_machine: boolean;
  has_balcony: boolean;
  has_elevator: boolean;
  has_cctv?: boolean;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  gender_preference?: string;
  status: PropertyStatus;
  is_verified: boolean;
  is_featured: boolean;
  views_count?: number;
  rating: number;
  total_reviews: number;
  primary_image: string;
  images: PropertyImage[];
  is_favorited?: boolean;
  landlord?: PropertyLandlord;
  created_at: string;
  updated_at?: string;
}

export interface PropertyFilterParams {
  search?: string;
  location?: string;
  min_price?: number | string;
  max_price?: number | string;
  property_type?: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  furnishing?: string;
  wifi?: boolean;
  parking?: boolean;
  water?: boolean;
  kitchen?: boolean;
  pets?: boolean;
  balcony?: boolean;
  sort?: 'recommended' | 'lowest_price' | 'highest_price' | 'newest' | 'highest_rated';
  page?: number;
}
