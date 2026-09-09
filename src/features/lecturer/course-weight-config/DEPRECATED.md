# Deprecated — không dùng trong luồng production

Thư mục này giữ UI minh họa cũ (localStorage / mock ID). Route hiện tại dùng:

- `src/features/lecturer/contribution` cho cấu hình trọng số và đánh giá đóng góp
- `src/app/(dashboard)/lecturer/courses/[courseId]/contribution-configuration`

Không import lại các component trong thư mục này vào `src/app` hay service API.
