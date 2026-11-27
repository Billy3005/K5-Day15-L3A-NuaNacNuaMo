# Giải thích phần frontend (để Long đọc và trình bày được)

Code và tài liệu này được soạn cùng Claude (xem `docs/ai-usage.md`). Trước khi nhận là phần của mình, hãy mở từng file, tự chạy, và thử sửa một chỗ nhỏ.

## Luồng tổng quát

```text
CourseForm  ──validateForm──▶ createCourse (POST /api/courses)
                                   │ 201                    │ 422 / 503 / mất mạng
                                   ▼                        ▼
                 /courses/view?id=…                 showServerError (giữ nguyên form)
                 CourseView ─ getCourse(id) ─▶ CourseDetail ─▶ CoursePlan + LessonView ─▶ SourcePanel

/courses ─ CourseList ─ listCourses() ─▶ thẻ khóa "Mở khóa" ─▶ /courses/view?id=…
```

Chạy khi code: `python run.py` ở gốc repo (backend, cổng 8000), và `npm run dev` trong `frontend/`. Dev server mặc định ở cổng 3000, đổi cổng bằng `npm run dev -- -p 3001` vẫn gọi backend `http://127.0.0.1:8000`. Backend ở địa chỉ khác thì đặt biến khi khởi động: `NEXT_PUBLIC_API_URL=http://127.0.0.1:9000 npm run dev`.

Chạy bản demo: `npm run build` trong `frontend/`, rồi `python run.py`, mở cổng 8000. Bản build gọi API cùng origin, nên chạy backend ở cổng khác (`PORT=3000 python run.py`) không cần build lại. Chỉ đặt `NEXT_PUBLIC_API_URL` lúc build khi giao diện và API nằm ở hai nơi.

| Cách chạy | Địa chỉ API khi không đặt `NEXT_PUBLIC_API_URL` (hoặc để rỗng) |
|---|---|
| `npm run dev` | `http://127.0.0.1:8000` |
| Bản build (`npm run build`) | cùng origin với trang đang mở |

## Bố cục trên màn hình

| Trang | Có gì |
|---|---|
| Trang chủ `/` | Màn rộng chia hai cột: bên trái giới thiệu, 3 bước và khung minh họa trích nguồn; bên phải là form. Màn hẹp xếp dọc, ẩn khung minh họa |
| Bài học `/courses/view` | Đường dẫn "Khóa đã lưu / Lộ trình", tựa khóa, nhãn mẫu, các nhãn thông tin; mục lục 5 ngày bên trái, bài 1 bên phải |
| Khóa đã lưu `/courses` | Tựa trang, nút "Tạo lộ trình mới", lưới thẻ khóa (2 cột từ 640px) |

Mọi trang có thanh trên (logo, "Tạo mới", "Khóa đã lưu") và chân trang. Dưới 420px chữ cạnh logo được ẩn.

## Cấu hình

### `package.json`, `package-lock.json`
Khai báo thư viện và 4 lệnh: `dev`, `build`, `typecheck`, `lint`.
TypeScript ghim 5.9.3 vì công cụ lint chưa hỗ trợ bản 7.
File lock giữ đúng phiên bản; máy khác cài bằng `npm ci`.

### `next.config.mjs`
`output: "export"` xuất web thành file tĩnh trong `out/`.
Backend phục vụ luôn thư mục đó, nên demo chỉ cần một server.
`agentRules: false` để Next không tự sinh `AGENTS.md`.

### `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`
`tsconfig` bật `strict` để bắt lỗi kiểu sớm.
ESLint dùng bộ luật của Next, gồm luật về hook và truy cập.
PostCSS nạp Tailwind v4.

### `.gitignore`
Bỏ qua `node_modules/`, `.next/`, `out/`.
`out/` đang tạm bỏ qua; nhóm quyết định có commit hay không ở CP4.

## Trang (`app/`)

### `globals.css`
Khai báo màu trong `@theme`: màu chính theo wireframe, thêm vài sắc độ phụ, một kiểu bóng nhẹ `shadow-card`.
Đặt chữ 17px, giãn dòng 1,6, viền focus 2px cho người dùng bàn phím.
Người bật "giảm chuyển động" thì tắt cuộn mượt và hiệu ứng chuyển.

### `layout.tsx`
Khung chung: font Source Sans 3 (400, 600, 700) từ gói cài sẵn nên build được khi mất mạng.
Link "Bỏ qua, tới nội dung chính" chỉ hiện khi Tab tới.
Thanh trên dính khi cuộn; chân trang nói phần giải thích có trích nguồn.

### `page.tsx` (trang chủ)
Giới thiệu, 3 bước, và `CitationPreview` là khung **minh họa**, không phải dữ liệu của người dùng.
Câu trích trong khung lấy đúng nguyên văn trang PostgreSQL, rút gọn ở cuối bằng "…".
Form nằm trong cột phải.

