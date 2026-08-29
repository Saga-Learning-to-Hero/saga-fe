import type {
  SprintItem,
  PeerCriteria,
  PeerReviewMember,
  PeerReviewRecord,
} from "../types/peer-assessment";

export const MOCK_ASSESSMENT_SPRINTS: SprintItem[] = [
  {
    id: "sprint-01",
    name: "Sprint 1 - Authentication & System Setup",
    status: "COMPLETED",
    endDate: "2026-08-14",
    goal: "Khởi tạo hệ thống, thiết lập giao diện base, đăng nhập Google SSO và quản lý vai trò người dùng.",
  },
  {
    id: "sprint-02",
    name: "Sprint 2 - Course Selection & Dashboard Analytics",
    status: "COMPLETED",
    endDate: "2026-08-25",
    goal: "Xây dựng luồng chọn khóa học theo kỳ và đồ thị kết quả học tập cho Sinh viên & Leader.",
  },
  {
    id: "sprint-03",
    name: "Sprint 3 - Core Graph Engine & Integration Link",
    status: "ACTIVE",
    endDate: "2026-09-08",
    goal: "Phát triển đồ thị ma trận ma vết 1-1, kết nối tài khoản Jira/GitHub và hiển thị trang thông tin dự án.",
  },
];

export const MOCK_PEER_CRITERIA: PeerCriteria[] = [
  {
    id: "quality",
    label: "Chất lượng công việc & Mã nguồn",
    description: "Mức độ hoàn thành task chuẩn yêu cầu, code sạch sẽ, tuân thủ convention, ít lỗi/bug.",
    iconName: "CheckSquare",
  },
  {
    id: "punctuality",
    label: "Tiến độ & Đảm bảo Deadline",
    description: "Hoàn thành nhiệm vụ đúng thời hạn của Sprint, không trễ hẹn làm ảnh hưởng tiến độ chung.",
    iconName: "Clock",
  },
  {
    id: "teamwork",
    label: "Tinh thần Hợp tác & Tương tác",
    description: "Giao tiếp cởi mở, tham gia họp nhóm đầy đủ, tích cực review code và hỗ trợ các thành viên khác.",
    iconName: "Users",
  },
  {
    id: "initiative",
    label: "Tính Chủ động & Đóng góp giải pháp",
    description: "Chủ động nhận task khó, đề xuất ý kiến cải tiến kỹ thuật và giải quyết vướng mắc cho nhóm.",
    iconName: "Sparkles",
  },
];

export const MOCK_TEAM_MEMBERS_ASSESSMENT: PeerReviewMember[] = [
  {
    id: "sv-01",
    studentCode: "HE170504",
    name: "Lê Hoàng Hải",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=saga-user",
    role: "LEADER",
    sprintStats: {
      tasksDone: 5,
      storyPoints: 18,
      commitsCount: 16,
    },
  },
  {
    id: "sv-02",
    studentCode: "SE171234",
    name: "Nguyễn Đức Trung",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=trungnd",
    role: "MEMBER",
    sprintStats: {
      tasksDone: 4,
      storyPoints: 12,
      commitsCount: 10,
    },
  },
  {
    id: "sv-03",
    studentCode: "SE173456",
    name: "Phạm Phương Anh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anhpt",
    role: "MEMBER",
    sprintStats: {
      tasksDone: 3,
      storyPoints: 10,
      commitsCount: 8,
    },
  },
  {
    id: "sv-04",
    studentCode: "SE172345",
    name: "Vũ Tuấn Minh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=minhvt",
    role: "MEMBER",
    sprintStats: {
      tasksDone: 3,
      storyPoints: 8,
      commitsCount: 6,
    },
  },
  {
    id: "sv-05",
    studentCode: "SE175678",
    name: "Đỗ Thùy Linh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=linhdt",
    role: "MEMBER",
    sprintStats: {
      tasksDone: 2,
      storyPoints: 5,
      commitsCount: 4,
    },
  },
];

export const INITIAL_MOCK_RECORDS: PeerReviewRecord[] = [
  {
    id: "rec-01",
    sprintId: "sprint-02",
    evaluatorStudentCode: "HE170504",
    targetStudentCode: "SE171234", // Nguyễn Đức Trung
    isCompleted: true,
    scores: {
      quality: 5,
      punctuality: 4,
      teamwork: 5,
      initiative: 4,
    },
    comment: "Trung làm việc rất trách nhiệm, tích cực review code và hỗ trợ xử lý bug giao diện mượt mà.",
    updatedAt: "2026-08-25T16:00:00Z",
  },
  {
    id: "rec-02",
    sprintId: "sprint-02",
    evaluatorStudentCode: "HE170504",
    targetStudentCode: "SE173456", // Phạm Phương Anh
    isCompleted: true,
    scores: {
      quality: 4,
      punctuality: 5,
      teamwork: 4,
      initiative: 4,
    },
    comment: "Phương Anh hoàn thành đúng tiến độ các giao diện cá nhân, tương tác cởi mở với cả nhóm.",
    updatedAt: "2026-08-25T16:30:00Z",
  },
];
