export function getRoleLabel(role: string | undefined | null): string {
  if (!role) return "Khách";
  switch (role.toUpperCase()) {
    case "ADMIN":
      return "Quản trị viên";
    case "LECTURER":
      return "Giảng viên";
    case "STUDENT":
      return "Sinh viên";
    case "LEADER":
      return "Trưởng nhóm";
    case "MEMBER":
      return "Thành viên";
    case "MENTOR":
      return "Cố vấn";
    default:
      return role;
  }
}

export function getCriterionLabel(criterion: string | undefined | null): string {
  if (!criterion) return "Khác";
  switch (criterion.toUpperCase()) {
    case "CODE":
      return "Lập trình (Code)";
    case "TEST":
      return "Kiểm thử (Test)";
    case "DOCUMENT":
      return "Tài liệu (Document)";
    case "RESEARCH":
      return "Nghiên cứu (Research)";
    default:
      return criterion;
  }
}

export function getPriorityLabel(priority: string | undefined | null): string {
  if (!priority) return "Bình thường";
  switch (priority.toUpperCase()) {
    case "HIGHEST":
      return "Rất cao";
    case "HIGH":
      return "Cao";
    case "MEDIUM":
      return "Trung bình";
    case "LOW":
      return "Thấp";
    case "LOWEST":
      return "Rất thấp";
    default:
      return priority;
  }
}
