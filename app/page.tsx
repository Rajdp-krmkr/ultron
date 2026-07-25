'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Terminal, 
  Workflow, 
  Cpu, 
  Network, 
  Code2, 
  ChevronRight, 
  ArrowRight,
  GitBranch,
  Layers,
  Lock,
  Binary
} from 'lucide-react';

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];
    const particleCount = Math.min(80, Math.floor((width * height) / 20000));

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1,
      });
    }

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle background cyber-grid
      ctx.strokeStyle = 'rgba(42, 42, 42, 0.15)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update & Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Boundary bounce
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Attract slightly to mouse
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.x += dx * 0.005;
          p.y += dy * 0.005;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 32, 32, 0.7)';
        ctx.fill();
      });

      // Connect particles with lines
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pi = particles[i];
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.25;
            ctx.strokeStyle = `rgba(255, 32, 32, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const features = [
    { icon: Code2, title: 'AST Parsing', desc: 'Parses codebases into concrete AST formats mapping symbols across packages.' },
    { icon: Layers, title: 'IR Pipeline', desc: 'Converts source structures to Single Static Assignment (SSA) Intermediate Representation.' },
    { icon: Network, title: 'Call Graph', desc: 'Maps cross-module dependencies and intra-function invocation hierarchies.' },
    { icon: Workflow, title: 'Taint Analysis', desc: 'Traces untrusted user payloads backwards from unsafe database or shell sinks.' },
    { icon: ShieldAlert, title: 'Security Graph', desc: 'Constructs topological model of API routers, middlewares, and backend persistence layer.' },
    { icon: Binary, title: 'Rule Engine', desc: 'Executes semantic queries and AST signature patterns to trap known vulnerability classes.' },
    { icon: Cpu, title: 'LLM Verification', desc: 'Leverages localized AI agents to filter scanner noise and confirm zero false-positives.' },
    { icon: Terminal, title: 'REST API', desc: 'Interactive API sandbox designed for SOC automation scripting and triggers.' },
    { icon: Lock, title: 'MCP Server', desc: 'Seamlessly exposes codebase scanning tools directly to Claude Desktop and Cursor.' }
  ];

  return (
    <div className="relative min-h-screen bg-[#050505] flex flex-col items-center justify-between text-white overflow-hidden scanline">
      {/* Background Interactive canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Grid background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black z-0 pointer-events-none" />

      {/* Top Header details */}
      <header className="w-full max-w-7xl px-8 h-20 flex items-center justify-between z-10 border-b border-border bg-[#050505]/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-primary flex items-center justify-center bg-black/50 shadow-[0_0_8px_rgba(255,32,32,0.4)]">
            <span className="text-primary font-bold text-sm tracking-tighter">U</span>
          </div>
          <span className="font-sans font-bold tracking-widest text-white text-base neon-text-red">ULTRON</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-text-secondary">
          <span className="hidden sm:inline border border-border px-2 py-0.5 rounded bg-black/30">MCP_SERVER: ONLINE</span>
          <span className="hidden sm:inline border border-border px-2 py-0.5 rounded bg-black/30">VERSION: 2.1.0</span>
        </div>
      </header>

      {/* Main hero space */}
      <main className="w-full max-w-7xl px-8 flex-1 flex flex-col justify-center py-20 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 bg-primary/5 rounded font-mono text-[10px] text-primary tracking-widest uppercase">
              <ShieldAlert className="w-3.5 h-3.5" />
              CYBERSECURITY MULTI-AGENT STATIC SCANNER
            </div>

            {/* Title */}
            <h1 className="font-sans font-bold text-4xl sm:text-6xl tracking-tight text-white leading-tight">
              ULTRON <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-500 neon-text-red">
                Security Analysis Engine
              </span>
            </h1>

            {/* ASCII graphics decoration */}
            <div className="hidden sm:block font-mono text-[9px] text-[#333] leading-none select-none">
              {`+-------------------------------------------------------------------------+
