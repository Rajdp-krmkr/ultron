'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  ShieldAlert, 
  Terminal, 
  Workflow, 
  Cpu, 
  Network, 
  Code2, 
  ArrowRight,
  Layers,
  Lock,
  Binary,
  User,
  LogOut,
  Globe,
  Laptop,
  Server,
  TerminalSquare,
  CheckCircle2,
  ExternalLink,
  Wrench,
  Sparkles,
  GitPullRequest
} from 'lucide-react';

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { data: session } = useSession();

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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  const cliCommands = [
    { cmd: 'ultron <url>', desc: 'Clone a repository and run full security analysis' },
    { cmd: 'ultron scan <name-or-path> [--fix]', desc: 'Run analysis on existing repo or local folder (pass --fix to invoke LLM Auto-Fixer)' },
    { cmd: 'ultron install-hook [dir]', desc: 'Install built-in Git pre-commit security hook into .git/hooks/pre-commit' },
    { cmd: 'ultron list', desc: 'List all cloned repositories' },
    { cmd: 'ultron delete <name>', desc: 'Delete a cloned repository and workspace' },
    { cmd: 'ultron visualise <name>', desc: 'Build & open dependency/taint/security SVGs' },
    { cmd: 'ultron config', desc: 'Show current engine configuration' }
  ];

  const mcpToolsList = [
    { tool: 'ultron_list_repos', category: 'Repository', desc: 'List all cloned repositories with analysis status' },
    { tool: 'ultron_clone_repo', category: 'Repository', desc: 'Clone a Git repo and run full security analysis' },
    { tool: 'ultron_scan_repo', category: 'Repository', desc: 'Re-run full analysis on an existing clone' },
    { tool: 'ultron_run_ast_parse', category: 'Analysis', desc: 'Parse all source files into an AST using tree-sitter' },
    { tool: 'ultron_run_rules', category: 'Analysis', desc: 'Run deterministic rules (SQLi, path traversal, SSRF, etc.)' },
    { tool: 'ultron_run_llm_detection', category: 'Analysis', desc: 'Run LLM-powered vulnerability detection agent' },
    { tool: 'ultron_get_findings', category: 'Results', desc: 'Get cached security findings from a previous scan' },
    { tool: 'ultron_get_security_graph', category: 'Results', desc: 'Get full cached security graph (flows, subgraphs, summary)' },
    { tool: 'ultron_get_config', category: 'Configuration', desc: 'Show full configuration (ultron_config.json)' }
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex flex-col items-center text-white scrollbar-thin scanline">
      {/* Background Interactive canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

      {/* Grid background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black z-0 pointer-events-none" />

      {/* Top Header details */}
      <header className="w-full max-w-7xl px-8 h-20 flex items-center justify-between z-10 border-b border-border bg-[#050505]/40 backdrop-blur-sm sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-primary flex items-center justify-center bg-black/50 shadow-[0_0_8px_rgba(255,32,32,0.4)]">
            <span className="text-primary font-bold text-sm tracking-tighter">U</span>
          </div>
          <span className="font-sans font-bold tracking-widest text-white text-base neon-text-red">ULTRON</span>
        </div>

        {/* Top Navbar Auth State display */}
        {session?.user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-border bg-black/60 px-3 py-1.5 rounded text-xs font-mono text-white">
              <User className="w-3.5 h-3.5 text-primary" />
              <span className="font-bold">{session.user.name || session.user.email}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-1 border border-border bg-black/60 hover:border-primary px-3 py-1.5 rounded text-xs font-mono text-critical hover:text-white transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SIGN OUT</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-xs font-mono text-text-secondary">
            <span className="hidden sm:inline border border-border px-2 py-0.5 rounded bg-black/30">MCP_SERVER: ONLINE</span>
            <span className="hidden sm:inline border border-border px-2 py-0.5 rounded bg-black/30">VERSION: 8b</span>
            <Link 
              href="/login" 
              className="border border-border bg-black hover:border-primary px-3 py-1 rounded text-white transition cursor-pointer font-bold"
            >
              LOGIN
            </Link>
          </div>
        )}
      </header>

      {/* Main hero space */}
      <main className="w-full max-w-7xl px-8 flex-1 flex flex-col justify-center py-20 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 bg-primary/5 rounded font-mono text-[10px] text-primary tracking-widest uppercase">
              <ShieldAlert className="w-3.5 h-3.5" />
              LOCAL-FIRST MULTI-AGENT STATIC SECURITY SYSTEM
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
              A local-first multi-agent system that finds security flaws in source code — combining tree-sitter AST analysis, IR-based taint propagation, and specialized LLM agents.
            </p>

            {/* 3 Hero Action Buttons with Laptop, Server, Globe logos */}
            <div className="flex flex-wrap gap-3.5 pt-4 font-mono">
              {/* Button 1: Use locally (Laptop Logo -> Smooth Scrolls to Manual Setup) */}
              <button 
                type="button"
                onClick={() => scrollToSection('use-locally-section')}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs px-4 py-3 rounded border border-transparent shadow-[0_0_15px_rgba(255,32,32,0.4)] transition-all duration-150 active:scale-95 cursor-pointer font-bold"
              >
                <Laptop className="w-4 h-4 text-white" />
                USE LOCALLY
              </button>

              {/* Button 2: Use MCP Server (Server Logo -> Smooth Scrolls to MCP Setup) */}
              <button 
                type="button"
                onClick={() => scrollToSection('use-mcp-section')}
                className="inline-flex items-center gap-2 border border-border bg-black/60 hover:bg-card text-white text-xs px-4 py-3 rounded hover:border-primary/50 transition-all duration-150 cursor-pointer font-bold"
              >
                <Server className="w-4 h-4 text-primary" />
                USE MCP SERVER
              </button>

              {/* Button 3: Use in browser (Redirects to /dashboard if logged in, or /login if not) */}
              <Link 
                href={session?.user ? "/dashboard" : "/login"}
                className="inline-flex items-center gap-2 border border-border bg-black/60 hover:bg-card text-white text-xs px-4 py-3 rounded hover:border-success/50 transition-all duration-150 cursor-pointer font-bold"
              >
                <Globe className="w-4 h-4 text-success" />
                USE IN BROWSER
                <ArrowRight className="w-3.5 h-3.5 text-success" />
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
                <div><span className="text-white">[i]</span> Mapping package boundaries: Python 3.10+</div>
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

        {/* STACKED SETUP SECTION 1: USE LOCALLY INSTRUCTIONS (REBUILT FROM README) */}
        <section id="use-locally-section" className="py-16 border-t border-border space-y-6 text-left font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 border border-primary/40 bg-primary/10 rounded">
                <Laptop className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-sans font-bold text-xl text-white tracking-wide">1. LOCAL ENGINE QUICKSTART & CLI SETUP</h2>
                <p className="text-text-secondary text-xs">Run Ultron natively on Python 3.10+ with local Ollama or cloud models.</p>
              </div>
            </div>
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <span className="bg-blue-950/80 text-blue-400 border border-blue-800 px-2 py-0.5 rounded font-bold">python-3.10+</span>
              <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">tests 86 passing</span>
              <span className="bg-amber-950/80 text-amber-400 border border-amber-800 px-2 py-0.5 rounded font-bold">license MIT</span>
              <span className="bg-rose-950/80 text-rose-400 border border-rose-800 px-2 py-0.5 rounded font-bold">local-first ✓</span>
            </div>
          </div>

          <div className="border border-border bg-surface p-6 rounded space-y-6 shadow-xl">
            {/* Terminal execution block */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <TerminalSquare className="w-4 h-4 text-primary" />
                <span>Quickstart Terminal Execution:</span>
              </div>
              <div className="bg-black border border-border p-4 rounded text-xs space-y-3 font-mono leading-relaxed">
                <div className="text-text-secondary"># 1. Install dependencies (tree-sitter, httpx, graphviz)</div>
                <div className="text-primary font-bold">pip install -r requirements.txt</div>

                <div className="text-text-secondary pt-2"># 2. Run security analysis on a Git repository</div>
                <div className="text-success font-bold">python ultron.py https://github.com/user/repo</div>

                <div className="text-text-secondary pt-2"># 3. Pass --fix to invoke specialized LLM Refactoring Agents</div>
                <div className="text-white font-bold">python ultron.py scan . --fix</div>
              </div>
            </div>

            {/* CLI Commands Reference Table */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-primary" />
                <span>Ultron CLI Command Suite</span>
              </div>
              <div className="border border-border rounded overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-black/60 text-text-secondary border-b border-border">
                    <tr>
                      <th className="p-2.5 font-bold">Command</th>
                      <th className="p-2.5 font-bold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-black/20">
                    {cliCommands.map((item, idx) => (
                      <tr key={idx} className="hover:bg-card/40 transition">
                        <td className="p-2.5 font-bold text-primary whitespace-nowrap">{item.cmd}</td>
                        <td className="p-2.5 text-text-secondary">{item.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pre-commit Hook */}
            <div className="bg-black/40 border border-border p-4 rounded text-xs space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <GitPullRequest className="w-4 h-4 text-primary" />
                <span>Pre-Commit Git Security Hook Integration</span>
              </div>
              <p className="text-text-secondary text-[11px]">
                Install a built-in pre-commit security filter directly inside your project folder:
              </p>
              <div className="bg-black p-2 rounded border border-border text-primary font-mono text-[11px]">
                python ultron.py install-hook .
              </div>
              <div className="text-[10px] text-text-secondary pt-1">
                Bypass one-time commits using <code className="text-white">git commit --no-verify</code> or <code className="text-white">ULTRON_DISABLE_HOOK=1</code>.
              </div>
            </div>
          </div>
        </section>

        {/* STACKED SETUP SECTION 2: USE MCP SERVER INSTRUCTIONS (REBUILT FROM README) */}
        <section id="use-mcp-section" className="py-16 border-t border-border space-y-6 text-left font-mono">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2 border border-primary/40 bg-primary/10 rounded">
              <Server className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-xl text-white tracking-wide">2. MODEL CONTEXT PROTOCOL (MCP) SERVER</h2>
              <p className="text-text-secondary text-xs">Expose 18 security tools directly to Claude Desktop, Cursor, opencode, and VS Code Copilot Agent.</p>
            </div>
          </div>

          <div className="border border-border bg-surface p-6 rounded space-y-6 shadow-xl">
            {/* Transport Launch Commands */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Option A: Stdio */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-border/60 pb-1">
                  Option A: Stdio Transport (Desktop Clients)
                </span>
                <div className="bg-black border border-border p-4 rounded text-xs space-y-2 font-mono text-text-secondary">
                  <div># Launch stdio MCP daemon for Claude & Cursor</div>
                  <div className="text-primary font-bold">python routes/mcp_server.py</div>
                  <div className="text-[10px] text-text-secondary pt-2">Compatible with opencode, Claude Desktop, Cursor, and Antigravity</div>
                </div>
              </div>

              {/* Option B: SSE */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-border/60 pb-1">
                  Option B: SSE Transport (Web Clients)
                </span>
                <div className="bg-black border border-border p-4 rounded text-xs space-y-2 font-mono text-text-secondary">
                  <div># Launch SSE MCP server on port 8743</div>
                  <div className="text-success font-bold">python routes/mcp_server.py --sse --port 8743</div>
                  <div className="text-[10px] text-text-secondary pt-2">SSE Endpoint: http://localhost:8743/sse</div>
                </div>
              </div>
            </div>

            {/* MCP JSON Config Block */}
            <div className="bg-black/40 border border-border p-4 rounded text-xs space-y-2">
              <div className="text-white font-bold flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span>Claude Desktop & Cursor Config (`claude_desktop_config.json`):</span>
              </div>
              <pre className="text-[10px] text-primary font-mono overflow-x-auto p-3 bg-black rounded border border-border leading-relaxed">
{`{
  "mcpServers": {
    "ultron": {
      "command": "python",
      "args": ["routes/mcp_server.py"]
    }
  }
}`}
              </pre>
            </div>

            {/* 18 FastMCP Tools Summary Table */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Exposed FastMCP Security Tools (18 Active Tools)</span>
              </div>
              <div className="border border-border rounded overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-black/60 text-text-secondary border-b border-border sticky top-0">
                    <tr>
                      <th className="p-2 font-bold">Tool Name</th>
                      <th className="p-2 font-bold">Category</th>
                      <th className="p-2 font-bold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-black/20 text-[11px]">
                    {mcpToolsList.map((t, idx) => (
                      <tr key={idx} className="hover:bg-card/40 transition">
                        <td className="p-2 font-bold text-success">{t.tool}</td>
                        <td className="p-2 text-text-secondary">{t.category}</td>
                        <td className="p-2 text-white">{t.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer details */}
      <footer className="w-full border-t border-border py-6 px-8 z-10 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-text-secondary">
          <span>&copy; 2026 ULTRON INC. PLATFORM SECURED.</span>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a href="https://github.com/aaditya-paul/project-ultron" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GITHUB REPO</a>
            <a href="#use-mcp-section" className="hover:text-white transition">MCP SPEC</a>
            <a href="#use-locally-section" className="hover:text-white transition">LOCAL SETUP</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
