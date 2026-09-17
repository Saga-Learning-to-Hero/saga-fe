import { describe, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { fptTest } from "@/testing/fpt-test-helper";
import { TimeHhMmInput, isValidHhMm, formatTimeInputMask } from "./time-hhmm-input";

describe("TimeHhMmInput", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "17/09/2026",
      description: "Hien thi dung gio phut HH:mm truyen vao tu props",
    },
    () => {
      render(
        <TimeHhMmInput
          value="08:30"
          onChange={vi.fn()}
          id="test-time-input"
        />
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("08:30");
      expect(input.placeholder).toBe("HH:mm");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "17/09/2026",
      description: "Nhap 4 chu so lien tiep 1430 tu dong auto-mask thanh 14:30 va goi onChange",
    },
    () => {
      const handleChange = vi.fn();
      render(
        <TimeHhMmInput
          value=""
          onChange={handleChange}
          id="test-time-input"
        />
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "1430" } });

      expect(input.value).toBe("14:30");
      expect(handleChange).toHaveBeenCalledWith("14:30");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "17/09/2026",
      description: "Xoa rong o nhap gio goi onChange rong",
    },
    () => {
      const handleChange = vi.fn();
      render(
        <TimeHhMmInput
          value="08:30"
          onChange={handleChange}
          id="test-time-input"
        />
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "" } });

      expect(input.value).toBe("");
      expect(handleChange).toHaveBeenCalledWith("");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "17/09/2026",
      description: "Nhap gio sai cu phap khi blur fallback ve gia tri cu hop le",
    },
    () => {
      const handleChange = vi.fn();
      render(
        <TimeHhMmInput
          value="08:30"
          onChange={handleChange}
          id="test-time-input"
        />
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "99" } });
      fireEvent.blur(input);

      expect(input.value).toBe("08:30");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "17/09/2026",
      description: "Kiem tra ham isValidHhMm va formatTimeInputMask voi cac gia tri bien",
    },
    () => {
      expect(isValidHhMm("00:00")).toBe(true);
      expect(isValidHhMm("23:59")).toBe(true);
      expect(isValidHhMm("24:00")).toBe(false);
      expect(isValidHhMm("12:60")).toBe(false);
      expect(isValidHhMm("")).toBe(false);

      expect(formatTimeInputMask("")).toBe("");
      expect(formatTimeInputMask("99")).toBe("23");
      expect(formatTimeInputMask("0830")).toBe("08:30");
    }
  );
});
