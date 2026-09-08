import { api } from './api';

export interface ParsedSearchResponse {
  query: string;
  parsed_filters: {
    bedrooms?: number;
    bathrooms?: number;
    max_price?: number;
    city_or_area?: string;
    property_type?: string;
    amenities?: string[];
  };
  interpretation: string;
}

export const aiService = {
  async parseSearchQuery(query: string): Promise<ParsedSearchResponse> {
    const res = await api.post<ParsedSearchResponse>('/api/ai/parse-search/', { query });
    return res.data;
  },

  async generateListing(params: {
    title?: string;
    city_or_area?: string;
    bedrooms?: number;
    bathrooms?: number;
    furnishing_status?: string;
    rent_amount?: number;
    amenities?: string[];
  }): Promise<{
    generated_title: string;
    generated_description: string;
    market_benchmark: {
      suggested_range: string;
      market_competitiveness: string;
      recommended_deposit: string;
    };
  }> {
    const res = await api.post('/api/ai/generate-listing/', params);
    return res.data;
  },

  async explainRoommateMatch(targetUserId: number): Promise<{
    score: number;
    summary: string;
    ai_narrative: string;
    breakdown: any;
  }> {
    const res = await api.get(`/api/ai/roommate-explainer/${targetUserId}/`);
    return res.data;
  },
};
