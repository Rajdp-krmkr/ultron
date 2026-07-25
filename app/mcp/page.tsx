'use client';

import React, { useState } from 'react';
import { useSecurityStore } from '../../store/useSecurityStore';
import { 
  Link2, 
  Cpu, 
  CheckCircle2, 
  Info,
  Clock,
  Layers,
  ArrowRight,
  Braces,
  Radio
} from 'lucide-react';

export default function McpIntegration() {
  const { mcpClients } = useSecurityStore();
  const [activeClientIdx, setActiveClientIdx] = useState(0);

  const selectedClient = mcpClients[activeClientIdx];

  return (
    <div className="space-y-6 font-mono text-xs max-w-5xl mx-auto">
      {/* Banner */}
      <div className="border border-border bg-surface p-4 rounded flex justify-between items-center">
        <div className="space-y-0.5 text-left">
          <h2 className="text-sm font-sans font-bold text-white tracking-widest uppercase">MODEL CONTEXT PROTOCOL (MCP) INTERFACE</h2>
          <p className="text-text-secondary text-[10px]">Audit connected LLM application contexts and local scanning tools definitions.</p>
        </div>

        <div className="flex items-center gap-1.5 border border-border bg-black/40 px-3 py-1.5 rounded text-success">
          <Radio className="w-3.5 h-3.5 text-success animate-pulse" />
          <span>DAEMON RUNNING: PORT 8000</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Connected Clients */}
        <div className="md:col-span-5 border border-border bg-surface rounded flex flex-col overflow-hidden text-left min-h-[300px]">
          <div className="p-3 border-b border-border bg-black/45 select-none shrink-0">
            <span className="text-white text-[10px] font-bold">CONNECTED CLIENT APPLICATIONS</span>
          </div>

          <div className="flex-1 divide-y divide-border/60">
            {mcpClients.map((client, idx) => (
              <button
                key={client.name}
                onClick={() => setActiveClientIdx(idx)}
                className={`w-full p-4 hover:bg-card/25 transition text-left space-y-2 ${
                  idx === activeClientIdx ? 'bg-card/15' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-xs">{client.name}</span>
                  <span className="inline-flex items-center gap-1 text-[9px] text-success">
                    <CheckCircle2 className="w-3 h-3 text-success" />
                    {client.status}
                  </span>
                </div>
                <div className="text-[10px] text-text-secondary">Last Active: {client.lastSeen}</div>
                <div className="text-[10px] text-text-secondary">Exposing <span className="text-primary font-bold">{client.tools.length} security tools</span></div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Tools details listing */}
        <div className="md:col-span-7 space-y-4">
          {selectedClient ? (
            <div className="border border-border bg-surface p-5 rounded space-y-6 text-left">
              {/* Header */}
              <div className="border-b border-border pb-3 flex justify-between items-center">
                <div className="space-y-0.5">
                  <h3 className="text-white font-sans font-bold text-sm uppercase">{selectedClient.name} bindings</h3>
                  <p className="text-[10px] text-text-secondary">API bindings configured in configuration file</p>
                </div>
                <span className="text-text-secondary text-[10px] border border-border bg-black px-2 py-0.5 rounded">
                  MCP Version: 1.0.4
                </span>
              </div>

              {/* Tools checklist */}
              <div className="space-y-4">
                <span className="text-text-secondary font-bold text-[9px] uppercase tracking-wider block border-b border-border/50 pb-1">AVAILABLE TOOLS SCHEMA</span>
                
                <div className="space-y-4">
                  {selectedClient.tools.map((tool, idx) => (
                    <div key={idx} className="border border-border/60 bg-black/20 p-4 rounded space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primary font-mono">{tool.name}</span>
                        <span className="inline-flex items-center gap-1 text-[9px] text-text-secondary font-mono">
                          <Braces className="w-3 h-3 text-text-secondary" /> tool definition
                        </span>
                      </div>
                      <p className="text-text-secondary leading-relaxed text-[11px] font-sans">{tool.description}</p>
                      
                      {/* JSON parameter details */}
                      <div className="space-y-1.5">
                        <span className="text-text-secondary text-[8px] uppercase font-bold tracking-wider">JSON CONFIGURATION</span>
                        <pre className="border border-border bg-black/60 p-2.5 rounded text-white font-mono text-[9px] leading-relaxed overflow-x-auto whitespace-pre">
                          {tool.parameters}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-border bg-surface p-12 rounded text-center text-text-secondary flex items-center justify-center gap-1 bg-black/10">
              <Info className="w-4 h-4 text-border" />
              <span>Select an active MCP client to view definitions.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
