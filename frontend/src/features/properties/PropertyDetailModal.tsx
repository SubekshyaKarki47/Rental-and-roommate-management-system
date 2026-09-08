import React, { useState } from 'react';
import type { Property } from '../../types/property';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  MapPin,
  Bed,
  Bath,
  Maximize,
  CheckCircle2,
  Heart,
  Share2,
  Send,
  Star,
  ShieldCheck,
  Clock,
  Sparkles,
  Wifi,
  Car,
  Droplets,
  Zap,
  Utensils,
  Sun
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onToggleFavorite: (id: number) => void;
  isFavorited?: boolean;
  onApply?: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onToggleFavorite,
  isFavorited = false,
  onApply,
}) => {
  const { isAuthenticated, setShowAuthModal } = useAuth();
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  if (!property) return null;

  const images = property.images && property.images.length > 0
    ? property.images.map((img) => img.display_url)
    : [property.primary_image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000'];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleContactLandlord = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setContactSuccess(true);
    setTimeout(() => setContactSuccess(false), 3000);
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (onApply) {
      onApply(property);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Sticky Header with Title & Action icons */}
        <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 truncate">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300">
              {property.property_type}
            </span>
            <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white truncate">
              {property.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              title="Share property"
              className="p-2 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1"
            >
              <Share2 className="w-4 h-4" />
              {copiedShare && <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>}
            </button>

            <button
              onClick={() => onToggleFavorite(property.id)}
              aria-label="Save property"
              className="p-2 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-500 transition"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            </button>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* 1. Image Gallery (Large Hero + Thumbnails) */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md">
              <img
                src={images[selectedImgIndex]}
                alt={property.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              {property.is_verified && (
                <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Verified Listing
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                      idx === selectedImgIndex
                        ? 'border-brand-600 ring-2 ring-brand-500/40'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Key Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="p-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bedrooms</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5 flex items-center justify-center gap-1.5">
                <Bed className="w-4 h-4 text-brand-600" />
                {property.bedrooms} Bed{property.bedrooms > 1 ? 's' : ''}
              </p>
            </div>
            <div className="p-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bathrooms</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5 flex items-center justify-center gap-1.5">
                <Bath className="w-4 h-4 text-brand-600" />
                {property.bathrooms} Bath
              </p>
            </div>
            <div className="p-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Living Area</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5 flex items-center justify-center gap-1.5">
                <Maximize className="w-4 h-4 text-brand-600" />
                {property.area_sqft} sqft
              </p>
            </div>
            <div className="p-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Furnishing</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {property.furnishing.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* 3. Rent & Financial Breakdown */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Rental & Financial Terms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
                <span className="text-xs text-slate-500">Monthly Rent</span>
                <p className="text-xl font-extrabold text-brand-600 dark:text-brand-400 mt-1">
                  {formatCurrency(property.monthly_rent)}
                </p>
                <span className="text-[11px] text-slate-400">Due 1st of each month</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
                <span className="text-xs text-slate-500">Security Deposit</span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(property.security_deposit)}
                </p>
                <span className="text-[11px] text-slate-400">100% Refundable</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
                <span className="text-xs text-slate-500">Minimum Lease</span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {property.minimum_stay_months || 6} Months
                </p>
                <span className="text-[11px] text-slate-400">Standard tenancy contract</span>
              </div>
            </div>
          </div>

          {/* 4. Description */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
              About this living space
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* 5. Amenities Checklist */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Included Amenities & Perks
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${property.has_wifi ? 'border-brand-500/40 bg-brand-50/40 dark:bg-brand-950/30 text-slate-800 dark:text-slate-200' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                <Wifi className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-semibold">High-speed Wi-Fi</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${property.has_parking ? 'border-brand-500/40 bg-brand-50/40 dark:bg-brand-950/30 text-slate-800 dark:text-slate-200' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                <Car className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-semibold">Vehicle Parking</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${property.has_24h_water ? 'border-brand-500/40 bg-brand-50/40 dark:bg-brand-950/30 text-slate-800 dark:text-slate-200' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                <Droplets className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-semibold">24-Hour Water</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${property.has_electricity_backup ? 'border-brand-500/40 bg-brand-50/40 dark:bg-brand-950/30 text-slate-800 dark:text-slate-200' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold">Power Inverter Backup</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${property.has_kitchen ? 'border-brand-500/40 bg-brand-50/40 dark:bg-brand-950/30 text-slate-800 dark:text-slate-200' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                <Utensils className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-semibold">Modular Kitchen</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${property.has_balcony ? 'border-brand-500/40 bg-brand-50/40 dark:bg-brand-950/30 text-slate-800 dark:text-slate-200' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold">Sunny Balcony</span>
              </div>
            </div>
          </div>

          {/* 6. Landlord Profile Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
                {property.landlord?.first_name ? property.landlord.first_name[0] : 'L'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {property.landlord ? `${property.landlord.first_name} ${property.landlord.last_name}` : 'Verified Landlord'}
                  </h4>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xs text-slate-500">{property.landlord?.business_name || 'Property Owner'}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Replies within {property.landlord?.response_time_minutes || 60} min
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-amber-500">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {property.landlord?.rating || 4.9} ({property.landlord?.total_reviews || 15} reviews)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleContactLandlord}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition shrink-0"
            >
              {contactSuccess ? 'Inquiry Sent! ✓' : 'Contact Landlord'}
            </button>
          </div>

          {/* Approximate Location notice per Section 10 & Section 47 */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Approximate Location: {property.area}, {property.city}</p>
              <p className="mt-0.5 text-amber-700/80 dark:text-amber-300/80 text-[11px]">
                To protect resident privacy, exact house number and building entrance are provided once an application is approved by the landlord.
              </p>
            </div>
          </div>

        </div>

        {/* Sticky Footer with Booking & Apply Actions */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
          <div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(property.monthly_rent)}
            </span>
            <span className="text-xs text-slate-400"> /month</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleContactLandlord}
              className="hidden sm:flex px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
            >
              Ask Question
            </button>

            <button
              onClick={handleApplyClick}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition flex items-center gap-2 active:scale-95"
            >
              <Send className="w-4 h-4" />
              Apply for this Property
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
