import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  Printer,
  ShieldCheck,
  PenTool,
  ArrowRight,
} from 'lucide-react';
import { agreementService, type RentalAgreement } from '../../../services/agreementService';
import { api } from '../../../services/api';

interface AgreementsSubviewProps {
  userName?: string;
  onNavigateTab: (tab: string) => void;
}

export const AgreementsSubview: React.FC<AgreementsSubviewProps> = ({
  userName = 'User',
  onNavigateTab,
}) => {
  const [agreements, setAgreements] = useState<RentalAgreement[]>([]);
  const [selectedAgr, setSelectedAgr] = useState<RentalAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [signatureName, setSignatureName] = useState('');
  const [signing, setSigning] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);

  useEffect(() => {
    loadAgreements();
  }, []);

  const loadAgreements = async () => {
    setLoading(true);
    try {
      const data = await agreementService.getAgreements();
      setAgreements(data);
      setSelectedAgr(data[0] || null);
    } catch {
      setAgreements([]);
      setSelectedAgr(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignAgreement = async () => {
    if (!signatureName.trim() || !selectedAgr) return;
    setSigning(true);
    try {
      const response = await agreementService.signAgreement(selectedAgr.id, signatureName.trim());
      const updated = response.agreement as RentalAgreement;
      setSelectedAgr(updated);
      setAgreements((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch {
      setSigning(false);
      return;
    }
    setSignedSuccess(true);
    setSigning(false);
  };

  const handlePrintContract = async () => {
    if (!selectedAgr) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    try {
      const response = await api.get<string>(agreementService.getHtmlUrl(selectedAgr.id), {
        responseType: 'text',
      });
      printWindow.document.open();
      printWindow.document.write(response.data);
      printWindow.document.close();
      printWindow.focus();
      printWindow.onload = () => printWindow.print();
    } catch {
      printWindow.close();
    }
  };

  return (
    <div className="tenant-subview-wrapper">
      {/* Subview Header */}
      <div className="tenant-subview-header">
        <div>
          <h2 className="tenant-subview-title">
            <FileText className="w-6 h-6 text-emerald-600" />
            <span>Digital Lease Agreements</span>
          </h2>
          <p className="tenant-subview-subtitle">
            Review, digitally sign, and download your legally compliant tenancy contracts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintContract}
            disabled={!selectedAgr}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Contract</span>
          </button>
        </div>
      </div>

      {signedSuccess && (
        <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Agreement digitally signed successfully! A copy has been saved to your account.</span>
        </div>
      )}

      {agreements.length > 1 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {agreements.map((agr) => (
            <button
              key={agr.id}
              onClick={() => setSelectedAgr(agr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedAgr?.id === agr.id ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'}`}
            >
              {agr.title}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Loading lease documents...</p>
        </div>
      ) : selectedAgr ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Contract Viewer (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="tenant-content-card">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 flex-wrap gap-2">
                <div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Official Residential Lease
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {selectedAgr.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedAgr.status === 'EXECUTED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {selectedAgr.status === 'EXECUTED' ? '✅ Legally Executed' : '⏳ Pending Tenant Signature'}
                  </span>
                </div>
              </div>

              {/* Property & Parties Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs mb-6">
                <div>
                  <p className="text-slate-400 font-medium">Rental Property:</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedAgr.property_details?.title}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    📍 {selectedAgr.property_details?.area}, {selectedAgr.property_details?.city}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Parties Involved:</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    Landlord: {selectedAgr.landlord?.full_name}
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    Tenant: {selectedAgr.status === 'EXECUTED' ? selectedAgr.tenant?.full_name : 'Pending both signatures'}
                  </p>
                </div>
              </div>

              {/* Key Commercial Terms Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-6">
                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40">
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Monthly Rent</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                    Rs. {selectedAgr.monthly_rent?.toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/40">
                  <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">Deposit</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                    Rs. {selectedAgr.security_deposit?.toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Start Date</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    {selectedAgr.start_date}
                  </p>
                </div>

                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/40">
                  <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Term</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    12 Months
                  </p>
                </div>
              </div>

              {/* Clauses List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Contract Clauses & Provisions
                </h4>

                {selectedAgr.terms_clauses?.map((clause) => (
                  <div
                    key={clause.clause_number}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs"
                  >
                    <span className="font-bold text-slate-900 dark:text-white">
                      Section {clause.clause_number}: {clause.title}
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {clause.body}
                    </p>
                  </div>
                ))}

                {selectedAgr.additional_rules && (
                  <div className="p-3.5 rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-300">
                    <span className="font-bold">Additional Landlord Stipulations:</span>
                    <p className="mt-0.5">{selectedAgr.additional_rules}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signatures & Execution Box (1 Col) */}
          <div className="space-y-6">
            <div className="tenant-content-card">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Signatures & Verification</span>
              </h4>

              {/* Landlord Signature Status */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 mb-4 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">Landlord Signature</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full font-bold">
                    Signed
                  </span>
                </div>
                <p className="text-slate-500 font-mono text-[11px]">
                  {selectedAgr.landlord_signature_data}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Date: {selectedAgr.landlord_signed_at?.slice(0, 10)}
                </span>
              </div>

              {/* Tenant Signature Status */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 mb-4 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">Tenant Signature</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      selectedAgr.tenant_signed
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {selectedAgr.tenant_signed ? 'Signed' : 'Awaiting'}
                  </span>
                </div>

                {selectedAgr.tenant_signed ? (
                  <>
                    <p className="text-slate-500 font-mono text-[11px]">
                      {selectedAgr.tenant_signature_data}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Timestamp: {new Date(selectedAgr.tenant_signed_at || '').toLocaleString()}
                    </span>
                  </>
                ) : (
                  <p className="text-slate-400 text-[11px] italic">
                    You have not yet signed this agreement.
                  </p>
                )}
              </div>

              {/* Signing Box */}
              {!selectedAgr.tenant_signed ? (
                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/50">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 block mb-1">
                    Sign Contract Digitally
                  </span>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Type your legal full name below to certify agreement with all terms and conditions.
                  </p>

                  <input
                    type="text"
                    placeholder={userName && userName !== 'User' ? `e.g. ${userName}` : "e.g. Your Full Legal Name"}
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    className="form-input text-xs mb-3 font-semibold"
                  />

                  <button
                    onClick={handleSignAgreement}
                    disabled={!signatureName.trim() || signing}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{signing ? 'Signing...' : 'Confirm & Sign Agreement'}</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    {selectedAgr.status === 'EXECUTED' ? 'Agreement Fully Executed!' : 'Your Signature Is Recorded'}
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-1 mb-3">
                    {selectedAgr.status === 'EXECUTED'
                      ? 'Both you and the landlord have legally executed this contract.'
                      : 'The agreement is waiting for the landlord to complete their signature.'}
                  </p>
                  {selectedAgr.status === 'EXECUTED' && (
                    <button
                      onClick={() => onNavigateTab('rentals')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm transition"
                    >
                      <span>View Rent Ledger & Payments</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="tenant-content-card text-center py-16">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No rental agreement available</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Your landlord has not created an agreement for you yet.
          </p>
        </div>
      )}
    </div>
  );
};
