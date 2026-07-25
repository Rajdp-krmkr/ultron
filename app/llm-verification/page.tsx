'use client';

import React, { useState } from 'react';
import { useSecurityStore } from '../../store/useSecurityStore';
import { 
  BrainCircuit,
  HelpCircle,
  ShieldCheck,
  Zap,
  FileSearch,
  Code
} from 'lucide-react';

export default function LlmVerification() {
  const { findings, repositories, selectedRepoId, settings } = useSecurityStore();
  const verifiedFindings = findings.filter(f => f.verifiedByLlm);
  const activeRepo = repositories.find(r => r.id === selectedRepoId);
  const [activeJobId, setActiveJobId] = useState(verifiedFindings[0]?.id || 'f-101');

  const selectedFinding = findings.find(f => f.id === activeJobId);
  const selectedRepo = selectedFinding ? repositories.find(r => r.id === selectedFinding.repoId) : null;

  return (
    <div className="space-y-4 font-mono text-xs text-left">
      {/* Banner */}
      <div className="border border-border bg-surface p-3 rounded flex justify-between items-center">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5 text-primary" />
            <h2 className="text-xs font-sans font-bold text-white tracking-widest uppercase">AGENTIC LLM DETECTOR & VERIFICATION PASSES</h2>
          </div>
          <p className="text-text-secondary text-[10px]">
            Agentic verification loop (<code className="text-white bg-black px-1 rounded">READ_FILE</code>, <code className="text-white bg-black px-1 rounded">READ_FUNCTION</code>, <code className="text-white bg-black px-1 rounded">RECORD_FACT</code>, <code className="text-white bg-black px-1 rounded">FINISH</code>) with 80-95% token reduction & Zero-Flow fallback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="border border-border bg-black/40 px-2.5 py-1 rounded text-success flex items-center gap-1.5 text-[10px]">
            <Zap className="w-3 h-3 text-success animate-pulse" />
            <span>MODE: {settings.llm_mode.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Active Verification Jobs list */}
        <div className="lg:col-span-4 border border-border bg-surface rounded flex flex-col overflow-hidden min-h-[300px]">
          <div className="p-2.5 border-b border-border bg-black/45 select-none shrink-0 flex justify-between items-center">
            <span className="text-white text-[10px] font-bold">VERIFIED FINDINGS LIST</span>
            <span className="text-[9px] text-text-secondary">{verifiedFindings.length} VERIFIED</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {verifiedFindings.map((finding) => (
              <button 
                type="button"
                key={finding.id}
                onClick={() => setActiveJobId(finding.id)}
                className={`w-full p-3 hover:bg-card/20 transition text-left space-y-1 ${
                  finding.id === activeJobId ? 'bg-card/20 border-l-2 border-primary' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-[11px]">{finding.id}</span>
                  <span className="text-success text-[9px] font-bold">Confidence: {finding.llmConfidence}%</span>
                </div>
                <h4 className="text-white font-sans text-[11px] truncate">{finding.title}</h4>
                <div className="text-[9px] text-text-secondary">File: {finding.affectedFile.split('/').pop()}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Verification details & timeline */}
        <div className="lg:col-span-8 space-y-3">
          {selectedFinding ? (
            <div className="border border-border bg-surface p-4 rounded space-y-4 text-left">
              {/* Header metrics */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-white font-sans font-bold text-xs uppercase">{selectedFinding.id} AGENTIC TRACE DETAILS</h3>
                  <p className="text-[9px] text-text-secondary">Target Repository: {selectedRepo?.name || 'Unknown'}</p>
                </div>
                <div className="flex gap-2">
                  <div className="border border-border bg-black/40 px-2.5 py-1 rounded text-center min-w-[80px]">
                    <div className="text-text-secondary text-[7px] uppercase font-bold">CONFIDENCE</div>
                    <div className="text-success font-sans font-bold text-xs">{selectedFinding.llmConfidence}%</div>
                  </div>
                  <div className="border border-border bg-black/40 px-2.5 py-1 rounded text-center min-w-[100px]">
                    <div className="text-text-secondary text-[7px] uppercase font-bold">ACTIVE MODEL</div>
                    <div className="text-white font-sans font-bold text-[10px] pt-0.5">{settings.models.detector}</div>
                  </div>
                </div>
              </div>

              {/* Finding context */}
              <div className="border border-border bg-black/30 p-3 rounded space-y-1.5">
                <span className="text-text-secondary font-bold text-[8px] uppercase tracking-wider block border-b border-border/50 pb-0.5">
                  PROVENANCE TAINT TRACE
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                  <div><span className="text-text-secondary">SOURCE:</span> <code className="text-primary">{selectedFinding.source}</code></div>
                  <div><span className="text-text-secondary">SINK:</span> <code className="text-critical">{selectedFinding.sink}</code></div>
                </div>
                <p className="text-text-secondary leading-relaxed text-[10px] font-sans pt-1">{selectedFinding.description}</p>
              </div>

              {/* Agentic Execution Loop Timeline */}
              <div className="space-y-3">
                <span className="text-text-secondary font-bold text-[8px] uppercase tracking-wider block border-b border-border/50 pb-0.5">
                  AGENTIC EXPLORATION STEPS (`READ_FILE` / `READ_FUNCTION` / `RECORD_FACT`)
                </span>
                
                <div className="relative pl-4 border-l border-border ml-2 space-y-3">
                  {selectedFinding.timeline.map((step, idx) => (
                    <div key={idx} className="relative space-y-0.5">
                      <span className="absolute -left-[20.5px] top-1 w-1.5 h-1.5 rounded-full bg-success border border-success animate-pulse" />
                      <div className="flex justify-between font-mono text-[9px]">
                        <span className="text-primary font-bold">{step.stage}</span>
                        <span className="text-text-secondary">{step.time}</span>
                      </div>
                      <p className="text-text-secondary leading-relaxed text-[10px] font-sans">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-border bg-surface p-8 rounded text-center text-text-secondary flex flex-col items-center gap-2">
              <HelpCircle className="w-6 h-6 text-border" />
              <span>Select a verified finding from the left list to inspect agent trace steps.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
