# Kịch bản thuyết trình SAGA trong 45 phút - 5 thành viên

Nguồn chính: `D:\paper\SAGA Capstone Slide.pdf` (23 slide).

Người trình bày: Trần Đức Trung, Bùi Đăng Khoa, Lê Hoàng Hải, Bùi Phan Nhật Minh, Huỳnh Phước Thiện.

## 1. Cách dùng kịch bản

- Tổng thời lượng mục tiêu: **44 phút 30 giây**, chừa khoảng **30 giây dự phòng**.
- Phần trình bày và demo: **39 phút 30 giây**.
- Phần Q&A chủ động: **5 phút**. Nếu Hội đồng tách Q&A thành phần riêng, dùng 5 phút này để demo kỹ hơn slide 18-20.
- Các câu trong dấu ngoặc vuông như `[chuyển slide]`, `[thao tác]`, `[dừng 1 giây]` là chỉ dẫn sân khấu, không đọc thành lời.
- Không cố đọc toàn bộ chữ trên slide. Mỗi slide cần trả lời một câu hỏi: vấn đề gì, SAGA giải quyết ra sao, và người dùng nhận được giá trị gì.
- Khi demo, một người nói, một người điều khiển máy. Người điều khiển nên mở sẵn các tab và dữ liệu mẫu trước khi bắt đầu.

## 2. Phân chia thời lượng

| Thời gian | Người nói | Slide | Nội dung chính |
|---|---:|---:|---|
| 00:00-07:30 | Trung | 1-5 | Mở bài, đội ngũ, vấn đề, người dùng, pain points |
| 07:30-15:30 | Khoa | 6-10 | Kiến trúc, công nghệ, bốn vai trò chính |
| 15:30-23:00 | Hải | 11-14 | Mở phần tính năng; roster, chia nhóm, kết nối tài khoản |
| 23:00-31:30 | Minh | 15-18 | Khởi tạo project, sprint/backlog, peer review, giảng viên giám sát |
| 31:30-39:30 | Thiện | 19-21 | Task-Commit Pipeline, contribution, giới hạn và hướng phát triển |
| 39:30-44:30 | Trung điều phối; cả nhóm trả lời | 22 | Q&A |
| 44:30-45:00 | Trung | 23 | Kết thúc |

## 3. Các điểm cần sửa trên slide trước khi bảo vệ

Đây là các lỗi dễ bị Hội đồng bắt ngay. Nên sửa trong file gốc trước buổi trình bày:

1. Slide 1: chuẩn hóa tên thành **Student Activity Graph-Based Continuous Assessment for PBL**.
2. Slide 5: sửa thành **"Fake Agile" & Fake Reporting**; hiện đang thiếu dấu ngoặc kép mở.
3. Slide 7: sửa câu hỏi thành **What can administrators do?**
4. Slide 8: nội dung bị dồn và dòng cuối có dấu hiệu bị cắt. Rút còn 4 ý, bỏ câu lặp và kiểm tra lại `export progress report`.
5. Slide 13: sửa **LECTURE GROUPING STUDENTS** thành **LECTURER GROUPING STUDENTS** hoặc tự nhiên hơn là **LECTURER GROUPING WORKFLOW**.
6. Slide 14-15: thống nhất cách viết **GitHub**; sửa `Input require fields` thành **Enter required fields**.
7. Slide 16: sửa nhãn **`saga:doc`** thành **`saga:document`**. Đây là tên reserved label canonical của hệ thống.
8. Slide 19: `Symmetric commit` không rõ nghĩa. Nếu muốn nói commit chưa ánh xạ danh tính, dùng **Unmapped/Orphan Commit**; nếu muốn nói task hoàn thành nhưng thiếu commit, dùng **Done Task Without Linked Commit**.
9. Slide 19: gọi anomaly là **cảnh báo cần đối soát**, không khẳng định đó là gian lận.
10. Slide 20: làm rõ SAGA tính **Final Contribution Percentage**, không tự quyết định điểm học phần cuối cùng. Giảng viên dùng tỷ lệ và minh chứng để ra quyết định học thuật.
11. Slide 6 và các slide workflow 12-19 khá dày. Khi chiếu, dùng con trỏ đi theo từng nhánh; không giải thích tất cả mũi tên cùng lúc.
12. Slide 22 và 23 không nên chiếu liên tiếp trước Q&A. Dừng ở slide 22 để nhận câu hỏi; chỉ chuyển slide 23 sau câu trả lời cuối.

---

# 4. Kịch bản chi tiết

## PHẦN 1 - TRUNG - 00:00-07:30

### Slide 1 - Mở bài - 00:00-00:50

**Trung nói:**

> Kính thưa thầy cô trong Hội đồng. Nhóm em là SU26SE094_GSU01. Hôm nay nhóm xin trình bày đề tài SAGA - Student Activity Graph-Based Continuous Assessment for PBL.
>
> Câu hỏi trung tâm của đề tài là: trong một dự án học tập theo nhóm, làm thế nào để giảng viên nhìn thấy được quá trình đóng góp thật của từng sinh viên, thay vì chỉ nhìn sản phẩm cuối kỳ hoặc nghe phần tự báo cáo của nhóm?
>
> SAGA tiếp cận bài toán này bằng cách kết nối dữ liệu công việc từ Jira, dữ liệu kỹ thuật từ GitHub, minh chứng do sinh viên cung cấp, peer review và đồ thị truy xuất nguồn gốc. Mục tiêu không phải thay thế giảng viên, mà là cung cấp một chuỗi bằng chứng rõ ràng để việc đánh giá công bằng và giải thích được.

