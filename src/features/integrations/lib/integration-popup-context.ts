import type {
  IntegrationProvider,
  IntegrationScope,
} from "./integration-broadcast";

export const PERSONAL_INTEGRATION_SUCCESS_PATH = "/integrations/success";
export const SAGA_INTEGRATION_POPUP_SESSION_KEY = "saga_integration_popup_context";

export interface IntegrationPopupContext {
  provider: IntegrationProvider;
  scope: IntegrationScope;
  projectId?: string;
}

function isProvider(value: unknown): value is IntegrationProvider {
  return value === "jira" || value === "github";
}

function isScope(value: unknown): value is IntegrationScope {
  return value === "personal" || value === "project";
}

export function markIntegrationPopupWindow(
  popup: Window,
  context: IntegrationPopupContext
): void {
  try {
    popup.sessionStorage.setItem(
      SAGA_INTEGRATION_POPUP_SESSION_KEY,
      JSON.stringify(context)
    );
  } catch {
    // Một số trình duyệt chặn truy cập storage ngay khi popup bắt đầu đổi origin.
    // Tên cửa sổ vẫn được dùng làm phương án dự phòng.
  }
}

export function readIntegrationPopupContext(
  targetWindow: Window
): IntegrationPopupContext | null {
  try {
    const rawValue = targetWindow.sessionStorage.getItem(
      SAGA_INTEGRATION_POPUP_SESSION_KEY
    );
    if (rawValue) {
      const value = JSON.parse(rawValue) as Partial<IntegrationPopupContext>;
      if (isProvider(value.provider) && isScope(value.scope)) {
        return {
          provider: value.provider,
          scope: value.scope,
          projectId:
            typeof value.projectId === "string" ? value.projectId : undefined,
        };
      }
    }
  } catch {
    // Tiếp tục đọc tên popup khi storage không khả dụng hoặc dữ liệu không hợp lệ.
  }

  const nameMatch = targetWindow.name.match(
    /^saga_(personal|project)_(jira|github)_oauth$/
  );
  if (nameMatch) {
    return {
      scope: nameMatch[1] as IntegrationScope,
      provider: nameMatch[2] as IntegrationProvider,
    };
  }

  return null;
}

export function getIntegrationPopupSnapshot(targetWindow: Window): string {
  const context = readIntegrationPopupContext(targetWindow);
  if (context) return JSON.stringify(context);

  try {
    return targetWindow.opener ? "opener" : "";
  } catch {
    return "";
  }
}

export function parseIntegrationPopupSnapshot(
  snapshot: string
): IntegrationPopupContext | null {
  if (!snapshot || snapshot === "opener") return null;

  try {
    const value = JSON.parse(snapshot) as Partial<IntegrationPopupContext>;
    if (isProvider(value.provider) && isScope(value.scope)) {
      return {
        provider: value.provider,
        scope: value.scope,
        projectId:
          typeof value.projectId === "string" ? value.projectId : undefined,
      };
    }
  } catch {
    // Snapshot không hợp lệ được xem như không có context.
  }

  return null;
}
