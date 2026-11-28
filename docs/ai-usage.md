# Khai báo dùng AI

README của nhóm có mục "Dùng AI vào việc gì" (2–3 dòng, bắt buộc). Ghi chi tiết vào bảng dưới đây.

> Luật của đề: dùng AI để làm bài thoải mái, nhưng **ai không giải thích được phần có tên mình thì phần đó nhận 0 điểm**. Khai thiếu không bị trừ; giấu mới bị.

| Việc | Công cụ AI | AI làm gì | Người kiểm/sửa gì | Ai phụ trách |
|---|---|---|---|---|
| Code bản chạy thử | Coding agent (Antigravity) | Dựng khung phân tầng FastAPI + SQLite (`codebase/api/`, `services/`, `repositories/`, `schemas/`, `core/`, `models/`), viết `tests/test_courses_api.py`, cập nhật `docs/api-guide.md` và `cost/personas.yaml` | Đối chiếu 1:1 với `docs/openapi.json`, sửa `async def` sang `def`, bọc lock + `finally` quanh `tracing`, thêm SPA fallback an toàn cho `/courses/{id}` và global error handler, siết strict int/URL validation, chạy `pytest` + live server smoke test + `run.py check` + `simulate --try`, đối chiếu bảng giá chính thức | Nguyễn Quang Đạo |
| Prompt / thiết kế lời gọi mô hình | | | | |
| Đào data (viết script đếm, gợi ý nhãn) | | | Kiểm tay __ dòng, khớp __ | |
| Rà câu hỏi phỏng vấn / khảo sát | | Chỉ rà câu dẫn dắt | | |
| Viết câu thử (benchmark) | | | Mỗi câu thử có `source`; câu thử AI viết được ghi rõ | |
| Sinh data `synthetic` (nếu có) | | | Seed __ · kiểm tay __ dòng | |
| Chấm cột `pass` bằng LLM (nếu có) | | | Kiểm tra thủ công __ câu thử, khớp __/__ | |
| Slide, văn bản | | | | |
| (NHÁP) Giao diện web (`frontend/`) | Claude Code (Claude Sonnet 5.5) | Viết code LONG-01 đến LONG-05, viết và chạy kịch bản kiểm bằng Chrome ở chế độ giả (bàn phím, 360px, axe), soạn `frontend/GIAI-THICH-LONG.md` và checklist LONG-06 | [Long tự điền: file đã đọc, ca đã tự chạy lại, chỗ đã sửa] | Nguyễn Vũ Thành Long |
| (NHÁP) Khung slide và kịch bản video | Claude Code (Claude Sonnet 5.5) | Dựng `slides/demo-slides.html` với ô chờ số liệu, viết `slides/video-scripts.md` | [Long tự điền: nội dung đã đối chiếu với file nguồn, chỗ đã sửa] | Nguyễn Vũ Thành Long |
| Thiết kế lại giao diện (commit `LONG: update UI`) | Claude | Dựng bố cục trang chủ, form, trang bài, danh sách khóa | Long kiểm trên trình duyệt, chỉnh độ rộng form, duyệt chữ hiển thị. [Long tự điền: phần mình tự sửa] | Nguyễn Vũ Thành Long |
| Thiết kế lại giao diện NewLearn, thêm kiểm tra nhanh, lịch sử, video (28/11, `afb04e3`, PR #15); thay bản giao diện ở các dòng trên | Claude Design (bản mẫu `docs/design/newlearn/`), Claude Opus 5.5 (đồng tác giả commit), Codex (review) | Dựng bản mẫu, đồng soạn giao diện trong `frontend/` và API mới trong `codebase/`, review code | Theo mô tả commit: đã sửa theo review của Codex; pytest 102/102, tsc và eslint sạch, Playwright E2E 21/21 với AI thật. [Bảo xác nhận phần người đã kiểm, sửa] | Nguyễn Gia Bảo |
| (NHÁP) Slide, kiểm và sửa giao diện NewLearn, tài liệu frontend (28/11, nhánh `feat/long-08-slides`) | Claude Code (Claude Sonnet 5.5) | Điền slide từ file trong repo, xuất `demo-slides.pdf` (`b7b9a2a`); chạy install, typecheck, lint, build; kiểm Chrome tự động ở chế độ giả; sửa 6 lỗi giao diện (`2f5115c`, `bfafd82`, `ca517ff`); viết lại `GIAI-THICH-LONG.md`, checklist LONG-06, kịch bản video (`edd10eb`, `923e914`); ghi chú LONG-06 (`382be6a`); điền phần sự kiện trong khai báo này và reflection của Long | [Long tự điền: nội dung đã đối chiếu với file nguồn, ca đã tự chạy lại, chỗ đã sửa] | Nguyễn Vũ Thành Long |

**Không dùng AI để:** tạo người được phỏng vấn, trích dẫn, câu trả lời khảo sát; sửa kết quả các lượt đã chạy (`eval/run-*.csv`, `cost/simulate-*.csv`, `traces/`).
