'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGameStore } from '@/store/gameStore';
import type { GameRecord, Match2vs2, Tournament, AmericanoTournament } from '@/types';

function getGameLink(game: GameRecord): string {
  switch (game.type) {
    case '1vs1':
      return `/game/1vs1/${game.id}`;
    case '2vs2':
      return `/game/2vs2/${game.id}`;
    case '2vs2-tournament':
      return `/game/tournament/${game.id}`;
    case 'americano-klein':
      return `/game/americano-klein/${game.id}`;
    case 'americano-gross':
      return `/game/americano-gross/${game.id}`;
  }
}

function getGameTypeBadge(type: GameRecord['type']) {
  const config: Record<GameRecord['type'], { label: string; color: string }> = {
    '1vs1': { label: '1vs1', color: 'bg-emerald-500/15 text-emerald-400' },
    '2vs2': { label: '2vs2', color: 'bg-indigo-500/15 text-indigo-400' },
    '2vs2-tournament': { label: 'Turnier', color: 'bg-blue-500/15 text-blue-400' },
    'americano-klein': { label: 'Americano Klein', color: 'bg-amber-500/15 text-amber-400' },
    'americano-gross': { label: 'Americano Groß', color: 'bg-rose-500/15 text-rose-400' },
  };
  const { label, color } = config[type];
  return (
    <span className={`pill ${color}`}>
      {label}
    </span>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getPlayerNames(game: GameRecord, getPlayer: (id: string) => { name: string } | undefined): string {
  let playerIds: string[] = [];

  if (game.type === '1vs1') {
    playerIds = [game.player1, game.player2];
  } else if (game.type === '2vs2') {
    playerIds = [...game.team1, ...game.team2];
  } else {
    playerIds = game.players;
  }

  return playerIds
    .map((id) => getPlayer(id)?.name ?? 'Unbekannt')
    .join(', ');
}

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const players = useGameStore((s) => s.players);
  const games = useGameStore((s) => s.games);
  const getPlayer = useGameStore((s) => s.getPlayer);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
          <p className="text-[rgba(255,255,255,0.4)] text-sm">Laden...</p>
        </div>
      </div>
    );
  }

  const activeGames = games.filter((g) => g.status === 'in_progress');
  const completedGames = games
    .filter((g) => g.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const recentActivity = games.length > 0
    ? formatDate(
        games
          .slice()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
      )
    : 'Noch keine Spiele';

  return (
    <div className="px-5 pt-8 pb-10 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-3 py-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-card-static mb-3">
          <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="gradient-text">Smesh </span>
          <span className="gradient-text-accent">Everybody</span>
        </h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 animate-fade-in-up stagger-1">
        <div className="glass-card-static rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold gradient-text-accent">{games.length}</div>
          <div className="text-xs text-[rgba(255,255,255,0.4)] mt-1.5 font-medium uppercase tracking-wider">Spiele</div>
        </div>
        <div className="glass-card-static rounded-2xl p-4 text-center animate-fade-in-up stagger-2">
          <div className="text-3xl font-bold gradient-text-accent">{players.length}</div>
          <div className="text-xs text-[rgba(255,255,255,0.4)] mt-1.5 font-medium uppercase tracking-wider">Spieler</div>
        </div>
        <div className="glass-card-static rounded-2xl p-4 text-center animate-fade-in-up stagger-3">
          <div className="text-3xl font-bold gradient-text-accent">{activeGames.length}</div>
          <div className="text-xs text-[rgba(255,255,255,0.4)] mt-1.5 font-medium uppercase tracking-wider">Aktiv</div>
        </div>
      </div>

      {/* Start New Game CTA */}
      <div className="animate-fade-in-up stagger-2">
        <Link
          href="/new-game"
          className="btn-primary flex items-center justify-center gap-2.5 w-full py-4 text-base animate-pulse-glow"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Neues Spiel starten
        </Link>
      </div>

      {/* Active Games */}
      {activeGames.length > 0 && (
        <section className="space-y-4 animate-fade-in-up stagger-3">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
            <h2 className="text-lg font-semibold text-[rgba(255,255,255,0.9)]">Aktive Spiele</h2>
          </div>
          <div className="space-y-3">
            {activeGames.map((game, i) => (
              <Link
                key={game.id}
                href={getGameLink(game)}
                className={`block glass-card rounded-2xl p-5 animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    {getGameTypeBadge(game.type)}
                  </div>
                  <span className="text-xs text-[rgba(255,255,255,0.25)]">{formatDate(game.date)}</span>
                </div>
                <p className="text-sm text-[rgba(255,255,255,0.6)] truncate">
                  {getPlayerNames(game, getPlayer)}
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-violet-400 text-xs font-medium">
                  <span>Fortsetzen</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Completed Games */}
      {completedGames.length > 0 && (
        <section className="space-y-4 animate-fade-in-up stagger-4">
          <h2 className="text-lg font-semibold text-[rgba(255,255,255,0.9)]">Letzte Spiele</h2>
          <div className="space-y-3">
            {completedGames.map((game, i) => (
              <Link
                key={game.id}
                href={getGameLink(game)}
                className={`block glass-card rounded-2xl p-5 animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  {getGameTypeBadge(game.type)}
                  <span className="text-xs text-[rgba(255,255,255,0.25)]">{formatDate(game.date)}</span>
                </div>
                <p className="text-sm text-[rgba(255,255,255,0.6)] truncate">
                  {getPlayerNames(game, getPlayer)}
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-[rgba(255,255,255,0.25)] text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span>Abgeschlossen</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {games.length === 0 && (
        <div className="text-center py-16 space-y-4 animate-fade-in-up stagger-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl glass-card-static">
            <svg className="w-9 h-9 text-[rgba(255,255,255,0.15)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <p className="text-[rgba(255,255,255,0.4)] text-sm">Noch keine Spiele. Starte dein erstes Match!</p>
        </div>
      )}

      {/* Recent Activity Footer */}
      {games.length > 0 && (
        <div className="text-center text-xs text-[rgba(255,255,255,0.25)] pt-4 animate-fade-in stagger-5">
          Letzte Aktivität: {recentActivity}
        </div>
      )}
    </div>
  );
}
