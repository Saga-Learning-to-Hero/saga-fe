import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { TablePagination } from "./table-pagination";
import { fptTest } from "@/testing/fpt-test-helper";

describe("TablePagination", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "19/09/2026",
      description: "Hien thi dung so muc va phan trang khi co nhieu trang",
    },
    async () => {
      const onPageChange = vi.fn();
      render(
        <TablePagination
          page={1}
          pageSize={10}
          totalItems={25}
          onPageChange={onPageChange}
          itemLabel="lớp học phần"
        />
      );

      expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole("button", { name: "1" })).toBeDefined();
      expect(screen.getByText(/lớp học phần/)).toBeDefined();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "19/09/2026",
      description: "Goi onPageChange khi nguoi dung bam nut Sau",
    },
    async () => {
      const onPageChange = vi.fn();
      render(
        <TablePagination
          page={1}
          pageSize={10}
          totalItems={25}
          onPageChange={onPageChange}
        />
      );

      const nextButton = screen.getByTitle("Trang sau");
      fireEvent.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(2);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "19/09/2026",
      description: "Tra ve null khi totalItems bang 0",
    },
    async () => {
      const onPageChange = vi.fn();
      const { container } = render(
        <TablePagination
          page={1}
          pageSize={10}
          totalItems={0}
          onPageChange={onPageChange}
        />
      );

      expect(container.firstChild).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "B",
      executedDate: "19/09/2026",
      description: "Vo hieu hoa nut Truoc khi o trang 1 va nut Sau khi o trang cuoi",
    },
    async () => {
      const onPageChange = vi.fn();
      const { rerender } = render(
        <TablePagination
          page={1}
          pageSize={10}
          totalItems={20}
          onPageChange={onPageChange}
        />
      );

      const prevBtn = screen.getByTitle("Trang trước") as HTMLButtonElement;
      expect(prevBtn.disabled).toBe(true);

      rerender(
        <TablePagination
          page={2}
          pageSize={10}
          totalItems={20}
          onPageChange={onPageChange}
        />
      );

      const nextBtn = screen.getByTitle("Trang sau") as HTMLButtonElement;
      expect(nextBtn.disabled).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "19/09/2026",
      description: "Bam vao so trang goi onPageChange voi dung trang do",
    },
    async () => {
      const onPageChange = vi.fn();
      render(
        <TablePagination
          page={1}
          pageSize={10}
          totalItems={30}
          onPageChange={onPageChange}
        />
      );

      const page3Button = screen.getByRole("button", { name: "3" });
      fireEvent.click(page3Button);

      expect(onPageChange).toHaveBeenCalledWith(3);
    }
  );
});
