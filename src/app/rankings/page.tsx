'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';

type TabKey = 'gamesPlayed' | 'americanoPoints' | 'americanoWins' | 'americanoTournamentWins' | 'twovstwoWins' | 'tournamentWins';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'gamesPlayed', label: 'Gespielte Spiele' },
  { key: 'americanoPoints', label: 'Americano Punkte' },
  { key: 'americanoWins', label: 'Americano Siege' },
  { key: 'americanoTournamentWins', label: 'Americano Turnier Siege' },
  { key: 'twovstwoWins', label: '2vs2 Siege' },
  { key: 'tournamentWins', label: 'Turnier Siege' },
];

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'] as const;

const MEDAL_BORDER_STYLES: Record<number, string> = {
  1: 'border-[rgba(255,215,0,0.25)] shadow-[0_0_20px_rgba(255,215,0,0.08)]',
  2: 'border-[rgba(192,192,192,0.2)]',
  3: 'border-[rgba(205,127,50,0.2)]',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

export default function RankingsPage() {
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('gamesPlayed');
  const players = useGameStore((s) => s.players);
  const getPlayerWins = useGameStore((s) => s.getPlayerWins);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const rankings = useMemo(() => {
    if (!hydrated) return [];

    const entries = players.map((p) => {
      const stats = getPlayerWins(p.id);
      return { player: p, stats };
    });

    entries.sort((a, b) => b.stats[activeTab] - a.stats[activeTab]);

    // Assign ranks with tie-breaking
    const ranked: { player: typeof entries[0]['player']; stats: typeof entries[0]['stats']; rank: number }[] = [];
    for (let i = 0; i < entries.length; i++) {
      const rank =
        i === 0 || entries[i].stats[activeTab] !== entries[i - 1].stats[activeTab]
          ? i + 1
          : ranked[i - 1].rank;
      ranked.push({ ...entries[i], rank });
    }

    return ranked;
  }, [hydrated, players, getPlayerWins, activeTab]);

  if (!hydrated) {
    return (
      <div className="p-4 pt-6">
        <h1 className="text-3xl font-bold gradient-text mb-6">Ranglisten</h1>
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-6 pb-24 animate-fade-in">
      <h1 className="text-3xl font-bold gradient-text mb-6">Ranglisten</h1>

      {/* Tab pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] rounded-full'
                : 'glass-card-static text-white/40 hover:text-white/70 rounded-full'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {rankings.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 animate-fade-in-up">
          <svg className="w-16 h-16 mb-4 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2m21-2a3 3 0 11-6 0 3 3 0 016 0zm-9 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-lg font-medium text-white/40">Noch keine Spieler</p>
          <p className="text-sm mt-1 text-white/25">Füge Spieler hinzu, um Ranglisten zu sehen</p>
        </div>
      ) : (
        <div className="space-y-2 animate-fade-in-up">
          {rankings.map((entry, index) => {
            const isTop3 = entry.rank <= 3;
            const medalColor = isTop3 ? MEDAL_COLORS[entry.rank - 1] : undefined;
            const medalBorder = isTop3 ? MEDAL_BORDER_STYLES[entry.rank] : '';

            return (
              <div
                key={entry.player.id}
                className={`glass-card-static rounded-2xl flex items-center gap-4 p-4 transition-all duration-300 animate-fade-in-up ${
                  index < 6 ? `stagger-${index + 1}` : ''
                } ${medalBorder}`}
              >
                {/* Rank */}
                <div className="w-10 shrink-0 text-center">
                  <span
                    className="text-2xl font-bold"
                    style={medalColor ? { color: medalColor } : { color: 'rgba(255,255,255,0.25)' }}
                  >
                    {entry.rank}
                  </span>
                </div>

                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: hashColor(entry.player.name) }}
                >
                  {getInitials(entry.player.name)}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 font-medium truncate">{entry.player.name}</p>
                </div>

                {/* Value */}
                <div className="text-right shrink-0">
                  <span
                    className="text-2xl font-bold"
                    style={medalColor ? { color: medalColor } : { color: 'rgba(255,255,255,0.40)' }}
                  >
                    {entry.stats[activeTab]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