`[dừng 1 giây, nhìn Hội đồng, chuyển slide]`

### Slide 2 - Thành viên - 00:50-01:25

**Trung nói:**

> Nhóm gồm năm thành viên. Em là Trần Đức Trung, trưởng nhóm, phụ trách Backend. Bùi Đăng Khoa phụ trách Backend. Lê Hoàng Hải, Bùi Phan Nhật Minh và Huỳnh Phước Thiện phụ trách Frontend.
>
> Trong phần trình bày hôm nay, mỗi thành viên sẽ phụ trách đúng phần mình hiểu sâu nhất: từ bài toán, kiến trúc, các quy trình cấu hình, trải nghiệm người dùng cho đến pipeline đối soát và kết quả đóng góp.

`[chuyển slide]`

### Slide 3 - Mục lục - 01:25-01:55

**Trung nói:**

> Bài trình bày đi theo sáu bước. Đầu tiên là vấn đề và người dùng mục tiêu. Tiếp theo là các pain point cốt lõi. Sau đó nhóm trình bày kiến trúc, các vai trò, các tính năng chính kèm demo, và cuối cùng là giới hạn cùng hướng phát triển.
>
> Xuyên suốt bài trình bày, nhóm sẽ bám vào một luồng duy nhất: từ một công việc được giao, đến bằng chứng thực hiện, đến cách giảng viên đối soát kết quả.

`[chuyển slide]`

### Slide 4 - Problem Statement & Target Users - 01:55-04:15

**Trung nói:**

> Người dùng mục tiêu của SAGA là giảng viên ngành Software Engineering và sinh viên tham gia các môn học hoặc đồ án theo mô hình Project-Based Learning.
>
> Trong cách làm truyền thống, đánh giá thường tập trung vào sản phẩm cuối, buổi presentation cuối kỳ, hoặc một phiếu peer review khá đơn giản. Các nguồn dữ liệu đã tồn tại trong suốt quá trình làm dự án - như sprint, task, lịch sử trạng thái trên Jira, commit và pull request trên GitHub - lại chưa được kết nối thành một bức tranh thống nhất.
>
> Điều này tạo ra hai khoảng trống. Khoảng trống thứ nhất là **thiếu khả năng quan sát quá trình**. Hai nhóm có thể tạo ra sản phẩm tương tự, nhưng cách phân chia công việc, mức độ chủ động và độ đều trong đóng góp có thể hoàn toàn khác nhau.
>
> Khoảng trống thứ hai là **chi phí kiểm tra rất cao**. Nếu một giảng viên quản lý nhiều nhóm, thầy cô phải mở Jira, GitHub, file minh chứng và các báo cáo khác nhau; sau đó tự ghép chúng bằng mắt. Công việc này vừa tốn thời gian, vừa khó duy trì cùng một tiêu chuẩn giữa các nhóm.
>
> Vì vậy, SAGA không chỉ là một dashboard đếm commit. Hệ thống hướng tới việc tổ chức dữ liệu thành chuỗi truy xuất: sinh viên nào, được giao task nào, task thuộc sprint nào, có commit hoặc minh chứng gì, và kết quả đó được phản ánh như thế nào trong tỷ lệ đóng góp.

`[chỉ vào bốn dòng trên slide theo đúng thứ tự; chuyển slide]`

### Slide 5 - Core Pain Points - 04:15-07:05

**Trung nói:**

> Nhóm tổng hợp bài toán thành ba pain point chính.
>
> Thứ nhất là hiện tượng **free-rider**. Trong một nhóm, mức độ nỗ lực có thể rất khác nhau nhưng nếu chỉ chấm theo sản phẩm cuối thì kết quả cá nhân dễ bị san bằng. Người đóng góp nhiều khó chứng minh công sức; người đóng góp ít cũng khó được nhận diện bằng dữ liệu.
>
> Thứ hai là tình trạng **Fake Agile hoặc Fake Reporting**. Một task có thể được kéo sang Done ngay trước deadline nhưng chưa có commit liên kết, chưa có tài liệu, hoặc chưa có bằng chứng phù hợp với loại công việc. Điểm quan trọng ở đây là SAGA không tự kết luận gian lận. Hệ thống chỉ gắn cờ một bất thường để giảng viên mở chi tiết và đối soát.
>
> Thứ ba là việc kiểm tra thủ công rất mệt và dễ thiếu nhất quán. Một commit riêng lẻ chưa nói lên nhiều điều; một task Done cũng chưa chứng minh đã hoàn thành. Giá trị xuất hiện khi các dữ liệu này được đặt cạnh nhau theo cùng một ngữ cảnh.
>
> Từ ba pain point đó, nhóm xác định nguyên tắc thiết kế của SAGA là **data-driven transparency**: dữ liệu phải truy xuất được, cảnh báo phải giải thích được, và quyết định học thuật cuối cùng vẫn thuộc về giảng viên.

### Chuyển người - 07:05-07:30

**Trung nói:**

