# Reflection — Nguyễn Vũ Thành Long


1. Vai trò + phần mình làm (trỏ tới file / commit):

   Vai trò: Frontend (theo `TEAMS.md`): chọn stack, form, trang bài và trích dẫn, danh sách khóa (`frontend/`), slide và kịch bản video (`slides/`).
   - Bản giao diện đầu, cùng Claude Code (PR #9): `1f1de73`, `73d3058`, `df66a25`, `09a5ae4`, `be0fb49` (LONG-01 đến 05); sửa giao diện `812dcc8`, `ce03661`, `2e5879a`, `1165a61`; sửa theo review `3b388f7`, `c2354ba`, `6076250`.
   - Slide, video, checklist, tài liệu (PR #9): `88a017b`, `92cf6a8`, `c014b42`, `aade001`, `dc760fa`, `9c2998e`, `dbfdd20`, `5a31dbf`, `7c1d5ce`.
   - 28/11 Bảo thiết kế lại toàn bộ giao diện, thêm kiểm tra nhanh, lịch sử, video (`afb04e3`, PR #15), thêm link video CP3 (`5088a80`), quay video dự phòng LONG-09 và giao LONG-08 cho An (`f3a5975`, trên `main`); từ bản đầu còn giữ nguyên `lib/validation.ts`, `lib/config.ts`.
   - 28/11 Claude Code làm theo yêu cầu của mình (`feat/long-08-slides`): slide và `demo-slides.pdf` `b7b9a2a`; sửa 6 lỗi giao diện `2f5115c`, `bfafd82`, `ca517ff`; viết lại tài liệu `edd10eb`, `923e914`; kiểm chế độ giả đạt 51/55 `382be6a`.

2. AI hỗ trợ mình thế nào (việc gì, công cụ gì, chỗ nào phải sửa lại output AI):

   Mình dùng Claude (chat và Claude Code) để lập kế hoạch, viết bộ giao diện đầu, slide và kịch bản video. Mình quyết định hướng: giao diện gọn, ít màu, đúng bảng màu wireframe của Bảo, form rộng để người dùng đỡ phải kéo xuống. Mình kiểm bằng cách chạy `python run.py` và xem trên trình duyệt; lần đầu giao diện còn xấu nên mình yêu cầu làm lại, và mình bắt sửa cả 3 lỗi trong review PR #9 (ghi đè ID khóa mẫu, đoán địa chỉ API theo cổng, ô kế hoạch bị kẹt trên màn rộng).
   Chỗ AI làm sai: câu trích tài liệu PostgreSQL trên trang chủ thiếu "(truth value)", và câu "mọi ý đều có nguồn" hứa quá so với kết quả eval. Cả hai đã sửa (`ce03661`, `2e5879a`). Máy mình dùng Python 3.9 nên `python run.py` báo lỗi kiểu `|`; mình dựng lại môi trường bằng Python 3.12 thay vì sửa file của Đạo.
   Sau khi Bảo thay giao diện bằng bản NewLearn, mình đã đọc `GIAI-THICH-LONG.md` và tự kiểm lại bằng bàn phím và màn 360px, để giải thích được phần code đang đứng tên mình.

3. Một câu thử trượt của nhóm và mình học được gì từ nó:

   Ca B16 (`eval/report.md`): người học nêu rõ 36 cặp, (2,5) và quy tắc nhân, nhưng sau thay đổi AN-09 bước kiểm lại hỏi thêm thay vì tạo bài (`ok` thành `clarification_required`). B07 ("Tôi muốn học về dữ liệu") thì đúng ra phải hỏi lại và đã được sửa; B16 là hồi quy do cùng thay đổi đó, kéo tổng từ 21/30 xuống 18/30.
   Trên giao diện, người dùng sẽ thấy hộp "cần làm rõ" dù câu hỏi đã đủ cụ thể, nên phải gõ lại mà không biết thiếu gì. Mình học được hai điều: sửa một ca có thể làm hỏng ca khác nên phải chạy lại toàn bộ, và thông báo hỏi lại phải nói rõ còn thiếu gì để người dùng không bị kẹt.
