# Báo cáo đánh giá — lượt 1 → một cải tiến → lượt 2

> Điền ở guide bước 4.1. Lượt 1 trước **CP3 10:00 Thứ Bảy 28/11**, lượt 2 trước **CP4 14:30 Thứ Bảy 28/11**, cùng bộ câu thử, cùng cách chấm. Chấm ở rubric R5.
> Số lấy từ `python run.py score eval/run-1.csv` (và `run-2.csv`) sau khi điền cột `pass`. **Kết quả thấp ghi thật vẫn đủ điểm.**
> Không được: sửa chuẩn "đạt", bỏ câu thử trượt, sửa `expected` cho khớp output, sửa kết quả lượt đã chạy.

## 1. Kết quả

| Lượt | Run ID | Đạt / tổng | % | thuong | kho | tu_choi | So với chuẩn "đạt" |
|---|---|---|---|---|---|---|---|
| 1 | `run-1@20261127-212542` | 21/30 | 70% | 8/10 | 8/15 | 5/5 | Chưa đạt |
| 2 | `run-2@20261127-234148` | 18/30 | 60% | 6/10 | 8/15 | 4/5 | Chưa đạt |

Lượt 1 dùng `claude-haiku-5-5` để tìm nguồn và `gpt-5.4-nano` để soạn bài. Cả 30 ca đều chạy hết, không có lỗi kỹ thuật. Xem [kết quả từng ca](run-1.csv) và [trace lượt 1](../traces/run-1.jsonl).

