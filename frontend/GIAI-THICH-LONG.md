# Giải thích phần frontend NewLearn (để Long đọc và trình bày được)

## Ai làm phần nào

- Long dựng bản đầu cùng Claude Code (LONG-01 đến LONG-05, PR #9).
- Bảo thiết kế lại toàn bộ giao diện và thêm kiểm tra nhanh, lịch sử, video (commit `afb04e3`, PR #15). Bản mẫu ở `docs/design/newlearn/`.
- Sau đó có 6 sửa nhỏ cùng Claude Code (commit `2f5115c`, `bfafd82`, `ca517ff`): màu chữ nút, trả focus khi đóng nguồn, tab Kiểm tra ở màn hẹp, bài học ở màn vừa, focus khi server dừng, ô chọn nguồn video.
- Trong tài liệu này, **(giữ)** là file không đổi sau PR #15, **(mới)** là file do PR #15 thêm hoặc sửa.

Trước khi nói đây là phần mình hiểu: mở từng file, tự chạy, thử sửa một chỗ nhỏ.

## Luồng tổng quát

```text
Tổng quan ──mục tiêu──▶ CreatePage ──validateForm──▶ POST /api/courses
                                          │ 201                     │ 422 / 503 / mất mạng
                                          ▼                         ▼
                         /courses/view?id=…&tab=lesson      hộp báo lỗi, form giữ nguyên
                         CoursePage: Lộ trình │ Bài học │ Kiểm tra │ Video
                                                   │            │          │
                                            nhãn S1 → nguồn   /history    /videos
```

## Chạy

```bash
source .venv/bin/activate
pip install -r requirements.txt
cd frontend && npm ci && npm run build && cd ..
python run.py                       # mở http://127.0.0.1:8000
```

- Cổng 8000 bận hoặc API trả "Không tìm thấy đường dẫn API này" thì còn server cũ đang chạy. Tắt nó (Ctrl+C) rồi chạy lại.
- Bản build mặc định là **dữ liệu mẫu**: nhập gì cũng trả khóa SQL mẫu. Muốn AI thật thì build với `NEXT_PUBLIC_USE_FIXTURE=0` và `.env` có model.
- Cờ trên chỉ chi phối việc **tạo khóa**. Kiểm tra và video theo `MODEL_PROVIDER` trong `.env`, nên có key thật thì vẫn tốn tiền dù build mẫu.
- Khi sửa code: `python run.py`, rồi `npm run dev` trong `frontend/` (cổng 3000, gọi backend cổng 8000).

| Trang | Có gì |
|---|---|
| `/` | Ô nhập nhanh mục tiêu, "Học tiếp", 5 số liệu, hoạt động gần đây |
| `/create` | Form 5 trường, màn chờ 4 bước, hộp báo khi không tạo được |
| `/courses` | Lưới khóa, tìm theo tên, lọc Tất cả / Đang học / Hoàn thành |
| `/courses/view?id=…&tab=…` | 4 tab: `plan`, `lesson`, `quiz`, `video` |
| `/history`, `/videos`, `/settings` | Lịch sử kiểm tra, thư viện video, cài đặt |

## Từng file: làm gì, vì sao

### Cấu hình

**`package.json`, `package-lock.json`** (mới)
Khai báo thư viện (Next, React, Tailwind, `lucide-react` cho biểu tượng) và 4 lệnh `dev`, `build`, `typecheck`, `lint`.
File lock giữ đúng phiên bản, nên máy khác cài bằng `npm ci` ra cùng kết quả.
TypeScript ghim 5.9.3. `@fontsource/source-sans-3` giờ chỉ còn slide dùng.

**`next.config.mjs`** (giữ)
`output: "export"` xuất web thành file tĩnh trong `out/`.
Backend phục vụ luôn thư mục đó, nên demo chỉ cần một server.
`agentRules: false` để Next không tự sinh `AGENTS.md`.

**`tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `.gitignore`** (giữ)
`strict` bắt lỗi kiểu sớm; ESLint dùng luật của Next, gồm luật về hook.
PostCSS nạp Tailwind v4.
`.gitignore` bỏ `node_modules/`, `.next/`, `out/` vì đều sinh lại được.

### Khung và trang (`app/`)

**`layout.tsx`** (mới)
Đặt tiêu đề trang, tải font Be Vietnam Pro và JetBrains Mono, bọc mọi trang trong `AppShell`.
Font lấy từ Google Fonts, nên mất mạng thì dùng font hệ thống. Lint cảnh báo chỗ này, không làm hỏng build.

**`globals.css`** (mới, có sửa ở `2f5115c`, `bfafd82`)
Toàn bộ màu là biến CSS trên `.nl`; thêm `.dark` là đổi sang giao diện tối.
Chứa class dùng chung (`btn`, `card`, `badge`, `cite`, `input`) và các điểm gãy 1180px, 1023px, 720px.
Luật `:where(...)` giữ độ ưu tiên bằng 0; trước đó nó đè màu chữ nút, chữ tối trên nền xanh khó đọc.

**`page.tsx`, `create/`, `courses/`, `courses/view/`, `history/`, `videos/`** (mới)
Mỗi file vài dòng, chỉ gọi component ở `components/pages/`.
Tách vậy để phần định tuyến mỏng, logic nằm một chỗ.
Trang đọc tham số trên URL bọc `Suspense` vì bản build tĩnh yêu cầu.

**`settings/page.tsx`** (mới)
Chọn giao diện sáng, tối, theo hệ thống; cỡ chữ bài đọc; giảm chuyển động.
Mục "Về NewLearn" ghi **chế độ tạo khóa** (dữ liệu mẫu hay AI thật).
Đây là chỗ kiểm nhanh trước khi demo, vì form không còn nhãn "Dữ liệu mẫu".

**`icon.svg`** (giữ)
Biểu tượng trên tab trình duyệt.
Vẫn là hình của bản cũ, chưa đổi theo logo NewLearn.

### Khung ứng dụng (`components/shell/`, `components/nl/`)

**`AppShell.tsx`** (mới)
Thanh bên thu gọn được; từ 720px trở xuống đổi thành thanh dưới 5 mục. Có link "Bỏ qua, tới nội dung chính".
Giữ tùy chọn giao diện trong `localStorage` và chia cho các trang qua context.
Chuỗi ngày học lấy từ `/api/overview`, chỉ hiện khi lớn hơn 0.

**`Logo.tsx`** (mới)
SVG sách mở với chấm hổ phách tượng trưng cho nguồn.
Vẽ bằng code nên không cần file ảnh.

**`ui.tsx`** (mới)
Mảnh dùng chung: vòng tiến độ, nhãn chế độ, khung đang tải, lỗi, rỗng, nhãn nguồn, thẻ nguồn, hộp nguồn.
Viết một chỗ để mọi trang báo trạng thái giống nhau.
Thẻ nguồn tô vàng các từ dài từ 5 ký tự trùng với câu được dẫn; chỉ là gợi ý đối chiếu, không phải kiểm chứng.

### Các trang (`components/pages/`)

**`OverviewPage.tsx`** (mới)
Gõ mục tiêu ở đây thì sang `/create?goal=…`; "Dùng ví dụ SQL" sang form điền sẵn.
"Học tiếp" chọn khóa chưa học xong; kèm 5 số liệu và hoạt động gần đây.
Mọi số lấy từ một API `/api/overview`, nên chỉ có một lượt gọi.

**`CreatePage.tsx`** (mới, có sửa ở `ca517ff`)
Giữ 5 trường, kiểm trước khi gửi, đưa focus vào ô lỗi đầu tiên.
Lỗi `INVALID_INPUT` hiện cạnh ô; mã khác hiện hộp riêng, chỉ lỗi dịch vụ có "Thử lại". Form giữ nguyên, focus chuyển tới hộp hoặc ô cần sửa.
**Thanh tiến độ và 4 bước chạy theo đồng hồ** (0, 3, 9, 15 giây), không phản ánh tiến độ thật của backend.

**`CoursesPage.tsx`** (mới)
Lấy danh sách khóa từ `/api/overview` để có sẵn tiến độ và điểm kiểm tra.
Tìm theo tên và lọc trạng thái làm ngay ở trình duyệt.
Có đủ trạng thái đang tải, lỗi, chưa có khóa và không khớp bộ lọc.

**`CoursePage.tsx`** (mới)
Đọc `id`, `tab` từ URL nên F5 vẫn đúng khóa và đúng tab. Tải khóa và tiến độ cùng lúc.
Đánh dấu ngày hiện ngay, lưu lỗi thì trả lại như cũ.
Sai ID hoặc thiếu ID hiện "Không tìm thấy khóa này".

**`HistoryPage.tsx`** (mới)
Danh sách lượt kiểm tra, lọc theo khóa, sắp theo ngày hoặc điểm.
Có `?id=` thì xem lại từng câu, đáp án, giải thích và nguồn.
Để người học ôn lại mà không phải làm lại.

**`VideosPage.tsx`** (mới)
Lưới video đã soạn, ghi rõ bản nháp hay sẵn sàng.
Bấm thẻ mở đúng khóa, đúng video ở tab Video.

### Bốn tab của khóa (`components/course/`)

**`PlanTab.tsx`** (mới)
5 ngày, ô đánh dấu đã học; "Hôm nay" là ngày đầu tiên chưa đánh dấu.
Chỉ ngày 1 có "Mở bài", các ngày khác ghi "Bài soạn sau".
Ghi rõ vậy để không hứa nội dung chưa có.

**`LessonTab.tsx`** (mới, có sửa ở `2f5115c`)
Mục lục, bài 1, ví dụ (có nút sao chép), bài tập, cột nguồn.
Nhãn `S1` sau đoạn giải thích mở đoạn đối chiếu theo `source_ids`.
Đóng bằng Esc hoặc nút X trả focus về đúng nhãn vừa bấm, để người dùng bàn phím không bị lạc.

**`QuizTab.tsx`** (mới, có sửa ở `2f5115c`)
5 câu: 2 trắc nghiệm, 1 đúng sai, 1 điền chỗ trống, 1 trả lời ngắn.
Server chấm; đáp án chỉ trả về sau khi bấm "Kiểm tra". Nộp lại cùng mã lượt không tạo dòng lịch sử mới.
"Bài thi cuối khóa" và "Ôn câu sai" mới là ô giữ chỗ.

**`VideoTab.tsx`** (mới, có sửa ở `ca517ff`)
Soạn kịch bản, người học sửa và đổi thứ tự cảnh, dựng, rồi xem.
Cảnh trỏ tới nguồn không tồn tại, hoặc trống tiêu đề hay lời dẫn, thì khóa nút dựng.
"Dựng" chỉ lưu và chốt kịch bản; các bước chờ là hiệu ứng hẹn giờ.

**`VideoPlayer.tsx`** (mới)
Phát từng cảnh dạng slide, đọc bằng giọng của trình duyệt, có phụ đề, chương, tải `.srt`.
Không có giọng đọc thì chạy theo thời lượng từng cảnh.
Không xuất file MP4.

### Logic (`lib/`, `types/`)

**`api-client.ts`** (mới sửa)
Một chỗ gọi mọi API; lỗi nào cũng thành `ApiClientError`, mất mạng coi như 503.
Chọn địa chỉ API: theo `NEXT_PUBLIC_API_URL`, bản build dùng cùng origin, `npm run dev` dùng cổng 8000.
Không đặt thời gian chờ ở trình duyệt; `listCourses` hiện không nơi nào gọi.

**`validation.ts`** (giữ)
Giới hạn độ dài và số phút chép từ `docs/openapi.json`.
`validateForm` trả lỗi từng trường; `toRequest` cắt khoảng trắng, đổi số phút sang số.
Kiểm ở trình duyệt để báo sớm; backend vẫn kiểm lại.

**`config.ts`, `constants.ts`, `utils.ts`** (giữ)
`USE_FIXTURE` mặc định bật, đóng vào lúc build.
`constants.ts` giữ nhóm người học và ví dụ SQL (trang tạo khóa tự khai thêm nhãn ngắn).
`utils.ts` hiện không nơi nào dùng.

**`format.ts`** (mới)
Đổi ngày giờ, thời lượng sang chữ tiếng Việt; lấy tên miền từ URL.
Viết một chỗ để các trang hiển thị giống nhau.

**`types/course.ts`** (giữ), **`types/learning.ts`** (mới)
Kiểu dữ liệu để TypeScript bắt lỗi khi API đổi.
`course.ts` theo `docs/openapi.json`.
`learning.ts` theo `learning.py`; các API mới này **chưa có trong OpenAPI**.

## 10 câu giám khảo hay hỏi

**1. Vì sao dùng `?id=` mà không dùng `/courses/[id]`?**
Bản build tĩnh phải biết trước mọi ID để tạo trang, còn khóa được tạo lúc chạy. Một trang `view` đọc `id` từ URL dùng được cho mọi khóa.

**2. Trích dẫn nối với nguồn thế nào?**
Mỗi đoạn có `source_ids` trỏ tới `sources[].id`; bấm nhãn thì mở đoạn trích và link gốc. Với tìm web thật, đoạn trích lấy từ trích dẫn của công cụ tìm kiếm. Ở dữ liệu mẫu, đó là bản diễn đạt lại bằng tiếng Việt, dù giao diện vẫn ghi "nguyên văn".

**3. Giao diện có đảm bảo nội dung đúng không?**
Không. Chỉ đoạn giải thích có nhãn nguồn; ví dụ và bài tập thì không, dù trang Tổng quan viết "mỗi ý đều có nguồn". Backend chỉ kiểm ID nguồn hợp lệ. Lượt eval 2 đạt 18/30, chưa đạt chuẩn.

**4. Bốn bước lúc chờ có phải tiến độ thật không?**
Không. Thanh chạy theo thời gian và dừng ở 95% cho tới khi server trả lời. Bước dựng video cũng là hiệu ứng.

**5. 422 khác 503 thế nào?**
422: người học cần sửa đầu vào (cần làm rõ, thiếu nguồn, ngoài phạm vi, bị từ chối). 503: dịch vụ lỗi, có "Thử lại". Cả hai giữ nguyên dữ liệu form.

**6. Làm sao biết đang xem dữ liệu mẫu hay AI thật?**
Trang khóa có nhãn "Dữ liệu mẫu" hoặc "Bài soạn: model AI", kèm nhãn nguồn, lấy từ dữ liệu server trả. Trang Cài đặt ghi chế độ tạo khóa.

**7. Bài kiểm tra chấm ở đâu, gian lận được không?**
Server chấm và không gửi đáp án trước. Người cố tình gọi API vẫn lấy được đáp án ở bước kiểm rồi nộp lại, nên đây là bài tự ôn, không dùng để thi.

**8. Video được tạo thế nào?**
Model soạn kịch bản cảnh từ bài 1 và nguồn, người học sửa. Trình duyệt phát slide kèm giọng đọc của máy và phụ đề. Không có file MP4, không có hình do AI vẽ.

**9. Người dùng bàn phím hoặc trình đọc màn hình dùng được không?**
Có link bỏ qua, nhãn cho ô nhập, lỗi gắn vào ô, đóng nguồn trả focus. Còn thiếu: hộp nguồn chưa giữ focus bên trong, lựa chọn trắc nghiệm chưa đi bằng phím mũi tên, nhãn nguồn thấp hơn 24px, chưa thử trình đọc màn hình.

**10. Bạn làm gì, AI làm gì?**
Trả lời đúng như `docs/ai-usage.md`: Long và Claude Code dựng bản đầu, Bảo thiết kế lại cùng Claude. Chỉ nhận phần mình đã tự đọc, chạy và giải thích được.

## Giới hạn hiện tại

- Phần kiểm trong LONG-06 mới chạy ở chế độ giả, chưa thử điện thoại thật.
- Chỉ ngày 1 có bài; ngày 2–5 có tiêu đề và mục tiêu.
- Trong repo chưa có test cho frontend; kịch bản kiểm bằng Chrome nằm ngoài repo.
- Ở 360px, đường dẫn trên thanh đầu bị cắt còn một, hai chữ.
- Ở 1181–1280px, tab Bài học chia 3 cột nên cột bài đọc chỉ còn khoảng 260–360px.
- Chế độ giả không tạo ra câu hỏi làm rõ khi nhập trên web.
- Ở 360px, phụ đề video đè lên tiêu đề cảnh.
- Ô đánh dấu (20×20px) và nhãn nguồn (cao 22px) nhỏ hơn 24px.
- Màn giới thiệu video ghi "6 cảnh", còn bài mẫu chỉ ra 5 cảnh.
