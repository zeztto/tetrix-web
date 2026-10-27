export interface ScoreEntry {
  name: string;
  score: number;
  level: number;
  lines: number;
  date: string;
}

const STORAGE_KEY = 'tetris_leaderboard';
const MAX_ENTRIES = 10;
const MAX_STORED_CHARACTERS = 16_384;

function isScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isEntry(value: unknown): value is ScoreEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<ScoreEntry>;
  return typeof entry.name === 'string' && entry.name.trim().length > 0
    && entry.name.length <= 10 && isScore(entry.score)
    && isScore(entry.level) && entry.level > 0 && isScore(entry.lines)
    && typeof entry.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.date)
    && Number.isFinite(Date.parse(entry.date))
    && new Date(entry.date).toISOString().slice(0, 10) === entry.date;
}

function normalize(entry: ScoreEntry): ScoreEntry {
  return { name: entry.name.trim(), score: entry.score, level: entry.level,
    lines: entry.lines, date: entry.date };
}

export function getLeaderboard(): ScoreEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data || data.length > MAX_STORED_CHARACTERS) return [];
    const parsed: unknown = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEntry).map(normalize)
      .sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function saveScore(entry: ScoreEntry): boolean {
  if (!isEntry(entry)) return false;
  try {
    const leaderboard = [...getLeaderboard(), normalize(entry)];
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard.slice(0, MAX_ENTRIES)));
    return true;
  } catch {
    return false;
  }
}

export function isHighScore(score: number): boolean {
  if (!isScore(score)) return false;
  const leaderboard = getLeaderboard();
  if (leaderboard.length < MAX_ENTRIES) return score > 0;
  const lowestScore = leaderboard[leaderboard.length - 1]?.score ?? 0;
  return score > lowestScore;
}

export function clearLeaderboard(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
