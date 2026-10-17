export type Platform = 'amazon' | 'etsy' | 'shopify' | 'generic';

export type Tone = 'professional' | 'friendly' | 'persuasive' | 'minimal' | 'luxury';

export type TitleLength = 'short' | 'medium' | 'long';

export interface ListingGenerationRequest {
  product_name: string;
  category: string;
  description: string;
  platform: Platform;
  target_audience?: string;
  brand_name?: string;
  features?: string[];
  tone?: Tone;
  language?: string;
  keywords_to_include?: string[];
  words_to_avoid?: string[];
  desired_title_length?: TitleLength;
  demo_mode?: boolean;
}

export interface ListingQualityScore {
  overall_score: number;
  seo_score: number;
  readability_score: number;
  persuasiveness_score: number;
  summary: string;
}

export interface GeneratedListing {
  id: string;
  product_name: string;
  platform: Platform;
  title: string;
  alternative_titles: string[];
  short_description: string;
  full_description: string;
  selling_points: string[];
  keywords: string[];
  tags: string[];
  call_to_action: string;
  quality_score: ListingQualityScore;
  improvement_suggestions: string[];
  is_demo_mode: boolean;
  created_at: string;
}

export interface SavedListing extends GeneratedListing {
  updated_at?: string;
  user_notes?: string;
}

export interface HealthStatus {
  status: string;
  ollama_connected: boolean;
  model_available: boolean;
  model_name: string;
  available_models: string[];
  message: string;
  setup_guidance?: string | null;
}

export interface UserSettings {
  preferredTone: Tone;
  defaultPlatform: Platform;
  preferredLanguage: string;
  autoDemoFallback: boolean;
}

export type NavigationTab = 'landing' | 'dashboard' | 'generator' | 'results' | 'library' | 'settings';
