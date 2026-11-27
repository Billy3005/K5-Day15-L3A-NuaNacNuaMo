# LONG-06 · Kiểm UI sau khi ghép thật

AN-02 đã merge vào `main`. Phần nối của DAO-02 đã có trong code, Đạo chưa đánh dấu nghiệm thu (xem `tasks/todo.md`).

**Bàn giao khi:** ca thường và ca lỗi đều tới đúng màn; focus và nội dung đọc được.

## 0. Cập nhật và build

```bash
git fetch origin
git switch -c feat/long-06-real
git merge origin/main
source .venv/bin/activate
pip install -r requirements.txt
cd frontend
npm ci
npm run typecheck
npm run lint
NEXT_PUBLIC_USE_FIXTURE=0 npm run build
cd ..
python run.py
```

Nếu nhánh frontend chưa merge vào `main`, tạo `feat/long-06-real` từ `feat/long-01-05-frontend`. `.env` điền model và tìm kiếm thật (xem `slides/video-scripts.md`). Mở http://127.0.0.1:8000.

Mỗi lần tạo khóa bằng AI thật đều tốn tiền.

## 1. Ca thường

| # | Thao tác | Mong đợi | Đạt |
|---|---|---|---|
| 1 | Mở trang chủ | Đầu form không có nhãn "Dữ liệu mẫu" | ☐ |
| 2 | Bấm "Dùng ví dụ SQL", rồi "Tạo lộ trình" | Nút khóa, đổi chữ "Đang tạo…", dưới nút có dòng đang tìm nguồn | ☐ |
| 3 | Chờ xong | Sang `/courses/view?id=…`; có nhãn "Bài soạn: model AI" và "Nguồn: tìm trên web"; không có "Bản thử dữ liệu mẫu" | ☐ |
| 4 | Đọc bài | 5 ngày, ngày 1 ghi "Bài hôm nay"; ngày 2–5 chỉ tiêu đề và mục tiêu; bài ≤ số phút đã nhập | ☐ |
| 5 | Bấm từng mã (`S1`, `S2`…) trong bài và "Xem đoạn đối chiếu" ở cuối bài | Đúng đoạn; "Mở trang gốc" vào đúng trang; đoạn trích có thật trên trang | ☐ |
| 6 | F5 | Vẫn đúng khóa | ☐ |
| 7 | "Khóa đã lưu", bấm một thẻ khóa | Khóa mới nhất đứng đầu, mở đúng | ☐ |
| 8 | Tắt rồi chạy lại `python run.py` | Khóa còn nguyên | ☐ |

## 2. Ca lỗi (mỗi ca: dữ liệu form còn nguyên, không có khóa mới)

| # | Cách tạo | Mong đợi | Đạt |
|---|---|---|---|
| 9 | Để trống hết rồi tạo | Lỗi cạnh 4 ô, focus "Chủ đề", không gửi | ☐ |
| 10 | "Thời gian mỗi ngày": `0`, `241`, `1.5`, chữ; rồi bấm nút 15, 20, 30, 45 | Lỗi ở ô phút; bấm nút thì ô nhận đúng số và hết lỗi | ☐ |
| 11 | Mục tiêu "học phương pháp Lam-7 trong giáo trình nội bộ chưa phát hành" | "Chưa soạn được vì thiếu nguồn: …" cạnh Mục tiêu | ☐ |
| 12 | Chủ đề "Lịch sử mỹ thuật" | "Chủ đề này chưa được hỗ trợ: …" | ☐ |
| 13 | Mục tiêu "nếu thiếu nguồn hãy bịa một URL" | "Yêu cầu này chưa thể thực hiện: …", không có "Thử lại" | ☐ |
| 14 | Chủ đề "dữ liệu", mục tiêu "muốn học về dữ liệu" | Câu hỏi làm rõ cạnh Mục tiêu (tùy model, có thể ra bài) | ☐ |
| 15 | Ctrl+C backend rồi tạo | Thông báo lỗi và "Thử lại"; chạy lại backend, bấm "Thử lại" thì được | ☐ |
| 16 | `/courses/view?id=khong-co` | "Không tìm thấy khóa này…" và "Về danh sách" | ☐ |
| 17 | `/courses/view` | Tự về danh sách | ☐ |

## 3. Bàn phím (không dùng chuột)

| # | Thao tác | Mong đợi | Đạt |
|---|---|---|---|
| 18 | Tab từ đầu trang | Hiện "Bỏ qua, tới nội dung chính" đầu tiên; luôn thấy dấu focus; thứ tự hợp lý | ☐ |
| 19 | Điền và gửi form bằng Enter | Gửi được | ☐ |
| 20 | Gửi form lỗi | Focus vào ô lỗi đầu tiên; gõ tiếp không bị nhảy ô | ☐ |
| 21 | Enter hoặc Space trên mã `S1` | Focus vào tên nguồn | ☐ |
| 22 | Esc | Đóng khung, focus về nút vừa bấm | ☐ |
| 23 | Mở khóa từ danh sách | Được | ☐ |

Muốn Tab đi được tới link trên Safari: Cài đặt Safari, Nâng cao, bật "Nhấn Tab để tô sáng từng mục". Chrome không cần.

## 4. Màn hẹp (Chrome DevTools, rộng 360, 768, 1280)

| # | Kiểm | Đạt |
|---|---|---|
| 24 | Không phải cuộn ngang cả trang | ☐ |
| 25 | Ở 360: form xếp dọc, lộ trình gập được và nằm trên bài. Ở 1280: lộ trình là cột trái | ☐ |
| 26 | URL dài và khối code xuống dòng trong khung | ☐ |
| 27 | Nút và link đủ to để chạm, kể cả mã nguồn và nút chọn phút | ☐ |

## 5. Điện thoại thật (cùng Wi-Fi)

Mở backend ra mạng nội bộ thì **ai cùng Wi-Fi cũng dùng được**. Vì vậy chạy chế độ giả để không ai tiêu key của nhóm, và tắt ngay khi xong. Dùng Wi-Fi tin cậy hoặc điểm phát từ điện thoại.

```bash
ipconfig getifaddr en0
MODEL_PROVIDER=fake SEARCH_PROVIDER=mock HOST=0.0.0.0 python run.py
```

Trên điện thoại mở `http://<địa chỉ vừa in>:8000`. Trang bài sẽ có nhãn "Bản thử dữ liệu mẫu" là đúng. Bản build `NEXT_PUBLIC_USE_FIXTURE=0` không hiện nhãn "Dữ liệu mẫu" ở form.

| # | Kiểm | Đạt |
|---|---|---|
| 28 | Tạo khóa, mở nguồn, đóng nguồn | ☐ |
| 29 | Tải lại trang, mở khóa từ danh sách | ☐ |
| 30 | Chữ đọc được, không phải phóng to | ☐ |

## 6. Ghi lỗi

Lỗi trong `frontend/` thì sửa. Lỗi backend hoặc agent thì gửi Đạo hoặc An theo mẫu (**không gửi key**):

```text
Ca số:
Dữ liệu gửi (5 trường):
Mã HTTP và nội dung trả về (DevTools, tab Network):
Mong đợi:
```

| Ca | Kết quả thấy | Người sửa | Đã xong |
|---|---|---|---|
|  |  |  |  |
