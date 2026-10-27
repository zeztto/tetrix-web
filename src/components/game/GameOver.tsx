import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GameOverProps {
  open: boolean;
  score: number;
  level: number;
  lines: number;
  isHighScore: boolean;
  onRestart: () => void;
  onSaveName: (name: string) => boolean;
  onViewLeaderboard: () => void;
}

export function GameOver({
  open,
  score,
  level,
  lines,
  isHighScore,
  onRestart,
  onSaveName,
  onViewLeaderboard,
}: GameOverProps) {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const handleSave = () => {
    if (name.trim()) {
      const saved = onSaveName(name.trim());
      setSaved(saved);
      setSaveFailed(!saved);
    }
  };

  const handleRestart = () => {
    setName('');
    setSaved(false);
    setSaveFailed(false);
    onRestart();
  };

  return (
    <Dialog open={open}>
      <DialogContent hideCloseButton className="max-w-xs" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">게임 오버</DialogTitle>
          <DialogDescription className="sr-only">최종 점수와 순위 기록</DialogDescription>
        </DialogHeader>

        <div className="text-center space-y-2 py-4">
          <div className="text-3xl font-bold">{score.toLocaleString()}</div>
          <div className="text-neutral-500">
            레벨 {level} • {lines}줄
          </div>
        </div>

        {isHighScore && !saved && (
          <div className="space-y-2">
            <p className="text-center text-green-600 font-medium">신기록!</p>
            <Input
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={10}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <Button onClick={handleSave} className="w-full" disabled={!name.trim()}>
              점수 저장
            </Button>
          </div>
        )}

        {saved && (
          <p className="text-center text-green-600 font-medium">점수 저장 완료!</p>
        )}

        {saveFailed && (
          <p role="alert" className="text-center text-red-700">이 브라우저에 점수를 저장하지 못했습니다.</p>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleRestart} size="lg" className="w-full">
            다시 하기
          </Button>
          <Button variant="outline" onClick={onViewLeaderboard} className="w-full">
            순위표 보기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
