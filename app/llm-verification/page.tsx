'use client';

import React, { useState } from 'react';
import { useSecurityStore } from '../../store/useSecurityStore';
import { 
  Cpu, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  Info,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

export default function LlmVerification() {
  const { findings, repositories } = useSecurityStore();
  const verifiedFindings = findings.filter(f => f.verifiedByLlm);
  const [activeJobId, setActiveJobId] = useState(verifiedFindings[0]?.id || 'f-101');

  const selectedFinding = findings.find(f => f.id === activeJobId);
  const selectedRepo = selectedFinding ? repositories.find(r => r.id === selectedFinding.repoId) : null;

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Banner */}
      <div className="border border-border bg-surface p-4 rounded flex justify-between items-center">
        <div className="space-y-0.5">
          <h2 className="text-sm font-sans font-bold text-white tracking-widest uppercase">AUTONOMOUS LLM VERIFICATION RUNS</h2>
          <p className="text-text-secondary text-[10px]">Inspect agent prompts and reasoning timelines that weed out false positives.</p>
        </div>

        <div className="flex items-center gap-2 border border-border bg-black/40 px-3 py-1.5 rounded text-success">
          <BrainCircuit className="w-4 h-4 text-success animate-pulse" />
          <span>LLM AGENTS: ONLINE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Verification Jobs list */}
        <div className="lg:col-span-4 border border-border bg-surface rounded flex flex-col overflow-hidden text-left min-h-[300px]">
          <div className="p-3 border-b border-border bg-black/45 select-none shrink-0">
            <span className="text-white text-[10px] font-bold">VERIFIED FINDINGS LIST</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {verifiedFindings.map((finding) => (
              <button 
                key={finding.id}
                onClick={() => setActiveJobId(finding.id)}
                className={`w-full p-3.5 hover:bg-card/20 transition text-left space-y-1.5 ${
                  finding.id === activeJobId ? 'bg-card/15' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{finding.id}</span>
                  <span className="text-success text-[10px] font-bold">Confidence: {finding.llmConfidence}%</span>
                </div>
                <h4 className="text-white font-sans truncate">{finding.title}</h4>
                <div className="text-[9px] text-text-secondary">File: {finding.affectedFile.split('/').pop()}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Verification details & timeline */}
        <div className="lg:col-span-8 space-y-4">
          {selectedFinding ? (
            <div className="border border-border bg-surface p-5 rounded space-y-6 text-left">
              {/* Header metrics */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-white font-sans font-bold text-sm uppercase">{selectedFinding.id} verification findings</h3>
                  <p className="text-[10px] text-text-secondary">Repository: {selectedRepo?.name || 'Unknown'}</p>
                </div>
                <div className="flex gap-2">
                  <div className="border border-border bg-black/30 p-2 rounded text-center min-w-[90px]">
                    <div className="text-text-secondary text-[8px] uppercase">CONFIDENCE</div>
                    <div className="text-success font-sans font-bold text-base">{selectedFinding.llmConfidence}%</div>
                  </div>
                  <div className="border border-border bg-black/30 p-2 rounded text-center min-w-[90px]">
                    <div className="text-text-secondary text-[8px] uppercase">MODEL</div>
                    <div className="text-white font-sans font-bold text-xs pt-1.5">Gemini 1.5 Pro</div>
                  </div>
                </div>
              </div>

              {/* Finding context */}
              <div className="border border-border bg-black/30 p-3.5 rounded space-y-2">
                <span className="text-text-secondary font-bold text-[9px] uppercase tracking-wider block border-b border-border/50 pb-1">VULNERABILITY DESCRIPTION</span>
                <p className="text-text-secondary leading-relaxed text-[11px] font-sans">{selectedFinding.description}</p>
              </div>

              {/* Timeline details */}
              <div className="space-y-4">
                <span className="text-text-secondary font-bold text-[9px] uppercase tracking-wider block border-b border-border/50 pb-1">AGENT TIMELINE AND DECISIONS</span>
                
                <div className="relative pl-5 border-l border-border ml-2.5 space-y-4">
                  {selectedFinding.timeline.map((step, idx) => (
                    <div key={idx} className="relative space-y-0.5">
                      <span className="absolute -left-[24.5px] top-1 w-2 h-2 rounded bg-success border border-success animate-pulse" />
                      <div className="flex justify-between font-mono text-[9px]">
                        <span className="text-white font-bold">{step.stage}</span>
                        <span className="text-text-secondary">{step.time}</span>
                      </div>
                      <p className="text-text-secondary leading-relaxed text-[10px] font-sans">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-border bg-surface p-12 rounded text-center text-text-secondary flex flex-col items-center gap-2">
              <HelpCircle className="w-8 h-8 text-border" />
              <span>Select an LLM verification job from the left panel to inspect details.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
