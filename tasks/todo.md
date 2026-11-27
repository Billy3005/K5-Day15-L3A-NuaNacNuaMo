# Task hackathon theo checkpoint và người phụ trách

Đọc [kế hoạch ghép việc](plan.md), [wireframe](../docs/ui-wireframes.md) và [OpenAPI](../docs/openapi.json). Các task có ghi “khi ghép” có thể bắt đầu bằng fixture hoặc kiểm riêng. Đánh dấu xong sau khi có bằng chứng theo điều kiện bàn giao.

## CP1 và CP2 · Kiểm lại trạng thái nộp

- [x] **BAO-CP1-01 · Bảo · Hoàn tất hồ sơ CP1.** Điền TEAMS, canvas 7 dòng và thẻ Track F. Kiểm repo Public. **Bàn giao khi** Repo đã hiển thị bản điền và checker nhận 4 thành viên. Commit fc01e3b đã xác minh.
- [x] **BAO-CP1-02 · Bảo · Xác nhận nộp Form 2 CP1.** Đối chiếu biên nhận hoặc phản hồi Form 2 nhánh CP1. **Bàn giao khi** Ghi trạng thái thực tế và giờ nộp nếu có. **Phụ thuộc** BAO-CP1-01. Bảo xác nhận đã nộp.
- [ ] **BAO-CP2-01 · Bảo · Xác nhận nộp Form 2 CP2.** Đối chiếu biên nhận CP2 và link hồ sơ đã khóa. **Bàn giao khi** Có xác nhận giờ nộp hoặc ghi rõ trạng thái chưa nộp. **Phụ thuộc** BAO-00. Hồ sơ CP2 đã lên `main` ở `9be0dfd`. Bảo xác nhận chưa nộp Form 2 nhánh CP2.

## Đã bàn giao CP3

- [x] **BAO-00 · Bảo · Hồ sơ CP2.** Chốt benchmark, metric và bản chạy thử mock. **Bàn giao khi** 12 ca, 3 metric và chấm độc lập khớp 5/5.
- [x] **BAO-01 · Bảo · Bàn giao thiết kế.** Viết wireframe, API và mẫu dữ liệu cho team. **Bàn giao khi** 3 endpoint và 12 ví dụ đã kiểm schema.

## Bắt đầu song song

- [x] **BAO-02 · Bảo · Thu bằng chứng từ người dùng.** Đã lưu 32 phiếu ẩn danh và xác định 28 phiếu phù hợp theo mục đích tự học. Bảo xác nhận cả 28 đến từ người ngoài nhóm. [Hồ sơ khảo sát](../evidence/survey/questions.md).
- [x] **BAO-05 · Bảo · Mở rộng bộ eval CP3.** Thêm B13–B30, giữ nguyên 12 ca CP2. Chín ca mới có URL câu hỏi công khai. **Bàn giao khi** 30 ca, giữ chuẩn CP2, `python run.py check` qua.
- [ ] **LONG-01 · Long · Chọn stack và dựng form.** Chốt cách chạy với Đạo, hiện đủ 5 trường và điền nhanh ví dụ SQL. **Bàn giao khi** Form hoạt động trên màn hình hẹp, chặn trường trống và số phút sai.
- [ ] **LONG-03 · Long · Hiện lộ trình và bài 1 mock.** Dựng mục lục 5 ngày, bài đầu, ví dụ, bài tập và nhãn mock. **Bàn giao khi** Chạy độc lập từ JSON mẫu, ngày 2–5 chỉ hiện mục tiêu.
- [ ] **LONG-05 · Long · Dựng thư viện và nối GET.** Dựng danh sách từ JSON mẫu trước, rồi nối đọc theo ID. **Bàn giao khi** Tải lại mở đúng khóa, có trạng thái rỗng và 404. **Phụ thuộc** DAO-04 khi nối API.
- [ ] **DAO-01 · Đạo · Dựng POST trả fixture.** Đặt endpoint tạo khóa trả JSON mẫu 201, cho Long ghép form. **Bàn giao khi** Swagger hoặc HTTP client kiểm đúng request và response 201.
- [ ] **DAO-03 · Đạo · Tạo lớp lưu SQLite.** Tạo lưu và đọc khóa theo ID, dùng fixture để thử trước. **Bàn giao khi** Ghi một khóa, khởi động lại vẫn đọc lại đúng khóa.
- [ ] **DAO-05 · Đạo · Kiểm đầu vào và ánh xạ lỗi.** Viết xác thực 5 trường và ánh xạ mã 422/503 theo hợp đồng. **Bàn giao khi** Kiểm trường sai, thiếu nguồn, ngoài phạm vi và lỗi dịch vụ. **Phụ thuộc** DAO-01 khi ghép.
- [ ] **DAO-06 · Đạo · Chuẩn hóa lệnh chạy demo.** Giữ python run.py làm điểm vào và phối hợp Long phục vụ UI. **Bàn giao khi** Máy teammate chạy từ repo theo README và mở được trang demo. **Phụ thuộc** Long chốt cách chạy để ghép.
- [ ] **AN-01 · An · Thử API tìm kiếm thật.** Kiểm key, quota và một lượt tìm theo mục tiêu học. **Bàn giao khi** Có ít nhất một nguồn công khai với tiêu đề, URL và đoạn trích.
- [ ] **AN-04 · An · Nối model thật.** Cấu hình model qua call_model và thử usage. **Bàn giao khi** Gọi được model và đọc token thật từ usage.
- [ ] **AN-06 · An · Sinh bài JSON và kiểm trích dẫn.** Soạn prompt và validator bằng fixture trước, rồi ghép nguồn thật. **Bàn giao khi** JSON có đủ plan, lesson và source_ids trỏ đúng danh sách nguồn. **Phụ thuộc** AN-04, AN-05 khi chạy thật.

