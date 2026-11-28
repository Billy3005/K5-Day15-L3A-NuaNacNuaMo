# Kịch bản video theo giao diện NewLearn (LONG-09, kèm LONG-07)

**Làm gì:** hướng dẫn quay video demo dự phòng (LONG-09), và giữ cách quay lại video 30 giây nếu cần.
**Vì sao:** mạng hoặc API lỗi lúc demo thì vẫn chiếu được luồng thật; giao diện mới đã đổi nút, nhãn và màn hình.

| Video | Task | Trạng thái | Dài | Mục đích |
|---|---|---|---|---|
| Minh chứng CP3 | LONG-07 | **Đã xong**: Bảo quay bằng Playwright trên web NewLearn ([YouTube Unlisted](https://www.youtube.com/watch?v=YTfR9vNSh1s)) | 34,6 giây | Thao tác thật, AI thật |
| Dự phòng | LONG-09 | Chưa quay | 1,5–3 phút | Chiếu khi mạng lỗi lúc demo |

## Chuẩn bị

1. Xin An key model và key tìm kiếm qua tin nhắn riêng.
2. Tạo `.env` (lệnh dưới không ghi đè file đã có), điền theo `.env.example`: `MODEL_PROVIDER=openai`, `MODEL_NAME`, `API_KEY`, `SEARCH_PROVIDER=anthropic`, `SEARCH_API_KEY`.
3. Cần Python 3.12 trong `.venv`. Build bản gọi AI thật.
4. Tắt server cũ ở cổng 8000, rồi chạy với DB riêng để màn hình không có khóa thử cũ.

```bash
cp -n .env.example .env
[ -d .venv ] || /opt/homebrew/bin/python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd frontend && npm ci && NEXT_PUBLIC_USE_FIXTURE=0 npm run build && cd ..
lsof -nP -iTCP:8000 -sTCP:LISTEN
COURSE_DB_PATH=data/demo.db python run.py
```

**Trước khi quay:** mở "Cài đặt", phải thấy "Chế độ tạo khóa: AI thật, tìm nguồn trên web". Quên `NEXT_PUBLIC_USE_FIXTURE=0` thì web chỉ trả bài SQL mẫu.

Tạo khóa, kiểm tra nhanh và video bằng AI thật đều tốn tiền. Thử một lần trước khi quay, không bấm liên tục.

## LONG-09 · Video dự phòng (1,5–3 phút)

| Thời gian | Thao tác | Cần thấy trên hình | Lời dẫn gợi ý (nói theo cách của bạn) |
|---|---|---|---|
| 0:00–0:15 | Trang "Tổng quan" | Ô "Hôm nay bạn muốn học gì?" | Sinh viên tự học một kỹ năng để làm bài, dự án |
| 0:15–0:35 | Bấm "Dùng ví dụ SQL", rồi "Tạo lộ trình" | 5 trường đã điền: Sinh viên · SQL · mục tiêu · trình độ · 20 phút | Người học cho biết mục tiêu, trình độ, thời lượng |
| 0:35–0:50 | Chờ (được cắt ngắn) | "Đang soạn lộ trình cho bạn" | Hệ thống tìm nguồn rồi soạn bài. **Đừng nói 4 bước là tiến độ thật** |
| 0:50–1:10 | Tab "Bài học", cuộn chậm | Nhãn "Bài soạn: model AI", "Nguồn: tìm trên web"; mục tiêu, giải thích, ví dụ, bài tập | Bài đầu vừa thời lượng |
| 1:10–1:35 | Bấm `S1`, rồi "Mở trang gốc"; quay lại, nhấn Esc | Đoạn đối chiếu, chữ tô vàng, trang gốc thật | Đoạn giải thích có nguồn để người học tự đối chiếu |
| 1:35–1:45 | Tab "Lộ trình" | 5 ngày; chỉ ngày 1 có "Mở bài" | Ngày 2–5 mới có mục tiêu |
| 1:45–2:00 | F5, vào "Khóa học", bấm thẻ khóa | Mở lại đúng khóa | Khóa được lưu |
| 2:00–2:30 | "Tạo lộ trình", điền đủ form, mục tiêu: "học phương pháp Lam-7 trong giáo trình nội bộ chưa phát hành" | Hộp "Chưa đủ nguồn để soạn bài", form còn nguyên | Thiếu căn cứ thì dừng, không bịa |
| 2:30–2:45 | Kết | Màn hình vừa dừng | Một câu kết, nói đúng: lượt eval 2 đạt 18/30, chưa đạt chuẩn |

Còn thời gian (tối đa 3 phút) thì thêm trước phần kết: một câu ở tab "Kiểm tra" và vài giây phát video tóm tắt đã dựng sẵn. Dựng sẵn trước khi quay để không phải chờ.

Chỉ quay được chế độ giả thì giữ nguyên nhãn "Dữ liệu mẫu" trên màn hình và nói rõ. Ca lỗi chỉ xuất hiện với bản build `NEXT_PUBLIC_USE_FIXTURE=0`.

## LONG-07 · Quay lại video 30 giây (chỉ khi Bảo yêu cầu)

| Giây | Thao tác | Cần thấy trên hình |
|---|---|---|
| 0–4 | Trang "Tạo lộ trình", bấm "Dùng ví dụ SQL" | 5 trường đã điền |
| 4–6 | Bấm "Tạo lộ trình" | "Đang soạn lộ trình cho bạn" |
| 6–22 | Chờ | Giữ nguyên màn hình |
| 22–26 | Đầu trang bài học | Nhãn "Bài soạn: model AI", "Nguồn: tìm trên web" |
| 26–30 | Bấm `S1` | Đoạn đối chiếu, "Mở trang gốc" |

Màn chờ ghi "Thường mất khoảng 20 giây"; lâu hơn làm video quá 30 giây thì hỏi Bảo có được cắt đoạn chờ không.

Cần thấy model và số token thì quay dòng lệnh (`python codebase/app.py --cli`) với câu:

```text
Tôi là sinh viên. Chủ đề muốn học: SQL. Mục tiêu: Phân tích doanh thu cho bài tập nhóm. Trình độ hiện tại: Biết Excel, mới học SQL. Thời gian học: 20 phút mỗi ngày.
```

Hình phải có `"mode": "model"`, `"source_mode": "web"`, URL thật và dòng token lớn hơn 0. Thấy `model: fake` hoặc `"mode": "mock"` thì `.env` chưa đúng, đừng nộp.

## Trước khi quay và nộp

- [ ] Cửa sổ rộng từ 1440px để bài học hiện đủ mục lục, bài và nguồn mà cột bài không bị hẹp
- [ ] Đọc lại bài sẽ lên hình, không để câu sai (báo cáo eval ghi bài B01 từng khẳng định `FROM` luôn bắt buộc)
- [ ] Không mở `.env`, không để key trong terminal đang quay (kể cả lịch sử lệnh)
- [ ] Đóng tab, thông báo và ứng dụng riêng tư; bật chế độ Không làm phiền
- [ ] Quay bằng `Cmd + Shift + 5`, chỉ chọn cửa sổ cần quay
- [ ] Xem lại: chữ đọc được, không lộ gì
- [ ] Tải lên, đặt "ai có link cũng xem được", mở thử bằng cửa sổ ẩn danh
- [ ] Gửi link cho Bảo để ghi vào dòng "video dự phòng" trong `README.md` và trang 4 của slide
