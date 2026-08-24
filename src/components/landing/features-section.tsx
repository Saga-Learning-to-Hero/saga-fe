import { NetworkIcon, BotIcon, PieChartIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const tinhNang = [
  {
    icon: NetworkIcon,
    badge: "Neo4j · Cytoscape.js",
    tieu_de: "Đồ thị Truy vết Hoạt động",
    mo_ta:
      "SAGA xây dựng một đồ thị tri thức liên kết Sinh viên → Git Commit → File → Tính năng. Mỗi nút trên đồ thị là bằng chứng đóng góp có thể kiểm tra, không thể làm giả.",
    diem_noi_bat: [
      "Liên kết sinh viên với từng dòng code",
      "Phát hiện commit trùng lặp hoặc vô nghĩa",
      "Trực quan hóa bằng Cytoscape.js tương tác",
    ],
  },
  {
    icon: BotIcon,
    badge: "LLM · Git Diff Analysis",
    tieu_de: "Đánh giá Code bằng AI",
    mo_ta:
      "Tích hợp mô hình ngôn ngữ lớn (LLM) để phân tích Git Diff tự động. AI nhận xét chất lượng code, mức độ phức tạp, và khả năng hiểu vấn đề của sinh viên.",
    diem_noi_bat: [
      "Phân tích ngữ nghĩa của từng commit",
      "Phát hiện code copy-paste từ AI",
      "Gợi ý cải thiện tự động",
    ],
  },
  {
    icon: PieChartIcon,
    badge: "Slicing Pie Model",
    tieu_de: "Tính điểm Đóng góp Động",
    mo_ta:
      "Áp dụng mô hình Slicing Pie để tính toán tỷ lệ đóng góp động theo thời gian. Điểm số phản ánh chính xác khối lượng và chất lượng công việc thực tế.",
    diem_noi_bat: [
      "Trọng số theo độ khó của tác vụ",
      "Cập nhật realtime theo sprint",
      "Không thể can thiệp ngược dữ liệu",
    ],
  },
];

function FeatureRow({
  item,
  reversed,
}: {
  item: (typeof tinhNang)[0];
  reversed: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-center ${reversed ? "md:[direction:rtl]" : ""
        }`}
    >
      <div className={`space-y-5 ${reversed ? "md:[direction:ltr]" : ""}`}>
        <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
          {item.badge}
        </Badge>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-foreground">{item.tieu_de}</h3>
          <p className="text-muted-foreground leading-relaxed">{item.mo_ta}</p>
        </div>
        <ul className="space-y-2">
          {item.diem_noi_bat.map((diem) => (
            <li key={diem} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {diem}
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`rounded-2xl border border-border aspect-[4/3] flex flex-col items-center justify-center gap-3 ${reversed ? "md:[direction:ltr]" : ""
          }`}
        style={{
          background:
            "linear-gradient(145deg, var(--muted), oklch(from var(--saga-primary) l c h / 5%))",
        }}
      >
        <item.icon className="w-12 h-12 text-primary/30" strokeWidth={1} />
        <p className="text-xs text-muted-foreground">{item.tieu_de}</p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="tinh-nang" className="py-24 border-t border-border bg-muted/20">
      <div className="max-w-6xl mx-auto px-6 space-y-20">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-foreground">Tính năng cốt lõi</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Ba trụ cột công nghệ tạo nên hệ thống đánh giá toàn diện và đáng tin cậy.
          </p>
        </div>

        {tinhNang.map((item, idx) => (
          <FeatureRow key={item.tieu_de} item={item} reversed={idx % 2 !== 0} />
        ))}
      </div>
    </section>
  );
}
