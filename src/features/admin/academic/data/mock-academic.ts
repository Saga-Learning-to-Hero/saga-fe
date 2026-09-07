export interface AcademicLecturer {
  id: string;
  fullName: string;
  email: string;
  department: string;
}

export const MOCK_LECTURERS: AcademicLecturer[] = [
  {
    id: "usr-gv-001",
    fullName: "TS. Trần Minh Thuận",
    email: "thuantm@fpt.edu.vn",
    department: "Kỹ thuật phần mềm",
  },
  {
    id: "usr-gv-002",
    fullName: "ThS. Đỗ Khắc Nghĩa",
    email: "nghiadk@fpt.edu.vn",
    department: "Kỹ thuật phần mềm",
  },
  {
    id: "usr-gv-003",
    fullName: "TS. Nguyễn Lê Trúc Quỳnh",
    email: "quynhnlt@fpt.edu.vn",
    department: "Kỹ thuật phần mềm",
  },
  {
    id: "usr-gv-004",
    fullName: "ThS. Hoàng Hải Nam",
    email: "namhh@fpt.edu.vn",
    department: "Kỹ thuật phần mềm",
  },
  {
    id: "usr-gv-005",
    fullName: "TS. Nguyễn Văn Hoàng",
    email: "hoangnv@fpt.edu.vn",
    department: "Kỹ thuật phần mềm",
  },
];
