'use client';

import React from 'react';
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
  Play,
  RotateCw,
  SearchCode,
  Layers,
  Terminal as TerminalIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AnalyzeRepository from '../analyze/page';

export default function PipelineVisualizer() {
  const router = useRouter();
  const { pipelineState, repositories, startAnalysis, terminalLogs } = useSecurityStore();

  const stages = [
    { name: 'Clone Repository', icon: GitBranch, description: 'Fetch source-code archive via HTTPS/SSH checkout' },
    { name: 'Language Detection', icon: SearchCode, description: 'Inspect extensions and resolve package workspace configurations' },
    { name: 'AST Parsing', icon: Code2, description: 'Construct abstract syntax tree mappings for symbol tracking' },
    { name: 'IR Extraction', icon: FileJson, description: 'Translate AST objects to Single Static Assignment 3-address codes' },
    { name: 'Call Graph Mapping', icon: Activity, description: 'Extract cross-file invocation networks and callback chains' },
    { name: 'Backward Taint Analysis', icon: Workflow, description: 'Trace user payloads backwards from unsafe database or shell sinks' },
    { name: 'Security Graph Compilation', icon: Layers, description: 'Audit API routers, route gates, and persistence boundaries' },
    { name: 'Rule Engine Audit', icon: Binary, description: 'Filter target SSA IR blocks against vulnerability rules signature' },
    { name: 'LLM Agent Verification', icon: Cpu, description: 'Instruct autonomous LLM verification agents to audit validity' },
    { name: 'Generate Reports', icon: FileText, description: 'Compile aggregate findings formats in PDF, JSON, and Markdown' }
  ];

  const activeRepo = repositories.find(r => r.id === pipelineState.activeRepoId) || repositories[0];

  const handleRestartScan = () => {
    if (activeRepo && activeRepo.url) {
      startAnalysis(activeRepo.url);
    } else {
      startAnalysis('https://github.com/aaditya-paul/project-ultron');
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Banner */}
      <div className="border border-border bg-surface p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-0.5 text-left">
          <h2 className="text-sm font-sans font-bold text-white tracking-widest uppercase">REAL-TIME PIPELINE DIAGNOSTIC TELEMETRY</h2>
          <p className="text-text-secondary text-[10px]">
            {pipelineState.status === 'running' 
              ? `Currently scanning: ${activeRepo?.name || 'Codebase'} (Stage ${pipelineState.currentStage + 1}/10)`
              : pipelineState.status === 'completed'
              ? `Finished scanning: ${activeRepo?.name || 'Codebase'}. Status: OK.`
              : `Active target: ${activeRepo?.name || 'Codebase'}. Ready for diagnostic pass.`
            }
          </p>
        </div>

        <div className="flex gap-2">
          {pipelineState.status === 'idle' || pipelineState.status === 'completed' ? (
            <button
              type="button"
              onClick={handleRestartScan}
              className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-3.5 py-2 rounded flex items-center gap-1.5 transition border border-transparent shadow-[0_0_10px_rgba(255,32,32,0.2)] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              RE-RUN SCAN
            </button>
          ) : (
            <div className="flex items-center gap-2 border border-border bg-black/40 px-3.5 py-2 rounded text-medium animate-pulse font-bold">
              <RotateCw className="w-3.5 h-3.5 animate-spin text-medium" />
              SCANNING IN PROGRESS
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side Stepper Nodes */}
        <div className="lg:col-span-7 border border-border bg-surface rounded p-5 space-y-4 text-left">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <span className="font-sans font-bold text-white tracking-widest text-[10px] uppercase">COMPILATION & DIAGNOSTIC STAGES</span>
            {pipelineState.status === 'running' && (
              <span className="text-primary font-bold">{pipelineState.progress}% COMPLETE</span>
            )}
          </div>

          {/* Stepper Flow Container */}
          <div className="space-y-2.5 relative">
            {/* Connecting background vertical line */}
            <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-border -z-10" />

            {stages.map((stage, idx) => {
              const StageIcon = stage.icon;
              const isCompleted = pipelineState.status === 'completed' || (pipelineState.status === 'running' && idx < pipelineState.currentStage);
              const isActive = pipelineState.status === 'running' && idx === pipelineState.currentStage;

              return (
                <div 
                  key={idx}
                  className={`flex items-start gap-3.5 p-2.5 border rounded transition duration-200 ${
                    isActive 
                      ? 'border-primary bg-primary/5 shadow-[0_0_10px_rgba(255,32,32,0.15)]' 
                      : isCompleted 
                      ? 'border-success/30 bg-success/5'
                      : 'border-border/70 bg-black/10'
                  }`}
                >
                  {/* Node Circle */}
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all duration-200 mt-0.5 ${
                    isActive 
                      ? 'border-primary bg-black shadow-[0_0_8px_rgba(255,32,32,0.6)] text-primary animate-pulse' 
                      : isCompleted 
                      ? 'border-success bg-black text-success shadow-[0_0_8px_rgba(0,230,118,0.4)]'
                      : 'border-border bg-[#161616] text-text-secondary'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-3 h-3 text-success" />
                    ) : (
                      <StageIcon className="w-3 h-3" />
                    )}
                  </div>

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className={`font-bold text-[11px] ${
                      isActive ? 'text-primary' : isCompleted ? 'text-white' : 'text-text-secondary'
                    }`}>
                      {stage.name}
                    </div>
                    <div className="text-[9.5px] text-text-secondary truncate">{stage.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side Stage Output Logs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-border bg-surface p-4 rounded space-y-3 flex flex-col min-h-[500px] text-left">
            <div className="border-b border-border pb-2 flex justify-between items-center">
              <h3 className="font-sans font-bold text-white tracking-widest text-[10px] uppercase flex items-center gap-1.5">
                <TerminalIcon className="w-3.5 h-3.5 text-primary" />
                LIVE COMPILATION OUTPUT
              </h3>
              <span className="text-[9px] text-text-secondary font-mono">{terminalLogs.length} LOGS</span>
            </div>

            {/* Real Diagnostic Terminal Output */}
            <div className="space-y-2 font-mono text-[10px] leading-relaxed text-left flex-1 overflow-y-auto max-h-[460px] pr-1 bg-black/40 p-3 rounded border border-border">
              {terminalLogs.length > 0 ? (
                terminalLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-1.5 break-all">
                    <span className="text-text-secondary shrink-0 text-[8px] mt-0.5">[{log.timestamp}]</span>
                    <span className={`font-bold shrink-0 ${
                      log.type === 'error' ? 'text-critical' :
                      log.type === 'warning' ? 'text-medium' :
                      log.type === 'success' ? 'text-success' :
                      log.type === 'command' ? 'text-primary' : 'text-text-secondary'
                    }`}>
                      {log.type === 'command' ? '$' : '▸'}
                    </span>
                    <span className={log.type === 'command' ? 'text-white font-bold' : log.type === 'success' ? 'text-white' : 'text-text-secondary'}>
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-text-secondary text-[10px] py-10 text-center">
                  No diagnostic output logged yet. Initiate a scan to stream live engine telemetry.
                </div>
              )}

              {pipelineState.status === 'running' && (
                <div className="flex items-center gap-1.5 text-medium animate-pulse pt-2 border-t border-border/40 mt-2">
                  <Clock className="w-3 h-3 animate-spin shrink-0" />
                  <span>Processing pipeline stage {pipelineState.currentStage + 1}/10...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
