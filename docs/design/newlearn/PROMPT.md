# Prompt cho Claude Design — thiết kế lại NewLearn

> Dán toàn bộ phần dưới đường kẻ vào Claude Design (artifact "Design" trên claude.ai). Phần dữ liệu mẫu ở cuối là đầu ra thật của hệ thống, giữ nguyên khi dán.

---

## Vai trò và kết quả cần

Bạn là product designer. Hãy thiết kế lại giao diện web của **NewLearn**, một sản phẩm giúp người tự học có lộ trình 5 ngày và bài học đầu tiên, trong đó **mỗi ý giải thích đều gắn nguồn công khai bấm được**.

Giao diện hiện tại trông như một bản MVP: nhạt, giống trang tài liệu, bố cục khó theo dõi, nguồn trích dẫn không nổi bật, màn chờ 15–20 giây trống trải, và thiếu tính năng xung quanh. Mục tiêu là một giao diện **trông và hoạt động như sản phẩm production**: nhất quán, đủ trạng thái, đủ tính năng, đáng tin.

Kết quả sẽ được Claude Code dựng lại trong codebase Next.js có sẵn trong vài giờ, nên thiết kế phải rõ ràng, có hệ thống và dựng được ngay.

**Cần giao:**
1. **Bản mẫu tương tác bấm được** đi hết kịch bản demo ở mục 10, ở cả chế độ sáng và tối.
2. **Bảng token thiết kế:** màu (sáng và tối), cỡ chữ, độ đậm, khoảng cách, bo góc, bóng đổ, thời lượng chuyển động.
3. **Danh mục thành phần** kèm mọi trạng thái (mặc định, hover, focus, nhấn, vô hiệu, đang tải, lỗi).
4. **Toàn bộ màn hình ở mục 5–8** với các trạng thái: rỗng, đang tải, lỗi, thành công, và biến thể **"Sắp có"** (dùng khi tính năng chưa kịp chạy thật lúc demo).
5. **Danh sách chữ hiển thị** (microcopy) bằng tiếng Việt cho nút, nhãn, thông báo và trạng thái.

## 1. Người dùng và vấn đề

- **Người dùng chính:** sinh viên đang tự học một kỹ năng mới để làm bài tập hoặc dự án. Người dùng phụ: học sinh THCS, THPT và người đi làm.
- **Vấn đề có số liệu:** trong khảo sát 28 phiếu đúng đối tượng, 19/28 gặp trở ngại chính là chưa biết bắt đầu từ đâu, khó tìm hoặc chọn tài liệu, hoặc không biết nguồn nào đáng tin. Người học thường mất 16–30 phút chuẩn bị trước khi học được.
- **Lời hứa sản phẩm:** nhập mục tiêu, nhận lộ trình 5 ngày và bài hôm nay học được ngay, mỗi ý đều kiểm chứng được bằng nguồn.

## 2. Thương hiệu

- **Tên:** NewLearn. **Khẩu hiệu:** "Lộ trình tự học, mỗi ý đều có nguồn."
- **Logo:** chữ "NewLearn" kèm một biểu tượng đơn giản (gợi ý: quyển sách mở kết hợp mũi tên lộ trình). Đưa 2–3 phương án, dùng được ở 16 px (favicon) và 32 px (thanh bên).
- **Phong cách:** công cụ năng suất tối giản (tinh thần Linear hoặc Notion): nền sạch, chữ rõ, nhiều khoảng trắng, màu nhấn tiết chế. **Trích dẫn trình bày như chú thích sách học thuật**, đáng tin và nổi bật. Thêm chút động lực tiết chế (chuỗi ngày học, vòng tiến độ), không biến thành giao diện trò chơi.
- **Font:** **Be Vietnam Pro** (Google Fonts) cho tiêu đề và nội dung; **JetBrains Mono** cho khối code SQL, Git. Nội dung bài 16–18 px, tiêu đề trang 28–32 px.
- **Màu (đề xuất, tự chỉnh để đạt tương phản WCAG AA):**

| Vai trò | Sáng | Tối |
|---|---|---|
| Nền | `#F8FAFC` | `#0B1020` |
| Bề mặt (thẻ, trang đọc) | `#FFFFFF` | `#121A2E` |
| Chữ chính | `#0F172A` | `#E6EAF2` |
| Chữ phụ | `#64748B` | `#94A3B8` |
| Viền | `#E2E8F0` | `#24304A` |
| Thao tác chính (xanh chàm) | `#3A4FD0` | `#8EA2FF` |
| **Nhãn nguồn (hổ phách)** | chữ `#92400E` trên nền `#FEF3C7` | chữ `#F5C26B` trên nền `#3A2A0E` |
| Đúng, đã học | `#16804B` | `#4ADE80` |
| Lỗi | `#B4233A` | `#F87171` |