## Sau khi có đầu vào từ task khác

- [x] **BAO-04 · Bảo · Tổng hợp bằng chứng và impact.** Đã tổng hợp 32 phiếu, 5 trích dẫn và ước tính thời gian chuẩn bị. Phạm vi xác minh người trả lời và mức tiết kiệm cần đo đã được ghi trong [hồ sơ bằng chứng](../evidence/summary.md).
- [ ] **BAO-06 · Bảo · Chấm đầu ra thật.** Đối chiếu bài, nguồn và trạng thái dừng theo metric CP2. **Bàn giao khi** Có run ID, số đạt và ví dụ lỗi gắn ca thử. **Phụ thuộc** AN-08, BAO-05.
- [ ] **BAO-03 · Bảo · Nghiệm thu demo web.** Kiểm ca SQL, ca thiếu nguồn và tải lại để mở khóa. **Bàn giao khi** Có xác nhận web + nguồn thật và trạng thái lỗi, checklist demo đã ghi. **Phụ thuộc** LONG-06, BAO-06.
- [ ] **LONG-04 · Long · Mở trích dẫn trong bài.** Nối source_ids với đoạn đối chiếu và URL, cho mở bằng bàn phím. **Bàn giao khi** Chạm S1 mở đúng đoạn nguồn và có link mở trang gốc. **Phụ thuộc** LONG-03.
- [ ] **LONG-02 · Long · Nối POST và xử lý trạng thái.** Nối nút tạo với endpoint mock, hiển thị loading, 422 và 503. **Bàn giao khi** Ca hợp lệ mở bài; ca thiếu nguồn và lỗi kỹ thuật giữ nguyên form. **Phụ thuộc** LONG-01, LONG-03, DAO-01, DAO-05.
- [ ] **LONG-06 · Long · Kiểm UI sau khi ghép thật.** Thử tạo, mở nguồn và mở lại khóa bằng bàn phím và trên điện thoại. **Bàn giao khi** Ca thường và lỗi đều tới đúng màn; focus và nội dung đọc được. **Phụ thuộc** LONG-02, LONG-04, LONG-05, DAO-02.
- [ ] **DAO-04 · Đạo · Hiện thực hai API đọc.** Tạo GET danh sách và GET chi tiết khóa. **Bàn giao khi** Kiểm danh sách rỗng, mở đúng ID và 404 cho ID sai. **Phụ thuộc** DAO-03.
- [ ] **DAO-02 · Đạo · Ghép workflow thật vào POST.** Nối pipeline của An và lưu kết quả thành công. **Bàn giao khi** Ca nguồn thật có 201 và được lưu; ca dừng trả 422 và không tạo khóa. **Phụ thuộc** DAO-01, DAO-03, AN-02.
- [ ] **AN-05 · An · Chuẩn hóa nguồn và ID.** Giữ nguồn phù hợp, rút đoạn bằng chứng, gán ID ổn định. **Bàn giao khi** Từng ID có URL và đoạn bằng chứng, có ca nguồn không đủ. **Phụ thuộc** AN-01.
- [ ] **AN-02 · An · Ghép workflow thật với answer(text).** Nối tra nguồn, soạn theo trình độ và xử lý nhánh dừng. **Bàn giao khi** Một ca thật có bài và một ca thiếu nguồn dừng đúng qua answer(text). **Phụ thuộc** AN-04, AN-05, AN-06.
- [ ] **AN-07 · An · Chạy eval thử với model thật.** Chạy python run.py eval --try và bàn giao trace cho Bảo. **Bàn giao khi** Có usage thật, nguồn web và không lỗi kỹ thuật trong lượt thử. **Phụ thuộc** AN-02.

