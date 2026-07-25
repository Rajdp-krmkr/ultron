'use client';

import React, { useState } from 'react';
import { useSecurityStore } from '../../store/useSecurityStore';
import { 
  Settings as SettingsIcon, 
  Save, 
  Key, 
  Cpu, 
  Layers, 
  Eye, 
  CheckCircle,
  HelpCircle,
  Lock
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, addTerminalLog } = useSecurityStore();
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [selectedProvider, setSelectedProvider] = useState(settings.llmProvider);
  const [concurrency, setConcurrency] = useState(settings.workers);
  const [timeout, setTimeoutVal] = useState(settings.timeout);
  const [cache, setCache] = useState(settings.cacheEnabled);
  const [glow, setGlow] = useState(settings.visualGlow);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      apiKey,
      llmProvider: selectedProvider,
      workers: concurrency,
      timeout,
      cacheEnabled: cache,
      visualGlow: glow
    });
    addTerminalLog('System configurations updated successfully.', 'success');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-3xl mx-auto text-left">
      {/* Banner */}
      <div className="border border-border bg-surface p-4 rounded">
        <h2 className="text-sm font-sans font-bold text-white tracking-widest uppercase mb-1">SYSTEM CONFIGURATION PANEL</h2>
        <p className="text-text-secondary text-[10px]">Configure scanner worker settings, LLM verification providers, and dashboard parameters.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="border border-border bg-surface p-6 rounded space-y-6">
        {/* Section 1: Engine Credentials */}
        <div className="space-y-4">
          <h3 className="font-sans font-bold text-white tracking-widest text-[10px] uppercase border-b border-border pb-1 flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-primary" /> API KEYS & CREDENTIALS
          </h3>

          <div className="space-y-2">
            <label className="text-text-secondary block">ULTRON SECURITY ENGINE KEY</label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-black border border-border rounded px-3 py-2 text-white font-mono text-xs focus:border-primary/50 outline-none"
            />
          </div>
        </div>

        {/* Section 2: LLM Verification Provider */}
        <div className="space-y-4 border-t border-border pt-5">
          <h3 className="font-sans font-bold text-white tracking-widest text-[10px] uppercase border-b border-border pb-1 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-primary" /> LLM AGENT CONFIGURATION
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-text-secondary block">TARGET PROVIDER MODEL</label>
              <select 
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full bg-black border border-border rounded px-3 py-2 text-white font-mono text-xs focus:border-primary/50 outline-none"
              >
                <option value="Google Gemini 1.5 Pro">Google Gemini 1.5 Pro</option>
                <option value="GPT-4o Security Expert">GPT-4o Security Expert</option>
                <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-text-secondary block">MAX CONCURRENCY WORKERS</label>
              <input 
                type="number" 
                min={1} 
                max={16}
                value={concurrency}
                onChange={(e) => setConcurrency(parseInt(e.target.value) || 4)}
                className="w-full bg-black border border-border rounded px-3 py-2 text-white font-mono text-xs focus:border-primary/50 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Engine Parameters */}
        <div className="space-y-4 border-t border-border pt-5">
          <h3 className="font-sans font-bold text-white tracking-widest text-[10px] uppercase border-b border-border pb-1 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-primary" /> DIAGNOSTIC PRESETS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-text-secondary block">SCAN TIMEOUT (SECONDS)</label>
              <input 
                type="number" 
                min={10} 
                max={1800}
                value={timeout}
                onChange={(e) => setTimeoutVal(parseInt(e.target.value) || 180)}
                className="w-full bg-black border border-border rounded px-3 py-2 text-white font-mono text-xs focus:border-primary/50 outline-none"
              />
            </div>

            <div className="flex items-center justify-between sm:pt-6">
              <span className="text-text-secondary">ENABLE SCAN COMPILATION CACHE</span>
              <button
                type="button"
                onClick={() => setCache(!cache)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors border duration-200 focus:outline-none ${
                  cache ? 'bg-primary border-primary' : 'bg-black border-border'
                }`}
              >
                <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                  cache ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Interface Styles */}
        <div className="space-y-4 border-t border-border pt-5">
          <h3 className="font-sans font-bold text-white tracking-widest text-[10px] uppercase border-b border-border pb-1 flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-primary" /> VISUAL STYLES CONFIGS
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-text-secondary">CYBERPUNK NEON GLOW BORDERS</span>
            <button
              type="button"
              onClick={() => setGlow(!glow)}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors border duration-200 focus:outline-none ${
                glow ? 'bg-primary border-primary' : 'bg-black border-border'
              }`}
            >
              <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                glow ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Save button footer */}
        <div className="border-t border-border pt-5 flex justify-end">
          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-4 py-2.5 rounded flex items-center gap-1.5 transition active:scale-95 border border-transparent shadow-[0_0_10px_rgba(255,32,32,0.2)]"
          >
            <Save className="w-4 h-4" />
            {isSaved ? 'SETTINGS SAVED' : 'SAVE SETTINGS'}
          </button>
        </div>
      </form>
    </div>
  );
}
