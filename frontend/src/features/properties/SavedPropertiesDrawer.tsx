import React from 'react';
import type { Property } from '../../types/property';
import { X, Heart, Trash2, ArrowRight, Layers } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface SavedPropertiesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Property[];
  onRemoveFavorite: (id: number) => void;
  onSelectProperty: (property: Property) => void;
  onOpenComparison: () => void;
}

export const SavedPropertiesDrawer: React.FC<SavedPropertiesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onSelectProperty,
  onOpenComparison,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slideLeft">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <h3 className="font-bold font-display text-base text-slate-900 dark:text-white">
                Saved Properties ({favorites.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of saved properties */}
          <div className="py-4 space-y-3">
            {favorites.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Heart className="w-10 h-10 mx-auto stroke-slate-300 dark:stroke-slate-700 mb-2" />
                <p className="text-sm font-semibold">No saved properties yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click the heart icon on any listing to save it for later review or comparison.
                </p>
              </div>
            ) : (
              favorites.map((prop) => (
                <div
                  key={prop.id}
                  className="flex gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-brand-500/40 bg-slate-50/50 dark:bg-slate-800/40 transition group"
                >
                  <img
                    src={prop.primary_image}
                    alt={prop.title}
                    className="w-20 h-20 object-cover rounded-xl shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4
                        onClick={() => { onSelectProperty(prop); onClose(); }}
                        className="font-bold text-xs text-slate-900 dark:text-white truncate cursor-pointer hover:text-brand-600"
                      >
                        {prop.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">📍 {prop.area}, {prop.city}</p>
                      <p className="text-xs font-extrabold text-brand-600 dark:text-brand-400 mt-1">
                        {formatCurrency(prop.monthly_rent)}/mo
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => onRemoveFavorite(prop.id)}
                        className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                      <button
                        onClick={() => { onSelectProperty(prop); onClose(); }}
                        className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-0.5 hover:underline"
                      >
                        View
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer actions */}
        {favorites.length >= 2 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => { onClose(); onOpenComparison(); }}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition"
            >
              <Layers className="w-4 h-4" />
              Compare Saved Properties Side-by-Side
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
