import React, { useState } from 'react';
import type { PropertyFilterParams } from '../../types/property';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  LayoutGrid,
  Map as MapIcon,
  X
} from 'lucide-react';

interface PropertySearchFiltersProps {
  filters: PropertyFilterParams;
  onFilterChange: (newFilters: Partial<PropertyFilterParams>) => void;
  onResetFilters: () => void;
  viewMode: 'grid' | 'map' | 'split';
  setViewMode: (mode: 'grid' | 'map' | 'split') => void;
  totalResults: number;
}

const POPULAR_LOCATIONS = [
  'ALL', 'Baneshwor', 'Jhamsikhel', 'Kupondole', 'Patan', 'Baluwatar', 'Koteshwor', 'Bhaktapur'
];

export const PropertySearchFilters: React.FC<PropertySearchFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  viewMode,
  setViewMode,
  totalResults,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search: searchInput });
  };

  return (
    <div className="space-y-4 mb-6">
      
      {/* Top Search & Controls Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by neighborhood, street, or title..."
            className="w-full pl-10 pr-20 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            Search
          </button>
        </form>

        {/* Right Action buttons: Filter drawer, Sort dropdown, and View Mode */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          
          {/* Filter Drawer Toggle */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-sm transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
            <span>Filters</span>
          </button>

          {/* Sort Selector */}
          <select
            value={filters.sort || 'recommended'}
            onChange={(e) => onFilterChange({ sort: e.target.value as any })}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm cursor-pointer"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="lowest_price">Price: Low to High</option>
            <option value="highest_price">Price: High to Low</option>
            <option value="highest_rated">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>

          {/* View Mode Switcher: Grid vs Map */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'grid'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              title="Split map and list view"
              className={`p-1.5 rounded-lg text-xs transition hidden lg:block ${
                viewMode === 'split'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <span className="font-bold text-[11px] px-1">Split</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              title="Full map view"
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'map'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Location Quick-chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 shrink-0">Neighborhoods:</span>
        {POPULAR_LOCATIONS.map((loc) => {
          const isSelected = (filters.location || 'ALL') === loc;
          return (
            <button
              key={loc}
              onClick={() => onFilterChange({ location: loc === 'ALL' ? undefined : loc })}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              {loc === 'ALL' ? 'All Areas' : loc}
            </button>
          );
        })}
      </div>

      {/* Active Results Count & Reset Filter Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
        <span>Showing <strong className="text-slate-900 dark:text-white">{totalResults}</strong> properties</span>
        {(filters.min_price || filters.max_price || filters.bedrooms || filters.property_type || filters.furnishing || filters.wifi || filters.parking || filters.water || filters.location || filters.search) && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline font-semibold"
          >
            <RotateCcw className="w-3 h-3" />
            Reset all filters
          </button>
        )}
      </div>

      {/* Slide-out Filter Drawer Modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slideLeft">
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                  <h3 className="font-bold font-display text-base text-slate-900 dark:text-white">
                    Advanced Filters
                  </h3>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter controls body */}
              <div className="py-6 space-y-6">
                
                {/* Price Range */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Monthly Rent (NPR)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-400">Min Rent (Rs.)</span>
                      <input
                        type="number"
                        step="1000"
                        value={filters.min_price || ''}
                        onChange={(e) => onFilterChange({ min_price: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="0"
                        className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Max Rent (Rs.)</span>
                      <input
                        type="number"
                        step="1000"
                        value={filters.max_price || ''}
                        onChange={(e) => onFilterChange({ max_price: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="50,000"
                        className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Property Type
                  </label>
                  <select
                    value={filters.property_type || 'ALL'}
                    onChange={(e) => onFilterChange({ property_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="ALL">All Types</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="STUDIO">Studio</option>
                    <option value="FLAT">Flat</option>
                    <option value="ROOM">Private Room</option>
                    <option value="HOUSE">House</option>
                    <option value="PENTHOUSE">Penthouse</option>
                  </select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Bedrooms
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['ALL', '1', '2', '3'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => onFilterChange({ bedrooms: item === 'ALL' ? undefined : Number(item) })}
                        className={`py-2 rounded-xl text-xs font-semibold border transition ${
                          (String(filters.bedrooms) === item || (!filters.bedrooms && item === 'ALL'))
                            ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-300'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {item === 'ALL' ? 'Any' : `${item}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Furnishing */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Furnishing Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['ALL', 'FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED'].map((furn) => (
                      <button
                        key={furn}
                        type="button"
                        onClick={() => onFilterChange({ furnishing: furn === 'ALL' ? undefined : furn })}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition ${
                          (filters.furnishing === furn || (!filters.furnishing && furn === 'ALL'))
                            ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-300'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {furn.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Amenities & Features
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'wifi', label: 'High-speed Wi-Fi' },
                      { key: 'parking', label: 'Dedicated Parking (Bike/Car)' },
                      { key: 'water', label: '24-hour Water Supply' },
                      { key: 'kitchen', label: 'Modular Kitchen' },
                      { key: 'balcony', label: 'Sunny Balcony' },
                      { key: 'pets', label: 'Pet Friendly' },
                    ].map((item) => {
                      const isChecked = Boolean((filters as any)[item.key]);
                      return (
                        <label
                          key={item.key}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                        >
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {item.label}
                          </span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => onFilterChange({ [item.key]: e.target.checked || undefined })}
                            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Drawer Bottom Controls */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onResetFilters}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20"
              >
                Show Results
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