## CP3 · Đóng gói và nộp trước 10:00 ngày 28/11

- [ ] **AN-08 · An · Chạy toàn bộ eval lượt 1.** Sau eval --try, chạy bộ CP3 đủ 20–30 ca và bàn giao CSV, trace, run ID. **Bàn giao khi** Có một lượt thật được đánh số, giữ cả các ca trượt. **Phụ thuộc** AN-07, BAO-05.
- [ ] **LONG-07 · Long · Quay video CP3 30 giây.** Quay thao tác thật và phản hồi từ AI thật. Có thể dùng CLI nếu web chưa ghép. **Bàn giao khi** Video mở ẩn danh được và giữ đúng chế độ hiển thị yêu cầu. **Phụ thuộc** AN-07. Đây là video minh chứng CP3.
- [ ] **DAO-07 · Đạo · Thử khung mô phỏng 10 phiên.** Nhập cấu hình persona thử, gọi workflow thật và kiểm dữ liệu đầu ra. **Bàn giao khi** Có đầu ra mô phỏng thử, xác định được lỗi kỹ thuật nếu có. **Phụ thuộc** AN-02.
- [ ] **BAO-07 · Bảo · Rà và nộp form CP3.** Tập hợp bằng chứng, 20–30 ca, lượt 1 x/N + run ID, spec §0–§7 và video 30 giây. **Bàn giao khi** Nộp Form 2 nhánh CP3 trước 10:00 ngày 28/11 và ghi phần còn thiếu trung thực. **Phụ thuộc** BAO-04, BAO-05, BAO-06, LONG-07. Web hoàn chỉnh là mục tiêu demo. Video CP3 có thể quay luồng CLI thật.

## CP4 · Video bài học sau mốc ghép thật

- [ ] **AN-03 · An · Video tóm tắt bài 1.** Tạo clip ngắn từ bài đã sinh; phối hợp Long để phát ở trang bài. **Bàn giao khi** Video giữ đúng nội dung bài và ví dụ. **Phụ thuộc** BAO-03.

## Mốc bàn giao

- [ ] **Ghép mock:** LONG-02 nối được DAO-01 và DAO-05. Kiểm một ca thành công và một ca thiếu nguồn.
- [ ] **Ghép thật:** AN-02, DAO-02, DAO-04 và LONG-06 đi được từ form đến nguồn và mở lại khóa.
- [ ] **Nghiệm thu:** BAO-06 ghi kết quả eval, BAO-03 ghi kết quả demo web. Sau mốc này mới quyết định video.

## CP4 · Đánh giá, chi phí, slide và nộp trước 14:30 ngày 28/11

