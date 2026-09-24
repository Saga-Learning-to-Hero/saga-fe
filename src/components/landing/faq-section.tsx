"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    q: "Làm sao SAGA phát hiện được sinh viên báo cáo khống trên Jira?",
    a: "SAGA ứng dụng thuật toán phát hiện bất thường MSR Anomaly (Mining Software Repositories) trên đồ thị Neo4j. Khi một Task Jira được đánh dấu trạng thái DONE nhưng không có bất kỳ Git Commit nào liên kết (0 commits linked), hệ thống sẽ tự động gắn cờ cảnh báo nghi vấn báo cáo khống để giảng viên và hội đồng kiểm tra đối soát.",
  },
  {
    q: "Sinh viên sử dụng Đồ thị Truy xuất để bảo vệ đồ án trước Hội đồng như thế nào?",
    a: "Trong buổi bảo vệ đồ án, sinh viên mở đồ thị Traceability Graph và rê chuột vào tài khoản của mình. Hiệu ứng Neighborhood Dimming sẽ tự động làm mờ các đỉnh không liên quan và làm sáng bừng duy nhất chuỗi đường đi minh chứng cá nhân: (:Student) → (:JiraTask) ← (:Commit), chứng minh 100% công sức bằng dữ liệu kỹ thuật thực tế.",
  },
  {
    q: "Mô hình Cổ phần Động Slicing Pie tính toán tỷ lệ đóng góp ra sao?",
    a: "SAGA không đánh giá cào bằng hay chỉ đếm số commit. Hệ thống phân bổ công sức động theo 4 nhóm tiêu chí chuẩn Kỹ thuật Phần mềm: Lập trình (Code), Kiểm thử (Test), Tài liệu kỹ thuật (Doc) và Nghiên cứu (Research), kết hợp với hệ số điều chỉnh từ kết quả đánh giá đồng đẳng (Peer Review) chéo ẩn danh qua từng Sprint.",
  },
  {
    q: "Trung tâm AI Hub hỗ trợ Giảng viên và Sinh viên như thế nào?",
    a: "SAGA AI Hub hỗ trợ phân tích đa tầng (Toàn khóa học, Nhóm dự án, Từng sinh viên) về tiến độ Sprint và các rủi ro kỹ thuật tiềm ẩn. Đồng thời, AI tự động quét code diff và commit để đề xuất phân loại sản phẩm bàn giao khớp với Chuẩn đầu ra môn học (CLO) trong Đề cương chi tiết (Syllabus), hỗ trợ cơ chế bảo mật khóa riêng BYOK.",
  },
  {
    q: "Dữ liệu đánh giá của SAGA có thể bị làm giả hoặc can thiệp trái phép không?",
    a: "Hoàn toàn không. SAGA áp dụng kiến trúc Polyglot Persistence với nhật ký kiểm toán MongoDB Audit Trail bất biến ghi nhận mọi thao tác từ Webhook GitHub/Jira và hoạt động của người dùng. Mọi minh chứng kỹ thuật đều được neo chặt vào mã băm Commit SHA của Git, đảm bảo tính liêm chính học thuật cao nhất.",
  },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="hoi-dap" className="py-24 border-t border-border/80 bg-muted/20 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2.5 max-w-xl mx-auto">
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-xs font-semibold">
            Hỏi đáp Thường gặp
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Giải đáp Thắc mắc về SAGA
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Những câu hỏi phổ biến nhất về cơ chế đánh giá liên tục, minh chứng đồ thị và bảo vệ đồ án tốt nghiệp.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border/80 bg-card overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base leading-snug">{faq.q}</span>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
