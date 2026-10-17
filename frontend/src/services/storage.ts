import { SavedListing, GeneratedListing, UserSettings } from '../types';

const STORAGE_KEY_LISTINGS = 'listingcraft_saved_listings_v1';
const STORAGE_KEY_SETTINGS = 'listingcraft_user_settings_v1';

const DEFAULT_SETTINGS: UserSettings = {
  preferredTone: 'professional',
  defaultPlatform: 'amazon',
  preferredLanguage: 'English',
  autoDemoFallback: true,
};

export const storage = {
  /**
   * Retrieves all saved listings from localStorage, handling malformed data safely.
   */
  getSavedListings(): SavedListing[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LISTINGS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && typeof item === 'object' && item.id);
      }
      return [];
    } catch (err) {
      console.warn('Failed to parse saved listings from localStorage:', err);
      return [];
    }
  },

  /**
   * Saves a new listing or updates an existing one
   */
  saveListing(listing: GeneratedListing | SavedListing): SavedListing {
    const listings = this.getSavedListings();
    const now = new Date().toISOString();
    
    const index = listings.findIndex(l => l.id === listing.id);
    let saved: SavedListing;

    if (index >= 0) {
      saved = {
        ...listings[index],
        ...listing,
        updated_at: now,
      };
      listings[index] = saved;
    } else {
      saved = {
        ...listing,
        created_at: listing.created_at || now,
        updated_at: now,
      };
      listings.unshift(saved);
    }

    try {
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(listings));
    } catch (err) {
      console.error('Failed to save listing to localStorage:', err);
    }
    return saved;
  },

  /**
   * Deletes a listing by ID
   */
  deleteListing(id: string): boolean {
    const listings = this.getSavedListings();
    const filtered = listings.filter(l => l.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(filtered));
      return true;
    } catch (err) {
      console.error('Failed to delete listing from localStorage:', err);
      return false;
    }
  },

  /**
   * Duplicates an existing listing
   */
  duplicateListing(id: string): SavedListing | null {
    const listings = this.getSavedListings();
    const original = listings.find(l => l.id === id);
    if (!original) return null;

    const duplicate: SavedListing = {
      ...original,
      id: crypto.randomUUID ? crypto.randomUUID() : `dup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      product_name: `${original.product_name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    listings.unshift(duplicate);
    try {
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(listings));
      return duplicate;
    } catch (err) {
      console.error('Failed to duplicate listing in localStorage:', err);
      return null;
    }
  },

  /**
   * User preferences
   */
  getUserSettings(): UserSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveUserSettings(settings: Partial<UserSettings>): UserSettings {
    const current = this.getUserSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
    return updated;
  },

  /**
   * Clear all local storage data
   */
  clearAllLocalData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_LISTINGS);
      localStorage.removeItem(STORAGE_KEY_SETTINGS);
    } catch (err) {
      console.error('Failed to clear localStorage:', err);
    }
  },
};
