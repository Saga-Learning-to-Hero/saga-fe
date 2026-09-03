import type {
  TraceabilityGraphData,
  SNAGraphData,
  GraphNode,
  GraphEdge,
  StudentNodeData,
  TaskNodeData,
  CommitNodeData,
} from "../types/graph";

// ── 1. Danh sách Sinh viên (Students) ──────────────────────────────────
export const MOCK_GRAPH_STUDENTS: StudentNodeData[] = [
  {
    id: "stu-01",
    studentCode: "HE170504",
    name: "Lê Hoàng Hải",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hailh",
    role: "LEADER",
    commitsCount: 38,
    tasksCount: 6,
    traceabilityScore: 98,
  },
  {
    id: "stu-02",
    studentCode: "SE171234",
    name: "Nguyễn Minh Tuấn",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tuanlm",
    role: "MEMBER",
    commitsCount: 22,
    tasksCount: 4,
    traceabilityScore: 92,
  },
  {
    id: "stu-03",
    studentCode: "SE172345",
    name: "Trần Phương Anh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anhpt",
    role: "MEMBER",
    commitsCount: 16,
    tasksCount: 3,
    traceabilityScore: 88,
  },
  {
    id: "stu-04",
    studentCode: "SE174567",
    name: "Vũ Tuấn Minh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=minhvt",
    role: "MEMBER",
    commitsCount: 14,
    tasksCount: 3,
    traceabilityScore: 80,
  },
  {
    id: "stu-05",
    studentCode: "SE175678",
    name: "Đỗ Thùy Linh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=linhdt",
    role: "MEMBER",
    commitsCount: 3,
    tasksCount: 2,
    traceabilityScore: 35,
    isGhosting: true, // Cảnh báo Ghosting: Ít tương tác
  },
];

// ── 2. Danh sách Jira Tasks ─────────────────────────────────────────────
export const MOCK_GRAPH_TASKS: TaskNodeData[] = [
  {
    id: "task-28",
    key: "SAGA-28",
    summary: "Xây dựng giao diện Quản lý Commit GitHub",
    taskType: "FEATURE",
    status: "DONE",
    storyPoints: 5,
    sprintId: "sprint-01",
    weightType: "CODE",
    assigneeId: "stu-01",
    assigneeName: "Lê Hoàng Hải",
    commitCount: 4,
  },
  {
    id: "task-27",
    key: "SAGA-27",
    summary: "Xây dựng giao diện Tiến độ công việc Jira Board",
    taskType: "FEATURE",
    status: "DONE",
    storyPoints: 5,
    sprintId: "sprint-01",
    weightType: "CODE",
    assigneeId: "stu-01",
    assigneeName: "Lê Hoàng Hải",
    commitCount: 5,
  },
  {
    id: "task-29",
    key: "SAGA-29",
    summary: "Dọn dẹp ESLint warnings và đồng bộ CustomSelect",
    taskType: "TASK",
    status: "DONE",
    storyPoints: 3,
    sprintId: "sprint-01",
    weightType: "CODE",
    assigneeId: "stu-01",
    assigneeName: "Lê Hoàng Hải",
    commitCount: 3,
  },
  {
    id: "task-26",
    key: "SAGA-26",
    summary: "Nâng cấp hoàn thiện toàn diện UI/UX Landing Page",
    taskType: "STORY",
    status: "DONE",
    storyPoints: 5,
    sprintId: "sprint-01",
    weightType: "CODE",
    assigneeId: "stu-02",
    assigneeName: "Nguyễn Minh Tuấn",
    commitCount: 4,
  },
  {
    id: "task-25",
    key: "SAGA-25",
    summary: "Thiết kế Logo Brand Identity và Header Footer",
    taskType: "TASK",
    status: "DONE",
    storyPoints: 3,
    sprintId: "sprint-01",
    weightType: "DOC",
    assigneeId: "stu-03",
    assigneeName: "Trần Phương Anh",
    commitCount: 2,
  },
  {
    id: "task-24",
    key: "SAGA-24",
    summary: "Tạo và cấu hình Jira - GitHub Webhook Integration",
    taskType: "TASK",
    status: "DONE",
    storyPoints: 5,
    sprintId: "sprint-01",
    weightType: "RESEARCH",
    assigneeId: "stu-05",
    assigneeName: "Đỗ Thùy Linh",
    isMSRAnomaly: true, // 🚨 Lỗi MSR: Task DONE nhưng không có commit nào nối về!
    commitCount: 0,
  },
  {
    id: "task-23",
    key: "SAGA-23",
    summary: "Tổng quan thông tin nhóm & đồ án",
    taskType: "STORY",
    status: "DONE",
    storyPoints: 3,
    sprintId: "sprint-01",
    weightType: "DOC",
    assigneeId: "stu-04",
    assigneeName: "Vũ Tuấn Minh",
    commitCount: 2,
  },
  {
    id: "task-19",
    key: "SAGA-19",
    summary: "Cấu hình trọng số học phần (Slicing Pie weight)",
    taskType: "STORY",
    status: "IN_PROGRESS",
    storyPoints: 5,
    sprintId: "sprint-02",
    weightType: "RESEARCH",
    assigneeId: "stu-02",
    assigneeName: "Nguyễn Minh Tuấn",
    commitCount: 2,
  },
];

