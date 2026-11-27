# Giải thích phần frontend (để Long đọc và trình bày được)

Code trong tài liệu này do Claude Code viết. Trước khi nhận là phần của mình, hãy mở từng file, tự chạy, và thử sửa một chỗ nhỏ.

## Luồng tổng quát

```text
CourseForm  ──validateForm──▶ createCourse (POST /api/courses)
                                   │ 201                    │ 422 / 503 / mất mạng
                                   ▼                        ▼
                 /courses/view?id=…                 showServerError (giữ nguyên form)
                 CourseView ─ getCourse(id) ─▶ CourseDetail ─▶ CoursePlan + LessonView ─▶ SourcePanel

/courses ─ CourseList ─ listCourses() ─▶ "Mở khóa" ─▶ /courses/view?id=…
```

Chạy khi code: `python run.py` ở gốc repo, và `npm run dev` trong `frontend/` (cổng 3000). Chạy bản demo: `npm run build` trong `frontend/`, rồi `python run.py`, mở cổng 8000.

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
Khai báo màu theo wireframe trong `@theme`, dùng thành lớp như `bg-page`, `text-error`.
Đặt chữ 17px, giãn dòng 1,6, và viền focus 2px cho người dùng bàn phím.
Không gradient, không đổ bóng.

### `layout.tsx`
Khung chung mọi trang: nạp font Source Sans 3 từ gói cài sẵn (build được khi mất mạng).
Thanh trên có link về trang tạo và "Khóa đã lưu".
`lang="vi"` để trình đọc màn hình đọc đúng tiếng Việt.

### `page.tsx`, `courses/page.tsx`
Trang tạo lộ trình và trang danh sách.
Chỉ có tiêu đề và gọi component; phần tương tác nằm trong component `"use client"`.

### `courses/view/page.tsx`
Trang chi tiết, địa chỉ `/courses/view?id=…`.
Bọc `Suspense` vì bản build tĩnh bắt buộc khi đọc tham số trên URL.

## Component của khóa học (`components/features/courses/`)

### `CourseForm.tsx`
Giữ dữ liệu 5 trường, lỗi từng trường, trạng thái đang tạo.
Gửi form: kiểm tại trình duyệt, gọi API, thành công thì chuyển trang.
`showServerError` đặt lỗi cạnh trường hoặc đầu form, không đụng dữ liệu đã nhập.
`submittingRef` chặn gửi trùng ngay lập tức; `focusRequest` chỉ đổi khi gửi, nên đang gõ không bị nhảy ô.

### `CourseView.tsx`
Đọc `id` từ URL rồi gọi `getCourse`.
Có 4 tình huống: đang mở, mở được, không tìm thấy, lỗi (có Thử lại).
Thiếu `id` thì về danh sách. Cờ `ignore` bỏ kết quả cũ khi người dùng đã sang khóa khác.

### `CourseDetail.tsx`
Bố cục trang đọc: tựa, số phút, nhãn mẫu, trạng thái nguồn, rồi hai cột.
Chỉ nhận dữ liệu qua props, nên dùng được cho cả JSON mẫu lẫn dữ liệu thật.

### `CoursePlan.tsx`
Mục lục 5 ngày trong khối `<details>` nên gập được mà không cần JavaScript riêng.
Ngày đang mở có chữ "Đang mở", không chỉ phân biệt bằng màu.

### `LessonView.tsx`
Hiện bài 1 và các nút mã nguồn theo `source_ids`.
Nhớ nguồn nào đang mở, mở ở đâu, và nút vừa bấm.
Đóng bằng Esc hoặc nút Đóng thì focus quay về nút đó.

### `SourcePanel.tsx`
Khung đoạn đối chiếu ngay cạnh chỗ trích, kèm link mở trang gốc.
Mở ra thì focus vào tên nguồn, để người dùng bàn phím biết mình đang ở đâu.
Mã không có trong `sources` thì báo "Không tìm thấy nguồn này".