### `courses/page.tsx`, `courses/view/page.tsx`
Trang danh sách và trang chi tiết (`/courses/view?id=…`).
Trang chi tiết bọc `Suspense` vì bản build tĩnh bắt buộc khi đọc tham số trên URL.

### `icon.svg`
Biểu tượng trên tab trình duyệt, cùng hình với logo.

## Component của khóa học (`components/features/courses/`)

### `CourseForm.tsx`
Giữ dữ liệu 5 trường, lỗi từng trường, trạng thái đang tạo.
"Dùng ví dụ SQL" điền mẫu; 4 nút 15, 20, 30, 45 chọn nhanh số phút. Nhãn "Dữ liệu mẫu" hiện ở chế độ fixture.
`showServerError` đặt lỗi cạnh trường hoặc dưới nút gửi, không đụng dữ liệu đã nhập.
`submittingRef` chặn gửi trùng; `focusRequest` chỉ đổi khi gửi, nên đang gõ không bị nhảy ô.

### `CourseView.tsx`
Đọc `id` từ URL rồi gọi `getCourse`.
Có 4 tình huống: đang mở, mở được, không tìm thấy, lỗi (có Thử lại).
Thiếu `id` thì về danh sách. Cờ `ignore` bỏ kết quả cũ khi đã sang khóa khác.

### `CourseDetail.tsx`
Phần đầu trang đọc: đường dẫn, tựa, nhãn "Bản thử dữ liệu mẫu", nhãn số phút, số ngày, cách soạn, loại nguồn.
Chỉ nhận dữ liệu qua props, nên dùng được cho cả JSON mẫu lẫn dữ liệu thật.

### `CoursePlan.tsx`
Mục lục dạng dòng thời gian. Dưới 768px nằm trong `<details>` nên gập được. Từ 768px là một khối riêng, luôn hiện đủ và dính khi cuộn, kể cả khi trước đó đã gập ở màn hẹp.
Danh sách ngày viết một lần (`PlanDays`) và dùng cho cả hai khối; khối đang ẩn không được trình đọc màn hình đọc.
Ngày đang mở có chữ "Bài hôm nay", không chỉ phân biệt bằng màu.
Trình đọc màn hình nghe "Ngày 1: …" nhờ chữ ẩn.

### `LessonView.tsx`
Hiện bài 1: "Sau bài này bạn sẽ", nội dung, ví dụ, bài tập, nguồn của bài.
Mã nguồn (`S1`…) nằm ngay cuối đoạn, là nút theo `source_ids`.
Nhớ nguồn nào đang mở, mở ở đâu, và nút vừa bấm; đóng thì focus quay về nút đó.
Nút ngoài cao 44px để dễ chạm, còn hình nhìn thấy là viên nhỏ bên trong; lề âm giữ giãn dòng như cũ.

### `SourcePanel.tsx`
Khung đoạn đối chiếu cạnh chỗ trích: mã, tên miền, tên nguồn, đoạn trích, URL.
Có "Mở trang gốc" (tab mới) và "Đóng"; phím Esc cũng đóng.
Mở ra thì focus vào tên nguồn. Mã không có trong `sources` thì báo "Không tìm thấy nguồn này".

### `CourseList.tsx`
Gọi `listCourses`, giữ thứ tự server trả (mới nhất trước).
Đang tải hiện hai ô chờ; còn có trạng thái lỗi, rỗng và danh sách thẻ.
Cả thẻ là một link; tên đọc chính là chữ trên thẻ: tên khóa rồi "Mở khóa".

### `StatusMessage.tsx`
Khung thông báo dùng chung, nền đỏ nhạt khi là lỗi, có chỗ đặt nút đi tiếp.
Vùng `aria-live` đặt ở nơi gọi để trình đọc màn hình đọc thông báo mới.

## Component nhỏ (`components/ui/`)

### `Button.tsx`, `Badge.tsx`
Nút cao tối thiểu 44px, 4 kiểu (`primary`, `secondary`, `soft`, `text`); `buttonClass` cho link trông như nút.
`Badge` có 3 màu: vàng (dữ liệu mẫu), trung tính, xanh.

### `Field.tsx`
Gắn `label`, lỗi và gợi ý vào đúng ô nhập qua `htmlFor` và `aria-describedby`.
Viết một lần để các trường làm giống nhau.

### `NavLink.tsx`, `Logo.tsx`
`NavLink` đánh dấu trang đang mở bằng `aria-current` và nền xanh nhạt.
`Logo` là hình vuông bo góc chữ L.

### `Card.tsx`
Khối trắng viền mảnh. Hiện không nơi nào dùng; có thể xóa sau.

## Logic (`lib/`)

