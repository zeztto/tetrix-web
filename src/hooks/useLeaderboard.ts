import { useState, useCallback } from 'react';
import { getLeaderboard, saveScore, isHighScore, type ScoreEntry } from '@/lib/storage';

interface UseLeaderboardReturn {
  leaderboard: ScoreEntry[];
  addScore: (entry: Omit<ScoreEntry, 'date'>) => boolean;
  checkHighScore: (score: number) => boolean;
  refresh: () => void;
}

export function useLeaderboard(): UseLeaderboardReturn {
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>(getLeaderboard);

  const refresh = useCallback(() => {
    setLeaderboard(getLeaderboard());
  }, []);

  const addScore = useCallback(
    (entry: Omit<ScoreEntry, 'date'>) => {
      const fullEntry: ScoreEntry = {
        ...entry,
        date: new Date().toISOString().split('T')[0],
      };
      const saved = saveScore(fullEntry);
      refresh();
      return saved;
    },
    [refresh]
  );

  const checkHighScore = useCallback((score: number) => {
    return isHighScore(score);
  }, []);

  return { leaderboard, addScore, checkHighScore, refresh };
}
