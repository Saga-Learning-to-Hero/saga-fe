# Slide 1 – Mở đầu
Kính thưa các thầy cô trong Hội đồng. Nhóm em xin trình bày đề tài SAGA, viết đầy đủ là Student Activity Graph-Based Continuous Assessment for Project-Based Learning.
Câu hỏi trung tâm của đề tài là: trong một dự án học tập theo nhóm, làm thế nào để giảng viên quan sát được quá trình đóng góp của từng sinh viên, thay vì chỉ nhìn sản phẩm cuối cùng hoặc dựa hoàn toàn vào phần tự báo cáo của nhóm?
SAGA tiếp cận câu hỏi này bằng cách kết nối hoạt động dự án thành một chuỗi bằng chứng có thể truy xuất. Mục tiêu của hệ thống là hỗ trợ việc đánh giá trở nên rõ ràng, nhất quán và giải thích được; không thay thế quyết định học thuật của giảng viên.
# Slide 2 – Thành viên
Nhóm gồm năm thành viên, với hai thành viên phụ trách Backend và ba thành viên phụ trách Frontend. Việc phân công cụ thể được thể hiện trên slide.
Thay vì trình bày theo từng màn hình rời rạc, nhóm sẽ đi theo đúng vòng đời của dữ liệu: từ roster và Team, đến Jira và GitHub, sau đó là Task, evidence, Graph, contribution và Delay Case.
# Slide 3 – Context
Trong Project-Based Learning, bằng chứng về quá trình làm việc thực ra được tạo ra liên tục. Sinh viên tạo Task, Commit, tài liệu, file đính kèm và Peer Review trong suốt dự án.
Vấn đề là các bằng chứng này đang nằm rải rác. Jira mô tả công việc và trạng thái; GitHub giữ dấu vết kỹ thuật; tài liệu hoặc nghiên cứu có thể nằm trong file và đường dẫn riêng; Peer Review lại thuộc một nguồn khác. Dữ liệu không thiếu, nhưng chưa tạo thành một câu chuyện thống nhất.
Vì vậy, khi cần đánh giá đóng góp cá nhân, giảng viên phải tự ghép nhiều nguồn và tự khôi phục lại quá trình đã diễn ra. Thách thức cốt lõi của đề tài không phải là thu thập thêm thật nhiều dữ liệu, mà là tạo khả năng traceability: từ một kết quả có thể lần ngược về đúng sinh viên, đúng Task và đúng evidence.
# Slide 4 – Problem
Từ bối cảnh đó, nhóm xác định ba vấn đề chính.
Thứ nhất, trong một kết quả chung của Team, rất khó tách được nỗ lực cá nhân nếu chỉ nhìn sản phẩm cuối cùng. Hai thành viên có thể cùng xuất hiện trong một Project nhưng mức độ tham gia và loại công việc hoàn toàn khác nhau.
Thứ hai, một Task được đánh dấu Done chưa chắc đã có evidence phù hợp. Task Code hoặc Test thường cần Commit; Task Document hoặc Research có thể cần file hoặc web link. Vì vậy, trạng thái Done và điều kiện đủ bằng chứng phải được kiểm tra tách biệt.
Thứ ba, giảng viên phải mở Jira, GitHub, file minh chứng, work session và Peer Review rồi đối chiếu thủ công. Cách làm này tốn thời gian và khó giữ cùng một tiêu chuẩn giữa nhiều Team.
Điểm quan trọng là SAGA không tự kết luận một sinh viên gian lận chỉ vì dữ liệu thiếu. Hệ thống chỉ tạo warning để yêu cầu con người kiểm tra thêm ngữ cảnh.
# Slide 5 – Solution
Giải pháp của SAGA được tổ chức thành ba năng lực.
Năng lực thứ nhất là Connect. Hệ thống kết nối dữ liệu học vụ, Team và identity của sinh viên với Task trên Jira và Commit trên GitHub. Nhờ đó, hoạt động bên ngoài có thể được quy về đúng phạm vi Course, Project và Student.
Năng lực thứ hai là Trace. SAGA liên kết Student, Task, Commit, work session và evidence hỗ trợ. Khi một mắt xích chưa đầy đủ, hệ thống hiển thị traceability gap để giảng viên biết cần mở phần nào trước.
Năng lực thứ ba là Support Review. Backend tổng hợp đóng góp theo các tiêu chí có trọng số, hierarchy của Task và Peer Review. AI có thể cung cấp phân tích tư vấn về tiến độ hoặc rủi ro, nhưng không tự thay đổi tỷ lệ đóng góp và không tự quyết định điểm học phần.
Thông điệp cần giữ xuyên suốt là: SAGA hỗ trợ quyết định học thuật bằng evidence có thể kiểm tra; trách nhiệm kết luận cuối cùng vẫn thuộc giảng viên.
# Slide 6 – Chuyển phần System Architecture
Em xin tiếp tục với kiến trúc tổng thể. Phần này trả lời hai câu hỏi: dữ liệu đi qua những lớp nào, và nguồn nào chịu trách nhiệm cho từng loại thông tin.
# Slide 7 – System Architecture
Khi nhìn sơ đồ này, có thể chia SAGA thành bốn nhóm thành phần chính.
Nhóm thứ nhất là Client, cụ thể là Web Application được xây dựng bằng Next.js và React. Đây là nơi người dùng thao tác với dashboard, Task, biểu đồ và Graph. Cytoscape phục vụ Graph tương tác; Recharts phục vụ các biểu đồ. Frontend không tự tạo dữ liệu nghiệp vụ cuối cùng mà gọi Backend và hiển thị dữ liệu canonical được trả về.
Nhóm thứ hai là Application Server chạy Java và Spring Boot. Backend chịu trách nhiệm xác thực phiên, phân quyền, kiểm tra rule nghiệp vụ, đồng bộ dữ liệu, tính toán contribution và kết nối các dịch vụ bên ngoài. Việc một nút bị ẩn trên Frontend chỉ là trải nghiệm giao diện; quyền thật luôn được Backend kiểm tra.
Nhóm thứ ba là Data Layer. MySQL là nguồn dữ liệu nghiệp vụ chính, lưu người dùng, Course, Team, Project, Task, cấu hình và kết quả đánh giá. Neo4j là Graph projection để truy vấn nhanh các quan hệ như Project, Task hierarchy, Student, Identity và Commit. Redis hỗ trợ session, OAuth state và dữ liệu cache tạm thời. Ba hệ thống này không cạnh tranh vai trò: MySQL giữ dữ liệu canonical, Neo4j tối ưu truy vấn quan hệ, còn Redis phục vụ trạng thái ngắn hạn.
Nhóm cuối là các dịch vụ tích hợp. Jira cung cấp work item, Sprint và trạng thái công việc. GitHub cung cấp repository và Commit. Google hỗ trợ đăng nhập; Firebase hỗ trợ notification; Gmail phục vụ email; Gemini minh họa cho dịch vụ AI bên ngoài. AI chỉ đưa ra phân tích tư vấn và không tự ghi đè kết quả đánh giá.
Luồng chính là: dữ liệu từ Jira và GitHub đi vào Backend; Backend chuẩn hóa và lưu trạng thái nghiệp vụ; sau đó tạo projection cho Graph; Frontend đọc lại dữ liệu từ Backend để hiển thị. Vì vậy, nếu Hội đồng hỏi tại sao cần cả MySQL và Neo4j, câu trả lời là MySQL giữ nguồn sự thật nghiệp vụ, còn Neo4j là read model chuyên cho truy vấn quan hệ.
# Slide 8 – Technology Stack, phần lõi
Ở Frontend, Next.js và React đảm nhiệm giao diện; Cytoscape trực quan hóa Graph; Recharts thể hiện số liệu; shadcn/ui cung cấp các thành phần giao diện nhất quán.
Ở Backend, hệ thống sử dụng Java 21, Spring Boot, Spring MVC và Spring Security. Kiến trúc này phù hợp với các rule phân quyền, đồng bộ và xử lý nghiệp vụ tập trung.
Ở lớp dữ liệu, MySQL xử lý dữ liệu quan hệ và giao dịch nghiệp vụ; Neo4j xử lý Graph projection; Redis lưu trạng thái phiên và cache. Việc lựa chọn công nghệ đi theo đặc điểm dữ liệu, thay vì cố dùng một database cho mọi mục đích.
# Slide 9 – Integrations và Deployment
SAGA tích hợp với Jira và GitHub để lấy dữ liệu dự án, Google OAuth 2.0 để xác thực, Firebase và Gmail để gửi thông báo, cùng dịch vụ AI để hỗ trợ phân tích.
Frontend được triển khai trên Vercel; Backend được triển khai trên Railway; các dịch vụ dữ liệu được vận hành trên Aiven theo kiến trúc hiện tại. Do phụ thuộc vào Jira và GitHub, giao diện phải thể hiện trạng thái sync và độ mới dữ liệu; nhóm không trình bày dữ liệu cũ như dữ liệu realtime.
# Slide 10 – Chuyển phần Actors
Sau kiến trúc, chúng ta cần xác định ai được làm gì. SAGA có ba account role là Admin, Lecturer và Student; trong Student có hai team role là Team Leader và Member.
# Slide 11 – Actors Overview
Admin quản lý dữ liệu học vụ và vận hành hệ thống. Lecturer giám sát Course, Team, tiến độ và evidence. Team Leader vẫn là Student nhưng có thêm quyền cấu hình Project, nguồn tích hợp và quản lý công việc của Team. Member tập trung vào Task được giao, work session, evidence, identity cá nhân và Peer Review.
Điểm cần phân biệt là Team Leader và Member không phải account role độc lập bên cạnh Student. Đây là vai trò trong phạm vi Team. Cách mô hình hóa này giúp một tài khoản Student tham gia đúng ngữ cảnh mà không tạo thêm một loại tài khoản toàn hệ thống.
# Slide 12 – Admin
Admin phụ trách dữ liệu học vụ và quản trị vận hành. Vai trò này quản lý tài khoản, semester, subject, syllabus version, academic class và Course; đồng thời gán Lecturer và nhập roster sinh viên.
Admin cũng theo dõi dashboard, trạng thái tích hợp và audit log. Tuy nhiên, Admin không mặc nhiên được cấp quyền xem toàn bộ dữ liệu nội bộ của mọi Project. Dữ liệu vận hành toàn hệ thống và dữ liệu làm việc chi tiết của Team là hai phạm vi khác nhau.
# Slide 13 – Lecturer
Lecturer truy cập những Course được phân công, xem roster, tổ chức Team và gán Team Leader. Trong quá trình môn học diễn ra, Lecturer theo dõi Sprint, Task, Commit, evidence, Graph và traceability gap.
Lecturer cấu hình tiêu chí cùng trọng số đóng góp, xem Peer Review, contribution evaluation, On-Time Rate và Delay Case. Các phân tích AI chỉ hỗ trợ Lecturer; hệ thống không tự động gán điểm học phần cuối cùng.
# Slide 14 – Team Leader
Team Leader tạo Project cho Team, kết nối Jira và GitHub, chọn repository, đồng bộ hoạt động và quản lý Sprint cùng Task theo policy của Project.
Leader cũng theo dõi tiến độ, evidence, Graph và traceability gap; đồng thời review phần giải trình Task trễ của Member khi rule yêu cầu. Dù có quyền quản lý mở rộng, Team Leader vẫn là Student trong Course, không phải một vai trò quản trị toàn hệ thống.
# Slide 15 – Member
Member liên kết Jira và GitHub cá nhân, xem Project, Backlog, Kanban, Timeline, Commit và Graph. Member có thể tạo Task tự gán và cập nhật Task được giao cho mình, ghi work session, cung cấp file, link, Commit SHA hoặc pull request URL làm evidence, thực hiện Peer Review và giải trình Task trễ.
Member không được cấu hình nguồn tích hợp của Project, quản lý Sprint, gán Task cho người khác hoặc sửa Task của thành viên khác. Những giới hạn này được Backend kiểm tra, không chỉ được ẩn trên giao diện.
# Slide 16 – Chuyển phần Main Flows
Từ phần này, nhóm trình bày sáu Main Flow theo đúng thứ tự dữ liệu trở thành contribution evidence có thể review. Hai flow đầu thiết lập phạm vi học vụ, identity và nguồn Project.
# Slide 17 – Main Flow 01: Course Roster and Team Assignment
Flow đầu tiên trả lời câu hỏi: trước khi theo dõi Project, hệ thống biết sinh viên nào thuộc Course nào và làm việc trong Team nào bằng cách nào?
Ở phía Admin, Course được tạo và gán đúng Lecturer. Admin tải roster sinh viên bằng file Excel theo mẫu. Hệ thống không ghi ngay mà cho Preview, chỉ ra dữ liệu lỗi và yêu cầu Confirm. Khi roster đã hợp lệ, Lecturer tải Team Template của chính Course đó, điền thành viên cùng Team Leader, rồi tiếp tục Preview và Confirm cấu trúc Team.
Hai lần import phục vụ hai quyết định khác nhau. Roster xác nhận ai được phép tham gia Course và thuộc trách nhiệm Admin. Team assignment tổ chức những sinh viên hợp lệ thành các Team và thuộc trách nhiệm Lecturer.
Kết quả của flow là Course có roster và Team đã được xác nhận, tạo nền tảng cho phân quyền và đánh giá phía sau. Giới hạn hiện tại là SAGA không có quyền truy cập trực tiếp danh sách sinh viên chính thức của trường. Vì vậy, hệ thống sử dụng file Excel được cấp quyền thay vì tuyên bố một tích hợp chưa tồn tại.
## Demo ngắn
*[Mở Course đã chuẩn bị sẵn. Chỉ vào roster đã xác nhận, màn hình Preview hoặc ảnh lỗi theo dòng, rồi mở danh sách Team. Không upload hoặc Confirm file thật trong buổi bảo vệ.]*
Ở đây nhóm đã chuẩn bị một Course có roster hợp lệ. Bước Preview cho phép phát hiện dữ liệu sai trước khi ghi. Sau khi Lecturer xác nhận Team assignment, mỗi sinh viên mới được đặt vào đúng Team và đúng vai trò.
# Slide 18 – Main Flow 02: Identity and Project Source Setup
Flow 02 có hai nhánh song song.
Nhánh thứ nhất thuộc về từng Student. Mỗi thành viên liên kết tài khoản Jira và GitHub cá nhân để SAGA ánh xạ Task, Commit và identity về đúng hồ sơ. Đây là liên kết danh tính làm việc, không phải xác minh danh tính học vụ với nhà trường.
Nhánh thứ hai thuộc về Team Leader. Leader tạo Project, kết nối một hoặc nhiều Jira Source, chọn GitHub repository và gán vai trò repository, sau đó kích hoạt đồng bộ ban đầu.
Việc tách personal integration và project integration là có chủ đích. Personal integration trả lời hoạt động thuộc về Student nào; project integration trả lời dữ liệu của Team đến từ nguồn nào. Sau Initial Sync, SAGA có đủ Student, Team và source context để truy xuất Task và Commit mà không suy đoán từ tên hiển thị.
## Demo ngắn
*[Mở trang Personal Integrations đã liên kết và Project Integrations của Team Leader. Chỉ trạng thái Connected, Jira Source, repository được chọn và trạng thái lần sync gần nhất. Không chạy lại OAuth nếu không cần.]*
# Slide 19 – Main Flow 03: Sprint Execution with Traceable Evidence
Flow 03 mô tả một Task từ lúc được lập kế hoạch đến khi hoàn thành có evidence.
Task có thể được tạo trong Backlog hoặc đồng bộ từ Jira, sau đó được đưa vào Sprint. Task phục vụ contribution nhận một criterion label như Code, Test, Document hoặc Research. Assignee thực hiện công việc, ghi work session và bổ sung evidence phù hợp trước khi chuyển Task sang Done.
Điểm quan trọng nhất là SAGA tách trạng thái Done khỏi evidence eligibility. Done chỉ là trạng thái workflow. Task Code hoặc Test thường cần Commit; Task Document hoặc Research có thể hợp lệ bằng file hoặc web link. Vì vậy, một Task Done vẫn có thể tạo warning nếu chuỗi assignee, Task và evidence chưa đầy đủ.
SAGA cũng đọc issue type và quan hệ cha con thật từ Jira. Epic, standard work item và Subtask được phân biệt theo hierarchy level do Backend cung cấp; Frontend không đoán từ tên issue type. Việc này là nền tảng để tránh cộng trùng Task cha và Subtask ở bước đánh giá.
## Demo trực tiếp
*[Mở một Task Code đã nằm trong Sprint, có assignee và criterion label. Bắt đầu hoặc chỉ một work session đang chạy. Đóng drawer rồi mở lại nếu môi trường ổn định. Mở phần contribution evidence và chỉ Commit đã liên kết. Cuối cùng chỉ badge đủ hoặc thiếu evidence.]*
Task này đang thuộc Sprint và đã được gán đúng thành viên. Work session được lưu ở server nên không phụ thuộc vào việc drawer còn mở. Ở phần evidence, Commit được liên kết với Task. Khi Task chuyển Done, Backend kiểm tra điều kiện evidence riêng với trạng thái workflow và trả về kết quả canonical cho Frontend.
## Nếu demo gặp lỗi
Nếu màn hình không tải kịp, nhóm chuyển ngay sang snapshot và nói: “Dữ liệu demo hiện phụ thuộc môi trường tích hợp. Snapshot này thể hiện cùng ba thông tin cần kiểm tra là assignee, criterion và evidence; nhóm tiếp tục giải thích theo dữ liệu đã chuẩn bị.”
# Slide 20 – Main Flow 04: Traceability and Evidence Review
Flow 04 biến dữ liệu đã đồng bộ thành nội dung con người có thể kiểm tra. Người dùng bắt đầu bằng việc chọn Project, Sprint hoặc Student cần xem.
Graph View và Task-Commit Pipeline nên được hiểu là hai góc nhìn bổ sung, không phải hai bước bắt buộc nối tiếp. Graph phù hợp khi cần thấy quan hệ tổng thể và hierarchy. Project nối các root work item; Task cha nối Task con; Task nối Commit; Commit đi qua Identity để ánh xạ về Student.
Pipeline phù hợp khi cần rà theo danh sách. Người dùng có thể đối chiếu Member, Task và Commit, lọc Task Done thiếu liên kết, Task chưa gán hoặc identity chưa được map. Những liên kết này đến từ Backend; Frontend không tự parse commit message để tạo quan hệ giả.
Từ cả hai góc nhìn, Lecturer hoặc Team Leader mở Task and Evidence Details. Nếu có khoảng trống, SAGA hiển thị traceability warning. Warning chỉ nói dữ liệu hiện tại cần được review; nó không tự chứng minh fraud hoặc misconduct.
## Demo trực tiếp
*[Mở Graph Overview theo Project hoặc Sprint. Chọn một Task node để hiện inspector và quan hệ PARENT_OF hoặc EVIDENCED_BY. Sau đó chuyển sang Pipeline hoặc Audit Matrix, lọc một Task Done thiếu evidence và mở chi tiết.]*
Graph trả lời các thực thể liên quan như thế nào; Pipeline trả lời trường hợp nào cần mở trước. Ở ví dụ này, SAGA chỉ ra Task đang thiếu liên kết evidence theo dữ liệu hiện có. Nhóm chưa kết luận nguyên nhân cho tới khi kiểm tra loại Task, identity mapping, trạng thái sync và evidence chi tiết.
# Slide 21 – Main Flow 05: Peer Review and Contribution Evaluation
Flow 05 bắt đầu từ một Sprint đủ điều kiện đánh giá. Peer Review mở trong 48 giờ trước khi Sprint kết thúc hoặc khi Sprint đã đóng, để phản hồi diễn ra gần thời điểm công việc hoàn thành.
Backend lấy các Task Done có criterion và evidence hợp lệ. Lecturer cấu hình trọng số cho bốn nhóm Code, Test, Document và Research. Sau đó Backend áp dụng rule hierarchy để tránh coi Task cha và Subtask là hai khối điểm độc lập, rồi kết hợp Peer Review như một hệ số tương đối và chuẩn hóa contribution trong Team.
Frontend không tự đếm Commit rồi đổi thành điểm, cũng không tự tính phần trăm cuối cùng. Lecturer xem breakdown, warning và evidence ở chế độ read-only để hiểu kết quả được tạo ra như thế nào.
Final Contribution Percentage không phải điểm học phần thang 10. Đây là chỉ số tương đối có thể giải thích, dùng làm một đầu vào cho quyết định học thuật. Lecturer vẫn cần xem chất lượng chuyên môn, bối cảnh Team và quy định môn học.
## Demo trực tiếp
*[Mở một Sprint có contribution evaluation. Chỉ các criterion weight, mở breakdown của một thành viên, chỉ Task hoặc evidence liên quan và Peer Review coefficient. Không chỉnh trực tiếp kết quả cuối.]*
Màn hình này cho biết contribution đến từ nhóm tiêu chí nào và có thể mở ngược về Task cùng evidence. Tỷ lệ được Backend chuẩn hóa; giao diện không có chức năng override tùy ý kết quả canonical.
# Slide 22 – Main Flow 06: Delay Case Review and On-Time Monitoring
Flow 06 xử lý một chiều khác của quá trình làm việc: Task đã trễ, nhưng nguyên nhân và tác động cần được giải thích minh bạch.
Khi Backend phát hiện Task quá hạn, hệ thống mở Delay Case cho assignee. Thành viên có ba ngày để gửi nguyên nhân, ghi chú và evidence nếu cần. Nếu assignee là Member, Team Leader review trước. Nếu chính Team Leader là người có Task trễ, case bỏ qua bước Leader để tránh tự review và chuyển thẳng Lecturer khi cần.
Case có thể được đóng theo hướng objective hoặc subjective, hoặc được Lecturer mở lại. Objective nghĩa là Task vẫn trễ về mặt thời gian nhưng nguyên nhân khách quan đã được chấp nhận và được ghi nhận là excused late. Subjective hoặc không giải trình đúng hạn vẫn được tính là late.
Sau khi case thay đổi, On-Time Rate được tính lại. Metric này phục vụ theo dõi tính đúng hạn và hoàn toàn tách khỏi Final Contribution Percentage. Một người có contribution cao vẫn có thể có Task trễ, và ngược lại.
## Demo trực tiếp
*[Mở Delay Case queue, chọn một case đang chờ review. Chỉ assignee, lý do, evidence, trạng thái và các hành động Backend cho phép. Sau đó mở On-Time Rate để chỉ số liệu sau khi case được phân loại.]*
Ở đây quyền hành động được Backend trả về theo trạng thái và vai trò. Thành viên khác không mặc nhiên xem ghi chú riêng hoặc evidence URL. Sau khi case được chấp nhận là objective hoặc subjective, hệ thống cập nhật On-Time Rate nhưng không thay đổi contribution percentage.
# Slide 23 – Current Limitations
Nhóm nhìn nhận bốn giới hạn hiện tại.
Thứ nhất, SAGA chưa có quyền truy cập danh sách sinh viên chính thức của trường, nên roster và Team assignment vẫn cần file Excel được phê duyệt. Đây là giới hạn quan trọng nhất ở bước onboarding.
Thứ hai, con người vẫn phải review chất lượng học thuật. SAGA cung cấp evidence, warning và tỷ lệ hỗ trợ, nhưng không thể thay Lecturer đánh giá chất lượng nội dung.
Thứ ba, độ mới dữ liệu phụ thuộc Jira, GitHub, trạng thái đồng bộ và identity mapping. Khi dịch vụ ngoài gián đoạn, người dùng phải biết dữ liệu gần nhất được cập nhật khi nào.
Thứ tư, khả năng hiểu nội dung phi mã nguồn còn hạn chế. File và web link có thể truy xuất, nhưng nội dung học thuật của chúng chưa được phân tích sâu và nhất quán như code evidence.
# Slide 24 – Future Work
Từ các giới hạn đó, nhóm xác định bốn hướng phát triển.
Thứ nhất là tích hợp hệ thống thông tin sinh viên nếu nhà trường cấp quyền và API phù hợp, để đồng bộ roster được ủy quyền thay cho quy trình Excel hiện tại.
Thứ hai là mở rộng content-aware analysis cho tài liệu, research artifact và code, nhưng vẫn giữ Lecturer trong vòng review.
Thứ ba là tăng khả năng phục hồi đồng bộ, reconciliation, freshness reporting và công cụ chẩn đoán tích hợp.
Thứ tư là kiểm thử ở quy mô production với Course lớn hơn, nhiều Project hơn và khối lượng Graph lớn hơn để đánh giá authorization, synchronization và hiệu năng truy vấn.
Dù mở rộng theo hướng nào, nguyên tắc của SAGA vẫn không thay đổi: hệ thống hỗ trợ bằng evidence và phân tích có thể giải thích; quyết định học thuật cuối cùng vẫn thuộc Lecturer.
# Slide 25 – Q&A
Tóm lại, sáu flow tạo thành một chuỗi liền mạch: xác lập đúng Student và Team, kết nối đúng nguồn, ghi nhận evidence khi thực hiện Task, đối soát quan hệ, chuẩn hóa contribution và giải thích Task trễ.
Nhóm em xin cảm ơn Hội đồng và sẵn sàng trả lời câu hỏi. Từng câu hỏi sẽ được chuyển cho thành viên phụ trách nội dung liên quan.
# Slide 26 – Kết thúc
Nhóm em xin trân trọng cảm ơn các thầy cô. Thông điệp cuối cùng của SAGA là: đánh giá liên tục chỉ có ý nghĩa khi kết quả có thể truy xuất về đúng công việc và đúng evidence. SAGA biến dữ liệu rời rạc thành một bức tranh có thể kiểm tra và giải thích, còn quyết định học thuật cuối cùng vẫn thuộc về giảng viên.
