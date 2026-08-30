---
trigger: always_on
description: Git branching strategy, Vietnamese commit message conventions, author identity standards, and PR workflow for SAGA Frontend.
---

# Quy Chuẩn Git & Quy Trình Phát Triển (Git & Workflow Standards)

## 1. Chiến Lược Phân Nhánh (Branching Strategy)
- Nhánh phát triển chính: **`dev`** (Mọi nhánh tính năng đều phải checkout từ `dev` và tạo PR merge về lại `dev`).
- Nhánh sản phẩm: **`main`** (Chỉ merge từ `dev` khi chốt release hoặc chuẩn bị demo hội đồng).

### 🌿 Quy Ước Đặt Tên Nhánh:
| Loại nhánh | Cú pháp | Ví dụ |
| :--- | :--- | :--- |
| **Tính năng mới** | `feat/SAGA-xx-<mo-ta-tinh-nang>` | `feat/SAGA-31-student-traceability-graph` |
| **Sửa lỗi** | `fix/SAGA-xx-<mo-ta-loi>` | `fix/SAGA-29-fix-team-issues` |
| **Tái cấu trúc** | `refactor/SAGA-xx-<mo-ta-refactor>` | `refactor/SAGA-30-role-based-routing` |
| **Tài liệu & Quy tắc** | `chore/SAGA-xx-<mo-ta>` hoặc `feat/...` | `feat/SAGA-34-setup-rules-and-standardize-ui` |

---

## 2. Định Danh Tác Giả Commit (Author Identity Standard)
Mọi commit trong repository **BẮT BUỘC** phải được cấu hình chính xác danh tính tác giả cá nhân:

```bash
git config --local user.name "lehai170504"
git config --local user.email "hoanghaile175@gmail.com"
```

---

## 3. Quy Chuẩn Định Dạng Commit Message (Commit Conventions)
Mọi commit message **BẮT BUỘC** phải tuân theo cấu trúc chuẩn kèm mã Task Jira và viết bằng **Tiếng Việt**:

$$\text{<type>}: \text{[FE][SAGA-<xx>]} \text{ <Mô tả ngắn gọn bằng Tiếng Việt>}$$

### 📌 Các Loại Type Hợp Lệ:
- `feat`: Tính năng mới cho người dùng.
- `fix`: Sửa lỗi phát sinh, lỗi UI hoặc lỗi TypeScript/ESLint.
- `refactor`: Tái cấu trúc mã nguồn, tối ưu hóa code mà không thay đổi chức năng.
- `style`: Điều chỉnh giao diện, CSS, khoảng cách, font chữ, màu sắc.
- `chore`: Cập nhật cấu hình, dependencies, rule files.

### 📌 Ví Dụ Commit Chuẩn:
- `feat: [FE][SAGA-31] Xay dung UI/UX Do thi truy xuat Traceability Graph va Bang ma tran doi soat cho Sinh vien`
- `feat: [FE][SAGA-32] Dong bo UI trang Khoa hoc cua Giang vien va tich hop Trung tam giam sat Do thi SNA`
- `refactor: [FE][SAGA-30] Tai cau truc he thong dinh tuyen phan quyen cho sinh vien va dong bo navigation`
- `fix: [FE][SAGA-29] Fix toan bo ESLint warnings va dong bo CustomSelect toan he thong`
- `feat: [FE][SAGA-34] Xay dung bo Quy tac phat trien Rules va dong bo Design System toan he thong`

---

## 4. Quy Trình Kiểm Thử & Tạo Pull Request (PR Workflow)
Trước khi push và tạo Pull Request vào nhánh `dev`, lập trình viên và AI Agent **BẮT BUỘC** phải thực hiện các bước sau:

1. **Kiểm tra Lint**: Chạy `npm run lint` ➔ Đảm bảo đạt **0 Error, 0 Warning**.
2. **Kiểm tra Build**: Chạy `npm run build` ➔ Đảm bảo build production pass 100% không có lỗi TypeScript hay lỗi trang tĩnh.
3. **Push lên Remote**: `git push -u origin <ten-nhanh>`
4. **Tạo Pull Request**:
   - Base branch: `dev`
   - PR Title: `feat: [FE][SAGA-xx] <Tên tính năng>`
   - Đảm bảo tất cả CI/CD checks đều xanh trước khi merge.
