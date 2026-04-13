import { v4 as uuidv4 } from 'uuid';
import type { AmericanoGame } from '@/types';

interface RoundGame {
  team1: [number, number];
  team2: [number, number];
  court: number;
}

// Generate Americano Klein schedule: every player partners with every other player once
export function generateAmericanoKleinSchedule(
  playerIds: string[],
  courts: number
): AmericanoGame[] {
  const n = playerIds.length;
  if (n < 4) return [];

  const partnerships = generateAllPartnerships(n);
  const games: AmericanoGame[] = [];
  const usedPartnerships = new Set<string>();
  let round = 0;

  while (usedPartnerships.size < partnerships.length) {
    const roundGames = scheduleRound(
      playerIds,
      partnerships,
      usedPartnerships,
      courts,
      round
    );
    if (roundGames.length === 0) break;
    games.push(...roundGames);
    round++;
  }

  return games;
}

// Generate Americano Groß schedule: all partner + opponent combinations
export function generateAmericanoGrossSchedule(
  playerIds: string[],
  courts: number
): AmericanoGame[] {
  const n = playerIds.length;
  if (n < 4) return [];

  // Phase 1: Cover all partnerships (same as Klein)
  const kleinGames = generateAmericanoKleinSchedule(playerIds, courts);

  // Phase 2: Check which opponent pairs are missing
  const allPairs = new Set<string>();
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      allPairs.add(pairKey(playerIds[i], playerIds[j]));
    }
  }

  const coveredOpponents = new Set<string>();
  for (const game of kleinGames) {
    const [a, b] = game.team1;
    const [c, d] = game.team2;
    coveredOpponents.add(pairKey(a, c));
    coveredOpponents.add(pairKey(a, d));
    coveredOpponents.add(pairKey(b, c));
    coveredOpponents.add(pairKey(b, d));
  }

  const missingOpponents: string[] = [];
  for (const pair of allPairs) {
    if (!coveredOpponents.has(pair)) {
      missingOpponents.push(pair);
    }
  }

  // Phase 3: Generate extra games to cover missing opponent pairs
  let currentRound = kleinGames.length > 0
    ? Math.max(...kleinGames.map(g => g.round)) + 1
    : 0;
  const extraGames: AmericanoGame[] = [];
  const remainingOpponents = new Set(missingOpponents);

  while (remainingOpponents.size > 0) {
    const roundGames: AmericanoGame[] = [];
    const usedInRound = new Set<string>();
    let courtNum = 0;

    for (const oppPair of [...remainingOpponents]) {
      if (courtNum >= courts) break;
      const [p1, p2] = oppPair.split('|');

      if (usedInRound.has(p1) || usedInRound.has(p2)) continue;

      // Find two more players not used in this round
      const available = playerIds.filter(
        pid => pid !== p1 && pid !== p2 && !usedInRound.has(pid)
      );
      if (available.length < 2) continue;

      const p3 = available[0];
      const p4 = available[1];

      // Create game: (p1, p3) vs (p2, p4) so p1 faces p2, randomize sides
      const swapSides = Math.random() < 0.5;
      const game: AmericanoGame = {
        id: uuidv4(),
        round: currentRound,
        court: courtNum,
        team1: swapSides ? [p2, p4] : [p1, p3],
        team2: swapSides ? [p1, p3] : [p2, p4],
        team1Score: 0,
        team2Score: 0,
        status: 'pending',
      };

      roundGames.push(game);
      usedInRound.add(p1);
      usedInRound.add(p2);
      usedInRound.add(p3);
      usedInRound.add(p4);
      courtNum++;

      // Mark covered opponents
      const newOpps = [
        pairKey(p1, p2), pairKey(p1, p4),
        pairKey(p3, p2), pairKey(p3, p4),
      ];
      for (const op of newOpps) {
        remainingOpponents.delete(op);
      }
    }

    if (roundGames.length === 0) break;
    extraGames.push(...roundGames);
    currentRound++;
  }

  return [...kleinGames, ...extraGames];
}

function generateAllPartnerships(n: number): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairs.push([i, j]);
    }
  }
  return pairs;
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function scheduleRound(
  playerIds: string[],
  allPartnerships: [number, number][],
  usedPartnerships: Set<string>,
  maxCourts: number,
  round: number
): AmericanoGame[] {
  const n = playerIds.length;
  const games: AmericanoGame[] = [];
  const usedInRound = new Set<number>();
  let court = 0;

  // Find unused partnerships and try to form games
  const availablePartnerships = allPartnerships.filter(
    ([i, j]) => !usedPartnerships.has(`${i}-${j}`)
  );

  // Greedily pair partnerships into games
  const usedThisRound = new Set<string>();

  for (let a = 0; a < availablePartnerships.length && court < maxCourts; a++) {
    const [p1, p2] = availablePartnerships[a];
    if (usedInRound.has(p1) || usedInRound.has(p2)) continue;
    if (usedThisRound.has(`${p1}-${p2}`)) continue;

    // Find a second partnership with no overlapping players
    for (let b = a + 1; b < availablePartnerships.length; b++) {
      const [p3, p4] = availablePartnerships[b];
      if (usedInRound.has(p3) || usedInRound.has(p4)) continue;
      if (p3 === p1 || p3 === p2 || p4 === p1 || p4 === p2) continue;
      if (usedThisRound.has(`${p3}-${p4}`)) continue;

      // Create the game – randomize which partnership is team1 vs team2
      const swapSides = Math.random() < 0.5;
      const game: AmericanoGame = {
        id: uuidv4(),
        round,
        court,
        team1: swapSides ? [playerIds[p3], playerIds[p4]] : [playerIds[p1], playerIds[p2]],
        team2: swapSides ? [playerIds[p1], playerIds[p2]] : [playerIds[p3], playerIds[p4]],
        team1Score: 0,
        team2Score: 0,
        status: 'pending',
      };

      games.push(game);
      usedInRound.add(p1);
      usedInRound.add(p2);
      usedInRound.add(p3);
      usedInRound.add(p4);
      usedPartnerships.add(`${p1}-${p2}`);
      usedPartnerships.add(`${p3}-${p4}`);
      usedThisRound.add(`${p1}-${p2}`);
      usedThisRound.add(`${p3}-${p4}`);
      court++;
      break;
    }
  }

  return games;
}

// Get the leaderboard for an Americano tournament
export function getAmericanoLeaderboard(
  games: AmericanoGame[],
  playerIds: string[]
): { playerId: string; points: number; wins: number; gamesPlayed: number }[] {
  const stats: Record<string, { points: number; wins: number; gamesPlayed: number }> = {};

  for (const pid of playerIds) {
    stats[pid] = { points: 0, wins: 0, gamesPlayed: 0 };
  }

  for (const game of games) {
    if (game.status !== 'completed') continue;

    for (const pid of game.team1) {
      if (stats[pid]) {
        stats[pid].points += game.team1Score;
        stats[pid].gamesPlayed++;
        if (game.team1Score > game.team2Score) stats[pid].wins++;
      }
    }
    for (const pid of game.team2) {
      if (stats[pid]) {
        stats[pid].points += game.team2Score;
        stats[pid].gamesPlayed++;
        if (game.team2Score > game.team1Score) stats[pid].wins++;
      }
    }
  }

  return playerIds
    .map(pid => ({ playerId: pid, ...stats[pid] }))
    .sort((a, b) => b.points - a.points || b.wins - a.wins);
}
