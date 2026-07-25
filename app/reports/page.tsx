'use client';

import React, { useState } from 'react';
import { useSecurityStore, Repository } from '../../store/useSecurityStore';
import { 
  FileText, 
  Download, 
  Calendar, 
  FileJson, 
  FileCode, 
  Image as ImageIcon 
} from 'lucide-react';

const defaultRepo: Repository = {
  id: '',
  name: 'No Repository Selected',
  url: '',
  language: 'N/A',
  status: 'Clean',
  score: 100,
  criticalCount: 0,
  highCount: 0,
  mediumCount: 0,
  lowCount: 0,
  lastScanned: 'N/A',
  filesCount: 0,
  linesCount: 0
};

export default function ReportsPage() {
  const { findings, repositories, selectedRepoId } = useSecurityStore();
  const [activeRepoId, setActiveRepoId] = useState(selectedRepoId || '');
  const [downloading, setDownloading] = useState<string | null>(null);

  const activeRepo = repositories.find(r => r.id === activeRepoId) || repositories[0] || defaultRepo;
  const repoFindings = findings.filter(f => f.repoId === activeRepo.id);

  const criticalCount = repoFindings.filter(f => f.severity === 'Critical').length;
  const highCount = repoFindings.filter(f => f.severity === 'High').length;
  const mediumCount = repoFindings.filter(f => f.severity === 'Medium').length;
  const lowCount = repoFindings.filter(f => f.severity === 'Low').length;

  const handleDownload = (format: string) => {
    if (!activeRepo.id) return;
    setDownloading(format);
    setTimeout(() => {
      setDownloading(null);
      // Simulate file download trigger
      const mockData = JSON.stringify({ repository: activeRepo.name, findings: repoFindings }, null, 2);
      const blob = new Blob([mockData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ultron-report-${activeRepo.name}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 1500);
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-5xl mx-auto">
      {/* Banner */}
      <div className="border border-border bg-surface p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-0.5 text-left">
          <h2 className="text-sm font-sans font-bold text-white tracking-widest uppercase">EXECUTIVE COMPLIANCE REPORTS</h2>
          <p className="text-text-secondary text-[10px]">Compile and download aggregate findings summaries matching regulatory standards.</p>
        </div>

        {/* Workspace select */}
        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-[10px]">TARGET:</span>
          <select 
            value={activeRepoId} 
            onChange={(e) => setActiveRepoId(e.target.value)}
            className="bg-black border border-border px-2.5 py-1.5 rounded text-white text-[10px] outline-none hover:border-primary/50 transition font-bold"
          >
            {repositories.length === 0 ? (
              <option value="">No Repositories Available</option>
            ) : (
              repositories.map(repo => (
                <option key={repo.id} value={repo.id}>{repo.name}</option>
              ))
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Summary overview info */}
        <div className="md:col-span-2 space-y-4">
          <div className="border border-border bg-surface p-6 rounded space-y-6 text-left">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div className="space-y-1">
                <h3 className="text-white font-sans font-bold text-sm uppercase">SECURITY SUMMARY REPORT</h3>
                <div className="text-[10px] text-text-secondary flex items-center gap-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Scanned: {activeRepo.lastScanned}</span>
                  <span>Scope: {activeRepo.filesCount} modules</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-text-secondary text-[9px] uppercase block">HEALTH SCORE</span>
                <span className="text-success font-sans font-bold text-xl">{activeRepo.score}/100</span>
              </div>
            </div>

            {/* Findings counters grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="border border-border bg-black/40 p-3 rounded">
                <div className="text-critical font-bold text-lg">{criticalCount}</div>
                <div className="text-text-secondary text-[8px] uppercase font-bold mt-1">CRITICAL</div>
              </div>
              <div className="border border-border bg-black/40 p-3 rounded">
                <div className="text-medium font-bold text-lg">{highCount}</div>
                <div className="text-text-secondary text-[8px] uppercase font-bold mt-1">HIGH</div>
              </div>
              <div className="border border-border bg-black/40 p-3 rounded">
                <div className="text-low font-bold text-lg">{mediumCount}</div>
                <div className="text-text-secondary text-[8px] uppercase font-bold mt-1">MEDIUM</div>
              </div>
              <div className="border border-border bg-black/40 p-3 rounded">
                <div className="text-success font-bold text-lg">{lowCount}</div>
                <div className="text-text-secondary text-[8px] uppercase font-bold mt-1">LOW</div>
              </div>
            </div>

            {/* Detailed sections */}
            <div className="space-y-4">
              <h4 className="text-white font-bold tracking-wider uppercase border-b border-border pb-1 text-[10px]">COMPLIANCE ASSESSMENTS</h4>
              <div className="space-y-2 leading-relaxed text-text-secondary text-[11px] font-sans">
                <p>The code repository <span className="text-white font-mono text-[10px]">{activeRepo.name}</span> has undergone static taint mapping and control-flow checks via Ultron Multi-Agent engines. A total of <span className="text-white">{repoFindings.length}</span> vulnerabilities were registered.</p>
                <p>Top vulnerability vectors match OWASP Top 10 categories including Injection (A03:2021) and Broken Access Controls (A01:2021). Deploying recommendations outlined in Findings dashboard is highly advised before production build cycles.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Download Card */}
        <div className="space-y-4 text-left">
          <div className="border border-border bg-surface p-5 rounded space-y-4">
            <h3 className="font-sans font-bold text-white tracking-widest text-[10px] uppercase border-b border-border pb-2">
              EXPORT FILE SCHEMAS
            </h3>

            <div className="space-y-2">
              {/* PDF */}
              <button 
                onClick={() => handleDownload('PDF')}
                disabled={downloading !== null || !activeRepo.id}
                className="w-full border border-border hover:border-primary/50 bg-black/40 hover:bg-card px-4 py-3 rounded flex justify-between items-center text-white transition active:scale-98 disabled:opacity-40"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Download PDF Document</span>
                </div>
                <Download className="w-3.5 h-3.5 text-text-secondary" />
              </button>

              {/* JSON */}
              <button 
                onClick={() => handleDownload('JSON')}
                disabled={downloading !== null || !activeRepo.id}
                className="w-full border border-border hover:border-primary/50 bg-black/40 hover:bg-card px-4 py-3 rounded flex justify-between items-center text-white transition active:scale-98 disabled:opacity-40"
              >
                <div className="flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-primary" />
                  <span>Download JSON Dataset</span>
                </div>
                <Download className="w-3.5 h-3.5 text-text-secondary" />
              </button>

              {/* Markdown */}
              <button 
                onClick={() => handleDownload('MD')}
                disabled={downloading !== null || !activeRepo.id}
                className="w-full border border-border hover:border-primary/50 bg-black/40 hover:bg-card px-4 py-3 rounded flex justify-between items-center text-white transition active:scale-98 disabled:opacity-40"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-primary" />
                  <span>Download Markdown Report</span>
                </div>
                <Download className="w-3.5 h-3.5 text-text-secondary" />
              </button>

              {/* SVG Call Graph */}
              <button 
                onClick={() => handleDownload('SVG')}
                disabled={downloading !== null || !activeRepo.id}
                className="w-full border border-border hover:border-primary/50 bg-black/40 hover:bg-card px-4 py-3 rounded flex justify-between items-center text-white transition active:scale-98 disabled:opacity-40"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <span>Download SVG Taint Graph</span>
                </div>
                <Download className="w-3.5 h-3.5 text-text-secondary" />
              </button>
            </div>

            {downloading && (
              <div className="flex items-center justify-center gap-2 border border-primary/20 bg-primary/5 p-3 rounded text-primary animate-pulse text-[10px] mt-4 font-bold">
                <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span>Compiling {downloading} package...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
