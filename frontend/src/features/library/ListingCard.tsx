import React from 'react';
import {
  Copy,
  Trash2,
  FileCode,
  Calendar,
  Award,
} from 'lucide-react';
import { SavedListing } from '../../types';
import { formatAsMarkdown, downloadFile } from '../../utils/formatters';

interface ListingCardProps {
  listing: SavedListing;
  onOpen: (listing: SavedListing) => void;
  onDuplicate: (id: string) => void;
  onDeleteRequest: (listing: SavedListing) => void;
  onNotify: (msg: string, type: 'success' | 'error') => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onOpen,
  onDuplicate,
  onDeleteRequest,
  onNotify,
}) => {
  const platformColors: Record<string, string> = {
    amazon: 'bg-amber-100 text-amber-800 border-amber-200',
    etsy: 'bg-orange-100 text-orange-800 border-orange-200',
    shopify: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    generic: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const formattedDate = new Date(listing.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    const md = formatAsMarkdown(listing);
    const safeName = listing.product_name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    downloadFile(md, `${safeName}_listing.md`, 'text/markdown');
    onNotify('Exported listing as Markdown', 'success');
  };

  return (
    <div
      onClick={() => onOpen(listing)}
      className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-brand-300 transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                platformColors[listing.platform] || platformColors.generic
              }`}
            >
              {listing.platform}
            </span>
            {listing.is_demo_mode && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500 text-white">
                DEMO
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-700 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-lg text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-brand-600" />
            <span>{listing.quality_score.overall_score}/100</span>
          </div>
        </div>

        {/* Product title & name */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition line-clamp-1 mb-1">
          {listing.product_name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
          {listing.title}
        </p>

        {/* Short excerpt */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
          {listing.short_description}
        </p>
      </div>

      {/* Footer controls */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Calendar className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleExport}
            title="Export Markdown"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <FileCode className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDuplicate(listing.id)}
            title="Duplicate listing"
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDeleteRequest(listing)}
            title="Delete listing"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
