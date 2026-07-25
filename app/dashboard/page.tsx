'use client';

import React, { useState, useEffect } from 'react';
import { useSecurityStore, Repository } from '../../store/useSecurityStore';
import { 
  ShieldAlert, 
  Activity, 
  Layers, 
  AlertTriangle, 
  Plus, 
  Play, 
  Terminal as TermIcon,
  Search,
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Cpu
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function Dashboard() {
  const router = useRouter();
  const { repositories, findings, selectRepo, startAnalysis, selectedRepoId } = useSecurityStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [langFilter, setLangFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Compute aggregated stats
  const totalRepos = repositories.length;
  const criticalFindings = findings.filter(f => f.severity === 'Critical').length;
  const highFindings = findings.filter(f => f.severity === 'High').length;
  const averageScore = Math.round(repositories.reduce((acc, r) => acc + r.score, 0) / totalRepos) || 100;

  // Chart data
  const scanHistoryData = [
    { day: 'Mon', scans: 12, issues: 2 },
    { day: 'Tue', scans: 19, issues: 4 },
    { day: 'Wed', scans: 15, issues: 1 },
    { day: 'Thu', scans: 22, issues: 5 },
    { day: 'Fri', scans: 31, issues: 8 },
    { day: 'Sat', scans: 14, issues: 3 },
    { day: 'Sun', scans: 29, issues: 6 },
  ];

  const severityPieData = [
    { name: 'Critical', value: criticalFindings, color: '#FF3030' },
    { name: 'High', value: highFindings, color: '#FFA726' },
    { name: 'Medium', value: findings.filter(f => f.severity === 'Medium').length, color: '#4FC3F7' },
    { name: 'Low', value: findings.filter(f => f.severity === 'Low').length, color: '#00E676' },
  ].filter(item => item.value > 0);

  // Fallback if data is 0
  const chartPieData = severityPieData.length > 0 ? severityPieData : [
    { name: 'Critical', value: 2, color: '#FF3030' },
    { name: 'High', value: 4, color: '#FFA726' },
    { name: 'Medium', value: 8, color: '#4FC3F7' },
    { name: 'Low', value: 12, color: '#00E676' },
  ];

  const filteredRepos = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          repo.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang = langFilter === 'All' || repo.language === langFilter;
    const matchesStatus = statusFilter === 'All' || repo.status === statusFilter;
    return matchesSearch && matchesLang && matchesStatus;
  });

  const handleScanRepository = (id: string, url: string) => {
    startAnalysis(url);
    router.push('/pipeline');
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner details */}
      <div className="flex justify-between items-center border border-border bg-surface p-4 rounded relative overflow-hidden">
        <div className="space-y-1">
          <h2 className="text-sm font-sans font-bold text-white tracking-widest uppercase">SECURITY OPERATIONS CENTER</h2>
          <p className="text-text-secondary text-[10px]">Real-time static code analysis & multi-agent vulnerability validation telemetry.</p>
        </div>
        <Link
          href="/analyze"
          className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-3 py-2 rounded flex items-center gap-1.5 transition active:scale-95 border border-transparent shadow-[0_0_10px_rgba(255,32,32,0.2)]"
        >
          <Plus className="w-3.5 h-3.5" />
          ANALYZE REPOSITORY
        </Link>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Repo count */}
        <div className="border border-border bg-surface p-4 rounded flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] text-text-secondary tracking-wider">ACTIVE WORKSPACES</div>
            <div className="text-2xl font-bold font-sans text-white">{totalRepos}</div>
          </div>
          <Layers className="w-8 h-8 text-low opacity-80" />
        </div>

        {/* Critical Issues */}
        <div className="border border-border bg-surface p-4 rounded flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] text-text-secondary tracking-wider">CRITICAL FINDINGS</div>
            <div className="text-2xl font-bold font-sans text-critical neon-text-red">{criticalFindings}</div>
          </div>
          <ShieldAlert className="w-8 h-8 text-critical opacity-80" />
        </div>

        {/* High Issues */}
        <div className="border border-border bg-surface p-4 rounded flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] text-text-secondary tracking-wider">HIGH RISK DISCOVERIES</div>
            <div className="text-2xl font-bold font-sans text-medium">{highFindings}</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-medium opacity-80" />
        </div>

        {/* Average Score */}
        <div className="border border-border bg-surface p-4 rounded flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] text-text-secondary tracking-wider">AVERAGE HEALTH SCORE</div>
            <div className="text-2xl font-bold font-sans text-success flex items-baseline gap-1">
              {averageScore}
              <span className="text-[10px] text-text-secondary">/100</span>
            </div>
          </div>
          <Activity className="w-8 h-8 text-success opacity-80" />
        </div>
      </div>

      {/* Recharts Graphical Plots Grid */}
      {isMounted && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Scans Area Chart */}
          <div className="lg:col-span-8 border border-border bg-surface p-4 rounded flex flex-col justify-between">
            <div className="mb-4">
              <span className="font-sans font-bold text-white tracking-widest text-[10px] uppercase">VULNERABILITY DETECTION HISTORY</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scanHistoryData}>
                  <defs>
                    <linearGradient id="scansGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF2020" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#FF2020" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#555" fontSize={9} />
                  <YAxis stroke="#555" fontSize={9} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0F0F0F', borderColor: '#2A2A2A', fontSize: 10, fontFamily: 'monospace', color: '#FFF' }}
                  />
                  <Area type="monotone" dataKey="scans" stroke="#FF2020" strokeWidth={1.5} fillOpacity={1} fill="url(#scansGrad)" name="Total Scans" />
                  <Area type="monotone" dataKey="issues" stroke="#FFA726" strokeWidth={1} fill="none" name="Verified Bugs" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Severity Pie Chart */}
          <div className="lg:col-span-4 border border-border bg-surface p-4 rounded flex flex-col justify-between">
            <div>
              <span className="font-sans font-bold text-white tracking-widest text-[10px] uppercase">SEVERITY RATING SPREAD</span>
            </div>
            <div className="h-44 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold font-sans text-white">{findings.length}</span>
                <span className="text-[8px] text-text-secondary uppercase">TOTAL FINDINGS</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[9px] pt-2 border-t border-border">
              {chartPieData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-text-secondary truncate">{entry.name}:</span>
                  <span className="text-white font-bold">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Repositories listing panel */}
      <div className="border border-border bg-surface rounded">
        {/* Filter bar header */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-black/30">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="font-sans font-bold text-white tracking-widest text-[10px] uppercase">INDEXED CODEBASE REPOSITORIES</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex items-center bg-black border border-border px-2.5 rounded hover:border-primary/50 transition">
              <Search className="w-3.5 h-3.5 text-text-secondary" />
              <input 
                type="text" 
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-0 outline-none text-white text-[10px] h-7 w-40 placeholder:text-[#555]"
              />
            </div>

            {/* Language filter */}
            <select 
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              className="bg-black border border-border px-2.5 py-1 rounded text-white text-[10px] h-7 outline-none hover:border-primary/50 transition"
            >
              <option value="All">All Languages</option>
              <option value="TypeScript">TypeScript</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Go">Go</option>
              <option value="Python">Python</option>
            </select>

            {/* Status Filter */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black border border-border px-2.5 py-1 rounded text-white text-[10px] h-7 outline-none hover:border-primary/50 transition"
            >
              <option value="All">All Statuses</option>
              <option value="Clean">Clean</option>
              <option value="Alert">Alert</option>
              <option value="Scanning">Scanning</option>
            </select>
          </div>
        </div>

        {/* Repositories list grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-black/10 text-[9px] text-text-secondary uppercase">
                <th className="p-3">Repository Name</th>
                <th className="p-3">Primary Language</th>
                <th className="p-3">Vulnerabilities</th>
                <th className="p-3">Security Score</th>
                <th className="p-3">Last Scanned</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRepos.map((repo) => (
                <tr 
                  key={repo.id}
                  onClick={() => selectRepo(repo.id)}
                  className={`hover:bg-card/30 transition-colors cursor-pointer ${
                    repo.id === selectedRepoId ? 'bg-card/15' : ''
                  }`}
                >
                  <td className="p-3">
                    <div className="font-bold text-white">{repo.name}</div>
                    <div className="text-[10px] text-text-secondary mt-0.5 truncate max-w-xs">{repo.url}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 border border-border bg-black/30 rounded text-[10px] text-white">
                      {repo.language}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {repo.criticalCount > 0 && (
                        <span className="text-critical font-bold">C: {repo.criticalCount}</span>
                      )}
                      {repo.highCount > 0 && (
                        <span className="text-medium font-bold">H: {repo.highCount}</span>
                      )}
                      {repo.mediumCount === 0 && repo.criticalCount === 0 && repo.highCount === 0 && (
                        <span className="text-success font-bold">0 Alerts</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#161616] h-1.5 rounded-full overflow-hidden border border-border">
                        <div 
                          className={`h-full rounded-full ${
                            repo.score >= 90 ? 'bg-success' : repo.score >= 70 ? 'bg-medium' : 'bg-critical'
                          }`}
                          style={{ width: `${repo.score}%` }}
                        />
                      </div>
                      <span className="font-bold text-white">{repo.score}</span>
                    </div>
                  </td>
                  <td className="p-3 text-text-secondary">
                    {repo.lastScanned}
                  </td>
                  <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      disabled={repo.status === 'Scanning'}
                      onClick={() => handleScanRepository(repo.id, repo.url)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] border border-border bg-black hover:border-primary/50 text-white rounded transition ${
                        repo.status === 'Scanning' ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    >
                      <Play className="w-3 h-3 text-primary" />
                      {repo.status === 'Scanning' ? 'SCANNING' : 'RE-SCAN'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRepos.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-secondary font-bold">
                    No repositories matched filter terms.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
