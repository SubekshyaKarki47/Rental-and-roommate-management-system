import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Wand2,
  Check,
  Copy,
  X,
  Loader2,
} from 'lucide-react';
import { aiService, type ParsedSearchResponse } from '../../services/aiService';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters?: (filters: any) => void;
  userRole?: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  userRole: _userRole = 'TENANT',
}) => {
  const [activeTab, setActiveTab] = useState<'SEARCH' | 'LISTING'>('SEARCH');

  // Search parser state
  const [naturalQuery, setNaturalQuery] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedSearchResponse | null>(null);

  // Listing generator state
  const [titleHint, setTitleHint] = useState('');
  const [areaHint, setAreaHint] = useState('Jhamsikhel');
  const [bedroomsHint, setBedroomsHint] = useState(2);
  const [bathroomsHint, setBathroomsHint] = useState(1);
  const [rentHint, setRentHint] = useState(28000);
  const [generating, setGenerating] = useState(false);
  const [generatedListing, setGeneratedListing] = useState<{
    generated_title: string;
    generated_description: string;
    market_benchmark: any;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleParseSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalQuery.trim()) return;

    setParsing(true);
    try {
      const res = await aiService.parseSearchQuery(naturalQuery);
      setParsedResult(res);
    } catch (err) {
      alert('Failed to parse search query.');
    } finally {
      setParsing(false);
    }
  };

  const handleGenerateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await aiService.generateListing({
        title: titleHint || undefined,
        city_or_area: areaHint,
        bedrooms: bedroomsHint,
        bathrooms: bathroomsHint,
        rent_amount: rentHint,
      });
      setGeneratedListing(res);
    } catch (err) {
      alert('Failed to generate listing.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                RoomMateHub AI Assistant
              </h3>
              <p className="text-xs text-slate-500">
                Natural language rental search and intelligent landlord copywriter
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={() => setActiveTab('SEARCH')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'SEARCH'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50'
            }`}
          >
            Smart Rental Search
          </button>
          <button
            onClick={() => setActiveTab('LISTING')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'LISTING'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50'
            }`}
          >
            Landlord Copywriter & Benchmark
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'SEARCH' ? (
            <div className="space-y-4">
              <form onSubmit={handleParseSearch} className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Search in Natural English
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={naturalQuery}
                    onChange={(e) => setNaturalQuery(e.target.value)}
                    placeholder="e.g. 2bhk near Patan under 25000 with balcony and wifi"
                    className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={parsing || !naturalQuery.trim()}
                    className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition"
                  >
                    {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 mr-1">Suggestions:</span>
                  {[
                    '2bhk in Patan under 30k with parking',
                    'studio flat in Jhamsikhel with wifi',
                    '1 room near Baneshwor under 15000',
                  ].map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => setNaturalQuery(sugg)}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-[11px] text-slate-600 dark:text-slate-300 transition"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </form>

              {parsedResult && (
                <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" /> Extracted Parameters
                    </span>
                    <button
                      onClick={() => {
                        onApplyFilters?.(parsedResult.parsed_filters);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
                    >
                      Apply to Marketplace
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                    "{parsedResult.interpretation}"
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 text-xs font-mono">
                    {Object.entries(parsedResult.parsed_filters).map(([k, v]) => (
                      <div key={k} className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-sans">{k}</span>
                        <strong className="text-indigo-600 dark:text-indigo-400">
                          {Array.isArray(v) ? v.join(', ') : String(v)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleGenerateListing} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Property Title / Style</label>
                  <input
                    type="text"
                    placeholder="e.g. Spacious Sunny 2BHK with Rooftop"
                    value={titleHint}
                    onChange={(e) => setTitleHint(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Area / Neighborhood</label>
                    <input
                      type="text"
                      value={areaHint}
                      onChange={(e) => setAreaHint(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Target Rent (NPR)</label>
                    <input
                      type="number"
                      value={rentHint}
                      onChange={(e) => setRentHint(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Bedrooms</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={bedroomsHint}
                      onChange={(e) => setBedroomsHint(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Bathrooms</label>
                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={bathroomsHint}
                      onChange={(e) => setBathroomsHint(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={generating}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  Generate Listing Copy & Price Index
                </button>
              </form>

              {generatedListing && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">Suggested Title</span>
                      <button
                        onClick={() => copyToClipboard(generatedListing.generated_title)}
                        className="text-indigo-600 text-xs font-bold flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy
                      </button>
                    </div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      {generatedListing.generated_title}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">Description</span>
                      <button
                        onClick={() => copyToClipboard(generatedListing.generated_description)}
                        className="text-indigo-600 text-xs font-bold flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {generatedListing.generated_description}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-xs space-y-1 text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-indigo-900 dark:text-indigo-300 block">Kathmandu Valley Market Index</span>
                    <p>Suggested Price Range: <strong>{generatedListing.market_benchmark?.suggested_range}</strong></p>
                    <p className="text-[11px] text-slate-500">{generatedListing.market_benchmark?.market_competitiveness}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
