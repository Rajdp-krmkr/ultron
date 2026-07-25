'use client';

import React, { useState, useEffect } from 'react';
import { useSecurityStore } from '../store/useSecurityStore';
import { 
  Bell, 
  Cpu, 
  Activity, 
  Network, 
  User, 
  Database,
  ChevronsUpDown,
  Zap,
  Globe
} from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  const { repositories, selectedRepoId, selectRepo, addTerminalLog, settings } = useSecurityStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [systemTime, setSystemTime] = useState('13:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const time = new Date();
      setSystemTime(time.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeRepo = repositories.find(r => r.id === selectedRepoId) || repositories[0];

  const pageTitle = pathname.split('/').filter(Boolean).map(segment => 
    segment.charAt(0).toUpperCase() + segment.slice(1)
  ).join(' > ') || 'Landing';

  const mockNotifications = [
    { id: 1, title: 'Analysis Complete', body: 'Repo financial-api-gateway completed. 2 Critical findings verified.', time: '5m ago' },
    { id: 2, title: 'MCP Tool Request', body: 'Cursor Client invoked ultron_get_security_graph tool.', time: '12m ago' },
    { id: 3, title: 'Zero-Flow Pass', body: 'Agentic general scan completed with zero taint paths.', time: '1h ago' }
  ];

  return (
    <header className="h-12 border-b border-border bg-surface text-white flex items-center justify-between px-4 z-20 select-none shrink-0 sticky top-0">
      {/* Route Directory Name */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] text-text-secondary tracking-widest uppercase">ULTRON /</span>
        <span className="font-mono text-[11px] font-bold text-white tracking-widest">{pageTitle}</span>
      </div>

      {/* Center Repository Switcher & Action Telemetry */}
      <div className="flex items-center gap-4">
        {/* Repo Switcher Dropdown */}
        <div className="relative">
          <button 
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 border border-border bg-black hover:border-primary transition duration-150 rounded text-[11px] font-mono cursor-pointer"
          >
            <Database className="w-3 h-3 text-primary shrink-0" />
            <span className="text-white max-w-[130px] truncate">{activeRepo?.name || 'Select Repository'}</span>
            <ChevronsUpDown className="w-3 h-3 text-text-secondary shrink-0" />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-56 border border-border bg-surface rounded shadow-xl z-50 overflow-hidden text-left">
              <div className="p-1.5 border-b border-border bg-black/40 text-[9px] font-mono text-text-secondary">
                CLONED WORKSPACES
              </div>
              <ul className="max-h-52 overflow-y-auto font-mono text-xs">
                {repositories.map((repo) => (
                  <li key={repo.id}>
                    <button
                      type="button"
                      onClick={() => {
                        selectRepo(repo.id);
                        addTerminalLog(`Switched active repository context to: ${repo.name}`, 'info');
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 hover:bg-card hover:text-primary transition flex justify-between items-center ${
                        repo.id === selectedRepoId ? 'text-primary bg-card/40 font-bold' : 'text-white'
                      }`}
                    >
                      <span className="truncate">{repo.name}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        repo.status === 'Clean' ? 'bg-success' : repo.status === 'Scanning' ? 'bg-medium animate-pulse' : 'bg-critical'
                      }`} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Telemetry metrics matching Ultron config */}
        <div className="hidden md:flex items-center gap-3 text-[9px] font-mono border-l border-border pl-4">
          <div className="flex items-center gap-1">
            <Globe className="w-2.5 h-2.5 text-primary" />
            <span className="text-text-secondary">MODE:</span>
            <span className="text-white font-bold">{settings.llm_mode.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Cpu className="w-2.5 h-2.5 text-success animate-pulse" />
            <span className="text-text-secondary">WORKERS:</span>
            <span className="text-white font-bold">{settings.num_workers}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-2.5 h-2.5 text-low" />
            <span className="text-text-secondary">CACHE:</span>
            <span className="text-white font-bold">{settings.enable_cache ? 'ON' : 'OFF'}</span>
          </div>
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-3">
        {/* System Clock */}
        <div className="hidden sm:block font-mono text-[10px] text-text-secondary border border-border px-2 py-0.5 bg-black/30 rounded">
          {systemTime}
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button 
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 border border-border bg-black/30 hover:border-primary transition duration-150 rounded relative cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-white" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-1.5 w-72 border border-border bg-surface rounded shadow-xl z-50 text-left">
              <div className="p-2 border-b border-border bg-black/40 flex justify-between items-center">
                <span className="text-[11px] font-mono font-bold text-white">SYSTEM NOTIFICATIONS</span>
                <span className="text-[9px] font-mono text-primary cursor-pointer hover:underline">Mark all read</span>
              </div>
              <ul className="divide-y divide-border max-h-64 overflow-y-auto">
                {mockNotifications.map((notif) => (
                  <li key={notif.id} className="p-2.5 hover:bg-card transition">
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="text-[11px] font-mono font-bold text-white">{notif.title}</span>
                      <span className="text-[9px] font-mono text-text-secondary">{notif.time}</span>
                    </div>
                    <p className="text-[10px] font-mono text-text-secondary leading-normal">{notif.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Profile / Agent tag */}
        <div className="flex items-center gap-1.5 border border-border bg-black/30 hover:border-primary transition duration-150 px-2 py-1 rounded cursor-pointer">
          <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center border border-primary">
            <User className="w-2.5 h-2.5 text-primary" />
          </div>
          <span className="hidden md:inline font-mono text-[10px] text-white">ULTRON_CLI</span>
        </div>
      </div>
    </header>
  );
}