> Để biến nguyên tắc đó thành một hệ thống có thể vận hành, SAGA cần tách rõ dữ liệu giao dịch, dữ liệu đồ thị, luồng realtime và các tích hợp ngoài. Sau đây, Khoa sẽ trình bày kiến trúc và cách từng vai trò tham gia vào hệ thống.

`[Trung lùi lại, Khoa bước lên; chuyển slide]`

---

## PHẦN 2 - KHOA - 07:30-15:30

### Slide 6 - System Architecture & Tech Stack - 07:30-11:15

**Khoa nói:**

> Em xin tiếp tục với kiến trúc tổng thể. Khi nhìn slide này, mình không cần đọc từng mũi tên. Có thể chia hệ thống thành bốn lớp chính.
>
> Lớp thứ nhất là **Web App**. Frontend được xây dựng với Next.js và React. Đây là nơi hiển thị dashboard, workflow, biểu đồ Recharts và graph tương tác bằng Cytoscape. Frontend gọi API qua HTTPS và nhận các sự kiện cập nhật qua SSE để làm mới dữ liệu liên quan.
>
> Lớp thứ hai là **Backend Server** chạy Java và Spring Boot. Backend chịu trách nhiệm xác thực phiên, phân quyền, nghiệp vụ, đồng bộ dữ liệu và tích hợp với các hệ thống ngoài. Một nguyên tắc quan trọng là Frontend không tự tính tỷ lệ đóng góp cuối và không tự dựng dữ liệu graph giả. Frontend hiển thị dữ liệu canonical do Backend cung cấp.
>
> Lớp thứ ba là **các kho dữ liệu có mục đích khác nhau**. MySQL lưu dữ liệu nghiệp vụ canonical như người dùng, lớp học, nhóm, project và kết quả đánh giá. Neo4j giữ graph projection để truy vấn nhanh các mối quan hệ Student - Task - Commit - Identity. Redis hỗ trợ session, OAuth state và dữ liệu tạm thời. Việc tách này giúp mỗi loại dữ liệu được xử lý theo mô hình phù hợp thay vì bắt một database làm tất cả.
>
> Lớp thứ tư là **các hệ thống tích hợp**. Jira cung cấp task, sprint và trạng thái công việc. GitHub cung cấp repository, commit và dữ liệu kỹ thuật. Firebase hỗ trợ web push; email được gửi qua dịch vụ mail. Các dịch vụ AI có thể phân tích task hoặc commit, nhưng kết quả AI chỉ mang tính tư vấn và được tách khỏi tỷ lệ đóng góp cũng như điểm học phần.
>
> Luồng dữ liệu quan trọng nhất là: dữ liệu từ Jira và GitHub đi vào Backend; Backend chuẩn hóa và lưu dữ liệu; sau đó tạo projection cho graph. Khi có thay đổi, Frontend nhận tín hiệu cập nhật nhưng vẫn refetch nguồn canonical thay vì tự ghép dữ liệu từ event.

**Nếu Hội đồng hỏi ngay tại slide này:**

> MySQL là nguồn dữ liệu nghiệp vụ chính; Neo4j là read model chuyên cho truy vấn quan hệ. Đây không phải hai nguồn sự thật cạnh tranh nhau.

`[dùng con trỏ đi theo Web App → Backend → MySQL/Neo4j → Jira/GitHub; chuyển slide]`

### Slide 7 - Admin - 11:15-12:10

**Khoa nói:**

> Vai trò đầu tiên là Admin. Admin quản lý vòng đời dữ liệu học thuật: tài khoản, học kỳ, lớp, môn học, roster, subject và syllabus version. Admin cũng có audit log để xem hoạt động hệ thống và có thể gửi thông báo toàn hệ thống.
>
> Giá trị của vai trò này là tạo ra dữ liệu đầu vào có cấu trúc. Nếu danh sách lớp, trạng thái tài khoản hoặc phiên bản syllabus không rõ ràng, các bước phân nhóm và đánh giá phía sau sẽ không có nền tảng tin cậy.

`[chuyển slide]`

### Slide 8 - Lecturer - 12:10-13:20

**Khoa nói:**

> Vai trò thứ hai là Lecturer. Giảng viên quản lý các course và team được phân công, theo dõi tiến độ sprint, activity và traceability evidence. Giảng viên cũng cấu hình trọng số đóng góp theo bốn nhóm Code, Test, Document và Research.
>
> Sau khi có dữ liệu, giảng viên xem peer review, tỷ lệ đóng góp và các cảnh báo cần đối soát. Với AI, giảng viên có thể yêu cầu phân tích và review các đề xuất phân loại học thuật. Tuy nhiên, AI không tự xác nhận kết quả cuối và giảng viên không sửa trực tiếp tỷ lệ canonical ở Frontend.

`[chuyển slide]`

### Slide 9 - Student Member - 13:20-14:15

**Khoa nói:**

> Student Member là người trực tiếp tạo ra và kiểm tra minh chứng. Sinh viên xem course, team, task, sprint, commit và graph; quản lý work session hoặc task evidence; thực hiện peer review; và xem kết quả đóng góp của mình theo quyền được cấp.
>
> Một bước rất quan trọng là mỗi sinh viên quản lý identity Jira và GitHub của cá nhân. Nếu identity mapping sai, hệ thống không nên tự gán commit cho một người chỉ dựa trên suy đoán.

