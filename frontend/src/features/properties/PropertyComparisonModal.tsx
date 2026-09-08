import React from 'react';
import type { Property } from '../../types/property';
import { X, Check, Minus, Layers, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface PropertyComparisonModalProps {
  properties: Property[];
  onClose: () => void;
  onRemoveProperty: (id: number) => void;
  onSelectProperty: (property: Property) => void;
}

export const PropertyComparisonModal: React.FC<PropertyComparisonModalProps> = ({
  properties,
  onClose,
  onRemoveProperty,
  onSelectProperty,
}) => {
  if (!properties || properties.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-600" />
            <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white">
              Property Comparison Matrix ({properties.length} of 3)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Table */}
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-1/4">
                  Feature
                </th>
                {properties.map((prop) => (
                  <th key={prop.id} className="py-3 px-4 w-1/4">
                    <div className="relative group">
                      <button
                        onClick={() => onRemoveProperty(prop.id)}
                        title="Remove from comparison"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs transition shadow-sm z-10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <img
                        src={prop.primary_image}
                        alt={prop.title}
                        className="w-full h-28 object-cover rounded-xl shadow-sm mb-2"
                      />
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                        {prop.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">{prop.area}, {prop.city}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {/* Monthly Rent */}
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-semibold">
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Monthly Rent</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4 font-extrabold text-brand-600 dark:text-brand-400 text-sm">
                    {formatCurrency(p.monthly_rent)}/mo
                  </td>
                ))}
              </tr>

              {/* Security Deposit */}
              <tr>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">Security Deposit</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    {formatCurrency(p.security_deposit)}
                  </td>
                ))}
              </tr>

              {/* Bedrooms & Bathrooms */}
              <tr>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">Bedrooms / Baths</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    {p.bedrooms} Beds • {p.bathrooms} Bath
                  </td>
                ))}
              </tr>

              {/* Area */}
              <tr>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">Floor Area</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    {p.area_sqft} sq ft
                  </td>
                ))}
              </tr>

              {/* Furnishing */}
              <tr>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">Furnishing</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-slate-800 dark:text-slate-200 font-semibold">
                    {p.furnishing.replace('_', ' ')}
                  </td>
                ))}
              </tr>

              {/* Wi-Fi */}
              <tr>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">Wi-Fi Internet</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4">
                    {p.has_wifi ? (
                      <Check className="w-4 h-4 text-emerald-500 font-bold" />
                    ) : (
                      <Minus className="w-4 h-4 text-slate-400" />
                    )}
                  </td>
                ))}
              </tr>

              {/* Parking */}
              <tr>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">Dedicated Parking</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4">
                    {p.has_parking ? (
                      <Check className="w-4 h-4 text-emerald-500 font-bold" />
                    ) : (
                      <Minus className="w-4 h-4 text-slate-400" />
                    )}
                  </td>
                ))}
              </tr>

              {/* 24h Water */}
              <tr>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">24-Hour Water</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4">
                    {p.has_24h_water ? (
                      <Check className="w-4 h-4 text-emerald-500 font-bold" />
                    ) : (
                      <Minus className="w-4 h-4 text-slate-400" />
                    )}
                  </td>
                ))}
              </tr>

              {/* Power Backup */}
              <tr>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">Electricity Backup</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4">
                    {p.has_electricity_backup ? (
                      <Check className="w-4 h-4 text-emerald-500 font-bold" />
                    ) : (
                      <Minus className="w-4 h-4 text-slate-400" />
                    )}
                  </td>
                ))}
              </tr>

              {/* Pet Policy */}
              <tr>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">Pets Allowed</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4">
                    {p.pets_allowed ? (
                      <Check className="w-4 h-4 text-emerald-500 font-bold" />
                    ) : (
                      <Minus className="w-4 h-4 text-slate-400" />
                    )}
                  </td>
                ))}
              </tr>

              {/* Action row */}
              <tr>
                <td className="py-4 px-4 font-bold text-slate-400">Action</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-4 px-4">
                    <button
                      onClick={() => onSelectProperty(p)}
                      className="w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-1.5 transition"
                    >
                      View Details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
