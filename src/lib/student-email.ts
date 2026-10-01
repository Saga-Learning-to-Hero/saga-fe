/**
 * Chuyển đổi họ tên tiếng Việt có dấu thành không dấu.
 */
export function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/**
 * Định dạng email sinh viên FPT theo chuẩn:
 * tên (không dấu) + họ viết tắt chữ cái đầu + các chữ lót viết tắt chữ cái đầu + mã số sinh viên (chữ thường) + @fpt.edu.vn
 *
 * Ví dụ:
 * - "Huỳnh Phước Thiện", "SE172095" -> "thienhpse172095@fpt.edu.vn"
 * - "Bùi Phan Nhật Minh", "SE171184" -> "minhbpnse171184@fpt.edu.vn"
 * - "Lê Hoàng Hải (K18 HCM)", "SE183904" -> "hailhse183904@fpt.edu.vn"
 */
export function formatStudentFptEmail(
  fullName?: string | null,
  studentCode?: string | null
): string {
  const cleanCode = (studentCode || "").trim().toLowerCase();
  if (!fullName || !fullName.trim()) {
    return cleanCode ? `${cleanCode}@fpt.edu.vn` : "";
  }

  // Loại bỏ nội dung trong ngoặc đơn nếu có (như khóa học, cơ sở, ví dụ: "(K18 HCM)", "(K17)")
  const nameWithoutParens = fullName.replace(/\(.*?\)/g, "").trim();

  // Xóa dấu tiếng Việt
  const cleanName = removeVietnameseTones(nameWithoutParens).trim();

  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return cleanCode ? `${cleanCode}@fpt.edu.vn` : "";
  }

  // Tên chính (từ cuối cùng)
  const lastName = parts[parts.length - 1].toLowerCase();

  // Họ và các chữ lót viết tắt chữ cái đầu
  const otherInitials = parts
    .slice(0, parts.length - 1)
    .map((p) => p.charAt(0).toLowerCase())
    .join("");

  return `${lastName}${otherInitials}${cleanCode}@fpt.edu.vn`;
}
