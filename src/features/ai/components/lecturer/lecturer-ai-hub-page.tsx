"use client";

import { useState } from "react";
import { SparklesIcon, FileTextIcon, KeyRoundIcon, GraduationCapIcon } from "lucide-react";
import { CourseAiSettingsCard } from "./course-ai-settings-card";
import { CourseAiCredentialsCard } from "./course-ai-credentials-card";
import { CourseAiProgressTab } from "./course-ai-progress-tab";
import { CourseAiAcademicReviewTab } from "./course-ai-academic-review-tab";

interface LecturerAiHubPageProps {
  courseId: string;
}

export function LecturerAiHubPage({ courseId }: LecturerAiHubPageProps) {
  const [activeTab, setActiveTab] = useState<"progress" | "credentials" | "academic">("progress");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-linear-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
            <SparklesIcon className="w-3.5 h-3.5" />
            Trung tâm Giám sát Trí tuệ Nhân tạo (SAGA AI Hub)
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Báo cáo Phân tích AI & Quản lý Mô hình
          </h1>
          <p className="text-xs text-muted-foreground">
            Tận dụng mô hình ngôn ngữ lớn (LLM) để đánh giá chất lượng mã nguồn, kiểm tra độ lệch task Jira, phân loại mục tiêu đề cương và phát hiện rủi ro trễ hạn.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-card border border-border shrink-0">
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === "progress"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
          >
            <FileTextIcon className="w-3.5 h-3.5" />
            Báo cáo Tiến độ
          </button>
          <button
            onClick={() => setActiveTab("credentials")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === "credentials"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
          >
            <KeyRoundIcon className="w-3.5 h-3.5" />
            Cấu hình BYOK & API Key
          </button>
          <button
            onClick={() => setActiveTab("academic")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === "academic"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
          >
            <GraduationCapIcon className="w-3.5 h-3.5" />
            Phân loại Học thuật
          </button>
        </div>
      </div>

      {activeTab === "progress" && <CourseAiProgressTab courseId={courseId} />}

      {activeTab === "credentials" && (
        <div className="space-y-6">
          <CourseAiSettingsCard courseId={courseId} />
          <CourseAiCredentialsCard
            courseId={courseId}
            role="PRIMARY"
            title="Khóa API Mô hình Phân tích Chính (Primary LLM)"
            description="Mô hình thực thi chính cho việc phân tích code diff, chấm điểm commit, đánh giá task Jira và sinh báo cáo."
          />
          <CourseAiCredentialsCard
            courseId={courseId}
            role="SECONDARY"
            title="Khóa API Mô hình Hội chẩn Phụ (Secondary Brain - Tùy chọn)"
            description="Mô hình đối chứng độc lập nhằm phát hiện bất đồng quan điểm và thẩm định chéo với mô hình chính."
          />
        </div>
      )}

      {activeTab === "academic" && <CourseAiAcademicReviewTab courseId={courseId} />}
    </div>
  );
}
