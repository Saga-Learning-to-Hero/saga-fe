import { toast } from "sonner";

/** Asks whichever assistant launcher is on screen to open (the one that asked may be gone after navigation). */
export const ASSISTANT_OPEN_EVENT = "saga:assistant-open";
/** An answer arrived while the person was not looking at the assistant. */
export const ASSISTANT_ANSWERED_EVENT = "saga:assistant-answered";

/**
 * Tell the person an answer is ready when the chat is minimised, the tab is in the background or they
 * moved to another page: a toast with "Xem", and the launcher shows an unread dot.
 */
export function announceAssistantAnswer(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ASSISTANT_ANSWERED_EVENT));
  toast.success("Trợ lý AI đã trả lời", {
    description: "Bấm Xem để đọc câu trả lời.",
    duration: 10_000,
    action: {
      label: "Xem",
      onClick: () => window.dispatchEvent(new Event(ASSISTANT_OPEN_EVENT)),
    },
  });
}

/** True when the answer would otherwise go unnoticed. */
export function isAwayFromAssistant(visible: boolean, mounted: boolean): boolean {
  const hidden = typeof document !== "undefined" && document.visibilityState === "hidden";
  return !mounted || !visible || hidden;
}
