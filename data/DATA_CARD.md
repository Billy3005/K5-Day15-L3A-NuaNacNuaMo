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
| Giới hạn | Dữ liệu chọn tay, không đại diện toàn bộ 10 lĩnh vực. Nội dung mô phỏng dùng để kiểm tích hợp. Việc người thứ hai kiểm độc lập đang chờ. |

## 2. Benchmark CP2

[benchmark.csv](../eval/benchmark.csv) có 12 ca. B01, B02, B03, B05 và B06 là bản diễn đạt tiếng Việt từ câu hỏi công khai. Thời lượng và bối cảnh bổ sung là tham số thử do nhóm đặt. Cột source trỏ tới bài gốc. Bảy câu còn lại do nhóm soạn để bao phủ lĩnh vực, thiếu nguồn, mơ hồ và từ chối. Các câu thử không chứa tên tài khoản, ID cá nhân hoặc nội dung riêng tư.

Nguồn câu hỏi công khai minh họa nhu cầu tự học và mức kiến thức nền. Phạm vi người dùng sinh viên, tần suất gặp vấn đề và số phút mất cần xác minh bằng phỏng vấn. Các câu thử thuộc một vài nhóm trong 10 lĩnh vực, nên kết quả không suy rộng thành độ phủ toàn bộ.
