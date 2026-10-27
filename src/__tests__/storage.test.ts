/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { getLeaderboard, saveScore, isHighScore, clearLeaderboard } from '../lib/storage';

describe('storage', () => {
  beforeEach(() => {
    clearLeaderboard();
  });

  describe('getLeaderboard', () => {
    it('should return empty array for empty leaderboard', () => {
      const leaderboard = getLeaderboard();
      expect(leaderboard).toEqual([]);
    });
  });

  describe('saveScore', () => {
    it('should save score to leaderboard', () => {
      saveScore({
        name: 'Player1',
        score: 1000,
        level: 2,
        lines: 10,
        date: '2024-01-01',
      });

      const leaderboard = getLeaderboard();
      expect(leaderboard).toHaveLength(1);
      expect(leaderboard[0].name).toBe('Player1');
      expect(leaderboard[0].score).toBe(1000);
    });

    it('should sort scores in descending order', () => {
      saveScore({ name: 'A', score: 500, level: 1, lines: 5, date: '2024-01-01' });
      saveScore({ name: 'B', score: 1000, level: 2, lines: 10, date: '2024-01-01' });
      saveScore({ name: 'C', score: 750, level: 1, lines: 7, date: '2024-01-01' });

      const leaderboard = getLeaderboard();
      expect(leaderboard[0].name).toBe('B');
      expect(leaderboard[1].name).toBe('C');
      expect(leaderboard[2].name).toBe('A');
    });

    it('should limit to 10 entries', () => {
      for (let i = 0; i < 15; i++) {
        saveScore({
          name: `Player${i}`,
          score: i * 100,
          level: 1,
          lines: i,
          date: '2024-01-01',
        });
      }

      const leaderboard = getLeaderboard();
      expect(leaderboard).toHaveLength(10);
      expect(leaderboard[0].score).toBe(1400);
    });
  });

  describe('isHighScore', () => {
    it('should return true for any positive score on empty leaderboard', () => {
      expect(isHighScore(100)).toBe(true);
    });

    it('should return false for 0 score', () => {
      expect(isHighScore(0)).toBe(false);
    });

    it('should return true if score beats lowest entry', () => {
      for (let i = 0; i < 10; i++) {
        saveScore({
          name: `Player${i}`,
          score: (i + 1) * 100,
          level: 1,
          lines: i,
          date: '2024-01-01',
        });
      }

      expect(isHighScore(150)).toBe(true);
      expect(isHighScore(50)).toBe(false);
    });

    it('should return true if leaderboard not full', () => {
      saveScore({ name: 'A', score: 1000, level: 1, lines: 10, date: '2024-01-01' });
      expect(isHighScore(100)).toBe(true);
    });
  });
});
