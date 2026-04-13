import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import type {
  Player,
  Match2vs2,
  Tournament,
  AmericanoTournament,
  GameRecord,
} from '@/types';

// Strip undefined values (Firestore rejects them)
function clean<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

interface GameStore {
  players: Player[];
  games: GameRecord[];

  // Internal setters (used by FirestoreProvider)
  _setPlayers: (players: Player[]) => void;
  _setGames: (games: GameRecord[]) => void;

  // Player actions
  addPlayer: (name: string) => Player;
  removePlayer: (id: string) => void;
  getPlayer: (id: string) => Player | undefined;

  // Game actions
  addGame: (game: GameRecord) => void;
  updateGame: (id: string, updater: (game: GameRecord) => GameRecord) => void;
  removeGame: (id: string) => void;
  getGame: (id: string) => GameRecord | undefined;

  // Ranking helpers
  getPlayerWins: (playerId: string) => {
    gamesPlayed: number;
    americanoPoints: number;
    americanoWins: number;
    americanoTournamentWins: number;
    twovstwoWins: number;
    tournamentWins: number;
  };
}

export const useGameStore = create<GameStore>()((set, get) => ({
  players: [],
  games: [],

  _setPlayers: (players) => set({ players }),
  _setGames: (games) => set({ games }),

  addPlayer: (name: string) => {
    const player: Player = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ players: [...state.players, player] }));
    setDoc(doc(db, 'players', player.id), clean(player)).catch(console.error);
    return player;
  },

  removePlayer: (id: string) => {
    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
    }));
    deleteDoc(doc(db, 'players', id)).catch(console.error);
  },

  getPlayer: (id: string) => {
    return get().players.find((p) => p.id === id);
  },

  addGame: (game: GameRecord) => {
    set((state) => ({ games: [...state.games, game] }));
    setDoc(doc(db, 'games', game.id), clean(game)).catch(console.error);
  },

  updateGame: (id: string, updater: (game: GameRecord) => GameRecord) => {
    let updatedGame: GameRecord | undefined;
    set((state) => ({
      games: state.games.map((g) => {
        if (g.id === id) {
          updatedGame = updater(g);
          return updatedGame;
        }
        return g;
      }),
    }));
    if (updatedGame) {
      setDoc(doc(db, 'games', id), clean(updatedGame)).catch(console.error);
    }
  },

  removeGame: (id: string) => {
    set((state) => ({
      games: state.games.filter((g) => g.id !== id),
    }));
    deleteDoc(doc(db, 'games', id)).catch(console.error);
  },

  getGame: (id: string) => {
    return get().games.find((g) => g.id === id);
  },

      getPlayerWins: (playerId: string) => {
        const { games } = get();
        let gamesPlayed = 0;
        let americanoPoints = 0;
        let americanoWins = 0;
        let americanoTournamentWins = 0;
        let twovstwoWins = 0;
        let tournamentWins = 0;

        for (const game of games) {
          if (game.type === '2vs2') {
            const m = game as Match2vs2;
            const isInGame =
              m.team1.includes(playerId) || m.team2.includes(playerId);
            if (!isInGame) continue;
            if (m.status === 'completed') {
              gamesPlayed++;
              if (m.winner === 1 && m.team1.includes(playerId)) twovstwoWins++;
              if (m.winner === 2 && m.team2.includes(playerId)) twovstwoWins++;
            }
          }

          if (game.type === '2vs2-tournament') {
            const t = game as Tournament;
            if (!t.players.includes(playerId)) continue;
            const completedMatches = t.matches.filter(
              (m) => m.status === 'completed'
            );
            for (const match of completedMatches) {
              const team1 = t.teams.find((tm) => tm.id === match.team1Id);
              const team2 = t.teams.find((tm) => tm.id === match.team2Id);
              if (
                team1?.players.includes(playerId) ||
                team2?.players.includes(playerId)
              ) {
                gamesPlayed++;
              }
            }
            // Check if player's team won the tournament
            if (t.status === 'completed' && t.winner) {
              const winnerTeam = t.teams.find((tm) => tm.id === t.winner);
              if (winnerTeam?.players.includes(playerId)) {
                tournamentWins++;
              }
            }
          }

          if (
            game.type === 'americano-klein' ||
            game.type === 'americano-gross'
          ) {
            const a = game as AmericanoTournament;
            if (!a.players.includes(playerId)) continue;

            for (const ag of a.games) {
              if (ag.status !== 'completed') continue;
              const inTeam1 = ag.team1.includes(playerId);
              const inTeam2 = ag.team2.includes(playerId);
              if (!inTeam1 && !inTeam2) continue;

              gamesPlayed++;
              if (inTeam1) {
                americanoPoints += ag.team1Score;
                if (ag.team1Score > ag.team2Score) americanoWins++;
              }
              if (inTeam2) {
                americanoPoints += ag.team2Score;
                if (ag.team2Score > ag.team1Score) americanoWins++;
              }
            }

            // Check if player won the americano tournament (most points)
            if (a.status === 'completed') {
              const playerScores = new Map<string, number>();
              for (const ag of a.games) {
                if (ag.status !== 'completed') continue;
                for (const pid of ag.team1) {
                  playerScores.set(pid, (playerScores.get(pid) || 0) + ag.team1Score);
                }
                for (const pid of ag.team2) {
                  playerScores.set(pid, (playerScores.get(pid) || 0) + ag.team2Score);
                }
              }
              const maxScore = Math.max(...playerScores.values());
              const myScore = playerScores.get(playerId) || 0;
              if (myScore === maxScore && myScore > 0) {
                americanoTournamentWins++;
              }
            }
          }
        }

        return {
          gamesPlayed,
          americanoPoints,
          americanoWins,
          americanoTournamentWins,
          twovstwoWins,
          tournamentWins,
        };
      },
    })
  );
