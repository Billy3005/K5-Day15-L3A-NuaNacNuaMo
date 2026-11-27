# Kế hoạch hackathon theo checkpoint

Mục tiêu là để người học nhập mục tiêu, nhận lộ trình 5 ngày và đọc bài 1 có trích dẫn, rồi mở lại khóa đã lưu. Demo dùng ca SQL cho sinh viên và một ca cần giới hạn phản hồi.

| Mốc | Bàn giao |
|---|---|
| CP1 · 17:00 ngày 27/11 | Repo Public, danh sách thành viên, canvas và thẻ Track F. Đối chiếu xác nhận nộp form. |
| CP2 · 19:30 ngày 27/11 | Canvas cập nhật, sơ đồ hệ thống, data card, benchmark, chuẩn đạt và mock. Đối chiếu xác nhận nộp form. |
| CP3 · 10:00 ngày 28/11 | Bằng chứng, benchmark 20–30 ca, eval thật lượt 1, spec §0–§7 và video minh chứng 30 giây. |
| CP4 · 14:30 ngày 28/11 | Eval lượt 2, báo cáo chi phí, spec hoàn chỉnh, slide PDF và video dự phòng. |
| Sau CP4 · 23:59 ngày 28/11 | Changelog, bốn reflection và repo bản cuối. |

## Thiết kế đã bàn giao

- [Luồng và wireframe UI](../docs/ui-wireframes.md).
- [Hợp đồng OpenAPI và JSON mẫu](../docs/openapi.json).
- [Tiêu chí đánh giá CP2 trong spec §7](../spec.md).

## Kiến trúc tích hợp

~~~mermaid
flowchart LR
    U["UI của Long"] --> A["HTTP /api/courses của Đạo"]
    A --> W["Workflow AI dùng chung của An"]
    W --> S["Nguồn web"]
    W --> M["Model"]
    A <--> D["SQLite"]
    E["CLI và eval"] --> W
~~~

- Backend xác thực form và chuẩn hóa phản hồi HTTP. Chỉ lưu khóa sau khi có bài và ID nguồn hợp lệ. Danh sách và trang chi tiết đọc lại bản đã lưu.
- Workflow AI giữ entry point answer(text) cho eval. Đạo và An dùng một cách chuyển các trường form sang đầu vào của workflow. Quy tắc xây nội dung và chọn nguồn nằm ở An.
- Giao diện dựng từ example trong OpenAPI. Long chọn stack và báo Đạo cách chạy giao diện. Đạo giữ điểm vào python run.py cho bản tích hợp.
- Kết quả thử dùng dữ liệu mẫu có nhãn trên UI. Với model và tìm kiếm thật, ghi rõ chế độ trong phản hồi và xác nhận bằng `python run.py eval --try`.

## Thứ tự ghép

1. Long dựng form và trang bài từ example. Đạo dựng endpoint, xác thực và lớp lưu bằng fixture. An kiểm tra model, tìm kiếm thật và thử schema bằng dữ liệu mẫu. Bảo phỏng vấn song song với mở rộng bộ câu thử.
2. Long nối endpoint mẫu của Đạo khi DAO-01 và DAO-05 sẵn sàng. Bảo nghiệm thu form, nguồn và đường đi lỗi.
3. An bàn giao workflow thật, Đạo ghép POST và hai GET, Long kiểm lại trên UI. An chạy eval thử để Bảo chấm, đối chiếu nguồn và nghiệm thu demo. Sau mốc đó mới quyết định video.

## Hai điểm kiểm soát

- **Ghép mock.** Tạo được khóa mẫu từ form, có mã nguồn mở được và UI hiển thị ca thiếu nguồn, không mất dữ liệu khi chỉnh tiếp.
- **Ghép thật.** Một lần tạo dùng tìm kiếm và model thật, trả bài 1 có nguồn đối chiếu được. Tải lại vẫn mở được khóa. Một ca ngoài phạm vi hoặc thiếu nguồn hiện đúng. Chạy python run.py check và python run.py eval --try.

[Bảng task và điều kiện bàn giao](todo.md)
