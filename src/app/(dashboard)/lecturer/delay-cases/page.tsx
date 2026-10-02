import { LecturerDelayQueueView } from "@/features/delay-cases/components/lecturer-delay-queue-view";

export const metadata = {
  title: "Hàng chờ Hồ sơ trễ hạn | SAGA",
  description: "Duyệt hồ sơ trễ hạn của sinh viên",
};

export default function LecturerDelayCasesPage() {
  return <LecturerDelayQueueView />;
}
