'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ShieldAlert, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const pts: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    const n = Math.min(60, Math.floor((w * h) / 20000));
    for (let i = 0; i < n; i++) {
      pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6, r: Math.random() * 1.5 + 0.5 });
    }
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,32,32,0.35)'; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(255,32,32,${0.08 * (1 - d / 120)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); router.push('/dashboard'); }, 1800);
  };

  const emailCls = `flex items-center border rounded transition-all duration-200 ${focusedField === 'email' ? 'border-primary bg-black shadow-[0_0_8px_rgba(255,32,32,0.15)]' : 'border-border bg-black/60'}`;
  const pwCls = `flex items-center border rounded transition-all duration-200 ${focusedField === 'password' ? 'border-primary bg-black shadow-[0_0_8px_rgba(255,32,32,0.15)]' : 'border-border bg-black/60'}`;

  return (
    <div className="relative min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white overflow-hidden scanline">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/80 z-0 pointer-events-none" />
      <div className="absolute inset-0 cyber-grid opacity-30 z-0 pointer-events-none" />

      <header className="absolute top-0 left-0 right-0 h-16 flex items-center px-8 z-10 border-b border-border/50 bg-[#050505]/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded border border-primary flex items-center justify-center bg-black/50 shadow-[0_0_8px_rgba(255,32,32,0.4)]">
            <span className="text-primary font-bold text-sm">U</span>
          </div>
          <span className="font-sans font-bold tracking-widest text-white text-sm neon-text-red">ULTRON</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[10px] font-mono text-text-secondary">
          <span className="border border-border px-2 py-0.5 rounded bg-black/30">MCP_SERVER: ONLINE</span>
          <span className="border border-border px-2 py-0.5 rounded bg-black/30">VERSION: 2.1.0</span>
        </div>
      </header>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="absolute -inset-1 bg-primary/10 rounded-lg blur-xl pointer-events-none" />
        <div className="relative border border-border bg-surface/80 backdrop-blur-md rounded-lg overflow-hidden shadow-2xl shadow-black/60">
          <div className="h-1 w-full bg-gradient-to-r from-primary via-rose-500 to-primary/30" />
          <div className="p-8 space-y-6">

            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded border border-primary/40 bg-primary/5 shadow-[0_0_20px_rgba(255,32,32,0.15)] mb-1">
                <ShieldAlert className="w-6 h-6 text-primary" />
              </div>
              <h1 className="font-sans font-bold text-xl tracking-widest text-white uppercase">Secure Access</h1>
              <p className="text-text-secondary text-[11px] font-mono">ULTRON PLATFORM - AUTH GATEWAY</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[9px] font-mono text-text-secondary tracking-widest">CREDENTIALS</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-[10px] font-mono text-text-secondary tracking-widest uppercase block">
                  Email Address
                </label>
                <div className={emailCls}>
                  <span className="px-3 py-3 border-r border-border/60 text-text-secondary shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="operator@ultron.io"
                    autoComplete="email"
                    className="flex-1 bg-transparent border-0 outline-none px-3 py-3 text-white text-xs font-mono placeholder:text-[#444]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-[10px] font-mono text-text-secondary tracking-widest uppercase block">
                  Password
                </label>
                <div className={pwCls}>
                  <span className="px-3 py-3 border-r border-border/60 text-text-secondary shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="flex-1 bg-transparent border-0 outline-none px-3 py-3 text-white text-xs font-mono placeholder:text-[#444]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 py-3 text-text-secondary hover:text-white transition shrink-0"
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 border border-critical/30 bg-critical/5 rounded p-2.5 text-[10px] font-mono text-critical">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold font-mono py-3.5 rounded shadow-[0_0_15px_rgba(255,32,32,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 tracking-widest uppercase mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    ACCESS PLATFORM
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-[9px] font-mono text-text-secondary/60 tracking-wider">
              ENCRYPTED - TLS 1.3 - ZERO-TRUST AUTH
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
