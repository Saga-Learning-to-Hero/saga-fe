import { describe, expect, vi, beforeEach } from "vitest";
import { SyllabusService } from "./syllabus-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

describe("SyllabusService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSummary = {
    id: "799bceba-46dc-4713-8161-0192d01275d2",
    subjectId: "94ced810-3c75-4bfb-b188-c48c2f29651b",
    versionLabel: "v1.0",
    status: "DRAFT" as const,
    titleEnglish: "SWP391 Syllabus",
    titleVietnamese: null,
    credits: 3,
    createdAt: "2026-09-01T00:00:00",
    updatedAt: "2026-09-01T00:00:00",
  };

  const mockDetail = {
    ...mockSummary,
    learningOutcomes: [
      {
        id: "lo-1",
        code: "LO1",
        name: "Deliver product increment",
        orderIndex: 1,
      },
    ],
    learningUnits: [],
    phases: [
      {
        id: "ph-1",
        code: "SPRINT_1",
        name: "Foundation Sprint",
        orderIndex: 1,
        activities: [],
        deliverables: [],
      },
    ],
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "07/09/2026",
      description: "Lấy danh sách các phiên bản đề cương theo subjectId thành công",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: [mockSummary] });

      const res = await SyllabusService.getSyllabi(mockSummary.subjectId);

      expect(res).toHaveLength(1);
      expect(res[0].versionLabel).toBe("v1.0");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "07/09/2026",
      description: "Lấy chi tiết cấu trúc đề cương đầy đủ",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockDetail });

      const res = await SyllabusService.getSyllabusDetail(mockSummary.subjectId, mockSummary.id);

      expect(res.id).toBe(mockSummary.id);
      expect(res.learningOutcomes).toHaveLength(1);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "07/09/2026",
      description: "Tạo phiên bản đề cương DRAFT mới thành công",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: mockSummary });

      const res = await SyllabusService.createDraft(mockSummary.subjectId, {
        versionLabel: "v1.0",
        titleEnglish: "SWP391 Syllabus",
        credits: 3,
      });

      expect(res.versionLabel).toBe("v1.0");
      expect(res.status).toBe("DRAFT");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "07/09/2026",
      description: "Cập nhật metadata phiên bản DRAFT thành công",
    },
    async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: { ...mockSummary, titleEnglish: "Updated Title" },
      });

      const res = await SyllabusService.updateMetadata(mockSummary.subjectId, mockSummary.id, {
        titleEnglish: "Updated Title",
      });

      expect(res.titleEnglish).toBe("Updated Title");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "07/09/2026",
      description: "Thay thế cấu trúc học thuật (Outcomes, Units, Phases) thành công",
    },
    async () => {
      vi.spyOn(apiClient, "put").mockResolvedValueOnce({ data: mockDetail });

      const res = await SyllabusService.replaceStructure(mockSummary.subjectId, mockSummary.id, {
        learningOutcomes: [{ code: "LO1", name: "Deliver product", orderIndex: 1 }],
        phases: [{ code: "P1", name: "Phase 1", orderIndex: 1, activities: [], deliverables: [] }],
      });

      expect(res.learningOutcomes).toHaveLength(1);
      expect(res.phases).toHaveLength(1);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "07/09/2026",
      description: "Xuất bản đề cương thành công, biến thành bất biến",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: {} });

      await SyllabusService.publish(mockSummary.subjectId, mockSummary.id);

      expect(postSpy).toHaveBeenCalledWith(
        `/api/admin/subjects/${mockSummary.subjectId}/syllabi/${mockSummary.id}/publish`
      );
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "07/09/2026",
      description: "Lưu trữ đề cương thành công",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: {} });

      await SyllabusService.archive(mockSummary.subjectId, mockSummary.id);

      expect(postSpy).toHaveBeenCalledWith(
        `/api/admin/subjects/${mockSummary.subjectId}/syllabi/${mockSummary.id}/archive`
      );
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi versionLabel bị để trống",
    },
    async () => {
      await expect(
        SyllabusService.createDraft(mockSummary.subjectId, {
          versionLabel: "",
        })
      ).rejects.toThrow("Throw ValidationException: Version label is required");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi learningOutcomes bị rỗng",
    },
    async () => {
      await expect(
        SyllabusService.replaceStructure(mockSummary.subjectId, mockSummary.id, {
          learningOutcomes: [],
          phases: [{ code: "P1", name: "Phase 1", orderIndex: 1, activities: [], deliverables: [] }],
        })
      ).rejects.toThrow("Throw ValidationException: At least one learning outcome is required");
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi phases bị rỗng",
    },
    async () => {
      await expect(
        SyllabusService.replaceStructure(mockSummary.subjectId, mockSummary.id, {
          learningOutcomes: [{ code: "LO1", name: "Deliver product", orderIndex: 1 }],
          phases: [],
        })
      ).rejects.toThrow("Throw ValidationException: At least one phase is required");
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "A",
      executedDate: "07/09/2026",
      description: "Xử lý lỗi khi sửa cấu trúc đề cương đã PUBLISHED (SYLLABUS_PUBLISHED_IMMUTABLE)",
    },
    async () => {
      vi.spyOn(apiClient, "put").mockRejectedValueOnce(
        new Error("SYLLABUS_PUBLISHED_IMMUTABLE")
      );

      await expect(
        SyllabusService.replaceStructure(mockSummary.subjectId, mockSummary.id, {
          learningOutcomes: [{ code: "LO1", name: "Deliver product", orderIndex: 1 }],
          phases: [{ code: "P1", name: "Phase 1", orderIndex: 1, activities: [], deliverables: [] }],
        })
      ).rejects.toThrow("SYLLABUS_PUBLISHED_IMMUTABLE");
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "A",
      executedDate: "07/09/2026",
      description: "Xử lý lỗi khi Publish đề cương không ở trạng thái DRAFT",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(new Error("SYLLABUS_NOT_DRAFT"));

      await expect(
        SyllabusService.publish(mockSummary.subjectId, mockSummary.id)
      ).rejects.toThrow("SYLLABUS_NOT_DRAFT");
    }
  );

  fptTest(
    {
      id: "UTCID13",
      type: "B",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi subjectId chỉ chứa toàn khoảng trắng",
    },
    async () => {
      await expect(SyllabusService.getSyllabi("   ")).rejects.toThrow(
        "Throw ValidationException: Subject ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "B",
      executedDate: "07/09/2026",
      description: "Tự động trim khoảng trắng cho versionLabel khi tạo",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: mockSummary,
      });

      await SyllabusService.createDraft(mockSummary.subjectId, {
        versionLabel: "  v2.0  ",
      });

      expect(postSpy).toHaveBeenCalledWith(
        `/api/admin/subjects/${mockSummary.subjectId}/syllabi`,
        expect.objectContaining({ versionLabel: "v2.0" })
      );
    }
  );
});
