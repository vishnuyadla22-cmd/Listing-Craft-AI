import React, { useState } from 'react';
import { ListingForm } from '../features/generator/ListingForm';
import { StatusBanner } from '../components/StatusBanner';
import {
  ListingGenerationRequest,
  GeneratedListing,
  HealthStatus,
  UserSettings,
} from '../types';
import { api, ApiError } from '../services/api';

interface GeneratorPageProps {
  onGenerated: (listing: GeneratedListing, originalRequest: ListingGenerationRequest) => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
  health: HealthStatus | null;
  loadingHealth: boolean;
  onRefreshHealth: () => void;
  settings: UserSettings;
}

export const GeneratorPage: React.FC<GeneratorPageProps> = ({
  onGenerated,
  onNotify,
  health,
  loadingHealth,
  onRefreshHealth,
  settings,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [forceDemoMode, setForceDemoMode] = useState(false);

  const isOllamaOffline = !health?.ollama_connected || !health?.model_available;

  const handleGenerate = async (request: ListingGenerationRequest) => {
    setIsLoading(true);
    try {
      // If user enabled demo mode or forced
      const finalReq: ListingGenerationRequest = {
        ...request,
        demo_mode: request.demo_mode || forceDemoMode,
      };

      const listing = await api.generateListing(finalReq);
      onGenerated(listing, finalReq);

      if (listing.is_demo_mode) {
        onNotify('Generated listing in DEMO MODE (simulated AI)', 'info');
      } else {
        onNotify('Generated listing successfully with local AI!', 'success');
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.data?.is_ollama_offline) {
        onNotify(
          'Ollama is offline. You can enable Demo Mode below to test the interface without Ollama.',
          'error'
        );
      } else {
        onNotify(err.message || 'Generation failed. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <StatusBanner
        health={health}
        loading={loadingHealth}
        onRefresh={onRefreshHealth}
        onEnableDemoMode={() => setForceDemoMode(true)}
        isDemoModeActive={forceDemoMode}
      />

      <ListingForm
        onSubmit={handleGenerate}
        isLoading={isLoading}
        defaultPlatform={settings.defaultPlatform}
        defaultTone={settings.preferredTone}
        defaultLanguage={settings.preferredLanguage}
        isOllamaOffline={isOllamaOffline}
      />
    </div>
  );
};
