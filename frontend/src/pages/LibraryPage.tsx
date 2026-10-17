import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  Search,
  Plus,
  AlertTriangle,
  FileCode,
  Download,
} from 'lucide-react';
import { SavedListing, NavigationTab } from '../types';
import { ListingCard } from '../features/library/ListingCard';
import { Modal } from '../components/Modal';
import { downloadFile, formatAsMarkdown } from '../utils/formatters';

interface LibraryPageProps {
  savedListings: SavedListing[];
  onOpenListing: (listing: SavedListing) => void;
  onDuplicateListing: (id: string) => void;
  onDeleteListing: (id: string) => void;
  onNavigate: (tab: NavigationTab) => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  savedListings,
  onOpenListing,
  onDuplicateListing,
  onDeleteListing,
  onNavigate,
  onNotify,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [deletingListing, setDeletingListing] = useState<SavedListing | null>(null);

  // Filter listings based on search and platform
  const filteredListings = useMemo(() => {
    return savedListings.filter((item) => {
      const matchesSearch =
        item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPlatform =
        selectedPlatform === 'all' || item.platform === selectedPlatform;

      return matchesSearch && matchesPlatform;
    });
  }, [savedListings, searchQuery, selectedPlatform]);

  const confirmDelete = () => {
    if (deletingListing) {
      onDeleteListing(deletingListing.id);
      onNotify(`Deleted "${deletingListing.product_name}" from library`, 'info');
      setDeletingListing(null);
    }
  };

  const handleExportAll = (format: 'json' | 'md') => {
    if (savedListings.length === 0) {
      onNotify('No saved listings to export', 'info');
      return;
    }

    if (format === 'json') {
      const content = JSON.stringify(savedListings, null, 2);
      downloadFile(content, `listingcraft_backup_${Date.now()}.json`, 'application/json');
      onNotify('Exported library as JSON', 'success');
    } else {
      const combinedMd = savedListings.map(formatAsMarkdown).join('\n\n---\n\n');
      downloadFile(combinedMd, `listingcraft_catalog_${Date.now()}.md`, 'text/markdown');
      onNotify('Exported library as Markdown', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700">
              Listing Library
            </span>
            <span className="text-xs text-slate-400">
              • {savedListings.length} {savedListings.length === 1 ? 'listing' : 'listings'} saved
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Saved Product Listings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, search, edit, duplicate, and export your catalog.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {savedListings.length > 0 && (
            <>
              <button
                onClick={() => handleExportAll('md')}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium transition flex items-center gap-1.5"
                title="Export all as combined Markdown"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                Export All (.MD)
              </button>
              <button
                onClick={() => handleExportAll('json')}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium transition flex items-center gap-1.5"
                title="Backup all as JSON"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                JSON Backup
              </button>
            </>
          )}

          <button
            onClick={() => onNavigate('generator')}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Listing
          </button>
        </div>
      </div>

      {/* Search & Platform Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, keywords, or title..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
          />
        </div>

        {/* Platform Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Platforms' },
            { id: 'amazon', label: 'Amazon' },
            { id: 'etsy', label: 'Etsy' },
            { id: 'shopify', label: 'Shopify' },
            { id: 'generic', label: 'Marketplace' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedPlatform(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                selectedPlatform === tab.id
                  ? 'border-brand-600 bg-brand-50 text-brand-700 font-semibold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Listings */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {savedListings.length === 0 ? 'Your Library is Empty' : 'No Listings Match Your Filters'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {savedListings.length === 0
              ? 'Generate a listing using the generator and click "Save Listing" to build your product catalog.'
              : 'Try clearing your search query or selecting "All Platforms" to see your saved items.'}
          </p>
          {savedListings.length === 0 ? (
            <button
              onClick={() => onNavigate('generator')}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition"
            >
              Generate First Listing
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPlatform('all');
              }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onOpen={onOpenListing}
              onDuplicate={onDuplicateListing}
              onDeleteRequest={(item) => setDeletingListing(item)}
              onNotify={onNotify}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingListing)}
        onClose={() => setDeletingListing(null)}
        title="Confirm Delete Listing"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Are you sure you want to delete this listing?
              </p>
              <p className="text-xs text-slate-500 mt-1">
                &ldquo;{deletingListing?.product_name}&rdquo; will be permanently removed from your browser storage.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setDeletingListing(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition shadow-xs"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
