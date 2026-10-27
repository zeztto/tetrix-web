interface ScoreBoardProps {
  score: number;
  level: number;
  lines: number;
}

function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

export function ScoreBoard({ score, level, lines }: ScoreBoardProps) {
  return (
    <div className="flex flex-col gap-2 text-center">
      <div className="bg-card rounded-lg p-2 border">
        <div className="text-[10px] font-bold text-neutral-500">점수</div>
        <div className="text-sm font-bold tabular-nums">{formatNumber(score)}</div>
      </div>
      <div className="bg-card rounded-lg p-2 border">
        <div className="text-[10px] font-bold text-neutral-500">레벨</div>
        <div className="text-sm font-bold tabular-nums">{level}</div>
      </div>
      <div className="bg-card rounded-lg p-2 border">
        <div className="text-[10px] font-bold text-neutral-500">줄</div>
        <div className="text-sm font-bold tabular-nums">{formatNumber(lines)}</div>
      </div>
    </div>
  );
}
