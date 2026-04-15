'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';

type CategoryKey = 'overall' | 'americano' | 'normal';

interface OverallRow {
  playerId: string;
  name: string;
  tournamentsPlayed: number;
  gamesPlayed: number;
  tournamentsWon: number;
  gamesWon: number;
  tournamentWinPct: number;
  gameWinPct: number;
}

interface AmericanoRow {
  playerId: string;
  name: string;
  tournamentsPlayed: number;
  gamesPlayed: number;
  tournamentWins: number;
  wins: number;
  points: number;
  avgPoints: number;
}

interface NormalRow {
  playerId: string;
  name: string;
  tournamentsPlayed: number;
  onevonePlayed: number;
  twovstwoPlayed: number;
  tournamentWins: number;
  onevoneWins: number;
  twovstwoWins: number;
}

type SortKey<T> = keyof Omit<T, 'playerId' | 'name'>;

const CATEGORY_TABS: { key: CategoryKey; label: string }[] = [
  { key: 'overall', label: 'Gesamt' },
  { key: 'americano', label: 'Americano' },
  { key: 'normal', label: 'Normal' },
];

const OVERALL_COLS: { key: SortKey<OverallRow>; label: string; short: string }[] = [
  { key: 'gameWinPct', label: 'Spiel Sieg-%', short: 'S%' },
  { key: 'tournamentWinPct', label: 'Turnier Sieg-%', short: 'T%' },
  { key: 'gamesWon', label: 'Spiele gew.', short: 'SG' },
  { key: 'tournamentsWon', label: 'Turniere gew.', short: 'TG' },
  { key: 'gamesPlayed', label: 'Spiele gesp.', short: 'Sp' },
  { key: 'tournamentsPlayed', label: 'Turniere gesp.', short: 'T' },
];

const AMERICANO_COLS: { key: SortKey<AmericanoRow>; label: string; short: string }[] = [
  { key: 'points', label: 'Punkte', short: 'Pkt' },
  { key: 'avgPoints', label: '⌀ Pkt (10er)', short: '⌀' },
  { key: 'tournamentWins', label: 'Turnier Siege', short: 'TS' },
  { key: 'wins', label: 'Siege', short: 'S' },
  { key: 'gamesPlayed', label: 'Spiele', short: 'Sp' },
  { key: 'tournamentsPlayed', label: 'Turniere', short: 'T' },
];

