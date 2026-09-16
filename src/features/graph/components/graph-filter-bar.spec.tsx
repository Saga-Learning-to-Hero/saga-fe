import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GraphFilterBar } from "./graph-filter-bar";
import { PipelineRepositoryFilters } from "./pipeline-repository-filters";

function FilterHarness() {
  const [studentId, setStudentId] = useState("ALL");
  const [sprintId, setSprintId] = useState("ALL");
  const [repoId, setRepoId] = useState("ALL");
  const [branchName, setBranchName] = useState("ALL");
  const repositories = [
    { id: "repo-1", repositoryId: 123, fullName: "org/saga-fe" },
    { id: "repo-2", repositoryId: 456, fullName: "org/saga-api" },
  ];
  const selectedRepository = repositories.find((repository) => repository.id === repoId);

  const reset = () => {
    setStudentId("ALL");
    setSprintId("ALL");
    setRepoId("ALL");
    setBranchName("ALL");
  };

  const extraActiveFilters = [
    repoId !== "ALL"
      ? {
          key: "repository",
          label: `Repository: ${selectedRepository?.fullName || repoId}`,
          onClear: () => {
            setRepoId("ALL");
            setBranchName("ALL");
          },
        }
      : null,
    branchName !== "ALL"
      ? {
          key: "branch",
          label: `Branch: ${branchName}`,
          onClear: () => setBranchName("ALL"),
        }
      : null,
  ].filter(
    (filter): filter is { key: string; label: string; onClear: () => void } => filter !== null
  );

  return (
    <GraphFilterBar
      selectedStudentId={studentId}
      onSelectStudent={setStudentId}
      selectedSprint={sprintId}
      onSelectSprint={setSprintId}
      filterType="ALL"
      onSelectFilterType={vi.fn()}
      onExport={vi.fn()}
      onReset={reset}
      anomaliesCount={2}
      memberOptions={[{ value: "student-1", label: "Lê Hoàng Hải" }]}
      sprintOptions={[{ value: "sprint-4", label: "Sprint 4" }]}
      extraActiveFilters={extraActiveFilters}
      extraCollapsibleContent={
        <PipelineRepositoryFilters
          embedded
          idPrefix="test-pipeline"
          repositories={repositories}
          branches={[{ name: "main", isDefault: true }]}
          selectedRepoId={repoId}
          selectedBranchName={branchName}
          onSelectRepository={setRepoId}
          onSelectBranch={setBranchName}
        />
      }
    />
  );
}

describe("GraphFilterBar", () => {
  it("hien thi bon bo loc trong mot responsive grid va khoa Branch khi chua chon Repository", async () => {
    const user = userEvent.setup();
    render(<FilterHarness />);

    await user.click(screen.getByRole("button", { name: /Bộ lọc/ }));

    const memberFilter = screen.getByLabelText("Thành viên");
    const filterGrid = memberFilter.closest(".grid");
    expect(filterGrid).toHaveClass("grid-cols-1", "sm:grid-cols-2", "xl:grid-cols-4");
    expect(screen.getByLabelText("Sprint")).toBeEnabled();
    expect(screen.getByLabelText("Repository")).toBeEnabled();
    expect(screen.getByLabelText("Branch")).toBeDisabled();
    expect(screen.getByLabelText("Branch")).toHaveTextContent("Chọn Repository trước");
  });

  it("reset Branch khi doi Repository va hien chip Repository Branch khi thu gon", async () => {
    const user = userEvent.setup();
    render(<FilterHarness />);

    await user.click(screen.getByRole("button", { name: /Bộ lọc/ }));
    await user.click(screen.getByLabelText("Repository"));
    await user.click(screen.getByText("org/saga-fe"));

    expect(screen.getByLabelText("Branch")).toBeEnabled();
    await user.click(screen.getByLabelText("Branch"));
    await user.click(screen.getByText("main"));

    await user.click(screen.getByLabelText("Repository"));
    await user.click(screen.getByText("org/saga-api"));
    expect(screen.getByLabelText("Branch")).toHaveTextContent("Tất cả nhánh");

    await user.click(screen.getByLabelText("Branch"));
    await user.click(screen.getByText("main"));
    await user.click(screen.getByRole("button", { name: /Bộ lọc/ }));

    expect(screen.getByText("Repository: org/saga-api")).toBeVisible();
    expect(screen.getByText("Branch: main")).toBeVisible();
    expect(screen.getByRole("button", { name: /Bộ lọc\s*2/ })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Xóa bộ lọc Repository: org/saga-api" }));
    expect(screen.queryByText("Repository: org/saga-api")).not.toBeInTheDocument();
    expect(screen.queryByText("Branch: main")).not.toBeInTheDocument();
  });

  it("giu filter khi dong mo va dat lai tat ca tu toolbar", async () => {
    const user = userEvent.setup();
    render(<FilterHarness />);

    await user.click(screen.getByRole("button", { name: /Bộ lọc/ }));
    await user.click(screen.getByLabelText("Thành viên"));
    await user.click(screen.getByText("Lê Hoàng Hải"));
    await user.click(screen.getByLabelText("Sprint"));
    await user.click(screen.getByText("Sprint 4"));
    await user.click(screen.getByRole("button", { name: /Bộ lọc/ }));

    expect(screen.getByText("Thành viên: Lê Hoàng Hải")).toBeVisible();
    expect(screen.getByText("Sprint: Sprint 4")).toBeVisible();

    await user.click(screen.getByRole("button", { name: /Bộ lọc\s*2/ }));
    expect(screen.getByLabelText("Thành viên")).toHaveTextContent("Lê Hoàng Hải");
    expect(screen.getByLabelText("Sprint")).toHaveTextContent("Sprint 4");
    await user.click(screen.getByRole("button", { name: /Bộ lọc\s*2/ }));

    await user.click(screen.getByRole("button", { name: "Đặt lại" }));
    expect(screen.queryByText("Thành viên: Lê Hoàng Hải")).not.toBeInTheDocument();
    expect(screen.queryByText("Sprint: Sprint 4")).not.toBeInTheDocument();
  });

  it("an CustomSelect thanh vien khi roster rong", async () => {
    const user = userEvent.setup();
    render(
      <GraphFilterBar
        selectedStudentId="ALL"
        onSelectStudent={vi.fn()}
        selectedSprint="ALL"
        onSelectSprint={vi.fn()}
        filterType="ALL"
        onSelectFilterType={vi.fn()}
        onExport={vi.fn()}
        onReset={vi.fn()}
        anomaliesCount={0}
        memberOptions={[]}
        sprintOptions={[{ value: "sprint-4", label: "Sprint 4" }]}
      />
    );

    await user.click(screen.getByRole("button", { name: /Bộ lọc/ }));
    expect(screen.queryByLabelText("Thành viên")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Sprint")).toBeInTheDocument();
  });
});