- [ ] **BAO-08 · Bảo · Chọn lỗi ưu tiên từ lượt 1.** Xem ca thất bại và trace, chốt một lỗi ảnh hưởng nhất để An sửa. **Bàn giao khi** Ghi ID ca lỗi, nguyên nhân và thay đổi dự kiến. **Phụ thuộc** BAO-06.
- [ ] **AN-09 · An · Sửa lỗi chính và ghi cấu hình.** Cải thiện prompt hoặc truy xuất theo lỗi đã chốt. **Bàn giao khi** Có thay đổi đo được và mô tả cấu hình cho lượt 2. **Phụ thuộc** BAO-08.
- [ ] **AN-10 · An · Chạy eval lượt 2.** Chạy lại trên đúng tập câu của lượt 1, giữ kết quả và trace gốc. **Bàn giao khi** Có run ID lượt 2 và dữ liệu đầy đủ để chấm. **Phụ thuộc** AN-09.
- [ ] **BAO-09 · Bảo · Chấm và so sánh hai lượt eval.** Điền pass theo metric đã chốt, lập bảng thay đổi và phân tích lỗi còn lại. **Bàn giao khi** eval/report.md có x/N, model và run ID của hai lượt. **Phụ thuộc** AN-10.
- [ ] **DAO-08 · Đạo · Chốt personas và giá model.** Điền tần suất ba persona, hai mức model và nguồn giá. Ghi rõ số tự ước tính. **Bàn giao khi** cost/personas.yaml đủ đầu vào và có nguồn, chạy được khung. **Phụ thuộc** DAO-07. Có thể chuẩn bị số liệu và nguồn giá trước lượt 2.
- [ ] **DAO-09 · Đạo · Chạy mô phỏng chi phí thật.** Chạy ≥50 phiên theo persona; dùng tỉ lệ đạt của lượt 2 đã chấm. **Bàn giao khi** Có simulate-N.csv và bản tóm tắt, truy được nguồn chi phí. **Phụ thuộc** DAO-08, BAO-09.
- [ ] **DAO-10 · Đạo · Viết báo cáo chi phí.** Tổng hợp chi phí mỗi task thành công và kịch bản tháng thấp, cơ sở, cao cho hai mức model. **Bàn giao khi** Có số cơ sở kèm model để nộp, nhận xét so với impact. **Phụ thuộc** DAO-09, BAO-04.
- [ ] **LONG-08 · Long · Dựng slide demo PDF.** Dựng khung pain, lát cắt, demo và eval. Điền số lượt 2 và chi phí sau. **Bàn giao khi** demo-slides.pdf ở gốc repo, nội dung khớp số đã chấm. **Phụ thuộc** BAO-09, DAO-10 khi chốt số. Khung slide có thể làm trước.
- [ ] **LONG-09 · Long · Quay video demo dự phòng.** Quay luồng tạo bài, mở nguồn và tình huống lỗi. Lưu link để chiếu khi mạng lỗi. **Bàn giao khi** Kiểm video mở được bằng cửa sổ ẩn danh. **Phụ thuộc** BAO-03. Khác video minh chứng 30 giây của CP3.
- [ ] **BAO-11 · Bảo · Tập demo và chia vai thuyết trình.** Phân một phần nói cho mỗi người, thử ca lạ và diễn tập chuyển video khi mạng lỗi. **Bàn giao khi** Cả bốn biết phần nói, ca demo và cách khôi phục. **Phụ thuộc** BAO-03, LONG-08, LONG-09.
- [ ] **BAO-10 · Bảo · Rà 7 hạng mục và nộp CP4.** Rà spec §0–§10, repo, phòng demo, hai lượt eval, chi phí cơ sở, PDF và video dự phòng. **Bàn giao khi** Nộp Form 2 nhánh CP4 trước 14:30 ngày 28/11, lưu xác nhận. **Phụ thuộc** BAO-09, DAO-10, LONG-08, LONG-09.

## Sau CP4 · Chốt repo trước 23:59 ngày 28/11

- [ ] **BAO-12 · Bảo · Chốt changelog và khóa repo.** Ghi góp ý và thay đổi cuối vào spec §10, kiểm đủ reflection. **Bàn giao khi** Bản cuối có nhật ký và bốn reflection trước 23:59 ngày 28/11. **Phụ thuộc** REF-BAO, REF-DAO, REF-AN, REF-LONG.
- [ ] **REF-BAO · Bảo · Viết reflection cá nhân.** Ghi vai trò, cách đã dùng AI và bài học từ một ca trượt thật. **Bàn giao khi** Có 1 file reflection mang tên mình trước 23:59 ngày 28/11. **Phụ thuộc** BAO-09 khi lấy ví dụ ca trượt.
- [ ] **REF-DAO · Đạo · Viết reflection cá nhân.** Ghi vai trò, cách đã dùng AI và bài học từ một ca trượt thật. **Bàn giao khi** Có 1 file reflection mang tên mình trước 23:59 ngày 28/11. **Phụ thuộc** BAO-09 khi lấy ví dụ ca trượt.
- [ ] **REF-AN · An · Viết reflection cá nhân.** Ghi vai trò, cách đã dùng AI và bài học từ một ca trượt thật. **Bàn giao khi** Có 1 file reflection mang tên mình trước 23:59 ngày 28/11. **Phụ thuộc** BAO-09 khi lấy ví dụ ca trượt.
- [ ] **REF-LONG · Long · Viết reflection cá nhân.** Ghi vai trò, cách đã dùng AI và bài học từ một ca trượt thật. **Bàn giao khi** Có 1 file reflection mang tên mình trước 23:59 ngày 28/11. **Phụ thuộc** BAO-09 khi lấy ví dụ ca trượt.
