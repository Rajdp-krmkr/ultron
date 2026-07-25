'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { useSecurityStore } from '../../../store/useSecurityStore';
import { 
  Workflow, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Info,
  HelpCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

// Initial Nodes structure mapping parameter traversal
const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Source: req.query.searchTerm' },
    position: { x: 50, y: 150 },
    style: { background: '#0F0F0F', color: '#4FC3F7', border: '1px solid #4FC3F7', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', width: 180, padding: '10px', boxShadow: '0 0 10px rgba(79, 195, 247, 0.15)' }
  },
  {
    id: '2',
    data: { label: 'Sanitizer: filterSearchParameters()' },
    position: { x: 300, y: 150 },
    style: { background: '#0F0F0F', color: '#FFA726', border: '1px solid #FFA726', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', width: 200, padding: '10px' }
  },
  {
    id: '3',
    data: { label: 'Validator: validateInputFormat()' },
    position: { x: 580, y: 80 },
    style: { background: '#0F0F0F', color: '#00E676', border: '1px solid #00E676', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', width: 180, padding: '10px', boxShadow: '0 0 10px rgba(0, 230, 118, 0.15)' }
  },
  {
    id: '4',
    data: { label: 'String Concat: SQL Expression' },
    position: { x: 580, y: 220 },
    style: { background: '#0F0F0F', color: '#FF3030', border: '1px solid #FF3030', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', width: 180, padding: '10px' }
  },
  {
    id: '5',
    type: 'output',
    data: { label: 'Sink: db.query()' },
    position: { x: 840, y: 150 },
    style: { background: '#0F0F0F', color: '#FF2020', border: '1px solid #FF2020', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', width: 160, padding: '10px', fontWeight: 'bold', boxShadow: '0 0 10px rgba(255, 32, 32, 0.25)' }
  }
];

// Connection edges
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, stroke: '#4FC3F7', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2-3', source: '2', target: '3', label: 'valid', labelStyle: { fill: '#888', fontSize: '8px', fontFamily: 'monospace' }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2-4', source: '2', target: '4', label: 'bypass', animated: true, style: { stroke: '#FF3030' }, labelStyle: { fill: '#FF3030', fontSize: '8px', fontFamily: 'monospace' }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-5', source: '3', target: '5', label: 'clean flow', style: { stroke: '#00E676' }, labelStyle: { fill: '#00E676', fontSize: '8px', fontFamily: 'monospace' }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e4-5', source: '4', target: '5', label: 'tainted data', animated: true, style: { stroke: '#FF2020' }, labelStyle: { fill: '#FF2020', fontSize: '8px', fontFamily: 'monospace' }, markerEnd: { type: MarkerType.ArrowClosed } }
];

export default function TaintGraphPage() {
  const { findings, repositories, selectedRepoId } = useSecurityStore();
  const activeRepo = repositories.find(r => r.id === selectedRepoId);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onNodeClick = (_: any, node: any) => {
    setSelectedNode(node);
  };

  const getExplanation = (nodeId: string) => {
    switch (nodeId) {
      case '1': return 'Parameter source where user input enters the execution boundary. Subject to arbitrary query scripting if unescaped.';
      case '2': return 'Operation that transforms parameter strings. It checks parameters, but lacks escaping filters for SQL entities.';
      case '3': return 'Ideal sanitized path validating format parameters against integer rules. Prevents execution injection.';
      case '4': return 'Concatenation node linking parameters with target query patterns: SELECT * FROM transactions WHERE desc = + searchTerm.';
      case '5': return 'Vulnerable database engine sink. Executes dynamic concatenated query commands causing data exposure.';
      default: return 'No node information available. Click a node to load its metadata.';
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col font-mono text-xs">
      {/* Top Banner */}
      <div className="border border-border bg-surface p-3 rounded flex justify-between items-center mb-4 select-none shrink-0">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-primary" />
          <div className="space-y-0.5">
            <h2 className="text-white font-sans font-bold text-xs tracking-wider uppercase">DYNAMIC TAINT FLOW PLOTTER</h2>
            <p className="text-[10px] text-text-secondary">Interactive map of parameters propagation and boundary sanitizations.</p>
            {activeRepo && (
              <p className="text-[10px] text-primary font-bold font-mono mt-0.5">▸ ACTIVE REPO: {activeRepo.name}</p>
            )}
          </div>
        </div>

        {/* Graph Legend */}
        <div className="flex gap-4 items-center text-[9px] bg-black/40 border border-border px-3 py-1.5 rounded">
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded bg-low" /> SOURCE</div>
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded bg-medium" /> OPERATIONS</div>
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded bg-success" /> VALIDATION</div>
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded bg-critical" /> SINK</div>
        </div>
      </div>

      {/* Main Graph area */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: React Flow Workspace */}
        <div className="lg:col-span-9 border border-border bg-surface rounded overflow-hidden relative min-h-[300px]">
          {isMounted ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              fitView
              className="bg-[#050505]"
            >
              <Controls />
              <Background color="#222" gap={16} />
              <MiniMap nodeColor={(n) => {
                if (n.type === 'input') return '#4FC3F7';
                if (n.type === 'output') return '#FF2020';
                return '#333';
              }} />
            </ReactFlow>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-text-secondary">Mounting React Flow workspace...</span>
            </div>
          )}
        </div>

        {/* Right Side: Graph Node inspector details */}
        <div className="lg:col-span-3 border border-border bg-surface rounded p-4 flex flex-col justify-between max-h-full overflow-y-auto">
          <div className="space-y-4 text-left">
            <div className="border-b border-border pb-2">
              <h3 className="font-sans font-bold text-white tracking-widest text-[10px] uppercase">
                NODE METADATA INSPECTOR
              </h3>
            </div>

            {selectedNode ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-text-secondary text-[9px] uppercase tracking-wider block">NAME</span>
                  <div className="text-white font-bold">{selectedNode.data.label}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-text-secondary text-[9px] uppercase tracking-wider block">NODE ID</span>
                  <div className="text-white font-mono">{selectedNode.id}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-text-secondary text-[9px] uppercase tracking-wider block">TYPE</span>
                  <div className="text-white font-bold">{selectedNode.type === 'input' ? 'Source Node' : selectedNode.type === 'output' ? 'Execution Sink' : 'Internal Operation'}</div>
                </div>

                <div className="space-y-1.5 border-t border-border pt-3">
                  <span className="text-text-secondary text-[9px] uppercase tracking-wider block">SECURITY EXPLANATION</span>
                  <p className="text-text-secondary leading-relaxed text-[11px] font-sans">
                    {getExplanation(selectedNode.id)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-text-secondary flex flex-col items-center gap-2">
                <HelpCircle className="w-8 h-8 text-border" />
                <span>Click any node in the graph workspace to audit parameter trace steps.</span>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-3 mt-4 text-[9px] text-text-secondary">
            Click drag nodes to adjust layouts. Mouse scroll to zoom.
          </div>
        </div>
      </div>
    </div>
  );
}
