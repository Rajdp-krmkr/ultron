'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { 
  Terminal as TermIcon, 
  Play, 
  Send, 
  HelpCircle,
  Copy,
  Info,
  CheckCircle2
} from 'lucide-react';

interface Endpoint {
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  description: string;
  defaultPayload?: string;
  mockResponse: any;
}

export default function ApiExplorer() {
  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'POST'>('POST');
  const [activeEndpointIndex, setActiveEndpointIndex] = useState(0);
  const [payload, setPayload] = useState('{\n  "repo_url": "github.com/ultron-sec/app"\n}');
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpoints: Endpoint[] = [
    {
      method: 'POST',
      path: '/api/v1/analyze',
      description: 'Triggers compile, AST, Taint Graph, and LLM verification tasks on target repository remote URL.',
      defaultPayload: '{\n  "repo_url": "github.com/ultron-sec/app"\n}',
      mockResponse: {
        status: 'queued',
        job_id: 'job_b8fa19e3c501',
        repository: 'app',
        stages_count: 10,
        initiated_timestamp: '2026-07-25T13:21:40Z'
      }
    },
    {
      method: 'GET',
      path: '/api/v1/findings',
      description: 'Retrieve indexed findings records matching active query parameter filters.',
      mockResponse: {
        total_findings: 3,
        findings: [
          { id: 'f-101', title: 'SQL Injection in transaction search', severity: 'Critical', verified: true },
          { id: 'f-102', title: 'Stored XSS in profile remarks', severity: 'High', verified: true }
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/v1/rules',
      description: 'Retrieve active algorithmic security rule configurations.',
      mockResponse: {
        rules_enabled: 5,
        signatures: ['SEC-SQL-01', 'SEC-XSS-02', 'SEC-AUTH-09', 'SEC-CSRF-05', 'SEC-LFI-12']
      }
    }
  ];

  const handleSendRequest = () => {
    setLoading(true);
    setResponseOutput(null);
    setTimeout(() => {
      setLoading(false);
      setResponseOutput(endpoints[activeEndpointIndex].mockResponse);
    }, 1200);
  };

  const handleSelectEndpoint = (index: number) => {
    setActiveEndpointIndex(index);
    const end = endpoints[index];
    if (end.defaultPayload) {
      setPayload(end.defaultPayload);
    } else {
      setPayload('');
    }
    setResponseOutput(null);
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(responseOutput, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-5xl mx-auto">
      {/* Banner */}
      <div className="border border-border bg-surface p-4 rounded text-left">
        <h2 className="text-sm font-sans font-bold text-white tracking-widest uppercase mb-1">INTERACTIVE REST API EXPLORER</h2>
        <p className="text-text-secondary text-[10px]">Test engine endpoints directly from our Swagger-integrated developer sandbox.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Endpoint links list */}
        <div className="md:col-span-4 border border-border bg-surface rounded p-3 text-left space-y-4">
          <span className="font-sans font-bold text-white tracking-widest text-[9px] uppercase block border-b border-border pb-1">AVAILABLE ENDPOINTS</span>
          <ul className="space-y-2">
            {endpoints.map((end, idx) => (
              <li key={idx}>
                <button
                  onClick={() => handleSelectEndpoint(idx)}
                  className={`w-full text-left p-2.5 rounded border transition flex flex-col gap-1.5 hover:bg-card/30 ${
                    idx === activeEndpointIndex ? 'border-primary bg-primary/5 text-white' : 'border-border bg-black/20 text-text-secondary'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] ${
                      end.method === 'POST' ? 'bg-[#FFA726]/10 text-[#FFA726]' : 'bg-[#4FC3F7]/10 text-[#4FC3F7]'
                    }`}>
                      {end.method}
                    </span>
                    <span className="text-[10px] text-white font-mono">{end.path}</span>
                  </div>
                  <span className="text-[9px] text-text-secondary leading-relaxed">{end.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side: Playground request form and response */}
        <div className="md:col-span-8 space-y-4 text-left">
          <div className="border border-border bg-surface p-5 rounded space-y-5">
            {/* Headers details */}
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-sans font-bold text-white tracking-widest text-[10px] uppercase">REQUEST PLAYGROUND</span>
              <button
                onClick={handleSendRequest}
                disabled={loading}
                className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-3 py-2 rounded flex items-center gap-1.5 transition active:scale-95 border border-transparent shadow-[0_0_10px_rgba(255,32,32,0.2)]"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'SENDING...' : 'SEND REQUEST'}
              </button>
            </div>

            {/* Request path info read-only */}
            <div className="flex items-center gap-2 border border-border bg-black/40 px-3 py-2 rounded">
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                endpoints[activeEndpointIndex].method === 'POST' ? 'bg-[#FFA726]/10 text-[#FFA726]' : 'bg-[#4FC3F7]/10 text-[#4FC3F7]'
              }`}>
                {endpoints[activeEndpointIndex].method}
              </span>
              <span className="text-white font-mono select-all">http://localhost:8000{endpoints[activeEndpointIndex].path}</span>
            </div>

            {/* Payload body text area */}
            {endpoints[activeEndpointIndex].method === 'POST' && (
              <div className="space-y-1.5">
                <label className="text-text-secondary">BODY PAYLOAD (JSON)</label>
                <textarea 
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  rows={4}
                  className="w-full bg-black border border-border rounded p-3 text-white font-mono text-xs focus:border-primary/50 outline-none placeholder:text-[#444] resize-none"
                />
              </div>
            )}

            {/* Loading / Response Output */}
            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">RESPONSE JSON</span>
                {responseOutput && (
                  <button 
                    onClick={copyResponse}
                    className="text-[10px] text-primary hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? 'COPIED!' : 'COPY'}
                  </button>
                )}
              </div>

              {loading ? (
                <div className="border border-border bg-black/50 p-8 rounded flex flex-col items-center justify-center gap-2 text-text-secondary">
                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span>Fetching remote endpoint...</span>
                </div>
              ) : responseOutput ? (
                <pre className="border border-border bg-black/60 p-4 rounded text-[#A6E22E] font-mono leading-relaxed overflow-x-auto text-[10px] max-h-56">
                  {JSON.stringify(responseOutput, null, 2)}
                </pre>
              ) : (
                <div className="border border-border bg-black/20 p-8 rounded text-center text-text-secondary flex items-center justify-center gap-1.5">
                  <Info className="w-4 h-4 text-border" />
                  <span>Click Send Request to run query and fetch JSON responses.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
