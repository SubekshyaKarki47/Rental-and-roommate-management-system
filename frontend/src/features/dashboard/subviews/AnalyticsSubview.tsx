import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  DollarSign,
  Sparkles,
} from 'lucide-react';

export const AnalyticsSubview: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.first_name || user?.full_name?.split(' ')[0] || 'You';

  const neighborhoodData = [
    { name: 'Jhamsikhel / Sanepa', avgPrice: 'Rs. 28,000', percentage: 88, status: 'High Demand' },
    { name: 'New Baneshwor / Shantinagar', avgPrice: 'Rs. 24,500', percentage: 75, status: 'Fast Moving' },
    { name: 'Maitighar / Babarmahal', avgPrice: 'Rs. 23,500', percentage: 72, status: 'Popular' },
    { name: 'Thamel / Lazimpat', avgPrice: 'Rs. 21,000', percentage: 65, status: 'Steady' },
    { name: 'Koteshwor / Jadibuti', avgPrice: 'Rs. 16,500', percentage: 50, status: 'Budget Friendly' },
  ];

  return (
    <div className="tenant-subview-wrapper">
      <div className="tenant-subview-header">
        <div>
          <h2 className="tenant-subview-title">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Rental Market Analytics & Insights</span>
          </h2>
          <p className="tenant-subview-subtitle">
            Real-time data insights on rental prices, neighborhood trends, and tenant matching across Kathmandu Valley
          </p>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="analytics-metrics-grid">
        <div className="tenant-content-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Kathmandu Rent</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">Rs. 22,400</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+3.8% from last quarter</span>
          </div>
        </div>

        <div className="tenant-content-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search Inquiries</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">48 Searches</p>
          <p className="text-xs text-slate-400 mt-1">Properties explored this week</p>
        </div>

        <div className="tenant-content-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Impressions</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">14 Views</p>
          <p className="text-xs text-slate-400 mt-1">Viewed by landlords & roommates</p>
        </div>

        <div className="tenant-content-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Match Compatibility</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">94% Score</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">High compatibility rating</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Neighborhood Price Benchmark (2 cols) */}
        <div className="lg:col-span-2 tenant-content-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Average Rental Prices by Neighborhood
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Benchmark rates for 1BHK/2BHK flats in prime Kathmandu & Lalitpur hubs
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {neighborhoodData.map((item) => (
              <div key={item.name} className="analytics-bar-item">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                      {item.status}
                    </span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">
                      {item.avgPrice}/mo
                    </span>
                  </div>
                </div>

                <div className="analytics-bar-track">
                  <div
                    className="analytics-bar-fill"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                Market Trend Insight for {userName}
              </h5>
              <p className="text-xs text-blue-800/80 dark:text-blue-300/80 mt-0.5 leading-relaxed">
                Rent in New Baneshwor has stabilized this quarter with an average response time of 12 hours. Tenants with verified employer details receive rental approvals 40% faster.
              </p>
            </div>
          </div>
        </div>

        {/* Property Type Breakdown (1 col) */}
        <div className="tenant-content-card">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Rental Demand by Type
          </h4>
          <p className="text-xs text-slate-400 mb-6">Market distribution in Valley</p>

          <div className="flex items-center justify-center mb-6">
            <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#2563eb" strokeWidth="12" strokeDasharray="163 238" strokeDashoffset="0" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="#a855f7" strokeWidth="12" strokeDasharray="88 238" strokeDashoffset="-163" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="#38bdf8" strokeWidth="12" strokeDasharray="44 238" strokeDashoffset="-251" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="20 238" strokeDashoffset="-295" />
            </svg>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span>2BHK Apartments</span>
              </span>
              <span className="font-bold">52%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500" />
                <span>Private Rooms</span>
              </span>
              <span className="font-bold">28%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-400" />
                <span>Studio Flats</span>
              </span>
              <span className="font-bold">14%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Shared Houses</span>
              </span>
              <span className="font-bold">6%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
