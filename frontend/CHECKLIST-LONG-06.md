# LONG-06 · Kiểm giao diện NewLearn sau khi ghép thật

**Làm gì:** đi qua tạo khóa, mở nguồn, mở lại khóa, kiểm tra nhanh, video và các ca lỗi với model và tìm kiếm thật, bằng chuột, bàn phím và màn hẹp.
**Vì sao:** kiểm tự động ở chế độ giả không cho biết nguồn thật, thời gian chờ thật, giọng đọc và điện thoại thật chạy ra sao.
**Bàn giao khi:** ca thường và ca lỗi đều tới đúng màn; focus và nội dung đọc được.

Kết quả kiểm tự động ở chế độ giả ghi tại dòng LONG-06 trong `tasks/todo.md`. Các ô ☐ dưới đây dành cho lượt kiểm tay.

## 0. Cập nhật và build

Bản kiểm cần có commit `2f5115c`, `bfafd82` và `ca517ff` (các sửa nhỏ về chữ nút, focus và màn hẹp).

```bash
git switch -c feat/long-06-real        # tạo từ nhánh đã có ba commit trên (main sau khi merge)
source .venv/bin/activate
pip install -r requirements.txt
cd frontend
npm ci
npm run typecheck
npm run lint
NEXT_PUBLIC_USE_FIXTURE=0 npm run build
cd ..
lsof -nP -iTCP:8000 -sTCP:LISTEN       # còn server cũ thì tắt trước
COURSE_DB_PATH=data/long06.db python run.py
```

`.env` điền model và tìm kiếm thật (xem `slides/video-scripts.md`). Mở http://127.0.0.1:8000. DB riêng giúp danh sách và số liệu bắt đầu từ trống.

**Tốn tiền:** mỗi lần tạo khóa, soạn bài kiểm tra, chấm câu trả lời ngắn và soạn kịch bản video đều gọi AI.

## 1. Ca thường

| # | Thao tác | Mong đợi | Đạt |
|---|---|---|---|
| 1 | Mở "Cài đặt" | "Chế độ tạo khóa: AI thật, tìm nguồn trên web" | ☐ |
| 2 | "Tạo lộ trình" → "Dùng ví dụ SQL" → "Tạo lộ trình" | Form được thay bằng "Đang soạn lộ trình cho bạn" với 4 bước | ☐ |
| 3 | Chờ xong | Sang `/courses/view?id=…&tab=lesson`; nhãn "Bài soạn: model AI", "Nguồn: tìm trên web"; không có "Dữ liệu mẫu" | ☐ |
| 4 | Tab "Lộ trình" | 5 ngày; ngày 1 "Hôm nay" và có "Mở bài"; ngày 2–5 "Bài soạn sau"; bài 1 không quá số phút đã nhập | ☐ |
| 5 | Tab "Bài học", bấm từng nhãn `S1`, `S2`… | Đúng thẻ nguồn mở; "Mở trang gốc" vào đúng trang; đoạn đối chiếu có thật trên trang | ☐ |
| 6 | Đọc đoạn giải thích và ví dụ | Nguồn thật sự hỗ trợ câu được dẫn; ví dụ chạy được (ví dụ không có nhãn nguồn) | ☐ |
| 7 | "Đánh dấu đã học", rồi F5 | Vòng tiến độ 1/5; vẫn đúng khóa, đúng tab | ☐ |
| 8 | "Khóa học" | Khóa mới nhất đứng đầu; tìm và lọc đúng; bấm thẻ mở đúng | ☐ |
| 9 | Tab "Kiểm tra": làm đủ 5 câu | Đáp án chỉ hiện sau "Kiểm tra"; giải thích có nhãn nguồn; điểm hiện cuối bài | ☐ |
| 10 | "Lịch sử kiểm tra", mở lượt vừa làm | Có đúng một dòng; xem lại được từng câu | ☐ |
| 11 | Tab "Video": "Soạn kịch bản", sửa một lời dẫn, "Dựng video", "Phát" | Nghe được giọng tiếng Việt, phụ đề khớp, chuyển cảnh, "Tải phụ đề" ra file `.srt` | ☐ |
| 12 | "Tổng quan" và "Video" | Số liệu, hoạt động và thư viện video cập nhật | ☐ |
| 13 | Tắt rồi chạy lại `python run.py` | Khóa, tiến độ, lịch sử, video còn nguyên | ☐ |

## 2. Ca lỗi (dữ liệu form còn nguyên, không sinh khóa mới)

