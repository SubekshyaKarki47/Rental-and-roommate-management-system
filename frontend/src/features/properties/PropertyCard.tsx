import React, { useState } from 'react';
import type { Property } from '../../types/property';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Heart,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Star,
  Layers
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface PropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
  onToggleFavorite: (id: number) => void;
  isFavorited?: boolean;
  isCompared?: boolean;
  onToggleCompare?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onViewDetails,
  onToggleFavorite,
  isFavorited = false,
  isCompared = false,
  onToggleCompare,
}) => {
  const { isAuthenticated, setShowAuthModal } = useAuth();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const images = property.images && property.images.length > 0
    ? property.images.map((img) => img.display_url)
    : [property.primary_image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    onToggleFavorite(property.id);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleCompare) {
      onToggleCompare(property);
    }
  };

  return (
    <div
      onClick={() => onViewDetails(property)}
      className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer overflow-hidden relative"
    >
      {/* Image Carousel */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={images[currentImgIndex]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {property.is_verified && (
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Property
            </div>
          )}
          {property.is_featured && (
            <div className="bg-amber-500/95 text-white px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider w-fit shadow-sm">
              Featured
            </div>
          )}
        </div>

        {/* Favorite & Compare buttons on image */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {onToggleCompare && (
            <button
              onClick={handleCompareClick}
              title="Compare property"
              className={`p-2 rounded-full backdrop-blur-md transition shadow-sm ${
                isCompared
                  ? 'bg-brand-600 text-white'
                  : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-brand-600'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleFavoriteClick}
            aria-label="Save to Favorites"
            className="p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-red-500 transition shadow-sm"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isFavorited ? 'fill-red-500 text-red-500' : ''
              }`}
            />
          </button>
        </div>

        {/* Carousel arrows if more than 1 image */}
        {images.length > 1 && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImage}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:bg-white transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:bg-white transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImgIndex ? 'bg-white w-3' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Property type pill */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider">
          {property.property_type}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Location & Rating */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <p className="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span className="truncate">{property.area}, {property.city}</span>
            </p>
            <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{property.rating}</span>
              <span className="text-slate-400 font-normal text-[11px]">({property.total_reviews})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {property.title}
          </h3>

          {/* Specs */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2.5">
            <div className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.bedrooms} Bed{property.bedrooms > 1 ? 's' : ''}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.bathrooms} Bath</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Maximize className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.area_sqft} sqft</span>
            </div>
          </div>

          {/* Furnishing & Amenities snippet */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium">
              {property.furnishing.replace('_', ' ')}
            </span>
            {property.has_wifi && (
              <span className="px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 text-[10px] font-medium">
                Wi-Fi
              </span>
            )}
            {property.has_parking && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium">
                Parking
              </span>
            )}
            {property.has_24h_water && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium">
                24h Water
              </span>
            )}
          </div>
        </div>

        {/* Footer: Price & Details button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(property.monthly_rent)}
            </span>
            <span className="text-xs text-slate-400">/mo</span>
          </div>

          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:underline">
            View Details →
          </span>
        </div>
      </div>
    </div>
  );
};
