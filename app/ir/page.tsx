'use client';

import React, { useState } from 'react';
import { 
  FileJson, 
  ChevronRight, 
  HelpCircle,
  Code,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useSecurityStore } from '../../store/useSecurityStore';

interface IRStatement {
  instruction: string;
  tag: 'IRAssign' | 'IRCall' | 'IRReturn' | 'IRLabel';
  lineProvenance: number;
  register: string;
}

export default function IRExplorer() {
  const { repositories, selectedRepoId } = useSecurityStore();
  const activeRepo = repositories.find(r => r.id === selectedRepoId);
  const [activeFunc, setActiveFunc] = useState('getTransactionDetails');
  const [selectedIR, setSelectedIR] = useState<IRStatement | null>(null);

  const functions = [
    { name: 'getTransactionDetails', path: 'src/controllers/transactionController.ts:L6-L9' },
    { name: 'getTransactions', path: 'src/controllers/transactionController.ts:L3-L5' },
    { name: 'authenticate', path: 'src/routes/api.ts:L14' }
  ];

  const sourceCode = `function getTransactionDetails(transactionId: string) {\n  const query = "SELECT * FROM payments WHERE id = " + transactionId;\n  return db.execute(query);\n}`;

  // Mock compiled IR instructions
  const irStatements: IRStatement[] = [
    { instruction: 'label getTransactionDetails', tag: 'IRLabel', lineProvenance: 6, register: '' },
    { instruction: 't1 = load parameter 0 (transactionId)', tag: 'IRAssign', lineProvenance: 6, register: 't1' },
    { instruction: 't2 = "SELECT * FROM payments WHERE id = "', tag: 'IRAssign', lineProvenance: 7, register: 't2' },
    { instruction: 't3 = concat t2, t1', tag: 'IRAssign', lineProvenance: 7, register: 't3' },
    { instruction: 'query = t3', tag: 'IRAssign', lineProvenance: 7, register: 'query' },
    { instruction: 't4 = load db', tag: 'IRAssign', lineProvenance: 8, register: 't4' },
    { instruction: 't5 = call t4.execute, query', tag: 'IRCall', lineProvenance: 8, register: 't5' },
    { instruction: 'return t5', tag: 'IRReturn', lineProvenance: 8, register: 't5' }
  ];

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col font-mono text-xs">
      {/* Top Banner */}
      <div className="border border-border bg-surface p-3 rounded flex justify-between items-center mb-4 select-none shrink-0">
        <div className="flex items-center gap-2">
          <FileJson className="w-4 h-4 text-primary" />
          <div className="space-y-0.5">
            <h2 className="text-white font-sans font-bold text-xs tracking-wider uppercase">SSA IR INTERMEDIATE REPRESENTATION</h2>
            <p className="text-[10px] text-text-secondary">Inspect compiler Three-Address Codes (3AC) and Static Single Assignment statements.</p>
            {activeRepo && (
              <p className="text-[10px] text-primary font-bold font-mono mt-0.5">▸ ACTIVE REPO: {activeRepo.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main split viewport */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Functions listing */}
        <div className="lg:col-span-3 border border-border bg-surface rounded p-3 text-left space-y-4 overflow-y-auto">
          <span className="font-sans font-bold text-white tracking-widest text-[9px] uppercase block border-b border-border pb-1">COMPILED FUNCTIONS</span>
          <ul className="space-y-1">
            {functions.map((func, idx) => (
              <li key={idx}>
                <button 
                  onClick={() => setActiveFunc(func.name)}
                  className={`w-full text-left px-2 py-2 rounded flex flex-col hover:bg-card/45 transition-colors ${
                    func.name === activeFunc ? 'text-primary bg-card/25' : 'text-text-secondary'
                  }`}
                >
                  <span className="font-bold truncate">{func.name}()</span>
                  <span className="text-[9px] text-text-secondary mt-0.5 truncate">{func.path}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Center: Monaco Editor showing source code */}
        <div className="lg:col-span-5 border border-border bg-surface rounded flex flex-col overflow-hidden relative">
          <div className="h-8 bg-black/45 border-b border-border px-4 flex items-center justify-between select-none shrink-0">
            <span className="text-white text-[10px] font-bold">SOURCE FUNCTION</span>
          </div>

          <div className="flex-1 relative bg-black/25">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              theme="vs-dark"
              value={sourceCode}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 12,
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>

        {/* Right Side: Compiled IR instructions listing */}
        <div className="lg:col-span-4 border border-border bg-surface rounded p-4 flex flex-col justify-between max-h-full overflow-y-auto">
          <div className="space-y-4 text-left">
            <div className="border-b border-border pb-2">
              <h3 className="font-sans font-bold text-white tracking-widest text-[10px] uppercase">
                SSA 3AC INSTRUCTIONS
              </h3>
            </div>

            {/* Instruction list */}
            <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
              {irStatements.map((ir, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedIR(ir)}
                  className={`p-2 border rounded font-mono text-[10px] cursor-pointer transition ${
                    selectedIR?.instruction === ir.instruction 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border bg-black/20 text-white hover:border-border/80'
                  }`}
                >
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      ir.tag === 'IRCall' ? 'bg-[#FF3030]/20 text-[#FF3030]' :
                      ir.tag === 'IRReturn' ? 'bg-[#00E676]/20 text-[#00E676]' :
                      'bg-card text-text-secondary'
                    }`}>
                      {ir.tag}
                    </span>
                    <span className="text-text-secondary text-[8px]">Line {ir.lineProvenance}</span>
                  </div>
                  <div className="font-bold pt-1">{ir.instruction}</div>
                </div>
              ))}
            </div>

            {/* IR Details */}
            {selectedIR ? (
              <div className="border border-border bg-black/30 p-3 rounded space-y-2">
                <span className="text-text-secondary font-bold text-[9px] uppercase tracking-wider block border-b border-border/50 pb-1">INSTRUCTION DESCRIPTIONS</span>
                <div className="space-y-1">
                  <div>Register: <span className="text-primary font-bold">{selectedIR.register || 'none'}</span></div>
                  <div>Provenance: <span className="text-white">Expression mapping line {selectedIR.lineProvenance}</span></div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-text-secondary flex items-center gap-1 bg-black/10 p-3 rounded">
                <Info className="w-4 h-4 text-border" />
                <span>Select an instruction block to inspect registers and tags.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