### `validation.ts`
Giới hạn độ dài và số phút chép từ `docs/openapi.json`.
`validateForm` trả lỗi từng trường; `toRequest` cắt khoảng trắng và đổi số phút sang số.

### `config.ts`
Một hằng `USE_FIXTURE`. Mặc định bật; build với `NEXT_PUBLIC_USE_FIXTURE=0` để gọi workflow thật.
Giá trị được đóng vào lúc build, đổi thì phải build lại.

### `fixtures.ts`
Chép nguyên ví dụ trong OpenAPI. Mở `/courses/view?id=mau` để xem mà không cần backend.

### `api-client.ts` (có sẵn trong khung PR #1)
Gọi 3 endpoint và đổi mọi lỗi thành `ApiClientError`.
Chỉ sửa hàm `resolveApiBaseUrl` (review PR #9): chọn địa chỉ API theo biến và kiểu chạy, không đoán theo số cổng.

### File có sẵn trong khung (PR #1), không sửa
`constants.ts` (nhóm người học, ví dụ SQL), `utils.ts` (gộp class), `types/course.ts` (kiểu theo OpenAPI).

## 10 câu giám khảo hay hỏi

**1. Vì sao dùng `?id=` mà không dùng `/courses/[id]`?**
Bản build tĩnh phải biết trước mọi ID để tạo trang, còn khóa được tạo lúc chạy. Một trang `view` đọc `id` từ URL thì dùng được cho mọi khóa, F5 vẫn đúng.

**2. 422 khác 503 thế nào, xử lý ở đâu?**
422: người dùng cần sửa đầu vào hoặc phạm vi. 503: dịch vụ lỗi, thử lại được. Xử lý ở `showServerError` trong `CourseForm.tsx`; `api-client.ts` đổi phản hồi lỗi và mất mạng thành `ApiClientError`.

**3. Nhãn "Bản thử dữ liệu mẫu" để làm gì?**
Để người xem không nhầm dữ liệu mẫu với kết quả thật. Nhãn hiện khi `mode` hoặc `source_mode` là `mock`, theo đúng dữ liệu server trả về.

**4. Trích dẫn nối với nguồn thế nào?**
Mỗi đoạn có `source_ids`, trỏ tới `sources[].id`. Bấm mã thì hiện `excerpt` và `url`. Mã lạ thì báo không tìm thấy.

**5. Giao diện có đảm bảo nội dung đúng không?**
Không. Chỉ phần giải thích có trích nguồn; ví dụ và bài tập thì không. Backend chỉ chấp nhận ID nguồn hợp lệ, còn đoạn nguồn có thật sự hỗ trợ nội dung hay không phải đối chiếu. Giao diện đặt đoạn trích và link gốc cạnh bài để người học tự kiểm.

**6. Chống gửi trùng thế nào?**
Khi đang tạo, nút bị khóa; `submittingRef` chặn thêm trường hợp hai lần gửi trong cùng một nhịp. Thành công thì giữ khóa đến khi chuyển trang.

**7. Server đã kiểm rồi, sao còn kiểm ở trình duyệt?**
Để báo lỗi ngay và đưa focus vào đúng ô, không tốn một lượt gọi. Server vẫn là nơi quyết định cuối cùng.

**8. Người dùng bàn phím hoặc trình đọc màn hình dùng được không?**
Có link bỏ qua tới nội dung; thao tác dùng nút, link, ô nhập chuẩn; lỗi gắn `aria-describedby`; thông báo nằm trong vùng `aria-live`; focus được chuyển có chủ đích và có viền rõ; vùng chạm ít nhất 44px ở màn 360px.

**9. Chuyển từ dữ liệu mẫu sang AI thật thế nào?**
Backend cần `.env` có model và tìm kiếm thật. Frontend build lại với `NEXT_PUBLIC_USE_FIXTURE=0`. Không phải sửa code.

**10. Em dùng AI vào việc gì?**
Claude viết code giao diện, thiết kế lại bố cục và chạy kiểm tự động. Phần mình đã kiểm, chỉnh và duyệt thì nói đúng như đã làm, khớp `docs/ai-usage.md`.

## Giới hạn hiện tại

- Mới kiểm ở chế độ giả. Chưa kiểm với AI và nguồn web thật, chưa thử trên điện thoại thật.
- Ở chế độ mẫu, đoạn đối chiếu là bản diễn đạt lại bằng tiếng Việt (`data/DATA_CARD.md`), không phải nguyên văn trang gốc.
- Chữ gợi ý mờ trong ô nhập (placeholder) có tương phản thấp.
- Kịch bản kiểm tự động nằm ngoài repo, nên trong repo chưa có test cho frontend.
- Câu hỏi làm rõ (`CLARIFICATION_REQUIRED`) mới kiểm bằng phản hồi giả lập.
- Chỉ bài ngày 1 có nội dung; ngày 2–5 có tiêu đề và mục tiêu.
