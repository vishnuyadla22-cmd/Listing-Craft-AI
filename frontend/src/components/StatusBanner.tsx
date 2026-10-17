import React from 'react';
import { Sparkles, RefreshCw, Cpu } from 'lucide-react';
import { HealthStatus } from '../types';

interface StatusBannerProps {
  health: HealthStatus | null;
  loading: boolean;
  onRefresh: () => void;
  onEnableDemoMode?: () => void;
  isDemoModeActive?: boolean;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  health,
  loading,
  onRefresh,
  onEnableDemoMode,
  isDemoModeActive,
}) => {
  // Demo mode active banner
  if (isDemoModeActive) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 px-4 py-3 rounded-xl mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-amber-500 text-white">
            DEMO MODE
          </span>
          <span className="font-medium">
            Generated using simulated template data because local Ollama is offline.
          </span>
          <span className="text-amber-700 hidden md:inline">
            To use real AI, run Ollama with Qwen2.5 3B.
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 underline underline-offset-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Check Ollama Again
        </button>
      </div>
    );
  }

  // Ollama offline banner
  if (health && (!health.ollama_connected || !health.model_available)) {
    return (
      <div className="bg-indigo-50 border border-indigo-200/80 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-700 flex-shrink-0 mt-0.5">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-slate-800">
                  {!health.ollama_connected
                    ? 'Local Ollama Service Offline'
                    : `Model '${health.model_name}' Not Pulled Yet`}
                </h4>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
                  Local AI Setup
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                ListingCraft AI uses local open-weight AI (Qwen2.5 3B via Ollama) for private, zero-cost generation.
                {!health.ollama_connected ? (
                  <> Start Ollama locally with <code className="bg-white px-1.5 py-0.5 rounded border text-indigo-800 font-mono text-xs">ollama serve</code>.</>
                ) : (
                  <> Download the model with <code className="bg-white px-1.5 py-0.5 rounded border text-indigo-800 font-mono text-xs">ollama run {health.model_name}</code>.</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
            {onEnableDemoMode && (
              <button
                type="button"
                onClick={onEnableDemoMode}
                className="px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Use Demo Mode
              </button>
            )}
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Test Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
