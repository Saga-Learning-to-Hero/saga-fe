export function formatQueryUpdatedAt(timestamps: Array<number | undefined>): string | null {
  const latest = timestamps.reduce<number>((max, value) => {
    if (!value || value <= 0) return max;
    return Math.max(max, value);
  }, 0);

  if (!latest) return null;
  return new Date(latest).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
