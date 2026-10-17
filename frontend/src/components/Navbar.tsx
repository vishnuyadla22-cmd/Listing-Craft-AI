import React, { useState } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  PenSquare,
  Bookmark,
  Settings as SettingsIcon,
  Menu,
  X,
  Compass,
  Cpu,
} from 'lucide-react';
import { NavigationTab, HealthStatus } from '../types';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  savedCount: number;
  health: HealthStatus | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  savedCount,
  health,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { tab: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { tab: 'generator', label: 'Generator', icon: <PenSquare className="w-4 h-4" /> },
    { tab: 'library', label: 'Saved Listings', icon: <Bookmark className="w-4 h-4" />, badge: savedCount },
    { tab: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  const handleNav = (tab: NavigationTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const isAiReady = health?.ollama_connected && health?.model_available;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => handleNav('landing')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 tracking-tight text-base flex items-center gap-1.5">
                ListingCraft <span className="text-brand-600 text-xs px-1.5 py-0.5 rounded bg-brand-50 font-mono font-medium">AI</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium tracking-wide">
                Local E-Commerce Copilot
              </div>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNav('landing')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                currentTab === 'landing'
                  ? 'text-brand-700 bg-brand-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore
            </button>
            {navItems.map((item) => {
              const active = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => handleNav(item.tab)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 relative ${
                    active
                      ? 'text-brand-700 bg-brand-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-slate-200 text-slate-800 font-semibold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Action & AI Status Indicator */}
        <div className="hidden sm:flex items-center gap-3">
          {/* AI Connection status pill */}
          <div
            title={
              isAiReady
                ? `Ollama AI Ready: ${health?.model_name}`
                : health?.ollama_connected
                ? `Model Missing: ${health?.model_name}`
                : 'Ollama AI Offline'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isAiReady
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAiReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <Cpu className="w-3.5 h-3.5 opacity-80" />
            <span>{isAiReady ? 'Ollama Online' : 'AI Offline'}</span>
          </div>

          <button
            onClick={() => handleNav('generator')}
            className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium shadow-sm shadow-brand-600/20 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            New Listing
          </button>
        </div>

        {/* Mobile menu hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <button
            onClick={() => handleNav('landing')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 ${
              currentTab === 'landing' ? 'bg-brand-50 text-brand-700' : 'text-slate-700'
            }`}
          >
            <Compass className="w-4 h-4" />
            Explore & About
          </button>
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => handleNav(item.tab)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                currentTab === item.tab ? 'bg-brand-50 text-brand-700' : 'text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                {item.label}
              </div>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