`[chuyển slide]`

### Slide 10 - Student Leader - 14:15-15:05

**Khoa nói:**

> Student Leader có toàn bộ quyền của thành viên và thêm trách nhiệm cấu hình project. Leader kết nối Jira source, GitHub repository, tạo hoặc quản lý task và sprint trong phạm vi được hỗ trợ, kích hoạt đồng bộ và xử lý chuyển nguồn khi cần.
>
> Việc tách Leader khỏi Member giúp các thao tác có ảnh hưởng đến toàn đội - như chọn repository, nguồn Jira hoặc reconciliation setting - không bị thực hiện tùy ý bởi mọi thành viên.

### Chuyển người - 15:05-15:30

**Khoa nói:**

> Như vậy, kiến trúc cung cấp nền tảng, còn bốn vai trò xác định ai được làm gì. Tiếp theo, Hải sẽ đi vào các workflow đầu tiên: chuẩn bị roster, chia nhóm và kết nối tài khoản để tạo dữ liệu đầu vào cho project.

`[chuyển slide 11, Hải bước lên]`

---

## PHẦN 3 - HẢI - 15:30-23:00

### Slide 11 - Key Features - 15:30-15:55

**Hải nói:**

> Từ phần này, nhóm xin trình bày các tính năng theo đúng thứ tự vận hành, thay vì liệt kê rời rạc. Ba workflow đầu tiên trả lời câu hỏi: làm thế nào để hệ thống biết đúng lớp, đúng nhóm và đúng danh tính trên các nền tảng bên ngoài?

`[chuyển slide]`

### Slide 12 - Team & Roster Management - 15:55-18:10

**Hải nói:**

> Workflow đầu tiên là quản lý roster ở góc nhìn Admin.
>
> Admin đăng nhập, vào Admin Dashboard, mở Master Data, chọn course cần quản lý và đi vào trang chi tiết course. Tại đây hệ thống cung cấp danh sách sinh viên và chức năng import theo template.
>
> Điểm thiết kế quan trọng là quá trình import không nên là một thao tác mù. Người dùng tải template, điền theo đúng cấu trúc, upload lại, kiểm tra dữ liệu preview và chỉ confirm khi danh sách hợp lệ. Cách làm này giảm lỗi nhập từng dòng và giúp các lớp đông sinh viên được khởi tạo nhanh hơn.
>
> Sau khi confirm, roster trở thành cơ sở để giảng viên phân nhóm. Nói cách khác, Admin quản lý danh sách học thuật; Lecturer không tự thêm một sinh viên ngoài roster vào team.

**Nếu demo trực tiếp:**

1. `[mở Admin Dashboard]` Nói: "Đây là khu vực Master Data."
2. `[mở course detail, tab Student List]` Nói: "Danh sách hiện tại được scope theo course."
3. `[bấm Import, chọn file mẫu đã chuẩn bị]` Nói: "Hệ thống đọc file và hiển thị bước kiểm tra trước khi ghi dữ liệu."
4. Không bấm confirm nếu môi trường demo đang dùng dữ liệu chung. Chỉ chỉ vào nút và nói: "Trong buổi demo, nhóm dừng ở bước preview để không làm thay đổi roster thật."

`[chuyển slide]`

### Slide 13 - Lecturer Grouping Students - 18:10-20:05

**Hải nói:**

> Khi roster đã sẵn sàng, giảng viên thực hiện chia nhóm. Lecturer vào workspace, chọn course, tải template có danh sách sinh viên, điền cấu trúc nhóm và chỉ định leader, sau đó import file trở lại hệ thống.
>
> Workflow này giải quyết hai vấn đề. Thứ nhất, giảng viên có thể chuẩn bị việc chia nhóm trên file quen thuộc thay vì thao tác thủ công nhiều lần. Thứ hai, kết quả vẫn được kiểm tra và xác nhận trước khi tạo team chính thức.
>
> Sau khi tạo team, quyền Leader mới có ý nghĩa. Leader được phép cấu hình project của team mình; thành viên thường không được phép thay đổi integration ở cấp đội.

**Nếu demo trực tiếp:**

1. `[mở Lecturer Workspace → Course → Grouping]`.
2. `[chỉ vào Download Template và Import]`.
3. Nói rõ: "Leader được chỉ định trong dữ liệu grouping; đây không phải quyền mà sinh viên tự cấp cho mình."

`[chuyển slide]`

### Slide 14 - Account Integration & Setup - 20:05-22:35

**Hải nói:**

> Workflow thứ ba là kết nối identity cá nhân. Sinh viên đăng nhập SAGA, vào Workspace, mở Profile hoặc Integration Settings, sau đó thực hiện luồng cấp quyền với GitHub và Jira.
>
> Cần phân biệt hai cấp kết nối. Ở cấp project, Leader chọn Jira source và GitHub repository chính thức của team. Ở cấp cá nhân, mỗi sinh viên liên kết danh tính của mình để hệ thống biết một tài khoản hoặc commit author thuộc về ai.
>
> Sau khi người dùng đăng nhập và đồng ý cấp quyền trên GitHub hoặc Jira, callback quay về Backend. Backend lưu trạng thái cần thiết và Frontend chỉ hiển thị kết quả kết nối. Nhóm không đưa access token nhạy cảm ra giao diện.
>
> Identity mapping là một điều kiện quan trọng nhưng cũng là một giới hạn thực tế. Nếu sinh viên dùng nhiều email Git hoặc cấu hình sai tài khoản, commit có thể trở thành unmapped. Khi đó SAGA cần gắn cờ để người dùng sửa mapping, không tự nhận rằng commit thuộc về một sinh viên cụ thể.