- **Giọng văn:** xưng "bạn", câu ngắn, luôn nói rõ việc tiếp theo. **Không dùng chữ kỹ thuật** trên màn hình người dùng như "sources", "JSON", "API", "status", "mock"; nói "nguồn công khai tìm được", "bài soạn bởi AI", "dữ liệu mẫu".

## 3. Khung điều hướng

- **Thanh bên trái** (rộng khoảng 240 px, thu gọn được thành biểu tượng): logo, rồi các mục **Tổng quan · Tạo lộ trình · Khóa học · Lịch sử kiểm tra · Video**, và **Cài đặt** ở đáy (chọn sáng, tối hoặc theo hệ thống).
- **Trang khóa học** có thanh tab: **Lộ trình · Bài học · Kiểm tra · Video**.
- **Điện thoại (390 px):** thanh bên chuyển thành thanh điều hướng 5 mục ở đáy màn hình; tab khóa học cuộn ngang.
- Không có màn đăng nhập hay tài khoản. Một người dùng trên một máy.

## 4. Nguyên tắc chung cho mọi màn

- Mỗi màn có đủ trạng thái rỗng, đang tải (skeleton), lỗi có nút thử lại, và thành công.
- **Nhãn chế độ luôn hiện** cạnh tiêu đề khóa học, lấy từ dữ liệu trả về: "Bài soạn: model AI" hoặc "Dữ liệu mẫu"; "Nguồn: tìm trên web" hoặc "Nguồn mẫu".
- **Nhãn nguồn** (`S1`, `S2`…) là thành phần nhận diện quan trọng thứ hai sau nút chính: dạng chip nhỏ màu hổ phách, đặt cuối câu được dẫn, bấm hoặc nhấn Enter/Space để mở đoạn đối chiếu.
- Truy cập: dùng hoàn toàn bằng bàn phím, focus luôn thấy rõ, mọi trạng thái có chữ (không chỉ dựa vào màu), tương phản AA, nội dung dài (URL, code) xuống hàng được.
- Chuyển động nhẹ 150–200 ms; tắt khi hệ điều hành bật giảm chuyển động.

## 5. Màn hình luồng chính

### 5.1 Tổng quan (màn mở đầu)
- Lời chào ngắn và **khối tạo lộ trình nhanh** nổi bật (ô mục tiêu và nút "Tạo lộ trình", liên kết "Dùng ví dụ SQL").
- Thẻ số liệu: chuỗi ngày học, phút đã học tuần này, số khóa, điểm kiểm tra gần nhất, số video đã tạo. Số lấy từ dữ liệu đã lưu trên server, không có thì hiện trạng thái rỗng thân thiện.
- "Học tiếp": khóa gần nhất, ngày đang học, nút vào bài hôm nay.
- Danh sách ngắn hoạt động gần đây (tạo khóa, hoàn thành ngày, làm kiểm tra, tạo video).

### 5.2 Tạo lộ trình
- Form 5 trường, rộng khoảng 560 px:
  - **Bạn đang là ai** (THCS, THPT, Sinh viên, Người đi làm);
  - **Chủ đề**;
  - **Mục tiêu**;
  - **Trình độ hiện tại**;
  - **Phút học mỗi ngày** (5–120).
- Nút phụ "Dùng ví dụ SQL" điền sẵn dữ liệu để người dùng chỉnh.
- Lỗi đặt cạnh trường, focus vào lỗi đầu tiên. Khóa nút khi đang gửi để tránh gửi trùng.
- **Màn chờ từng bước** (15–20 giây): danh sách bước với trạng thái đang làm hoặc xong: "Hiểu mục tiêu của bạn" → "Tìm nguồn công khai" → "Soạn lộ trình 5 ngày" → "Kiểm tra trích dẫn". Bước chạy theo thời gian chờ, không cần server báo từng bước. Có thanh tiến độ và câu "Thường mất khoảng 20 giây".
- Kết quả dừng, giữ nguyên form và hiện thông điệp từ server ở khối thông báo phía trên form:

| Mã trả về | Cách hiển thị |
|---|---|
| `CLARIFICATION_REQUIRED` | Câu hỏi làm rõ từ server, focus vào trường Mục tiêu |
| `INSUFFICIENT_SOURCES` | Chưa đủ nguồn; gợi ý thu hẹp mục tiêu |
| `OUT_OF_SCOPE`, `REFUSED` | Giải thích và gợi ý từ server |
| `INVALID_INPUT` | Chỉ dẫn cạnh trường sai |
| `UPSTREAM_UNAVAILABLE`, mất mạng | "Chưa tạo được lộ trình", nút Thử lại rõ ràng |

