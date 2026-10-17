import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import {
  ListingGenerationRequest,
  Platform,
  Tone,
  TitleLength,
} from '../../types';

interface ListingFormProps {
  onSubmit: (data: ListingGenerationRequest) => void;
  isLoading: boolean;
  defaultPlatform?: Platform;
  defaultTone?: Tone;
  defaultLanguage?: string;
  isOllamaOffline?: boolean;
}

const SAMPLE_PRODUCTS: Record<string, Partial<ListingGenerationRequest>> = {
  ceramic_mug: {
    product_name: 'Artisan Speckled Ceramic Mug',
    category: 'Kitchen & Dining',
    description: '14oz handcrafted stoneware mug with a reactive cream and rust speckle glaze. Features an ergonomic thumb-rest handle and sturdy flat base. Microwave, dishwasher, and oven safe up to 350°F.',
    platform: 'etsy',
    brand_name: 'Earth & Kiln',
    target_audience: 'Coffee lovers, tea enthusiasts, and home aesthetic creators',
    features: ['14oz stoneware', 'Hand-thrown ceramic', 'Ergonomic thumb-rest', 'Dishwasher & microwave safe'],
    tone: 'friendly',
    keywords_to_include: ['handmade mug', 'stoneware pottery', 'cozy coffee cup'],
    words_to_avoid: ['cheap', 'mass-produced'],
    desired_title_length: 'medium',
  },
  ergonomic_keyboard: {
    product_name: 'ApexFlow Split Mechanical Keyboard',
    category: 'Electronics & Office',
    description: 'Ergonomic split mechanical keyboard with hot-swappable tactile switches, cushioned memory foam wrist rests, RGB backlighting, and Bluetooth 5.3 multi-device pairing.',
    platform: 'amazon',
    brand_name: 'ApexTech',
    target_audience: 'Software engineers, remote workers, and gamers with wrist strain',
    features: ['Split ergonomic layout', 'Hot-swappable switches', 'Bluetooth 5.3 + 2.4GHz', 'Memory foam wrist rest'],
    tone: 'professional',
    keywords_to_include: ['split keyboard', 'ergonomic mechanical keyboard', 'wrist support'],
    words_to_avoid: ['cure carpal tunnel', 'medical device'],
    desired_title_length: 'long',
  },
  leather_wallet: {
    product_name: 'The Nomad Minimalist Leather Wallet',
    category: 'Fashion & Accessories',
    description: 'Ultra-slim full-grain vegetable-tanned leather cardholder with RFID blocking aluminum core. Holds up to 8 cards plus folded cash with quick-access thumb ejector.',
    platform: 'shopify',
    brand_name: 'Aegis Goods',
    target_audience: 'Modern minimalists and everyday carry (EDC) enthusiasts',
    features: ['Full-grain leather', 'RFID blocking', 'Holds 8 cards + cash', 'Quick thumb pull tab'],
    tone: 'luxury',
    keywords_to_include: ['minimalist wallet', 'RFID cardholder', 'slim leather wallet'],
    words_to_avoid: ['cheap plastic'],
    desired_title_length: 'medium',
  },
};

