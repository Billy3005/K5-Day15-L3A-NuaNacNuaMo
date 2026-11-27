# Wireframe luồng tự học

Giao diện trình bày lộ trình như một mục lục bài học. Người dùng thấy ngay bài có thể bắt đầu hôm nay và nguồn đứng cạnh thông tin cần kiểm chứng. Đây là thiết kế bàn giao cho Long. Long tự chọn stack frontend.

## 1. Tạo lộ trình

~~~text
Lộ trình tự học                         Khóa đã lưu

Bạn muốn học gì?
[ Dùng ví dụ SQL ]

Bạn đang là ai?       [ Sinh viên                  v ]
Chủ đề                [ SQL                          ]
Mục tiêu              [ Phân tích doanh thu         ]
Trình độ hiện tại     [ Biết Excel, mới học SQL     ]
Phút học mỗi ngày     [ 20                           ]

                                      [ Tạo lộ trình ]
~~~

- Danh sách nhóm người học có THCS, THPT, sinh viên và người đi làm. Trình độ được nhập riêng. “Dùng ví dụ SQL” điền dữ liệu để người dùng chỉnh sửa.
- Nút “Tạo lộ trình” gửi form khi đủ trường và thời lượng hợp lệ. Khi đang chờ, khóa nút tạo để tránh gửi trùng và giữ giá trị form nếu có lỗi.
- Nội dung chính căn trái, form rộng khoảng 560 px. Trên điện thoại các trường xếp dọc. Đặt lỗi cạnh trường tương ứng và đưa focus vào lỗi đầu tiên.

## 2. Lộ trình và bài đầu tiên

~~~text
Lộ trình tự học                         Khóa đã lưu

SQL để phân tích doanh thu                   20 phút/ngày

Lộ trình 5 ngày               Bài 1 · Đọc và lọc một bảng
  Ngày 1  Đọc và lọc          Mục tiêu bài
  Ngày 2  Sắp xếp              Giải thích SELECT và WHERE [S1]
  Ngày 3  Tổng hợp             Ví dụ
  Ngày 4  Nối bảng             Bài tập nhỏ
  Ngày 5  Làm báo cáo
                              Nguồn [S1] · PostgreSQL
                              [ Xem đoạn đối chiếu ] [ Mở nguồn ]
~~~

- Mở sẵn bài 1. Ngày 2–5 chỉ hiển thị tiêu đề và mục tiêu trong lộ trình. Chạm mã nguồn sẽ mở đoạn đối chiếu và đưa focus tới tiêu đề nguồn. Link mở trang gốc là một thao tác riêng.
- Desktop dùng cột lộ trình khoảng 240 px và cột bài đọc rộng tối đa khoảng 70 ký tự. Điện thoại đặt lộ trình gập được phía trên bài. Nội dung ngoài có thể xuống hàng, gồm URL và khối code.
- Dùng “Bản thử dữ liệu mẫu” cạnh tiêu đề khi mode hoặc source_mode là mock. Màn hình luôn hiện trạng thái nguồn theo dữ liệu trả về.

## 3. Khóa đã lưu

~~~text
Khóa đã lưu                              [ Tạo lộ trình ]

SQL để phân tích doanh thu                    [ Mở khóa ]
Git để làm bài nhóm                           [ Mở khóa ]
~~~

- Nếu rỗng, hiện “Bạn chưa có khóa nào” và nút “Tạo lộ trình”.
- “Mở khóa” mở lại kết quả lưu với cùng ID. Nếu nhận 404, hiện “Không tìm thấy khóa này” và đường về danh sách.

## 4. Trạng thái và thông điệp

| Trạng thái | Nội dung hiển thị | Hành động |
|---|---|---|
| Đang tạo | Đang tìm nguồn và soạn bài… | Giữ form và chờ phản hồi. |
| CLARIFICATION_REQUIRED | Dùng câu hỏi làm rõ từ server. | Focus vào mục tiêu để người dùng bổ sung. |
| INSUFFICIENT_SOURCES | Chưa đủ nguồn cho mục tiêu này. | Thu hẹp mục tiêu hoặc thử chủ đề gần hơn. |
| OUT_OF_SCOPE / REFUSED | Dùng giải thích và gợi ý từ server. | Sửa chủ đề trên form đang mở. |
| INVALID_INPUT | Hiện chỉ dẫn cạnh trường không hợp lệ. | Sửa trường và gửi lại. |
| UPSTREAM_UNAVAILABLE hoặc mất mạng | Chưa tạo được lộ trình. | Cho thử lại bằng thao tác rõ ràng, giữ form. |

## 5. Hướng thị giác

Bảng mục lục và trích dẫn là hai dấu hiệu chính của giao diện. Dùng **Source Sans 3**, có fallback sans-serif. Chữ nội dung 16–18 px, tựa bài 28–32 px. Nền #F5F7FB, nền trang đọc #FFFFFF, chữ #172334, xanh thao tác #234FA0, viền #C9D3E4, lỗi #9E2A37. Trạng thái luôn có nhãn chữ và focus rõ cho bàn phím.

Hợp đồng dữ liệu và các response mẫu ở [OpenAPI](openapi.json). Thứ tự triển khai và nghiệm thu ở [bảng task](../tasks/todo.md).