const NORMAL_COLS: { key: SortKey<NormalRow>; label: string; short: string }[] = [
  { key: 'twovstwoWins', label: '2vs2 Siege', short: '2S' },
  { key: 'onevoneWins', label: '1vs1 Siege', short: '1S' },
  { key: 'tournamentWins', label: 'Turnier Siege', short: 'TS' },
  { key: 'twovstwoPlayed', label: '2vs2 Spiele', short: '2P' },
  { key: 'onevonePlayed', label: '1vs1 Spiele', short: '1P' },
  { key: 'tournamentsPlayed', label: 'Turniere', short: 'T' },
];

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'] as const;

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 60%, 45%)`;
}

function formatPct(pct: number): string {
  if (pct === 0) return '0%';
  return `${Math.round(pct)}%`;
}

function formatAvg(avg: number): string {
  if (avg === 0) return '0';
  return avg.toFixed(1);
}

/* ─── Sort helper ─── */
function sortRows<T>(rows: T[], key: keyof T): T[] {
  return [...rows].sort((a, b) => (b[key] as number) - (a[key] as number));
}

export default function RankingsPage() {
  const [hydrated, setHydrated] = useState(false);
  const [category, setCategory] = useState<CategoryKey>('overall');
  const [overallSort, setOverallSort] = useState<SortKey<OverallRow>>('gameWinPct');
  const [americanoSort, setAmericanoSort] = useState<SortKey<AmericanoRow>>('points');
  const [normalSort, setNormalSort] = useState<SortKey<NormalRow>>('twovstwoWins');

  const players = useGameStore((s) => s.players);
  const getPlayerWins = useGameStore((s) => s.getPlayerWins);

  useEffect(() => {
    setHydrated(true);
  }, []);

  /* ─── Build stats once ─── */
  const allStats = useMemo(() => {
    if (!hydrated) return [];
    return players.map((p) => ({ player: p, stats: getPlayerWins(p.id) }));
  }, [hydrated, players, getPlayerWins]);

  /* ─── Overall ─── */
  const overallRows = useMemo<OverallRow[]>(() => {
    return allStats.map(({ player, stats }) => {
      const tournamentsPlayed = stats.tournamentsPlayed + stats.americanoTournamentsPlayed;
      const gamesPlayed = stats.gamesPlayed;
      const tournamentsWon = stats.tournamentWins + stats.americanoTournamentWins;
      const gamesWon = stats.onevoneWins + stats.twovstwoWins + stats.americanoWins;
      return {
        playerId: player.id,
        name: player.name,
        tournamentsPlayed,
        gamesPlayed,
        tournamentsWon,
        gamesWon,
        tournamentWinPct: tournamentsPlayed > 0 ? (tournamentsWon / tournamentsPlayed) * 100 : 0,
        gameWinPct: gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0,
      };
    });
  }, [allStats]);

  /* ─── Americano ─── */
  const americanoRows = useMemo<AmericanoRow[]>(() => {
    return allStats.map(({ player, stats }) => ({
      playerId: player.id,
      name: player.name,
      tournamentsPlayed: stats.americanoTournamentsPlayed,
      gamesPlayed: stats.americanoGamesPlayed,
      tournamentWins: stats.americanoTournamentWins,
      wins: stats.americanoWins,
      points: stats.americanoPoints,
      avgPoints:
        stats.americanoGamesPlayed > 0
          ? Math.round((stats.americanoNormalizedPoints / stats.americanoGamesPlayed) * 100) / 100
          : 0,
    }));
  }, [allStats]);

  /* ─── Normal ─── */
  const normalRows = useMemo<NormalRow[]>(() => {
    return allStats.map(({ player, stats }) => ({
      playerId: player.id,
      name: player.name,
      tournamentsPlayed: stats.tournamentsPlayed,
      onevonePlayed: stats.onevonePlayed,
      twovstwoPlayed: stats.twovstwoPlayed,
      tournamentWins: stats.tournamentWins,
      onevoneWins: stats.onevoneWins,
      twovstwoWins: stats.twovstwoWins,
    }));
  }, [allStats]);

  const sortedOverall = useMemo(() => sortRows(overallRows, overallSort), [overallRows, overallSort]);
  const sortedAmericano = useMemo(() => sortRows(americanoRows, americanoSort), [americanoRows, americanoSort]);
  const sortedNormal = useMemo(() => sortRows(normalRows, normalSort), [normalRows, normalSort]);

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
      <h1 className="text-3xl font-bold gradient-text mb-5">Ranglisten</h1>

      {/* Category tabs */}
      <div className="glass-card-static flex gap-1 rounded-2xl p-1 mb-5">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCategory(tab.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              category === tab.key
                ? 'bg-violet-500/15 text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overall */}
      {category === 'overall' && (
        <div className="animate-fade-in-up">
          <SortPills cols={OVERALL_COLS} activeKey={overallSort} setKey={setOverallSort} />
          <RankTable<OverallRow>
            rows={sortedOverall}
            cols={OVERALL_COLS}
            activeKey={overallSort}
            formatValue={(key, val) =>
              key === 'gameWinPct' || key === 'tournamentWinPct' ? formatPct(val) : String(val)
            }
          />
        </div>
      )}

      {/* Americano */}
      {category === 'americano' && (
        <div className="animate-fade-in-up">
          <SortPills cols={AMERICANO_COLS} activeKey={americanoSort} setKey={setAmericanoSort} />
          <RankTable<AmericanoRow>
            rows={sortedAmericano}
            cols={AMERICANO_COLS}
            activeKey={americanoSort}
            formatValue={(key, val) => (key === 'avgPoints' ? formatAvg(val) : String(val))}
          />
        </div>
      )}

      {/* Normal */}
      {category === 'normal' && (
        <div className="animate-fade-in-up">
          <SortPills cols={NORMAL_COLS} activeKey={normalSort} setKey={setNormalSort} />
          <RankTable<NormalRow>
            rows={sortedNormal}
            cols={NORMAL_COLS}
            activeKey={normalSort}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Sort pill bar ─── */
function SortPills<T>({
  cols,
  activeKey,
  setKey,
}: {
  cols: { key: SortKey<T>; label: string }[];
  activeKey: SortKey<T>;
  setKey: (k: SortKey<T>) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
      {cols.map((col) => (
        <button
          key={String(col.key)}
          onClick={() => setKey(col.key)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
            activeKey === col.key
              ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-[0_0_16px_rgba(139,92,246,0.25)]'
              : 'glass-card-static text-white/40 hover:text-white/70'
          }`}
        >
          {col.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Ranking table ─── */
function RankTable<T extends { playerId: string; name: string }>({
  rows,
  cols,
  activeKey,
  formatValue,
}: {
  rows: T[];
  cols: { key: SortKey<T>; short: string }[];
  activeKey: SortKey<T>;
  formatValue?: (key: SortKey<T>, val: number) => string;
}) {
  // Assign ranks with tie-breaking
  const ranks: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (i === 0 || (rows[i][activeKey] as number) !== (rows[i - 1][activeKey] as number)) {
      ranks.push(i + 1);
    } else {
      ranks.push(ranks[i - 1]);
    }
  }

  const colWidths = cols.map(() => 'minmax(2rem, 2.5rem)').join(' ');
  const gridCols = `1.8rem 1.8rem 1fr ${colWidths}`;

  return (
    <div className="glass-card-static rounded-2xl overflow-x-auto">
      {/* Header */}
      <div
        className="grid items-center gap-1.5 px-3 py-2.5 border-b border-white/[0.06] text-[10px] font-semibold uppercase tracking-wider text-white/25"
        style={{ gridTemplateColumns: gridCols, minWidth: '340px' }}
      >
        <span>#</span>
        <span />
        <span>Spieler</span>
        {cols.map((col) => (
          <span
            key={String(col.key)}
            className={`text-center ${activeKey === col.key ? 'text-violet-400' : ''}`}
          >
            {col.short}
          </span>
        ))}
      </div>

      {/* Rows */}
      {rows.map((row, i) => {
        const rank = ranks[i];
        const isTop3 = rank <= 3;
        const medalColor = isTop3 ? MEDAL_COLORS[rank - 1] : undefined;
        const borderClass =
          rank === 1
            ? 'border-l-2 border-amber-500 bg-amber-500/[0.06]'
            : rank === 2
            ? 'border-l-2 border-white/30 bg-white/[0.02]'
            : rank === 3
            ? 'border-l-2 border-orange-600 bg-orange-500/[0.04]'
            : 'border-l-2 border-transparent';

        return (
          <div
            key={row.playerId}
            className={`grid items-center gap-1.5 px-3 py-2.5 border-t border-white/[0.04] ${borderClass}`}
            style={{ gridTemplateColumns: gridCols, minWidth: '340px' }}
          >
            <span
              className="text-xs font-bold text-center"
              style={medalColor ? { color: medalColor } : { color: 'rgba(255,255,255,0.25)' }}
            >
              {rank}
            </span>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0"
              style={{ backgroundColor: hashColor(row.name) }}
            >
              {getInitials(row.name)}
            </div>
            <span className="text-sm font-medium truncate text-white/90">{row.name}</span>
            {cols.map((col) => {
              const val = row[col.key] as number;
              const isActive = activeKey === col.key;
              const display = formatValue ? formatValue(col.key, val) : String(val);
              return (
                <span
                  key={String(col.key)}
                  className={`text-xs text-center tabular-nums ${
                    isActive ? 'font-bold text-violet-400' : 'text-white/40'
                  }`}
                >
                  {display}
                </span>
              );
            })}
          </div>
        );
      })}

      {rows.length === 0 && (
        <div className="px-4 py-8 text-center text-white/25 text-sm">Noch keine Spieler</div>
      )}
    </div>
  );
}
