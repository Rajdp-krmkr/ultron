'use client';

import React, { useState } from 'react';
import { useSecurityStore, Finding } from '../../store/useSecurityStore';
import { 
  AlertTriangle, 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  Cpu, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FindingsDashboard() {
  const router = useRouter();
  const { findings, repositories } = useSecurityStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sevFilter, setSevFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [verifiedFilter, setVerifiedFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const getSeverityColor = (sev: Finding['severity']) => {
    switch (sev) {
      case 'Critical': return 'text-critical border-critical/30 bg-critical/5';
      case 'High': return 'text-medium border-medium/30 bg-medium/5';
      case 'Medium': return 'text-low border-low/30 bg-low/5';
      case 'Low': return 'text-success border-success/30 bg-success/5';
    }
  };

  const filteredFindings = findings.filter(finding => {
    const repo = repositories.find(r => r.id === finding.repoId);
    const repoName = repo ? repo.name : '';

    const matchesSearch = finding.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          finding.affectedFile.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          finding.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          repoName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSev = sevFilter === 'All' || finding.severity === sevFilter;
    const matchesStatus = statusFilter === 'All' || finding.status === statusFilter;
    
    const matchesVerified = verifiedFilter === 'All' || 
      (verifiedFilter === 'Verified' && finding.verifiedByLlm) || 
      (verifiedFilter === 'Unverified' && !finding.verifiedByLlm);

    return matchesSearch && matchesSev && matchesStatus && matchesVerified;
  });

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="border border-border bg-surface p-4 rounded flex justify-between items-center">
        <div className="space-y-0.5">
          <h2 className="text-sm font-sans font-bold text-white tracking-widest uppercase">SECURITY FINDINGS AUDIT LAB</h2>
          <p className="text-text-secondary text-[10px]">Filter, review, and patch security vulnerabilities confirmed by multi-agent analysis.</p>
        </div>

        <div className="flex gap-2 border border-border rounded bg-black/40 p-0.5">
          <button 
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded transition ${viewMode === 'table' ? 'bg-card text-primary' : 'text-text-secondary'}`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded transition ${viewMode === 'cards' ? 'bg-card text-primary' : 'text-text-secondary'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="border border-border bg-surface p-4 rounded flex flex-wrap items-center justify-between gap-3 bg-black/20">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-text-secondary" />
          <input 
            type="text" 
            placeholder="Search by vulnerability, file name, or repository..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-white text-[10px] placeholder:text-[#555]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity selector */}
          <select 
            value={sevFilter} 
            onChange={(e) => setSevFilter(e.target.value)}
            className="bg-black border border-border px-2.5 py-1 rounded text-white text-[10px] h-7 outline-none hover:border-primary/50 transition"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Only</option>
            <option value="Medium">Medium Only</option>
            <option value="Low">Low Only</option>
          </select>

          {/* Verification status selector */}
          <select 
            value={verifiedFilter} 
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="bg-black border border-border px-2.5 py-1 rounded text-white text-[10px] h-7 outline-none hover:border-primary/50 transition"
          >
            <option value="All">All Verification</option>
            <option value="Verified">LLM Verified</option>
            <option value="Unverified">Unverified Only</option>
          </select>

          {/* Status selector */}
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black border border-border px-2.5 py-1 rounded text-white text-[10px] h-7 outline-none hover:border-primary/50 transition"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="False Positive">False Positive</option>
          </select>
        </div>
      </div>

      {/* Main workspace container */}
      {viewMode === 'table' ? (
        <div className="border border-border bg-surface rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-black/30 text-[9px] text-text-secondary uppercase">
                  <th className="p-3">Vulnerability</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Repository</th>
                  <th className="p-3">Target Location</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFindings.map((finding) => {
                  const repo = repositories.find(r => r.id === finding.repoId);
                  return (
                    <tr 
                      key={finding.id}
                      onClick={() => router.push(`/findings/${finding.id}`)}
                      className="hover:bg-card/30 transition cursor-pointer"
                    >
                      <td className="p-3 font-bold text-white max-w-xs truncate">
                        {finding.title}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 border rounded text-[10px] ${getSeverityColor(finding.severity)}`}>
                          {finding.severity}
                        </span>
                      </td>
                      <td className="p-3 text-white">{finding.confidence}</td>
                      <td className="p-3 text-text-secondary">{repo ? repo.name : 'Unknown'}</td>
                      <td className="p-3">
                        <div className="text-white truncate max-w-xs">{finding.affectedFile}</div>
                        <div className="text-[10px] text-text-secondary mt-0.5">Line {finding.lineNumber}</div>
                      </td>
                      <td className="p-3">
                        {finding.verifiedByLlm ? (
                          <span className="inline-flex items-center gap-1 text-success">
                            <Cpu className="w-3.5 h-3.5" />
                            LLM_VERIFIED ({finding.llmConfidence}%)
                          </span>
                        ) : (
                          <span className="text-text-secondary">UNVERIFIED</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 border rounded text-[10px] ${
                          finding.status === 'Resolved' ? 'border-success/30 text-success bg-success/5' :
                          finding.status === 'False Positive' ? 'border-text-secondary/30 text-text-secondary bg-text-secondary/5' :
                          finding.status === 'In Progress' ? 'border-medium/30 text-medium bg-medium/5' :
                          'border-critical/30 text-critical bg-critical/5'
                        }`}>
                          {finding.status}
                        </span>
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Link 
                          href={`/findings/${finding.id}`}
                          className="inline-flex items-center gap-1 text-primary hover:underline hover:text-primary-hover"
                        >
                          AUDIT <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {filteredFindings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-text-secondary font-bold">
                      No findings found matching active criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFindings.map((finding) => {
            const repo = repositories.find(r => r.id === finding.repoId);
            return (
              <div 
                key={finding.id}
                onClick={() => router.push(`/findings/${finding.id}`)}
                className="border border-border bg-surface p-5 rounded hover:border-primary/45 transition cursor-pointer flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 border rounded text-[9px] ${getSeverityColor(finding.severity)}`}>
                      {finding.severity}
                    </span>
                    <span className="text-[10px] text-text-secondary font-mono">ID: {finding.id}</span>
                  </div>
                  <h3 className="font-sans font-bold text-white text-xs pt-1.5">{finding.title}</h3>
                </div>

                {/* Body details */}
                <p className="text-text-secondary text-[11px] leading-relaxed line-clamp-2">
                  {finding.description}
                </p>

                {/* Path metrics */}
                <div className="text-[10px] font-mono border-t border-border pt-3 space-y-1 text-text-secondary">
                  <div>Repo: <span className="text-white font-bold">{repo ? repo.name : 'Unknown'}</span></div>
                  <div>File: <span className="text-white font-bold">{finding.affectedFile}#L{finding.lineNumber}</span></div>
                  <div className="flex items-center justify-between pt-1">
                    {finding.verifiedByLlm ? (
                      <span className="inline-flex items-center gap-1 text-success text-[9px]">
                        <Cpu className="w-3.5 h-3.5" />
                        LLM Verified ({finding.llmConfidence}%)
                      </span>
                    ) : (
                      <span className="text-[9px]">Unverified</span>
                    )}
                    <span className="text-primary hover:underline flex items-center gap-0.5">
                      AUDIT <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
