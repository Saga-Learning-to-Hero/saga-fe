"use client";

import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { resolveCitationHref, CITATION_DISABLED_REASON } from "../lib/citation-target";
import type { AssistantCitation } from "../types/project-assistant";

interface AssistantCitationChipProps {
  citation: AssistantCitation;
  role: "STUDENT" | "LECTURER";
  courseId: string;
  teamId: string | null;
}

export function AssistantCitationChip({
  citation,
  role,
  courseId,
  teamId,
}: AssistantCitationChipProps) {
  const target = resolveCitationHref(citation, { role, courseId, teamId });
  const label = citation.label || "Nguồn";

  if ("href" in target) {
    return (
      <Link
        href={target.href}
        prefetch={true}
        className="inline-flex max-w-full items-center rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium text-primary hover:bg-muted"
      >
        <span className="truncate">{label}</span>
      </Link>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-disabled="true"
        title={CITATION_DISABLED_REASON}
        className="inline-flex max-w-full cursor-not-allowed items-center rounded-lg border border-dashed border-border px-2 py-1 text-xs text-muted-foreground"
        onClick={(event) => event.preventDefault()}
      >
        <span className="truncate">{label}</span>
      </TooltipTrigger>
      <TooltipContent>{target.disabledReason}</TooltipContent>
    </Tooltip>
  );
}
