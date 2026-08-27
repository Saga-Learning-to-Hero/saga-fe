"use client";

import { useState } from "react";
import { ChevronDownIcon, HelpCircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    q: "Sinh viên có thể spam commit ảo để lấy điểm cao không?",
    a: "Không thể. SAGA kết hợp kiểm tra regex quy chuẩn (SAGA-xx), đối soát trực tiếp với Jira Task hợp lệ và phân tích ngữ nghĩa Git Diff để loại trừ hoàn toàn các commit rác, commit khoảng trắng hoặc commit sao chép.",
  },
  {
    q: "Mô hình Slicing Pie tính điểm công sức như thế nào?",
    a: "Điểm số được tính toán động theo 4 trọng số chuẩn của học phần: Lập trình (Code), Kiểm thử (Test), Tài liệu kỹ thuật (Doc) và Nghiên cứu (Research). Tỷ lệ đóng góp được cập nhật liên tục qua từng Sprint thay vì dồn về cuối kỳ.",
  },
  {
    q: "Hệ thống phát hiện thành viên bỏ nhóm (Ghosting) bằng cách nào?",
    a: "SAGA ứng dụng thuật toán phân tích mạng xã hội (SNA Graph) trên Neo4j để đo lường chu kỳ trao đổi, review mã nguồn và tiến độ công việc. Nếu một thành viên im lặng bất thường qua nhiều ngày, hệ thống sẽ tự động phát tín hiệu cảnh báo cho trưởng nhóm và giảng viên.",
  },
  {
    q: "Quá trình tích hợp một nhóm học phần mất bao lâu?",
    a: "Chỉ mất khoảng 60 giây. Trưởng nhóm chỉ cần dán URL Webhook của SAGA vào cài đặt GitHub Repository và cấp quyền Jira Cloud Project, toàn bộ dữ liệu sẽ tự động đồng bộ tức thì.",
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
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-xs">
            Hỏi đáp Thường gặp
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Giải đáp Thắc mắc về SAGA
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Những câu hỏi phổ biến nhất về cơ chế đánh giá liên tục và tính minh bạch dữ liệu.
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
                    className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""
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
