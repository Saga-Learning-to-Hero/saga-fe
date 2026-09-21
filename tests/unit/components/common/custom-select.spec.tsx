import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, vi } from "vitest";
import { CustomSelect } from "@/components/common/custom-select";
import { fptTest } from "@/testing/fpt-test-helper";

describe("CustomSelect option intent", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "21/09/2026",
      description: "Phát intent khi người dùng chuẩn bị chọn option để caller prefetch dữ liệu",
    },
    async () => {
      const user = userEvent.setup();
      const onOptionIntent = vi.fn();

      render(
        <CustomSelect
          value="semester-1"
          onChange={vi.fn()}
          onOptionIntent={onOptionIntent}
          options={[
            { value: "semester-1", label: "FA26" },
            { value: "semester-2", label: "SP27" },
          ]}
        />
      );

      await user.click(screen.getByRole("button"));
      await user.hover(screen.getByRole("option", { name: "SP27" }));

      expect(onOptionIntent).toHaveBeenCalledWith("semester-2");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "21/09/2026",
      description: "Cho phép chọn option bằng bàn phím mà không thay đổi API onChange hiện có",
    },
    async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <CustomSelect
          value="semester-1"
          onChange={onChange}
          options={[
            { value: "semester-1", label: "FA26" },
            { value: "semester-2", label: "SP27" },
          ]}
        />
      );

      await user.click(screen.getByRole("button"));
      const option = screen.getByRole("option", { name: "SP27" });
      option.focus();
      await user.keyboard("{Enter}");

      expect(onChange).toHaveBeenCalledWith("semester-2");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "21/09/2026",
      description: "Chế độ inline đưa danh sách option vào layout thay vì phủ lên nội dung bên dưới",
    },
    async () => {
      const user = userEvent.setup();

      render(
        <CustomSelect
          inlineDropdown
          value="team-1"
          onChange={vi.fn()}
          options={[
            { value: "team-1", label: "Nhóm 1" },
            { value: "team-2", label: "Nhóm 2" },
          ]}
        />
      );

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("listbox").className).toContain("relative");
      expect(screen.getByRole("listbox").className).not.toContain("absolute");
    }
  );
});
