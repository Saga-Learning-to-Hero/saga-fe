"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDelayCaseDetail } from "../hooks/use-delay-cases";
import { DelayCaseDetailModal } from "./delay-case-detail-modal";

export function UrlDelayCaseOpener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const caseId = searchParams.get("caseId") || searchParams.get("delayCaseId");
  const projectId = searchParams.get("projectId");

  const { data: delayCase } = useDelayCaseDetail(projectId || "", caseId || "");

  useEffect(() => {
    if (caseId && projectId && delayCase) {
      setIsOpen(true);
    }
  }, [caseId, projectId, delayCase]);

  const handleClose = () => {
    setIsOpen(false);
    
    // Remove query params related to delay cases
    const params = new URLSearchParams(searchParams.toString());
    params.delete("caseId");
    params.delete("delayCaseId");
    // Some routes might only exist to view a delay case (like the lecturer redirect)
    // We shouldn't delete projectId if we are on sprint-progress or something similar.
    
    // We will use replace so it doesn't push a new history state for closing a modal
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (!isOpen || !delayCase) return null;

  return (
    <DelayCaseDetailModal
      delayCase={delayCase}
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
}
