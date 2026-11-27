# Canvas — Nửa Nạc Nửa Mỡ · Track F

> Điền ở guide bước 1.4. CP1 17:00 Thứ Sáu 27/11: nộp bản đầu, đủ 7 dòng (dòng 4 được ghi giả thuyết + nguồn sẽ kiểm).
> CP2 19:30 Thứ Sáu 27/11: cập nhật (số bằng chứng đầu, lát cắt đã chốt) và điền dòng "Đã đổi gì so với CP1".
> Track F: chép thêm thẻ đề của nhóm (khung trong file track F) xuống dưới bảng này.

| # | Dòng | Nhóm điền |
|---|---|---|
| 1 | Track + lát cắt dự kiến | F – Làn khác. Từ mục tiêu tự học, tìm nguồn web và tạo lộ trình theo ngày kèm bài đầu tiên có trích dẫn. |
| 2 | Người dùng chính (một vai cụ thể — không phải "học viên nói chung") | Sinh viên đang tự học một kỹ năng mới để làm bài tập hoặc dự án. |
| 3 | Pain một câu: ai — đang làm gì — vướng đâu — hậu quả | Khi tự học kỹ năng mới để làm bài tập hoặc dự án, sinh viên mất thời gian kiểm tra nguồn và xếp thứ tự học nên chậm bắt đầu bài đầu tiên. |
| 4 | Bằng chứng đầu — CP1: giả thuyết + nguồn sẽ kiểm · CP2: số đầu tiên + 1 trích dẫn | Đã xem 5 câu hỏi công khai về tự học SQL, Git và xác suất. Một người tự học mô tả sách “takes a sudden leap” khi chuyển sang kiến thức tiên quyết. Dự kiến phỏng vấn ít nhất 3 sinh viên ngoài nhóm để đo số phút và kiểm chứng giả thuyết. [Bằng chứng](evidence/summary.md#tín-hiệu-công-khai-tại-cp2). |
| 5 | **Lát cắt MỘT CÂU** (1 người dùng · 1 việc · 1 quyết định AI · 1 kết quả) | Một sinh viên muốn bắt đầu tự học một kỹ năng cho dự án nhập mục tiêu, trình độ và thời lượng mỗi ngày để AI chọn thứ tự học dựa trên nguồn web và trả về lộ trình kèm bài đầu tiên có trích dẫn. |
| 6 | AI tự làm đến đâu + 1 dòng lý do: sai thì ai chịu gì | AI tự tìm nguồn và soạn lộ trình nháp. Học viên quyết định dùng và có thể mở nguồn để kiểm tra. Nếu thiếu căn cứ, hệ thống hỏi lại hoặc thu hẹp bài vì nội dung sai khiến người học tốn thời gian học lại. |
| 7 | Phân công có tên | Nguyễn Gia Bảo – PO/PM/BA, bằng chứng, thiết kế hệ thống, UI, hợp đồng API và eval. Nguyễn Quang Đạo – backend và tích hợp. Phan Bá An – AI và tìm nguồn web. Nguyễn Vũ Thành Long – frontend và chọn stack. |
| — | *(CP2)* Đã đổi gì so với CP1 | Giữ người dùng chính và lát cắt. Bổ sung tín hiệu từ 5 câu hỏi công khai, chốt 3 chủ đề mock và đưa ca thiếu kiến thức tiên quyết vào benchmark. |

## Track F · Lộ trình tự học có dẫn nguồn

**Lĩnh vực.** Tự học từ nguồn web công khai. Bản đầu hỗ trợ lập trình và công cụ phát triển, dữ liệu và AI cơ bản, toán và thống kê, khoa học tự nhiên, kỹ thuật cơ bản, ngoại ngữ, viết học thuật và nghiên cứu, kinh doanh và kinh tế cơ bản, công cụ học tập và văn phòng, kỹ năng học tập và nghề nghiệp.

**Pain.** Sinh viên tự học kỹ năng để làm bài tập hoặc dự án phải kiểm tra nguồn và tự xếp thứ tự học, làm chậm lúc bắt đầu.

**Insight từ người dùng thật.** Tín hiệu công khai cho thấy người học có thể bị kẹt khi nguồn nhảy qua kiến thức tiên quyết. Đang chờ phỏng vấn sinh viên ngoài nhóm để xác nhận số người gặp và thời gian họ mất.

**Người dùng.** Vai chính là sinh viên đang tự học cho bài tập hoặc dự án. Dự kiến tiếp cận sinh viên ngoài nhóm qua bạn học và các nhóm học tập trong hai ngày hackathon. Sản phẩm có thêm hồ sơ học sinh THCS, học sinh THPT và người đi làm để điều chỉnh cách dạy.

**Data.** Bằng chứng từ phỏng vấn đã ẩn danh. Bản chạy thử dùng đoạn trích ngắn, URL và tiêu đề từ tài liệu công khai. Ghi nguồn trong [data/DATA_CARD.md](data/DATA_CARD.md) và chỉ lưu nội dung tối thiểu cần đối chiếu.

**Lát cắt.** Một sinh viên muốn bắt đầu tự học một kỹ năng cho dự án nhập mục tiêu, trình độ và thời lượng mỗi ngày để AI chọn thứ tự học dựa trên nguồn web và trả về lộ trình kèm bài đầu tiên có trích dẫn.

**Công cụ của agent.** `search_web(query)` nhận truy vấn học tập, trả tiêu đề, URL và đoạn bằng chứng từ web công khai. Công cụ chỉ đọc.

**Bộ câu thử.** Ví dụ sinh viên mới học SQL để làm báo cáo có 20 phút mỗi ngày. Chấm thứ tự học, độ phù hợp của bài đầu và nguồn có hỗ trợ nhận định được dẫn. Thử thêm yêu cầu mơ hồ, thiếu nguồn và nằm ngoài 10 lĩnh vực để kiểm tra hỏi lại, báo thiếu căn cứ và từ chối đúng lúc.

**Persona chi phí.** Ít, vừa và nhiều lần lượt tạo 1, 3 và 8 lộ trình mỗi tháng *(tự ước tính ban đầu, sẽ đối chiếu phỏng vấn)*.

**Bẫy.** Trích dẫn có link nhưng sai nội dung, bài vượt trình độ hoặc thời lượng, và trang nguồn có chỉ dẫn làm lệch workflow.

**An toàn.** AI chỉ soạn trong phạm vi đã chốt, không tạo bài về nghệ thuật, chính trị, lịch sử cách mạng hoặc chủ đề bạo lực. Khi chưa đủ nguồn, AI báo thiếu căn cứ và gợi ý thu hẹp yêu cầu. Chỉ dùng thông tin cần cho bài học, không thu tên, mã học viên hoặc hồ sơ cá nhân trong đầu vào.
