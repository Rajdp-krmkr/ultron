'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSecurityStore } from '../../store/useSecurityStore';
import {
  GitBranch,
  UploadCloud,
  FolderOpen,
  Play,
  Clock,
  ExternalLink,
  ShieldCheck,
  SearchCode
} from 'lucide-react';

export default function AnalyzeRepository() {
  const router = useRouter();
  const { startAnalysis, repositories, addTerminalLog } = useSecurityStore();
  const [gitUrl, setGitUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'url' | 'zip' | 'local'>('url');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [localFolder, setLocalFolder] = useState<string>('');

  const handleStartAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    let target = '';

    if (activeTab === 'url') {
      if (!gitUrl.trim()) return;
      target = gitUrl.trim();
    } else if (activeTab === 'zip') {
      if (!zipFile) return;
      target = `local-zip://${zipFile.name}`;
    } else {
      if (!localFolder) return;
      target = `local-path://${localFolder}`;
    }

    startAnalysis(target);
    router.push('/pipeline');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setZipFile(e.target.files[0]);
      addTerminalLog(`Uploaded archive: ${e.target.files[0].name} for security parsing.`, 'info');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setZipFile(e.dataTransfer.files[0]);
      addTerminalLog(`Dropped archive: ${e.dataTransfer.files[0].name} for parsing.`, 'info');
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs max-w-6xl mx-auto">
      {/* Banner */}
      <div className="border border-border bg-surface p-3 rounded flex items-center justify-between relative overflow-hidden text-left">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <SearchCode className="w-3.5 h-3.5 text-primary" />
            <h2 className="text-xs font-sans font-bold text-white tracking-widest uppercase">REPOSITORIES DEEP SECURITY AUDITING</h2>
          </div>
          <p className="text-text-secondary text-[10px]">Provide target packages to extract Abstract Syntax Trees (AST) and trace source-to-sink taint flows.</p>
        </div>
        <ShieldCheck className="w-7 h-7 text-primary/80 hidden sm:block shrink-0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left Side Inputs Form */}
        <div className="lg:col-span-2 space-y-3">
          <div className="border border-border bg-surface rounded flex flex-col overflow-hidden">
            {/* Input tabs switcher */}
            <div className="flex border-b border-border bg-black/40">
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 border-r border-border hover:text-white transition duration-150 font-bold tracking-wider text-[10px] cursor-pointer ${
                  activeTab === 'url' ? 'bg-card text-primary border-b-2 border-b-primary -mb-px' : 'text-text-secondary'
                }`}
              >
                <GitBranch className="w-3 h-3" />
                <span>GIT URL</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('zip')}
                className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 border-r border-border hover:text-white transition duration-150 font-bold tracking-wider text-[10px] cursor-pointer ${
                  activeTab === 'zip' ? 'bg-card text-primary border-b-2 border-b-primary -mb-px' : 'text-text-secondary'
                }`}
              >
                <UploadCloud className="w-3 h-3" />
                <span>UPLOAD ZIP</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('local')}
                className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 hover:text-white transition duration-150 font-bold tracking-wider text-[10px] cursor-pointer ${
                  activeTab === 'local' ? 'bg-card text-primary border-b-2 border-b-primary -mb-px' : 'text-text-secondary'
                }`}
              >
                <FolderOpen className="w-3 h-3" />
                <span>LOCAL WORKSPACE</span>
              </button>
            </div>

            {/* Input Form Fields */}
            <form onSubmit={handleStartAnalysis} className="p-4 flex flex-col justify-between space-y-4 min-h-[240px] text-left">
              <div className="space-y-3 flex-1">
                {activeTab === 'url' && (
                  <div className="space-y-1.5">
                    <label className="text-text-secondary block font-bold text-[9px] tracking-wider uppercase">
                      GIT REPOSITORY REMOTE URL
                    </label>
                    <div className="flex border border-border bg-black rounded p-0.5 focus-within:border-primary/80 transition duration-150">
                      <span className="px-2.5 flex items-center text-text-secondary border-r border-border">
                        <GitBranch className="w-3 h-3" />
                      </span>
                      <input
                        type="url"
                        placeholder="https://github.com/org/repo-name.git"
                        value={gitUrl}
                        onChange={(e) => setGitUrl(e.target.value)}
                        required={activeTab === 'url'}
                        className="flex-1 bg-transparent border-0 outline-none px-2.5 text-white text-[11px] h-8 placeholder:text-[#555]"
                      />
                    </div>
                    <span className="text-[9px] text-text-secondary block">
                      HTTPS or SSH paths accepted. Authentication credentials configured in Settings.
                    </span>
                  </div>
                )}

                {activeTab === 'zip' && (
                  <div className="space-y-1.5">
                    <label className="text-text-secondary block font-bold text-[9px] tracking-wider uppercase">
                      UPLOAD COMPRESSED PROJECT ARCHIVE
                    </label>
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-border bg-black hover:border-primary/50 transition duration-150 rounded p-4 flex flex-col items-center justify-center cursor-pointer group text-center"
                    >
                      <UploadCloud className="w-6 h-6 text-text-secondary group-hover:text-primary mb-1.5 transition duration-150" />
                      {zipFile ? (
                        <div className="space-y-0.5">
                          <span className="text-white font-bold block text-[11px]">{zipFile.name}</span>
                          <span className="text-[9px] text-text-secondary block">{(zipFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="text-white block text-[11px]">Drag & drop repository zip archive here</span>
                          <span className="text-[9px] text-text-secondary block">or click to browse local files</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept=".zip"
                        onChange={handleFileChange}
                        required={activeTab === 'zip' && !zipFile}
                        className="hidden"
                        id="zip-upload-input"
                      />
                      <label htmlFor="zip-upload-input" className="mt-2.5 px-2.5 py-1 border border-border bg-card hover:border-primary transition rounded text-[9px] cursor-pointer">
                        BROWSE FILE
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'local' && (
                  <div className="space-y-1.5">
                    <label className="text-text-secondary block font-bold text-[9px] tracking-wider uppercase">
                      LOCAL SYSTEM DIRECTORY PATH
                    </label>
                    <div className="flex border border-border bg-black rounded p-0.5 focus-within:border-primary/80 transition duration-150">
                      <span className="px-2.5 flex items-center text-text-secondary border-r border-border">
                        <FolderOpen className="w-3 h-3" />
                      </span>
                      <input
                        type="text"
                        placeholder="C:\Users\username\projects\source-code"
                        value={localFolder}
                        onChange={(e) => setLocalFolder(e.target.value)}
                        required={activeTab === 'local'}
                        className="flex-1 bg-transparent border-0 outline-none px-2.5 text-white text-[11px] h-8 placeholder:text-[#555]"
                      />
                    </div>
                    <span className="text-[9px] text-text-secondary block">
                      Direct file access matching system daemon index bindings.
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white text-[11px] font-bold py-2.5 rounded border border-transparent shadow-[0_0_12px_rgba(255,32,32,0.25)] transition flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                INITIATE ENGINE SECURITY SCAN
              </button>
            </form>
          </div>
        </div>

        {/* Right Side Scan History logs list */}
        <div className="space-y-3">
          <div className="border border-border bg-surface p-3 rounded space-y-3 flex flex-col min-h-[300px] text-left">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-sans font-bold text-white tracking-widest text-[9px] uppercase flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-primary" />
                RECENT ANALYSIS JOBS
              </h3>
              <span className="text-[9px] text-text-secondary font-mono">{repositories.length} TOTAL</span>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-[280px] pr-1">
              {repositories.map((repo, idx) => (
                <div key={idx} className="border border-border bg-black/40 p-2.5 rounded space-y-1.5 relative overflow-hidden hover:border-primary/40 transition duration-150">
                  {/* Status header indicator */}
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white truncate max-w-[120px] text-[11px]">{repo.name}</span>
                    <span className={`inline-flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded border ${
                      repo.status === 'Clean' ? 'text-success bg-success/10 border-success/30' :
                      repo.status === 'Scanning' ? 'text-medium bg-medium/10 border-medium/30 animate-pulse' :
                      'text-critical bg-critical/10 border-critical/30'
                    }`}>
                      {repo.status === 'Clean' ? <ShieldCheck className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                      {repo.status}
                    </span>
                  </div>

                  {/* Details stats */}
                  <div className="grid grid-cols-2 gap-1 text-[9px] text-text-secondary">
                    <div>Issues: <span className="text-white font-bold">{repo.criticalCount + repo.highCount}</span></div>
                    <div>Score: <span className="text-white font-bold">{repo.score}/100</span></div>
                    <div className="col-span-2">Time: {repo.lastScanned}</div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1.5 border-t border-border/50 flex justify-between items-center text-[9px]">
                    <span className="text-text-secondary">{repo.language}</span>
                    <button
                      type="button"
                      onClick={() => {
                        startAnalysis(repo.url);
                        router.push('/pipeline');
                      }}
                      className="text-primary hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                    >
                      Re-run <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}

              {repositories.length === 0 && (
                <div className="text-center py-6 text-text-secondary text-[10px]">
                  No recent analysis jobs found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
