import React, { useState } from 'react';
import { propertyService } from '../../services/propertyService';
import type { Property } from '../../types/property';
import {
  X,
  Building,
  Plus,
  Trash2
} from 'lucide-react';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProperty: Property) => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('Baneshwor');
  const [city, setCity] = useState('Kathmandu');
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [securityDeposit, setSecurityDeposit] = useState(25000);
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [floor, setFloor] = useState(2);
  const [areaSqft, setAreaSqft] = useState(750);
  const [furnishing, setFurnishing] = useState('FURNISHED');
  const [hasWifi, setHasWifi] = useState(true);
  const [hasParking, setHasParking] = useState(true);
  const [has24hWater, setHas24hWater] = useState(true);
  const [hasElectricityBackup, setHasElectricityBackup] = useState(true);
  const [hasKitchen, setHasKitchen] = useState(true);
  const [hasBalcony, setHasBalcony] = useState(true);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000'
  ]);
  const [currentUrlInput, setCurrentUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddImageUrl = () => {
    if (currentUrlInput.trim()) {
      setImageUrls([...imageUrls, currentUrlInput.trim()]);
      setCurrentUrlInput('');
    }
  };

  const handleRemoveImageUrl = (idx: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: any = {
        title,
        description,
        property_type: propertyType,
        address,
        area,
        city,
        monthly_rent: monthlyRent,
        security_deposit: securityDeposit,
        bedrooms,
        bathrooms,
        floor,
        area_sqft: areaSqft,
        furnishing,
        has_wifi: hasWifi,
        has_parking: hasParking,
        has_24h_water: has24hWater,
        has_electricity_backup: hasElectricityBackup,
        has_kitchen: hasKitchen,
        has_balcony: hasBalcony,
        pets_allowed: petsAllowed,
        smoking_allowed: smokingAllowed,
        image_urls: imageUrls,
      };

      const created = await propertyService.createProperty(payload);
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to publish listing. Please verify all inputs.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-brand-600" />
            <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white">
              Create New Property Listing
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Title & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Listing Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sunny 2BHK Apartment with Balcony"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
              >
                <option value="APARTMENT">Apartment</option>
                <option value="STUDIO">Studio</option>
                <option value="FLAT">Flat</option>
                <option value="ROOM">Private Room</option>
                <option value="HOUSE">House</option>
                <option value="PENTHOUSE">Penthouse</option>
              </select>
            </div>
          </div>

          {/* Location details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Neighborhood / Area</label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Baneshwor"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Kathmandu"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Street Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Shantinagar Chowk"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Rent (Rs.)</label>
              <input
                type="number"
                required
                step="500"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Security Deposit (Rs.)</label>
              <input
                type="number"
                required
                step="500"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Bedrooms</label>
              <input
                type="number"
                min="1"
                max="10"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Bathrooms</label>
              <input
                type="number"
                min="1"
                max="5"
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Floor</label>
              <input
                type="number"
                min="0"
                max="20"
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Area (sqft)</label>
              <input
                type="number"
                min="100"
                value={areaSqft}
                onChange={(e) => setAreaSqft(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Furnishing Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Furnishing Status</label>
            <select
              value={furnishing}
              onChange={(e) => setFurnishing(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
            >
              <option value="FURNISHED">Fully Furnished</option>
              <option value="SEMI_FURNISHED">Semi-Furnished</option>
              <option value="UNFURNISHED">Unfurnished</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the apartment condition, sun direction, nearby amenities, water supply..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Amenities checkboxes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input type="checkbox" checked={hasWifi} onChange={(e) => setHasWifi(e.target.checked)} className="rounded text-brand-600" />
                <span>Wi-Fi Internet</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input type="checkbox" checked={hasParking} onChange={(e) => setHasParking(e.target.checked)} className="rounded text-brand-600" />
                <span>Parking</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input type="checkbox" checked={has24hWater} onChange={(e) => setHas24hWater(e.target.checked)} className="rounded text-brand-600" />
                <span>24h Water</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input type="checkbox" checked={hasElectricityBackup} onChange={(e) => setHasElectricityBackup(e.target.checked)} className="rounded text-brand-600" />
                <span>Power Backup</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input type="checkbox" checked={hasKitchen} onChange={(e) => setHasKitchen(e.target.checked)} className="rounded text-brand-600" />
                <span>Kitchen</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input type="checkbox" checked={hasBalcony} onChange={(e) => setHasBalcony(e.target.checked)} className="rounded text-brand-600" />
                <span>Balcony</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input type="checkbox" checked={petsAllowed} onChange={(e) => setPetsAllowed(e.target.checked)} className="rounded text-brand-600" />
                <span>Pet Friendly</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input type="checkbox" checked={smokingAllowed} onChange={(e) => setSmokingAllowed(e.target.checked)} className="rounded text-brand-600" />
                <span>Smoking Allowed</span>
              </label>
            </div>
          </div>

          {/* Image URLs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Photo URLs</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={currentUrlInput}
                onChange={(e) => setCurrentUrlInput(e.target.value)}
                placeholder="Paste image URL (Unsplash or direct link)..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative group w-16 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImageUrl(idx)}
                    className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Property Listing'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
