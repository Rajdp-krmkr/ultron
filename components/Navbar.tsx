'use client';

import React, { useState, useEffect } from 'react';
import { useSecurityStore } from '../store/useSecurityStore';
import { useSession, signOut } from 'next-auth/react';
import { 
  Bell, 
  Cpu, 
  Activity, 
  User, 
  Database,
  ChevronsUpDown,
  Globe,
  LogOut,
  Clock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { repositories, selectedRepoId, selectRepo, setScans, addTerminalLog, settings } = useSecurityStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [systemTime, setSystemTime] = useState('13:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const time = new Date();
      setSystemTime(time.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch scanned repositories from MongoDB Atlas when user is authenticated
  useEffect(() => {
    if (session?.user) {
      fetch('/api/scans')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.scans) && data.scans.length > 0) {
            setScans(data.scans);
          }
        })
        .catch((err) => console.error('Failed to load user scans from MongoDB Atlas:', err));
    }
  }, [session?.user, setScans]);

  const activeRepo = repositories.find(r => r.id === selectedRepoId) || repositories[0];

  const pageTitle = pathname.split('/').filter(Boolean).map(segment => 
    segment.charAt(0).toUpperCase() + segment.slice(1)
  ).join(' > ') || 'Landing';

  const mockNotifications = [
    { id: 1, title: 'Database Scans Synchronized', body: 'Fetched past scan telemetry from MongoDB Atlas.', time: 'Just now' },
    { id: 2, title: 'MCP Tool Daemon', body: 'FastMCP 18 security tools connected.', time: '5m ago' }
  ];

  const userEmail = session?.user?.email || 'operator@ultron.io';
  const userName = session?.user?.name || userEmail.split('@')[0].toUpperCase();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <header className="h-12 border-b border-border bg-surface text-white flex items-center justify-between px-4 z-20 select-none shrink-0 sticky top-0">
      {/* Route Directory Name */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] text-text-secondary tracking-widest uppercase">ULTRON /</span>
        <span className="font-mono text-[11px] font-bold text-white tracking-widest">{pageTitle}</span>
      </div>

      {/* Center Repository Switcher & Action Telemetry */}
      <div className="flex items-center gap-4">
        {/* Repo Switcher Dropdown (Shown when authenticated or when scans exist) */}
        {session?.user && (
          <div className="relative">
            <button 
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 border border-border bg-black hover:border-primary transition duration-150 rounded text-[11px] font-mono cursor-pointer shadow-sm"
            >
              <Database className="w-3 h-3 text-primary shrink-0" />
              <span className="text-white font-bold max-w-[130px] truncate">
                {activeRepo?.name || 'No Repos Scanned'}
              </span>
              <ChevronsUpDown className="w-3 h-3 text-text-secondary shrink-0" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 border border-border bg-surface rounded shadow-2xl z-50 overflow-hidden text-left font-mono">
                <div className="p-2 border-b border-border bg-black/60 flex justify-between items-center text-[9px] text-text-secondary">
                  <span className="font-bold text-white tracking-wider uppercase">SCANNED REPOSITORIES (DB)</span>
                  <span className="text-primary font-bold">{repositories.length} TOTAL</span>
                </div>
                
                <ul className="max-h-60 overflow-y-auto text-xs divide-y divide-border/40">
                  {repositories.map((repo) => (
                    <li key={repo.id}>
                      <button
                        type="button"
                        onClick={() => {
                          selectRepo(repo.id);
                          addTerminalLog(`Switched active repository context to: ${repo.name}`, 'info');
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 hover:bg-card transition flex flex-col gap-1 ${
                          repo.id === selectedRepoId ? 'bg-card/50 border-l-2 border-l-primary' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white truncate max-w-[140px]">{repo.name}</span>
                          <span className={`inline-flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded border ${
                            repo.status === 'Clean' ? 'text-success bg-success/10 border-success/30' :
                            repo.status === 'Scanning' ? 'text-medium bg-medium/10 border-medium/30 animate-pulse' :
                            'text-critical bg-critical/10 border-critical/30'
                          }`}>
                            {repo.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-text-secondary">
                          <span>Issues: <span className="text-white font-bold">{repo.criticalCount + repo.highCount}</span></span>
                          <span>Score: <span className="text-white font-bold">{repo.score}/100</span></span>
                          <span>{repo.lastScanned}</span>
                        </div>
                      </button>
                    </li>
                  ))}

                  {repositories.length === 0 && (
                    <li className="p-4 text-center text-text-secondary text-[10px]">
                      No scanned repositories found in database.
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

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
            <div className="absolute right-0 mt-1.5 w-72 border border-border bg-surface rounded shadow-xl z-50 text-left font-mono">
              <div className="p-2 border-b border-border bg-black/40 flex justify-between items-center">
                <span className="text-[11px] font-bold text-white">SYSTEM NOTIFICATIONS</span>
                <span className="text-[9px] text-primary cursor-pointer hover:underline">Mark all read</span>
              </div>
              <ul className="divide-y divide-border max-h-64 overflow-y-auto">
                {mockNotifications.map((notif) => (
                  <li key={notif.id} className="p-2.5 hover:bg-card transition">
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="text-[11px] font-bold text-white">{notif.title}</span>
                      <span className="text-[9px] text-text-secondary">{notif.time}</span>
                    </div>
                    <p className="text-[10px] text-text-secondary leading-normal">{notif.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Profile / NextAuth user dropdown */}
        {session?.user && (
          <div className="relative font-mono">
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 border border-border bg-black/30 hover:border-primary transition duration-150 px-2 py-1 rounded cursor-pointer"
            >
              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center border border-primary">
                <User className="w-2.5 h-2.5 text-primary" />
              </div>
              <span className="hidden md:inline text-[10px] text-white font-bold truncate max-w-[110px]">{userName}</span>
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 mt-1.5 w-56 border border-border bg-surface rounded shadow-xl z-50 text-left p-2 space-y-2">
                <div className="border-b border-border pb-1.5">
                  <div className="text-[10px] font-bold text-white truncate">{userEmail}</div>
                  <div className="text-[8px] text-text-secondary">MONGODB ATLAS AUTHENTICATED</div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-2 py-1.5 hover:bg-card hover:text-primary transition rounded flex items-center gap-2 text-xs font-mono text-critical cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
