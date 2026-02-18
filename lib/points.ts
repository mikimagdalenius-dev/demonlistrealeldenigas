export function pointsFromDemon(position: number, difficulty: number): number {
  const rankScore = Math.max(1, 101 - position);
  const difficultyScore = Math.max(0, difficulty) * 10;
  return rankScore + difficultyScore;
}