// ── 3. Danh sách Git Commits ────────────────────────────────────────────
export const MOCK_GRAPH_COMMITS: CommitNodeData[] = [
  {
    id: "com-01",
    hash: "d46f600bbef80ae95a3fd4a774fdca29db6b72f9",
    shortHash: "d46f600",
    message: "fix: [FE][SAGA-29] Fix toan bo ESLint warnings va dong bo CustomSelect toan he thong",
    authorId: "stu-01",
    authorName: "Lê Hoàng Hải",
    branch: "fix/SAGA-29-fix-team-issues",
    timestamp: "2026-08-29 12:05",
    additions: 151,
    deletions: 219,
    linkedTaskKey: "SAGA-29",
    isVerified: true,
  },
  {
    id: "com-02",
    hash: "21394e339d25164cf38ba5144bfe131c9f28d8b1",
    shortHash: "21394e3",
    message: "feat: [FE][SAGA-28] Xay dung UI/UX quan li commit github",
    authorId: "stu-01",
    authorName: "Lê Hoàng Hải",
    branch: "feat/SAGA-28-student-Github-commit",
    timestamp: "2026-08-28 23:14",
    additions: 340,
    deletions: 12,
    linkedTaskKey: "SAGA-28",
    isVerified: true,
  },
  {
    id: "com-03",
    hash: "6ad8ddc4f4a5697c11f7c0062eb8df7b0bfa51c8",
    shortHash: "6ad8ddc",
    message: "feat: [FE][SAGA-27] Xay dung UI/UX quan li sprint va task jira",
    authorId: "stu-01",
    authorName: "Lê Hoàng Hải",
    branch: "feat/SAGA-27-student-jira-tasks",
    timestamp: "2026-08-27 23:28",
    additions: 490,
    deletions: 25,
    linkedTaskKey: "SAGA-27",
    isVerified: true,
  },
  {
    id: "com-04",
    hash: "a96e73d3957f864bc8fb3286c4f74d0e5132338b",
    shortHash: "a96e73d",
    message: "feat: [FE][SAGA-26] Nang cap hoan thien toan dien UI/UX Landing Page va Theme Toggle",
    authorId: "stu-02",
    authorName: "Nguyễn Minh Tuấn",
    branch: "feat/SAGA-26-enhance-landing-page",
    timestamp: "2026-08-27 10:39",
    additions: 512,
    deletions: 48,
    linkedTaskKey: "SAGA-26",
    isVerified: true,
  },
  {
    id: "com-05",
    hash: "7f3ffcd4948a3c82974cbfa45c6cfbd7d498ba03",
    shortHash: "7f3ffcd",
    message: "feat: [FE][SAGA-25] Thiet ke Brand Logo S-Graph Nexus va Dong bo Header, Footer",
    authorId: "stu-03",
    authorName: "Trần Phương Anh",
    branch: "feat/SAGA-25-brand-identity",
    timestamp: "2026-08-27 09:39",
    additions: 180,
    deletions: 15,
    linkedTaskKey: "SAGA-25",
    isVerified: true,
  },
  {
    id: "com-06",
    hash: "2625bbe392849ef9c7198e3b2e535fa322472fb2",
    shortHash: "2625bbe",
    message: "feat: [FE][SAGA-23] Xay dung UI/UX tong quan tien do va ket qua nhom",
    authorId: "stu-04",
    authorName: "Vũ Tuấn Minh",
    branch: "feat/SAGA-23-student-dashboard",
    timestamp: "2026-08-26 23:20",
    additions: 290,
    deletions: 10,
    linkedTaskKey: "SAGA-23",
    isVerified: true,
  },
  {
    id: "com-07",
    hash: "64c3dab89e7a8e7456bc992cf01460fa140026e1",
    shortHash: "64c3dab",
    message: "feat: [FE][SAGA-19] Xay dung UI/UX du lieu khoa hoc cho sinh vien",
    authorId: "stu-02",
    authorName: "Nguyễn Minh Tuấn",
    branch: "feat/SAGA-19-weight-config",
    timestamp: "2026-08-26 21:05",
    additions: 210,
    deletions: 8,
    linkedTaskKey: "SAGA-19",
    isVerified: true,
  },
];

