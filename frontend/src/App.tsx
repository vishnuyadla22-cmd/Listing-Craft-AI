import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { GeneratorPage } from './pages/GeneratorPage';
import { ResultsPage } from './pages/ResultsPage';
import { LibraryPage } from './pages/LibraryPage';
import { SettingsPage } from './pages/SettingsPage';
import {
  NavigationTab,
  GeneratedListing,
  SavedListing,
  ListingGenerationRequest,
  HealthStatus,
  UserSettings,
} from './types';
import { storage } from './services/storage';
import { api } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('landing');
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [activeListing, setActiveListing] = useState<GeneratedListing | null>(null);
  const [originalRequest, setOriginalRequest] = useState<ListingGenerationRequest | undefined>(undefined);
  const [settings, setSettings] = useState<UserSettings>(storage.getUserSettings());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Health status
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, type, title }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch health check
  const checkHealth = useCallback(async () => {
    setLoadingHealth(true);
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch {
      setHealth({
        status: 'error',
        ollama_connected: false,
        model_available: false,
        model_name: 'qwen2.5:3b',
        available_models: [],
        message: 'Could not connect to backend server on port 8000',
        setup_guidance: 'Make sure the FastAPI backend is running: python -m uvicorn app.main:app',
      });
    } finally {
      setLoadingHealth(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    checkHealth();
    let loaded = storage.getSavedListings();

    // If initial storage is completely empty, populate with a starter example
    if (loaded.length === 0) {
      const starterExample: SavedListing = {
        id: 'starter-listing-1',
        product_name: 'Artisan Speckled Ceramic Mug',
        platform: 'etsy',
        title: 'Artisan Speckled Ceramic Mug, 14oz Handcrafted Stoneware Coffee Cup, Cozy Gift for Tea Lovers',
        alternative_titles: [
          'Handmade Ceramic Speckled Mug - 14oz Stoneware Gift',
          'Rustic Ceramic Coffee Mug with Thumb Rest | Microwave Safe',
          'Earthy Studio Pottery Mug for Hot Chocolate & Espresso',
        ],
        short_description: 'Enjoy slow mornings with this 14oz handcrafted stoneware mug featuring a rich reactive speckled glaze and comfortable ergonomic handle.',
        full_description: '### The Everyday Morning Ritual\n\nEach mug is hand-thrown on the potter\'s wheel from durable stoneware clay, then dipped in our custom matte cream and rust speckle glaze.\n\n#### Highlights & Specifications\n- **Capacity:** 14 oz (fluid)\n- **Care:** 100% Dishwasher and microwave safe\n- **Ergonomics:** Wide thumb-rest handle prevents accidental slips\n\nShipped in reinforced eco-friendly packaging ready for gift giving.',
        selling_points: [
          'Hand-thrown stoneware clay ensures authentic individuality for each piece.',
          'Generous 14oz capacity accommodates lattes, drip brew, and herbal teas.',
          'Comfortable thumb-rest handle designed for natural, fatigue-free grip.',
          'Lead-free, food-safe glaze is both microwave and dishwasher friendly.',
          'Carefully gift-packaged using recyclable kraft materials.',
        ],
        keywords: [
          'handmade ceramic mug',
          'stoneware pottery',
          'cozy coffee gift',
          'artisan coffee cup',
          'pottery mug with thumb rest',
          'unique gift for mom',
          'rustic kitchen decor',
        ],
        tags: [
          'ceramic mug',
          'pottery gift',
          'handmade cup',
          'stoneware',
          'cozy morning',
          'coffee lover',
          'tea mug',
          'kitchen aesthetic',
        ],
        call_to_action: 'Favorite this item and order today to make your morning coffee unforgettable!',
        quality_score: {
          overall_score: 93,
          seo_score: 91,
          readability_score: 95,
          persuasiveness_score: 92,
          summary: 'Superb artisan listing: emotional buyer storytelling, clean specs, and high-volume search tags.',
        },
        improvement_suggestions: [
          'Add a photo of the mug in someone\'s hands to demonstrate scale.',
          'Include exact diameter and height measurements in inches for gift buyers.',
        ],
        is_demo_mode: true,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      };
      storage.saveListing(starterExample);
      loaded = [starterExample];
    }

    setSavedListings(loaded);
  }, [checkHealth]);

  // Listing Handlers
  const handleGenerated = (listing: GeneratedListing, req: ListingGenerationRequest) => {
    setActiveListing(listing);
    setOriginalRequest(req);
    setCurrentTab('results');
  };

  const handleSaveListing = (listing: GeneratedListing) => {
    const saved = storage.saveListing(listing);
    const updated = storage.getSavedListings();
    setSavedListings(updated);
    setActiveListing(saved);
    addToast(`Saved "${listing.product_name}" to your library!`, 'success');
  };

  const handleOpenListing = (listing: SavedListing) => {
    setActiveListing(listing);
    setCurrentTab('results');
  };

  const handleDuplicateListing = (id: string) => {
    const dup = storage.duplicateListing(id);
    if (dup) {
      setSavedListings(storage.getSavedListings());
      addToast(`Duplicated "${dup.product_name}"`, 'success');
    }
  };

  const handleDeleteListing = (id: string) => {
    storage.deleteListing(id);
    setSavedListings(storage.getSavedListings());
    if (activeListing?.id === id) {
      setActiveListing(null);
    }
  };

  const handleClearAllData = () => {
    storage.clearAllLocalData();
    setSavedListings([]);
    setActiveListing(null);
    setSettings(storage.getUserSettings());
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = storage.saveUserSettings(newSettings);
    setSettings(updated);
  };

  const isCurrentListingSaved = Boolean(
    activeListing && savedListings.some((l) => l.id === activeListing.id)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        savedCount={savedListings.length}
        health={health}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'landing' && (
          <LandingPage onNavigate={setCurrentTab} />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            savedListings={savedListings}
            onNavigate={setCurrentTab}
            onOpenListing={handleOpenListing}
          />
        )}

        {currentTab === 'generator' && (
          <GeneratorPage
            onGenerated={handleGenerated}
            onNotify={addToast}
            health={health}
            loadingHealth={loadingHealth}
            onRefreshHealth={checkHealth}
            settings={settings}
          />
        )}

        {currentTab === 'results' && (
          <ResultsPage
            listing={activeListing}
            originalRequest={originalRequest}
            onSave={handleSaveListing}
            isSaved={isCurrentListingSaved}
            onRegenerateAll={() => setCurrentTab('generator')}
            onNotify={addToast}
            onUpdateListing={setActiveListing}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'library' && (
          <LibraryPage
            savedListings={savedListings}
            onOpenListing={handleOpenListing}
            onDuplicateListing={handleDuplicateListing}
            onDeleteListing={handleDeleteListing}
            onNavigate={setCurrentTab}
            onNotify={addToast}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsPage
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClearAllData={handleClearAllData}
            health={health}
            loadingHealth={loadingHealth}
            onRefreshHealth={checkHealth}
            onNotify={addToast}
          />
        )}
      </main>

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
