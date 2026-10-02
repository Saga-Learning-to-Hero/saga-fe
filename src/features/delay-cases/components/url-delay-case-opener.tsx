"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDelayCaseDetail } from "../hooks/use-delay-cases";
import { DelayCaseDetailModal } from "./delay-case-detail-modal";

export function UrlDelayCaseOpener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const caseId = searchParams.get("caseId") || searchParams.get("delayCaseId");
  const projectId = searchParams.get("projectId");

  const { data: delayCase } = useDelayCaseDetail(projectId || "", caseId || "");

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("caseId");
    params.delete("delayCaseId");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const isOpen = !!(caseId && projectId && delayCase);

  if (!isOpen || !delayCase) return null;

  return (
    <DelayCaseDetailModal
      delayCase={delayCase}
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
}
