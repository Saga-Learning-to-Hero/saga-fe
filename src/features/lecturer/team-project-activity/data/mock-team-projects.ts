import type { TeamProjectInfo, TeamMember, CommitActivity, JiraIssue } from "../types/team-project";

export const MOCK_MEMBERS: TeamMember[] = [
  { id: "s1", studentCode: "SE160001", studentId: "SE160001", fullName: "Nguyễn Văn A", name: "Nguyễn Văn A", email: "anv@fpt.edu.vn", role: "LEADER", groupId: "team-01", groupName: "Nhóm 01", status: "ACTIVE", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anv", commitsCount: 38, tasksCount: 12 },
  { id: "s2", studentCode: "SE160002", studentId: "SE160002", fullName: "Trần Thị B", name: "Trần Thị B", email: "btt@fpt.edu.vn", role: "MEMBER", groupId: "team-01", groupName: "Nhóm 01", status: "ACTIVE", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=btt", commitsCount: 29, tasksCount: 10 },
  { id: "s3", studentCode: "SE160003", studentId: "SE160003", fullName: "Lê Văn C", name: "Lê Văn C", email: "clv@fpt.edu.vn", role: "MEMBER", groupId: "team-01", groupName: "Nhóm 01", status: "ACTIVE", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=clv", commitsCount: 25, tasksCount: 8 },
  { id: "s4", studentCode: "SE160004", studentId: "SE160004", fullName: "Phạm Thị D", name: "Phạm Thị D", email: "dpt@fpt.edu.vn", role: "MEMBER", groupId: "team-01", groupName: "Nhóm 01", status: "ACTIVE", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dpt", commitsCount: 18, tasksCount: 6 },
  { id: "s5", studentCode: "SE160005", studentId: "SE160005", fullName: "Hoàng Văn E", name: "Hoàng Văn E", email: "ehv@fpt.edu.vn", role: "LEADER", groupId: "team-02", groupName: "Nhóm 02", status: "ACTIVE", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ehv", commitsCount: 35, tasksCount: 11 },
  { id: "s6", studentCode: "SE160006", studentId: "SE160006", fullName: "Đặng Thị F", name: "Đặng Thị F", email: "fdt@fpt.edu.vn", role: "MEMBER", groupId: "team-02", groupName: "Nhóm 02", status: "ACTIVE", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fdt", commitsCount: 22, tasksCount: 7 },
  { id: "s7", studentCode: "SE160007", studentId: "SE160007", fullName: "Bùi Văn G", name: "Bùi Văn G", email: "gbv@fpt.edu.vn", role: "MEMBER", groupId: "team-02", groupName: "Nhóm 02", status: "ACTIVE", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=gbv", commitsCount: 20, tasksCount: 7 },
  { id: "s8", studentCode: "SE160008", studentId: "SE160008", fullName: "Ngô Thị H", name: "Ngô Thị H", email: "hnt@fpt.edu.vn", role: "MEMBER", groupId: "team-03", groupName: "Nhóm 03", status: "ACTIVE", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hnt", commitsCount: 4, tasksCount: 2 },
  { id: "s9", studentCode: "SE160009", studentId: "SE160009", fullName: "Đỗ Văn I", name: "Đỗ Văn I", email: "idv@fpt.edu.vn", role: "MEMBER", groupId: "team-03", groupName: "Nhóm 03", status: "ACTIVE", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=idv", commitsCount: 3, tasksCount: 1 },
  { id: "s10", studentCode: "SE160010", studentId: "SE160010", fullName: "Vũ Thị K", name: "Vũ Thị K", email: "kvt@fpt.edu.vn", role: "MEMBER", groupId: null, groupName: null, status: "ACTIVE", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kvt", commitsCount: 0, tasksCount: 0 },
];

export const MOCK_PROJECTS: TeamProjectInfo[] = [
  {
    id: "team-01",
    teamName: "Nhóm 01 - Library System",
    groupName: "Nhóm 01 - Library System",
    projectName: "Hệ thống quản lý thư viện (Library Management System)",
    description: "Xây dựng hệ thống quản lý mượn trả sách, quản lý người dùng và thống kê kho sách cho thư viện trường đại học.",
    leaderId: "s1",
    members: MOCK_MEMBERS.filter(m => m.groupId === "team-01"),
    githubRepo: "saga-team-01/library-system",
    githubRepository: "saga-team-01/library-system",
    jiraProjectKey: "LIB",
    currentSprint: "Sprint 2",
    startDate: "2026-08-01",
    deadline: "2026-10-15",
    status: "ACTIVE",
    lastSyncAt: "2026-08-30T10:30:00Z",
  },
  {
    id: "team-02",
    teamName: "Nhóm 02 - Food Delivery",
    groupName: "Nhóm 02 - Food Delivery",
    projectName: "Ứng dụng đặt đồ ăn trực tuyến (Food Delivery App)",
    description: "Nền tảng kết nối nhà hàng và khách hàng, hỗ trợ đặt món, theo dõi đơn hàng và thanh toán trực tuyến.",
    leaderId: "s5",
    members: MOCK_MEMBERS.filter(m => m.groupId === "team-02"),
    githubRepo: "saga-team-02/food-delivery",
    githubRepository: "saga-team-02/food-delivery",
    jiraProjectKey: "FOOD",
    currentSprint: "Sprint 3",
    startDate: "2026-08-01",
    deadline: "2026-10-15",
    status: "ACTIVE",
    lastSyncAt: "2026-08-30T09:15:00Z",
  },
  {
    id: "team-03",
    teamName: "Nhóm 03 - Quiz Online",
    groupName: "Nhóm 03 - Quiz Online",
    projectName: "Phần mềm thi trắc nghiệm (Quiz Online)",
    description: "Hệ thống tổ chức thi trắc nghiệm trực tuyến với các tính năng tạo đề, chống gian lận và chấm điểm tự động.",
    leaderId: null, // Nhóm chưa có leader
    members: MOCK_MEMBERS.filter(m => m.groupId === "team-03"),
    githubRepo: null, // Chưa liên kết Github
    githubRepository: null,
    jiraProjectKey: null, // Chưa liên kết Jira
    currentSprint: null,
    startDate: "2026-08-01",
    deadline: "2026-10-15",
    status: "PLANNED",
    lastSyncAt: null,
  }
];

export const MOCK_COMMITS: CommitActivity[] = [
  { id: "c1", authorId: "s1", authorName: "Nguyễn Văn A", message: "feat: Khởi tạo project Next.js", shortSha: "a1b2c3d", fullSha: "a1b2c3d4e5f6g7h8i9j0", hash: "a1b2c3d4e5f6g7h8i9j0", shortHash: "a1b2c3d", branch: "main", createdAt: "2026-08-15T08:00:00Z", filesChanged: 15, additions: 450, deletions: 10, jiraIssueKey: "LIB-1", jiraKey: "LIB-1" },
  { id: "c2", authorId: "s2", authorName: "Trần Thị B", message: "feat: Cài đặt Tailwind CSS và UI components", shortSha: "b2c3d4e", fullSha: "b2c3d4e5f6g7h8i9j0a1", hash: "b2c3d4e5f6g7h8i9j0a1", shortHash: "b2c3d4e", branch: "feature/ui-setup", createdAt: "2026-08-16T09:30:00Z", filesChanged: 8, additions: 200, deletions: 5, jiraIssueKey: "LIB-2", jiraKey: "LIB-2" },
  { id: "c3", authorId: "s3", authorName: "Lê Văn C", message: "feat: Xây dựng database schema cho sách và người dùng", shortSha: "c3d4e5f", fullSha: "c3d4e5f6g7h8i9j0a1b2", hash: "c3d4e5f6g7h8i9j0a1b2", shortHash: "c3d4e5f", branch: "feature/database", createdAt: "2026-08-17T14:15:00Z", filesChanged: 4, additions: 120, deletions: 0, jiraIssueKey: "LIB-3", jiraKey: "LIB-3" },
  { id: "c4", authorId: "s1", authorName: "Nguyễn Văn A", message: "fix: Lỗi đăng nhập không lưu token", shortSha: "d4e5f6g", fullSha: "d4e5f6g7h8i9j0a1b2c3", hash: "d4e5f6g7h8i9j0a1b2c3", shortHash: "d4e5f6g", branch: "fix/auth", createdAt: "2026-08-18T10:00:00Z", filesChanged: 2, additions: 15, deletions: 8, jiraIssueKey: "LIB-4", jiraKey: "LIB-4" },
  { id: "c5", authorId: "s4", authorName: "Phạm Thị D", message: "docs: Cập nhật README và tài liệu API", shortSha: "e5f6g7h", fullSha: "e5f6g7h8i9j0a1b2c3d4", hash: "e5f6g7h8i9j0a1b2c3d4", shortHash: "e5f6g7h", branch: "docs/readme", createdAt: "2026-08-19T16:45:00Z", filesChanged: 3, additions: 180, deletions: 20, jiraIssueKey: null, jiraKey: null },
  { id: "c6", authorId: "s2", authorName: "Trần Thị B", message: "feat: Hoàn thiện giao diện trang chủ thư viện", shortSha: "f6g7h8i", fullSha: "f6g7h8i9j0a1b2c3d4e5", hash: "f6g7h8i9j0a1b2c3d4e5", shortHash: "f6g7h8i", branch: "feature/home-page", createdAt: "2026-08-20T11:20:00Z", filesChanged: 5, additions: 300, deletions: 45, jiraIssueKey: "LIB-5", jiraKey: "LIB-5" },
  { id: "c7", authorId: "s3", authorName: "Lê Văn C", message: "feat: API thêm/sửa/xóa sách", shortSha: "g7h8i9j", fullSha: "g7h8i9j0a1b2c3d4e5f6", hash: "g7h8i9j0a1b2c3d4e5f6", shortHash: "g7h8i9j", branch: "feature/book-api", createdAt: "2026-08-22T09:10:00Z", filesChanged: 6, additions: 250, deletions: 12, jiraIssueKey: "LIB-6", jiraKey: "LIB-6" },
  { id: "c8", authorId: "s1", authorName: "Nguyễn Văn A", message: "refactor: Tối ưu hóa truy vấn CSDL", shortSha: "h8i9j0a", fullSha: "h8i9j0a1b2c3d4e5f6g7", hash: "h8i9j0a1b2c3d4e5f6g7", shortHash: "h8i9j0a", branch: "refactor/db-perf", createdAt: "2026-08-25T15:30:00Z", filesChanged: 3, additions: 40, deletions: 120, jiraIssueKey: "LIB-7", jiraKey: "LIB-7" },
  { id: "c9", authorId: "s2", authorName: "Trần Thị B", message: "feat: Trang chi tiết sách và chức năng mượn sách", shortSha: "i9j0a1b", fullSha: "i9j0a1b2c3d4e5f6g7h8", hash: "i9j0a1b2c3d4e5f6g7h8", shortHash: "i9j0a1b", branch: "feature/book-detail", createdAt: "2026-08-27T14:00:00Z", filesChanged: 7, additions: 350, deletions: 30, jiraIssueKey: "LIB-8", jiraKey: "LIB-8" },
  { id: "c10", authorId: "s1", authorName: "Nguyễn Văn A", message: "Merge pull request #5 from feature/book-detail", shortSha: "j0a1b2c", fullSha: "j0a1b2c3d4e5f6g7h8i9", hash: "j0a1b2c3d4e5f6g7h8i9", shortHash: "j0a1b2c", branch: "main", createdAt: "2026-08-28T10:00:00Z", filesChanged: 0, additions: 0, deletions: 0, jiraIssueKey: null, jiraKey: null },
];

export const MOCK_JIRA_ISSUES: JiraIssue[] = [
  { id: "i1", key: "LIB-1", summary: "Thiết lập cấu trúc project và repository", type: "TASK", priority: "HIGHEST", assigneeId: "s1", storyPoint: 3, labels: ["setup"], dueDate: "2026-08-15", status: "DONE" },
  { id: "i2", key: "LIB-2", summary: "Xây dựng hệ thống UI Components cơ bản", type: "STORY", priority: "HIGH", assigneeId: "s2", storyPoint: 5, labels: ["frontend", "ui"], dueDate: "2026-08-18", status: "DONE" },
  { id: "i3", key: "LIB-3", summary: "Thiết kế CSDL Database Schema", type: "TASK", priority: "HIGH", assigneeId: "s3", storyPoint: 5, labels: ["backend", "db"], dueDate: "2026-08-18", status: "DONE" },
  { id: "i4", key: "LIB-4", summary: "Sửa lỗi mất session khi reload trang", type: "BUG", priority: "HIGHEST", assigneeId: "s1", storyPoint: 2, labels: ["auth", "bug"], dueDate: "2026-08-20", status: "DONE" },
  { id: "i5", key: "LIB-5", summary: "Phát triển giao diện trang chủ", type: "STORY", priority: "MEDIUM", assigneeId: "s2", storyPoint: 3, labels: ["frontend"], dueDate: "2026-08-22", status: "DONE" },
  { id: "i6", key: "LIB-6", summary: "Xây dựng các REST API quản lý sách", type: "STORY", priority: "HIGH", assigneeId: "s3", storyPoint: 8, labels: ["backend", "api"], dueDate: "2026-08-25", status: "DONE" },
  { id: "i7", key: "LIB-7", summary: "Tối ưu hóa performance truy vấn danh sách", type: "TASK", priority: "MEDIUM", assigneeId: "s1", storyPoint: 3, labels: ["performance"], dueDate: "2026-08-28", status: "DONE" },
  { id: "i8", key: "LIB-8", summary: "Tích hợp giỏ hàng mượn sách", type: "STORY", priority: "HIGH", assigneeId: "s2", storyPoint: 5, labels: ["frontend"], dueDate: "2026-08-30", status: "IN_REVIEW" },
  { id: "i9", key: "LIB-9", summary: "Gửi email nhắc nhở quá hạn", type: "STORY", priority: "MEDIUM", assigneeId: "s4", storyPoint: 5, labels: ["backend", "email"], dueDate: "2026-09-02", status: "IN_PROGRESS" },
  { id: "i10", key: "LIB-10", summary: "Fix lỗi không hiển thị hình ảnh sách trên Safari", type: "BUG", priority: "HIGH", assigneeId: "s2", storyPoint: 2, labels: ["frontend", "bug"], dueDate: "2026-08-29", status: "BLOCKED" },
  { id: "i11", key: "LIB-11", summary: "Tích hợp cổng thanh toán phí mượn quá hạn", type: "STORY", priority: "HIGHEST", assigneeId: null, storyPoint: 8, labels: ["payment", "backend"], dueDate: "2026-09-10", status: "TODO" },
  { id: "i12", key: "LIB-12", summary: "Viết tài liệu hướng dẫn sử dụng cho thủ thư", type: "TASK", priority: "LOW", assigneeId: "s4", storyPoint: 3, labels: ["docs"], dueDate: "2026-09-15", status: "TODO" },
];
