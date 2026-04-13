'use client';

import React from 'react';

/* ─── Accent color config ─── */
const ACCENTS = {
  violet: { glow: 'rgba(139,92,246,0.18)', badge: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
  amber:  { glow: 'rgba(245,158,11,0.18)',  badge: 'bg-amber-500/15 text-amber-300 border-amber-500/25'  },
  rose:   { glow: 'rgba(244,63,94,0.18)',   badge: 'bg-rose-500/15 text-rose-300 border-rose-500/25'    },
  blue:   { glow: 'rgba(59,130,246,0.18)',   badge: 'bg-blue-500/15 text-blue-300 border-blue-500/25'   },
} as const;

type AccentColor = keyof typeof ACCENTS;

/* ─── Court surface gradient ─── */
const COURT_BG = `
  radial-gradient(ellipse at 50% 45%, rgba(56,139,255,0.09) 0%, transparent 55%),
  linear-gradient(180deg,
    rgba(15,23,42,0.98) 0%,
    rgba(22,78,163,0.14) 8%,
    rgba(30,64,175,0.22) 42%,
    rgba(30,64,175,0.22) 58%,
    rgba(22,78,163,0.14) 92%,
    rgba(15,23,42,0.98) 100%)
`;

/* ─── Court Markings (shared) ─── */
function CourtMarkings({ compact = false, glowColor, showNet = true }: { compact?: boolean; glowColor: string; showNet?: boolean }) {
  const pad = compact ? 6 : 14;
  const netH = compact ? 5 : 8;
  const postW = compact ? 3 : 4;
  const postH = compact ? 8 : 14;
  const meshGap = compact ? 4 : 6;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Court boundary */}
      <div className="absolute" style={{
        top: pad, left: pad + 2, right: pad + 2, bottom: pad,
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 4,
      }} />

      {/* Glass wall hints – top & bottom edges */}
      <div className="absolute" style={{
        top: pad, left: '15%', right: '15%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.06) 70%, transparent)',
      }} />
      <div className="absolute" style={{
        bottom: pad, left: '15%', right: '15%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.06) 70%, transparent)',
      }} />

      {/* Service line – top */}
      <div className="absolute" style={{
        top: '30%', left: pad + 2, right: pad + 2,
        height: 1, background: 'rgba(255,255,255,0.06)',
      }} />

      {/* Service line – bottom */}
      <div className="absolute" style={{
        top: '70%', left: pad + 2, right: pad + 2,
        height: 1, background: 'rgba(255,255,255,0.06)',
      }} />

      {/* Center service line (vertical) */}
      <div className="absolute" style={{
        left: '50%', top: '30%', height: '40%',
        width: 1, transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.06)',
      }} />

      {/* ═══ NET (absolute – used by CourtSurface) ═══ */}
      {showNet && (
        <>
          <div className="absolute" style={{
            top: '50%', left: pad, right: pad,
            height: netH, transform: 'translateY(-50%)',
            background: `repeating-linear-gradient(90deg,
              rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px,
              transparent 1px, transparent ${meshGap}px)`,
          }} />
          <div className="absolute" style={{
            top: '50%', left: pad, right: pad,
            height: 1.5, marginTop: -(netH / 2),
            background: `linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 15%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.3) 85%, rgba(255,255,255,0.1) 100%)`,
            boxShadow: `0 0 14px ${glowColor}, 0 1px 6px rgba(255,255,255,0.04)`,
          }} />
          <div className="absolute" style={{
            top: '50%', left: pad, right: pad,
            height: 1, marginTop: netH / 2 - 1,
            background: 'rgba(255,255,255,0.08)',
          }} />
          <div className="absolute" style={{
            top: '50%', left: pad - 1,
            width: postW, height: postH, transform: 'translateY(-50%)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
            borderRadius: 1.5, boxShadow: `0 0 6px ${glowColor}`,
          }} />
          <div className="absolute" style={{
            top: '50%', right: pad - 1,
            width: postW, height: postH, transform: 'translateY(-50%)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
            borderRadius: 1.5, boxShadow: `0 0 6px ${glowColor}`,
          }} />
        </>
      )}
    </div>
  );
}