// ── 4. Tạo Nodes và Edges cho Traceability Graph ───────────────────────
export function getMockTraceabilityGraphData(): TraceabilityGraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Thêm Student Nodes
  MOCK_GRAPH_STUDENTS.forEach((s) => {
    nodes.push({
      id: s.id,
      type: "STUDENT",
      label: s.name,
      subLabel: `${s.studentCode} (${s.role})`,
      status: s.isGhosting ? "GHOSTING" : "ACTIVE",
      data: s,
    });
  });

  // Thêm Task Nodes
  MOCK_GRAPH_TASKS.forEach((t) => {
    nodes.push({
      id: t.id,
      type: "TASK",
      label: t.key,
      subLabel: t.summary,
      status: t.status,
      data: t,
    });

    // Cạnh: Student ASSIGNED_TO Task
    edges.push({
      id: `edge-${t.assigneeId}-${t.id}`,
      source: t.assigneeId,
      target: t.id,
      type: "ASSIGNED_TO",
      label: "[:ASSIGNED_TO]",
    });
  });

  // Thêm Commit Nodes
  MOCK_GRAPH_COMMITS.forEach((c) => {
    nodes.push({
      id: c.id,
      type: "COMMIT",
      label: c.shortHash,
      subLabel: c.message,
      status: c.isVerified ? "VERIFIED" : "UNLINKED",
      data: c,
    });

    // Cạnh: Student AUTHORED Commit
    edges.push({
      id: `edge-${c.authorId}-${c.id}`,
      source: c.authorId,
      target: c.id,
      type: "AUTHORED",
      label: "[:AUTHORED]",
    });

    // Cạnh: Commit IMPLEMENTS Task (nếu có task key)
    if (c.linkedTaskKey) {
      const matchedTask = MOCK_GRAPH_TASKS.find((t) => t.key === c.linkedTaskKey);
      if (matchedTask) {
        edges.push({
          id: `edge-${c.id}-${matchedTask.id}`,
          source: c.id,
          target: matchedTask.id,
          type: "IMPLEMENTS",
          label: "[:IMPLEMENTS]",
        });
      }
    }
  });

  return {
    nodes,
    edges,
    summary: {
      totalStudents: MOCK_GRAPH_STUDENTS.length,
      totalTasks: MOCK_GRAPH_TASKS.length,
      totalCommits: MOCK_GRAPH_COMMITS.length,
      traceabilityRate: 94.5,
      msrAnomaliesCount: 1, // SAGA-24 không có commit
      unlinkedCommitsCount: 0,
    },
  };
}

