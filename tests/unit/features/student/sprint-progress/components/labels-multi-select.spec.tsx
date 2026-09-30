import { describe, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { fptTest } from "@/testing/fpt-test-helper";
import { LabelsMultiSelect } from "@/features/student/sprint-progress/components/labels-multi-select";

describe("LabelsMultiSelect", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "30/09/2026",
      description: "Render day du 4 nhan mac dinh khi click mo dropdown",
    },
    () => {
      render(<LabelsMultiSelect value={[]} onChange={vi.fn()} />);

      const input = screen.getByPlaceholderText("Chọn nhãn (saga:code, saga:test...)");
      fireEvent.click(input);

      expect(screen.getByText("saga:code")).toBeInTheDocument();
      expect(screen.getByText("saga:test")).toBeInTheDocument();
      expect(screen.getByText("saga:document")).toBeInTheDocument();
      expect(screen.getByText("saga:research")).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "30/09/2026",
      description: "Tu dong mo dropdown khi focus vao o input",
    },
    () => {
      render(<LabelsMultiSelect value={[]} onChange={vi.fn()} />);

      const input = screen.getByPlaceholderText("Chọn nhãn (saga:code, saga:test...)");
      fireEvent.focus(input);

      expect(screen.getByText("saga:code")).toBeInTheDocument();
      expect(screen.getByText("saga:test")).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "30/09/2026",
      description: "Chon 1 label se goi onChange voi duy nhat 1 label moi (single select)",
    },
    () => {
      const onChange = vi.fn();
      render(<LabelsMultiSelect value={["saga:code"]} onChange={onChange} />);

      const input = screen.getByRole("textbox");
      fireEvent.click(input);

      const testLabelBtn = screen.getByText("saga:test");
      fireEvent.mouseDown(testLabelBtn);

      expect(onChange).toHaveBeenCalledWith(["saga:test"]);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "30/09/2026",
      description: "Toggle mo va dong dropdown khi click nut chevron",
    },
    () => {
      render(<LabelsMultiSelect value={[]} onChange={vi.fn()} />);

      const toggleBtn = screen.getByLabelText("Mở danh sách nhãn");
      fireEvent.click(toggleBtn);

      expect(screen.getByText("saga:code")).toBeInTheDocument();

      fireEvent.click(toggleBtn);
      expect(screen.queryByText("saga:code")).not.toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "30/09/2026",
      description: "Khong cho phep tao nhan moi tuy y khi go text la va nhan Enter",
    },
    () => {
      const onChange = vi.fn();
      render(<LabelsMultiSelect value={[]} onChange={onChange} />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "my-custom-label" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(onChange).not.toHaveBeenCalled();
      expect(
        screen.getByText("Không tìm thấy nhãn phù hợp. Chỉ hỗ trợ 4 nhãn chuẩn của SAGA.")
      ).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: "30/09/2026",
      description: "Xoa label hien tai khi click vao nut X tren badge",
    },
    () => {
      const onChange = vi.fn();
      render(<LabelsMultiSelect value={["saga:code"]} onChange={onChange} />);

      const removeBtn = screen.getByLabelText("Xóa saga:code");
      fireEvent.click(removeBtn);

      expect(onChange).toHaveBeenCalledWith([]);
    }
  );
});
