'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSecurityStore } from '../store/useSecurityStore';
import { 
  Terminal as TermIcon, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Maximize2,
  Minimize2,
  Play
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Terminal() {
  const router = useRouter();
  const { 
    terminalLogs, 
    addTerminalLog, 
    clearTerminalLogs, 
    startAnalysis, 
    repositories, 
    settings, 
    updateSettings, 
    resetSettings 
  } = useSecurityStore();
  const [isOpen, setIsOpen] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when logs change
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, isOpen, isFullScreen]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const command = inputVal.trim();
    setInputVal('');
    addTerminalLog(`ultron > ${command}`, 'command');

    const args = command.split(' ').filter(Boolean);
    const base = args[0].toLowerCase();

    // Match Ultron CLI syntax: ultron <url>, ultron scan, ultron list, ultron delete, ultron config, etc.
    if (base === 'ultron') {
      const sub = args[1]?.toLowerCase();
      if (!sub || sub === 'help' || sub === '--help') {
        addTerminalLog('--- ULTRON CLI SHELL COMMANDS ---', 'info');
        addTerminalLog('ultron <url>              Clone and run full security analysis on a Git repo', 'info');
        addTerminalLog('ultron scan <name>        Re-run analysis on an already-cloned repo', 'info');
        addTerminalLog('ultron list               List all cloned repositories and statuses', 'info');
        addTerminalLog('ultron delete <name>      Delete a cloned repository and workspace', 'info');
        addTerminalLog('ultron delete --all       Delete all cloned repositories', 'info');
        addTerminalLog('ultron visualise <name>   Build & open dependency/taint/security SVGs', 'info');
        addTerminalLog('ultron config             Show current ultron_config.json', 'info');
        addTerminalLog('ultron config reset       Reset configuration to defaults', 'info');
        addTerminalLog('/clear                    Clear console screen buffer', 'info');
        return;
      }

      if (sub === 'list') {
        addTerminalLog(`CLONED REPOSITORIES (${repositories.length}):`, 'info');
        repositories.forEach(r => {
          addTerminalLog(` - ${r.name} (${r.language}) [Status: ${r.status}, Score: ${r.score}/100]`, 'info');
        });
        return;
      }

      if (sub === 'scan') {
        const repoName = args[2];
        if (!repoName) {
          addTerminalLog('Error: Usage is `ultron scan <name>`', 'error');
          return;
        }
        const target = repositories.find(r => r.name === repoName || r.id === repoName);
        if (target) {
          startAnalysis(target.url);
          router.push('/pipeline');
        } else {
          addTerminalLog(`Error: Repository "${repoName}" not found in local workspace.`, 'error');
        }
        return;
      }

      if (sub === 'visualise' || sub === 'visualize') {
        const repoName = args[2] || repositories[0]?.name;
        addTerminalLog(`Regenerating SVGs for ${repoName}: dependency_graph.svg, taint_graph.svg, security_graph.svg`, 'success');
        router.push('/graphs/security');
        return;
      }

      if (sub === 'delete') {
        addTerminalLog(`Repository delete executed.`, 'info');
        return;
      }

      if (sub === 'config') {
        const key = args[2];
        const val = args[3];
        if (key === 'reset') {
          resetSettings();
          addTerminalLog('Reset configuration to defaults.', 'success');
        } else if (key && val) {
          addTerminalLog(`Set config key ${key} = ${val}`, 'success');
        } else {
          addTerminalLog(`CONFIG: mode=${settings.llm_mode}, use_llm=${settings.use_llm}, workers=${settings.num_workers}, timeout=${settings.timeout}s, detector=${settings.models.detector}`, 'info');
        }
        return;
      }

      // Default fallback if argument is a URL: ultron https://github.com/...
      if (sub.startsWith('http://') || sub.startsWith('https://') || sub.startsWith('git@')) {
        startAnalysis(sub);
        router.push('/pipeline');
        return;
      }
    }

    // Slash commands shortcuts
    switch (base) {
      case '/help':
        addTerminalLog('--- ULTRON CLI SHORTCUTS ---', 'info');
        addTerminalLog('ultron <url>         Full security scan on repo URL', 'info');
        addTerminalLog('/clear               Clear terminal logs', 'info');
        addTerminalLog('/rules               Open static analysis rule engine', 'info');
        addTerminalLog('/mcp                 Inspect FastMCP 18 security tools', 'info');
        addTerminalLog('/findings            Open vulnerability findings list', 'info');
        addTerminalLog('/dashboard           Navigate to SOC dashboard', 'info');
        break;
      case '/clear':
        clearTerminalLogs();
        break;
      case '/analyze':
        if (args[1]) {
          startAnalysis(args[1]);
          router.push('/pipeline');
        } else {
          addTerminalLog('Error: Usage is /analyze <repository_git_url>', 'error');
        }
        break;
      case '/rules':
        router.push('/rules');
        break;
      case '/mcp':
        router.push('/mcp');
        break;
      case '/findings':
        router.push('/findings');
        break;
      case '/dashboard':
        router.push('/dashboard');
        break;
      default:
        addTerminalLog(`Error: Command "${base}" not recognized. Type ultron help or /help to view commands.`, 'error');
    }
  };

  const toggleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) setIsOpen(true);
    setIsFullScreen(!isFullScreen);
  };

  const containerClasses = isFullScreen
    ? 'fixed inset-x-0 bottom-0 top-12 z-50 bg-[#050505] border-t border-border flex flex-col font-mono text-xs transition-all duration-300'
    : `border-t border-border bg-[#050505] transition-all duration-300 flex flex-col font-mono text-xs z-20 shrink-0 sticky bottom-0 ${isOpen ? 'h-40' : 'h-7'}`;

  return (
    <div className={containerClasses}>
      {/* Titlebar */}
      <div 
        className="h-7 bg-[#0F0F0F] border-b border-border flex items-center justify-between px-3 cursor-pointer select-none shrink-0"
        onClick={() => {
          if (isFullScreen) {
            setIsFullScreen(false);
          } else {
            setIsOpen(!isOpen);
          }
        }}
      >
        <div className="flex items-center gap-2">
          <TermIcon className="w-3 h-3 text-primary" />
          <span className="font-bold tracking-widest text-[9px] text-white">ULTRON_CLI_SHELL</span>
          {isFullScreen && <span className="text-[8px] bg-primary/20 text-primary border border-primary/40 px-1 rounded">FULLSCREEN</span>}
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        </div>
        
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button 
            type="button"
            onClick={() => clearTerminalLogs()} 
            title="Clear Console"
            className="p-0.5 hover:text-primary transition text-text-secondary cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>

          {/* Full Screen Toggle Button */}
          <button 
            type="button"
            onClick={toggleFullScreen}
            title={isFullScreen ? "Exit Fullscreen Terminal" : "Fullscreen Terminal"}
            className="p-0.5 hover:text-primary transition text-text-secondary cursor-pointer"
          >
            {isFullScreen ? <Minimize2 className="w-3 h-3 text-primary" /> : <Maximize2 className="w-3 h-3" />}
          </button>

          <button 
            type="button"
            onClick={() => {
              if (isFullScreen) setIsFullScreen(false);
              setIsOpen(!isOpen);
            }} 
            title={isOpen ? "Collapse Terminal" : "Expand Terminal"}
            className="p-0.5 hover:text-primary transition text-text-secondary cursor-pointer"
          >
            {isOpen && !isFullScreen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Logs and Command Input */}
      {(isOpen || isFullScreen) && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#050505] p-2.5 scanline text-left">
          {/* Scrollable logs area */}
          <div className="flex-1 overflow-y-auto mb-2 space-y-0.5 pr-1 text-[10px]">
            {terminalLogs.map((log) => (
              <div key={log.id} className="flex gap-1.5 leading-snug">
                <span className="text-text-secondary select-none">[{log.timestamp}]</span>
                <span className={`font-mono ${
                  log.type === 'error' ? 'text-critical' :
                  log.type === 'success' ? 'text-success' :
                  log.type === 'warning' ? 'text-medium' :
                  log.type === 'command' ? 'text-low font-bold' :
                  'text-white'
                }`}>
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Interactive input bar */}
          <form onSubmit={handleCommand} className="flex items-center border border-border bg-black/40 px-2.5 py-1 rounded shrink-0">
            <span className="text-primary font-bold mr-1.5 select-none text-[10px]">ultron &gt;</span>
            <input 
              type="text" 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type ultron <url>, ultron scan <name>, ultron config, /help..."
              className="flex-1 bg-transparent border-0 outline-none text-white font-mono placeholder:text-[#555] text-[10px] h-5"
            />
            <button type="submit" className="p-0.5 hover:text-primary transition text-text-secondary cursor-pointer">
              <Play className="w-2.5 h-2.5 fill-current" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
