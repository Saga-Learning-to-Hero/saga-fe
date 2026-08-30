import { Metadata } from "next";
import { TraceabilityGraphView } from "@/features/graph/components/traceability-graph-view";

export const metadata: Metadata = {
  title: "Đồ thị Truy xuất Traceability | SAGA",
  description: "Trực quan hóa đồ thị mạng lưới Neo4j chứng minh công sức và liên kết giữa Jira Task và Git Commit.",
};

export default function StudentGraphPage() {
  return <TraceabilityGraphView />;
}
