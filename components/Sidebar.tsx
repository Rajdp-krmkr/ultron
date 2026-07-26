'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  SearchCode, 
  GitFork, 
  AlertTriangle, 
  FileText, 
  Terminal as TerminalIcon, 
  Settings as SettingsIcon,
  ChevronsLeft,
  ChevronsRight,
  Link2
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Analyze Repository', icon: SearchCode, path: '/analyze' },
    { name: 'Pipeline', icon: GitFork, path: '/pipeline' },
    { name: 'Findings', icon: AlertTriangle, path: '/findings' },
    { name: 'Reports', icon: FileText, path: '/reports' },
    { name: 'API Explorer', icon: TerminalIcon, path: '/api-explorer' },
    { name: 'MCP Integration', icon: Link2, path: '/mcp' },
    { name: 'Settings', icon: SettingsIcon, path: '/settings' }
  ];

  return (
    <aside 
      className={`h-screen border-r border-border bg-surface text-white transition-all duration-300 flex flex-col justify-between select-none z-30 shrink-0 ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Logo Section */}
        <div className="h-12 flex items-center px-3 border-b border-border relative overflow-hidden justify-between shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded border border-primary flex items-center justify-center bg-black/50 shadow-[0_0_8px_rgba(255,32,32,0.4)]">
              <span className="text-primary font-bold text-xs tracking-tighter">U</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-sans font-bold tracking-widest text-white text-xs neon-text-red">ULTRON</span>
                <span className="text-[8px] text-text-secondary tracking-widest font-mono">MULTI-AGENT SEC</span>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button 
              type="button"
              onClick={() => setCollapsed(true)}
              className="p-1 hover:text-primary hover:bg-card border border-transparent hover:border-border transition rounded"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin">
          <ul className="space-y-0.5 px-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-mono transition-all rounded duration-150 group relative ${
                      isActive 
                        ? 'bg-card text-primary border-l-2 border-primary font-bold' 
                        : 'text-text-secondary hover:text-white hover:bg-card/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? 'text-primary scale-110' : 'group-hover:scale-110'}`} />
                    {!collapsed && <span className="truncate text-[11px]">{item.name}</span>}
                    
                    {/* Tooltip for collapsed sidebar */}
                    {collapsed && (
                      <div className="absolute left-14 bg-surface border border-border text-white text-[10px] py-1 px-2.5 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 font-mono">
                        {item.name}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Footer Collapse Action */}
      {collapsed && (
        <div className="p-2 border-t border-border flex justify-center shrink-0">
          <button 
            type="button"
            onClick={() => setCollapsed(false)}
            className="p-1 hover:text-primary hover:bg-card border border-transparent hover:border-border transition rounded"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </aside>
  );
}