### 5.3 Khóa học (thư viện)
- Lưới hoặc danh sách thẻ khóa: tên, chủ đề, phút mỗi ngày, vòng tiến độ (x/5 ngày), điểm kiểm tra gần nhất, có video hay chưa, ngày tạo. Khóa mới nhất đứng đầu.
- Tìm kiếm và lọc theo trạng thái (đang học, hoàn thành).
- Trạng thái rỗng: "Bạn chưa có khóa nào" và nút "Tạo lộ trình". Trạng thái 404 khi mở khóa không còn.

### 5.4 Trang khóa học: tab Lộ trình
- Tiêu đề khóa, phút mỗi ngày, nhãn chế độ, vòng tiến độ.
- Dòng thời gian 5 ngày: mỗi ngày có tiêu đề, mục tiêu, trạng thái (đã học, hôm nay, sắp tới), ô tick "Đã học" lưu lên server. Ngày 1 có bài đầy đủ; ngày 2–5 chỉ có tiêu đề và mục tiêu.

### 5.5 Trang khóa học: tab Bài học
- Bố cục desktop: cột mục lục 5 ngày khoảng 240 px bên trái, cột bài đọc tối đa khoảng 70 ký tự, **bảng nguồn** bên phải hoặc trượt ra khi bấm nhãn nguồn.
- Bài 1 gồm: mục tiêu, thời lượng, các đoạn giải thích có nhãn nguồn, khối ví dụ (code có nút sao chép), khối bài tập.
- **Bảng nguồn:** tiêu đề nguồn, tên miền, đoạn đối chiếu nguyên văn (đánh dấu câu liên quan), nút "Mở trang gốc" (thao tác riêng, mở tab mới). Esc đóng và trả focus về nhãn đã bấm.
- Cuối bài: nút "Đánh dấu đã học", "Làm kiểm tra nhanh", "Tạo video tóm tắt".

## 6. Kiểm tra nhanh

### 6.1 Tab Kiểm tra của khóa
- Mỗi bài có một **bài kiểm tra nhanh 5 câu**, sinh từ nội dung bài và nguồn: trắc nghiệm, đúng/sai, điền chỗ trống, và một câu trả lời ngắn.
- Làm từng câu: chọn đáp án → bấm "Kiểm tra" → hiện đúng hoặc sai, **giải thích kèm nhãn nguồn** bấm được (mở cùng bảng nguồn như tab Bài học).
- Câu trả lời ngắn: AI nhận xét dựa trên đáp án mẫu và nguồn, hiện mức "Đạt", "Gần đúng" hoặc "Chưa đạt" và gợi ý sửa.
- Màn kết quả: điểm x/5, thời gian làm, danh sách câu đúng sai, nút "Làm lại", "Xem bài học". Đạt từ 4/5 thì gợi ý đánh dấu đã học ngày đó.
- Trạng thái: đang sinh câu hỏi (skeleton), lỗi sinh câu hỏi có thử lại.
- **Khóa:** thẻ "Bài thi cuối khóa (15–20 câu)" với trạng thái khóa "Mở khi học xong ngày 5"; thẻ "Ôn câu sai" với trạng thái "Sắp có".

### 6.2 Lịch sử kiểm tra (mục riêng trên thanh bên)
- Bảng tất cả lượt làm: khóa, bài, điểm, ngày giờ, thời gian làm. Lọc theo khóa, sắp theo ngày hoặc điểm.
- Mở một lượt để xem lại từng câu, đáp án đã chọn, đáp án đúng và giải thích kèm nguồn, ở chế độ chỉ đọc.
- Trạng thái rỗng: "Bạn chưa làm bài kiểm tra nào".

## 7. Video tóm tắt bài (kiểu Video Overview của NotebookLM)

Video được tạo **từ bài học đã sinh**, không tải tài liệu ngoài. Một người dẫn tiếng Việt, 5–7 cảnh, 90–150 giây. Mỗi cảnh là một slide có hình minh họa hoặc sơ đồ, câu trích hoặc con số lấy từ nguồn, phụ đề, và **nhãn nguồn ở góc cảnh**.

