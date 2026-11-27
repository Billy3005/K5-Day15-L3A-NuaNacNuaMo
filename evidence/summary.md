# Tổng hợp bằng chứng pain

> Điền ở guide bước 1.2, xong trước **CP3 10:00 Thứ Bảy 28/11**. Chấm ở rubric R1.
> Ba nguồn ngang nhau — tối thiểu **≥1 nguồn đạt ngưỡng**. Mạnh nhất: đào data ra insight → hỏi người dùng để kiểm lại (hoặc ngược lại).

## Tín hiệu công khai tại CP2

Đã đọc 5 bài hỏi đáp công khai được chọn theo mục tiêu tự học SQL, Git và xác suất. Đây là mẫu chủ đích để tìm tín hiệu và xây ca thử. Chưa xác định tác giả thuộc vai sinh viên mục tiêu hay đo được tần suất và số phút mất.

| Ca | Tín hiệu quan sát | Nguồn gốc |
|---|---|---|
| B01 | Người mới tìm hướng bắt đầu học SQL. | [SQL nhập môn](https://stackoverflow.com/questions/110124/tips-for-getting-started-with-sql) |
| B02 | Người học muốn có hướng dẫn Git thực hành từ đầu. | [Git cho người mới](https://stackoverflow.com/questions/315911/git-for-beginners-the-definitive-practical-guide) |
| B03 | Tài liệu tự học xác suất nhảy nhanh sang kiến thức giải tích. | [Tự học xác suất](https://stats.stackexchange.com/questions/15692/probability-theory-books-for-self-study) |
| B05 | Đọc lại bài SQL sau quãng nghỉ nhưng vẫn vướng khi làm bài tập. | [SQL và bảng quan hệ](https://stackoverflow.com/questions/68092032/beginner-sql-question-trying-to-search-for-users-who-belong-into-same-group) |
| B06 | Người dùng Windows chưa rõ cần học Linux, Bash hay SSH trước Git. | [Kiến thức tiên quyết của Git](https://stackoverflow.com/questions/9715410/what-are-pre-requisites-for-learning-understanding-git) |

Một người hỏi mô tả tài liệu rằng “it takes a sudden leap and I am left wondering what I should have known”. [Bình luận trong bài về tự học xác suất](https://stats.stackexchange.com/questions/15692/probability-theory-books-for-self-study)

## 1. Nguồn đã dùng

| Nguồn | Đạt ngưỡng? | File |
|---|---|---|
| Đào data (x/N, %, cách đếm chạy lại được, ≥5 ví dụ) | ☐ | `evidence/data-mining.md` |
| Phỏng vấn (≥3 người ngoài nhóm, đúng người dùng) | ☐ | `evidence/interviews/P1.md`… |
| Khảo sát (≥20 người ngoài nhóm, đúng người dùng) | ☑ 28/32 phiếu khớp mục đích học của đối tượng được mời. Đội trưởng xác nhận cả 28 đến từ người ngoài nhóm. | [Câu hỏi và cách thu](survey/questions.md) · [Kết quả ẩn danh](survey/results.csv) |

## 2. Số chính

**Cách đếm.** Trong 32 phiếu, lấy 28 phiếu chọn làm bài tập, làm dự án hoặc cả hai ở câu 1. Trong 28 phiếu đó, ghi nhận trở ngại chính theo câu 4. Nhóm trở ngại liên quan trực tiếp đến lát cắt gồm chưa biết bắt đầu, khó tìm hoặc chọn tài liệu và chưa biết nguồn nào đáng tin. Giữ phiếu “Không nhớ” trong mẫu tổng và ghi riêng khi tính trung vị.

| Kết quả trong nhóm 28 phiếu | Số phiếu |
|---|---:|
| Trở ngại chính thuộc ba vấn đề của lát cắt | **19/28 (67,9%)** |
| Chưa biết bắt đầu từ đâu | 10/28 (35,7%) |
| Khó tìm hoặc chọn tài liệu | 5/28 (17,9%) |
| Chưa biết nguồn nào đáng tin | 4/28 (14,3%) |
| Tài liệu quá khó hoặc thiếu kiến thức nền | 5/28 (17,9%) |
| Lý do khác | 1/28 (3,6%) |
| Không gặp trở ngại | 3/28 (10,7%) |
| Chưa bắt đầu làm thử | 6/28 (21,4%) |
| Chuẩn bị từ 16 phút trở lên | 18/28 (64,3%) |

Nguồn xem đầu tiên gồm AI/chatbot 10/28, video 8/28, bài viết hoặc tài liệu 5/28, hỏi người khác 2/28, nguồn khác 1/28 và chưa xem hoặc không nhớ 2/28. Trong 19 phiếu có trở ngại chính liên quan trực tiếp, trung vị thời gian chuẩn bị nằm trong khoảng **16–30 phút** và trung vị tần suất trong 30 ngày nằm trong khoảng **2–3 lần**. Mỗi chỉ số có 18 câu nhớ được giá trị. Câu hỏi thời gian đo toàn bộ khâu chuẩn bị lần gần nhất, nên chưa đo được số phút lãng phí hoặc mức tiết kiệm của sản phẩm.

## 3. ≥5 trích dẫn hoặc ví dụ nguyên văn (có nguồn, bỏ tên)

1. “Tôi tìm thông tin về model AI mới nhất cho dataset dạng bảng, nhưng quá nhiều thông tin, bằng tiếng anh và thuật ngữ khó hiểu.” — S05.
2. “Học Python xử lý dữ liệu, đọc tài liệu thấy nhiều thuật ngữ lạ nên dừng lại tra cứu thêm.” — S11.
3. “Học tiếng Anh viết email học thuật, lướt nhiều trang mà không biết trang nào chuẩn nên chưa bắt đầu.” — S13.
4. “Học lập trình Arduino cho mô hình nhà thông minh, hỏi chatbot nhưng các linh kiện gợi ý khác nhau nên chưa mua.” — S19.
5. “Học hóa hữu cơ phản ứng este, xem nhiều video giải thích khác nhau rồi đối chiếu với giáo trình.” — S28.

Các trích dẫn lấy nguyên văn từ câu 7 trong [kết quả ẩn danh](survey/results.csv). Toàn bộ mẫu có 24 câu tự do, trong đó 21 thuộc nhóm 28 phiếu cùng mục đích học.

## 4. Các nguồn có khớp nhau không

Mẫu khảo sát và thảo luận công khai cùng cho thấy việc cần kiến thức tiên quyết và biết bắt đầu từ đâu. Khảo sát bổ sung số liệu về tìm và kiểm nguồn. Một số trở ngại không nằm trong lát cắt, chẳng hạn S23 kể máy chạy chậm. Chưa có phỏng vấn độc lập để kiểm lại mức độ gặp trở ngại trong đúng nhóm sinh viên ngoài nhóm.

## 5. Kết luận

**Tín hiệu ủng hộ giả thuyết.** 19/28 phiếu đúng mục đích học chọn một trong ba trở ngại mà sản phẩm nhắm tới. “Không biết bắt đầu từ đâu” là lựa chọn phổ biến nhất, nên giữ lộ trình và bài đầu có nguồn làm ưu tiên demo. Mẫu tự khai và chủ đích, chưa suy rộng sang toàn bộ sinh viên. Tình trạng ngoài nhóm do đội trưởng xác nhận. Vai trò sinh viên căn theo đối tượng được mời trong form, vì phiếu không có trường hỏi riêng. Cần đo thử để biết sản phẩm giảm được bao nhiêu phút.

## Lịch hẹn (dùng cho CP2 — chỉ ghi vai và giờ, không tên)

| Vai | Giờ hẹn | Đã xong? |
|---|---|---|
| | | |