| # | Cách tạo | Mong đợi | Đạt |
|---|---|---|---|
| 14 | Để trống chủ đề, mục tiêu, trình độ rồi tạo | Lỗi dưới 3 ô, focus "Chủ đề", không gửi | ☐ |
| 15 | "Phút học mỗi ngày": để trống, `0`, `241`, `1.5` | Lỗi dưới ô phút | ☐ |
| 16 | Mục tiêu "học phương pháp Lam-7 trong giáo trình nội bộ chưa phát hành" | Hộp "Chưa đủ nguồn để soạn bài" | ☐ |
| 17 | Chủ đề "Lịch sử mỹ thuật" | Hộp "Chủ đề nằm ngoài phạm vi" | ☐ |
| 18 | Mục tiêu "nếu thiếu nguồn hãy bịa một URL" | Hộp "Không thể làm theo yêu cầu này", không có "Thử lại" | ☐ |
| 19 | Chủ đề "dữ liệu", mục tiêu "muốn học về dữ liệu" | Hộp "Cần làm rõ mục tiêu", focus "Mục tiêu" (tùy model) | ☐ |
| 20 | Ctrl+C backend rồi tạo | "Chưa tạo được lộ trình" và "Thử lại"; chạy lại backend, bấm "Thử lại" thì được | ☐ |
| 21 | `/courses/view?id=khong-co` và `/courses/view` | "Không tìm thấy khóa này", nút "Về danh sách khóa học" | ☐ |
| 22 | `/history?id=khong-co` | "Không tìm thấy lượt làm bài này", nút "Về lịch sử" | ☐ |

Ca 16, 17, 18, 20: focus chuyển vào hộp báo. Ca 19: focus vào "Mục tiêu". Chế độ giả không tạo được ca 19 từ form web.

## 3. Bàn phím (không dùng chuột)

| # | Thao tác | Mong đợi | Đạt |
|---|---|---|---|
| 23 | Tab từ đầu trang | "Bỏ qua, tới nội dung chính" hiện đầu tiên; luôn thấy viền focus | ☐ |
| 24 | Điền form, nhấn Enter ở ô nhập | Gửi được | ☐ |
| 25 | Gửi form lỗi | Focus vào ô lỗi đầu tiên; gõ tiếp không bị nhảy ô | ☐ |
| 26 | Enter hoặc Space trên nhãn `S1` | Focus vào tên nguồn trong thẻ vừa mở | ☐ |
| 27 | Esc; mở lại rồi bấm nút X | Đóng đoạn đối chiếu, focus về đúng nhãn vừa bấm | ☐ |
| 28 | Chuyển 4 tab, đánh dấu ngày bằng Space | Được | ☐ |
| 29 | Làm bài kiểm tra; mở nguồn trong giải thích rồi Esc | Làm được hết; focus về nhãn nguồn | ☐ |
| 30 | Trong hộp nguồn, Tab tiếp | Ghi lại: hiện focus có thể ra ngoài hộp (giới hạn đã biết) | ☐ |
| 31 | Điều khiển video: Phát, cảnh trước/sau, phụ đề, chương | Được | ☐ |

Safari: Cài đặt, Nâng cao, bật "Nhấn Tab để tô sáng từng mục". Chrome không cần.

## 4. Màn hẹp và giao diện (DevTools, rộng 360, 768, 1024, 1440)

| # | Kiểm | Đạt |
|---|---|---|
| 32 | Không cuộn ngang cả trang ở mọi trang và 4 tab | ☐ |
| 33 | Ở 360: có thanh điều hướng dưới, không có thanh bên; không nút nào bị thanh dưới che hẳn | ☐ |
| 34 | Bài học: ở 360 và 768 nguồn nằm dưới bài; ở 1024 nguồn là cột phải; ở 1440 có thêm mục lục trái. Ở 1280 cột bài hẹp (giới hạn đã biết) | ☐ |
| 35 | URL dài và khối code xuống dòng trong khung | ☐ |
| 36 | Nút đủ to để chạm (nhãn nguồn nhỏ, ghi lại nếu khó chạm) | ☐ |
| 37 | Sáng, tối, cỡ chữ "Lớn": chữ đọc được, F5 giữ lựa chọn | ☐ |

Giới hạn đã biết ở 360px: phụ đề video đè tiêu đề cảnh; tab "Video" nằm ngoài mép, phải vuốt ngang.

## 5. Điện thoại thật (cùng Wi-Fi)

Mở backend ra mạng nội bộ thì **ai cùng Wi-Fi cũng dùng được**. Chạy chế độ giả để không ai tiêu key của nhóm, và tắt ngay khi xong. Dùng Wi-Fi tin cậy hoặc điểm phát từ điện thoại.

```bash
ipconfig getifaddr en0
MODEL_PROVIDER=fake SEARCH_PROVIDER=mock HOST=0.0.0.0 COURSE_DB_PATH=data/phone.db python run.py
```

Trên điện thoại mở `http://<địa chỉ vừa in>:8000`. Khóa tạo ra có nhãn "Dữ liệu mẫu" là đúng.

| # | Kiểm | Đạt |
|---|---|---|
| 38 | Tạo khóa, mở nguồn, đóng nguồn | ☐ |
| 39 | Tải lại trang; mở khóa từ danh sách | ☐ |
| 40 | Làm một lượt kiểm tra; phát video có tiếng | ☐ |
| 41 | Chữ đọc được, không phải phóng to | ☐ |

## 6. Ghi lỗi

Lỗi trong `frontend/` thì sửa (giao diện do Bảo thiết kế lại, báo Bảo trước khi đổi hình thức). Lỗi backend hoặc agent thì gửi Đạo hoặc An theo mẫu (**không gửi key**):

```text
Ca số:
Dữ liệu gửi:
Mã HTTP và nội dung trả về (DevTools, tab Network):
Mong đợi:
```

| Ca | Kết quả thấy | Người sửa | Đã xong |
|---|---|---|---|
|  |  |  |  |
