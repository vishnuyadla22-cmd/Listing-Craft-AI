import React, { useState } from 'react';
import { Copy, Check, Edit3, RotateCw, Save, X } from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboard';

interface SectionCardProps {
  title: string;
  badge?: string;
  icon?: React.ReactNode;
  content: string | string[];
  type?: 'text' | 'bullets' | 'tags' | 'markdown';
  onUpdate?: (newContent: any) => void;
  onRegenerate?: () => Promise<void>;
  isRegenerating?: boolean;
  onNotify?: (msg: string, type: 'success' | 'error') => void;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  badge,
  icon,
  content,
  type = 'text',
  onUpdate,
  onRegenerate,
  isRegenerating = false,
  onNotify,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>('');

  const getTextToCopy = (): string => {
    if (Array.isArray(content)) {
      if (type === 'bullets') {
        return content.map(b => `• ${b}`).join('\n');
      }
      return content.join(', ');
    }
    return content;
  };

  const handleCopy = async () => {
    const text = getTextToCopy();
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onNotify?.(`Copied ${title} to clipboard!`, 'success');
    } else {
      onNotify?.('Failed to copy to clipboard', 'error');
    }
  };

  const handleStartEdit = () => {
    if (Array.isArray(content)) {
      setEditValue(content.join('\n'));
    } else {
      setEditValue(content);
    }
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!onUpdate) return;
    if (Array.isArray(content)) {
      const items = editValue
        .split('\n')
        .map(i => i.replace(/^[•\-*]\s*/, '').trim())
        .filter(Boolean);
      onUpdate(items);
    } else {
      onUpdate(editValue.trim());
    }
    setIsEditing(false);
    onNotify?.(`Updated ${title}`, 'success');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm transition hover:border-slate-300">
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {icon && <span className="text-slate-500">{icon}</span>}
          <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onRegenerate && !isEditing && (
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              title="Regenerate this section"
              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-40"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            </button>
          )}

          {onUpdate && !isEditing && (
            <button
              onClick={handleStartEdit}
              title="Edit text"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleCopy}
            title="Copy section"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition border border-transparent hover:border-brand-200"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editing State */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={Array.isArray(content) ? Math.min(8, Math.max(3, editValue.split('\n').length + 1)) : 4}
            className="w-full text-sm font-sans p-3 rounded-xl border border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50/20"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition flex items-center gap-1 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </div>
      ) : (
        /* Display State */
        <div className="text-sm text-slate-700">
          {type === 'bullets' && Array.isArray(content) && (
            <ul className="space-y-2">
              {content.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          {type === 'tags' && Array.isArray(content) && (
            <div className="flex flex-wrap gap-1.5">
              {content.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {type === 'markdown' && typeof content === 'string' && (
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
              {content}
            </div>
          )}

          {type === 'text' && typeof content === 'string' && (
            <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
          )}
        </div>
      )}
    </div>
  );
};