// ── 5. Tạo dữ liệu Mạng lưới Xã hội Tương tác Nhóm (SNA Graph) ──────────
export function getMockSNAGraphData(): SNAGraphData {
  const nodes: GraphNode[] = MOCK_GRAPH_STUDENTS.map((s) => ({
    id: s.id,
    type: "STUDENT",
    label: s.name,
    subLabel: s.studentCode,
    status: s.isGhosting ? "GHOSTING" : s.role === "LEADER" ? "KEY_CONTRIBUTOR" : "BALANCED",
    data: s,
  }));

  const edges: GraphEdge[] = [
    // Lê Hoàng Hải (Leader) review code cho mọi người
    { id: "sna-1-2", source: "stu-01", target: "stu-02", type: "REVIEWED", label: "[:REVIEWED] 12 PRs", weight: 12 },
    { id: "sna-1-3", source: "stu-01", target: "stu-03", type: "REVIEWED", label: "[:REVIEWED] 8 PRs", weight: 8 },
    { id: "sna-1-4", source: "stu-01", target: "stu-04", type: "REVIEWED", label: "[:REVIEWED] 6 PRs", weight: 6 },
    { id: "sna-2-1", source: "stu-02", target: "stu-01", type: "REVIEWED", label: "[:REVIEWED] 7 PRs", weight: 7 },
    { id: "sna-2-3", source: "stu-02", target: "stu-03", type: "COMMENTED_ON", label: "[:COMMENTED_ON] 5 Comments", weight: 5 },
    { id: "sna-3-1", source: "stu-03", target: "stu-01", type: "COMMENTED_ON", label: "[:COMMENTED_ON] 4 Comments", weight: 4 },
    { id: "sna-4-1", source: "stu-04", target: "stu-01", type: "REVIEWED", label: "[:REVIEWED] 3 PRs", weight: 3 },
    // stu-05 (Đỗ Thùy Linh) bị cô lập không có tương tác review -> Ghosting
  ];

  const metrics = [
    {
      studentId: "stu-01",
      studentName: "Lê Hoàng Hải",
      studentCode: "HE170504",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hailh",
      inDegree: 14,
      outDegree: 26,
      centralityScore: 0.94,
      reviewsGiven: 26,
      reviewsReceived: 14,
      isGhosting: false,
      isKeyContributor: true,
      statusLabel: "KEY_CONTRIBUTOR" as const,
    },
    {
      studentId: "stu-02",
      studentName: "Nguyễn Minh Tuấn",
      studentCode: "SE171234",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tuanlm",
      inDegree: 12,
      outDegree: 12,
      centralityScore: 0.72,
      reviewsGiven: 12,
      reviewsReceived: 12,
      isGhosting: false,
      isKeyContributor: false,
      statusLabel: "BALANCED" as const,
    },
    {
      studentId: "stu-03",
      studentName: "Trần Phương Anh",
      studentCode: "SE172345",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anhpt",
      inDegree: 13,
      outDegree: 4,
      centralityScore: 0.58,
      reviewsGiven: 4,
      reviewsReceived: 13,
      isGhosting: false,
      isKeyContributor: false,
      statusLabel: "BALANCED" as const,
    },
    {
      studentId: "stu-04",
      studentName: "Vũ Tuấn Minh",
      studentCode: "SE174567",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=minhvt",
      inDegree: 6,
      outDegree: 3,
      centralityScore: 0.45,
      reviewsGiven: 3,
      reviewsReceived: 6,
      isGhosting: false,
      isKeyContributor: false,
      statusLabel: "BALANCED" as const,
    },
    {
      studentId: "stu-05",
      studentName: "Đỗ Thùy Linh",
      studentCode: "SE175678",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=linhdt",
      inDegree: 0,
      outDegree: 0,
      centralityScore: 0.05,
      reviewsGiven: 0,
      reviewsReceived: 0,
      isGhosting: true,
      isKeyContributor: false,
      statusLabel: "GHOSTING" as const,
    },
  ];

  return {
    nodes,
    edges,
    metrics,
  };
}
