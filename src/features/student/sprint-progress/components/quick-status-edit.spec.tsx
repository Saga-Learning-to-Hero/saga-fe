import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QuickStatusEdit } from "./quick-status-edit";

describe("QuickStatusEdit Component", () => {
  it("UTCID01 - [N] Normal: Render badge tinh khi nguoi dung khong co quyen chinh sua", () => {
    render(
      <QuickStatusEdit
        issueId="task-1"
        issueKey="SAGA-10"
        status="TODO"
        isTeamLeader={false}
        isOwner={false}
        onStatusChange={vi.fn()}
      />
    );

    const badge = screen.getByText("TODO");
    expect(badge).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("UTCID02 - [N] Normal: Cho phep Leader mo popover va chon doi trang thai sang IN_PROGRESS", async () => {
    const handleStatusChange = vi.fn().mockResolvedValue(undefined);

    render(
      <QuickStatusEdit
        issueId="task-1"
        issueKey="SAGA-10"
        status="TODO"
        isTeamLeader={true}
        isOwner={false}
        onStatusChange={handleStatusChange}
      />
    );

    const triggerBtn = screen.getByRole("button");
    fireEvent.click(triggerBtn);

    expect(screen.getByText("Đổi trạng thái")).toBeInTheDocument();
    expect(screen.getByText("IN PROGRESS (Đang làm)")).toBeInTheDocument();

    const inProgressBtn = screen.getByText("IN PROGRESS (Đang làm)");
    fireEvent.click(inProgressBtn);

    await waitFor(() => {
      expect(handleStatusChange).toHaveBeenCalledWith("task-1", "IN_PROGRESS");
    });
  });

  it("UTCID03 - [N] Normal: Cho phep Task Owner doi trang thai sang DONE", async () => {
    const handleStatusChange = vi.fn().mockResolvedValue(undefined);

    render(
      <QuickStatusEdit
        issueId="task-2"
        issueKey="SAGA-11"
        status="IN_PROGRESS"
        isTeamLeader={false}
        isOwner={true}
        onStatusChange={handleStatusChange}
      />
    );

    const triggerBtn = screen.getByRole("button");
    fireEvent.click(triggerBtn);

    const doneBtn = screen.getByText("DONE (Hoàn thành)");
    fireEvent.click(doneBtn);

    await waitFor(() => {
      expect(handleStatusChange).toHaveBeenCalledWith("task-2", "DONE");
    });
  });

  it("UTCID04 - [B] Boundary: Khong goi onStatusChange neu nguoi dung bam vao dung trang thai hien tai", async () => {
    const handleStatusChange = vi.fn();

    render(
      <QuickStatusEdit
        issueId="task-3"
        issueKey="SAGA-12"
        status="DONE"
        isTeamLeader={true}
        isOwner={false}
        onStatusChange={handleStatusChange}
      />
    );

    const triggerBtn = screen.getByRole("button");
    fireEvent.click(triggerBtn);

    const doneOption = screen.getByText("DONE (Hoàn thành)");
    fireEvent.click(doneOption);

    expect(handleStatusChange).not.toHaveBeenCalled();
  });

  it("UTCID05 - [A] Abnormal: Xu ly on dinh khi onStatusChange bi reject/loi", async () => {
    const handleStatusChange = vi.fn().mockRejectedValue(new Error("Network Error"));

    render(
      <QuickStatusEdit
        issueId="task-4"
        issueKey="SAGA-13"
        status="TODO"
        isTeamLeader={true}
        isOwner={false}
        onStatusChange={handleStatusChange}
      />
    );

    const triggerBtn = screen.getByRole("button");
    fireEvent.click(triggerBtn);

    const reviewBtn = screen.getByText("IN REVIEW (Chờ kiểm thử)");
    fireEvent.click(reviewBtn);

    await waitFor(() => {
      expect(handleStatusChange).toHaveBeenCalledWith("task-4", "IN_REVIEW");
    });
  });
});
