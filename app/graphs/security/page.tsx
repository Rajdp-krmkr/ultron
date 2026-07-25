'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { useSecurityStore } from '../../../store/useSecurityStore';
import { 
  Shield, 
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

// Architectural boundary nodes
const initialNodes = [
  {
    id: 's1',
    data: { label: 'External Clients Network' },
    position: { x: 50, y: 150 },
    style: { background: '#050505', color: '#4FC3F7', border: '1px solid #2A2A2A', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', width: 180, padding: '10px' }
  },
  {
    id: 's2',
    data: { label: 'Gateway: Reverse Proxy' },
    position: { x: 280, y: 150 },
    style: { background: '#0F0F0F', color: '#FFF', border: '1px solid #2A2A2A', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', width: 180, padding: '10px' }
  },
  {
    id: 's3',
    data: { label: 'Auth Token Middleware' },
    position: { x: 520, y: 80 },
    style: { background: '#0F0F0F', color: '#00E676', border: '1px solid #00E676', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', width: 180, padding: '10px', boxShadow: '0 0 10px rgba(0, 230, 118, 0.15)' }
  },
  {
    id: 's4',
    data: { label: 'Billing Controller' },
    position: { x: 520, y: 220 },
    style: { background: '#0F0F0F', color: '#FFF', border: '1px solid #2A2A2A', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', width: 180, padding: '10px' }
  },
  {
    id: 's5',
    data: { label: 'Postgres SQL Database' },
    position: { x: 780, y: 150 },
    style: { background: '#0F0F0F', color: '#FF3030', border: '1px solid #FF3030', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', width: 180, padding: '10px', boxShadow: '0 0 8px rgba(255, 48, 48, 0.2)' }
  }
];

const initialEdges = [
  { id: 'es1-2', source: 's1', target: 's2', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'es2-3', source: 's2', target: 's3', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'es2-4', source: 's2', target: 's4', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'es3-5', source: 's3', target: 's5', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'es4-5', source: 's4', target: 's5', animated: true, style: { stroke: '#FF3030' }, markerEnd: { type: MarkerType.ArrowClosed } }
];

export default function SecurityGraphPage() {
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

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col font-mono text-xs">
      {/* Top Banner */}
      <div className="border border-border bg-surface p-3 rounded flex justify-between items-center mb-4 select-none shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <div className="space-y-0.5">
            <h2 className="text-white font-sans font-bold text-xs tracking-wider uppercase">SECURITY TOPOLOGY GRAPH</h2>
            <p className="text-[10px] text-text-secondary">Overview mapping database partitions, security boundaries, and routes controller linkages.</p>
          </div>
        </div>
      </div>

      {/* Main Graph Work Space */}
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
              <MiniMap nodeColor={(n) => n.id === 's3' ? '#00E676' : n.id === 's5' ? '#FF2020' : '#444'} />
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
                BOUNDARY INSPECTOR
              </h3>
            </div>

            {selectedNode ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-text-secondary text-[9px] uppercase tracking-wider block">SEGMENT</span>
                  <div className="text-white font-bold">{selectedNode.data.label}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-text-secondary text-[9px] uppercase tracking-wider block">ISOLATION</span>
                  <div className="text-white font-mono">{selectedNode.id === 's5' ? 'INTERNAL (RESTRICTED ACCESS)' : 'PUBLIC EXPOSED'}</div>
                </div>

                <div className="space-y-1.5 border-t border-border pt-3">
                  <span className="text-text-secondary text-[9px] uppercase tracking-wider block">TELEMETRY DATA</span>
                  <p className="text-text-secondary leading-relaxed text-[11px] font-sans">
                    {selectedNode.id === 's5' 
                      ? 'Warning: Database execution sink vulnerable to unparameterized input from billing controller. Immediate patching recommended.'
                      : 'Gateway reversed proxies active. All requests scanned for malformed parameters.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-text-secondary flex flex-col items-center gap-2">
                <HelpCircle className="w-8 h-8 text-border" />
                <span>Select any node to view architecture boundary settings.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
