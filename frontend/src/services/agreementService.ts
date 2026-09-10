import { api } from './api';

export interface AgreementClause {
  clause_number: number;
  title: string;
  body: string;
}

export interface RentalAgreement {
  id: number;
  property: number;
  property_details: {
    id: number;
    title: string;
    city: string;
    area: string;
    monthly_rent: number;
  };
  landlord: {
    id: number;
    full_name: string;
    email: string;
    phone_number?: string;
  };
  tenant: {
    id: number;
    full_name: string;
    email: string;
    phone_number?: string;
  };
  title: string;
  monthly_rent: number;
  security_deposit: number;
  start_date: string;
  end_date: string;
  terms_clauses: AgreementClause[];
  additional_rules?: string;
  status: 'DRAFT' | 'PENDING_SIGNATURES' | 'EXECUTED' | 'TERMINATED';
  landlord_signed: boolean;
  landlord_signature_data?: string;
  landlord_signed_at?: string;
  tenant_signed: boolean;
  tenant_signature_data?: string;
  tenant_signed_at?: string;
  executed_at?: string;
  created_at: string;
}

export const agreementService = {
  async getAgreements(): Promise<RentalAgreement[]> {
    const res = await api.get<RentalAgreement[] | { results: RentalAgreement[] }>('/api/agreements/');
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  },

  async getAgreement(id: number): Promise<RentalAgreement> {
    const res = await api.get<RentalAgreement>(`/api/agreements/${id}/`);
    return res.data;
  },

  async createAgreement(data: {
    property: number;
    tenant: number;
    title: string;
    monthly_rent: number;
    security_deposit: number;
    start_date: string;
    end_date: string;
    additional_rules?: string;
  }): Promise<RentalAgreement> {
    const res = await api.post<RentalAgreement>('/api/agreements/', data);
    return res.data;
  },

  async signAgreement(id: number, signatureData: string): Promise<{ detail: string; agreement: RentalAgreement }> {
    const res = await api.post<{ detail: string; agreement: RentalAgreement }>(`/api/agreements/${id}/sign/`, { signature_data: signatureData });
    return res.data;
  },

  getHtmlUrl(id: number): string {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    return `${baseUrl}/api/agreements/${id}/html/`;
  },
};