**Nếu demo trực tiếp:**

1. `[mở Profile / Integration Settings]`.
2. Chỉ trạng thái GitHub và Jira đã kết nối; không logout hoặc revoke trong lúc bảo vệ.
3. Nếu cần minh họa OAuth, dùng ảnh hoặc video dự phòng thay vì thực hiện đăng nhập thật trước Hội đồng.

### Chuyển người - 22:35-23:00

**Hải nói:**

> Sau ba bước này, hệ thống đã có lớp học, team và danh tính tích hợp. Bước tiếp theo là Leader tạo project, đội thực hiện sprint, gửi peer review và giảng viên quan sát toàn bộ chuỗi. Phần này Minh sẽ trình bày.

`[Minh bước lên; chuyển slide]`

---

## PHẦN 4 - MINH - 23:00-31:30

### Slide 15 - Project Registration & Configuration - 23:00-25:40

**Minh nói:**

> Sau khi team được tạo, Team Leader bắt đầu đăng ký project. Leader vào course dashboard, mở Project Configuration và tạo project mới.
>
> Ở bước này Leader nhập các trường bắt buộc, chọn GitHub repository và chọn nguồn Jira phù hợp. Với Jira, hệ thống cần xác định đúng site hoặc source và project key. Với GitHub, repository phải thuộc phạm vi project được team sử dụng.
>
> Lý do cần cấu hình rõ hai nguồn là vì mọi dashboard về sau đều phải có cùng ngữ cảnh. Task trên Kanban, task trong sprint, Task-Commit Pipeline và contribution không được trộn dữ liệu từ một Jira source khác hoặc repository ngoài project.
>
> Sau khi confirm, project trở thành điểm neo để đồng bộ. Từ đây Leader có thể kích hoạt sync, theo dõi trạng thái và xử lý reconciliation nếu nguồn dữ liệu thay đổi.

**Nếu demo trực tiếp:**

1. `[mở Course Dashboard → Project Configuration]`.
2. `[mở form New Project đã điền sẵn nhưng chưa submit]`.
3. Chỉ dropdown repository và Jira source/project key.
4. Nói: "Nhóm đã tạo project mẫu trước để tránh phụ thuộc vào OAuth và tốc độ mạng trong buổi bảo vệ. Sau đây em chuyển sang project đã có dữ liệu."

`[chuyển slide]`

### Slide 16 - Sprint & Backlog Planning - 25:40-27:45

**Minh nói:**

> Trong giai đoạn thực thi, task được tạo, đưa vào sprint, giao cho thành viên và phân loại bằng reserved label. Bốn label canonical là `saga:code`, `saga:test`, `saga:document` và `saga:research`.
>
> Label giúp hệ thống biết task thuộc nhóm tiêu chí nào khi tổng hợp đóng góp. Nếu một task có nhiều reserved label gây mơ hồ, hệ thống không nên tự chọn thay người dùng.
>
> Với task Code hoặc Test có commit, hệ thống đối soát liên kết Task-Commit. Với task Document hoặc Research, sinh viên có thể đính kèm file hoặc web link làm evidence. Vì vậy người viết tài liệu hoặc nghiên cứu không bị thiệt chỉ vì công việc của họ tạo ra ít dòng code.
>
> Khi task hoàn tất, trạng thái Done chỉ là một tín hiệu. Hệ thống vẫn kiểm tra xem loại task đó có evidence phù hợp hay chưa.

**Nếu demo trực tiếp:**

1. `[mở Sprint Progress hoặc Backlog]`.
2. Mở một task Code có commit và một task Document có file/link.
3. Chỉ label, assignee, sprint và evidence; không sa đà vào chỉnh sửa task.

`[chuyển slide]`

### Slide 17 - Peer Review Evaluation - 27:45-29:15

**Minh nói:**

> Sau khi sprint đóng, sinh viên thực hiện peer review. Người dùng vào Overview, mở Peer Review, chọn sprint, chọn đồng đội và đánh giá theo rubric.
>
> Hệ thống không cho tự đánh giá bản thân và giới hạn việc gửi sai đối tượng hoặc gửi lặp theo rule của Backend. Peer review cung cấp một góc nhìn mà log kỹ thuật không thể phản ánh đầy đủ, ví dụ khả năng phối hợp, trách nhiệm hoặc hỗ trợ đồng đội.
>
> Tuy nhiên, peer review không đứng một mình và cũng không phải phiếu bầu quyết định điểm. Nó được dùng cùng task, commit, evidence và trọng số để điều chỉnh kết quả theo contract của Backend.

**Nếu demo trực tiếp:**

1. Chọn một sprint đã đóng.
2. Mở rubric của một teammate.
3. Chỉ các tiêu chí và trạng thái đã gửi. Không submit lần nữa nếu dữ liệu mẫu đã hoàn thành.

`[chuyển slide]`

