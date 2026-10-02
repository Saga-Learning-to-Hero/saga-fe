import { lecturerCourseGraphPath, lecturerCourseTeamMemberPath, lecturerCourseTeamPath } from "@/features/lecturer/courses/lib/course-routes";
import { studentCourseLink } from "@/features/student/courses/hooks/use-student-course-context";
import type { AssistantCitation } from "../types/project-assistant";

export const CITATION_DISABLED_REASON = "Không đủ thông tin để mở nguồn";

export type CitationTarget =
  | { href: string }
  | { disabledReason: string };

function disabled(): CitationTarget {
  return { disabledReason: CITATION_DISABLED_REASON };
}

function present(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export function resolveCitationHref(
  citation: Pick<AssistantCitation, "kind" | "id" | "taskId" | "sha">,
  context: { role: "STUDENT" | "LECTURER"; courseId: string; teamId: string | null }
): CitationTarget {
  const courseId = present(context.courseId);
  const teamId = present(context.teamId);
  const id = present(citation.id);
  const taskId = present(citation.taskId);
  const sha = present(citation.sha);
  if (!courseId) return disabled();

  if (context.role === "STUDENT") {
    if (citation.kind === "TASK") {
      if (!id) return disabled();
      return { href: studentCourseLink("/student/sprint-progress", courseId, { taskId: id }) };
    }
    if (citation.kind === "COMMIT") {
      if (!sha) return disabled();
      return {
        href: studentCourseLink("/student/commits", courseId, { commitHash: sha, commitId: id }),
      };
    }
    if (citation.kind === "MEMBER") {
      if (!id) return disabled();
      return { href: studentCourseLink("/student/dashboard", courseId, { memberId: id }) };
    }
    if (citation.kind === "DELAY_CASE") {
      if (!id) return disabled();
      return {
        href: studentCourseLink("/student/sprint-progress", courseId, {
          taskId,
          delayCaseId: id,
        }),
      };
    }
    return disabled();
  }

  if (!teamId) return disabled();
  if (citation.kind === "TASK") {
    if (!id) return disabled();
    return { href: lecturerCourseGraphPath(courseId, { teamId, taskId: id }) };
  }
  if (citation.kind === "COMMIT") {
    if (!sha) return disabled();
    return { href: lecturerCourseGraphPath(courseId, { teamId, commitHash: sha, commitId: id }) };
  }
  if (citation.kind === "MEMBER") {
    if (!id) return disabled();
    return { href: lecturerCourseTeamMemberPath(courseId, teamId, id) };
  }
  if (citation.kind === "DELAY_CASE") {
    if (!id) return disabled();
    return { href: lecturerCourseTeamPath(courseId, teamId, { delayCaseId: id }) };
  }
  return disabled();
}
