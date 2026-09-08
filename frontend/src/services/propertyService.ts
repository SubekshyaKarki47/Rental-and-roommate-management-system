import { api } from './api';
import type { Property, PropertyFilterParams } from '../types/property';

export const propertyService = {
  async getProperties(params: PropertyFilterParams = {}): Promise<{ count: number; results: Property[] }> {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append('search', params.search);
    if (params.location && params.location !== 'ALL') queryParams.append('location', params.location);
    if (params.min_price) queryParams.append('min_price', String(params.min_price));
    if (params.max_price) queryParams.append('max_price', String(params.max_price));
    if (params.property_type && params.property_type !== 'ALL') queryParams.append('property_type', params.property_type);
    if (params.bedrooms && params.bedrooms !== 'ALL') queryParams.append('bedrooms', String(params.bedrooms));
    if (params.bathrooms) queryParams.append('bathrooms', String(params.bathrooms));
    if (params.furnishing && params.furnishing !== 'ALL') queryParams.append('furnishing', params.furnishing);
    if (params.wifi) queryParams.append('wifi', 'true');
    if (params.parking) queryParams.append('parking', 'true');
    if (params.water) queryParams.append('water', 'true');
    if (params.kitchen) queryParams.append('kitchen', 'true');
    if (params.pets) queryParams.append('pets', 'true');
    if (params.balcony) queryParams.append('balcony', 'true');
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.page) queryParams.append('page', String(params.page));

    const res = await api.get(`/api/properties/?${queryParams.toString()}`);
    if (Array.isArray(res.data)) {
      return { count: res.data.length, results: res.data };
    }
    return res.data;
  },

  async getProperty(id: number): Promise<Property> {
    const res = await api.get<Property>(`/api/properties/${id}/`);
    return res.data;
  },

  async createProperty(data: FormData | (Partial<Property> & { image_urls?: string[] })): Promise<Property> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const res = await api.post<Property>('/api/properties/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return res.data;
  },

  async updateProperty(id: number, data: FormData | Partial<Property>): Promise<Property> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const res = await api.patch<Property>(`/api/properties/${id}/`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return res.data;
  },

  async deleteProperty(id: number): Promise<void> {
    await api.delete(`/api/properties/${id}/`);
  },

  async toggleFavorite(id: number): Promise<{ favorited: boolean; message: string }> {
    const res = await api.post(`/api/properties/${id}/favorite/`);
    return res.data;
  },

  async getFavorites(): Promise<any[]> {
    const res = await api.get('/api/properties/favorites/');
    return res.data.results || res.data;
  },

  async compareProperties(ids: number[]): Promise<Property[]> {
    const res = await api.post('/api/properties/compare/', { ids });
    return res.data.properties;
  },

  async getMyListings(): Promise<Property[]> {
    const res = await api.get('/api/properties/my-listings/');
    return res.data.results || res.data;
  }
};
