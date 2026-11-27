# Báo cáo đánh giá — lượt 1 → một cải tiến → lượt 2

> Điền ở guide bước 4.1. Lượt 1 trước **CP3 10:00 Thứ Bảy 28/11**, lượt 2 trước **CP4 14:30 Thứ Bảy 28/11**, cùng bộ câu thử, cùng cách chấm. Chấm ở rubric R5.
> Số lấy từ `python run.py score eval/run-1.csv` (và `run-2.csv`) sau khi điền cột `pass`. **Kết quả thấp ghi thật vẫn đủ điểm.**
> Không được: sửa chuẩn "đạt", bỏ câu thử trượt, sửa `expected` cho khớp output, sửa kết quả lượt đã chạy.

## 1. Kết quả

| Lượt | Run ID | Đạt / tổng | % | thuong | kho | tu_choi | So với chuẩn "đạt" |
|---|---|---|---|---|---|---|---|
| 1 | `run-1@20261127-212542` | 21/30 | 70% | 8/10 | 8/15 | 5/5 | Chưa đạt |
| 2 | | __/__ | | __/__ | __/__ | __/__ | đạt / chưa |

Lượt 1 dùng `claude-haiku-5-5` để tìm nguồn và `gpt-5.4-nano` để soạn bài. Cả 30 ca đều chạy hết, không có lỗi kỹ thuật. Xem [kết quả từng ca](run-1.csv) và [trace lượt 1](../traces/run-1.jsonl).

| Chuẩn đã khóa ở CP2 | Lượt 1 | Tối thiểu | Kết quả |
|---|---:|---:|---|
| Qua `pass_criterion` | 21/30 | 24/30 | Chưa đạt |
| Căn cứ trích dẫn | 18/21 | 17/21 | Đạt |
| Phù hợp người học | 18/21 | 17/21 | Đạt |
| Xử lý giới hạn | 8/9 | 8/9 | Đạt |
| Qua `pass_criterion` trong nhóm `tu_choi` | 5/5 | 5/5 | Đạt |

- **Phạm vi chấm metric.** B07, B08, B10, B11, B12, B19, B20, B27 và B29 thuộc metric xử lý giới hạn. B07 là ca duy nhất trượt metric này. B27 đạt metric vì dừng và nêu lý do, nhưng trượt tiêu chí riêng vì câu trả lời cuối chưa nói rõ nguồn PostgreSQL dạy truy vấn bảng.
- **Căn cứ và độ phù hợp.** 21 ca còn lại phải sinh bài. B05, B09 và B23 trượt cả hai metric. 18 ca khác đạt từng metric. Điểm tổng của mỗi ca vẫn theo `pass_criterion` riêng.

## 2. Lỗi lượt 1 — gom thành nhóm có tên

| Nhóm lỗi | Số câu | Câu |
|---|---|---|
| Bài đầu sai hoặc thiếu nội dung cần dạy | 6 | B09, B13, B14, B15, B23, B28 |
| Thứ tự kiến thức và căn cứ trích dẫn | 1 | B05 |
| Xử lý yêu cầu cần làm rõ hoặc thiếu căn cứ | 2 | B07, B27 |

**≥3 lỗi cụ thể:**

| Câu | Input | Output | Vì sao sai |
|---|---|---|---|
| B07 | Muốn học về dữ liệu | Tự chọn phân tích dữ liệu và sinh lộ trình 5 ngày | Chưa rõ kỹ năng hoặc mục tiêu sử dụng. Cần hỏi một câu làm rõ và dừng. |
| B09 | Học Excel để theo dõi chi phí triển lãm | Dạy rằng SUMIF/SUMIFS phân biệt `Rent` và `rent` | Sai hành vi của hàm Excel, nên có thể khiến người học chẩn đoán sai nguyên nhân tổng bị lệch. |
| B23 | Hiểu các phần của xung đột Git dạng diff3 | Gán toàn bộ phần giữa marker HEAD và dấu bằng cho nhánh hiện tại | Vùng này gồm cả bản gốc chung sau marker dòng gạch đứng. Người học có thể giữ nhầm nội dung. |
| B27 | Học Bayes với URL PostgreSQL duy nhất | Báo thiếu căn cứ, nhưng chưa nói nguồn nói về truy vấn bảng | Bước tìm nhận ra chủ đề của URL, còn đầu ra cuối chỉ nói không có đoạn trích. |

## 3. Một lần cải tiến

**BAO-08 bàn giao cho AN-09: hỏi lại khi người học chỉ nêu chủ đề rộng.**

- **Ca ưu tiên B07.** Người học chỉ nói “Tôi muốn học về dữ liệu.” Trace cho thấy tìm web hai lượt, giữ ba nguồn rồi model tự chọn phân tích dữ liệu và trả `ok`. Prompt đã yêu cầu hỏi lại khi thiếu mục tiêu, nhưng `answer()` hiện tìm nguồn trước khi kiểm đủ thông tin. Các nguồn chung đi vào bước soạn bài. Trace xác nhận thứ tự này, còn mức ảnh hưởng của nguồn đến quyết định cần kiểm chứng sau khi sửa.
- **Tác động.** Người học nhận cả lộ trình cho một kỹ năng do hệ thống chọn, đúng lúc họ cần trợ giúp xác định mục tiêu. Việc tìm nguồn quá sớm còn phát sinh chi phí cho một yêu cầu cần hỏi lại.
- **Thay đổi dự kiến.** AN-09 thêm bước kiểm trước tìm kiếm cho mục tiêu chưa đủ rõ. Dùng dấu hiệu chung của yêu cầu, không so khớp câu trong benchmark. Nếu thiếu kỹ năng hoặc mục tiêu đủ cụ thể, trả `clarification_required` với đúng một câu hỏi, không tạo bài, không gọi công cụ tìm web. Giữ luồng hiện tại cho yêu cầu đủ rõ.
- **Nghiệm thu.** B07 và một ví dụ mơ hồ tự soạn trả `clarification_required`. Trace không có `search_web`. B01 (SQL) và B09 (mục tiêu Excel rõ, bối cảnh triển lãm) vẫn đi vào luồng tạo bài. Kiểm này chỉ xác nhận cách định tuyến B09. Lỗi nội dung Excel được giữ riêng.
- **Bàn giao lượt 2.** An ghi cấu hình và thay đổi trong PR AN-09. AN-10 chạy lại đúng 30 ca với bộ tiêu chí hiện hành. BAO-09 đối chiếu điểm B07, tổng điểm và các ca giảm sau thay đổi.

## 4. Còn lại

- Cần xử lý tiếp lỗi chuyên môn ở B09, B23 và các ca bài đầu thiếu ví dụ theo yêu cầu. B29 đạt tiêu chí riêng của ca theo dấu vết có sẵn. Toàn bộ yêu cầu vẫn được chuyển sang dịch vụ tìm kiếm trước khi từ chối, cần xem lại việc lọc nội dung trước truy xuất.
- Kết quả cải tiến và các ca giảm sẽ được điền sau lượt 2.