### Slide 18 - Lecturer Supervise - 29:15-31:05

**Minh nói:**

> Ở góc nhìn giảng viên, dữ liệu được tổng hợp thành graph và các dashboard giám sát. Lecturer mở course dashboard, chọn Graph và có thể xem ba lớp thông tin.
>
> Lớp thứ nhất là overview để nhìn cấu trúc tổng thể. Lớp thứ hai là drill-down theo student, sprint hoặc contribution. Lớp thứ ba là chi tiết của một node, ví dụ mở commit để xem metadata, liên kết task và Git diff nếu có quyền.
>
> Giá trị của graph không nằm ở việc vẽ thật nhiều node. Giá trị là khả năng đi từ một cảnh báo đến đúng ngữ cảnh liên quan: thành viên nào, task nào, commit nào, và evidence nào đang thiếu hoặc cần xác minh.

**Nếu demo trực tiếp:**

1. `[mở Lecturer Course Graph]`.
2. Chọn một student node; cho thấy neighborhood được làm nổi bật.
3. Chọn task rồi commit liên quan; mở detail inspector.
4. Chuyển nhanh qua Sprint Progress Graph và Contribution Graph, không mở tất cả cùng lúc.

### Chuyển người - 31:05-31:30

**Minh nói:**

> Graph giúp quan sát tổng thể, nhưng khi cần kiểm tra một bất thường cụ thể, giảng viên cần một luồng Task-Commit rõ ràng và một kết quả đóng góp có thể giải thích. Thiện sẽ trình bày hai phần này cùng các giới hạn hiện tại của SAGA.

`[Thiện bước lên; chuyển slide]`

---

## PHẦN 5 - THIỆN - 31:30-39:30

### Slide 19 - Inspect the Task-Commit Pipeline - 31:30-34:30

**Thiện nói:**

> Task-Commit Pipeline là màn hình phục vụ đối soát. Lecturer hoặc Team Leader vào Graph, chọn Pipeline Flow và có hai hướng kiểm tra.
>
> Ở tab All, người dùng xem các task cùng commit đã liên kết. Khi chọn một task, inspector hiển thị assignee, sprint, repository, branch, số commit và evidence liên quan. Mục tiêu là trả lời: task này được giao cho ai và có dấu vết thực hiện nào?
>
> Ở tab Anomaly, người dùng lọc những trường hợp cần chú ý, ví dụ task đã hoàn thành nhưng chưa có commit liên kết, task chưa được giao, hoặc thiếu commit theo bộ lọc được hỗ trợ. Đây là **cảnh báo dữ liệu**, không phải bản án gian lận.
>
> Ngoài ra, graph có thể làm lộ ra commit hoặc identity chưa map về sinh viên. Trường hợp này nên gọi là unmapped hoặc orphan commit. Cách xử lý là kiểm tra lại identity mapping, repository và branch; không được tự gán dựa trên tên giống nhau.
>
> Điểm quan trọng là pipeline sử dụng liên kết canonical từ Backend. Frontend không tự parse commit message để tạo một liên kết giả khi đã có API canonical.

**Nếu demo trực tiếp:**

1. `[mở Graph → Pipeline Flow]`.
2. Ở tab All, mở một task có commit; chỉ assignee, task key và commit SHA.
3. Chuyển filter **Task hoàn thành chưa có Commit**.
4. Mở một task cảnh báo và nói: "SAGA cho biết thiếu liên kết; giảng viên vẫn phải xem task type và evidence trước khi kết luận."
5. Nếu có commit chưa map, chỉ badge unmapped và identity detail.

`[chuyển slide]`

### Slide 20 - Lecturer Grading - 34:30-36:45

**Thiện nói:**

> Sau bước đối soát, giảng viên xem kết quả đóng góp. Lecturer cấu hình trọng số cho bốn nhóm Code, Test, Document và Research. Backend áp dụng rule về evidence eligibility, dữ liệu công việc và peer coefficient, sau đó chuẩn hóa để tạo Final Contribution Percentage cho từng thành viên.
>
> Có hai ranh giới cần nhấn mạnh. Thứ nhất, tỷ lệ cuối là dữ liệu canonical do Backend tính; giao diện giảng viên chỉ đọc, mở minh chứng và xem warning, không cho sửa tay tỷ lệ cuối.
>
> Thứ hai, Final Contribution Percentage không phải điểm học phần thang 10. Nó là một đầu vào có giải thích để giảng viên ghi nhận vào quy trình chấm điểm hoặc master gradebook theo quy định môn học.
>
> Cách trình bày này giúp tránh hai cực đoan: không chỉ dựa vào cảm tính, nhưng cũng không giao toàn quyền chấm điểm cho thuật toán.

**Nếu demo trực tiếp:**

1. `[mở Contribution Evaluation]`.
2. Chỉ bốn trọng số và mode áp dụng.
3. Mở một thành viên, chỉ breakdown theo criterion, sprint, peer coefficient và warning.
4. Nói rõ: "Màn hình không có thao tác override tỷ lệ cuối."

`[chuyển slide]`

### Slide 21 - Limitations & Future Work - 36:45-39:00

**Thiện nói:**

