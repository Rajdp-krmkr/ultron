'use client';

import React, { useState } from 'react';
import { useSecurityStore, Repository, Finding } from '../../store/useSecurityStore';
import { 
  FileText, 
  Download, 
  Calendar, 
  FileJson, 
  FileCode
} from 'lucide-react';
import { jsPDF } from 'jspdf';

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
  const repoFindings = findings.filter(f => !activeRepo.id || f.repoId === activeRepo.id);
  const targetFindings = repoFindings.length > 0 ? repoFindings : findings;

  const criticalCount = targetFindings.filter(f => f.severity === 'Critical').length;
  const highCount = targetFindings.filter(f => f.severity === 'High').length;
  const mediumCount = targetFindings.filter(f => f.severity === 'Medium').length;
  const lowCount = targetFindings.filter(f => f.severity === 'Low').length;

  // 1. PDF Report Generator
  const generatePdfReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header Banner
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(239, 68, 68); // Primary red
    doc.text('ULTRON SECURITY ENGINE', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text('EXECUTIVE AUDIT & COMPLIANCE REPORT', 14, 30);

    y = 50;

    // Metadata Box
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(14, y, pageWidth - 28, 35, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`Repository: ${activeRepo.name}`, 20, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`URL: ${activeRepo.url || 'Local Repository'}`, 20, y + 18);
    doc.text(`Language: ${activeRepo.language} | Modules: ${activeRepo.filesCount}`, 20, y + 25);
    doc.text(`Health Score: ${activeRepo.score}/100 | Generated: ${new Date().toLocaleString()}`, 20, y + 31);

    y += 45;

    // Summary Statistics
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('FINDINGS SUMMARY', 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text(`Critical: ${criticalCount}`, 14, y);
    doc.setTextColor(234, 88, 12);
    doc.text(`High: ${highCount}`, 55, y);
    doc.setTextColor(202, 138, 4);
    doc.text(`Medium: ${mediumCount}`, 90, y);
    doc.setTextColor(22, 163, 74);
    doc.text(`Low: ${lowCount}`, 130, y);
    doc.setTextColor(71, 85, 105);
    doc.text(`Total: ${targetFindings.length}`, 165, y);

    y += 15;

    // Findings List
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('DETAILED VULNERABILITIES', 14, y);
    y += 10;

    targetFindings.forEach((f, idx) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(14, y, pageWidth - 14, y);
      y += 6;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`${idx + 1}. ${f.title}`, 14, y);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      if (f.severity === 'Critical') doc.setTextColor(220, 38, 38);
      else if (f.severity === 'High') doc.setTextColor(234, 88, 12);
      else if (f.severity === 'Medium') doc.setTextColor(202, 138, 4);
      else doc.setTextColor(22, 163, 74);
      doc.text(`[${f.severity.toUpperCase()}]`, pageWidth - 40, y);

      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Rule ID: ${f.ruleId} | Location: ${f.affectedFile}:L${f.lineNumber}`, 14, y);

      y += 5;
      doc.text(`Description: ${f.description}`, 14, y, { maxWidth: pageWidth - 28 });

      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`Recommendation: ${f.recommendation.split('\n')[0]}`, 14, y, { maxWidth: pageWidth - 28 });

      y += 12;
    });

    doc.save(`ultron-security-report-${activeRepo.name}.pdf`);
  };

  // 2. Markdown Report Generator
  const generateMarkdownReport = () => {
    let md = `# ULTRON Security Compliance Report: ${activeRepo.name}\n\n`;
    md += `- **Repository:** ${activeRepo.name}\n`;
    md += `- **URL:** ${activeRepo.url || 'Local Repository'}\n`;
    md += `- **Primary Language:** ${activeRepo.language}\n`;
    md += `- **Health Score:** ${activeRepo.score}/100\n`;
    md += `- **Audit Date:** ${new Date().toLocaleString()}\n\n`;

    md += `## Executive Summary\n`;
    md += `A total of **${targetFindings.length}** security vulnerabilities were flagged by the Ultron multi-agent detection engine.\n\n`;
    md += `| Severity | Count |\n| :--- | :--- |\n`;
    md += `| Critical | ${criticalCount} |\n`;
    md += `| High | ${highCount} |\n`;
    md += `| Medium | ${mediumCount} |\n`;
    md += `| Low | ${lowCount} |\n\n`;

    md += `## Detailed Findings\n\n`;
    targetFindings.forEach((f, idx) => {
      md += `### ${idx + 1}. ${f.title}\n`;
      md += `- **Rule ID:** \`${f.ruleId}\`\n`;
      md += `- **Severity:** **${f.severity}**\n`;
      md += `- **File Location:** \`${f.affectedFile}#L${f.lineNumber}\`\n`;
      md += `- **LLM Verified:** ${f.verifiedByLlm ? `Yes (${f.llmConfidence}%)` : 'No'}\n\n`;
      md += `**Description:**\n${f.description}\n\n`;
      md += `**Vulnerable Snippet:**\n\`\`\`typescript\n${f.codeSnippet}\n\`\`\`\n\n`;
      md += `**Remediation Recommendation:**\n${f.recommendation}\n\n`;
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ultron-security-report-${activeRepo.name}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 3. JSON Dataset Exporter
  const generateJsonDataset = () => {
    const data = {
      report: {
        title: "ULTRON Security Audit Dataset",
        generatedAt: new Date().toISOString(),
        repository: {
          id: activeRepo.id,
          name: activeRepo.name,
          url: activeRepo.url,
          language: activeRepo.language,
          score: activeRepo.score,
          filesCount: activeRepo.filesCount,
          lastScanned: activeRepo.lastScanned
        },
        summary: {
          totalFindings: targetFindings.length,
          criticalCount,
          highCount,
          mediumCount,
          lowCount
        },
        findings: targetFindings
      }
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ultron-security-report-${activeRepo.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownload = (format: string) => {
    setDownloading(format);
    setTimeout(() => {
      if (format === 'PDF') {
        generatePdfReport();
      } else if (format === 'MD') {
        generateMarkdownReport();
      } else if (format === 'JSON') {
        generateJsonDataset();
      }
      setDownloading(null);
    }, 400);
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
              <option value="">All Repositories ({findings.length} findings)</option>
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
                  <span>Scope: {activeRepo.filesCount || 18} modules</span>
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
                <p>The code repository <span className="text-white font-mono text-[10px]">{activeRepo.name}</span> has undergone static control-flow checks via Ultron Multi-Agent engines. A total of <span className="text-white font-bold">{targetFindings.length}</span> vulnerabilities were registered.</p>
                <p>Top vulnerability vectors match OWASP Top 10 categories including Injection (A03:2021), Broken Access Controls (A01:2021), and Cryptographic Failures (A02:2021). Deploying recommendations outlined in the report is highly advised prior to deployment.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Download Card */}
        <div className="space-y-4 text-left">
          <div className="border border-border bg-surface p-5 rounded space-y-4">
            <h3 className="font-sans font-bold text-white tracking-widest text-[10px] uppercase border-b border-border pb-2">
              EXPORT REPORT FILE SCHEMAS
            </h3>

            <div className="space-y-2.5">
              {/* PDF Document */}
              <button 
                onClick={() => handleDownload('PDF')}
                disabled={downloading !== null}
                className="w-full border border-border hover:border-primary/50 bg-black/40 hover:bg-card px-4 py-3 rounded flex justify-between items-center text-white transition active:scale-98 disabled:opacity-40 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Download Actual PDF Document</span>
                </div>
                <Download className="w-3.5 h-3.5 text-text-secondary" />
              </button>

              {/* JSON Dataset */}
              <button 
                onClick={() => handleDownload('JSON')}
                disabled={downloading !== null}
                className="w-full border border-border hover:border-primary/50 bg-black/40 hover:bg-card px-4 py-3 rounded flex justify-between items-center text-white transition active:scale-98 disabled:opacity-40 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-primary" />
                  <span>Download JSON Dataset</span>
                </div>
                <Download className="w-3.5 h-3.5 text-text-secondary" />
              </button>

              {/* Markdown Report */}
              <button 
                onClick={() => handleDownload('MD')}
                disabled={downloading !== null}
                className="w-full border border-border hover:border-primary/50 bg-black/40 hover:bg-card px-4 py-3 rounded flex justify-between items-center text-white transition active:scale-98 disabled:opacity-40 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-primary" />
                  <span>Download Markdown Report</span>
                </div>
                <Download className="w-3.5 h-3.5 text-text-secondary" />
              </button>
            </div>

            {downloading && (
              <div className="flex items-center justify-center gap-2 border border-primary/20 bg-primary/5 p-3 rounded text-primary animate-pulse text-[10px] mt-4 font-bold">
                <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span>Generating {downloading} document...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
