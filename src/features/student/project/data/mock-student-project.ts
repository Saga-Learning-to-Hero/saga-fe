import type { StudentProjectDetails } from "../types/student-project";

export const EMPTY_STUDENT_PROJECT: StudentProjectDetails = {
  id: "",
  projectId: "",
  courseId: "",
  teamId: "",
  teamNo: 0,
  teamName: "",
  name: "",
  description: "",
  projectType: {
    id: "",
    code: "",
    name: "",
  },
  createdBy: {
    userId: "",
    fullName: "",
  },
  createdAt: "",
  category: "",
  groupName: "",
  members: [],
};

export const MOCK_STUDENT_PROJECT = EMPTY_STUDENT_PROJECT;
