"use client";
import { getLevelData, getXpProgress, getNextLevel } from "@/lib/levels";
import { Zap } from "lucide-react";

type Props = {
  totalXp: number;
  level: number;
  compact?: boolean;
};

export function LevelProgress({ totalXp, level, compact = false }: Props) {
  const levelData = getLevelData(level);
  const progress = getXpProgress(totalXp);
  const nextLevel = getNextLevel(totalXp);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">{levelData.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium" style={{ color: levelData.color }}>Lv.{level} {levelData.name}</span>
            {nextLevel && <span className="text-muted-foreground">{progress.xpInLevel}/{progress.xpNeeded} XP</span>}
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress.percentage}%`, backgroundColor: levelData.color }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border bg-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{levelData.emoji}</span>
          <div>
            <p className="font-bold text-lg" style={{ color: levelData.color }}>Level {level}</p>
            <p className="text-sm text-muted-foreground">{levelData.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-sm flex items-center gap-1">
            <Zap className="h-4 w-4 text-yellow-500" />
            {totalXp.toLocaleString()} XP
          </p>
          {nextLevel && (
            <p className="text-xs text-muted-foreground">
              {(nextLevel.minXp - totalXp).toLocaleString()} XP to Level {nextLevel.level}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{progress.xpInLevel.toLocaleString()} / {progress.xpNeeded.toLocaleString()} XP</span>
          <span>{progress.percentage}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress.percentage}%`, backgroundColor: levelData.color }}
          />
        </div>
        {nextLevel && (
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span style={{ color: levelData.color }}>{levelData.name}</span>
            <span style={{ color: nextLevel.color }}>{nextLevel.name} {nextLevel.emoji}</span>
          </div>
        )}
      </div>
    </div>
  );
}
