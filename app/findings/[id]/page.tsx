'use client';

import React, { useState, useEffect } from 'react';
import { useSecurityStore, Finding } from '../../../store/useSecurityStore';
import { 
  AlertTriangle, 
  ChevronLeft, 
  Cpu, 
  CheckCircle, 
  Clock, 
  Save,
  Wrench,
  Copy,
  ExternalLink,
  Code
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Editor from '@monaco-editor/react';

export default function FindingDetails() {
  const router = useRouter();
  const params = useParams();
  const { findings, repositories, updateFindingStatus, addTerminalLog } = useSecurityStore();
  const [finding, setFinding] = useState<Finding | null>(null);
  const [editorVal, setEditorVal] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Finding['status']>('Open');
  const [isCopied, setIsCopied] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);

  useEffect(() => {
    const activeFinding = findings.find(f => f.id === params.id);
    if (activeFinding) {
      setFinding(activeFinding);
      setEditorVal(activeFinding.codeSnippet);
      setSelectedStatus(activeFinding.status);
    }
  }, [params.id, findings]);

  if (!finding) {
    return (
      <div className="p-8 text-center text-text-secondary font-mono text-xs">
        Finding record not found. 
        <Link href="/findings" className="text-primary hover:underline block mt-4">Return to index</Link>
      </div>
    );
  }

  const repo = repositories.find(r => r.id === finding.repoId);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as Finding['status'];
    setSelectedStatus(val);
    updateFindingStatus(finding.id, val);
    addTerminalLog(`Updated finding ${finding.id} status to: ${val}`, 'info');
  };

  const handleCopyRecommendation = () => {
    navigator.clipboard.writeText(finding.recommendation);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-[480px] flex flex-col font-mono text-xs space-y-4 relative">
      {/* Top action bar */}
      <div className="border border-border bg-surface p-3 rounded flex justify-between items-center mb-4 select-none shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/findings" className="p-1 border border-border bg-black hover:border-primary transition rounded text-text-secondary hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="space-y-0.5">
            <h2 className="text-white font-sans font-bold text-xs tracking-wider uppercase flex items-center gap-2">
              AUDIT LAB: <span className="text-primary">{finding.id}</span>
            </h2>
            <p className="text-[10px] text-text-secondary">Code audits Workspace - Repository: {repo ? repo.name : 'Unknown'}</p>
          </div>
        </div>

        {/* Status manager dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-[10px] uppercase">STATUS:</span>
          <select 
            value={selectedStatus} 
            onChange={handleStatusChange}
            className="bg-black border border-border px-2 py-1 rounded text-white text-[10px] h-7 outline-none hover:border-primary/50 transition font-bold"
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="False Positive">False Positive</option>
          </select>
        </div>
      </div>

      {/* Main split work space */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Monaco Code Editor workspace */}
        <div className="lg:col-span-7 border border-border bg-surface rounded flex flex-col overflow-hidden relative min-h-[300px]">
          {/* Header tabs indicator */}
          <div className="h-8 bg-black/45 border-b border-border px-4 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <Code className="w-3.5 h-3.5 text-primary" />
              <span className="text-white text-[10px] font-bold">{finding.affectedFile}</span>
            </div>
            <span className="text-text-secondary text-[9px]">LINE {finding.lineNumber} (READ_ONLY_VIEW)</span>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative bg-black/25">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              theme="vs-dark"
              value={editorVal}
              onMount={() => setEditorLoaded(true)}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 12,
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                lineDecorationsWidth: 10,
                renderLineHighlight: 'all',
                contextmenu: false,
              }}
              loading={
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F0F0F] gap-2 text-text-secondary">
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span>Loading Editor workspace...</span>
                </div>
              }
            />
          </div>
        </div>

        {/* Right Side: Security diagnostic info panel */}
        <div className="lg:col-span-5 border border-border bg-surface rounded overflow-y-auto p-5 space-y-6 flex flex-col justify-between max-h-full">
          <div className="space-y-6 text-left">
            {/* Title Summary */}
            <div className="space-y-1">
              <h3 className="font-sans font-bold text-white text-sm">{finding.title}</h3>
              <div className="flex gap-2.5 pt-1.5 font-mono text-[9px]">
                <span className={`px-2 py-0.5 border rounded ${
                  finding.severity === 'Critical' ? 'text-critical border-critical/30 bg-critical/5' :
                  finding.severity === 'High' ? 'text-medium border-medium/30 bg-medium/5' : 'text-low border-low/30 bg-low/5'
                }`}>
                  SEVERITY: {finding.severity}
                </span>
                <span className="px-2 py-0.5 border border-border bg-black/30 rounded text-white">
                  CONFIDENCE: {finding.confidence}
                </span>
                <span className="px-2 py-0.5 border border-border bg-black/30 rounded text-white">
                  RULE: {finding.ruleId}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 border-t border-border pt-4">
              <span className="text-text-secondary font-bold text-[9px] uppercase tracking-wider">DIAGNOSTIC SUMMARY</span>
              <p className="text-text-secondary leading-relaxed text-[11px] font-sans">
                {finding.description}
              </p>
            </div>

            {/* Source to Sink Trace */}
            <div className="border border-border bg-black/30 p-3 rounded space-y-2">
              <span className="text-text-secondary font-bold text-[9px] uppercase tracking-wider block border-b border-border/50 pb-1">TAINT PATH FLOW</span>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Source node:</span>
                  <span className="text-low font-bold">{finding.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Sink execution:</span>
                  <span className="text-critical font-bold">{finding.sink}</span>
                </div>
              </div>
            </div>

            {/* LLM Agent timeline */}
            {finding.timeline && finding.timeline.length > 0 && (
              <div className="space-y-3">
                <span className="text-text-secondary font-bold text-[9px] uppercase tracking-wider block border-b border-border/50 pb-1">LLM AGENT VERIFICATION LOGS</span>
                
                <div className="space-y-2 relative pl-4 border-l border-border/70 ml-2">
                  {finding.timeline.map((step, idx) => (
                    <div key={idx} className="relative space-y-0.5">
                      {/* Circle indicator */}
                      <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded bg-success/80 border border-success animate-pulse" />
                      <div className="flex justify-between font-mono text-[9px]">
                        <span className="text-white font-bold">{step.stage}</span>
                        <span className="text-text-secondary">{step.time}</span>
                      </div>
                      <p className="text-[10px] text-text-secondary leading-relaxed font-sans">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation Code block */}
            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary font-bold text-[9px] uppercase tracking-wider">REMEDIATION RECOMMENDATION</span>
                <button 
                  onClick={handleCopyRecommendation}
                  className="inline-flex items-center gap-1 px-2 py-1 border border-border bg-black hover:border-primary text-[10px] text-white rounded transition"
                >
                  <Copy className="w-3 h-3 text-primary" />
                  {isCopied ? 'COPIED!' : 'COPY'}
                </button>
              </div>
              <div className="border border-border bg-black/60 p-3 rounded text-[10px] text-[#A6E22E] font-mono leading-relaxed overflow-x-auto whitespace-pre">
                {finding.recommendation}
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-4 flex justify-between items-center text-[10px]">
            <span className="text-text-secondary">Verified by Agent: {finding.verifiedByLlm ? 'YES' : 'NO'}</span>
            <button 
              onClick={() => router.push('/rules')}
              className="text-primary hover:underline flex items-center gap-0.5"
            >
              Inspect rule schema <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
