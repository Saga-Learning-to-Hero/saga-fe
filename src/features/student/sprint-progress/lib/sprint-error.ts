/**
 * Helper trích xuất và định dạng thông báo lỗi khi có xung đột thời gian giữa các Sprint (mã lỗi SPRINT_PERIOD_OVERLAP - HTTP 409).
 *
 * Backend trả về:
 * - code: "SPRINT_PERIOD_OVERLAP"
 * - details: { conflictingSprintName, conflictingSiteName, conflictingStartDate, conflictingEndDate }
 *
 * Định dạng hiển thị:
 * "Trùng thời gian với sprint {conflictingSprintName} của site {conflictingSiteName} (từ {start} tới {end}). Hãy chọn ngày bắt đầu từ ngày sprint đó kết thúc trở đi."
 */

function formatDateOnly(dateStr?: string): string {
  if (!dateStr) return "";
  return dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
}

export function getSprintOverlapErrorMessage(
  error: unknown,
  fallback = "Trùng thời gian với một sprint khác trong dự án. Hãy chọn ngày bắt đầu từ ngày sprint đó kết thúc trở đi."
): string | null {
  if (!error) return null;

  const anyErr = error as {
    response?: {
      status?: number;
      data?: {
        code?: string;
        message?: string;
        details?: {
          conflictingSprintName?: string;
          conflictingSiteName?: string;
          conflictingStartDate?: string;
          conflictingEndDate?: string;
          // Fallback tương thích các biến thể cũ
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
    const sprintName =
      details?.conflictingSprintName || details?.overlappingSprintName || details?.sprintName;
    const siteName = details?.conflictingSiteName || details?.siteName;
    const rawStart = details?.conflictingStartDate || details?.startDate;
    const rawEnd = details?.conflictingEndDate || details?.endDate;

    const start = formatDateOnly(rawStart);
    const end = formatDateOnly(rawEnd);

    if (sprintName) {
      const sitePart = siteName ? ` của site ${siteName}` : "";
      const datePart = start && end ? ` (từ ${start} tới ${end})` : "";
      return `Trùng thời gian với sprint ${sprintName}${sitePart}${datePart}. Hãy chọn ngày bắt đầu từ ngày sprint đó kết thúc trở đi.`;
    }

    return data?.message || fallback;
  }

  return null;
}
