'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { useSecurityStore } from '../../../store/useSecurityStore';
import { 
  Network, 
  Search, 
  HelpCircle,
  Activity,
  Layers,
  ArrowRight,
  GitFork
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

// Nodes mapping functions caller-callee bindings
const initialNodes = [
  {
    id: 'n1',
    data: { label: 'Route: POST /api/transaction' },
    position: { x: 50, y: 150 },
    style: { background: '#0F0F0F', color: '#FFF', border: '1px solid #2A2A2A', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', width: 200, padding: '10px' }
  },
  {
    id: 'n2',
    data: { label: 'Middleware: authenticate()' },
    position: { x: 320, y: 150 },
    style: { background: '#0F0F0F', color: '#FFF', border: '1px solid #2A2A2A', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', width: 180, padding: '10px' }
  },
  {
    id: 'n3',
    data: { label: 'Controller: createTransaction()' },
    position: { x: 570, y: 150 },
    style: { background: '#0F0F0F', color: '#FF2020', border: '1px solid #FF2020', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', width: 200, padding: '10px', boxShadow: '0 0 10px rgba(255, 32, 32, 0.15)' }
  },
  {
    id: 'n4',
    data: { label: 'Helper: validateAmount()' },
    position: { x: 840, y: 80 },
    style: { background: '#0F0F0F', color: '#FFF', border: '1px solid #2A2A2A', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', width: 180, padding: '10px' }
  },
  {
    id: 'n5',
    data: { label: 'DB Client: runQuery()' },
    position: { x: 840, y: 220 },
    style: { background: '#0F0F0F', color: '#FF3030', border: '1px solid #FF3030', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', width: 180, padding: '10px', boxShadow: '0 0 8px rgba(255, 48, 48, 0.2)' }
  }
];

const initialEdges = [
  { id: 'en1-2', source: 'n1', target: 'n2', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'en2-3', source: 'n2', target: 'n3', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'en3-4', source: 'n3', target: 'n4', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'en3-5', source: 'n3', target: 'n5', animated: true, style: { stroke: '#FF3030' }, markerEnd: { type: MarkerType.ArrowClosed } }
];

export default function CallGraphPage() {
  const { repositories, selectedRepoId } = useSecurityStore();
  const activeRepo = repositories.find(r => r.id === selectedRepoId);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onNodeClick = (_: any, node: any) => {
    setSelectedNode(node);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    
    // Highlight matched nodes
    const updated = nodes.map(node => {
      const match = node.data.label.toLowerCase().includes(searchVal.toLowerCase());
      return {
        ...node,
        style: {
          ...node.style,
          borderColor: match ? '#FF2020' : '#2A2A2A',
          boxShadow: match ? '0 0 10px rgba(255, 32, 32, 0.4)' : 'none'
        }
      };
    });
    setNodes(updated);
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col font-mono text-xs">
      {/* Top Banner */}
      <div className="border border-border bg-surface p-3 rounded flex justify-between items-center mb-4 select-none shrink-0">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-primary" />
          <div className="space-y-0.5">
            <h2 className="text-white font-sans font-bold text-xs tracking-wider uppercase">FUNCTION CALL HIERARCHY</h2>
            <p className="text-[10px] text-text-secondary">Explore call chains and invocation routes resolved during AST parsing.</p>
            {activeRepo && (
              <p className="text-[10px] text-primary font-bold font-mono mt-0.5">▸ ACTIVE REPO: {activeRepo.name}</p>
            )}
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex bg-black border border-border px-2.5 rounded hover:border-primary/50 transition">
          <Search className="w-3.5 h-3.5 text-text-secondary self-center mr-1" />
          <input 
            type="text" 
            placeholder="Search function names..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-transparent border-0 outline-none text-white text-[10px] h-7 w-48 placeholder:text-[#555]"
          />
        </form>
      </div>

      {/* Main Graph Work Area */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* React Flow Workspace */}
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
              <MiniMap nodeColor={(n) => n.id === 'n3' || n.id === 'n5' ? '#FF2020' : '#444'} />
            </ReactFlow>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-text-secondary">Mounting React Flow workspace...</span>
            </div>
          )}
        </div>

        {/* Node inspector panel */}
        <div className="lg:col-span-3 border border-border bg-surface rounded p-4 flex flex-col justify-between max-h-full overflow-y-auto">
          <div className="space-y-4 text-left">
            <div className="border-b border-border pb-2">
              <h3 className="font-sans font-bold text-white tracking-widest text-[10px] uppercase">
                SYMBOL PROPERTIES
              </h3>
            </div>

            {selectedNode ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-text-secondary text-[9px] uppercase tracking-wider block">IDENTIFIER</span>
                  <div className="text-white font-bold">{selectedNode.data.label}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-text-secondary text-[9px] uppercase tracking-wider block">PROVENANCE</span>
                  <div className="text-white font-mono">{selectedNode.id === 'n3' ? 'src/controllers/transactionController.ts' : 'Resolved Library'}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-text-secondary text-[9px] uppercase tracking-wider block">CALL BOUNDARY</span>
                  <div className="text-white">{selectedNode.id === 'n3' ? 'VULNERABLE (SQL Injection Risk)' : 'Secured'}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-text-secondary flex flex-col items-center gap-2">
                <HelpCircle className="w-8 h-8 text-border" />
                <span>Select any node to view compilation scope settings.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
