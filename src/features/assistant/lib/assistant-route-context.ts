export interface AssistantRouteContext {
  role: "STUDENT" | "LECTURER";
  courseId: string;
  teamId: string | null;
}

export function resolveAssistantRouteContext(input: {
  role?: string | null;
  pathname: string;
  searchParams: { get(name: string): string | null };
}): AssistantRouteContext | null {
  const role = input.role?.trim().toUpperCase();
  if (role === "ADMIN" || role !== "STUDENT" && role !== "LECTURER") return null;

  if (role === "LECTURER") {
    const match = input.pathname.match(/^\/lecturer\/courses\/([^/]+)(?:\/(.*))?$/);
    if (!match) return null;
    const courseId = decodeURIComponent(match[1] ?? "").trim();
    if (!courseId) return null;
    const rest = match[2] ?? "";
    const teamMatch = rest.match(/^teams\/([^/]+)/);
    const rawTeamId = teamMatch ? decodeURIComponent(teamMatch[1] ?? "").trim() : "";
    const teamId = rawTeamId && rawTeamId !== "select" ? rawTeamId : null;
    return { role: "LECTURER", courseId, teamId };
  }

  if (input.pathname === "/student/courses" || input.pathname.startsWith("/student/courses/")) {
    return null;
  }
  if (!input.pathname.startsWith("/student")) return null;
  const courseId = input.searchParams.get("courseId")?.trim() || "";
  if (!courseId) return null;
  return { role: "STUDENT", courseId, teamId: null };
}
