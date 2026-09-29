/** Phần trăm nullable trên KPI cá nhân: không ép 0 khi backend trả null. */
export function formatStudentNullablePercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value) || !Number.isFinite(value)) {
    return "—";
  }
  return `${Math.round(value)}%`;
}
