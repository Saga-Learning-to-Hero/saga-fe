const ASSIGNEE_AVATAR_STYLES = [
  "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
] as const;

/** A compact, readable label for assignee avatars (e.g. "Lê Hoàng Hải" → "LH"). */
export function getAssigneeInitials(name?: string | null): string {
  const words = (name || "")
    .replace(/\([^)]*\)/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

/** Keeps the same assignee recognisable with the same colour across Sprint views. */
export function getAssigneeAvatarClass(assigneeId?: string | null): string {
  const identity = assigneeId || "unassigned";
  const hash = Array.from(identity).reduce((total, character) => total + character.charCodeAt(0), 0);
  return ASSIGNEE_AVATAR_STYLES[hash % ASSIGNEE_AVATAR_STYLES.length];
}