export const ListingForm: React.FC<ListingFormProps> = ({
  onSubmit,
  isLoading,
  defaultPlatform = 'amazon',
  defaultTone = 'professional',
  defaultLanguage = 'English',
  isOllamaOffline = false,
}) => {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<Platform>(defaultPlatform);
  const [targetAudience, setTargetAudience] = useState('');
  const [brandName, setBrandName] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [tone, setTone] = useState<Tone>(defaultTone);
  const [language, setLanguage] = useState(defaultLanguage);
  const [keywordsInput, setKeywordsInput] = useState('');
  const [avoidWordsInput, setAvoidWordsInput] = useState('');
  const [desiredLength, setDesiredLength] = useState<TitleLength>('medium');
  const [demoMode, setDemoMode] = useState<boolean>(isOllamaOffline);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const loadPreset = (presetKey: string) => {
    const data = SAMPLE_PRODUCTS[presetKey];
    if (!data) return;
    setProductName(data.product_name || '');
    setCategory(data.category || '');
    setDescription(data.description || '');
    setPlatform(data.platform || 'amazon');
    setBrandName(data.brand_name || '');
    setTargetAudience(data.target_audience || '');
    setFeaturesInput(data.features ? data.features.join(', ') : '');
    setTone(data.tone || 'professional');
    setKeywordsInput(data.keywords_to_include ? data.keywords_to_include.join(', ') : '');
    setAvoidWordsInput(data.words_to_avoid ? data.words_to_avoid.join(', ') : '');
    setDesiredLength(data.desired_title_length || 'medium');
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!productName.trim()) {
      newErrors.productName = 'Product name is required';
    } else if (productName.trim().length < 2) {
      newErrors.productName = 'Product name must be at least 2 characters';
    }

    if (!category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Product details or description are required';
    } else if (description.trim().length < 5) {
      newErrors.description = 'Please provide at least a few descriptive details (5+ characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parseCommaList = (str: string) =>
      str
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    const payload: ListingGenerationRequest = {
      product_name: productName.trim(),
      category: category.trim(),
      description: description.trim(),
      platform,
      brand_name: brandName.trim() || undefined,
      target_audience: targetAudience.trim() || undefined,
      features: parseCommaList(featuresInput),
      tone,
      language: language.trim() || 'English',
      keywords_to_include: parseCommaList(keywordsInput),
      words_to_avoid: parseCommaList(avoidWordsInput),
      desired_title_length: desiredLength,
      demo_mode: demoMode,
    };

    onSubmit(payload);
  };

  const platforms: { id: Platform; label: string; desc: string; icon: string }[] = [
    { id: 'amazon', label: 'Amazon', desc: 'Keyword indexed & feature bullets', icon: '📦' },
    { id: 'etsy', label: 'Etsy', desc: 'Handcrafted story & 13 tags', icon: '🎨' },
    { id: 'shopify', label: 'Shopify / D2C', desc: 'Brand-led & conversion focused', icon: '🛍️' },
    { id: 'generic', label: 'Marketplace', desc: 'Versatile e-commerce standard', icon: '🌐' },
  ];

  const tones: { id: Tone; label: string }[] = [
    { id: 'professional', label: 'Professional' },
    { id: 'friendly', label: 'Friendly & Warm' },
    { id: 'persuasive', label: 'Persuasive' },
    { id: 'luxury', label: 'Luxury & Premium' },
    { id: 'minimal', label: 'Minimal & Direct' },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      {/* Header & Quick presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            Product Details
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Provide product basics; the AI will create SEO titles, descriptions, bullets, and tags.
          </p>
        </div>

        {/* Quick Example Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 mr-1">Load Demo:</span>
          <button
            type="button"
            onClick={() => loadPreset('ceramic_mug')}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-medium transition"
          >
            Ceramic Mug
          </button>
          <button
            type="button"
            onClick={() => loadPreset('ergonomic_keyboard')}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-medium transition"
          >
            Keyboard
          </button>
          <button
            type="button"
            onClick={() => loadPreset('leather_wallet')}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-medium transition"
          >
            Wallet
          </button>
        </div>
      </div>

      <div className="space-y-6 pt-6">
        {/* Platform Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
            Selling Platform <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {platforms.map((p) => {
              const active = platform === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    active
                      ? 'border-brand-600 bg-brand-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">{p.icon}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        active ? 'border-brand-600 bg-brand-600' : 'border-slate-300'
                      }`}
                    >
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{p.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{p.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Required Fields: Name & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                if (errors.productName) setErrors({ ...errors, productName: '' });
              }}
              placeholder="e.g. Ergonomic Memory Foam Pillow"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                errors.productName
                  ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30'
                  : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
              }`}
            />
            {errors.productName && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.productName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Product Category <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (errors.category) setErrors({ ...errors, category: '' });
              }}
              placeholder="e.g. Bedding & Sleep, Handmade Crafts, Electronics"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                errors.category
                  ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30'
                  : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
              }`}
            />
            {errors.category && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.category}
              </p>
            )}
          </div>
        </div>

        {/* Short description / details */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Product Details & Features <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {description.length} characters
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors({ ...errors, description: '' });
            }}
            rows={4}
            placeholder="Describe key specs, materials, dimensions, benefits, use cases, and what makes it special..."
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
              errors.description
                ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30'
                : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
            }`}
          />
          {errors.description && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.description}
            </p>
          )}
        </div>

        {/* Tone of Voice */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Tone of Voice
          </label>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  tone === t.id
                    ? 'border-brand-600 bg-brand-50 text-brand-700 font-semibold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Options Accordion */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition py-1"
          >
            <Sliders className="w-3.5 h-3.5 text-brand-600" />
            <span>{showAdvanced ? 'Hide Optional Settings' : 'Show Optional Settings (Audience, Keywords, Brand, Length)'}</span>
          </button>

          {showAdvanced && (
            <div className="space-y-4 pt-4 mt-2 bg-slate-50/60 p-4 rounded-xl border border-slate-200 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Brand / Store Name
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Nordic Haven"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Target Audience / Persona
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Busy parents, eco-conscious college students"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Specific Features (comma-separated)
                </label>
                <input
                  type="text"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="e.g. 100% organic cotton, machine washable, fits queen size"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Keywords to Include (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    placeholder="e.g. cooling pillow, side sleeper pillow"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Claims / Words to Avoid (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={avoidWordsInput}
                    onChange={(e) => setAvoidWordsInput(e.target.value)}
                    placeholder="e.g. cheap, cure insomnia, 100% miracle"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Desired Title Length
                  </label>
                  <select
                    value={desiredLength}
                    onChange={(e) => setDesiredLength(e.target.value as TitleLength)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="short">Short (&lt; 80 characters)</option>
                    <option value="medium">Medium (80 - 140 characters)</option>
                    <option value="long">Long (140 - 200 characters)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Language
                  </label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="e.g. English, Spanish, German"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Demo Mode Toggle */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-bold text-slate-800">
                Demo Mode (Simulation)
              </div>
              <div className="text-[11px] text-slate-500">
                Use simulated generation to test UI without running Ollama locally.
              </div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-600/25 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Listing Copy with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Product Listing</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
