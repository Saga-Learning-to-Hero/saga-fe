import { afterEach, beforeEach, describe, expect, vi } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  SAGA_INTEGRATION_CHANNEL_NAME,
  sendIntegrationResult,
  subscribeIntegrationResult,
} from "@/features/integrations/lib/integration-broadcast";

class BroadcastChannelMock {
  static instances: BroadcastChannelMock[] = [];

  readonly name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  close = vi.fn();

  constructor(name: string) {
    this.name = name;
    BroadcastChannelMock.instances.push(this);
  }

  postMessage(data: unknown) {
    for (const instance of BroadcastChannelMock.instances) {
      if (instance !== this && instance.name === this.name) {
        instance.onmessage?.({ data } as MessageEvent);
      }
    }
  }
}

describe("integration-broadcast", () => {
  beforeEach(() => {
    BroadcastChannelMock.instances = [];
    vi.stubGlobal("BroadcastChannel", BroadcastChannelMock);
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "30/09/2026",
      description: "Dung dung channel personal_integration_channel cho OAuth ca nhan",
    },
    () => {
      expect(SAGA_INTEGRATION_CHANNEL_NAME).toBe("personal_integration_channel");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "30/09/2026",
      description: "Popup phat ket qua thanh cong va tab chinh nhan duoc qua BroadcastChannel",
    },
    () => {
      const listener = vi.fn();
      const unsubscribe = subscribeIntegrationResult(listener);

      sendIntegrationResult({
        status: "success",
        provider: "jira",
        scope: "personal",
      });

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "SAGA_INTEGRATION_RESULT",
          status: "success",
          provider: "jira",
          scope: "personal",
          timestamp: expect.any(Number),
        })
      );

      unsubscribe();
      expect(BroadcastChannelMock.instances[0]?.close).toHaveBeenCalled();
    }
  );
});
