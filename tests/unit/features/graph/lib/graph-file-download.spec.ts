import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { resolveGraphFileDownloadContext } from "@/features/graph/lib/graph-file-download";

const fileNode = {
  id: "file:aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  type: "FILE" as const,
  label: "pak.drawio.png",
  subLabel: "image/png",
};

const taskEdge = {
  data: {
    id: "e-file",
    source: "task:11111111-2222-4333-8444-555555555555",
    target: fileNode.id,
    label: "EVIDENCED_BY" as const,
  },
};

describe("resolveGraphFileDownloadContext", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "04/10/2026",
      description: "Node file va canh EVIDENCED_BY resolve dung taskId, fileId, filename",
    },
    () => {
      expect(resolveGraphFileDownloadContext(fileNode, [taskEdge])).toEqual({
        taskId: "11111111-2222-4333-8444-555555555555",
        fileId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        filename: "pak.drawio.png",
      });
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "04/10/2026",
      description: "Khong nhan canh dao chieu hoac label khac EVIDENCED_BY",
    },
    () => {
      expect(
        resolveGraphFileDownloadContext(fileNode, [
          {
            data: {
              source: fileNode.id,
              target: "task:11111111-2222-4333-8444-555555555555",
              label: "EVIDENCED_BY",
            },
          },
        ])
      ).toBeNull();
      expect(
        resolveGraphFileDownloadContext(fileNode, [
          {
            data: {
              source: "task:11111111-2222-4333-8444-555555555555",
              target: fileNode.id,
              label: "ASSIGNED_TO",
            },
          },
        ])
      ).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "04/10/2026",
      description: "FILE thieu canh hoac prefix sai tra null, khong doan tu label",
    },
    () => {
      expect(resolveGraphFileDownloadContext(fileNode, [])).toBeNull();
      expect(
        resolveGraphFileDownloadContext(
          { ...fileNode, id: "attachment:pak.drawio.png" },
          [taskEdge]
        )
      ).toBeNull();
      expect(
        resolveGraphFileDownloadContext(
          { id: "commit:abc", type: "COMMIT", label: "abc" },
          [taskEdge]
        )
      ).toBeNull();
    }
  );
});
