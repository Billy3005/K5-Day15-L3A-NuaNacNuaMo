# Script thuyết trình CP4: NewLearn

Khoảng **6 phút nói + 2 phút demo**. Bố cục đi theo 8 trang của [outline.md](outline.md). Mọi con số đều có nguồn trong repo, ghi ở cuối mỗi phần. Phần **[NÓI]** là lời gợi ý, nên nói theo giọng của mình, đừng đọc thuộc. Phần **[TRÊN SLIDE]** là thứ cần hiện trên màn hình.

> Nguyên tắc: mở bằng nỗi đau, giữ nỗi đau xuyên suốt, và nói thật về chỗ chưa đạt. Giám khảo chấm điểm cho sự trung thực ở phần eval và chi phí.

---

## 0. Mở màn: 20 giây

**[NÓI]**
> "Thứ Năm tuần sau nộp bài tập SQL. Tối nay bạn mở ChatGPT, hỏi 'học SQL bắt đầu từ đâu'. Nó trả lời rất tự tin. Bạn hỏi lại lần nữa thì ra một thứ tự khác. Bạn mở thêm năm tab Google để kiểm. Hai mươi phút trôi qua, bạn chưa học được dòng SQL nào và vẫn chưa biết nên tin nguồn nào.
>
> Đó không phải chuyện của riêng một người. Trong khảo sát của nhóm, cứ **3 sinh viên thì 2 người** kẹt ngay ở bước này."

**[TRÊN SLIDE]** Chỉ một dòng chữ lớn: **"19/28 sinh viên kẹt trước khi học được dòng đầu tiên."**

---

## 1. Người dùng và nỗi đau: 60 giây

**[NÓI]**
> "Người dùng của nhóm là sinh viên đang tự học một kỹ năng mới **để làm bài tập hoặc dự án**: có deadline, có mục tiêu cụ thể, không phải học cho vui.
>
> Nhóm khảo sát 28 sinh viên ngoài nhóm đang tự học vì đúng lý do đó. **19/28 người** nói trở ngại lớn nhất là một trong ba thứ: không biết bắt đầu từ đâu, không tìm được tài liệu vừa sức, hoặc không biết nguồn nào đáng tin. Trong đó 'không biết bắt đầu từ đâu' đứng đầu với 10 người.
>
> Cái giá phải trả: **18/28 người** mất từ 16 phút trở lên chỉ để chuẩn bị, trung vị 16 đến 30 phút mỗi lần, 2 đến 3 lần mỗi tháng. Và **6/28 người, lúc trả lời khảo sát, vẫn chưa bắt đầu làm thử**.
>
> Họ kể nguyên văn như sau."

**[NÓI, đọc chậm 2 câu]**
> "*Lướt nhiều trang mà không biết trang nào chuẩn nên chưa bắt đầu.*"
>
> "*Hỏi chatbot nhưng các linh kiện gợi ý khác nhau nên chưa mua.*"

**[TRÊN SLIDE]**
- 19/28 kẹt ở bước bắt đầu (10 không biết bắt đầu từ đâu · 5 khó chọn tài liệu · 4 không biết nguồn nào đáng tin)
- 18/28 mất ≥16 phút chuẩn bị · trung vị 16–30 phút/lần · 2–3 lần/tháng
- 6/28 chưa bắt đầu làm thử (tại thời điểm khảo sát; đừng ghi "bỏ cuộc", khảo sát không hỏi điều đó)
- 2 trích dẫn: S13 và S19

*Nguồn: [evidence/summary.md](../evidence/summary.md) §2–§3.*

---

## 2. Vì sao lại là ý tưởng này: 50 giây

Đây là insight quan trọng nhất. Nói chậm.

**[NÓI]**
> "Câu hỏi đầu tiên là: có ChatGPT rồi, sao còn kẹt?
>
> Số liệu trả lời câu hỏi đó. **10/28 người mở AI chatbot đầu tiên**, nhiều hơn mọi nguồn khác. Vậy mà **7 trong 10 người đó vẫn kẹt** ở đúng ba chỗ: không biết bắt đầu từ đâu, khó chọn tài liệu, không biết nguồn nào đáng tin. Lý do nằm ngay trong câu của bạn S19: *hỏi chatbot nhưng các gợi ý khác nhau*. Chatbot cho câu trả lời nhưng không cho **bằng chứng**. Người học không kiểm được, nên không dám bắt đầu.
>
> Google và YouTube thì ngược lại: có nguồn, nhưng là mười nguồn, mỗi nguồn một thứ tự và một độ khó. Người học phải tự làm việc khó nhất là chọn và xếp thứ tự.
>
> Vậy thứ còn thiếu không phải thêm thông tin. Thứ còn thiếu là **một điểm bắt đầu đã được sắp sẵn, vừa trình độ, vừa thời gian, mà mỗi câu đều kiểm được**. Nhóm làm đúng thứ đó."

