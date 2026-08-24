import { EyeIcon, ZapIcon, ScaleIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const giaiPhap = [
  {
    icon: EyeIcon,
    tieu_de: "Minh bạch tuyệt đối",
    mo_ta:
      "Mọi đóng góp đều được ghi nhận từ Git commit, thời gian làm việc đến chất lượng code. Không còn chỗ cho sự không công bằng.",
  },
  {
    icon: ZapIcon,
    tieu_de: "Tự động hoàn toàn",
    mo_ta:
      "SAGA tự động thu thập dữ liệu từ GitHub, phân tích bằng AI và cập nhật điểm đánh giá liên tục, không cần can thiệp thủ công.",
  },
  {
    icon: ScaleIcon,
    tieu_de: "Khách quan, dựa trên dữ liệu",
    mo_ta:
      "Thay vì bình chọn cảm tính, SAGA dùng mô hình Slicing Pie và đồ thị truy vết để tính toán điểm số công bằng, minh bạch.",
  },
];

export function WhySagaSection() {
  return (
    <section className="py-24 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Tại sao cần SAGA?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Phương pháp đánh giá đồng đẳng truyền thống dễ bị thao túng và không phản ánh
            đúng thực tế. Sinh viên chăm chỉ bị đánh giá ngang bằng người không đóng góp.
            SAGA giải quyết triệt để vấn đề này.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {giaiPhap.map((item) => (
            <Card
              key={item.tieu_de}
              className="border-border transition-normal hover:shadow-saga-md hover:border-primary/20 group"
            >
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 transition-fast group-hover:bg-primary/20">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-base">{item.tieu_de}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.mo_ta}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
