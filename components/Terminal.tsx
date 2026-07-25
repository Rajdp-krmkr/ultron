'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSecurityStore } from '../store/useSecurityStore';
import { 
  Terminal as TermIcon, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Play
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Terminal() {
  const router = useRouter();
  const { terminalLogs, addTerminalLog, clearTerminalLogs, startAnalysis } = useSecurityStore();
  const [isOpen, setIsOpen] = useState(true);
  const [inputVal, setInputVal] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when logs change
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, isOpen]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const command = inputVal.trim();
    setInputVal('');
    addTerminalLog(`ultron > ${command}`, 'command');

    const args = command.split(' ');
    const baseCommand = args[0].toLowerCase();

    switch (baseCommand) {
      case '/help':
        addTerminalLog('--- ULTRON CONSOLE SHELL HELP ---', 'info');
        addTerminalLog('/help                 Show this help screen', 'info');
        addTerminalLog('/clear                Clear all logs from screen buffer', 'info');
        addTerminalLog('/analyze <url>        Initiate repository analysis', 'info');
        addTerminalLog('/rules                Navigate to Rule Engine configuration', 'info');
        addTerminalLog('/mcp                  Check Model Context Protocol clients', 'info');
        addTerminalLog('/findings             Navigate to vulnerability report', 'info');
        addTerminalLog('/dashboard            Go back to the Security Operations Center dashboard', 'info');
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
        addTerminalLog('Redirecting to Rule Engine...', 'info');
        break;
      case '/mcp':
        router.push('/mcp');
        addTerminalLog('Redirecting to MCP panel...', 'info');
        break;
      case '/findings':
        router.push('/findings');
        addTerminalLog('Opening active findings table...', 'info');
        break;
      case '/dashboard':
        router.push('/dashboard');
        addTerminalLog('Redirecting to main SOC dashboard...', 'info');
        break;
      default:
        addTerminalLog(`Error: Command "${baseCommand}" not recognized. Type /help to see all commands.`, 'error');
    }
  };

  return (
    <div 
      className={`border-t border-border bg-[#050505] transition-all duration-300 flex flex-col font-mono text-xs z-20 ${
        isOpen ? 'h-52' : 'h-8'
      }`}
    >
      {/* Titlebar */}
      <div 
        className="h-8 bg-[#0F0F0F] border-b border-border flex items-center justify-between px-4 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <TermIcon className="w-3.5 h-3.5 text-primary" />
          <span className="font-bold tracking-widest text-[10px] text-white">LIVE_ENGINE_TERMINAL</span>
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        </div>
        
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => clearTerminalLogs()} 
            title="Clear Console"
            className="p-1 hover:text-primary transition text-text-secondary"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-1 hover:text-primary transition text-text-secondary"
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Logs and Command Input */}
      {isOpen && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#050505] p-3 scanline">
          {/* Scrollable logs area */}
          <div className="flex-1 overflow-y-auto mb-2 space-y-1 pr-2 max-h-36">
            {terminalLogs.map((log) => (
              <div key={log.id} className="flex gap-2 leading-relaxed">
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
          <form onSubmit={handleCommand} className="flex items-center border border-border bg-black/40 px-2.5 py-1 rounded">
            <span className="text-primary font-bold mr-2 select-none">ultron &gt;</span>
            <input 
              type="text" 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter engine command (e.g. /help, /analyze, /rules)..."
              className="flex-1 bg-transparent border-0 outline-none text-white font-mono placeholder:text-[#555] text-xs h-6"
            />
            <button type="submit" className="p-1 hover:text-primary transition text-text-secondary">
              <Play className="w-3 h-3 fill-current" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