**[TRÊN SLIDE]** Bảng 3 cột:

| | Chatbot | Google / YouTube | **NewLearn** |
|---|---|---|---|
| Có thứ tự học | Có, nhưng mỗi lần một kiểu | Không, tự xếp | **Có, 5 ngày** |
| Kiểm được từng ý | Không | Phải tự tìm | **Bấm mã nguồn ra đoạn trích nguyên văn** |
| Vừa thời gian, trình độ | Tùy prompt | Không | **Theo 5 thông tin người học nhập** |
| Khi không chắc | Vẫn trả lời tự tin | — | **Hỏi lại hoặc dừng và nói rõ** |

Tiêu đề phụ: **"7/10 người mở chatbot đầu tiên vẫn kẹt ở bước bắt đầu"**. Không viết "10/28 vẫn kẹt": trong 10 người đó có 2 người không gặp trở ngại và 1 người vướng vì tài liệu quá khó (đếm từ `evidence/survey/results.csv`).

Dòng nhỏ bên dưới: lộ trình kèm nguồn được làm trước vì có số liệu mạnh nhất. Kiểm tra nhanh và video làm sau khi luồng chính chạy thật, chưa đo mức độ cần. Chat RAG vẫn hoãn.

*Nguồn: [evidence/summary.md](../evidence/summary.md) §2 (nguồn xem đầu tiên), [spec.md](../spec.md) §2.*

---

## 3. Giải pháp: 40 giây

**[NÓI]**
> "NewLearn làm một việc. Bạn nhập 5 thông tin: mình là ai, học gì, để làm gì, đang ở trình độ nào, mỗi ngày có bao nhiêu phút. Hệ thống tìm nguồn công khai trên web, xếp **lộ trình 5 ngày** và soạn **bài hôm nay** vừa với số phút đó.
>
> Điểm khác là: **mỗi ý trong bài gắn một mã nguồn**. Bấm vào là thấy đoạn trích nguyên văn từ trang gốc. Mã nguồn không khớp thì bài không được xuất ra.
>
> Hệ thống cũng **biết lúc nào nên im**. Mục tiêu mơ hồ thì nó hỏi lại một câu. Không đủ nguồn thì nó nói rõ phần nào thiếu thay vì bịa. Ngoài phạm vi thì nó từ chối.
>
> AI chỉ đề xuất, người học quyết định. Vì vậy nhóm đặt nguồn ngay cạnh từng câu để người học tự kiểm."

**[TRÊN SLIDE]** Sơ đồ luồng trong [spec.md](../spec.md) §4: *Mục tiêu → tìm nguồn → AI soạn → kiểm mã nguồn → bài + nguồn / hỏi lại / dừng*. Ghi chú: `claude-haiku-5-5` tìm web, `gpt-5.4-nano` soạn bài.

---

## 4. Demo: 2 phút

**Trước khi lên:** máy demo đã mở `http://127.0.0.1:8000` và đã gọi thử một lượt trong vòng một giờ. Video dự phòng mở sẵn ở một tab ẩn danh: https://www.youtube.com/watch?v=niXCVS9TFCc

**Ca thường, live (khoảng 20 giây chờ AI):**
1. Tạo lộ trình → **"Dùng ví dụ SQL"**.
   > "Sinh viên, SQL, phân tích doanh thu cho bài tập nhóm, biết Excel, 20 phút mỗi ngày."
2. Bấm **Tạo lộ trình**. Trong lúc chờ:
   > "Hệ thống đang tìm nguồn thật trên web rồi mới soạn. Không có dữ liệu soạn sẵn."
3. Khi bài hiện ra, chỉ vào hai nhãn **"Bài soạn: model AI"** và **"Nguồn: tìm trên web"**.
4. Bấm **S1**.
   > "Đây là thứ chatbot không cho: đoạn trích nguyên văn, kèm link trang gốc."
5. Nếu còn thời gian, mở tab **Kiểm tra** hoặc **Video**.
   > "Cũng từ đúng bài này, có 5 câu kiểm tra nhanh và một video tóm tắt, mỗi câu và mỗi cảnh đều gắn nguồn."

