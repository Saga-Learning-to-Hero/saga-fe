import type { CourseDashboardData } from "../types/course-dashboard";
import { MOCK_LECTURER_COURSES } from "../../courses/data/mock-courses";

export const MOCK_PRN212_DASHBOARD: CourseDashboardData = {
  course: MOCK_LECTURER_COURSES.find(c => c.id === "prn212-01")!,
  summary: {
    studentCount: 42,
    activeStudentCount: 40,
    groupCount: 8,
    healthyGroupCount: 7,
    semesterProgress: 68,
    currentWeek: "Tuần 10/15",
    alertCount: 3,
  },
  integrations: {
    jira: {
      connectedGroups: 7,
      totalGroups: 8,
      percentage: 87.5,
      status: "PARTIAL",
      lastSync: "2 phút trước",
      unconnectedGroups: ["Nhóm 05"],
    },
    github: {
      connectedGroups: 8,
      totalGroups: 8,
      percentage: 100,
      status: "CONNECTED",
      lastSync: "2 phút trước",
      unconnectedGroups: [],
    }
  },
  weeklyProgress: [
    { week: "Tuần 1", taskCompletion: 5, expectedProgress: 5, commitCount: 12 },
    { week: "Tuần 2", taskCompletion: 12, expectedProgress: 10, commitCount: 25 },
    { week: "Tuần 3", taskCompletion: 18, expectedProgress: 18, commitCount: 45 },
    { week: "Tuần 4", taskCompletion: 25, expectedProgress: 26, commitCount: 52 },
    { week: "Tuần 5", taskCompletion: 34, expectedProgress: 35, commitCount: 70 },
    { week: "Tuần 6", taskCompletion: 42, expectedProgress: 44, commitCount: 65 },
    { week: "Tuần 7", taskCompletion: 54, expectedProgress: 47, commitCount: 86 },
    { week: "Tuần 8", taskCompletion: 60, expectedProgress: 55, commitCount: 92 },
    { week: "Tuần 9", taskCompletion: 65, expectedProgress: 61, commitCount: 110 },
    { week: "Tuần 10", taskCompletion: 68, expectedProgress: 68, commitCount: 88 },
  ],
  groups: [
    { id: "g1", name: "Nhóm 01", projectName: "Hệ thống quản lý thư viện", memberCount: 5, currentSprint: "Sprint 3", tasksCompleted: 18, totalTasks: 24, commitsLast7Days: 32, contributionBalance: 92, status: "HEALTHY" },
    { id: "g2", name: "Nhóm 02", projectName: "App đặt đồ ăn sinh viên", memberCount: 5, currentSprint: "Sprint 3", tasksCompleted: 20, totalTasks: 25, commitsLast7Days: 45, contributionBalance: 88, status: "HEALTHY" },
    { id: "g3", name: "Nhóm 03", projectName: "Nền tảng thi trắc nghiệm", memberCount: 6, currentSprint: "Sprint 3", tasksCompleted: 15, totalTasks: 22, commitsLast7Days: 28, contributionBalance: 65, status: "WARNING" },
    { id: "g4", name: "Nhóm 04", projectName: "Mạng xã hội cựu sinh viên", memberCount: 5, currentSprint: "Sprint 3", tasksCompleted: 19, totalTasks: 26, commitsLast7Days: 38, contributionBalance: 90, status: "HEALTHY" },
    { id: "g5", name: "Nhóm 05", projectName: "Hệ thống booking phòng lab", memberCount: 5, currentSprint: "Sprint 3", tasksCompleted: 8, totalTasks: 20, commitsLast7Days: 0, contributionBalance: 40, status: "CRITICAL" },
    { id: "g6", name: "Nhóm 06", projectName: "Chatbot tư vấn tuyển sinh", memberCount: 5, currentSprint: "Sprint 3", tasksCompleted: 22, totalTasks: 24, commitsLast7Days: 50, contributionBalance: 95, status: "HEALTHY" },
    { id: "g7", name: "Nhóm 07", projectName: "Sàn giao dịch đồ cũ FPT", memberCount: 6, currentSprint: "Sprint 3", tasksCompleted: 17, totalTasks: 23, commitsLast7Days: 30, contributionBalance: 82, status: "HEALTHY" },
    { id: "g8", name: "Nhóm 08", projectName: "Quản lý thiết bị IoT", memberCount: 5, currentSprint: "Sprint 3", tasksCompleted: 21, totalTasks: 26, commitsLast7Days: 42, contributionBalance: 85, status: "HEALTHY" },
  ],
  alerts: [
    { id: "a1", severity: "CRITICAL", title: "Nhóm 05 không có commit trong 6 ngày", reason: "Nguy cơ chậm tiến độ đồ án nghiêm trọng", timeAgo: "1 giờ trước", actionLabel: "Xem nhóm", actionUrl: "/lecturer/groups/g5" },
    { id: "a2", severity: "WARNING", title: "Thành viên đóng góp thấp", reason: "Nguyễn Văn B chỉ chiếm 4% hoạt động của Nhóm 03", timeAgo: "3 giờ trước", actionLabel: "Xem sinh viên", actionUrl: "/lecturer/students/b" },
    { id: "a3", severity: "INFO", title: "Nhóm 05 chưa kết nối Jira", reason: "Chưa thể đồng bộ task", timeAgo: "1 ngày trước", actionLabel: "Cấu hình", actionUrl: "/lecturer/groups/g5/settings" },
  ],
  recentActivities: [
    { id: "ra1", source: "GITHUB", actor: "Nhóm 01", action: "merge PR #42", target: "“Implement authentication”", timestamp: "5 phút trước" },
    { id: "ra2", source: "JIRA", actor: "SWP-124", action: "chuyển từ", target: "In Progress → Done", timestamp: "18 phút trước" },
    { id: "ra3", source: "SAGA", actor: "Hệ thống", action: "đồng bộ dữ liệu", target: "Nhóm 03 hoàn tất", timestamp: "1 giờ trước" },
    { id: "ra4", source: "GITHUB", actor: "Nhóm 02", action: "push 4 commits", target: "tới branch `feature/payment`", timestamp: "2 giờ trước" },
    { id: "ra5", source: "JIRA", actor: "Nhóm 06", action: "tạo mới 5 task", target: "cho Sprint 4", timestamp: "4 giờ trước" },
  ]
};
