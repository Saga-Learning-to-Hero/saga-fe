"use client";

import { UsersIcon, Loader2Icon, InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { showErrorToast } from "@/lib/api-error";
import { useCourseAiTeamAccess, useSetCourseAiTeamAccess } from "../../hooks/use-commit-review";
import { teamKeyStatusView } from "../commit-review/team-ai-key-card";

const EFFECTIVE_LABEL: Record<string, { label: string; className: string }> = {
  TEAM: { label: "Key của nhóm", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  COURSE: { label: "Key của lớp", className: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  NONE: { label: "Chưa dùng được AI", className: "bg-muted text-muted-foreground" },
};

/** Lecturer: teams run AI with their leader's key; pick which teams may fall back to the course key. */
export function CourseAiTeamAccessCard({ courseId }: { courseId: string }) {
  const { data, isLoading, isError } = useCourseAiTeamAccess(courseId);
  const setAccess = useSetCourseAiTeamAccess(courseId);

  const toggle = (projectId: string, allowed: boolean) =>
    setAccess.mutate(
      { projectId, allowed },
      { onError: (error) => showErrorToast("Không cập nhật được quyền dùng key của lớp.", error) }
    );

  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4" data-testid="course-ai-team-access">
      <div className="space-y-1">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <UsersIcon className="w-4 h-4 text-primary" />
          5. Nhóm được dùng key của lớp
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Mỗi nhóm dùng AI bằng key do trưởng nhóm tự nhập (trang Dự án → &quot;Key AI của nhóm&quot;). Key của lớp chỉ là phương án dự phòng
          cho các nhóm được tick dưới đây. Giảng viên hỏi trợ lý chat bằng key hệ thống.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> Đang tải danh sách nhóm...
        </div>
      )}
      {isError && <p className="text-xs text-destructive">Không tải được danh sách nhóm.</p>}

      {data && (
        <>
          {!data.courseKeyConfigured && (
            <p className="text-xs flex items-start gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-amber-800 dark:text-amber-200">
              <InfoIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Lớp chưa có key chính (mục 1–2), nên tick nhóm lúc này chưa có tác dụng.
            </p>
          )}
          {data.teams.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Lớp chưa có nhóm nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border/60">
                    <th className="py-2 pr-3 font-semibold">Nhóm</th>
                    <th className="py-2 pr-3 font-semibold">Key riêng của nhóm</th>
                    <th className="py-2 pr-3 font-semibold">Đang dùng</th>
                    <th className="py-2 font-semibold text-center">Cho dùng key lớp</th>
                  </tr>
                </thead>
                <tbody>
                  {data.teams.map((team) => {
                    const keyView = teamKeyStatusView(team.teamKey.configured ? team.teamKey.status : null);
                    const effective = EFFECTIVE_LABEL[team.effectiveKey] ?? EFFECTIVE_LABEL.NONE;
                    const pending = setAccess.isPending && setAccess.variables?.projectId === team.projectId;
                    return (
                      <tr key={team.teamId} className="border-b border-border/40 last:border-0">
                        <td className="py-2.5 pr-3">
                          <div className="font-semibold">{team.teamName ?? `Nhóm ${team.teamNo ?? ""}`}</div>
                          {team.projectName && <div className="text-muted-foreground">{team.projectName}</div>}
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className={cn("font-bold px-2 py-0.5 rounded-full", keyView.className)}>{keyView.label}</span>
                          {team.teamKey.configured && (
                            <div className="text-muted-foreground mt-1">
                              {team.teamKey.provider} · {team.teamKey.modelId}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className={cn("font-bold px-2 py-0.5 rounded-full", effective.className)}>{effective.label}</span>
                        </td>
                        <td className="py-2.5 text-center">
                          {team.projectId ? (
                            pending ? (
                              <Loader2Icon className="w-4 h-4 animate-spin inline" />
                            ) : (
                              <input
                                type="checkbox"
                                aria-label={`Cho ${team.teamName ?? "nhóm"} dùng key của lớp`}
                                checked={team.courseKeyAllowed}
                                onChange={(event) => toggle(team.projectId as string, event.target.checked)}
                                className="w-4 h-4 accent-primary cursor-pointer"
                              />
                            )
                          ) : (
                            <span className="text-muted-foreground">Chưa có dự án</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
