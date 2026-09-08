import React, { useEffect, useRef } from 'react';
import type { Property } from '../../types/property';
import L from 'leaflet';
import { formatCurrency } from '../../lib/utils';

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onSelectProperty: (property: Property) => void;
  className?: string;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  className = 'h-[550px] w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Kathmandu Valley default coordinates
    const defaultCenter: [number, number] = [27.6950, 85.3240];
    const defaultZoom = 13;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: true,
      });

      // Standard OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add custom markers for each property
    properties.forEach((property) => {
      const lat = Number(property.latitude);
      const lng = Number(property.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        // Formatted price pill (e.g. 25k)
        const priceLabel = property.monthly_rent >= 1000
          ? `Rs. ${(property.monthly_rent / 1000).toFixed(0)}k`
          : `Rs. ${property.monthly_rent}`;

        const isSelected = selectedProperty?.id === property.id;

        const customIcon = L.divIcon({
          className: 'custom-property-pin',
          html: `
            <div style="
              background: ${isSelected ? '#7c3aed' : '#ffffff'};
              color: ${isSelected ? '#ffffff' : '#0f172a'};
              padding: 4px 10px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 800;
              box-shadow: 0 4px 12px rgba(0,0,0,0.18);
              border: 1.5px solid ${isSelected ? '#6d28d9' : '#cbd5e1'};
              cursor: pointer;
              white-space: nowrap;
              transform: translate(-50%, -50%);
            ">
              ${priceLabel}
            </div>
          `,
          iconSize: [60, 26],
          iconAnchor: [30, 13],
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        // Popup with preview
        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 max-w-[220px] font-sans';
        popupContent.innerHTML = `
          <img src="${property.primary_image}" alt="${property.title}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />
          <p style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 0; line-height: 1.2;">${property.title}</p>
          <p style="font-size: 11px; color: #64748b; margin: 2px 0 6px 0;">📍 ${property.area}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; font-weight: 800; color: #7c3aed;">${formatCurrency(property.monthly_rent)}/mo</span>
            <span style="font-size: 10px; font-weight: 700; color: #10b981; background: #ecfdf5; padding: 2px 6px; border-radius: 4px;">Verified</span>
          </div>
        `;

        popupContent.onclick = () => {
          onSelectProperty(property);
        };

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          onSelectProperty(property);
        });

        markersRef.current.push(marker);
      }
    });

    // If properties exist, fit bounds
    if (properties.length > 0 && markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.15));
    }

    return () => {
      // Cleanup on unmount handled by ref
    };
  }, [properties, selectedProperty]);

  return (
    <div className={className}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
