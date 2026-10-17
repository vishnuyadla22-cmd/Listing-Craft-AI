import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Award,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface LandingPageProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 text-center max-w-4xl mx-auto px-4">
        {/* Subtle pill banner */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Local Open-Source AI Copilot for Online Sellers</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Turn Rough Product Notes into{' '}
          <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
            Top-Converting Listings
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Craft high-ranking Amazon titles, story-driven Etsy descriptions, and branded Shopify listings in seconds using your local Qwen2.5 open-weight model. Zero cloud fees. Total privacy.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('generator')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-lg shadow-brand-600/25 transition flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Create My Listing</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('features-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-xs transition flex items-center justify-center gap-2"
          >
            <span>Explore Features</span>
          </button>
        </div>

        {/* Realistic Preview Mockup */}
        <div className="mt-12 text-left bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-3xl mx-auto">
          <div className="bg-slate-900 text-slate-300 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="ml-2 text-slate-400">ListingCraft AI • Amazon Preset Preview</span>
            </div>
            <span className="text-emerald-400 font-sans font-bold text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              Quality Score: 94/100
            </span>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Optimized Amazon Title (142 Chars)
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900">
                Aegis Nomad Genuine Full-Grain Leather Wallet | RFID Blocking Slim Front Pocket Bifold with Quick Pull-Tab for Cards &amp; Cash
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Features
                </div>
                <div className="text-slate-600 leading-relaxed">
                  [RFID SHIELD PROTECTION] Tested to block 13.56 MHz signals.<br />
                  [PREMIUM FULL-GRAIN] Ages with a distinctive, rich patina.
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-brand-600" /> Target Keywords
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-1.5 py-0.5 rounded bg-white border text-[11px] text-slate-700">#rfid-wallet</span>
                  <span className="px-1.5 py-0.5 rounded bg-white border text-[11px] text-slate-700">#leather-cardholder</span>
                  <span className="px-1.5 py-0.5 rounded bg-white border text-[11px] text-slate-700">#slim-edc</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate marketplace-ready copy in three straightforward steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Input Product Basics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your product name, specifications, materials, and choose your platform (Amazon, Etsy, Shopify, or general).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Local AI Generation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Qwen2.5 3B produces platform-compliant titles, formatted bullet points, search keywords, and an instant quality score.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Copy, Save &amp; Publish</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review, edit individual sections, copy one-click formatting, or download Markdown files straight to your catalog.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features-section" className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Engineered for Online Sellers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Built specifically to address seller pain points without costly SaaS subscriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Platform-Specific Copy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Formats Amazon bullet points with capitalized benefits, generates 13 concise search tags for Etsy, and produces lifestyle copy for Shopify.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Ethical &amp; Grounded</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict copywriting prompts prevent hallucinated medical claims, unverified certifications, or fake warranties that risk account suspension.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Listing Quality Score</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Get an instant audit on SEO keywords, readability, and persuasiveness with actionable tips before publishing.
            </p>
          </div>
        </div>
      </section>

      {/* Local AI & Privacy Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-brand-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                100% Local AI &amp; Zero Cloud Tracking
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Keep your confidential new products and supplier notes entirely private.
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            ListingCraft AI connects directly to your local Ollama daemon running the open-weight <strong>Qwen2.5 3B</strong> model. Your product drafts and brand keywords never touch external cloud APIs, paid tokens, or third-party tracking services. All saved listings reside strictly in your browser&apos;s localStorage.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No API Keys Required
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Offline Capable
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Open Source
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-8 text-center text-xs text-slate-500 max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <strong>ListingCraft AI</strong> • Open-Source E-Commerce Copywriter
        </div>
        <div>
          Powered by FastAPI, React, and Ollama (Qwen2.5 3B)
        </div>
      </footer>
    </div>
  );
};