### 7.1 Tab Video của khóa, theo 4 bước
1. **Bắt đầu:** giới thiệu ngắn ("Biến bài 1 thành video 2 phút"), ước tính thời lượng, nút "Soạn kịch bản".
2. **Xem và sửa kịch bản cảnh:** danh sách cảnh theo cấu trúc:
   - mở đầu: mục tiêu bài;
   - 2–3 cảnh khái niệm, mỗi cảnh một nguồn;
   - cảnh ví dụ hoặc code;
   - cảnh bài tập;
   - kết: ngày mai học gì.
   Mỗi cảnh có ô sửa lời dẫn, mô tả hình, nhãn nguồn bắt buộc, kéo thả đổi thứ tự. Cảnh mất nguồn bị đánh dấu và chặn dựng. Có nút "Dựng video".
3. **Đang dựng:** tiến độ theo bước ("Tạo giọng đọc" → "Tạo hình minh họa" → "Ghép cảnh" → "Hoàn tất"), cho phép rời trang và quay lại.
4. **Trình phát:** khung 16:9, phụ đề bật tắt được, **chương theo cảnh** ở bên cạnh, bấm nhãn nguồn trên video mở đoạn đối chiếu, nút tải xuống và tạo lại.
- Trạng thái lỗi dựng có thử lại; biến thể **"Sắp có"** cho trường hợp chưa kịp chạy thật (hiện bước 1–2 và khung phát với ghi chú rõ).

### 7.2 Thư viện Video (mục riêng trên thanh bên)
- Lưới thẻ video: ảnh đại diện, tên khóa và bài, thời lượng, ngày tạo, trạng thái (đang dựng, sẵn sàng, lỗi). Trạng thái rỗng có nút dẫn về khóa học.

## 8. Cài đặt
- Giao diện: sáng, tối, theo hệ thống. Cỡ chữ bài đọc (vừa, lớn). Giảm chuyển động.
- Thông tin sản phẩm: phiên bản, model đang dùng (tìm nguồn và soạn bài), ghi chú về dữ liệu lưu trên máy chủ cục bộ.

## 9. Dữ liệu và hợp đồng hiện có (không đổi)

- `POST /api/courses` nhận `learner_group` (`middle_school`, `high_school`, `university`, `working`), `topic`, `goal`, `level`, `minutes_per_day`. Thành công trả 201 kèm khóa học; dừng trả 422 với `error.code` và `error.message` (bảng ở 5.2); lỗi dịch vụ trả 503.
- `GET /api/courses` (danh sách), `GET /api/courses/{id}` (chi tiết, 404 nếu không có).
- Khóa học gồm `title`, `plan` (5 ngày: `day`, `title`, `objective`), `lesson` (ngày 1: `title`, `minutes`, `sections` với `text` và `source_ids`, `example`, `exercise`), `sources` (`id`, `title`, `url`, `excerpt`), `mode` (`model` hoặc `mock`), `source_mode` (`web` hoặc `mock`).
- Dữ liệu mới sẽ lưu trên server: tiến độ theo ngày, lượt kiểm tra (câu hỏi, đáp án, điểm, thời gian), video (kịch bản cảnh, trạng thái dựng, đường dẫn file). Thiết kế giao diện cho các dữ liệu này; Claude Code sẽ thêm API tương ứng.

## 10. Khung hình và kịch bản demo

- **Khung chính 1536×864** (màn hình 1920×1080 phóng to 125%), kiểm thêm **1280×720** (máy chiếu). Khung điện thoại **390 px**.
- Kịch bản 3 phút mà bản mẫu phải đi trọn:
  1. Mở **Tổng quan**.
  2. Bấm "Dùng ví dụ SQL" rồi "Tạo lộ trình", xem màn chờ từng bước.
  3. Vào **Bài học**, bấm `S3` mở đoạn đối chiếu.
  4. Làm **Kiểm tra nhanh** 5 câu, xem giải thích kèm nguồn.
  5. Mở tab **Video**: xem kịch bản cảnh, phát video.
  6. Quay về **Tổng quan**, thấy tiến độ, điểm và video vừa cập nhật.
- Dùng dữ liệu mẫu thật ở mục 12 cho nội dung bài, ca hỏi lại và ca ngoài phạm vi. Câu hỏi kiểm tra và kịch bản cảnh tự soạn **chỉ từ nội dung bài và nguồn này**, không thêm kiến thức khác.

## 11. Ràng buộc để dựng code

- Codebase: **Next.js 16** xuất tĩnh (`output: "export"`), **React 19**, **Tailwind CSS 4**, TypeScript. Thành phần đặt trong `components/ui` (chung) và `components/features/courses` (theo tính năng). Gọi API qua một lớp `lib/api-client.ts` có sẵn.
- Không dùng thư viện giao diện nặng; biểu tượng dùng một bộ nhất quán (ví dụ Lucide). Token màu khai báo thành biến CSS cho sáng và tối.
- Mọi thành phần mô tả được bằng Tailwind và biến CSS; tránh hiệu ứng cần thư viện riêng.