### `CourseList.tsx`
Gọi `listCourses`, giữ thứ tự server trả (mới nhất trước).
Có trạng thái đang tải, lỗi, rỗng và danh sách.

### `StatusMessage.tsx`
Khung thông báo dùng chung, viền đỏ khi là lỗi, có chỗ đặt nút đi tiếp.
Vùng `aria-live` đặt ở nơi gọi để trình đọc màn hình đọc thông báo mới.

## Component nhỏ (`components/ui/`)

### `Button.tsx`, `Card.tsx`, `Badge.tsx`
Nút cao tối thiểu 44px, có 3 kiểu; `buttonClass` cho link trông như nút.
`Card` là khối trắng viền mảnh. `Badge` là nhãn vàng nhạt cho dữ liệu mẫu.

### `Field.tsx`
Gắn `label`, gợi ý và lỗi vào đúng ô nhập qua `htmlFor` và `aria-describedby`.
Viết một lần để 5 trường làm giống nhau.

## Logic (`lib/`)

### `validation.ts`
Giới hạn độ dài và số phút chép từ `docs/openapi.json`.
`validateForm` trả lỗi từng trường; `toRequest` cắt khoảng trắng và đổi số phút sang số.

### `config.ts`
Một hằng `USE_FIXTURE`. Mặc định bật; build với `NEXT_PUBLIC_USE_FIXTURE=0` để gọi workflow thật.
Giá trị được đóng vào lúc build, đổi thì phải build lại.

### `fixtures.ts`
Chép nguyên ví dụ trong OpenAPI. Mở `/courses/view?id=mau` để xem mà không cần backend.

### File có sẵn trong khung (PR #1), không sửa
`api-client.ts` gọi 3 endpoint và đổi mọi lỗi thành `ApiClientError`.
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
Không. Backend chỉ chấp nhận ID nguồn hợp lệ, còn đoạn nguồn có thật sự hỗ trợ nội dung hay không phải đối chiếu. Giao diện đặt đoạn trích và link gốc cạnh bài để người học tự kiểm.

**6. Chống gửi trùng thế nào?**
Khi đang tạo, nút bị khóa; `submittingRef` chặn thêm trường hợp hai lần gửi trong cùng một nhịp. Thành công thì giữ khóa đến khi chuyển trang.

**7. Server đã kiểm rồi, sao còn kiểm ở trình duyệt?**
Để báo lỗi ngay và đưa focus vào đúng ô, không tốn một lượt gọi. Server vẫn là nơi quyết định cuối cùng.

**8. Người dùng bàn phím hoặc trình đọc màn hình dùng được không?**
Mọi thao tác là nút, link, ô nhập chuẩn. Lỗi gắn `aria-describedby`, thông báo nằm trong vùng `aria-live`, focus được chuyển có chủ đích và có viền rõ.

**9. Chuyển từ dữ liệu mẫu sang AI thật thế nào?**
Backend cần `.env` có model và tìm kiếm thật. Frontend build lại với `NEXT_PUBLIC_USE_FIXTURE=0`. Không phải sửa code.

**10. Em dùng AI vào việc gì?**
Claude Code viết code giao diện và chạy kiểm tự động. Phần mình đã đọc, chạy lại và sửa thì nói đúng như đã làm, khớp `docs/ai-usage.md`.

## Giới hạn hiện tại

- Mới kiểm ở chế độ giả. Chưa kiểm với AI và nguồn web thật, chưa thử trên điện thoại thật.
- Kịch bản kiểm tự động nằm ngoài repo, nên trong repo chưa có test cho frontend.
- Câu hỏi làm rõ (`CLARIFICATION_REQUIRED`) mới kiểm bằng phản hồi giả lập.
- Chỉ bài ngày 1 có nội dung; ngày 2–5 có tiêu đề và mục tiêu.