| [AST] => [SSA_IR] => [CALL_GRAPH] => [TAINT_FLOW] => [RULES] => [LLM_AGENT]  |
+-------------------------------------------------------------------------+`}
            </div>

            <p className="text-text-secondary text-sm sm:text-base font-mono leading-relaxed max-w-xl">
              Ultron compiles your code, generates intermediate representations, conducts full taint-flow mapping, and leverages autonomous AI agents to audit finding authenticity.
            </p>

            {/* Button clusters */}
            <div className="flex flex-wrap gap-4 pt-4 font-mono">
              <Link 
                href="/analyze" 
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs px-5 py-3 rounded border border-transparent shadow-[0_0_15px_rgba(255,32,32,0.4)] transition-all duration-150 active:scale-95"
              >
                ANALYZE REPOSITORY <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 border border-border bg-black/60 hover:bg-card text-white text-xs px-5 py-3 rounded hover:border-primary/50 transition-all duration-150"
              >
                ENTER SOC DASHBOARD <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </Link>
            </div>
          </div>

          {/* Right ASCII graphics interface mockup */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="border border-border bg-surface p-5 rounded font-mono text-[10px] text-text-secondary shadow-[0_0_20px_rgba(0,0,0,0.8)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 bg-primary/10 border-l border-b border-primary/20 text-primary text-[9px]">
                LIVE_FEED
              </div>
              <div className="flex gap-1.5 border-b border-border pb-3 mb-3 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-critical" />
                <span className="w-2.5 h-2.5 rounded-full bg-medium" />
                <span className="w-2.5 h-2.5 rounded-full bg-success" />
                <span className="ml-2 text-[9px] uppercase tracking-wider text-text-secondary">ULTRON_DAEMON_SYS_MONITOR</span>
              </div>
              <div className="space-y-1.5 text-left leading-relaxed">
                <div><span className="text-primary font-bold">[!]</span> Initializing analyzer pipeline...</div>
                <div><span className="text-white">[i]</span> Mapping package boundaries: TypeScript v5.1</div>
                <div><span className="text-white">[i]</span> Nodes generated: 8,421 declarations parsed</div>
                <div><span className="text-white">[i]</span> Generating control flow graphs... DONE</div>
                <div><span className="text-white">[i]</span> Running 24 taint queries on database sources</div>
                <div className="text-critical font-bold">[CRITICAL] Taint path discovered in authController.ts</div>
                <div className="text-low font-bold"> - SOURCE: req.body.token (line 22)</div>
                <div className="text-low font-bold"> - SINK: process.execSync() (line 54)</div>
                <div><span className="text-success font-bold">[+]</span> Spawning LLM Agent for verification checks...</div>
                <div className="text-success animate-pulse"> - Agent verdict: VULNERABILITY CONFIRMED (98% confidence)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature showcase grid */}
        <section className="py-24 border-t border-border mt-20">
          <div className="text-center space-y-3 mb-16">
            <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight text-white">
              Advanced Security Engineering Capabilities
            </h2>
            <p className="text-text-secondary font-mono text-xs max-w-lg mx-auto">
              Ultron is built with premium compilation-level analyzers that outperform standard pattern scanners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-left">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={index}
                  className="border border-border bg-surface p-6 rounded hover:border-primary/40 hover:shadow-[0_0_15px_rgba(255,32,32,0.1)] transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded border border-border bg-black flex items-center justify-center mb-4 group-hover:border-primary/40 transition">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2 group-hover:text-primary transition">{feat.title}</h3>
                  <p className="text-text-secondary text-xs leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer details */}
      <footer className="w-full border-t border-border py-6 px-8 z-10 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-text-secondary">
          <span>&copy; 2026 ULTRON INC. PLATFORM SECURED.</span>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-white transition">MCP SPEC</a>
            <a href="#" className="hover:text-white transition">REST ENDPOINTS</a>
            <a href="#" className="hover:text-white transition">TERMS</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