## 12. Dữ liệu mẫu thật (đầu ra của hệ thống)

```json
{
  "ok_SQL": {
    "status": "ok",
    "title": "SQL 5 Ngày Khởi Đầu",
    "plan": [
      {"day": 1, "title": "Cú pháp SELECT & FROM", "objective": "Hiểu và viết được câu SELECT cơ bản để lấy dữ liệu từ 1 bảng."},
      {"day": 2, "title": "WHERE cơ bản (lọc dữ liệu)", "objective": "Dùng WHERE để lọc hàng theo điều kiện đơn giản với toán tử so sánh."},
      {"day": 3, "title": "Lọc theo văn bản (LIKE) & sắp xếp", "objective": "Biết dùng LIKE cho chuỗi và ORDER BY để sắp xếp kết quả."},
      {"day": 4, "title": "Truy vấn có ràng buộc nâng cao (toán tử với chuỗi)", "objective": "Nắm các toán tử hữu ích cho dữ liệu kiểu văn bản trong điều kiện WHERE."},
      {"day": 5, "title": "Thực hành truy vấn hoàn chỉnh", "objective": "Tổng hợp SELECT + WHERE + ORDER BY để trả lời các câu hỏi dữ liệu nhỏ."}
    ],
    "lesson": {
      "day": 1,
      "title": "Cú pháp SELECT & FROM",
      "minutes": 20,
      "sections": [
        {"text": "Câu truy vấn cốt lõi để lấy dữ liệu là SELECT ... FROM. Bạn chỉ định các cột cần lấy trong SELECT và bảng nguồn trong FROM. Cú pháp dạng: SELECT column1, column2, ... FROM table_name;", "source_ids": ["S3"]},
        {"text": "Khi chạy câu lệnh SELECT, cơ sở dữ liệu sẽ xử lý mệnh đề FROM trước, sau đó mới đến SELECT. Điều này giúp bạn hiểu rằng phần “bảng nào” sẽ được xác định trước khi chọn “cột nào”.", "source_ids": ["S4"]}
      ],
      "example": "Ví dụ (giả sử có bảng students với các cột id, name, age):\nSELECT id, name FROM students;",
      "exercise": "Viết 3 câu SELECT để lấy dữ liệu:\n1) Chỉ lấy 1 cột (ví dụ: SELECT name FROM students;)\n2) Lấy 2 cột (ví dụ: SELECT id, age FROM students;)\n3) Lấy cột cụ thể thay vì * (không dùng SELECT *)."
    },
    "sources": [
      {"id": "S3", "title": "SQL SELECT Statement", "url": "https://www.w3schools.com/sql/sql_select.asp", "excerpt": "… SELECT column1, column2, ... FROM table_name; Here, column1, column2, ... are the column names in the table you want to select data from."},
      {"id": "S4", "title": "PostgreSQL SELECT Statement: Retrieving Data from a Table", "url": "https://www.pgtutorial.com/postgresql-tutorial/postgresql-select", "excerpt": "When executing the SELECT FROM statement, PostgreSQL evaluates the FROM clause before the SELECT clause."}
    ],
    "mode": "model",
    "source_mode": "web"
  },
  "clarification": {
    "status": "clarification_required",
    "message": "Bạn muốn học dữ liệu theo hướng nào: (1) phân tích dữ liệu (Excel/SQL/Python), (2) khoa học dữ liệu & mô hình ML, hay (3) trực quan hóa dữ liệu (dashboard)?"
  },
  "out_of_scope": {
    "status": "out_of_scope",
    "message": "Mình không thể lập giáo trình lịch sử mỹ thuật/chỉ dẫn các trường phái hội họa vì yêu cầu này thuộc phạm vi “nghệ thuật và mỹ thuật”. Nếu bạn muốn, bạn có thể chuyển sang một trong các hướng trong phạm vi như: (1) tự học lịch sử mỹ thuật ở mức “kỹ năng đọc hiểu tư liệu/ghi chú học thuật” (không đi sâu trường phái), hoặc (2) học công cụ phục vụ nghiên cứu như cách lập kế hoạch học và phương pháp viết học thuật/tóm tắt nguồn. Bạn muốn đi theo hướng nào?"
  }
}
```

Lưu ý: trong dữ liệu gốc, `lesson.title` trùng tên khóa; bản mẫu dùng tên ngày 1 ("Cú pháp SELECT & FROM") làm tiêu đề bài cho dễ đọc.
