"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ALLOWED_ELEMENTS = [
  "p",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "code",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "br",
];

export function AssistantMarkdown({ content }: { content: string }) {
  return (
    <div className="space-y-1 text-sm leading-relaxed [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left">
      <ReactMarkdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        allowedElements={ALLOWED_ELEMENTS}
        unwrapDisallowed
        components={{
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
