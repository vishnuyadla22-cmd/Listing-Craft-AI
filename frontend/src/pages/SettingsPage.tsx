import React, { useState } from 'react';
import {
  Cpu,
  Trash2,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Save,
  Sliders,
} from 'lucide-react';
import { UserSettings, HealthStatus, Platform, Tone } from '../types';
import { Modal } from '../components/Modal';

interface SettingsPageProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onClearAllData: () => void;
  health: HealthStatus | null;
  loadingHealth: boolean;
  onRefreshHealth: () => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onClearAllData,
  health,
  loadingHealth,
  onRefreshHealth,
  onNotify,
}) => {
  const [platform, setPlatform] = useState<Platform>(settings.defaultPlatform);
  const [tone, setTone] = useState<Tone>(settings.preferredTone);
  const [language, setLanguage] = useState(settings.preferredLanguage);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      defaultPlatform: platform,
      preferredTone: tone,
      preferredLanguage: language.trim() || 'English',
    });
    onNotify('Default preferences updated!', 'success');
  };

  const handleConfirmClear = () => {
    onClearAllData();
    setShowClearConfirm(false);
    onNotify('All local storage data has been cleared.', 'info');
  };

  const isAiReady = health?.ollama_connected && health?.model_available;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700">
            System Configuration
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Settings &amp; AI Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure default generator preferences, monitor local AI model readiness, and manage your data.
        </p>
      </div>

      {/* Local AI Engine Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                isAiReady ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Local AI Model Runner</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isAiReady
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isAiReady ? 'Online & Ready' : health?.ollama_connected ? 'Model Missing' : 'Offline'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Model: <code className="font-mono text-slate-800">{health?.model_name || 'qwen2.5:3b'}</code>
              </p>
            </div>
          </div>

          <button
            onClick={onRefreshHealth}
            disabled={loadingHealth}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
            Refresh Connection
          </button>
        </div>

        {/* Diagnostic details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
            <div className="text-slate-500 font-medium">Service Diagnostics</div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Ollama Daemon:</span>
              <span className={`font-semibold ${health?.ollama_connected ? 'text-emerald-600' : 'text-rose-600'}`}>
                {health?.ollama_connected ? 'Connected (Port 11434)' : 'Unreachable'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Model Weights:</span>
              <span className={`font-semibold ${health?.model_available ? 'text-emerald-600' : 'text-amber-600'}`}>
                {health?.model_available ? 'Loaded' : 'Not Found in Ollama'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Available Models:</span>
              <span className="font-mono text-slate-800 text-[11px]">
                {health?.available_models && health.available_models.length > 0
                  ? health.available_models.join(', ')
                  : 'None detected'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-slate-500 font-medium mb-1.5">Setup Guidance</div>
            {health?.setup_guidance ? (
              <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                {health.setup_guidance}
              </pre>
            ) : (
              <p className="text-slate-600 leading-relaxed">
                Your local Ollama runner is properly configured and actively generating e-commerce listings with local weights.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Generator Default Preferences */}
      <form onSubmit={handleSavePreferences} className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-600" />
            Generator Defaults
          </h3>
          <p className="text-xs text-slate-500">
            Set default values that automatically pre-fill when starting a new listing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Default Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="amazon">Amazon</option>
              <option value="etsy">Etsy</option>
              <option value="shopify">Shopify</option>
              <option value="generic">Generic Marketplace</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Default Tone of Voice
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="persuasive">Persuasive</option>
              <option value="luxury">Luxury</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Default Language
            </label>
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. English"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition inline-flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save Preferences
          </button>
        </div>
      </form>

      {/* Privacy Explanation & Local Data */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Privacy &amp; Data Transparency
          </h3>
          <p className="text-xs text-slate-500">
            How your information is handled by ListingCraft AI.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs text-slate-700 space-y-2.5 leading-relaxed">
          <p>
            <strong>Where are listings stored?</strong> All product listings you generate or save are stored exclusively in your local browser&apos;s <code className="bg-white px-1.5 py-0.5 rounded border font-mono">localStorage</code>. No external database or cloud storage account is utilized.
          </p>
          <p>
            <strong>Where does AI generation occur?</strong> Generation requests are processed by the FastAPI backend server running on your machine and forwarded to your configured local Ollama instance (<code className="bg-white px-1.5 py-0.5 rounded border font-mono">http://localhost:11434</code>). When running Ollama locally, no product data leaves your device.
          </p>
          <p className="text-slate-500 italic">
            Note: If you run the backend on a remote host or point Ollama to an external URL, network transmission occurs to that specific configured host.
          </p>
        </div>

        {/* Danger zone: Clear local data */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-rose-700">Clear All Local Data</div>
            <div className="text-[11px] text-slate-500">
              Permanently remove all saved listings and restore default settings.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Data
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Confirm Reset All Local Data"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Are you sure you want to erase all data?
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This will delete every saved product listing from this browser and reset all settings to defaults. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmClear}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition shadow-xs"
            >
              Erase Everything
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
