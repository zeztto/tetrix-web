import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { ScoreEntry } from '@/lib/storage';

interface LeaderboardProps {
  open: boolean;
  onClose: () => void;
  leaderboard: ScoreEntry[];
}

export function Leaderboard({ open, onClose, leaderboard }: LeaderboardProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">순위표</DialogTitle>
          <DialogDescription className="sr-only">이 브라우저에 저장된 상위 기록</DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          {leaderboard.length === 0 ? (
            <p className="text-center text-neutral-500 py-4">아직 기록이 없습니다!</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-neutral-500 border-b">
                  <th className="py-2 text-left w-8">#</th>
                  <th className="py-2 text-left">이름</th>
                  <th className="py-2 text-right">점수</th>
                  <th className="py-2 text-right">레벨</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr key={i} className="border-b border-neutral-100">
                    <td className="py-2 text-neutral-400">{i + 1}</td>
                    <td className="py-2 font-medium">{entry.name}</td>
                    <td className="py-2 text-right tabular-nums">
                      {entry.score.toLocaleString()}
                    </td>
                    <td className="py-2 text-right tabular-nums">{entry.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
