import React, { useState, useRef } from 'react';
import { propertyService } from '../../services/propertyService';
import type { Property } from '../../types/property';
import {
  X,
  Building,
  UploadCloud,
  Trash2,
  Star,
  AlertCircle,
} from 'lucide-react';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProperty: Property) => void;
}

interface UploadedPhoto {
  id: string;
  file?: File;
  previewUrl: string;
  name: string;
  size: number;
  format: 'JPEG' | 'PNG' | 'SVG' | 'WEBP' | 'IMAGE';
  isPrimary: boolean;
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

  // File Upload State (JPEG, PNG, SVG, WEBP)
  const [photos, setPhotos] = useState<UploadedPhoto[]>([
    {
      id: 'default-demo-photo',
      previewUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000',
      name: 'apartment-living-room.jpg',
      size: 1024 * 1024 * 1.2,
      format: 'JPEG',
      isPrimary: true,
    },
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFiles = (fileList: FileList | File[]) => {
    setError(null);
    const files = Array.from(fileList);

    files.forEach((file) => {
      // Validate supported formats: JPEG, PNG, SVG, WEBP
      const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
      const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
      const isJpg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');
      const isWebp = file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');

      if (!isSvg && !isPng && !isJpg && !isWebp) {
        setError(`"${file.name}" is not a valid format. Please upload JPEG, PNG, or SVG.`);
        return;
      }

      if (file.size > 15 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the maximum allowed file size of 15MB.`);
        return;
      }

      const format: UploadedPhoto['format'] = isSvg ? 'SVG' : isPng ? 'PNG' : isWebp ? 'WEBP' : 'JPEG';
      const reader = new FileReader();

      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        setPhotos((prev) => {
          // If previous photos only had the initial demo photo, replace it
          const cleaned = prev.filter((p) => p.id !== 'default-demo-photo');
          return [
            ...cleaned,
            {
              id: Math.random().toString(36).substring(2, 9),
              file,
              previewUrl,
              name: file.name,
              size: file.size,
              format,
              isPrimary: cleaned.length === 0,
            },
          ];
        });
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (remaining.length > 0 && !remaining.some((p) => p.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
  };

  const handleSetPrimary = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        isPrimary: p.id === id,
      }))
    );
  };

  const handleAddManualUrl = () => {
    if (manualUrlInput.trim()) {
      setPhotos((prev) => [
        ...prev.filter((p) => p.id !== 'default-demo-photo'),
        {
          id: Math.random().toString(36).substring(2, 9),
          previewUrl: manualUrlInput.trim(),
          name: 'Web Image Link',
          size: 0,
          format: 'IMAGE',
          isPrimary: prev.length === 0,
        },
      ]);
      setManualUrlInput('');
      setShowUrlFallback(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (photos.length === 0) {
      setError('Please upload at least one photo (JPEG, PNG, or SVG) of the property.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('property_type', propertyType);
      formData.append('address', address);
      formData.append('area', area);
      formData.append('city', city);
      formData.append('monthly_rent', String(monthlyRent));
      formData.append('security_deposit', String(securityDeposit));
      formData.append('bedrooms', String(bedrooms));
      formData.append('bathrooms', String(bathrooms));
      formData.append('floor', String(floor));
      formData.append('area_sqft', String(areaSqft));
      formData.append('furnishing', furnishing);
      formData.append('has_wifi', String(hasWifi));
      formData.append('has_parking', String(hasParking));
      formData.append('has_24h_water', String(has24hWater));
      formData.append('has_electricity_backup', String(hasElectricityBackup));
      formData.append('has_kitchen', String(hasKitchen));
      formData.append('has_balcony', String(hasBalcony));
      formData.append('pets_allowed', String(petsAllowed));
      formData.append('smoking_allowed', String(smokingAllowed));

      // Append primary photo first, then remaining photos
      const sortedPhotos = [...photos].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
      sortedPhotos.forEach((item) => {
        if (item.file) {
          formData.append('images', item.file);
        } else if (item.previewUrl) {
          formData.append('image_urls', item.previewUrl);
        }
      });

      const created = await propertyService.createProperty(formData);
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to publish listing. Please check the property details and photos.'
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
            <Building className="w-5 h-5 text-amber-600" />
            <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white">
              Create New Property Listing
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1">
              General Information
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Property Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Spacious 2BHK Apartment with Balcony"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="APARTMENT">Apartment</option>
                  <option value="FLAT">Full Flat</option>
                  <option value="STUDIO">Studio Room</option>
                  <option value="ROOM">Single Room</option>
                  <option value="HOUSE">Independent House</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Furnishing Status
                </label>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="FURNISHED">Fully Furnished</option>
                  <option value="SEMI_FURNISHED">Semi-Furnished</option>
                  <option value="UNFURNISHED">Unfurnished</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the layout, neighborhood convenience, sunny exposure, water supply, etc."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section: Location & Financials */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1">
              Location & Pricing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Neighborhood / Area
                </label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Baneshwor"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Kathmandu"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Shantinagar Gate 2"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Rent (Rs.)
                </label>
                <input
                  type="number"
                  required
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Security Deposit (Rs.)
                </label>
                <input
                  type="number"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Area (sq. ft.)
                </label>
                <input
                  type="number"
                  value={areaSqft}
                  min={50}
                  onChange={(e) => setAreaSqft(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  value={bedrooms}
                  min={1}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  value={bathrooms}
                  min={1}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Floor
                </label>
                <input
                  type="number"
                  value={floor}
                  min={0}
                  onChange={(e) => setFloor(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Amenities */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1">
              Included Amenities & House Rules
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer bg-slate-50/50 dark:bg-slate-800/40">
                <input type="checkbox" checked={hasWifi} onChange={(e) => setHasWifi(e.target.checked)} className="rounded text-amber-600 focus:ring-amber-500" />
                <span>Wi-Fi Internet</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer bg-slate-50/50 dark:bg-slate-800/40">
                <input type="checkbox" checked={hasParking} onChange={(e) => setHasParking(e.target.checked)} className="rounded text-amber-600 focus:ring-amber-500" />
                <span>Bike/Car Parking</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer bg-slate-50/50 dark:bg-slate-800/40">
                <input type="checkbox" checked={has24hWater} onChange={(e) => setHas24hWater(e.target.checked)} className="rounded text-amber-600 focus:ring-amber-500" />
                <span>24h Water Supply</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer bg-slate-50/50 dark:bg-slate-800/40">
                <input type="checkbox" checked={hasElectricityBackup} onChange={(e) => setHasElectricityBackup(e.target.checked)} className="rounded text-amber-600 focus:ring-amber-500" />
                <span>Inverter Backup</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer bg-slate-50/50 dark:bg-slate-800/40">
                <input type="checkbox" checked={hasKitchen} onChange={(e) => setHasKitchen(e.target.checked)} className="rounded text-amber-600 focus:ring-amber-500" />
                <span>Modular Kitchen</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer bg-slate-50/50 dark:bg-slate-800/40">
                <input type="checkbox" checked={hasBalcony} onChange={(e) => setHasBalcony(e.target.checked)} className="rounded text-amber-600 focus:ring-amber-500" />
                <span>Balcony</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer bg-slate-50/50 dark:bg-slate-800/40">
                <input type="checkbox" checked={petsAllowed} onChange={(e) => setPetsAllowed(e.target.checked)} className="rounded text-amber-600 focus:ring-amber-500" />
                <span>Pet Friendly</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer bg-slate-50/50 dark:bg-slate-800/40">
                <input type="checkbox" checked={smokingAllowed} onChange={(e) => setSmokingAllowed(e.target.checked)} className="rounded text-amber-600 focus:ring-amber-500" />
                <span>Smoking Allowed</span>
              </label>
            </div>
          </div>

          {/* Section: Apartment Photos Upload (File formats: JPEG, PNG, SVG) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Apartment Photos (JPEG, PNG, SVG)
              </h3>
              <span className="text-[11px] font-semibold text-amber-600">
                {photos.length} {photos.length === 1 ? 'photo' : 'photos'} added
              </span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/svg+xml,image/webp,.jpeg,.jpg,.png,.svg,.webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 scale-[1.01]'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-amber-500'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-3 shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Click to browse or drag and drop photos
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Accepted file formats: <strong className="text-slate-600 dark:text-slate-300">JPEG, PNG, SVG, WEBP</strong> (Up to 15MB each)
              </p>
            </div>

            {/* Photo Previews Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className={`relative rounded-2xl overflow-hidden border p-1 bg-white dark:bg-slate-800 flex flex-col justify-between shadow-xs transition group ${
                      p.isPrimary
                        ? 'border-amber-500 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <img
                        src={p.previewUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Format Badge */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider bg-slate-900/80 text-white backdrop-blur-xs">
                        {p.format}
                      </span>

                      {/* Cover Photo Indicator */}
                      {p.isPrimary && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white flex items-center gap-1 shadow-sm">
                          <Star className="w-2.5 h-2.5 fill-white" /> COVER
                        </span>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto(p.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-1.5 px-2 flex items-center justify-between text-[11px]">
                      <span className="truncate max-w-[110px] text-slate-600 dark:text-slate-300 font-medium">
                        {p.name}
                      </span>
                      {p.size > 0 && (
                        <span className="text-slate-400 text-[10px]">
                          {formatFileSize(p.size)}
                        </span>
                      )}
                    </div>

                    {!p.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(p.id)}
                        className="w-full py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition text-center"
                      >
                        Set as Cover Photo
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Optional Fallback Link Accordion */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowUrlFallback(!showUrlFallback)}
                className="text-xs font-semibold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition"
              >
                {showUrlFallback ? '− Hide web link option' : '+ Or add via image web link'}
              </button>

              {showUrlFallback && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="url"
                    value={manualUrlInput}
                    onChange={(e) => setManualUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualUrl}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-bold shrink-0"
                  >
                    Add Link
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 disabled:opacity-50 transition active:scale-95"
            >
              {isSubmitting ? 'Publishing Listing...' : 'Publish Property Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