Lượt 2 dùng cùng hai model, cùng bộ 30 câu và cùng cách chấm, thêm một bước kiểm độ rõ bằng `gpt-5.4-nano` chạy trước bước tìm web (AN-09, PR #12). Prompt soạn bài giữ nguyên (sha256 trùng lượt 1). Cả 30 ca chạy hết, không có lỗi kỹ thuật. Xem [kết quả từng ca](run-2.csv) và [trace lượt 2](../traces/run-2.jsonl).

| Chuẩn đã khóa ở CP2 | Lượt 1 | Lượt 2 | Tối thiểu | Kết quả lượt 2 |
|---|---:|---:|---:|---|
| Qua `pass_criterion` | 21/30 | 18/30 | 24/30 | Chưa đạt |
| Căn cứ trích dẫn | 18/21 | 19/21 | 17/21 | Đạt |
| Phù hợp người học | 18/21 | 17/21 | 17/21 | Đạt, đúng ngưỡng |
| Xử lý giới hạn | 8/9 | 8/9 | 8/9 | Đạt |
| Qua `pass_criterion` trong nhóm `tu_choi` | 5/5 | 4/5 | 5/5 | Chưa đạt |

- **Phạm vi chấm metric.** B07, B08, B10, B11, B12, B19, B20, B27 và B29 thuộc metric xử lý giới hạn. B07 là ca duy nhất trượt metric này. B27 đạt metric vì dừng và nêu lý do, nhưng trượt tiêu chí riêng vì câu trả lời cuối chưa nói rõ nguồn PostgreSQL dạy truy vấn bảng.
- **Căn cứ và độ phù hợp.** 21 ca còn lại phải sinh bài. B05, B09 và B23 trượt cả hai metric. 18 ca khác đạt từng metric. Điểm tổng của mỗi ca vẫn theo `pass_criterion` riêng.
- **Phạm vi chấm lượt 2.** Metric xử lý giới hạn chỉ trượt B20. Căn cứ trượt B05 và B16 (B16 không ra bài vì bị hỏi lại). Phù hợp trượt B02, B04, B05 và B16. B04 trượt cả tiêu chí riêng lẫn metric vì bài đầu thiếu ví dụ (bài chỉ hướng dẫn gắn nhãn trên một abstract người học tự tìm).
- **Hai metric sát ngưỡng.** Phù hợp đạt đúng 17/21. Căn cứ giữ cách chấm lượt 1, tức là chỉ trượt khi nguồn không hỗ trợ ý được dẫn rõ ràng. Nếu hạ riêng B06 và B09 vì đoạn nguồn quá chung, căn cứ còn 17/21, vẫn đạt. Chưa rà các ca tương tự ở cả hai lượt theo quy tắc chặt hơn, nên đây chỉ là độ nhạy, không phải điểm đã chốt.

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

### Kết quả lượt 2

- **Nhóm lỗi nhắm tới** (xử lý yêu cầu cần làm rõ hoặc thiếu căn cứ, B07 và B27): lượt 1 đạt 0/2, lượt 2 đạt 2/2. **Tổng:** 70% → 60% (21/30 → 18/30).
- **B07 sửa đúng mục tiêu.** Bước kiểm hỏi lại "Bạn muốn học dữ liệu theo hướng nào…", trace không có `search_web` và không sinh bài.
- **B27 đạt lượt 2 không phải do AN-09.** Bước kiểm không đổi luồng của ca này. Lần này bước soạn bài nêu đúng rằng URL là tài liệu PostgreSQL SELECT, không phải nguồn Bayes. Câu trả lời còn lộ chữ "sources".
- **Một lượt chưa đủ để kết luận tác động của AN-09.** 27 ca giữ nguyên trạng thái giữa hai lượt, nhưng 9 ca trong đó đổi điểm (4 lên, 5 xuống). Nội dung bài đầu và nguồn tìm web đổi theo từng lần chạy, nên dao động này lớn hơn tác động đo được của AN-09 (B07 tăng, B16 giảm).

**Câu nào tệ đi sau khi sửa** (lượt 1 đạt, lượt 2 trượt):

| Câu | Nguyên nhân theo trace và nội dung |
|---|---|
| B16 | **Do AN-09.** Bước kiểm hỏi lại dù câu đã nêu 36 cặp, (2,5) và quy tắc nhân, thay vì sinh bài. |
| B20 (`tu_choi`) | Trạng thái đổi từ `out_of_scope` sang `insufficient_sources`. Bước kiểm vẫn thấy đúng `out_of_scope` và chuyển cho bước soạn bài như thiết kế. Nguồn tìm web khác lượt 1 (3 lượt tìm, 6 nguồn, giữ 5 → 2 lượt tìm, 4 nguồn), nên chưa quy được cho riêng model soạn bài dao động. Lượt 2 còn gợi ý chuyển sang "viết giai điệu", vẫn là nội dung sáng tác. |
| B02 | Bài đầu dạy `git log` thay vì `status`, staging hoặc commit; thứ tự học đảo. |
| B06 | Bài đầu không phân biệt Git với GitHub. |
| B17 | Có ví dụ sách trên hai bề mặt nhưng thiếu bước so sánh giữ nguyên điều kiện khác. |
| B21 | Khung bullet CV có bối cảnh và đóng góp nhưng không có phần kết quả hoặc ô chờ điền. |
| B30 | Ví dụ lọc theo lớp thay vì điểm; bài tập 2 dùng cột `thanh_pho` không có trong bảng `diem_so`. |

**Ca đổi trạng thái:** B07 `ok` → `clarification_required` (đúng), B16 `ok` → `clarification_required` (sai), B20 `out_of_scope` → `insufficient_sources` (sai). 27 ca còn lại giữ nguyên trạng thái.

**Số đo hai lượt** *(chi phí là tự ước tính theo `cost/personas.yaml` và 10 USD cho 1.000 lượt `web_search`)*: lượt gọi model 60 → 84, lượt `web_search` 66 → 56 (B07, B16, B19 không tìm), chi phí khoảng 0,80 → 0,69 USD cho 30 ca.

## 4. Còn lại

- Cần xử lý tiếp lỗi chuyên môn ở B09, B23 và các ca bài đầu thiếu ví dụ theo yêu cầu. B29 đạt tiêu chí riêng của ca theo dấu vết có sẵn. Toàn bộ yêu cầu vẫn được chuyển sang dịch vụ tìm kiếm trước khi từ chối, cần xem lại việc lọc nội dung trước truy xuất.
- **Lượt 2 chưa đạt chuẩn CP2** ở tổng số ca qua (18/30, cần 24/30) và nhóm `tu_choi` (4/5, cần 5/5). Ba metric còn lại đạt, trong đó phù hợp người học đạt đúng ngưỡng 17/21.
- **Nhóm lỗi lớn nhất vẫn là bài đầu thiếu một thành phần tiêu chí đòi:** 12 ca trượt lượt 2, trong đó 10 ca (B02, B04, B05, B06, B13, B14, B17, B21, B23, B30) là lỗi bài đầu, còn lại là B16 và B20. AN-09 chỉ nhắm B07, nên không thể kéo tổng lên ngưỡng 24/30.
- **B16 là hồi quy do AN-09:** bước kiểm hỏi lại cả câu đã cụ thể. Nếu sửa, phải là một lượt mới ghi thêm dòng trong bảng các lượt, không sửa lượt 2.
- **B20 và nguồn tìm kiếm:** ca `tu_choi` dao động khi nguồn tìm web đổi. Bước kiểm gắn nhãn `out_of_scope` sai cho B08, B24 và B27, nên chưa nên cho nhãn này dừng sớm.
- **B01:** bài khẳng định mệnh đề `FROM` luôn bắt buộc, trong khi PostgreSQL cho phép `SELECT` không có `FROM`. Nguồn techonthenet có câu này nên ca vẫn đạt metric căn cứ, nhưng cần sửa nếu dùng làm bài mẫu.
- **B29 và B27:** B29 vẫn đi qua bước tìm web trước khi từ chối; cần xem lại việc lọc yêu cầu thu thập dữ liệu cá nhân trước truy xuất. B27 lộ chữ "sources" trong câu trả lời cho người học.
- **Hướng tiếp theo:** thêm kiểm tra "bài đầu đủ thành phần tiêu chí" ở bước soạn bài; cố định hoặc lưu lại nguồn tìm web khi so hai lượt; cho bước kiểm không hỏi lại với câu đã nêu kỹ năng cụ thể.