**Ca khó (chọn một):**
- *Hỏi lại (B07):* gõ mục tiêu "Tôi muốn học về dữ liệu" → hệ thống hỏi lại đúng một câu và không tìm web.
- *Thiếu nguồn (B08 / Lam-7):* mục tiêu là tài liệu nội bộ chưa công khai → hệ thống báo thiếu nguồn, form giữ nguyên.

**Mạng lỗi:** chuyển ngay sang video dự phòng.
> "Đây là bản quay trên chính máy này."

*Mỗi lượt tạo thật tốn khoảng $0,025 (tự ước tính từ 30 ca eval lượt 2), nên chỉ chạy một hoặc hai ca.*

---

## 5. Đánh giá thế nào: 60 giây

Đây là trang dễ bị hỏi nhất. Nói thẳng, không né.

**[NÓI]**
> "Nhóm chốt chuẩn 'đạt' **trước khi** chạy model thật, ở CP2: ít nhất 80% câu qua tiêu chí, mỗi metric ít nhất 80%, và 100% câu cần từ chối phải từ chối đúng. Bộ thử có 30 câu: 10 thường, 15 khó, 5 cần từ chối. 14 câu dựng từ câu hỏi thật của người học.
>
> Lượt 1 đạt **21/30**, chưa qua ngưỡng 24. Lỗi lớn nhất là hệ thống không hỏi lại khi mục tiêu mơ hồ: ca B07 'Tôi muốn học về dữ liệu', hệ thống tự chọn chủ đề rồi soạn cả lộ trình.
>
> Nhóm sửa đúng một chỗ: thêm bước kiểm độ rõ **trước** khi tìm web. B07 đạt. Nhưng lượt 2 chỉ còn **18/30**, vì bước mới hỏi lại cả một câu đã rất cụ thể về xác suất (B16).
>
> Nhóm không giấu con số này. Bài học là: sửa một lỗi bằng một bước chặn mới thì phải thử cả những câu dễ bị chặn nhầm. Phần đáng tin nhất là trích dẫn: **19/21 bài có nguồn thật sự hỗ trợ nội dung**, đạt ngưỡng."

**[TRÊN SLIDE]**

| Chuẩn chốt ở CP2 | Lượt 1 | Lượt 2 | Ngưỡng |
|---|---:|---:|---:|
| Tổng câu qua | 21/30 | 18/30 | 24/30 |
| Căn cứ trích dẫn | 18/21 | **19/21** | 17/21 |
| Phù hợp người học | 18/21 | 17/21 | 17/21 |
| Xử lý giới hạn | 8/9 | 8/9 | 8/9 |
| Từ chối đúng | 5/5 | 4/5 | 5/5 |

Run ID: `run-1@20261127-212542` → `run-2@20261127-234148`. Thay đổi giữa hai lượt: hỏi lại trước khi tìm web (B07 ✓, B16 ✗).

*Nguồn: [eval/report.md](../eval/report.md) §1–§3.*

---

## 6. Chi phí khi dùng thật: 40 giây

**[NÓI]**
> "Nếu đưa vào dùng thật thì tốn bao nhiêu? Nhóm chạy mô phỏng theo 3 kiểu người dùng lấy từ khảo sát, đo token thật và cộng cả phí tìm web.
>
> Mỗi lần tạo được một bài **đạt**, tính cả những lần không đạt, tốn khoảng **1.400 đồng**. Một trường 3.000 sinh viên tốn khoảng **6,9 triệu đồng mỗi tháng**, tức **2.300 đồng một người mỗi tháng**, rẻ hơn một ly trà đá.
>
> Phát hiện bất ngờ: **81% chi phí là phí tìm web**, không phải phí model. Đổi lên model đắt nhất chỉ tăng khoảng 56%. Muốn rẻ hơn thì phải cache nguồn, không phải hạ model."

**[NÓI, nói thật]**
> "Mô phỏng bị mất mạng giữa chừng nên chỉ 14/50 phiên hợp lệ. Nhóm đã kiểm chéo với 30 ca eval: chi phí mỗi lượt lệch khoảng 3%."

**[TRÊN SLIDE]**
- $0.0528 / task thành công (≈ 1.374 ₫), đã chia cho tỉ lệ đạt 60%
- Tháng: 500 người $44 · **3.000 người $265 (≈ 6,9 tr ₫)** · 15.000 người $1.324
- ≈ 2.295 ₫ / người / tháng
- Phí `web_search` chiếm ~81%
- *Chú thích nhỏ:* 14/50 phiên hợp lệ, kiểm chéo với 30 ca eval

