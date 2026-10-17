import React from 'react';
import { Sparkles, ArrowLeft, PenSquare } from 'lucide-react';
import { ResultsWorkspace } from '../features/generator/ResultsWorkspace';
import {
  GeneratedListing,
  ListingGenerationRequest,
  NavigationTab,
} from '../types';

interface ResultsPageProps {
  listing: GeneratedListing | null;
  originalRequest?: ListingGenerationRequest;
  onSave: (listing: GeneratedListing) => void;
  isSaved: boolean;
  onRegenerateAll: () => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
  onUpdateListing: (updated: GeneratedListing) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  listing,
  originalRequest,
  onSave,
  isSaved,
  onRegenerateAll,
  onNotify,
  onUpdateListing,
  onNavigate,
}) => {
  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Generated Listing</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
          You haven&apos;t generated a listing in this session yet. Fill in product details to craft an optimized listing.
        </p>
        <button
          onClick={() => onNavigate('generator')}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition inline-flex items-center gap-2 cursor-pointer"
        >
          <PenSquare className="w-4 h-4" />
          <span>Open Generator</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <button
        onClick={() => onNavigate('generator')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition py-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Generator Form
      </button>

      <ResultsWorkspace
        listing={listing}
        originalRequest={originalRequest}
        onSave={onSave}
        isSaved={isSaved}
        onRegenerateAll={onRegenerateAll}
        onNotify={onNotify}
        onUpdateListing={onUpdateListing}
      />
    </div>
  );
};
