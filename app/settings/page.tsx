'use client';

import React, { useState } from 'react';
import { useSecurityStore } from '../../store/useSecurityStore';
import { 
  Save, 
  Key, 
  Cpu, 
  Layers, 
  Globe,
  RotateCcw,
  Sliders,
  Terminal,
  Database
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings, addTerminalLog } = useSecurityStore();

  const [mode, setMode] = useState<'local' | 'cloud'>(settings.llm_mode);
  const [useLlm, setUseLlm] = useState(settings.use_llm);
  const [verbose, setVerbose] = useState(settings.verbose);
  const [visualise, setVisualise] = useState(settings.visualise);
  const [enableCache, setEnableCache] = useState(settings.enable_cache);
  const [cacheOnly, setCacheOnly] = useState(settings.cache_only);

  const [workers, setWorkers] = useState(settings.num_workers);
  const [timeout, setTimeoutVal] = useState(settings.timeout);
  const [temperature, setTemperature] = useState(settings.temperature);
  const [maxTokens, setMaxTokens] = useState(settings.max_tokens);
  const [llmUrl, setLlmUrl] = useState(settings.llm_url);

  const [detectorModel, setDetectorModel] = useState(settings.models.detector);
  const [exploiterModel, setExploiterModel] = useState(settings.models.exploiter);
  const [reporterModel, setReporterModel] = useState(settings.models.reporter);
  const [defaultModel, setDefaultModel] = useState(settings.models.default);

  const [groqKey, setGroqKey] = useState(settings.api_keys.groq);
  const [geminiKey, setGeminiKey] = useState(settings.api_keys.gemini);
  const [nvidiaKey, setNvidiaKey] = useState(settings.api_keys.nvidia);

  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      llm_mode: mode,
      use_llm: useLlm,
      verbose,
      visualise,
      enable_cache: enableCache,
      cache_only: cacheOnly,
      num_workers: workers,
      timeout,
      temperature,
      max_tokens: maxTokens,
      llm_url: llmUrl,
      models: {
        detector: detectorModel,
        exploiter: exploiterModel,
        reporter: reporterModel,
        default: defaultModel
      },
      api_keys: {
        groq: groqKey,
        gemini: geminiKey,
        nvidia: nvidiaKey
      }
    });
    addTerminalLog('ultron_config.json updated successfully.', 'success');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetDefaults = () => {
    resetSettings();
    addTerminalLog('Reset configuration to defaults (ultron config reset).', 'info');
  };

  return (
    <div className="space-y-4 font-mono text-xs max-w-4xl mx-auto text-left pb-6">
      {/* Banner */}
      <div className="border border-border bg-surface p-3 rounded flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-primary" />
            <h2 className="text-xs font-sans font-bold text-white tracking-widest uppercase">ULTRON CONFIGURATION MANAGER</h2>
          </div>
          <p className="text-text-secondary text-[10px]">Manages runtime preferences stored in <code className="text-white bg-black px-1 rounded">ultron_config.json</code>.</p>
        </div>
        <button
          type="button"
          onClick={handleResetDefaults}
          className="px-2.5 py-1 border border-border bg-black hover:border-primary/50 text-[10px] text-text-secondary hover:text-white rounded transition flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          RESET DEFAULTS
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-4">
        {/* Section 1: Execution Mode & Cloud Providers */}
        <div className="border border-border bg-surface p-4 rounded space-y-4">
          <h3 className="font-sans font-bold text-white tracking-widest text-[9px] uppercase border-b border-border pb-1 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-primary" /> EXECUTION MODE & CLOUD API KEYS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-text-secondary block font-bold text-[9px] uppercase">LLM EXECUTION MODE (`llm_mode`)</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('local')}
                  className={`py-2 px-3 border rounded text-[10px] font-bold text-center transition ${
                    mode === 'local' ? 'border-primary bg-primary/10 text-white shadow-[0_0_8px_rgba(255,32,32,0.2)]' : 'border-border bg-black text-text-secondary hover:text-white'
                  }`}
                >
                  LOCAL (Ollama)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('cloud')}
                  className={`py-2 px-3 border rounded text-[10px] font-bold text-center transition ${
                    mode === 'cloud' ? 'border-primary bg-primary/10 text-white shadow-[0_0_8px_rgba(255,32,32,0.2)]' : 'border-border bg-black text-text-secondary hover:text-white'
                  }`}
                >
                  CLOUD CHAIN
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-text-secondary block font-bold text-[9px] uppercase">LOCAL LLM BASE URL (`llm_url`)</label>
              <input 
                type="text" 
                value={llmUrl}
                onChange={(e) => setLlmUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full bg-black border border-border rounded px-2.5 py-1.5 text-white font-mono text-[11px] focus:border-primary/50 outline-none"
              />
            </div>
          </div>

          {mode === 'cloud' && (
            <div className="space-y-3 pt-2 border-t border-border/50">
              <span className="text-text-secondary text-[9px] block font-bold uppercase">CLOUD CHAIN API KEYS (`api_keys`)</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-text-secondary text-[9px]">Groq Key</label>
                  <input 
                    type="password" 
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full bg-black border border-border rounded px-2.5 py-1 text-white font-mono text-[10px] outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-text-secondary text-[9px]">Gemini Key</label>
                  <input 
                    type="password" 
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AI..."
                    className="w-full bg-black border border-border rounded px-2.5 py-1 text-white font-mono text-[10px] outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-text-secondary text-[9px]">NVIDIA Key</label>
                  <input 
                    type="password" 
                    value={nvidiaKey}
                    onChange={(e) => setNvidiaKey(e.target.value)}
                    placeholder="nvapi-..."
                    className="w-full bg-black border border-border rounded px-2.5 py-1 text-white font-mono text-[10px] outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Agent Model Overrides */}
        <div className="border border-border bg-surface p-4 rounded space-y-3">
          <h3 className="font-sans font-bold text-white tracking-widest text-[9px] uppercase border-b border-border pb-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-primary" /> AGENT MODEL OVERRIDES
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-text-secondary block font-bold text-[9px]">Detector Model</label>
              <input 
                type="text" 
                value={detectorModel}
                onChange={(e) => setDetectorModel(e.target.value)}
                className="w-full bg-black border border-border rounded px-2.5 py-1.5 text-white font-mono text-[10px] outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-text-secondary block font-bold text-[9px]">Exploiter Model (planned)</label>
              <input 
                type="text" 
                value={exploiterModel}
                onChange={(e) => setExploiterModel(e.target.value)}
                className="w-full bg-black border border-border rounded px-2.5 py-1.5 text-white font-mono text-[10px] outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-text-secondary block font-bold text-[9px]">Reporter Model (planned)</label>
              <input 
                type="text" 
                value={reporterModel}
                onChange={(e) => setReporterModel(e.target.value)}
                className="w-full bg-black border border-border rounded px-2.5 py-1.5 text-white font-mono text-[10px] outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-text-secondary block font-bold text-[9px]">Default Fallback</label>
              <input 
                type="text" 
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="w-full bg-black border border-border rounded px-2.5 py-1.5 text-white font-mono text-[10px] outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Engine Parameters */}
        <div className="border border-border bg-surface p-4 rounded space-y-3">
          <h3 className="font-sans font-bold text-white tracking-widest text-[9px] uppercase border-b border-border pb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" /> ENGINE RUNTIME PARAMETERS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-text-secondary block font-bold text-[9px]">Parallel Workers (`num_workers`)</label>
              <input 
                type="number" 
                min={1} 
                max={16}
                value={workers}
                onChange={(e) => setWorkers(parseInt(e.target.value) || 3)}
                className="w-full bg-black border border-border rounded px-2.5 py-1.5 text-white font-mono text-[10px] outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-text-secondary block font-bold text-[9px]">Timeout Sec (`timeout`)</label>
              <input 
                type="number" 
                min={5} 
                max={600}
                value={timeout}
                onChange={(e) => setTimeoutVal(parseInt(e.target.value) || 30)}
                className="w-full bg-black border border-border rounded px-2.5 py-1.5 text-white font-mono text-[10px] outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-text-secondary block font-bold text-[9px]">Temperature (`temperature`)</label>
              <input 
                type="number" 
                step="0.05"
                min={0} 
                max={1}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value) || 0.1)}
                className="w-full bg-black border border-border rounded px-2.5 py-1.5 text-white font-mono text-[10px] outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-text-secondary block font-bold text-[9px]">Max Tokens (`max_tokens`)</label>
              <input 
                type="number" 
                min={64} 
                max={4096}
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value) || 512)}
                className="w-full bg-black border border-border rounded px-2.5 py-1.5 text-white font-mono text-[10px] outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Engine Feature Flags */}
        <div className="border border-border bg-surface p-4 rounded space-y-3">
          <h3 className="font-sans font-bold text-white tracking-widest text-[9px] uppercase border-b border-border pb-1 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-primary" /> FEATURE FLAGS & CACHING
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-[10px]">
            <div className="flex items-center justify-between border border-border bg-black/30 p-2.5 rounded">
              <span className="text-text-secondary font-bold">ENABLE LLM (`use_llm`)</span>
              <button
                type="button"
                onClick={() => setUseLlm(!useLlm)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors border duration-200 ${
                  useLlm ? 'bg-primary border-primary' : 'bg-black border-border'
                }`}
              >
                <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-200 ${
                  useLlm ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between border border-border bg-black/30 p-2.5 rounded">
              <span className="text-text-secondary font-bold">ENABLE CACHE (`enable_cache`)</span>
              <button
                type="button"
                onClick={() => setEnableCache(!enableCache)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors border duration-200 ${
                  enableCache ? 'bg-primary border-primary' : 'bg-black border-border'
                }`}
              >
                <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-200 ${
                  enableCache ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between border border-border bg-black/30 p-2.5 rounded">
              <span className="text-text-secondary font-bold">CACHE ONLY (`cache_only`)</span>
              <button
                type="button"
                onClick={() => setCacheOnly(!cacheOnly)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors border duration-200 ${
                  cacheOnly ? 'bg-primary border-primary' : 'bg-black border-border'
                }`}
              >
                <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-200 ${
                  cacheOnly ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between border border-border bg-black/30 p-2.5 rounded">
              <span className="text-text-secondary font-bold">VERBOSE TRACING (`verbose`)</span>
              <button
                type="button"
                onClick={() => setVerbose(!verbose)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors border duration-200 ${
                  verbose ? 'bg-primary border-primary' : 'bg-black border-border'
                }`}
              >
                <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-200 ${
                  verbose ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between border border-border bg-black/30 p-2.5 rounded">
              <span className="text-text-secondary font-bold">AUTO-OPEN SVGS (`visualise`)</span>
              <button
                type="button"
                onClick={() => setVisualise(!visualise)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors border duration-200 ${
                  visualise ? 'bg-primary border-primary' : 'bg-black border-border'
                }`}
              >
                <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-200 ${
                  visualise ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Save footer button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-4 py-2 rounded flex items-center gap-1.5 transition active:scale-95 border border-transparent shadow-[0_0_10px_rgba(255,32,32,0.25)] cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaved ? 'CONFIG SAVED' : 'SAVE CONFIGURATION'}
          </button>
        </div>
      </form>
    </div>
  );
}
