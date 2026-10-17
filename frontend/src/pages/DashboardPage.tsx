import React from 'react';
import {
  Sparkles,
  ShoppingBag,
  Bookmark,
  Plus,
  ArrowRight,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import { SavedListing, NavigationTab } from '../types';

interface DashboardPageProps {
  savedListings: SavedListing[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenListing: (listing: SavedListing) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  savedListings,
  onNavigate,
  onOpenListing,
}) => {
  // Compute authentic stats directly from saved listings
  const totalCount = savedListings.length;
  
  const platformCounts: Record<string, number> = savedListings.reduce((acc, curr) => {
    acc[curr.platform] = (acc[curr.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageQualityScore = totalCount > 0
    ? Math.round(
        savedListings.reduce((sum, item) => sum + (item.quality_score?.overall_score || 0), 0) /
          totalCount
      )
    : 0;

  const recentListings = savedListings.slice(0, 5);

  const platformDisplayNames: Record<string, string> = {
    amazon: 'Amazon',
    etsy: 'Etsy',
    shopify: 'Shopify',
    generic: 'Generic Marketplace',
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Start */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700">
              Seller Dashboard
            </span>
            <span className="text-xs text-slate-400">• Real-Time Workspace</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to ListingCraft AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
            Generate, optimize, and organize your product listings with local Qwen2.5 open-weight AI.
          </p>
        </div>

        <button
          onClick={() => onNavigate('generator')}
          className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-600/20 transition flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Quick-Start Generator</span>
        </button>
      </div>

      {/* Statistics Cards (Real data only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Listings Saved</span>
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalCount}</div>
          <div className="text-xs text-slate-500 mt-1">
            {totalCount === 0 ? 'No listings created yet' : 'Stored securely in browser'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Average Quality Score</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {totalCount > 0 ? `${averageQualityScore}/100` : '--'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {totalCount > 0 ? 'Calculated across all saved listings' : 'Awaiting first listing'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Platforms</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {Object.keys(platformCounts).length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {Object.keys(platformCounts).length > 0
              ? Object.keys(platformCounts).map(p => platformDisplayNames[p] || p).join(', ')
              : 'Amazon, Etsy, Shopify, Generic'}
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Listings & Platforms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Listings (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h2 className="text-base font-bold text-slate-900">Recent Listings</h2>
            </div>
            {totalCount > 0 && (
              <button
                onClick={() => onNavigate('library')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View all ({totalCount}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {recentListings.length === 0 ? (
            /* First-time empty state */
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Listings Created Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
                Start by crafting your first product listing with our AI generator. You can test immediately using pre-filled sample templates.
              </p>
              <button
                onClick={() => onNavigate('generator')}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition"
              >
                Create First Listing
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentListings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onOpenListing(item)}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 px-2 rounded-xl transition cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {item.platform}
                      </span>
                      {item.is_demo_mode && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-800">
                          Demo
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {item.product_name}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {item.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800">
                        {item.quality_score?.overall_score || 0}/100
                      </div>
                      <div className="text-[10px] text-slate-400">Quality</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform Breakdown & Tips */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              Platform Distribution
            </h3>

            {totalCount === 0 ? (
              <p className="text-xs text-slate-500 py-4 leading-relaxed">
                Once you generate and save listings, their platform breakdown will appear here.
              </p>
            ) : (
              <div className="space-y-3">
                {['amazon', 'etsy', 'shopify', 'generic'].map((plt) => {
                  const count = platformCounts[plt] || 0;
                  const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                  return (
                    <div key={plt} className="text-xs">
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span className="capitalize">{platformDisplayNames[plt] || plt}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-brand-600 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-brand-50 rounded-2xl border border-brand-100 p-5">
            <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Seller Pro-Tip
            </h4>
            <p className="text-xs text-brand-800/80 leading-relaxed">
              Always test at least two title variations on Etsy and Amazon. Small tweaks in high-intent keywords can boost your organic search impressions significantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
