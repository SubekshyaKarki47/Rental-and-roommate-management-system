import React, { useState, useEffect, useCallback } from 'react';
import type { Property, PropertyFilterParams } from '../../types/property';
import { propertyService } from '../../services/propertyService';
import { useAuth } from '../../context/AuthContext';
import { PropertyCard } from './PropertyCard';
import { PropertySearchFilters } from './PropertySearchFilters';
import { PropertyMap } from './PropertyMap';
import { PropertyDetailModal } from './PropertyDetailModal';
import { PropertyComparisonModal } from './PropertyComparisonModal';
import { ApplyModal } from '../applications/ApplyModal';
import { CreateListingModal } from './CreateListingModal';
import { SavedPropertiesDrawer } from './SavedPropertiesDrawer';
import {
  Building,
  Layers,
  Heart,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const PropertyMarketplace: React.FC = () => {
  const { user, isAuthenticated, setShowAuthModal } = useAuth();

  // State
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & View Mode
  const [filters, setFilters] = useState<PropertyFilterParams>({
    sort: 'recommended',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'split'>('grid');

  // Modals & Selected items
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [applyingProperty, setApplyingProperty] = useState<Property | null>(null);
  const [comparedProperties, setComparedProperties] = useState<Property[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);
  const [showSavedDrawer, setShowSavedDrawer] = useState(false);
  const [favoritesList, setFavoritesList] = useState<Property[]>([]);

  // Fetch properties from backend
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await propertyService.getProperties(filters);
      setProperties(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err: any) {
      setError('Unable to load properties. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch user favorites if authenticated
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoritesList([]);
      return;
    }
    try {
      const favs = await propertyService.getFavorites();
      const favProps = favs.map((f: any) => f.property).filter(Boolean);
      setFavoritesList(favProps);
    } catch (err) {
      console.error('Failed to load favorites', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleFilterChange = (newFilters: Partial<PropertyFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({ sort: 'recommended' });
  };

  const handleToggleFavorite = async (propertyId: number) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    try {
      const res = await propertyService.toggleFavorite(propertyId);
      // Update property in state
      setProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, is_favorited: res.favorited } : p))
      );
      if (selectedProperty && selectedProperty.id === propertyId) {
        setSelectedProperty({ ...selectedProperty, is_favorited: res.favorited });
      }
      fetchFavorites();
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handleToggleCompare = (property: Property) => {
    setComparedProperties((prev) => {
      const exists = prev.some((p) => p.id === property.id);
      if (exists) {
        return prev.filter((p) => p.id !== property.id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 properties at once.');
        return prev;
      }
      return [...prev, property];
    });
  };

  const handleRemoveComparedProperty = (id: number) => {
    setComparedProperties((prev) => prev.filter((p) => p.id !== id));
    if (comparedProperties.length <= 2) {
      setShowComparisonModal(false);
    }
  };

  return (
    <div id="properties" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header bar: Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Real-Time Marketplace
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
            Browse Verified Properties
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Saved properties button */}
          <button
            onClick={() => setShowSavedDrawer(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-sm transition"
          >
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>Saved ({favoritesList.length})</span>
          </button>

          {/* Landlord "List Property" button */}
          {user?.role === 'LANDLORD' ? (
            <button
              onClick={() => setShowCreateListingModal(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              List New Property
            </button>
          ) : (
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setShowAuthModal(true);
                } else {
                  alert('Switch to Landlord role from your account menu to post property listings.');
                }
              }}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition"
            >
              <Building className="w-4 h-4" />
              Post a Listing
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search controls */}
      <PropertySearchFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalResults={totalCount}
      />

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-2" />
          <p className="text-xs font-medium text-slate-500">Loading verified properties...</p>
        </div>
      ) : properties.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <Building className="w-12 h-12 mx-auto stroke-slate-300 dark:stroke-slate-700 mb-3" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">No properties matched your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try adjusting your budget, removing amenities filters, or exploring neighboring areas.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        /* Main View Modes */
        <div>
          {/* 1. Standard Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onViewDetails={(p) => setSelectedProperty(p)}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorited={favoritesList.some((f) => f.id === prop.id) || prop.is_favorited}
                  isCompared={comparedProperties.some((c) => c.id === prop.id)}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
            </div>
          )}

          {/* 2. Full Map View */}
          {viewMode === 'map' && (
            <div className="space-y-4">
              <PropertyMap
                properties={properties}
                selectedProperty={selectedProperty}
                onSelectProperty={(p) => setSelectedProperty(p)}
                className="h-[600px] w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800"
              />
              <p className="text-center text-xs text-slate-400">
                Click any price pin on the map to preview listing details.
              </p>
            </div>
          )}

          {/* 3. Split View (List on left, Leaflet map on right) */}
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[750px] overflow-y-auto pr-2">
                {properties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    onViewDetails={(p) => setSelectedProperty(p)}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorited={favoritesList.some((f) => f.id === prop.id) || prop.is_favorited}
                    isCompared={comparedProperties.some((c) => c.id === prop.id)}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>

              <div className="lg:col-span-5 sticky top-24">
                <PropertyMap
                  properties={properties}
                  selectedProperty={selectedProperty}
                  onSelectProperty={(p) => setSelectedProperty(p)}
                  className="h-[750px] w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sticky Bottom Comparison Drawer/Bar if 2+ properties selected */}
      {comparedProperties.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 animate-slideUp">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-semibold">
              {comparedProperties.length} Properties selected for comparison
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setComparedProperties([])}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>
            <button
              onClick={() => setShowComparisonModal(true)}
              className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Compare Side-by-Side
            </button>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onToggleFavorite={handleToggleFavorite}
        isFavorited={selectedProperty ? (favoritesList.some((f) => f.id === selectedProperty.id) || selectedProperty.is_favorited) : false}
        onApply={(property) => {
          setApplyingProperty(property);
          setSelectedProperty(null);
        }}
      />

      {applyingProperty && (
        <ApplyModal
          property={applyingProperty}
          isOpen
          onClose={() => setApplyingProperty(null)}
          onSuccess={() => setApplyingProperty(null)}
        />
      )}

      {showComparisonModal && (
        <PropertyComparisonModal
          properties={comparedProperties}
          onClose={() => setShowComparisonModal(false)}
          onRemoveProperty={handleRemoveComparedProperty}
          onSelectProperty={(p) => {
            setShowComparisonModal(false);
            setSelectedProperty(p);
          }}
        />
      )}

      <CreateListingModal
        isOpen={showCreateListingModal}
        onClose={() => setShowCreateListingModal(false)}
        onSuccess={(newProp) => {
          setProperties([newProp, ...properties]);
          setSelectedProperty(newProp);
        }}
      />

      <SavedPropertiesDrawer
        isOpen={showSavedDrawer}
        onClose={() => setShowSavedDrawer(false)}
        favorites={favoritesList}
        onRemoveFavorite={handleToggleFavorite}
        onSelectProperty={(p) => setSelectedProperty(p)}
        onOpenComparison={() => {
          setComparedProperties(favoritesList.slice(0, 3));
          setShowComparisonModal(true);
        }}
      />

    </div>
  );
};
