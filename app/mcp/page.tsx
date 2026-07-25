'use client';

import React, { useState } from 'react';
import { useSecurityStore } from '../../store/useSecurityStore';
import { 
  CheckCircle2, 
  Braces,
  Radio,
  Terminal,
  Cpu,
  Layers,
  Search
} from 'lucide-react';

export default function McpIntegration() {
  const { mcpClients } = useSecurityStore();
  const [activeClientIdx, setActiveClientIdx] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Repository' | 'Analysis' | 'Results' | 'Configuration'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedClient = mcpClients[activeClientIdx];

  const filteredTools = selectedClient?.tools.filter(tool => {
    const matchesCategory = categoryFilter === 'All' || tool.category === categoryFilter;
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  return (
    <div className="space-y-4 font-mono text-xs max-w-6xl mx-auto text-left">
      {/* Banner */}
      <div className="border border-border bg-surface p-3 rounded flex justify-between items-center">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <h2 className="text-xs font-sans font-bold text-white tracking-widest uppercase">MODEL CONTEXT PROTOCOL (MCP) SERVER</h2>
          </div>
          <p className="text-text-secondary text-[10px]">FastMCP server exposing 18 Security Tools via JSON-RPC stdio & SSE transport (port 8743).</p>
        </div>

        <div className="flex items-center gap-1.5 border border-border bg-black/40 px-2.5 py-1 rounded text-success text-[10px]">
          <Radio className="w-3 h-3 text-success animate-pulse" />
          <span>FAST_MCP: LISTENING</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Side: Connected Clients */}
        <div className="lg:col-span-4 border border-border bg-surface rounded flex flex-col overflow-hidden min-h-[300px]">
          <div className="p-2.5 border-b border-border bg-black/45 select-none shrink-0 flex justify-between items-center">
            <span className="text-white text-[10px] font-bold">MCP CLIENT BINDINGS</span>
            <span className="text-[9px] text-text-secondary">{mcpClients.length} ACTIVE</span>
          </div>

          <div className="flex-1 divide-y divide-border/60 overflow-y-auto">
            {mcpClients.map((client, idx) => (
              <button
                type="button"
                key={client.name}
                onClick={() => setActiveClientIdx(idx)}
                className={`w-full p-3 hover:bg-card/25 transition text-left space-y-1 ${
                  idx === activeClientIdx ? 'bg-card/20 border-l-2 border-primary' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-[11px]">{client.name}</span>
                  <span className="inline-flex items-center gap-1 text-[8px] text-success">
                    <CheckCircle2 className="w-2.5 h-2.5 text-success" />
                    {client.status}
                  </span>
                </div>
                <div className="text-[9px] text-text-secondary">Last Active: {client.lastSeen}</div>
                <div className="text-[9px] text-text-secondary">
                  Exposing <span className="text-primary font-bold">18 security tools</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: 18 Tools Explorer */}
        <div className="lg:col-span-8 space-y-3">
          {selectedClient && (
            <div className="border border-border bg-surface p-4 rounded space-y-4">
              {/* Header & Filter bar */}
              <div className="border-b border-border pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-white font-sans font-bold text-xs uppercase">{selectedClient.name} MCP BINDINGS</h3>
                  <p className="text-[9px] text-text-secondary">Registered tool schemas available for AI assistants</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-black border border-border px-2 rounded">
                    <Search className="w-3 h-3 text-text-secondary" />
                    <input 
                      type="text" 
                      placeholder="Filter tools..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent border-0 outline-none text-white text-[9px] h-6 w-28 placeholder:text-[#555]"
                    />
                  </div>

                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as any)}
                    className="bg-black border border-border px-2 py-0.5 rounded text-white text-[9px] h-6 outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Repository">Repository</option>
                    <option value="Analysis">Analysis</option>
                    <option value="Results">Results</option>
                    <option value="Configuration">Configuration</option>
                  </select>
                </div>
              </div>

              {/* Tools list */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredTools.map((tool, idx) => (
                  <div key={idx} className="border border-border/60 bg-black/30 p-3 rounded space-y-2 hover:border-primary/40 transition">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-[11px] font-mono">{tool.name}</span>
                        <span className="px-1.5 py-0.5 border border-border bg-black rounded text-[8px] text-text-secondary">
                          {tool.category}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[8px] text-text-secondary font-mono">
                        <Braces className="w-2.5 h-2.5 text-text-secondary" /> schema
                      </span>
                    </div>

                    <p className="text-text-secondary leading-relaxed text-[10px] font-sans">{tool.description}</p>
                    
                    {/* JSON parameter details */}
                    <div className="space-y-1">
                      <span className="text-text-secondary text-[8px] uppercase font-bold tracking-wider">JSON PARAMETERS</span>
                      <pre className="border border-border bg-black/60 p-2 rounded text-white font-mono text-[9px] leading-relaxed overflow-x-auto whitespace-pre">
                        {tool.parameters}
                      </pre>
                    </div>
                  </div>
                ))}

                {filteredTools.length === 0 && (
                  <div className="text-center py-8 text-text-secondary text-[10px]">
                    No MCP tools found matching search filter.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
