/**
 * Helper trích xuất và định dạng thông báo lỗi khi có xung đột thời gian giữa các Sprint (mã lỗi SPRINT_PERIOD_OVERLAP - HTTP 409).
 */
export function getSprintOverlapErrorMessage(
  error: unknown,
  fallback = "Khoảng thời gian của Sprint bị trùng lặp với một Sprint khác trong dự án. Mỗi giai đoạn chỉ được phép có duy nhất một Sprint hoạt động."
): string | null {
  if (!error) return null;

  const anyErr = error as {
    response?: {
      status?: number;
      data?: {
        code?: string;
        message?: string;
        details?: {
          overlappingSprintName?: string;
          sprintName?: string;
          siteName?: string;
          startDate?: string;
          endDate?: string;
        };
      };
    };
    code?: string;
    message?: string;
  };

  const status = anyErr?.response?.status;
  const data = anyErr?.response?.data;
  const errorCode = data?.code || anyErr?.code;

  if (status === 409 || errorCode === "SPRINT_PERIOD_OVERLAP") {
    const details = data?.details;
    const targetSprintName = details?.overlappingSprintName || details?.sprintName;
    if (targetSprintName) {
      const site = details?.siteName ? ` tại workspace/site "${details.siteName}"` : "";
      const dates =
        details?.startDate && details?.endDate
          ? ` (từ ${details.startDate} đến ${details.endDate})`
          : "";
      return `Không thể thực hiện: Thời gian Sprint bị trùng lặp với "${targetSprintName}"${site}${dates}. Mỗi giai đoạn dự án chỉ được phép có duy nhất một Sprint hoạt động.`;
    }
    return data?.message || fallback;
  }

  return null;
}
