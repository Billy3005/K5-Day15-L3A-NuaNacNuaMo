# Reflection — Nguyễn Gia Bảo

> Hạn: **23:59 Thứ Bảy 28/11**. Mỗi câu 3–6 dòng.

1. **Vai trò + phần mình làm (trỏ tới file / commit):**
   Mình là đội trưởng, làm PO/PM/BA: chốt lát cắt và chuẩn "đạt" trong `spec.md`, thu 32 phiếu khảo sát (28 phiếu dùng được) trong `evidence/` (`cf5c1e0`), bàn giao wireframe, OpenAPI và quy ước Git cho team (`b109271`).
   - **Eval:** mở rộng bộ câu thử từ 12 lên 30 ca (PR #6), chấm lượt 1 được 21/30 (PR #11) và lượt 2 được 18/30 (`8f9af52`), chọn B07 làm lỗi ưu tiên để An sửa (BAO-08). Kết quả ở `eval/report.md`.
   - **Sau CP3, làm thay phần còn lại:** giao diện NewLearn có kiểm tra nhanh, lịch sử và video bài học (`afb04e3`, PR #15); quay video CP3 và video dự phòng; chạy mô phỏng và viết báo cáo chi phí (`45f0ab7`); viết spec §9–§10 (`f3a5975`).
   - **Trước buổi demo:** sửa lỗi gọi model của tính năng chấm câu tự luận và soạn video. Server không ghi lại nguyên nhân lỗi nên mình đã thêm ghi log và tự gọi lại khi lỗi tạm thời (`codebase/services/learning_service.py`).

2. **AI hỗ trợ mình thế nào (việc gì, công cụ gì, chỗ nào phải sửa lại output AI):**
   Mình dùng Claude Design dựng bản mẫu giao diện (`docs/design/newlearn/`), Claude Code viết code NewLearn, chấm và ghi báo cáo eval, viết báo cáo chi phí, và Codex review chéo trước khi merge. Phải sửa lại output AI ở hai chỗ:
   - **Lỗi Codex bắt được:** bản đầu của tính năng kiểm tra nhanh để trình duyệt tự báo điểm câu tự luận. Người dùng có thể gửi điểm giả. Mình chuyển hết việc chấm lên server, đáp án chỉ trả về sau khi kiểm tra từng câu, rồi sửa thêm 7 lỗi nên sửa khác.
   - **Lỗi chỉ lộ ra lúc tập demo:** code AI viết bắt mọi lỗi gọi model rồi chỉ báo câu chung "Bạn thử lại", không ghi lý do. Vì vậy dù Playwright đã qua 21/21, lúc tập mình vẫn không biết vì sao chấm câu 5 và soạn video thất bại. Mình thêm log nguyên nhân gốc và cho gọi lại một lần với lỗi tạm thời (lỗi sai key thì không gọi lại), rồi dựng lỗi giả để kiểm và chạy lại cả luồng bằng Playwright trên server thật.

   Bài học: test xanh chỉ chứng minh đường đi thành công. Đường đi lỗi phải in ra được lý do thì mới sửa kịp khi demo.

3. **Một câu thử trượt của nhóm và mình học được gì từ nó:**
   **B07** ("Tôi muốn học về dữ liệu") là ca chính mình chọn để sửa ở BAO-08.
   - **Lượt 1:** hệ thống tìm web rồi tự chọn "phân tích dữ liệu" và sinh cả lộ trình, thay vì hỏi lại người học muốn gì.
   - **Sau khi sửa:** An thêm bước kiểm độ rõ trước khi tìm web. B07 đúng ở lượt 2 (hỏi lại, không tìm web), nhưng tổng điểm lại giảm từ 21/30 xuống 18/30. B16 bị hỏi lại nhầm, còn 9 ca đổi điểm do nguồn web thay đổi giữa hai lượt chạy.
   - **Mình chọn sai lỗi để ưu tiên:** nhóm lỗi lớn nhất là bài đầu thiếu thành phần tiêu chí đòi (10 ca ở lượt 2), còn B07 chỉ là 1 ca. Sửa B07 không thể kéo tổng lên ngưỡng 24/30.
   - **Bài học:** lần sau mình chọn lỗi ưu tiên theo số ca bị ảnh hưởng và mức tác động lên chuẩn "đạt", không theo ca dễ thấy nhất. Mình cũng sẽ cố định nguồn tìm web hoặc chạy nhiều lần trước khi so hai lượt.
