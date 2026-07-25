'use client';

import React, { useState } from 'react';
import { useSecurityStore, Rule } from '../../store/useSecurityStore';
import { 
  Fingerprint, 
  Plus, 
  Trash2, 
  Save, 
  Search,
  Code,
  CheckCircle,
  HelpCircle,
  FileCode
} from 'lucide-react';
import Editor from '@monaco-editor/react';

export default function RuleEngine() {
  const { rules, updateRuleStatus, addTerminalLog } = useSecurityStore();
  const [activeRuleId, setActiveRuleId] = useState('SEC-SQL-01');
  const [selectedRule, setSelectedRule] = useState<Rule | null>(rules[0]);
  const [yamlContent, setYamlContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    const active = rules.find(r => r.id === activeRuleId);
    if (active) {
      setSelectedRule(active);
      setYamlContent(
`id: ${active.id}
name: ${active.name}
severity: ${active.severity}
confidence: ${active.confidence}
status: ${active.status}
pattern: ${active.pattern}
description: ${active.description}
recommendation: |-
  ${active.recommendation.split('\n').join('\n  ')}`
      );
    }
  }, [activeRuleId, rules]);

  const handleStatusToggle = (id: string, currentStatus: Rule['status']) => {
    const nextStatus: Rule['status'] = currentStatus === 'Enabled' ? 'Disabled' : 'Enabled';
    updateRuleStatus(id, nextStatus);
    addTerminalLog(`Rule ${id} status set to: ${nextStatus}`, 'info');
  };

  const handleSaveRule = () => {
    setIsSaved(true);
    addTerminalLog(`Successfully saved customized rules definition for: ${activeRuleId}`, 'success');
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="min-h-[480px] flex flex-col font-mono text-xs space-y-4">
      {/* Top Banner */}
      <div className="border border-border bg-surface p-3 rounded flex justify-between items-center mb-4 select-none shrink-0">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-primary" />
          <div className="space-y-0.5">
            <h2 className="text-white font-sans font-bold text-xs tracking-wider uppercase">STATIC ANALYSES RULE CONFIGURATIONS</h2>
            <p className="text-[10px] text-text-secondary">Deploy custom AST matching pattern schemas and regex filters.</p>
          </div>
        </div>
      </div>

      {/* Split views */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Rules Index Table */}
        <div className="lg:col-span-6 border border-border bg-surface rounded flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border bg-black/45 flex justify-between items-center select-none shrink-0">
            <span className="text-white text-[10px] font-bold">VULNERABILITY ALGORITHMIC SIGNATURES</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-black/10 text-[9px] text-text-secondary uppercase">
                  <th className="p-2.5">Rule ID</th>
                  <th className="p-2.5">Severity</th>
                  <th className="p-2.5">Matches</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rules.map((rule) => (
                  <tr 
                    key={rule.id}
                    onClick={() => setActiveRuleId(rule.id)}
                    className={`hover:bg-card/20 transition cursor-pointer ${
                      rule.id === activeRuleId ? 'bg-card/15' : ''
                    }`}
                  >
                    <td className="p-2.5 font-bold text-white">{rule.id}</td>
                    <td className="p-2.5">
                      <span className={`px-1.5 py-0.5 border rounded text-[8px] ${
                        rule.severity === 'Critical' ? 'text-critical border-critical/30 bg-critical/5' :
                        rule.severity === 'High' ? 'text-medium border-medium/30 bg-medium/5' : 'text-low border-low/30 bg-low/5'
                      }`}>
                        {rule.severity}
                      </span>
                    </td>
                    <td className="p-2.5 text-text-secondary font-mono truncate max-w-[120px]">{rule.pattern}</td>
                    <td className="p-2.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleStatusToggle(rule.id, rule.status)}
                        className={`px-2 py-0.5 rounded border text-[9px] transition ${
                          rule.status === 'Enabled' 
                            ? 'border-success/30 text-success bg-success/5 hover:border-success/60' 
                            : 'border-border text-text-secondary bg-black/20 hover:border-border/80'
                        }`}
                      >
                        {rule.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Monaco Rule Editor */}
        <div className="lg:col-span-6 border border-border bg-surface rounded flex flex-col overflow-hidden relative">
          <div className="h-8 bg-black/45 border-b border-border px-4 flex items-center justify-between select-none shrink-0">
            <div className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-primary" />
              <span className="text-white text-[10px] font-bold">SCHEMA YAML EDITOR: {activeRuleId}</span>
            </div>
            <button 
              onClick={handleSaveRule}
              className="inline-flex items-center gap-1 px-2.5 py-1 border border-border bg-black hover:border-primary text-[10px] text-white rounded transition active:scale-95"
            >
              <Save className="w-3 h-3 text-primary" />
              {isSaved ? 'SAVED' : 'SAVE'}
            </button>
          </div>

          {/* YAML editor panel */}
          <div className="flex-1 relative bg-black/25">
            <Editor
              height="100%"
              defaultLanguage="yaml"
              theme="vs-dark"
              value={yamlContent}
              onChange={(val) => setYamlContent(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
