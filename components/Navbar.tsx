'use client';

import React, { useState, useEffect } from 'react';
import { useSecurityStore } from '../store/useSecurityStore';
import { 
  Bell, 
  Search, 
  Cpu, 
  Activity, 
  Network, 
  User, 
  Terminal,
  Database,
  ChevronsUpDown
} from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  const { repositories, selectedRepoId, selectRepo, addTerminalLog } = useSecurityStore();
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
    { id: 2, title: 'MCP Request', body: 'Cursor Client retrieved call graph for auth-server-oauth.', time: '12m ago' },
    { id: 3, title: 'Security Alert', body: 'High risk entropy leak detected in configs.', time: '1h ago' }
  ];

  return (
    <header className="h-16 border-b border-border bg-surface text-white flex items-center justify-between px-6 z-20 select-none">
      {/* Route Directory Name */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-text-secondary tracking-widest uppercase">ENGINE_ROOT /</span>
        <span className="font-mono text-xs font-bold text-white tracking-widest">{pageTitle}</span>
      </div>

      {/* Center Repository Switcher & Action Telemetry */}
      <div className="flex items-center gap-6">
        {/* Repo Switcher Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 border border-border bg-black hover:border-primary transition duration-150 rounded text-xs font-mono"
          >
            <Database className="w-3.5 h-3.5 text-primary" />
            <span className="text-white max-w-[150px] truncate">{activeRepo?.name || 'Select Repository'}</span>
            <ChevronsUpDown className="w-3.5 h-3.5 text-text-secondary" />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-56 border border-border bg-surface rounded shadow-xl z-50 overflow-hidden">
              <div className="p-2 border-b border-border bg-black/40 text-[10px] font-mono text-text-secondary">
                ACTIVE WORKSPACES
              </div>
              <ul className="max-h-60 overflow-y-auto font-mono text-xs">
                {repositories.map((repo) => (
                  <li key={repo.id}>
                    <button
                      onClick={() => {
                        selectRepo(repo.id);
                        addTerminalLog(`Switched active repository context to: ${repo.name}`, 'info');
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-card hover:text-primary transition flex justify-between items-center ${
                        repo.id === selectedRepoId ? 'text-primary bg-card/40' : 'text-white'
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

        {/* Telemetry metrics */}
        <div className="hidden md:flex items-center gap-4 text-[10px] font-mono border-l border-border pl-6">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-success animate-pulse" />
            <span className="text-text-secondary">MCP:</span>
            <span className="text-white">ONLINE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-text-secondary">CPU_LOAD:</span>
            <span className="text-white">12.4%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Network className="w-3 h-3 text-low" />
            <span className="text-text-secondary">LATENCY:</span>
            <span className="text-white">2ms</span>
          </div>
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-4">
        {/* System Clock */}
        <div className="hidden sm:block font-mono text-xs text-text-secondary border border-border px-2.5 py-1 bg-black/30 rounded">
          {systemTime}
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 border border-border bg-black/30 hover:border-primary transition duration-150 rounded relative"
          >
            <Bell className="w-4 h-4 text-white" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 border border-border bg-surface rounded shadow-xl z-50">
              <div className="p-3 border-b border-border bg-black/40 flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-white">NOTIFICATIONS</span>
                <span className="text-[10px] font-mono text-primary cursor-pointer hover:underline">Mark all read</span>
              </div>
              <ul className="divide-y divide-border max-h-80 overflow-y-auto">
                {mockNotifications.map((notif) => (
                  <li key={notif.id} className="p-3 hover:bg-card transition">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-mono font-bold text-white">{notif.title}</span>
                      <span className="text-[9px] font-mono text-text-secondary">{notif.time}</span>
                    </div>
                    <p className="text-[11px] font-mono text-text-secondary leading-relaxed">{notif.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 border border-border bg-black/30 hover:border-primary transition duration-150 px-2.5 py-1.5 rounded cursor-pointer">
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center border border-primary">
            <User className="w-3 h-3 text-primary" />
          </div>
          <span className="hidden md:inline font-mono text-xs text-white">SEC_OFFICER</span>
        </div>
      </div>
    </header>
  );
}
