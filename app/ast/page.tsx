'use client';

import React, { useState } from 'react';
import { 
  Code2, 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FileCode,
  FileJson,
  Info
} from 'lucide-react';
import Editor from '@monaco-editor/react';

// AST Node interface
interface ASTNode {
  name: string;
  type: string;
  range: [number, number]; // [startLine, endLine]
  children?: ASTNode[];
}

export default function ASTExplorer() {
  const [activeFile, setActiveFile] = useState('server.ts');
  const [selectedASTNode, setSelectedASTNode] = useState<ASTNode | null>(null);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'Program': true,
    'FunctionDeclaration': true
  });

  const files = [
    { name: 'server.ts', icon: FileCode },
    { name: 'db.ts', icon: FileCode },
    { name: 'auth.ts', icon: FileCode },
    { name: 'package.json', icon: FileJson }
  ];

  const codeSnippet = `import express from "express";\nimport { db } from "./db";\n\nconst app = express();\n\nfunction getTransactionDetails(transactionId: string) {\n  const query = "SELECT * FROM payments WHERE id = " + transactionId;\n  return db.execute(query);\n}\n\napp.get("/api/payment/:id", (req, res) => {\n  const result = getTransactionDetails(req.params.id);\n  res.json(result);\n});`;

  // Mock parsed AST Tree structure
  const astTree: ASTNode = {
    name: 'Program',
    type: 'Program',
    range: [1, 14],
    children: [
      {
        name: 'ImportDeclaration ("express")',
        type: 'ImportDeclaration',
        range: [1, 1]
      },
      {
        name: 'ImportDeclaration ("./db")',
        type: 'ImportDeclaration',
        range: [2, 2]
      },
      {
        name: 'VariableDeclaration (app)',
        type: 'VariableDeclaration',
        range: [4, 4]
      },
      {
        name: 'FunctionDeclaration (getTransactionDetails)',
        type: 'FunctionDeclaration',
        range: [6, 9],
        children: [
          {
            name: 'VariableDeclaration (query)',
            type: 'VariableDeclaration',
            range: [7, 7]
          },
          {
            name: 'ReturnStatement (db.execute)',
            type: 'ReturnStatement',
            range: [8, 8]
          }
        ]
      },
      {
        name: 'ExpressionStatement (app.get)',
        type: 'ExpressionStatement',
        range: [11, 14]
      }
    ]
  };

  const toggleExpand = (nodeName: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeName]: !prev[nodeName]
    }));
  };

  const renderASTNode = (node: ASTNode) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.name];
    const isSelected = selectedASTNode?.name === node.name;

    return (
      <div key={node.name} className="pl-3 font-mono text-[10px]">
        <div 
          onClick={() => {
            setSelectedASTNode(node);
            if (hasChildren) toggleExpand(node.name);
          }}
          className={`flex items-center gap-1 py-1 px-1.5 cursor-pointer rounded hover:bg-card/40 transition-colors ${
            isSelected ? 'bg-card text-primary border-l-2 border-primary' : 'text-text-secondary hover:text-white'
          }`}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <span className="w-3.5" />
          )}
          <span className="font-bold text-white shrink-0">[{node.type}]</span>
          <span className="truncate max-w-[150px]">{node.name}</span>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-border/50 ml-2.5 pl-1.5 space-y-0.5">
            {node.children!.map(child => renderASTNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col font-mono text-xs">
      {/* Top Banner */}
      <div className="border border-border bg-surface p-3 rounded flex justify-between items-center mb-4 select-none shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          <div className="space-y-0.5">
            <h2 className="text-white font-sans font-bold text-xs tracking-wider uppercase">COMPILER AST EXPLORER</h2>
            <p className="text-[10px] text-text-secondary">Inspect abstract syntax trees generated during source file parses.</p>
          </div>
        </div>
      </div>

      {/* Main split dashboard view */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Files list panel */}
        <div className="lg:col-span-2 border border-border bg-surface rounded p-3 text-left space-y-4">
          <span className="font-sans font-bold text-white tracking-widest text-[9px] uppercase block border-b border-border pb-1">FILES INDEX</span>
          <ul className="space-y-1">
            {files.map((file, idx) => {
              const FileIcon = file.icon;
              return (
                <li key={idx}>
                  <button 
                    onClick={() => setActiveFile(file.name)}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 hover:bg-card/40 transition-colors ${
                      file.name === activeFile ? 'text-primary bg-card/25' : 'text-text-secondary'
                    }`}
                  >
                    <FileIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Center: Monaco Editor showing source code */}
        <div className="lg:col-span-6 border border-border bg-surface rounded flex flex-col overflow-hidden relative">
          <div className="h-8 bg-black/45 border-b border-border px-4 flex items-center justify-between select-none shrink-0">
            <span className="text-white text-[10px] font-bold">{activeFile}</span>
            <span className="text-text-secondary text-[9px]">SOURCE CODE</span>
          </div>

          <div className="flex-1 relative bg-black/25">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              theme="vs-dark"
              value={codeSnippet}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 12,
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
              }}
              loading={
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F0F0F] gap-2 text-text-secondary">
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span>Loading source content...</span>
                </div>
              }
            />
          </div>
        </div>

        {/* Right Side: AST representation JSON tree */}
        <div className="lg:col-span-4 border border-border bg-surface rounded p-4 flex flex-col justify-between max-h-full overflow-y-auto">
          <div className="space-y-4 text-left">
            <div className="border-b border-border pb-2">
              <h3 className="font-sans font-bold text-white tracking-widest text-[10px] uppercase">
                AST SCHEMA TREE
              </h3>
            </div>

            {/* Nested Nodes */}
            <div className="border border-border/40 bg-black/20 p-2.5 rounded max-h-[280px] overflow-y-auto">
              {renderASTNode(astTree)}
            </div>

            {/* AST Node details */}
            {selectedASTNode ? (
              <div className="border border-border bg-black/30 p-3 rounded space-y-2">
                <span className="text-text-secondary font-bold text-[9px] uppercase tracking-wider block border-b border-border/50 pb-1">NODE METADATA</span>
                <div className="space-y-1">
                  <div>Type: <span className="text-primary font-bold">{selectedASTNode.type}</span></div>
                  <div>Line Range: <span className="text-white">Lines {selectedASTNode.range[0]} - {selectedASTNode.range[1]}</span></div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-text-secondary flex items-center gap-1 bg-black/10 p-3 rounded">
                <Info className="w-4 h-4 text-border" />
                <span>Select AST node to view parsing schema metadata.</span>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-3 mt-4 text-[9px] text-text-secondary">
            Generated via Ultron Compiler v1.2.
          </div>
        </div>
      </div>
    </div>
  );
}
