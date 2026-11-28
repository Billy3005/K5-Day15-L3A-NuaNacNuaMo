# Reflection — Phan Bá An

> Hạn: **23:59 Thứ Bảy 28/11**. Mỗi câu 3–6 dòng.

1. **Vai trò + phần mình làm (trỏ tới file / commit):**
   Mình phụ trách workflow AI: tìm nguồn web, soạn lộ trình và bài đầu có trích dẫn, rồi chạy hai lượt eval. Mình nối model `gpt-5.4-nano` và tìm kiếm Claude `web_search` (`codebase/ai.py`, `codebase/tools.py`, PR #2), chuẩn hóa nguồn và gán ID S1…Sn (`codebase/sources.py`, PR #3), viết schema JSON và bộ kiểm trích dẫn (`codebase/lesson_schema.py`, PR #4), rồi ghép `answer()` với backend của Đạo (`codebase/agent.py`, PR #5). Mình chạy lượt 1 `run-1@20261127-212542` (PR #10). Sau đó mình thêm bước hỏi lại trước khi tìm web cho ca B07 (PR #12) và chạy lượt 2 `run-2@20261127-234148` (PR #13). Test và lệnh thử thật nằm ở `codebase/test_*.py` và `codebase/smoke_an.py`.

2. **AI hỗ trợ mình thế nào (việc gì, công cụ gì, chỗ nào phải sửa lại output AI):**
   Mình dùng Claude Code trong VS Code để viết code, test, chạy eval và soạn mô tả PR. Mình tự chọn nhà cung cấp và đổi model tìm kiếm từ Opus sang Haiku. Mình cũng giữ nguyên tắc không chỉnh prompt theo câu trong bộ câu thử. Phần lớn lỗi trong output AI chỉ lộ ra khi chạy API thật hoặc khi Bảo review:
   - Model thật trả `lesson` dạng danh sách, nên phải chuyển sang structured outputs và thêm bộ kiểm.
   - Lỗi dịch vụ tìm kiếm bị báo nhầm thành "thiếu nguồn".
   - Số phút bị đọc nhầm từ câu mục tiêu ("tóm tắt trong 5 phút").
   - `source_ids=[[]]` làm crash bộ kiểm.
   - Bản đầu của bước hỏi lại bỏ qua thứ tự ưu tiên các trạng thái dừng.

   Mỗi lần sửa, mình thêm test cho đúng trường hợp đó và chạy lại trên môi trường sạch không có key.

3. **Một câu thử trượt của nhóm và mình học được gì từ nó:**
   **B16** là ca trượt do chính thay đổi của mình gây ra.
   - **Ca thử:** học sinh THPT hỏi vì sao xác suất xúc xắc thứ nhất ra 2 và xúc xắc thứ hai ra 5 tính được bằng phép nhân.
   - **Kết quả:** lượt 1 ra bài và đạt. Ở lượt 2, bước hỏi lại mình thêm cho B07 lại hỏi ngược "Em muốn học phần nào của xác suất…" và không sinh bài, dù câu hỏi đã rất cụ thể.
   - **Vì sao lọt:** trước khi merge, mình chỉ thử bước này trên 20 câu tự soạn và đúng 20/20. Bộ câu đó không có loại câu hỏi cụ thể về một khái niệm nằm trong lĩnh vực rộng.
   - **Kết quả đo:** tổng điểm giảm từ 21/30 xuống 18/30. Có 9 ca đổi điểm dù trạng thái giữ nguyên, nên một lượt chạy chưa đủ để kết luận một thay đổi tốt hay xấu.
   - **Bài học:** sửa một ca bằng một bước chặn mới thì phải thử cả loại câu dễ bị chặn nhầm. Muốn so hai lượt công bằng, cần giữ nguồn ổn định hoặc chạy nhiều lần.