*Nguồn: [cost/cost-estimate.md](../cost/cost-estimate.md) §2–§3.*

---

## 7. Kết luận: 30 giây

**[NÓI]**
> "Ba con số: **19/28** sinh viên kẹt ngay ở bước bắt đầu. **19/21** bài có nguồn thật sự hỗ trợ. **2.300 đồng** một người mỗi tháng.
>
> Kết luận của nhóm là **iterate, chưa phải go**. Nỗi đau có thật, chi phí không phải rào cản. Rào cản là chất lượng: 18/30 chưa đủ để giao cho sinh viên dùng thật."

**[TRÊN SLIDE]** Ba con số lớn + chữ **ITERATE**.

---

## 8. Nếu có thêm một tuần: 20 giây

**[NÓI]**
> "Một: sửa bước hỏi lại để không chặn nhầm câu đã cụ thể như B16, rồi chạy lại nhiều lượt để biết thay đổi tốt thật hay chỉ ăn may. Hai: phỏng vấn 3 đến 5 sinh viên và đo thời gian bắt đầu bài khi có và khi không có NewLearn, vì hiện nhóm mới đo thời gian chuẩn bị, chưa đo được thời gian tiết kiệm. Ba: cache nguồn theo chủ đề phổ biến để cắt phần 81% chi phí."

**[TRÊN SLIDE]** 3 gạch đầu dòng, mỗi dòng trỏ về một lỗi: B16 · chưa đo tiết kiệm · phí tìm web 81%.

**Câu chốt** (quay lại câu mở màn):
> "Lần tới khi bạn có deadline SQL vào thứ Năm, bạn không cần mở năm tab nữa. Mở một bài, bấm vào nguồn, và bắt đầu. Cảm ơn mọi người."

---

## Chuẩn bị hỏi đáp

| Câu hỏi có thể gặp | Trả lời gọn |
|---|---|
| "Sao không dùng ChatGPT luôn?" | 10/28 người mở chatbot đầu tiên, 7 trong số đó vẫn kẹt ở bước bắt đầu, vì không kiểm được. NewLearn bắt mỗi ý phải có đoạn trích nguyên văn; không có nguồn thì không xuất bài. |
| "18/30 thấp vậy sao dám demo?" | Nhóm chốt chuẩn trước khi chạy, không sửa chuẩn hay bỏ câu trượt. 18/30 là số thật. Trích dẫn đạt 19/21; chỗ yếu đã biết là B16 và nằm trong kế hoạch tuần tới. |
| "Trích dẫn có thể bị AI bịa không?" | URL và đoạn trích lấy từ kết quả của công cụ tìm, không do model viết. Mã nguồn trong bài phải khớp danh sách đó, không khớp thì chặn. Nhóm vẫn chấm tay xem đoạn trích có thật sự hỗ trợ ý được dẫn (19/21). |
| "Bằng chứng chỉ là khảo sát tự khai?" | Đúng. 28 phiếu ngoài nhóm, chưa có phỏng vấn. Nhóm ghi rõ trong evidence và đặt phỏng vấn kèm đo thời gian làm việc đầu tiên trong tuần tới. |
| "Tiết kiệm được bao nhiêu phút?" | Chưa đo. Khảo sát đo thời gian chuẩn bị (16–30 phút/lần), chưa đo phần sản phẩm giảm được. Nhóm không nói số tiết kiệm khi chưa có. |
| "Ai trả 2.300 đồng/tháng?" | Chưa chốt mô hình thu phí. Mức chi phí đủ thấp để trường hoặc CLB học thuật tài trợ cho sinh viên. Nhóm chỉ khẳng định chi phí không phải rào cản. |
| "Mô phỏng chỉ 14/50 phiên?" | Mạng lỗi giữa chừng, đã ghi thật. Kiểm chéo với 30 ca eval lượt 2: $0,0221 so với $0,0228 mỗi lượt, lệch khoảng 3%. |
| "Dữ liệu người học đi đâu?" | Form không hỏi thông tin cá nhân, không có tài khoản. Chỉ gửi nội dung học tập tới API trả phí của OpenAI và Anthropic, lưu SQLite trên máy chạy. |
| "Video và quiz có bịa thêm kiến thức không?" | Cả hai chỉ được dùng bài 1 và nguồn của bài; mỗi câu, mỗi cảnh phải gắn mã nguồn hợp lệ. Server chấm điểm, đáp án chỉ hiện sau khi người học bấm kiểm tra. |