> Nhóm nhìn nhận ba giới hạn chính.
>
> Thứ nhất, nhiều evidence hiện vẫn thiên về metadata. Metadata cho biết có file, link hoặc commit, nhưng chưa luôn chứng minh chất lượng nội dung bên trong. Vì vậy hệ thống hỗ trợ truy xuất và cảnh báo, không tuyên bố tự động đánh giá toàn bộ chất lượng chuyên môn.
>
> Thứ hai, identity mapping phụ thuộc vào việc kết nối đúng Jira và GitHub identity. Những commit dùng email khác hoặc tài khoản chưa liên kết cần được đối soát.
>
> Thứ ba, AI là advisory. AI có thể phân tích task, commit hoặc đề xuất phân loại học thuật; nhưng kết quả phải có bằng chứng, trạng thái review và không được dùng như điểm cuối cùng.
>
> Từ đó, các hướng phát triển là review evidence dựa trên nội dung, graph analytics mạnh hơn, tích hợp campus identity để giảm lỗi mapping, và bổ sung tín hiệu về code quality. Khi phát triển các hướng này, nhóm vẫn giữ nguyên nguyên tắc: kết quả phải giải thích được và giảng viên là người ra quyết định cuối.

### Chuyển sang Q&A - 39:00-39:30

**Thiện nói:**

> Tóm lại, SAGA tạo ra một chuỗi bằng chứng từ dữ liệu học thuật, công việc và kỹ thuật; dùng graph để truy xuất; dùng contribution để tổng hợp; và dùng cảnh báo để hỗ trợ đối soát. Em xin chuyển lại cho Trung để điều phối phần câu hỏi.

`[chuyển slide 22; Trung bước lên]`

---

## PHẦN 6 - Q&A - 39:30-44:30

### Câu mở Q&A của Trung

> Nhóm em xin cảm ơn Hội đồng đã lắng nghe. Nhóm xin sẵn sàng trả lời câu hỏi. Để trả lời ngắn gọn và đúng chuyên môn, em sẽ điều phối câu hỏi cho thành viên phụ trách phần liên quan.

### Phân công trả lời

| Chủ đề câu hỏi | Người trả lời chính | Người bổ sung |
|---|---|---|
| Bài toán, phạm vi, quyết định nghiệp vụ, phân quyền | Trung | Thiện |
| Backend, database, sync, session, API, graph projection | Khoa | Trung |
| Roster, grouping, account integration, OAuth UI | Hải | Khoa |
| Project, sprint, peer review, graph UI | Minh | Hải |
| Pipeline, anomaly, contribution, giới hạn, AI advisory | Thiện | Trung |

### Mẫu trả lời ngắn cho các câu hỏi dễ gặp

#### 1. Vì sao cần cả MySQL và Neo4j?

**Khoa trả lời:**

> MySQL giữ dữ liệu nghiệp vụ canonical và các quan hệ cần tính toàn vẹn giao dịch. Neo4j là graph projection phục vụ truy vấn nhiều bước như Student - Identity - Commit - Task và các chế độ drill-down. Neo4j không thay thế MySQL và không phải nguồn sự thật thứ hai; nếu dữ liệu thay đổi, projection được cập nhật từ dữ liệu canonical.

#### 2. Task Done nhưng không có commit có chắc là gian lận không?

**Thiện trả lời:**

> Không. Đó chỉ là cảnh báo cần đối soát. Task có thể thuộc Document hoặc Research và sử dụng file hoặc link làm evidence; cũng có thể identity chưa map hoặc đồng bộ chưa hoàn tất. Giảng viên phải mở task type, evidence, repository, branch và trạng thái sync trước khi kết luận.

#### 3. Nếu sinh viên spam commit thì sao?

**Thiện trả lời:**

> SAGA không xem số lượng commit là chất lượng. Hệ thống đặt commit trong ngữ cảnh repository, branch, task, identity và diff; đồng thời có peer review và evidence khác để đối chiếu. Với chất lượng nội dung, AI chỉ đưa phân tích tư vấn và giảng viên vẫn review. Vì vậy nhóm không tuyên bố loại bỏ hoàn toàn hành vi gian lận chỉ bằng thuật toán.

#### 4. Vì sao AI không trực tiếp chấm điểm?

**Trung trả lời:**

> Vì AI có thể sai và quyết định học thuật cần trách nhiệm giải trình. Trong SAGA, AI trả kết quả có cấu trúc gắn với evidence và có bước Lecturer review. Kết quả AI được tách khỏi Final Contribution Percentage và điểm học phần.

#### 5. Nếu Jira hoặc GitHub tạm thời không truy cập được?

**Khoa trả lời:**

> Người dùng vẫn có thể xem dữ liệu đã đồng bộ gần nhất trong SAGA, nhưng giao diện phải thể hiện freshness và trạng thái sync. Khi nguồn ngoài hoạt động lại, Leader có thể kích hoạt đồng bộ hoặc thực hiện luồng reconciliation. Nhóm không trình bày dữ liệu cũ như dữ liệu realtime.

#### 6. Tỷ lệ đóng góp có phải điểm cuối không?

**Thiện trả lời:**

> Không. SAGA tính tỷ lệ đóng góp tương đối dựa trên bốn nhóm tiêu chí, evidence và peer coefficient theo rule Backend. Đây là dữ liệu hỗ trợ giảng viên giải thích và ra quyết định; điểm học phần cuối vẫn thuộc quy trình học thuật của giảng viên và nhà trường.

