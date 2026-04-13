import type { SetScore } from '@/types';

// Official padel scoring rules
export const GAMES_TO_WIN_SET = 6;
export const MIN_GAME_LEAD = 2;
export const TIEBREAK_AT = 6;
export const TIEBREAK_POINTS_TO_WIN = 7;
export const TIEBREAK_MIN_LEAD = 2;

export function isSetComplete(set: SetScore): boolean {
  const { team1Games, team2Games, tiebreak } = set;

  // Regular set win: 6 games with 2+ lead
  if (team1Games >= GAMES_TO_WIN_SET && team1Games - team2Games >= MIN_GAME_LEAD) return true;
  if (team2Games >= GAMES_TO_WIN_SET && team2Games - team1Games >= MIN_GAME_LEAD) return true;

  // Tiebreak win: if a tiebreak exists and has been won, the set is complete
  if (tiebreak) {
    const { team1Points, team2Points } = tiebreak;
    if (team1Points >= TIEBREAK_POINTS_TO_WIN && team1Points - team2Points >= TIEBREAK_MIN_LEAD) return true;
    if (team2Points >= TIEBREAK_POINTS_TO_WIN && team2Points - team1Points >= TIEBREAK_MIN_LEAD) return true;
  }

  return false;
}

export function getSetWinner(set: SetScore): 1 | 2 | null {
  if (!isSetComplete(set)) return null;
  const { team1Games, team2Games, tiebreak } = set;

  if (team1Games > team2Games) return 1;
  if (team2Games > team1Games) return 2;

  // Tiebreak case
  if (tiebreak) {
    if (tiebreak.team1Points > tiebreak.team2Points) return 1;
    if (tiebreak.team2Points > tiebreak.team1Points) return 2;
  }

  return null;
}

export function needsTiebreak(set: SetScore): boolean {
  return set.team1Games === TIEBREAK_AT && set.team2Games === TIEBREAK_AT;
}

export function canAddGame(set: SetScore, team: 1 | 2): boolean {
  if (isSetComplete(set)) return false;
  if (needsTiebreak(set) && !set.tiebreak) return false;

  const newScore = { ...set };
  if (team === 1) newScore.team1Games++;
  else newScore.team2Games++;

  // Can't go beyond valid scores
  if (newScore.team1Games > 7 || newScore.team2Games > 7) return false;
  if (newScore.team1Games === 7 && newScore.team2Games < 5) return false;
  if (newScore.team2Games === 7 && newScore.team1Games < 5) return false;

  return true;
}

export function getMatchWinner(sets: SetScore[], setsToWin: number): 1 | 2 | null {
  let team1Sets = 0;
  let team2Sets = 0;

  for (const set of sets) {
    const winner = getSetWinner(set);
    if (winner === 1) team1Sets++;
    if (winner === 2) team2Sets++;
  }

  if (team1Sets >= setsToWin) return 1;
  if (team2Sets >= setsToWin) return 2;
  return null;
}

export function getSetsScore(sets: SetScore[]): [number, number] {
  let team1 = 0;
  let team2 = 0;
  for (const set of sets) {
    const winner = getSetWinner(set);
    if (winner === 1) team1++;
    if (winner === 2) team2++;
  }
  return [team1, team2];
}

export function formatSetScore(set: SetScore): string {
  let score = `${set.team1Games}-${set.team2Games}`;
  if (set.tiebreak) {
    const loserTB = Math.min(set.tiebreak.team1Points, set.tiebreak.team2Points);
    score += `(${loserTB})`;
  }
  return score;
}