/* ─── Player name badges ─── */
function PlayerRow({ players, compact }: { players: string[]; compact: boolean }) {
  const single = players.length === 1;
  return (
    <div className={`grid ${single ? 'grid-cols-1 max-w-[65%]' : 'grid-cols-2 max-w-[85%]'} ${compact ? 'gap-1.5' : 'gap-2'} mx-auto`}>
      {players.map((name, i) => (
        <div
          key={i}
          className={`text-center ${compact ? 'px-2.5 py-1' : 'px-3.5 py-2'} rounded-xl bg-gradient-to-b from-white/[0.07] to-white/[0.03] border border-white/[0.09] shadow-sm shadow-black/10 backdrop-blur-sm`}
        >
          <span className={`${compact ? 'text-[11px]' : 'text-[13px]'} font-medium text-white/90 truncate block`}>
            {name}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Inline net (rendered in content flow for perfect centering) ─── */
function InlineNet({ compact, glowColor, hasScores }: { compact: boolean; glowColor: string; hasScores: boolean }) {
  const pad = compact ? 6 : 14;
  const netH = compact ? 5 : 8;
  const postW = compact ? 3 : 4;
  const postH = compact ? 8 : 14;
  const meshGap = compact ? 4 : 6;
  const contentPx = compact ? 16 : 20; // matches px-4 / px-5

  return (
    <div
      className={`relative ${hasScores ? (compact ? 'my-2' : 'my-3') : (compact ? 'my-3' : 'my-5')}`}
      style={{ marginLeft: -contentPx, marginRight: -contentPx }}
    >
      {/* Net mesh – vertical strings */}
      <div style={{
        height: netH,
        marginLeft: pad, marginRight: pad,
        background: `repeating-linear-gradient(90deg,
          rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px,
          transparent 1px, transparent ${meshGap}px)`,
      }} />
      {/* Top cable (bright) */}
      <div className="absolute" style={{
        top: 0, left: pad, right: pad, height: 1.5,
        background: `linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 15%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.3) 85%, rgba(255,255,255,0.1) 100%)`,
        boxShadow: `0 0 14px ${glowColor}, 0 1px 6px rgba(255,255,255,0.04)`,
      }} />
      {/* Bottom edge */}
      <div className="absolute" style={{
        bottom: 0, left: pad, right: pad, height: 1,
        background: 'rgba(255,255,255,0.08)',
      }} />
      {/* Net posts */}
      <div className="absolute" style={{
        top: '50%', left: pad - 1,
        width: postW, height: postH, transform: 'translateY(-50%)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
        borderRadius: 1.5, boxShadow: `0 0 6px ${glowColor}`,
      }} />
      <div className="absolute" style={{
        top: '50%', right: pad - 1,
        width: postW, height: postH, transform: 'translateY(-50%)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
        borderRadius: 1.5, boxShadow: `0 0 6px ${glowColor}`,
      }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CourtCard — Structured match card with court visualisation
   ═══════════════════════════════════════════════════════════════ */

interface CourtCardProps {
  team1Players: string[];
  team2Players: string[];
  team1Score?: React.ReactNode;
  team2Score?: React.ReactNode;
  courtNumber?: number;
  accentColor?: AccentColor;
  compact?: boolean;
  completed?: boolean;
  highlighted?: boolean;
  onClick?: () => void;
  footer?: React.ReactNode;
  statusBadge?: React.ReactNode;
  className?: string;
}

export default function CourtCard({
  team1Players, team2Players,
  team1Score, team2Score,
  courtNumber, accentColor = 'violet',
  compact = false, completed = false, highlighted = false,
  onClick, footer, statusBadge, className = '',
}: CourtCardProps) {
  const accent = ACCENTS[accentColor];
  const hasScores = team1Score !== undefined || team2Score !== undefined;

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      className={[
        'w-full text-left relative rounded-2xl overflow-hidden transition-all duration-300',
        highlighted ? 'ring-1 ring-white/15 shadow-lg shadow-black/20' : '',
        completed ? 'opacity-50' : '',
        onClick ? 'cursor-pointer hover:ring-1 hover:ring-white/10 active:scale-[0.98]' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {/* Court Surface */}
      <div
        className="relative"
        style={{ background: COURT_BG, boxShadow: 'inset 0 1px 30px rgba(0,0,0,0.3)' }}
      >
        <CourtMarkings compact={compact} glowColor={accent.glow} showNet={false} />

        {/* Content */}
        <div className={`relative z-10 ${compact ? 'px-4 py-3' : 'px-5 py-5'}`}>
          {/* Badge row */}
          {(courtNumber !== undefined || statusBadge) && (
            <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-3'}`}>
              {courtNumber !== undefined ? (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${accent.badge}`}>
                  Platz {courtNumber}
                </span>
              ) : <span />}
              {statusBadge || null}
            </div>
          )}

          {/* Team 1 – top half */}
          <div>
            <PlayerRow players={team1Players} compact={compact} />
            {team1Score !== undefined && (
              <div className={`flex justify-center ${compact ? 'mt-1' : 'mt-2'}`}>
                {team1Score}
              </div>
            )}
          </div>

          {/* ═══ NET — inline for perfect centering between teams ═══ */}
          <InlineNet compact={compact} glowColor={accent.glow} hasScores={hasScores} />

          {/* Team 2 – bottom half */}
          <div>
            {team2Score !== undefined && (
              <div className={`flex justify-center ${compact ? 'mb-1' : 'mb-2'}`}>
                {team2Score}
              </div>
            )}
            <PlayerRow players={team2Players} compact={compact} />
          </div>
        </div>
      </div>

      {/* Footer (outside court area) */}
      {footer && (
        <div className="px-4 py-3 bg-black/30 border-t border-white/[0.05]">
          {footer}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CourtSurface — Just the court background for custom layouts
   ═══════════════════════════════════════════════════════════════ */

interface CourtSurfaceProps {
  accentColor?: AccentColor;
  className?: string;
  children: React.ReactNode;
}

export function CourtSurface({ accentColor = 'violet', className = '', children }: CourtSurfaceProps) {
  const accent = ACCENTS[accentColor];

  return (
    <div className={`relative rounded-3xl overflow-hidden ${className}`}>
      <div
        className="relative"
        style={{ background: COURT_BG, boxShadow: 'inset 0 1px 30px rgba(0,0,0,0.3)' }}
      >
        <CourtMarkings glowColor={accent.glow} />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
