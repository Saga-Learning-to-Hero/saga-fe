import { describe, expect, beforeEach, afterEach, vi } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  connectUserEvents,
  closeUserEvents,
  isAccountDisabled,
  resetAccountDisabledState,
} from "@/features/auth/lib/user-events";

// Mock EventSource
class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  options?: { withCredentials?: boolean };
  readyState: number = 0; // CONNECTING
  listeners: Record<string, ((event: unknown) => void)[]> = {};
  onmessage: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 2;

  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSED = 2;

  constructor(url: string, options?: { withCredentials?: boolean }) {
    this.url = url;
    this.options = options;
    this.readyState = MockEventSource.OPEN;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (event: unknown) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (event: unknown) => void) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((l) => l !== listener);
    }
  }

  dispatchEvent(event: { type: string; data?: string }): boolean {
    const list = this.listeners[event.type];
    if (list) {
      list.forEach((fn) => fn(event));
    }
    return true;
  }

  simulateAccountDisabled(data = '{"type":"ACCOUNT_DISABLED","occurredAt":"2026-09-16T12:00:00Z"}') {
    const event = { type: "ACCOUNT_DISABLED", data };
    const list = this.listeners["ACCOUNT_DISABLED"];
    if (list) {
      list.forEach((fn) => fn(event));
    }
  }

  simulateGenericMessage(data: string) {
    if (this.onmessage) {
      this.onmessage({ data });
    }
  }

  close() {
    this.readyState = MockEventSource.CLOSED;
  }
}

describe("UserEventsService - Quản lý kết nối SSE Realtime", () => {
  beforeEach(() => {
    MockEventSource.instances = [];
    resetAccountDisabledState();
    closeUserEvents();
    vi.stubGlobal("EventSource", MockEventSource);
  });

  afterEach(() => {
    closeUserEvents();
    resetAccountDisabledState();
    vi.restoreAllMocks();
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "16/09/2026",
      description: "connectUserEvents khoi tao ket noi EventSource toi /api/users/me/events kem withCredentials",
    },
    () => {
      const source = connectUserEvents();
      expect(source).not.toBeNull();
      expect(source?.url).toContain("/api/users/me/events");
      expect((source as unknown as MockEventSource).options?.withCredentials).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "16/09/2026",
      description: "Dong ket noi SSE hien tai khi goi closeUserEvents",
    },
    () => {
      const source = connectUserEvents() as unknown as MockEventSource;
      expect(source.readyState).toBe(MockEventSource.OPEN);

      closeUserEvents();
      expect(source.readyState).toBe(MockEventSource.CLOSED);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "16/09/2026",
      description: "Nhan su kien ACCOUNT_DISABLED dong ket noi ngay lap tuc va phat event saga:account-disabled",
    },
    () => {
      const dispatchSpy = vi.spyOn(window, "dispatchEvent");
      const onDisabledCallback = vi.fn();

      const source = connectUserEvents({
        onAccountDisabled: onDisabledCallback,
      }) as unknown as MockEventSource;

      source.simulateAccountDisabled(
        JSON.stringify({ type: "ACCOUNT_DISABLED", occurredAt: "2026-09-16T12:00:00Z" })
      );

      expect(isAccountDisabled()).toBe(true);
      expect(source.readyState).toBe(MockEventSource.CLOSED);
      expect(onDisabledCallback).toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: "saga:account-disabled" })
      );
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "16/09/2026",
      description: "Tai khoan bi gan co disabled thi resetAccountDisabledState cho phep ket noi lai sau khi dang nhap moi",
    },
    () => {
      const source = connectUserEvents() as unknown as MockEventSource;
      source.simulateAccountDisabled();
      expect(isAccountDisabled()).toBe(true);

      resetAccountDisabledState();
      expect(isAccountDisabled()).toBe(false);

      const newSource = connectUserEvents();
      expect(newSource).not.toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "16/09/2026",
      description: "Xu ly an toan khi message ACCOUNT_DISABLED gui qua generic onmessage",
    },
    () => {
      const dispatchSpy = vi.spyOn(window, "dispatchEvent");
      const source = connectUserEvents() as unknown as MockEventSource;

      source.simulateGenericMessage(
        JSON.stringify({ type: "ACCOUNT_DISABLED", reason: "Banned by Admin" })
      );

      expect(isAccountDisabled()).toBe(true);
      expect(source.readyState).toBe(MockEventSource.CLOSED);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: "saga:account-disabled" })
      );
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "16/09/2026",
      description: "Xu ly an toan khi payload cua ACCOUNT_DISABLED bi sai dinh dang JSON",
    },
    () => {
      const onDisabledCallback = vi.fn();
      const source = connectUserEvents({
        onAccountDisabled: onDisabledCallback,
      }) as unknown as MockEventSource;

      source.simulateAccountDisabled("invalid-json-string");

      expect(isAccountDisabled()).toBe(true);
      expect(source.readyState).toBe(MockEventSource.CLOSED);
      expect(onDisabledCallback).toHaveBeenCalledWith({ type: "ACCOUNT_DISABLED" });
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "16/09/2026",
      description: "source.onerror tu dong dong ket noi va khong reconnect neu accountDisabled=true",
    },
    () => {
      const source = connectUserEvents() as unknown as MockEventSource;
      source.simulateAccountDisabled();

      // Trigger onerror
      if (source.onerror) {
        source.onerror(new Event("error"));
      }

      expect(source.readyState).toBe(MockEventSource.CLOSED);
      expect(isAccountDisabled()).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "16/09/2026",
      description: "connectUserEvents khong tao connection trung lap khi ket noi hien tai van dang mo (OPEN)",
    },
    () => {
      const source1 = connectUserEvents();
      const source2 = connectUserEvents();

      expect(source1).toBe(source2);
      expect(MockEventSource.instances.length).toBe(1);
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "16/09/2026",
      description: "connectUserEvents tu choi ket noi va tra ve null khi isAccountDisabled da duoc kich hoat",
    },
    () => {
      const source = connectUserEvents() as unknown as MockEventSource;
      source.simulateAccountDisabled();

      const nextAttempt = connectUserEvents();
      expect(nextAttempt).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "B",
      executedDate: "16/09/2026",
      description: "closeUserEvents chay an toan khong throw loi khi chua co activeEventSource",
    },
    () => {
      expect(() => closeUserEvents()).not.toThrow();
    }
  );
});
