export default function normoliseProgress(value: number): number {
  if (0 > value) return 0;
  if (1 < value) return 1;
  return value;
}
