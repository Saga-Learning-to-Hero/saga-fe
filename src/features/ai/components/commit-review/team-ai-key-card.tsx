"use client";

import { useMemo, useState } from "react";
import { KeyRoundIcon, Loader2Icon, ShieldCheckIcon, Trash2Icon, InfoIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { showErrorToast, showSuccessToast } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { useRemoveTeamAiKey, useSaveTeamAiKey, useTeamAiKey } from "../../hooks/use-commit-review";

const PROVIDER_LABEL: Record<string, string> = { GEMINI: "Google Gemini", OPENAI: "OpenAI", COHERE: "Cohere" };

/** Vietnamese label and tone of a stored team key status. */
export function teamKeyStatusView(status?: string | null): { label: string; className: string } {
  switch (status) {
    case "ACTIVE":
      return { label: "Đang hoạt động", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" };
    case "UNVERIFIED":
      return { label: "Chưa dùng lần nào", className: "bg-sky-500/15 text-sky-700 dark:text-sky-300" };
    case "DEGRADED":
      return { label: "Tạm hết hạn mức", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300" };
    case "INVALID":
      return { label: "Key bị từ chối", className: "bg-rose-500/15 text-rose-700 dark:text-rose-300" };
    default:
      return { label: "Chưa có key", className: "bg-muted text-muted-foreground" };
  }
}

export function TeamAiKeyCard({ projectId }: { projectId: string }) {
  const { data, isLoading, isError } = useTeamAiKey(projectId, { enabled: Boolean(projectId) });
  const saveKey = useSaveTeamAiKey(projectId);
  const removeKey = useRemoveTeamAiKey(projectId);
  const [provider, setProvider] = useState("");
  const [modelId, setModelId] = useState("");
  const [apiKey, setApiKey] = useState("");

  const providers = useMemo(() => Array.from(new Set((data?.models ?? []).map((model) => model.provider))), [data?.models]);
  const effectiveProvider = provider || data?.provider || providers[0] || "";
  const models = (data?.models ?? []).filter((model) => model.provider === effectiveProvider);
  const effectiveModel = models.some((model) => model.modelId === modelId)
    ? modelId
    : models.find((model) => model.modelId === data?.modelId)?.modelId || models.find((model) => model.recommended)?.modelId || models[0]?.modelId || "";
  const statusView = teamKeyStatusView(data?.configured ? data.status : null);

  const handleSave = () => {
    if (!apiKey.trim() || !effectiveProvider || !effectiveModel) return;
    saveKey.mutate(
      { provider: effectiveProvider, modelId: effectiveModel, apiKey: apiKey.trim() },
      {
        onSuccess: () => {
          setApiKey("");
          showSuccessToast("Đã lưu key AI của nhóm. Commit mới sẽ được AI đánh giá bằng key này.");
        },
        onError: (error) => showErrorToast("Không lưu được key AI.", error),
      }
    );
  };

  const handleRemove = () =>
    removeKey.mutate(undefined, {
      onSuccess: () => showSuccessToast("Đã xoá key AI của nhóm."),
      onError: (error) => showErrorToast("Không xoá được key AI.", error),
    });

  return (
    <Card className="rounded-xl" data-testid="team-ai-key-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <KeyRoundIcon className="size-4 text-primary" />
          Key AI của nhóm
        </CardTitle>
        <CardDescription className="text-xs">
          Dùng để AI tự đánh giá chất lượng từng commit (tên commit, code, độ khớp task). Key được mã hoá, không ai xem lại được.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2Icon className="size-3.5 animate-spin" /> Đang tải...
          </div>
        )}
        {isError && <p className="text-xs text-destructive">Không tải được trạng thái key AI.</p>}

        {data && (
          <>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={cn("font-bold px-2 py-0.5 rounded-full", statusView.className)}>{statusView.label}</span>
              {data.configured && (
                <span className="text-muted-foreground">
                  {PROVIDER_LABEL[data.provider ?? ""] ?? data.provider} · {data.modelId}
                  {data.lastFour ? ` · ••••${data.lastFour}` : ""}
                </span>
              )}
            </div>

            {data.configured && data.lastError && data.status !== "ACTIVE" && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs space-y-0.5">
                <p className="font-bold">{data.lastError.title}</p>
                <p>{data.lastError.message}</p>
                <p className="text-muted-foreground">{data.lastError.hint}</p>
              </div>
            )}

            {!data.configured && (
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <InfoIcon className="size-3.5 mt-0.5 shrink-0" />
                {data.courseFallbackAvailable
                  ? "Nhóm chưa có key: commit vẫn được đánh giá bằng key của lớp vì giảng viên đã cho phép."
                  : "Nhóm chưa có key và giảng viên chưa cho dùng key của lớp: commit sẽ không được AI đánh giá."}
              </p>
            )}

            {data.canManage ? (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    aria-label="Nhà cung cấp AI"
                    value={effectiveProvider}
                    onChange={(event) => {
                      setProvider(event.target.value);
                      setModelId("");
                    }}
                    className="h-8 rounded-lg border border-border bg-background px-2 text-xs"
                  >
                    {providers.map((value) => (
                      <option key={value} value={value}>
                        {PROVIDER_LABEL[value] ?? value}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Model AI"
                    value={effectiveModel}
                    onChange={(event) => setModelId(event.target.value)}
                    className="h-8 rounded-lg border border-border bg-background px-2 text-xs"
                  >
                    {models.map((model) => (
                      <option key={model.modelId} value={model.modelId}>
                        {model.displayName}
                        {model.freeTierEligible ? " (có gói miễn phí)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="password"
                  autoComplete="off"
                  aria-label="API key"
                  placeholder={data.configured ? "Nhập key mới để thay key hiện tại" : "Dán API key của nhà cung cấp"}
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  className="w-full h-8 rounded-lg border border-border bg-background px-2 text-xs font-mono"
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleSave} disabled={!apiKey.trim() || saveKey.isPending} className="h-8 text-xs gap-1.5">
                    {saveKey.isPending ? <Loader2Icon className="size-3 animate-spin" /> : <ShieldCheckIcon className="size-3" />}
                    {data.configured ? "Thay key" : "Lưu key"}
                  </Button>
                  {data.configured && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRemove}
                      disabled={removeKey.isPending}
                      className="h-8 text-xs gap-1.5 text-destructive"
                    >
                      <Trash2Icon className="size-3" /> Xoá key
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">Chỉ trưởng nhóm được nhập hoặc thay key.</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
