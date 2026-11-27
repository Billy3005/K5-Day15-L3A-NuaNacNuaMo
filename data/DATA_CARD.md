# Data card — dữ liệu bản chạy thử dùng

## 1. Nguồn tài liệu cho mock CP2

| Trường | Nội dung |
|---|---|
| Công dụng | search_web đọc data/mock_resources.json để kiểm luồng tra cứu, trích dẫn và soạn bài. |
| Nguồn | PostgreSQL Documentation, Pro Git và OpenStax. URL cụ thể nằm cạnh từng đoạn. |
| Xử lý | Viết lại kiến thức cốt lõi bằng tiếng Việt. Gán ID và từ khóa truy xuất. Thêm tiêu đề lộ trình, ví dụ và bài tập mô phỏng do nhóm soạn. |
| Quy mô | 3 mục theo chủ đề SQL, Git và xác suất. |
| Phiên bản | 27/11/2026 · CP2. |
| Nhãn | Nguồn công khai thật, dữ liệu bài và kết quả tra cứu mô phỏng. |
| Giới hạn | Dữ liệu chọn tay dùng để kiểm tích hợp, chưa đại diện toàn bộ 10 lĩnh vực. Kết quả chấm mock độc lập được ghi trong eval/README.md. |

## 2. Benchmark CP2

Bộ CP2 trong [benchmark.csv](../eval/benchmark.csv) gồm 12 ca từ B01 đến B12. B01, B02, B03, B05 và B06 là bản diễn đạt tiếng Việt từ câu hỏi công khai. Thời lượng và bối cảnh bổ sung là tham số thử do nhóm đặt. Cột source trỏ tới bài gốc. Bảy câu còn lại do nhóm soạn để bao phủ lĩnh vực, thiếu nguồn, mơ hồ và từ chối. Các câu thử không chứa tên tài khoản, ID cá nhân hoặc nội dung riêng tư.

Nguồn câu hỏi công khai minh họa nhu cầu tự học và mức kiến thức nền. Phạm vi người dùng sinh viên, tần suất gặp vấn đề và số phút mất cần xác minh bằng phỏng vấn. Các câu thử thuộc một vài nhóm trong 10 lĩnh vực, nên kết quả không suy rộng thành độ phủ toàn bộ.

## 3. Benchmark CP3

CP3 giữ nguyên B01–B12 và thêm B13–B30. B13–B16 và B21–B25 chuyển thể từ chín câu hỏi công khai có URL trong `source`. Nhóm người học, thời lượng và số liệu ví dụ điều chỉnh là tham số thử do nhóm đặt. B17–B20 và B26–B30 do nhóm soạn, gồm tình huống thiếu thông số, sửa thời lượng, nguồn không liên quan, yêu cầu dữ liệu cá nhân và chỉ dẫn bỏ trích dẫn.

Tổng cộng 30 câu. Mười bốn câu dựa trên bài hỏi đáp công khai, mười sáu câu do nhóm soạn. Mục đích là đánh giá độ phù hợp, trích dẫn và xử lý giới hạn. Nguồn công khai của bộ thử chưa xác nhận tần suất hay thời gian mất của nhóm sinh viên mục tiêu.
