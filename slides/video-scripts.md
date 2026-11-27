# Kịch bản video (LONG-07 và LONG-09)

Long tự quay. Hai video khác nhau:

| Video | Task | Dài | Mục đích |
|---|---|---|---|
| Minh chứng CP3 | LONG-07 | 30 giây | Thao tác thật, phản hồi từ **AI thật** |
| Dự phòng | LONG-09 | 1,5–3 phút | Chiếu khi mạng lỗi lúc demo |

## Chuẩn bị chung

1. Xin An key model và key tìm kiếm qua tin nhắn riêng.
2. Tạo `.env` (lệnh dưới không ghi đè file đã có), rồi điền theo `.env.example`: `MODEL_PROVIDER=openai`, `MODEL_NAME`, `API_KEY`, `SEARCH_PROVIDER=anthropic`, `SEARCH_API_KEY`.
3. Tạo môi trường Python 3.12 nếu chưa có. Python 3.9 sẽ lỗi khi nạp backend.

```bash
cp -n .env.example .env
/opt/homebrew/bin/python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Mỗi lần tạo khóa bằng AI thật đều tốn tiền. Thử một lần trước khi quay, không bấm liên tục.

## LONG-07 · Phương án A: quay web (ưu tiên)

Build bản gọi workflow thật. **Quên `NEXT_PUBLIC_USE_FIXTURE=0` thì web chỉ trả bài mẫu.**

```bash
cd frontend
npm ci
NEXT_PUBLIC_USE_FIXTURE=0 npm run build
cd ..
python run.py
```

Mở http://127.0.0.1:8000.

Trước khi quay, form **không** có ghi chú "Chế độ dữ liệu mẫu". Sau khi tạo, trang bài **không** có nhãn "Bản thử dữ liệu mẫu" và hiện "Bài soạn: model AI · Nguồn: tìm trên web".

| Giây | Thao tác | Cần thấy trên hình |
|---|---|---|
| 0–4 | Bấm "Dùng ví dụ SQL" | Câu nhập: Sinh viên · SQL · Phân tích doanh thu cho bài tập nhóm · Biết Excel, mới học SQL · 20 phút |
| 4–6 | Bấm "Tạo lộ trình" | Nút "Đang tạo…" và dòng đang tìm nguồn |
| 6–22 | Chờ | Giữ nguyên màn hình |
| 22–26 | Cuộn qua lộ trình và bài 1 | "Bài soạn: model AI · Nguồn: tìm trên web" |
| 26–30 | Bấm một mã `[S1]` | Đoạn đối chiếu và URL thật |

Mô tả PR #5 ghi một ca thật mất khoảng 16 giây. Nếu lâu hơn làm video quá 30 giây, hỏi Bảo xem có được cắt đoạn chờ không.

Web không hiện số token. Nếu Bảo yêu cầu thấy model và token thì dùng phương án B.

## LONG-07 · Phương án B: quay dòng lệnh

Dùng khi web chưa chạy được với AI thật. `python run.py` mở web, còn dòng lệnh là:

```bash
source .venv/bin/activate
python codebase/app.py --cli
```

Dán câu nhập:

```text
Tôi là sinh viên. Chủ đề muốn học: SQL. Mục tiêu: Phân tích doanh thu cho bài tập nhóm. Trình độ hiện tại: Biết Excel, mới học SQL. Thời gian học: 20 phút mỗi ngày.
```

Cần thấy trên hình:

- Câu nhập
- Phần `sources` có URL thật
- `"mode": "model"` và `"source_mode": "web"`
- Dòng cuối `(model: … · gọi model … lần · … token vào … / ra …)` với token lớn hơn 0

Nếu thấy `model: fake` hoặc `"mode": "mock"` thì `.env` chưa đúng, **đừng nộp** video đó. Thoát bằng Ctrl+C.

## Trước khi quay và nộp

- [ ] Không mở `.env`, không để key trong terminal đang quay (kể cả lịch sử lệnh)
- [ ] Đóng tab, thông báo và ứng dụng riêng tư; bật chế độ Không làm phiền
- [ ] Quay bằng `Cmd + Shift + 5`, chỉ chọn vùng cửa sổ cần quay
- [ ] Xem lại video: chữ đọc được, không lộ gì
- [ ] Tải lên, đặt "ai có link cũng xem được"
- [ ] Mở link bằng cửa sổ ẩn danh
- [ ] Gửi link cho Bảo

## LONG-09 · Video dự phòng (1,5–3 phút)

Dùng bản build `NEXT_PUBLIC_USE_FIXTURE=0` để các ca lỗi là phản hồi thật từ backend (chế độ fixture không bao giờ báo lỗi). Nên quay với AI thật. Nếu quay chế độ giả thì giữ nguyên nhãn mẫu trên màn hình và nói rõ.

| Thời gian | Cảnh | Lời dẫn gợi ý (nói theo cách của bạn) |
|---|---|---|
| 0:00–0:15 | Trang chủ | Ai dùng, để làm gì |
| 0:15–0:35 | "Dùng ví dụ SQL", bấm tạo | Năm thông tin người học nhập |
| 0:35–0:55 | Chờ (được cắt ngắn) | Hệ thống tìm nguồn rồi soạn bài |
| 0:55–1:20 | Lộ trình 5 ngày, bài 1 | Chỉ bài 1 có nội dung đầy đủ |
| 1:20–1:45 | Bấm `[S1]`, bấm "Mở nguồn" | Người học tự đối chiếu |
| 1:45–2:05 | F5, vào "Khóa đã lưu", mở lại | Khóa được lưu |
| 2:05–2:35 | Mục tiêu: "học phương pháp Lam-7 trong giáo trình nội bộ chưa phát hành" | Thiếu nguồn thì báo, form còn nguyên |
| 2:35–2:45 | Kết | Một câu kết luận |

Lưu link vào `README.md` (dòng "link video") hoặc chỗ nhóm thống nhất, và kiểm bằng cửa sổ ẩn danh.
