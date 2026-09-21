import { getActivitySeriesTotals } from "../lib/lecturer-dashboard-format";
import type { LecturerDashboardActivityPoint } from "../types/lecturer-course-dashboard";

interface CourseDashboardSparklineProps {
  series: LecturerDashboardActivityPoint[];
}

export function CourseDashboardSparkline({ series }: CourseDashboardSparklineProps) {
  const totals = getActivitySeriesTotals(series);
  if (totals.length === 0) return null;

  const width = 120;
  const height = 28;
  const max = Math.max(...totals, 1);
  const step = totals.length > 1 ? width / (totals.length - 1) : width;
  const points = totals
    .map((value, index) => {
      const x = totals.length === 1 ? width / 2 : index * step;
      const y = height - (value / max) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-7 w-[120px] text-primary"
      role="img"
      aria-label="Hoạt động theo ngày trong sprint hiện tại"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}
