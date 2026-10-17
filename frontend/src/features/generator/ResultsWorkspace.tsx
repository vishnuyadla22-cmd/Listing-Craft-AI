import React, { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Copy,
  RotateCw,
  Sparkles,
  Check,
  FileDown,
  FileCode,
  Tag,
  List,
  Type,
  AlignLeft,
  Megaphone,
} from 'lucide-react';
import {
  GeneratedListing,
  ListingGenerationRequest,
} from '../../types';
import { QualityScoreCard } from './QualityScoreCard';
import { SectionCard } from './SectionCard';
import { copyToClipboard } from '../../utils/clipboard';
import {
  formatAsMarkdown,
  formatAsPlainText,
  downloadFile,
} from '../../utils/formatters';
import { api } from '../../services/api';

interface ResultsWorkspaceProps {
  listing: GeneratedListing;
  originalRequest?: ListingGenerationRequest;
  onSave: (listing: GeneratedListing) => void;
  isSaved: boolean;
  onRegenerateAll: () => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
  onUpdateListing: (updated: GeneratedListing) => void;
}

export const ResultsWorkspace: React.FC<ResultsWorkspaceProps> = ({
  listing,
  originalRequest,
  onSave,
  isSaved,
  onRegenerateAll,
  onNotify,
  onUpdateListing,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);

  const handleCopyFull = async () => {
    const md = formatAsMarkdown(listing);
    const ok = await copyToClipboard(md);
    if (ok) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
      onNotify('Copied full listing to clipboard (Markdown)!', 'success');
    } else {
      onNotify('Could not copy to clipboard', 'error');
    }
  };

  const handleExport = (format: 'md' | 'txt') => {
    const safeName = listing.product_name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    if (format === 'md') {
      const content = formatAsMarkdown(listing);
      downloadFile(content, `${safeName}_listing.md`, 'text/markdown');
      onNotify('Downloaded Markdown listing file', 'success');
    } else {
      const content = formatAsPlainText(listing);
      downloadFile(content, `${safeName}_listing.txt`, 'text/plain');
      onNotify('Downloaded Plain Text listing file', 'success');
    }
  };

  const handleRegenerateSection = async (sectionKey: string, currentValue: any) => {
    if (!originalRequest) {
      onNotify('Original context unavailable for section regeneration', 'info');
      return;
    }

    try {
      setRegeneratingSection(sectionKey);
      const res = await api.regenerateSection(sectionKey, originalRequest, currentValue);
      
      const updated: GeneratedListing = {
        ...listing,
        [sectionKey]: res.value,
      };
      onUpdateListing(updated);
      onNotify(`Regenerated ${sectionKey.replace('_', ' ')}!`, 'success');
    } catch (err: any) {
      onNotify(err.message || `Failed to regenerate ${sectionKey}`, 'error');
    } finally {
      setRegeneratingSection(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Workspace Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 text-white">
              {listing.platform}
            </span>
            {listing.is_demo_mode && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-white">
                DEMO MODE
              </span>
            )}
            <span className="text-xs text-slate-400">
              Generated {new Date(listing.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
            {listing.product_name}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onRegenerateAll}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition flex items-center gap-1.5"
            title="Generate a completely new version"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Regenerate All
          </button>

          <button
            onClick={handleCopyFull}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-brand-300 text-slate-700 hover:text-brand-700 hover:bg-brand-50/50 text-xs font-medium transition flex items-center gap-1.5"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Full Listing
              </>
            )}
          </button>

          {/* Export options */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden">
            <button
              onClick={() => handleExport('md')}
              className="px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-r border-slate-200 flex items-center gap-1"
              title="Download as Markdown"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-600" />
              .MD
            </button>
            <button
              onClick={() => handleExport('txt')}
              className="px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1"
              title="Download as Text"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-600" />
              .TXT
            </button>
          </div>

          {/* Save Listing Button */}
          <button
            onClick={() => onSave(listing)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 ${
              isSaved
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5" />
                Saved to Library
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                Save Listing
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quality Score Breakdown */}
      <QualityScoreCard
        score={listing.quality_score}
        suggestions={listing.improvement_suggestions}
      />

      {/* Grid of Listing Sections */}
      <div className="grid grid-cols-1 gap-5">
        {/* 1. Primary Title */}
        <SectionCard
          title="Primary Product Title"
          badge={`${listing.title.length} characters`}
          icon={<Type className="w-4 h-4 text-brand-600" />}
          content={listing.title}
          type="text"
          onUpdate={(newTitle) => onUpdateListing({ ...listing, title: newTitle })}
          onRegenerate={() => handleRegenerateSection('title', listing.title)}
          isRegenerating={regeneratingSection === 'title'}
          onNotify={onNotify}
        />

        {/* 2. Alternative Titles */}
        <SectionCard
          title="Alternative Title Variations (for A/B Testing)"
          badge={`${listing.alternative_titles.length} options`}
          icon={<Sparkles className="w-4 h-4 text-amber-500" />}
          content={listing.alternative_titles}
          type="bullets"
          onUpdate={(newTitles) => onUpdateListing({ ...listing, alternative_titles: newTitles })}
          onRegenerate={() => handleRegenerateSection('alternative_titles', listing.alternative_titles)}
          isRegenerating={regeneratingSection === 'alternative_titles'}
          onNotify={onNotify}
        />

        {/* 3. Short Description */}
        <SectionCard
          title="Short Description / Marketplace Excerpt"
          icon={<AlignLeft className="w-4 h-4 text-indigo-500" />}
          content={listing.short_description}
          type="text"
          onUpdate={(val) => onUpdateListing({ ...listing, short_description: val })}
          onRegenerate={() => handleRegenerateSection('short_description', listing.short_description)}
          isRegenerating={regeneratingSection === 'short_description'}
          onNotify={onNotify}
        />

        {/* 4. Key Selling Points (Bullet Points) */}
        <SectionCard
          title="Key Selling Points & Bullet Features"
          badge={`${listing.selling_points.length} bullets`}
          icon={<List className="w-4 h-4 text-emerald-600" />}
          content={listing.selling_points}
          type="bullets"
          onUpdate={(bullets) => onUpdateListing({ ...listing, selling_points: bullets })}
          onRegenerate={() => handleRegenerateSection('selling_points', listing.selling_points)}
          isRegenerating={regeneratingSection === 'selling_points'}
          onNotify={onNotify}
        />

        {/* 5. Full Description */}
        <SectionCard
          title="Full Product Description"
          icon={<AlignLeft className="w-4 h-4 text-slate-700" />}
          content={listing.full_description}
          type="markdown"
          onUpdate={(val) => onUpdateListing({ ...listing, full_description: val })}
          onRegenerate={() => handleRegenerateSection('full_description', listing.full_description)}
          isRegenerating={regeneratingSection === 'full_description'}
          onNotify={onNotify}
        />

        {/* 6. Keywords & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SectionCard
            title="High-Intent Search Keywords"
            badge={`${listing.keywords.length} keywords`}
            icon={<Tag className="w-4 h-4 text-blue-600" />}
            content={listing.keywords}
            type="tags"
            onUpdate={(tags) => onUpdateListing({ ...listing, keywords: tags })}
            onNotify={onNotify}
          />

          <SectionCard
            title="Marketplace Search Tags"
            badge={`${listing.tags.length} tags`}
            icon={<Tag className="w-4 h-4 text-purple-600" />}
            content={listing.tags}
            type="tags"
            onUpdate={(tags) => onUpdateListing({ ...listing, tags: tags })}
            onNotify={onNotify}
          />
        </div>

        {/* 7. Call To Action */}
        <SectionCard
          title="Call to Action (Closing Pitch)"
          icon={<Megaphone className="w-4 h-4 text-rose-500" />}
          content={listing.call_to_action}
          type="text"
          onUpdate={(val) => onUpdateListing({ ...listing, call_to_action: val })}
          onRegenerate={() => handleRegenerateSection('call_to_action', listing.call_to_action)}
          isRegenerating={regeneratingSection === 'call_to_action'}
          onNotify={onNotify}
        />
      </div>
    </div>
  );
};