#### 7. Làm sao bảo vệ dữ liệu giữa các lớp và các nhóm?

**Trung trả lời:**

> Backend kiểm tra quyền theo vai trò và phạm vi được phân công. Student chỉ xem dữ liệu course và team được phép; Leader có thêm quyền ở cấp project của team; Lecturer xem course được phân công; Admin quản lý dữ liệu hệ thống. Frontend chỉ ẩn hoặc hiện thao tác để cải thiện trải nghiệm, còn quyền thật phải được enforce ở Backend.

#### 8. Điểm khác biệt lớn nhất của SAGA là gì?

**Trung trả lời:**

> Điểm khác biệt không nằm ở một biểu đồ riêng lẻ, mà ở chuỗi truy xuất end-to-end: roster và team tạo đúng phạm vi; Jira và GitHub cung cấp dữ liệu; identity mapping gắn hoạt động với người; graph giải thích quan hệ; pipeline chỉ ra thiếu hụt; contribution tổng hợp kết quả mà vẫn cho phép mở minh chứng.

### Quy tắc trả lời trước Hội đồng

- Người được chỉ định trả lời trong 30-45 giây; người khác chỉ bổ sung khi thật sự cần.
- Nếu chưa chắc số liệu, nói: **"Trong phạm vi phiên bản hiện tại, nhóm xác nhận được..."** rồi trả lời phần chắc chắn; không đoán.
- Không dùng từ **phát hiện gian lận chắc chắn**. Dùng **gắn cờ bất thường để đối soát**.
- Không nói **AI chấm điểm**. Dùng **AI phân tích tư vấn, giảng viên review**.
- Không nói **Frontend tự tính contribution**. Kết quả canonical do Backend cung cấp.

---

## PHẦN 7 - KẾT THÚC - 44:30-45:00

`[sau câu hỏi cuối, Trung chuyển slide 23]`

**Trung nói:**

> Nhóm em xin cảm ơn các thầy cô. Thông điệp cuối cùng của SAGA là: đánh giá liên tục chỉ có ý nghĩa khi kết quả truy xuất được về đúng công việc và đúng minh chứng. SAGA hỗ trợ biến dữ liệu rời rạc thành một bức tranh có thể kiểm tra và giải thích, còn quyết định học thuật cuối cùng vẫn thuộc về giảng viên. Nhóm em xin trân trọng cảm ơn.

---

## 5. Phương án xử lý khi demo gặp lỗi

### Nếu OAuth GitHub/Jira yêu cầu đăng nhập lại

> Phần OAuth phụ thuộc phiên đăng nhập của nhà cung cấp. Để đảm bảo thời gian, nhóm xin dùng project đã kết nối sẵn và tiếp tục trình bày trạng thái sau khi callback hoàn tất.

### Nếu sync chậm

> Đồng bộ đang xử lý ở phía Backend. Giao diện hiển thị freshness và trạng thái sync để người dùng không nhầm dữ liệu cũ là dữ liệu mới. Nhóm xin chuyển sang snapshot dữ liệu đã đồng bộ trước để minh họa kết quả.

### Nếu graph không tải

> Graph là projection phục vụ truy vấn. Nhóm xin chuyển sang Pipeline hoặc bản chụp dự phòng để giải thích cùng chuỗi Student - Identity - Commit - Task, sau đó quay lại nếu kết nối ổn định.

### Nếu dữ liệu demo không có anomaly

> Đây là trạng thái tốt của dữ liệu hiện tại. Nhóm xin dùng bộ lọc và ảnh mẫu đã chuẩn bị để minh họa trường hợp task Done nhưng chưa có commit liên kết; đây vẫn chỉ là cảnh báo cần đối soát.

### Mốc cắt để không vượt 45 phút

Nếu chậm hơn kế hoạch:

1. Cắt phần đọc danh sách quyền ở slide 7-10, chỉ giữ một câu cho mỗi vai trò: tiết kiệm 90 giây.
2. Ở slide 12-15, không thực hiện upload/OAuth thật; dùng dữ liệu đã chuẩn bị: tiết kiệm 2 phút.
3. Ở slide 18, chỉ demo một node Student và một commit detail: tiết kiệm 60 giây.
4. Không cắt slide 19-21 vì đây là phần trả lời trực tiếp giá trị khác biệt, cơ chế đánh giá và giới hạn của hệ thống.

## 6. Checklist tập dượt

- Mỗi người tập đúng phần của mình hai lần có bấm giờ.
- Tập câu chuyển giao giữa năm người; người tiếp theo đứng sẵn trước khi được giới thiệu.
- Mở sẵn 6 tab demo: roster, grouping, integration, project configuration, graph/pipeline, contribution.
- Chuẩn bị một project mẫu có ít nhất: một task Code có commit, một task Document có file/link, một task Done thiếu commit và một identity/commit chưa map nếu có.
- Tắt thông báo cá nhân, lưu mật khẩu khỏi màn hình, tăng zoom trình duyệt đủ đọc từ xa.
- Chuẩn bị ảnh hoặc video ngắn cho OAuth, sync và graph để dùng khi mạng không ổn định.
- Người điều phối theo dõi các mốc: 07:30, 15:30, 23:00, 31:30, 39:30 và 44:30.
