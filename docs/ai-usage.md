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
| Giao diện web (`frontend/`) | Claude Code (Claude Sonnet 5.5) | Viết code LONG-01 đến LONG-05, viết và chạy kịch bản kiểm bằng Chrome ở chế độ giả (bàn phím, 360px, axe), soạn `frontend/GIAI-THICH-LONG.md` và checklist LONG-06 | Long chạy `python run.py` trên máy (dựng lại môi trường Python 3.12 thay vì sửa code của Đạo), kiểm form, trang bài, mở nguồn và thư viện trên trình duyệt; yêu cầu sửa cả 3 lỗi review PR #9 (`3b388f7`, `c2354ba`, `6076250`); đọc `frontend/GIAI-THICH-LONG.md` | Nguyễn Vũ Thành Long |
| Khung slide và kịch bản video | Claude Code (Claude Sonnet 5.5) | Dựng `slides/demo-slides.html` với ô chờ số liệu, viết `slides/video-scripts.md` | Long đối chiếu số trên slide với `evidence/summary.md` và `eval/report.md`; số nào chưa có thì để ô CHỜ, không điền tay. Bộ slide nộp cuối là bản của An (`2e2ace2`) | Nguyễn Vũ Thành Long |
| Thiết kế lại giao diện (commit `LONG: update UI`) | Claude | Dựng bố cục trang chủ, form, trang bài, danh sách khóa | Long kiểm trên trình duyệt, yêu cầu form rộng hơn để đỡ cuộn, duyệt chữ hiển thị; phát hiện câu trích PostgreSQL thiếu "(truth value)" và câu "mọi ý đều có nguồn" hứa quá, cho sửa (`ce03661`, `2e5879a`) | Nguyễn Vũ Thành Long |
| Thiết kế lại giao diện NewLearn, thêm kiểm tra nhanh, lịch sử, video (28/11, `afb04e3`, PR #15); thay bản giao diện ở các dòng trên | Claude Design (bản mẫu `docs/design/newlearn/`), Claude Opus 5.5 (đồng tác giả commit), Codex (review) | Dựng bản mẫu, đồng soạn giao diện trong `frontend/` và API mới trong `codebase/`, review code | Sửa theo review của Codex: chuyển chấm câu tự luận từ trình duyệt lên server (blocker), sửa 7 lỗi nên sửa; chạy pytest 102/102, tsc, eslint và Playwright E2E 21/21 với AI thật | Nguyễn Gia Bảo |
| Sửa lỗi gọi model của kiểm tra nhanh và video trước demo (28/11 tối, `codebase/services/learning_service.py`) | Claude Code (Claude Opus 5.5) | Đo thời gian gọi model, tái hiện qua API, thêm tự gọi lại một lần cho lỗi tạm thời và log nguyên nhân gốc, viết kịch bản Playwright chạy cả luồng | Bảo test trên giao diện và phát hiện lỗi; xác nhận không phải timeout (1,5 s và 6 s); kiểm lỗi giả lập (timeout thì gọi lại, 401 thì không), 53 test có sẵn qua, Playwright với AI thật qua toàn luồng | Nguyễn Gia Bảo |
| Slide, kiểm và sửa giao diện NewLearn, tài liệu frontend (28/11, nhánh `feat/long-08-slides`) | Claude Code (Claude Sonnet 5.5) | Điền slide từ file trong repo, xuất `demo-slides.pdf` (`b7b9a2a`); chạy install, typecheck, lint, build; kiểm Chrome tự động ở chế độ giả; sửa 6 lỗi giao diện (`2f5115c`, `bfafd82`, `ca517ff`); viết lại `GIAI-THICH-LONG.md`, checklist LONG-06, kịch bản video (`edd10eb`, `923e914`); ghi chú LONG-06 (`382be6a`); điền phần sự kiện trong khai báo này và reflection của Long | Long đọc diff trước khi merge (PR #17), tự kiểm lại bằng bàn phím (Tab, Enter, Esc) và màn 360px ở chế độ mẫu; tự viết lại reflection. Không đưa bản slide làm lại vào `main` vì nhóm đã chốt slide của An | Nguyễn Vũ Thành Long |

**Không dùng AI để:** tạo người được phỏng vấn, trích dẫn, câu trả lời khảo sát; sửa kết quả các lượt đã chạy (`eval/run-*.csv`, `cost/simulate-*.csv`, `traces/`).
