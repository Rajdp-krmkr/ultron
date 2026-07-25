'use client';

import React, { useEffect, useState } from 'react';
import { useSecurityStore } from '../../store/useSecurityStore';
import { 
  GitBranch, 
  Code2, 
  Workflow, 
  Activity, 
  FileJson, 
  Binary, 
  Cpu, 
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCw,
  SearchCode,
  Layers
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PipelineVisualizer() {
  const router = useRouter();
  const { pipelineState, repositories, startAnalysis, addTerminalLog } = useSecurityStore();
  const [activeStageLogs, setActiveStageLogs] = useState<string[]>([]);

  const stages = [
    { name: 'Clone Repository', icon: GitBranch, description: 'Fetch source-code archive via HTTPS/SSH checkout' },
    { name: 'Language Detection', icon: SearchCode, description: 'Inspect extensions and resolve package workspace configurations' },
    { name: 'AST Parsing', icon: Code2, description: 'Construct abstract syntax tree mappings for symbol tracking' },
    { name: 'IR Extraction', icon: FileJson, description: 'Translate AST objects to Single Static Assignment 3-address codes' },
    { name: 'Call Graph Mapping', icon: Activity, description: 'Extract cross-file invocation networks and callback chains' },
    { name: 'Backward Taint Analysis', icon: Workflow, description: 'Trace user payloads backwards from vulnerable execution sinks' },
    { name: 'Security Graph Compilation', icon: Layers, description: 'Audit API routers, route gates, and persistence boundaries' },
    { name: 'Rule Engine Audit', icon: Binary, description: 'Filter target SSA IR blocks against vulnerability rules signature' },
    { name: 'LLM Agent Verification', icon: Cpu, description: 'Instruct autonomous LLM verification agents to audit validity' },
    { name: 'Generate Reports', icon: FileText, description: 'Compile aggregate findings formats in PDF, JSON, and Markdown' }
  ];

  const activeRepo = repositories.find(r => r.id === pipelineState.activeRepoId);

  // Generate mock telemetry logs per compilation stage
  const stageLogsMap: Record<number, string[]> = {
    0: ['git clone --depth=1 https://github.com/...', 'Checking out main branch...', 'Cloning completed. 412 files fetched in 452ms.'],
    1: ['Detecting codebase schemas...', 'Languages identified: TypeScript (82%), JSON (12%), HTML (6%)', 'Selecting analysis preset: TypeScript configuration loaded.'],
    2: ['Initializing compiler compiler target compiler...', 'Parsing 142 module declarations...', 'AST compilation complete. Symbol Table populated.'],
    3: ['Translating compiler representation to SSA...', 'Generating 3-address instructions blocks...', 'Symbolic provenance traces mapped: 450 registers written.'],
    4: ['Auditing routing pathways and caller scopes...', 'Resolving callback bindings...', 'Compiled Call Graph: 24 entry points, 142 intra-file links resolved.'],
    5: ['Applying backward-taint propagation algorithms...', 'Tracking 4 database sink expressions...', 'Trace path discovered: route parameter propagates to executeDbQuery (potential SQL Injection).'],
    6: ['Mapping security boundaries...', 'Resolving middleware parameters...', 'Boundaries verified: 4 routes exposed, 2 db adapters connected.'],
    7: ['Loading 5 vulnerability detection rules...', 'Auditing intermediate codes structures against signatures...', 'Match detected on SEC-SQL-01. Marking target location for LLM checks.'],
    8: ['Invoking local agent: Google Gemini 1.5 Pro', 'Scanning affected files block surrounding line 42...', 'Agent Verdict: SQL Injection confirmed (97% certainty). Zero sanitization detected.'],
    9: ['Compiling aggregate findings dataset...', 'Generating markdown formats...', 'Reports generated successfully. Saving log files. Finished execution.']
  };

  useEffect(() => {
    if (pipelineState.status === 'running') {
      const idx = pipelineState.currentStage;
      setActiveStageLogs(stageLogsMap[idx] || []);
    } else if (pipelineState.status === 'completed') {
      setActiveStageLogs(['Pipeline execution successful. All files scanned. Reports compiled.']);
    } else {
      setActiveStageLogs(['Idle. Ready to scan new target codebase.']);
    }
  }, [pipelineState.currentStage, pipelineState.status]);

  const handleRestartScan = () => {
    if (activeRepo) {
      startAnalysis(activeRepo.url);
    } else {
      startAnalysis('github.com/ultron-sec/financial-api-gateway');
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Banner */}
      <div className="border border-border bg-surface p-4 rounded flex justify-between items-center">
        <div>
          <h2 className="text-sm font-sans font-bold text-white tracking-widest uppercase mb-1">ANALYSIS PIPELINE PIPELINE TELEMETRY</h2>
          <p className="text-text-secondary text-[10px]">
            {pipelineState.status === 'running' 
              ? `Currently scanning: ${activeRepo?.name || 'Codebase'} (Stage ${pipelineState.currentStage + 1}/10)`
              : pipelineState.status === 'completed'
              ? `Finished scanning: ${activeRepo?.name || 'Codebase'}. Status: OK.`
              : 'Idle. Initiate a repository scan in the Analyze panel.'
            }
          </p>
        </div>

        <div className="flex gap-2">
          {pipelineState.status === 'idle' || pipelineState.status === 'completed' ? (
            <button
              onClick={handleRestartScan}
              className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition border border-transparent shadow-[0_0_10px_rgba(255,32,32,0.2)]"
            >
              <Play className="w-3 h-3 fill-current" />
              RUN SCAN
            </button>
          ) : (
            <div className="flex items-center gap-2 border border-border bg-black/40 px-3 py-1.5 rounded text-medium animate-pulse">
              <RotateCw className="w-3.5 h-3.5 animate-spin text-medium" />
              SCANNING IN PROGRESS
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side Stepper Nodes */}
        <div className="lg:col-span-8 border border-border bg-surface rounded p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <span className="font-sans font-bold text-white tracking-widest text-[10px] uppercase">COMPILATION & DIAGNOSTIC STAGES</span>
            {pipelineState.status === 'running' && (
              <span className="text-primary font-bold">{pipelineState.progress}% COMPLETE</span>
            )}
          </div>

          {/* Stepper Flow Container */}
          <div className="space-y-3 relative">
            {/* Connecting background vertical line */}
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-border -z-10" />

            {stages.map((stage, idx) => {
              const StageIcon = stage.icon;
              const isCompleted = pipelineState.status === 'completed' || (pipelineState.status === 'running' && idx < pipelineState.currentStage);
              const isActive = pipelineState.status === 'running' && idx === pipelineState.currentStage;
              const isPending = !isCompleted && !isActive;

              return (
                <div 
                  key={idx}
                  className={`flex items-start gap-4 p-3 border rounded transition duration-200 ${
                    isActive 
                      ? 'border-primary bg-primary/5 shadow-[0_0_10px_rgba(255,32,32,0.15)]' 
                      : isCompleted 
                      ? 'border-[#00E676]/30 bg-[#00E676]/3'
                      : 'border-border/70 bg-black/10'
                  }`}
                >
                  {/* Glowing Node Circle */}
                  <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border transition-all duration-200 ${
                    isActive 
                      ? 'border-primary bg-black shadow-[0_0_8px_rgba(255,32,32,0.6)] text-primary animate-pulse' 
                      : isCompleted 
                      ? 'border-success bg-black text-success shadow-[0_0_8px_rgba(0,230,118,0.4)]'
                      : 'border-border bg-[#161616] text-text-secondary'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <StageIcon className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className={`font-bold text-xs ${
                      isActive ? 'text-primary' : isCompleted ? 'text-white' : 'text-text-secondary'
                    }`}>
                      {stage.name}
                    </div>
                    <div className="text-[10px] text-text-secondary">{stage.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side Stage Output Logs */}
        <div className="lg:col-span-4 space-y-4">
          <div className="border border-border bg-surface p-4 rounded space-y-4 min-h-[300px]">
            <div className="border-b border-border pb-2">
              <h3 className="font-sans font-bold text-white tracking-widest text-[10px] uppercase">
                STAGE DIAGNOSTIC LOGS
              </h3>
            </div>

            <div className="space-y-3 font-mono text-[10px] text-text-secondary leading-relaxed text-left">
              {activeStageLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-primary font-bold select-none">&gt;&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
              
              {pipelineState.status === 'running' && (
                <div className="flex items-center gap-1.5 text-medium animate-pulse pt-4">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing node instructions...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
