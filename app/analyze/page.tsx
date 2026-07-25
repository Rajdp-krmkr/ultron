'use client';

import React, { useState } from 'react';
import { useSecurityStore } from '../../store/useSecurityStore';
import {
  GitBranch,
  UploadCloud,
  FolderOpen,
  Play,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function AnalyzeRepository() {
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
    window.open('/pipeline', '_blank');
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
    <div className="space-y-6 font-mono text-xs max-w-6xl mx-auto">
      {/* Banner */}
      <div className="border border-border bg-surface p-4 rounded">
        <h2 className="text-sm font-sans font-bold text-white tracking-widest uppercase mb-1">REPOSITORIES DEEP SECURITY AUDITING</h2>
        <p className="text-text-secondary text-[10px]">Provide target packages to extract Abstract Syntax Trees (AST) and trace source-to-sink taint flows.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side Inputs Form */}
        <div className="md:col-span-2 space-y-4">
          <div className="border border-border bg-surface rounded">
            {/* Input tabs switcher */}
            <div className="flex border-b border-border bg-black/30">
              <button
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-3 text-center border-r border-border hover:text-white transition ${activeTab === 'url' ? 'bg-card text-primary font-bold border-b-2 border-b-primary' : 'text-text-secondary'
                  }`}
              >
                GIT URL
              </button>
              <button
                onClick={() => setActiveTab('zip')}
                className={`flex-1 py-3 text-center border-r border-border hover:text-white transition ${activeTab === 'zip' ? 'bg-card text-primary font-bold border-b-2 border-b-primary' : 'text-text-secondary'
                  }`}
              >
                UPLOAD ZIP
              </button>
              <button
                onClick={() => setActiveTab('local')}
                className={`flex-1 py-3 text-center hover:text-white transition ${activeTab === 'local' ? 'bg-card text-primary font-bold border-b-2 border-b-primary' : 'text-text-secondary'
                  }`}
              >
                LOCAL WORKSPACE
              </button>
            </div>

            {/* Input Form Fields */}
            <form onSubmit={handleStartAnalysis} className="p-6 space-y-6">
              {activeTab === 'url' && (
                <div className="space-y-2">
                  <label className="text-text-secondary block">GIT REPOSITORY REMOTE URL</label>
                  <div className="flex border border-border bg-black rounded p-1 hover:border-primary/50 transition">
                    <span className="px-3 flex items-center text-text-secondary border-r border-border"><GitBranch className="w-3.5 h-3.5" /></span>
                    <input
                      type="url"
                      placeholder="https://github.com/org/repo-name.git"
                      value={gitUrl}
                      onChange={(e) => setGitUrl(e.target.value)}
                      required={activeTab === 'url'}
                      className="flex-1 bg-transparent border-0 outline-none px-3 text-white text-xs h-9 placeholder:text-[#555]"
                    />
                  </div>
                  <span className="text-[10px] text-text-secondary">HTTPS or SSH paths accepted. Authentication credentials configured in Settings.</span>
                </div>
              )}

              {activeTab === 'zip' && (
                <div className="space-y-2">
                  <label className="text-text-secondary block">UPLOAD COMPRESSED PROJECT ARCHIVE</label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-border bg-black hover:border-primary/50 transition rounded p-8 flex flex-col items-center justify-center cursor-pointer group text-center"
                  >
                    <UploadCloud className="w-8 h-8 text-text-secondary group-hover:text-primary mb-3 transition" />
                    {zipFile ? (
                      <div className="space-y-1">
                        <span className="text-white font-bold block">{zipFile.name}</span>
                        <span className="text-[10px] text-text-secondary block">{(zipFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-white block">Drag and drop repository zip archive here</span>
                        <span className="text-[10px] text-text-secondary block">or click to browse local files</span>
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
                    <label htmlFor="zip-upload-input" className="mt-4 px-3 py-1.5 border border-border bg-card hover:border-primary transition rounded text-[10px] cursor-pointer">
                      BROWSE FILE
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'local' && (
                <div className="space-y-2">
                  <label className="text-text-secondary block">LOCAL SYSTEM DIRECTORY PATH</label>
                  <div className="flex border border-border bg-black rounded p-1 hover:border-primary/50 transition">
                    <span className="px-3 flex items-center text-text-secondary border-r border-border"><FolderOpen className="w-3.5 h-3.5" /></span>
                    <input
                      type="text"
                      placeholder="C:\Users\username\projects\source-code"
                      value={localFolder}
                      onChange={(e) => setLocalFolder(e.target.value)}
                      required={activeTab === 'local'}
                      className="flex-1 bg-transparent border-0 outline-none px-3 text-white text-xs h-9 placeholder:text-[#555]"
                    />
                  </div>
                  <span className="text-[10px] text-text-secondary">Direct file access matching system daemon index bindings.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded border border-transparent shadow-[0_0_15px_rgba(255,32,32,0.3)] transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                INITIATE ENGINE SECURITY SCAN
              </button>
            </form>
          </div>
        </div>

        {/* Right Side Scan History logs list */}
        <div className="space-y-4">
          <div className="border border-border bg-surface p-4 rounded space-y-4">
            <h3 className="font-sans font-bold text-white tracking-widest text-[10px] uppercase border-b border-border pb-2">
              RECENT ANALYSIS JOBS
            </h3>

            <div className="space-y-3">
              {repositories.map((repo, idx) => (
                <div key={idx} className="border border-border bg-black/30 p-3 rounded space-y-2 relative overflow-hidden">
                  {/* Status header indicator */}
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white truncate max-w-[130px]">{repo.name}</span>
                    <span className={`inline-flex items-center gap-1 text-[9px] ${repo.status === 'Clean' ? 'text-success' :
                        repo.status === 'Scanning' ? 'text-medium animate-pulse' :
                          'text-critical'
                      }`}>
                      {repo.status === 'Clean' ? <ShieldCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {repo.status}
                    </span>
                  </div>

                  {/* Details stats */}
                  <div className="grid grid-cols-2 gap-1.5 text-[9px] text-text-secondary">
                    <div>Issues: <span className="text-white font-bold">{repo.criticalCount + repo.highCount}</span></div>
                    <div>Score: <span className="text-white font-bold">{repo.score}/100</span></div>
                    <div className="col-span-2">Time: {repo.lastScanned}</div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-border/50 flex justify-between items-center text-[9px]">
                    <span className="text-text-secondary">{repo.language}</span>
                    <button
                      onClick={() => {
                        startAnalysis(repo.url);
                        window.open('/pipeline', '_blank');
                      }}
                      className="text-primary hover:underline flex items-center gap-0.5"
                    >
                      Re-run <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
