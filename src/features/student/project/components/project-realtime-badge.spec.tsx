import { describe, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fptTest } from "@/testing/fpt-test-helper";
import { ProjectRealtimeBadge } from "./project-realtime-badge";

describe("ProjectRealtimeBadge Component", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "12/09/2026",
      description: "Render badge Realtime khi status OPEN",
    },
    () => {
      render(<ProjectRealtimeBadge status="OPEN" />);
      expect(screen.getByText("Realtime")).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "12/09/2026",
      description: "Render badge dang ket noi khi status CONNECTING",
    },
    () => {
      render(<ProjectRealtimeBadge status="CONNECTING" />);
      expect(screen.getByText("Đang kết nối SSE...")).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "12/09/2026",
      description: "Render realtime gian doan va goi onReconnect khi nhap vao badge",
    },
    async () => {
      const user = userEvent.setup();
      const onReconnectMock = vi.fn();

      render(<ProjectRealtimeBadge status="ERROR" onReconnect={onReconnectMock} />);

      const badgeText = screen.getByText("Realtime gián đoạn");
      expect(badgeText).toBeInTheDocument();

      await user.click(badgeText);
      expect(onReconnectMock).toHaveBeenCalledTimes(1);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "B",
      executedDate: "12/09/2026",
      description: "Render an toan khi khong truyen onReconnect o status CLOSED",
    },
    () => {
      render(<ProjectRealtimeBadge status="CLOSED" />);
      expect(screen.getByText("Realtime gián đoạn")).toBeInTheDocument();
    }
  );
});
