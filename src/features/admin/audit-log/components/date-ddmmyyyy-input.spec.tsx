import { describe, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { fptTest } from "@/testing/fpt-test-helper";
import { DateDdMmYyyyInput, toDdMmYyyy, toYyyyMmDd } from "./date-ddmmyyyy-input";

describe("DateDdMmYyyyInput", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "17/09/2026",
      description: "Hien thi dinh dang dd/mm/yyyy khi nhan value YYYY-MM-DD",
    },
    () => {
      render(
        <DateDdMmYyyyInput
          value="2026-09-14"
          onChange={vi.fn()}
          id="date-input-test"
        />
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("14/09/2026");
      expect(input.placeholder).toBe("dd/mm/yyyy");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "17/09/2026",
      description: "Nhap tay chuoi so 8 ky tu 17092026 tu dong masking thanh 17/09/2026 va goi onChange",
    },
    () => {
      const handleChange = vi.fn();
      render(
        <DateDdMmYyyyInput
          value=""
          onChange={handleChange}
          id="date-input-test"
        />
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "17092026" } });

      expect(input.value).toBe("17/09/2026");
      expect(handleChange).toHaveBeenCalledWith("2026-09-17");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "17/09/2026",
      description: "Xoa rong o nhap goi onChange rong va hien thi placeholder",
    },
    () => {
      const handleChange = vi.fn();
      render(
        <DateDdMmYyyyInput
          value="2026-09-14"
          onChange={handleChange}
          id="date-input-test"
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
      description: "Nhap chuoi khong hop le khi blur se fallback lai gia tri cu",
    },
    () => {
      const handleChange = vi.fn();
      render(
        <DateDdMmYyyyInput
          value="2026-09-14"
          onChange={handleChange}
          id="date-input-test"
        />
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "99/99/9999" } });
      fireEvent.blur(input);

      expect(input.value).toBe("14/09/2026");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "17/09/2026",
      description: "Kiem tra cac ham helper toDdMmYyyy va toYyyyMmDd voi cac ca bien va rong",
    },
    () => {
      expect(toDdMmYyyy("")).toBe("");
      expect(toDdMmYyyy("invalid")).toBe("");
      expect(toDdMmYyyy("2026-09-14")).toBe("14/09/2026");

      expect(toYyyyMmDd("")).toBe("");
      expect(toYyyyMmDd("invalid")).toBe("");
      expect(toYyyyMmDd("14/09/2026")).toBe("2026-09-14");
      expect(toYyyyMmDd("14092026")).toBe("2026-09-14");
    }
  );
});

