import React from 'react';
import { CheckCircle2, Lightbulb } from 'lucide-react';
import { ListingQualityScore } from '../../types';

interface QualityScoreCardProps {
  score: ListingQualityScore;
  suggestions: string[];
}

export const QualityScoreCard: React.FC<QualityScoreCardProps> = ({ score, suggestions }) => {
  const getScoreColor = (val: number) => {
    if (val >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (val >= 70) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  const getMeterColor = (val: number) => {
    if (val >= 85) return 'bg-emerald-500';
    if (val >= 70) return 'bg-indigo-500';
    return 'bg-amber-500';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border font-bold text-2xl shadow-xs ${getScoreColor(
              score.overall_score
            )}`}
          >
            <span>{score.overall_score}</span>
            <span className="text-[10px] uppercase font-semibold tracking-wider opacity-75">
              / 100
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Listing Quality Score</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                {score.overall_score >= 85 ? 'High Conversion' : 'Market Ready'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-lg leading-relaxed">
              {score.summary}
            </p>
          </div>
        </div>

        {/* Breakdown Meters */}
        <div className="grid grid-cols-3 gap-3 min-w-[280px]">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 mb-1">SEO Search</div>
            <div className="text-base font-bold text-slate-800">{score.seo_score}%</div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${getMeterColor(score.seo_score)}`}
                style={{ width: `${score.seo_score}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 mb-1">Readability</div>
            <div className="text-base font-bold text-slate-800">{score.readability_score}%</div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${getMeterColor(score.readability_score)}`}
                style={{ width: `${score.readability_score}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 mb-1">Persuasion</div>
            <div className="text-base font-bold text-slate-800">{score.persuasiveness_score}%</div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${getMeterColor(score.persuasiveness_score)}`}
                style={{ width: `${score.persuasiveness_score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Suggestions */}
      {suggestions.length > 0 && (
        <div className="pt-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Actionable Optimization Suggestions
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {suggestions.map((sugg, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-150 text-xs text-slate-700 leading-relaxed"
              >
                <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <span>{sugg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
