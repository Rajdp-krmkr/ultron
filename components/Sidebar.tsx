'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  LayoutDashboard, 
  FolderGit2, 
  SearchCode, 
  GitFork, 
  AlertTriangle, 
  FileJson, 
  Network, 
  Workflow, 
  Cpu, 
  FileText, 
  Code2, 
  Terminal as TerminalIcon, 
  Settings as SettingsIcon,
  ChevronsLeft,
  ChevronsRight,
  Fingerprint,
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
    { name: 'AST Explorer', icon: Code2, path: '/ast' },
    { name: 'IR Explorer', icon: FileJson, path: '/ir' },
    { name: 'Taint Graph', icon: Workflow, path: '/graphs/taint' },
    { name: 'Call Graph', icon: Network, path: '/graphs/call' },
    { name: 'Security Graph', icon: Shield, path: '/graphs/security' },
    { name: 'Rule Engine', icon: Fingerprint, path: '/rules' },
    { name: 'LLM Verification', icon: Cpu, path: '/llm-verification' },
    { name: 'Reports', icon: FileText, path: '/reports' },
    { name: 'API Explorer', icon: TerminalIcon, path: '/api-explorer' },
    { name: 'MCP Integration', icon: Link2, path: '/mcp' },
    { name: 'Settings', icon: SettingsIcon, path: '/settings' }
  ];

  return (
    <aside 
      className={`h-screen border-r border-border bg-surface text-white transition-all duration-300 flex flex-col justify-between select-none z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div>
        {/* Logo Section */}
        <div className="h-16 flex items-center px-4 border-b border-border relative overflow-hidden justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-primary flex items-center justify-center bg-black/50 shadow-[0_0_8px_rgba(255,32,32,0.4)]">
              <span className="text-primary font-bold text-sm tracking-tighter">U</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-sans font-bold tracking-widest text-white text-sm neon-text-red">ULTRON</span>
                <span className="text-[9px] text-text-secondary tracking-widest font-mono">MULTI-AGENT SEC</span>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button 
              onClick={() => setCollapsed(true)}
              className="p-1 hover:text-primary hover:bg-card border border-transparent hover:border-border transition rounded"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 overflow-y-auto max-h-[calc(100vh-10rem)] scrollbar-thin">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-mono transition-all rounded duration-150 group relative ${
                      isActive 
                        ? 'bg-card text-primary border-l-2 border-primary' 
                        : 'text-text-secondary hover:text-white hover:bg-card/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-primary scale-110' : 'group-hover:scale-110'}`} />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                    
                    {/* Tooltip for collapsed sidebar */}
                    {collapsed && (
                      <div className="absolute left-16 bg-surface border border-border text-white text-xs py-1.5 px-3 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 font-mono">
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
        <div className="p-3 border-t border-border flex justify-center">
          <button 
            onClick={() => setCollapsed(false)}
            className="p-1 hover:text-primary hover:bg-card border border-transparent hover:border-border transition rounded"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
