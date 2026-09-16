import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import type { CytoscapeNodeData } from "../types/graph";
import {
  isStudentProfileUuid,
  mapStudentNodesToMemberOptions,
  parseStudentNodeProfileId,
  resolveDrillDownStudent,
  resolveStudentProfileId,
} from "./student-profile-id";

const VALID_UUID = "80ffd344-5190-4373-a2fb-10e74d64e55d";
const VALID_NODE_ID = `student:${VALID_UUID}`;

describe("student-profile-id", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "17/09/2026",
      description: "Nhan UUID RFC 4122 hop le, khong phan biet hoa thuong",
    },
    () => {
      expect(isStudentProfileUuid(VALID_UUID)).toBe(true);
      expect(isStudentProfileUuid(VALID_UUID.toUpperCase())).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "17/09/2026",
      description: "parseStudentNodeProfileId chi lay UUID tu node STUDENT student:{uuid}",
    },
    () => {
      const node: CytoscapeNodeData = {
        id: VALID_NODE_ID,
        label: "Tran Van B",
        type: "STUDENT",
        subLabel: "SE171184",
      };
      expect(parseStudentNodeProfileId(node)).toBe(VALID_UUID);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "17/09/2026",
      description: "resolveStudentProfileId chap nhan student:{uuid} hoac UUID da strip",
    },
    () => {
      expect(resolveStudentProfileId(VALID_NODE_ID)).toBe(VALID_UUID);
      expect(resolveStudentProfileId(`  ${VALID_UUID}  `)).toBe(VALID_UUID);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "17/09/2026",
      description: "Map roster node sang option value=UUID, label ten, subLabel MSSV chi la nhan",
    },
    () => {
      const options = mapStudentNodesToMemberOptions([
        {
          data: {
            id: VALID_NODE_ID,
            label: "Tran Van B",
            type: "STUDENT",
            subLabel: "SE171184",
            role: "LEADER",
          },
        },
      ]);

      expect(options).toEqual([
        {
          value: VALID_UUID,
          label: "Tran Van B",
          subLabel: "SE171184",
        },
      ]);
      expect(options[0].value).not.toContain("SE171184");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "17/09/2026",
      description: "Filter UUID va modal student:{uuid} cho cung studentProfileId",
    },
    () => {
      const memberOptions = mapStudentNodesToMemberOptions([
        { data: { id: VALID_NODE_ID, label: "Tran Van B", type: "STUDENT" } },
      ]);
      const fromFilter = resolveDrillDownStudent(VALID_UUID, { memberOptions });
      const fromModal = resolveDrillDownStudent(VALID_NODE_ID, {
        memberOptions,
        fallbackLabel: "Tran Van B",
      });

      expect(fromFilter).toEqual({ studentProfileId: VALID_UUID, label: "Tran Van B" });
      expect(fromModal).toEqual(fromFilter);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "17/09/2026",
      description: "Loai studentCode SE171184 va student:SE171184, khong fallback",
    },
    () => {
      expect(resolveStudentProfileId("SE171184")).toBeNull();
      expect(resolveStudentProfileId("student:SE171184")).toBeNull();
      expect(
        parseStudentNodeProfileId({
          id: "student:SE171184",
          type: "STUDENT",
        })
      ).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "17/09/2026",
      description: "Loai UUID tran tren node id, thieu prefix, Jira va GitHub id",
    },
    () => {
      expect(
        parseStudentNodeProfileId({
          id: VALID_UUID,
          type: "STUDENT",
        })
      ).toBeNull();
      expect(
        parseStudentNodeProfileId({
          id: "task:80ffd344-5190-4373-a2fb-10e74d64e55d",
          type: "TASK",
        })
      ).toBeNull();
      expect(resolveStudentProfileId("jira:account-1")).toBeNull();
      expect(resolveStudentProfileId("github:user-99")).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "17/09/2026",
      description: "ALL, rong, null khong tao drill-down",
    },
    () => {
      expect(resolveStudentProfileId("ALL")).toBeNull();
      expect(resolveStudentProfileId("")).toBeNull();
      expect(resolveStudentProfileId("   ")).toBeNull();
      expect(resolveStudentProfileId(null)).toBeNull();
      expect(resolveDrillDownStudent("ALL", { memberOptions: [] })).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "17/09/2026",
      description: "Map roster rong hoac node khong hop le khong dua studentCode vao value",
    },
    () => {
      const options = mapStudentNodesToMemberOptions([
        { data: { id: "student:SE171184", label: "Sai ma", type: "STUDENT", subLabel: "SE171184" } },
        { data: { id: VALID_UUID, label: "UUID tran", type: "STUDENT" } },
        { data: { id: "task:t1", label: "SAGA-1", type: "TASK" } },
      ]);

      expect(options).toEqual([]);
      expect(JSON.stringify(options)).not.toContain("SE171184");
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "B",
      executedDate: "17/09/2026",
      description: "Bo trung UUID va chuan hoa lowercase; khong dung user.id/accountId",
    },
    () => {
      const options = mapStudentNodesToMemberOptions([
        {
          data: {
            id: `student:${VALID_UUID.toUpperCase()}`,
            label: "Tran Van B",
            type: "STUDENT",
            role: "LEADER",
          },
        },
        { data: { id: VALID_NODE_ID, label: "Ban sao", type: "STUDENT" } },
      ]);

      expect(options).toHaveLength(1);
      expect(options[0].value).toBe(VALID_UUID);
      expect(resolveStudentProfileId("user:80ffd344-5190-4373-a2fb-10e74d64e55d")).toBeNull();
    }
  );
});
