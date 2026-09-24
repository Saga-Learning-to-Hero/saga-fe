import { useState, useMemo } from "react";
import {
  SparklesIcon,
  BotIcon,
  RefreshCwIcon,
  PlusIcon,
  Trash2Icon,
  CheckIcon,
  Loader2Icon,
  ShieldAlertIcon,
  AlertTriangleIcon,
  InfoIcon,
  SplitIcon,
  LayersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/common/custom-select";
import {
  useAiProviderCatalog,
  useCourseAiSettings,
  useUpdateCourseAiSettings,
  useUpdateCourseAiBindings,
  useAllCourseAiCredentials,
} from "../../hooks/use-lecturer-ai";
import { CourseAiProviderCredentialSection } from "./course-ai-provider-credential-section";
import type {
  CourseAiSettingsResponse,
  AiProviderCatalogResponse,
  AiProviderBinding,
} from "../../types";

interface CourseAiSettingsCardProps {
  courseId: string;
}

function mapAiErrorCode(code: string | undefined): string {
  switch (code) {
    case "AI_PROVIDER_NOT_SUPPORTED":
      return "Nhà cung cấp AI không được hỗ trợ.";
    case "AI_MODEL_NOT_SUPPORTED":
      return "Mô hình AI không được hỗ trợ hoặc không thuộc nhà cung cấp đã chọn.";
    case "AI_MODEL_CAPABILITY_UNSUPPORTED":
      return "Mô hình không hỗ trợ định dạng dữ liệu có cấu trúc cần thiết cho phân tích.";
    case "AI_BINDING_INVALID":
      return "Cấu hình liên kết mô hình không hợp lệ (mô hình dự phòng bị trùng hoặc vượt quá số lượng cho phép).";
    default:
      return code || "Có lỗi xảy ra khi lưu cấu hình.";
  }
}

function CourseAiMultiProviderForm({
  courseId,
  initialSettings,
  catalog,
}: {
  courseId: string;
  initialSettings: CourseAiSettingsResponse;
  catalog: AiProviderCatalogResponse;
}) {
  const updateSettingsMutation = useUpdateCourseAiSettings(courseId);
  const updateBindingsMutation = useUpdateCourseAiBindings(courseId);
  const credentialsQuery = useAllCourseAiCredentials(courseId);
  const credentials = credentialsQuery.data || [];

  const defaultProvider = catalog.providers[0]?.provider || "OPENAI";
  const initialPrimaryProvider =
    initialSettings.primaryBinding?.provider || defaultProvider;

  const [primaryProvider, setPrimaryProvider] = useState<string>(initialPrimaryProvider);

  const primaryModels = useMemo(() => {
    const prov = catalog.providers.find((p) => p.provider === primaryProvider);
    return prov?.models || [];
  }, [catalog, primaryProvider]);

  const [primaryModelId, setPrimaryModelId] = useState<string>(() => {
    if (initialSettings.primaryBinding?.modelId) {
      return initialSettings.primaryBinding.modelId;
    }
    return primaryModels[0]?.modelId || "";
  });

  const [fallbackEnabled, setFallbackEnabled] = useState<boolean>(
    initialSettings.fallbackEnabled
  );
  const [fallbackBindings, setFallbackBindings] = useState<AiProviderBinding[]>(
    initialSettings.fallbackBindings || []
  );

  const [secondaryEnabled, setSecondaryEnabled] = useState<boolean>(
    Boolean(initialSettings.secondaryBinding)
  );

  const initialSecondaryProvider =
    initialSettings.secondaryBinding?.provider || "OPENAI";
  const [secondaryProvider, setSecondaryProvider] = useState<string>(
    initialSecondaryProvider
  );

  const secondaryModels = useMemo(() => {
    const prov = catalog.providers.find((p) => p.provider === secondaryProvider);
    return prov?.models || [];
  }, [catalog, secondaryProvider]);

  const [secondaryModelId, setSecondaryModelId] = useState<string>(() => {
    if (initialSettings.secondaryBinding?.modelId) {
      return initialSettings.secondaryBinding.modelId;
    }
    return secondaryModels[0]?.modelId || "";
  });

  const [automationEnabled, setAutomationEnabled] = useState<boolean>(
    initialSettings.automationEnabled
  );
  const [allowPlatformFallback, setAllowPlatformFallback] = useState<boolean>(
    initialSettings.allowPlatformFallback
  );

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const providerOptions = useMemo(() => {
    return catalog.providers.map((p) => ({
      value: p.provider,
      label: p.displayName,
    }));
  }, [catalog]);

  const primaryModelOptions = useMemo(() => {
    return primaryModels.map((m) => ({
      value: m.modelId,
      label: m.displayName,
      subLabel: m.freeTierEligible
        ? "Bậc miễn phí (Free Tier)"
        : !m.recommendedForAutomation
          ? "Khuyến nghị thử nghiệm"
          : undefined,
    }));
  }, [primaryModels]);

  const secondaryModelOptions = useMemo(() => {
    return secondaryModels.map((m) => ({
      value: m.modelId,
      label: m.displayName,
      subLabel: m.freeTierEligible
        ? "Bậc miễn phí (Free Tier)"
        : !m.recommendedForAutomation
          ? "Khuyến nghị thử nghiệm"
          : undefined,
    }));
  }, [secondaryModels]);

  const handlePrimaryProviderChange = (newProvider: string) => {
    setPrimaryProvider(newProvider);
    const modelsForProv =
      catalog.providers.find((p) => p.provider === newProvider)?.models || [];
    if (modelsForProv[0]) {
      setPrimaryModelId(modelsForProv[0].modelId);
    }
  };

  const handleSecondaryProviderChange = (newProvider: string) => {
    setSecondaryProvider(newProvider);
    const modelsForProv =
      catalog.providers.find((p) => p.provider === newProvider)?.models || [];
    if (modelsForProv[0]) {
      setSecondaryModelId(modelsForProv[0].modelId);
    }
  };

  const handleAddFallback = () => {
    if (fallbackBindings.length >= 3) return;
    const availableProvider =
      catalog.providers.find((p) => p.provider !== primaryProvider) ||
      catalog.providers[0];
    if (!availableProvider || !availableProvider.models[0]) return;

    setFallbackBindings([
      ...fallbackBindings,
      {
        provider: availableProvider.provider,
        modelId: availableProvider.models[0].modelId,
      },
    ]);
  };

  const handleUpdateFallback = (
    index: number,
    field: "provider" | "modelId",
    val: string
  ) => {
    const updated = [...fallbackBindings];
    const current = updated[index];
    if (!current) return;

    if (field === "provider") {
      const modelsForProv =
        catalog.providers.find((p) => p.provider === val)?.models || [];
      updated[index] = {
        provider: val,
        modelId: modelsForProv[0]?.modelId || "",
      };
    } else {
      updated[index] = {
        ...current,
        modelId: val,
      };
    }
    setFallbackBindings(updated);
  };

  const handleRemoveFallback = (index: number) => {
    setFallbackBindings(fallbackBindings.filter((_, idx) => idx !== index));
  };

  const selectedPrimaryModel = useMemo(() => {
    return primaryModels.find((m) => m.modelId === primaryModelId);
  }, [primaryModels, primaryModelId]);

  const selectedPrimaryProviderName = useMemo(() => {
    return (
      catalog.providers.find((p) => p.provider === primaryProvider)?.displayName ||
      primaryProvider
    );
  }, [catalog, primaryProvider]);

  const selectedSecondaryProviderName = useMemo(() => {
    return (
      catalog.providers.find((p) => p.provider === secondaryProvider)?.displayName ||
      secondaryProvider
    );
  }, [catalog, secondaryProvider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await updateBindingsMutation.mutateAsync({
        primaryBinding: {
          provider: primaryProvider,
          modelId: primaryModelId,
        },
        fallbackEnabled,
        fallbackBindings,
        secondaryBinding: secondaryEnabled
          ? {
            provider: secondaryProvider,
            modelId: secondaryModelId,
          }
          : null,
      });

      await updateSettingsMutation.mutateAsync({
        automationEnabled,
        allowPlatformFallback,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { code?: string; message?: string } } };
      const code = errorObj?.response?.data?.code;
      const msg = errorObj?.response?.data?.message;
      setErrorMessage(mapAiErrorCode(code) || msg || "Không thể lưu cấu hình.");
    }
  };

  const isSaving =
    updateBindingsMutation.isPending || updateSettingsMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <BotIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <span>Cấu hình Mô hình & Đa nhà cung cấp AI</span>
                <Badge variant="outline" className="font-mono text-[11px] text-primary border-primary/30 bg-primary/10">
                  Multi-Provider BYOK
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">
                Tự do lựa chọn nhà cung cấp AI, mô hình thực thi, chuỗi dự phòng và khóa API riêng biệt
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            size="sm"
            className="gap-2 shrink-0 cursor-pointer"
          >
            {isSaving ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckIcon className="w-4 h-4 text-emerald-400" />
            ) : null}
            {saveSuccess ? "Đã lưu thành công" : "Lưu thiết lập mô hình"}
          </Button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <ShieldAlertIcon className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-primary shrink-0" />
              <h4 className="text-sm font-semibold text-foreground">
                1. Mô hình phân tích chính (PRIMARY - Bắt buộc cho Tự động hóa)
              </h4>
            </div>
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
              Phân tích Commit, Task & Rủi ro
            </Badge>
          </div>

          <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Nhà cung cấp AI (Provider)
                </label>
                <CustomSelect
                  value={primaryProvider}
                  onChange={handlePrimaryProviderChange}
                  options={providerOptions}
                  placeholder="Chọn nhà cung cấp..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Mô hình phân tích (Model)
                </label>
                <CustomSelect
                  value={primaryModelId}
                  onChange={setPrimaryModelId}
                  options={primaryModelOptions}
                  placeholder="Chọn mô hình..."
                />
              </div>
            </div>

            {selectedPrimaryModel?.freeTierEligible && catalog.freeTierNotice && (
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-800 dark:text-sky-300 flex items-start gap-2 leading-relaxed">
                <InfoIcon className="w-4 h-4 shrink-0 mt-0.5 text-sky-600 dark:text-sky-400" />
                <span>{catalog.freeTierNotice}</span>
              </div>
            )}

            {!selectedPrimaryModel?.recommendedForAutomation && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangleIcon className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Mô hình này chưa được tối ưu hóa cho tác vụ tự động hóa hàng loạt. Bạn vẫn có thể sử dụng cho thử nghiệm.</span>
              </div>
            )}

            <CourseAiProviderCredentialSection
              key={`PRIMARY-${primaryProvider}`}
              courseId={courseId}
              role="PRIMARY"
              provider={primaryProvider}
              providerDisplayName={selectedPrimaryProviderName}
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
            <div className="flex items-center gap-2">
              <RefreshCwIcon className="w-4 h-4 text-blue-500 shrink-0" />
              <h4 className="text-sm font-semibold text-foreground">
                2. Chuỗi dự phòng khi nhà cung cấp chính tạm ngưng hoạt động (Fallback Chain)
              </h4>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground select-none">
              <input
                type="checkbox"
                checked={fallbackEnabled}
                onChange={(e) => setFallbackEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary"
              />
              <span>Bật chuỗi dự phòng</span>
            </label>
          </div>

          <div className="text-xs text-muted-foreground leading-relaxed">
            Áp dụng riêng cho phân tích chính (PRIMARY). Khi nhà cung cấp chính gặp lỗi hết hạn mức (quota), giới hạn tần suất (rate limit), timeout hoặc tạm ngưng hoạt động, hệ thống sẽ tự động thử các nhà cung cấp dự phòng theo thứ tự dưới đây. Tối đa 3 dự phòng.
          </div>

          {fallbackEnabled ? (
            <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border/60">
              {fallbackBindings.length === 0 ? (
                <div className="text-xs text-muted-foreground p-3 text-center border border-dashed border-border rounded-xl">
                  Chưa có nhà cung cấp dự phòng nào trong chuỗi. Nhấn nút bên dưới để thêm.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {fallbackBindings.map((binding, idx) => {
                    const provModels =
                      catalog.providers.find((p) => p.provider === binding.provider)
                        ?.models || [];
                    const modelOpts = provModels.map((m) => ({
                      value: m.modelId,
                      label: m.displayName,
                      subLabel: m.freeTierEligible ? "Bậc miễn phí (Free Tier)" : undefined,
                    }));

                    const hasPrimaryCredential = credentials.some(
                      (c) =>
                        c.role === "PRIMARY" &&
                        c.provider === binding.provider &&
                        c.configured &&
                        c.status !== "INVALID" &&
                        c.status !== "REVOKED"
                    );

                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-xl bg-card border border-border/70 text-xs"
                      >
                        <div className="flex items-center gap-2 shrink-0 font-mono font-bold text-muted-foreground">
                          <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span>Dự phòng {idx + 1}</span>
                        </div>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <CustomSelect
                            value={binding.provider}
                            onChange={(val) => handleUpdateFallback(idx, "provider", val)}
                            options={providerOptions}
                            placeholder="Chọn nhà cung cấp..."
                          />

                          <CustomSelect
                            value={binding.modelId}
                            onChange={(val) => handleUpdateFallback(idx, "modelId", val)}
                            options={modelOpts}
                            placeholder="Chọn mô hình..."
                          />
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                          {hasPrimaryCredential ? (
                            <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                              Đã có khóa PRIMARY
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10">
                              Chưa có khóa PRIMARY
                            </Badge>
                          )}

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFallback(idx)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                          >
                            <Trash2Icon className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {fallbackBindings.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddFallback}
                  className="text-xs gap-1.5 cursor-pointer"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Thêm nhà cung cấp dự phòng ({fallbackBindings.length}/3)
                </Button>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground">
              Chuỗi dự phòng đang tắt. Nếu nhà cung cấp chính gặp lỗi quota hoặc sự cố mạng, phân tích tự động sẽ dừng lại.
            </div>
          )}
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
            <div className="flex items-center gap-2">
              <SplitIcon className="w-4 h-4 text-purple-500 shrink-0" />
              <h4 className="text-sm font-semibold text-foreground">
                3. Mô hình đối chứng phụ (SECONDARY BRAIN - Tùy chọn)
              </h4>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground select-none">
              <input
                type="checkbox"
                checked={secondaryEnabled}
                onChange={(e) => setSecondaryEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary"
              />
              <span>Kích hoạt Secondary Brain</span>
            </label>
          </div>

          <div className="text-xs text-muted-foreground leading-relaxed">
            Mô hình đối chứng chạy song song độc lập nhằm thẩm định chéo, phát hiện bất đồng quan điểm và đánh giá độ tin cậy với mô hình chính. Hoàn toàn không bắt buộc để hệ thống AI hoạt động và không dùng làm dự phòng khi mô hình chính gặp sự cố.
          </div>

          {secondaryEnabled ? (
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    Nhà cung cấp đối chứng
                  </label>
                  <CustomSelect
                    value={secondaryProvider}
                    onChange={handleSecondaryProviderChange}
                    options={providerOptions}
                    placeholder="Chọn nhà cung cấp..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    Mô hình đối chứng
                  </label>
                  <CustomSelect
                    value={secondaryModelId}
                    onChange={setSecondaryModelId}
                    options={secondaryModelOptions}
                    placeholder="Chọn mô hình..."
                  />
                </div>
              </div>

              <CourseAiProviderCredentialSection
                key={`SECONDARY-${secondaryProvider}`}
                courseId={courseId}
                role="SECONDARY"
                provider={secondaryProvider}
                providerDisplayName={selectedSecondaryProviderName}
              />
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground">
              Mô hình đối chứng phụ đang tắt. Toàn bộ phân tích sẽ được thực hiện bởi mô hình phân tích chính.
            </div>
          )}
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2">
            <LayersIcon className="w-4 h-4 text-emerald-500 shrink-0" />
            <h4 className="text-sm font-semibold text-foreground">
              4. Chính sách Tự động hóa & Khóa nền tảng
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={automationEnabled}
                onChange={(e) => setAutomationEnabled(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary"
              />
              <div className="space-y-1">
                <span className="text-sm font-medium text-foreground block">
                  Tự động phân tích khi có dữ liệu mới
                </span>
                <span className="text-xs text-muted-foreground block leading-relaxed">
                  Tự động kích hoạt đánh giá thông minh khi sinh viên đẩy commit hoặc cập nhật task Jira.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={allowPlatformFallback}
                onChange={(e) => setAllowPlatformFallback(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary"
              />
              <div className="space-y-1">
                <span className="text-sm font-medium text-foreground block">
                  Cho phép khóa nền tảng cho một số phân tích thủ công
                </span>
                <span className="text-xs text-muted-foreground block leading-relaxed">
                  Chỉ áp dụng cho các yêu cầu thủ công được hỗ trợ. Phân tích tự động Commit/Task/Risk vẫn sử dụng credential của khóa học.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}

export function CourseAiSettingsCard({ courseId }: CourseAiSettingsCardProps) {
  const { data: settings, isLoading: isLoadingSettings } =
    useCourseAiSettings(courseId);
  const { data: catalog, isLoading: isLoadingCatalog } =
    useAiProviderCatalog(courseId);

  if (isLoadingSettings || isLoadingCatalog || !settings || !catalog) {
    return (
      <div className="p-8 rounded-2xl border border-border bg-card/60 flex flex-col items-center justify-center gap-3">
        <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">
          Đang nạp danh mục nhà cung cấp và thiết lập AI...
        </span>
      </div>
    );
  }

  return (
    <CourseAiMultiProviderForm
      key={`${settings.automationEnabled}-${settings.allowPlatformFallback}-${settings.primaryBinding?.provider}-${settings.primaryBinding?.modelId}-${settings.fallbackEnabled}-${settings.fallbackBindings?.length}`}
      courseId={courseId}
      initialSettings={settings}
      catalog={catalog}
    />
  );
}
