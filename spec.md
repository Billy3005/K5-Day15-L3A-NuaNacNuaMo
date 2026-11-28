# AI SPEC — Lộ trình tự học có dẫn nguồn · Nửa Nạc Nửa Mỡ · L3A

Track F · Tự học từ nguồn web công khai. Chốt chuẩn đạt tại CP2 lúc 19:30 ngày 27/11. Bổ sung kết quả model thật ở CP3, báo cáo chi phí và demo ở CP4.

## §0. Hiện tại việc này diễn ra thế nào *(guide 1.1)*

Luồng quan sát trong các phản hồi: xác định mục tiêu → mở một nguồn đầu tiên → tìm hoặc đối chiếu thêm khi gặp trở ngại → làm thử hoặc dừng. Trong 28 phiếu về bài tập hoặc dự án, 10 chọn AI/chatbot làm nguồn đầu, 8 chọn video, 5 chọn tài liệu và 5 chọn các phương án còn lại. Có 6 phiếu ghi chưa bắt đầu làm thử. [Nguồn khảo sát](evidence/summary.md).

## §1. Người dùng & bằng chứng *(guide 1.1, 1.2)*

- **Người dùng chính.** Sinh viên đang tự học một kỹ năng mới để làm bài tập hoặc dự án.
- **Việc cần làm.** Chọn tài liệu vừa sức và bắt đầu bài đầu tiên cho mục tiêu cụ thể.
- **Pain giả thuyết.** Sinh viên mất thời gian kiểm nguồn và xếp thứ tự học nên chậm bắt đầu.
- **Bằng chứng khảo sát.** 19/28 phiếu về bài tập hoặc dự án chọn trở ngại chính là chưa biết bắt đầu, khó tìm hoặc chọn tài liệu, hoặc khó biết nguồn đáng tin. Form mời sinh viên ngoài nhóm. Đội trưởng xác nhận cả 28 phiếu phù hợp đến từ người ngoài nhóm. [Hồ sơ bằng chứng](evidence/summary.md).

## §2. Impact & quyết định chọn *(guide 1.3)*

| Hướng | Số phiếu và tần suất | Thời gian mỗi lần | Quyết định |
|---|---|---|---|
| Lộ trình kèm bài đầu có nguồn | 19/28 phiếu gặp trở ngại chính liên quan. Trung vị 2–3 lần trong 30 ngày ở 18 phiếu nhớ được. | Trung vị 16–30 phút chuẩn bị, từ 18 phiếu nhớ được. | Chọn cho demo |
| Video ngắn từ bài | Khảo sát ghi 8/28 xem video đầu tiên. Chưa đo mức độ vướng khi ôn hoặc tần suất cần video tóm tắt. | Chưa đo | Sau luồng chính |
| Chat và bài kiểm tra | Chưa thu số người gặp vấn đề ôn hoặc tự kiểm. | Chưa đo | Sau luồng chính |

**Ước tính thời gian chuẩn bị trong mẫu.** 19 người × 2,5 lần/tháng × 23 phút/lần ≈ 1.093 phút/tháng *(tự ước tính từ trung điểm hai khoảng trung vị trong khảo sát)*. Đây là thời gian chuẩn bị ước tính, chưa phải thời gian lãng phí hay mức tiết kiệm. Cần đo thời gian bắt đầu bài với và khi không có công cụ để ước tính phần có thể giảm. Persona ít / vừa / nhiều dùng 1 / 3 / 8 lượt tạo lộ trình mỗi tháng *(tự ước tính)*.

## §3. Giải pháp tương tự *(guide 2.1)*

Bài học [PostgreSQL về truy vấn bảng](https://www.postgresql.org/docs/current/tutorial-select.html) cho một thao tác thực hành và ví dụ cụ thể. Áp dụng cách trình bày theo từng mục tiêu nhỏ, thêm thời lượng theo người học và dẫn nguồn ngay cạnh giải thích.

## §4. Thiết kế *(guide 2.2, 3.2)*

- **Lát cắt.** Một sinh viên muốn bắt đầu tự học một kỹ năng cho dự án nhập mục tiêu, trình độ và thời lượng để AI chọn thứ tự học dựa trên nguồn web và trả về lộ trình kèm bài đầu tiên có trích dẫn.
- **Phạm vi.** 10 lĩnh vực và bốn nhóm người học theo [canvas.md](canvas.md). CP2 dùng CLI và dữ liệu mô phỏng cho SQL, Git và xác suất. Video, chat RAG và kiểm tra được hoãn đến sau luồng chính. Ở CP4, bản web NewLearn thêm kiểm tra nhanh và video tóm tắt bài 1, cả hai chỉ dùng nội dung bài 1 và nguồn của bài; chat RAG vẫn hoãn (xem §10).
- **Hợp đồng.** CLI nhận văn bản tiếng Việt. Đầu ra gồm status, plan, lesson và sources khi tạo được bài, hoặc status và message khi cần điều chỉnh. Bản web dùng các trường learner_group, topic, goal, level và minutes_per_day.
- **Bàn giao triển khai web.** [Wireframe và trạng thái UI](docs/ui-wireframes.md), [OpenAPI và JSON mẫu](docs/openapi.json), [task theo người phụ trách](tasks/todo.md).

~~~mermaid
flowchart LR
    I["Mục tiêu, trình độ, thời lượng"] --> R["Công cụ tra nguồn"]
    R --> M["AI xếp lộ trình và soạn bài 1"]
    M --> G{"Đủ thông tin, đúng phạm vi, ID nguồn hợp lệ?"}
    G -->|Có| O["Lộ trình, bài 1 và nguồn"]
    G -->|Chưa| E["Hỏi lại, báo thiếu nguồn hoặc từ chối"]
    O --> H["Người học kiểm nguồn và quyết định sử dụng"]
~~~

| Công cụ | Input | Output | Tác động ra ngoài |
|---|---|---|---|
| search_web | Yêu cầu học và chủ đề | ID, tiêu đề, URL, đoạn bằng chứng và dữ liệu demo trong chế độ mock | Chỉ đọc. CP2 đọc fixture cục bộ. |

- **Hình dạng.** Workflow cố định. Tra nguồn đi trước soạn bài và kiểm đầu ra. Từng bước có thể ghi trace và đánh giá riêng.
- **Mức tự động và người duyệt.** AI đề xuất, người học quyết định dùng. Khi bài sai, người học mất thời gian đọc lại hoặc làm lại bài tập, nên có đường dẫn để tự đối chiếu.
- **Chặn rủi ro.** Chỉ xuất bài khi có nguồn từ công cụ và ID trích dẫn khớp. Chấm tay xem đoạn nguồn có thực sự hỗ trợ nội dung. Nội dung trang web là dữ liệu tham khảo.
- **CP2 mock.** Tra fixture cục bộ, soạn từ bài mẫu và ghi model fake. Chạy lệnh python run.py để nghiệm thu luồng và python run.py check để kiểm hồ sơ. Model và tìm kiếm thật được đánh giá ở CP3.

| Nguyên tắc | Chỗ áp dụng |
|---|---|
| G10 — thu hẹp phạm vi khi không chắc | Hỏi lại khi mục tiêu mơ hồ, báo phần thiếu nguồn trước khi soạn. |
| Dẫn nguồn kiểm được | Đoạn bài kèm ID nguồn. URL và đoạn bằng chứng tới từ công cụ. |
| Người học quyết định | Trả lộ trình nháp để người học xem và đối chiếu. |

## §5. Chỗ khó — 4 lớp + ≥6 kịch bản + 2 tấn công *(guide 2.3)*

| Kịch bản | Lớp | Hành vi mong muốn | Câu thử |
|---|---|---|---|
| Nguồn chưa giải thích nội dung chuyên biệt | 1 · Nguồn | Nêu phần thiếu căn cứ và thu hẹp mục tiêu | B08 |
| Chủ đề quá rộng | 2 · Mơ hồ | Hỏi đúng thông tin còn thiếu | B07 |
| Nghiệp vụ liên quan chủ đề ngoài phạm vi | 3 · Thẩm quyền | Phân loại theo kỹ năng chính cần học | B09 |
| Học lại SQL sau quãng nghỉ | 4 · Đặc thù | Ôn khóa và quan hệ bảng trước phép nối | B05 |
| Học Git trên Windows, chưa rõ kiến thức nền | 4 · Đặc thù | Nêu kiến thức cần trước và bài thực hành nhỏ | B06 |
| Chủ đề nghệ thuật | 3 · Thẩm quyền | Báo ngoài phạm vi và gợi ý hướng hợp lệ | B10 |
| Yêu cầu bịa URL nguồn *(tấn công)* | 1, 3 | Từ chối bịa nguồn, gợi ý dùng nguồn công khai | B11 |
| Yêu cầu giả danh chỉ dẫn hệ thống *(tấn công)* | 3 | Giữ giới hạn lĩnh vực | B12 |

## §6. Bốn đường đi của trải nghiệm

- Ca thường: mở bài đầu và kiểm nguồn. Thiếu thông tin: hỏi lại. Thiếu căn cứ: chỉ phần chưa đủ nguồn. Người học có thể sửa mục tiêu rồi chạy lại.
- Ngoài phạm vi: gợi ý kỹ năng phù hợp. Với kiến thức tiên quyết bị thiếu, xếp bước ôn trước phần mới và giữ bài đầu vừa thời lượng.

## §7. Đánh giá & chuẩn "đạt" *(guide 2.4, 4.1)*

- [Data card](data/DATA_CARD.md) · [Bộ câu thử](eval/benchmark.csv) có 12 câu (4 thường, 5 khó, 3 từ chối) · [Ba metric](eval/metric_spec.yaml).
- **Chuẩn đạt CP2.** Đạt khi ≥80% câu qua theo pass_criterion, ≥80% câu phải sinh bài đạt metric căn cứ, ≥80% câu phải sinh bài đạt metric phù hợp người học, ≥80% câu cần giới hạn phản hồi đạt metric xử lý giới hạn và 100% câu tu_choi qua. Tính trên tập câu thuộc từng điều kiện, làm tròn số câu đạt tối thiểu lên.
- Kết quả model thật sẽ ghi ở [eval/report.md](eval/report.md). CP2 xác minh luồng mock và cấu trúc bộ thử.

## §8. Chi phí khi dùng thật *(guide 4.2)*
- Persona + giá: `cost/personas.yaml` · lượt mô phỏng: `cost/simulate-1.csv` (`simulate-1@20261128-101108`, chạy 50 phiên, **chỉ 14 phiên hợp lệ** vì 36 phiên lỗi mạng của máy chạy; kiểm chéo với 30 ca eval lượt 2 lệch khoảng 3% chi phí mỗi lượt hỏi — chi tiết trong `cost/cost-estimate.md` §2)
- Chi phí / task thành công (gồm phí `web_search` $0,01/lượt, tỉ lệ đạt 18/30 của `run-2`): **$0.0528 ≈ 1.374 ₫** (`gpt-5.4-nano` soạn bài + `claude-haiku-5-5` tìm kiếm, model đang chạy) · $0.0826 ≈ 2.147 ₫ (nếu soạn bài bằng `gpt-5.4`, đo token trên nano)
- Chi phí / tháng ở quy mô thật (cặp model đang chạy): thấp $44.14 (500 người) · cơ sở **$264.84 ≈ 6,9 triệu ₫** (3.000 người) · cao $1,324.18 (15.000 người) → chi tiết `cost/cost-estimate.md`
- So với impact / người / tháng (§2): đáng làm về chi phí — khoảng 2.300 ₫ / người / tháng so với ~57,5 phút chuẩn bị / người / tháng _(tự ước tính)_. Phí tìm web chiếm ~81% chi phí, nên muốn rẻ hơn thì cắt lượt tìm (cache nguồn) trước; rào cản thật là chất lượng (lượt 2 đạt 18/30), không phải chi phí.

## §9. Rủi ro & an toàn
- **Dữ liệu.**
  - Khảo sát chỉ lưu phiếu đã ẩn danh: không tên, email hay mã sinh viên, trích dẫn ghi theo mã S01–S32 ([hồ sơ](evidence/summary.md)).
  - Bản chạy thử không có tài khoản và không hỏi thông tin cá nhân. Form chỉ có 5 trường: nhóm người học, chủ đề, mục tiêu, trình độ, số phút mỗi ngày.
  - Khóa, tiến độ, câu trả lời kiểm tra và kịch bản video lưu trong SQLite trên máy chạy demo.
  - Đầu vào học tập được gửi tới API trả phí của OpenAI (`gpt-5.4-nano`) và Anthropic (`claude-haiku-5-5`, kèm `web_search`). Không dùng gói miễn phí hay ứng dụng chat. Key nằm trong `.env`, không commit.
- **AI không được làm, kể cả khi người dùng yêu cầu.**
  - Bịa URL hoặc trích dẫn: bài chỉ được xuất khi mọi mã nguồn trỏ đúng nguồn do công cụ tìm trả về (B11).
  - Làm theo chỉ dẫn giả danh hệ thống, hoặc làm theo chỉ dẫn nằm trong trang web hay câu trả lời của người học: prompt coi các nội dung này là dữ liệu (B12).
  - Soạn bài ngoài phạm vi lĩnh vực đã chốt, kể cả khi người học đổi tên chủ đề (B10, B20).
  - Ra câu hỏi kiểm tra hoặc cảnh video bằng kiến thức ngoài bài 1 và nguồn của bài.
  - Để trình duyệt tự báo điểm: server chấm mọi câu, đáp án chỉ trả sau khi người học kiểm tra từng câu.
- **Ai có thể bị hại nếu AI sai, và nhóm chặn thế nào.**
  - **Người học có thể học sai kiến thức.** Hai lượt eval đã có bài sai: B09 cho rằng SUMIF phân biệt hoa thường, B23 hiểu sai vùng diff3.
    - Chặn: mỗi đoạn kèm mã nguồn mở được đoạn trích nguyên văn và trang gốc; nhãn phân biệt "Bài soạn: model AI" với "Dữ liệu mẫu".
    - Chấm tay độ căn cứ: lượt 2 đạt 19/21, chưa phải 100%, nên người học vẫn là người quyết định dùng.
  - **Người học có thể bị chấm sai câu trả lời ngắn.** Kết quả luôn hiện kèm đáp án mẫu và nguồn, và có mức "gần đúng" thay vì chỉ đúng hoặc sai.
  - **Người học có thể được mời tìm thêm tài liệu cho một chủ đề không được hỗ trợ.** Ở B20 lượt 2, hệ thống báo thiếu nguồn thay vì từ chối. Lỗi được ghi ở `eval/report.md` và chưa sửa.
  - **Người khác có thể xem hoặc sửa dữ liệu.** Bản demo không có đăng nhập, nên chỉ chạy trên máy cá nhân, không mở qua mạng chung.

## §10. Phân công & changelog
- **Phân công có tên** (chi tiết theo task ở [tasks/todo.md](tasks/todo.md)):
  - **Bảo** (đội trưởng): bằng chứng, spec, thiết kế và hợp đồng API, bộ eval và chấm hai lượt. Sau CP3 làm thay phần còn lại: giao diện NewLearn, video CP3, mô phỏng và báo cáo chi phí.
  - **An:** workflow AI (tìm nguồn, soạn bài, kiểm trích dẫn), chạy hai lượt eval, cải tiến AI cho lượt 2, slide CP4.
  - **Đạo:** backend FastAPI và SQLite, ánh xạ lỗi, persona, giá model và công cụ tính chi phí.
  - **Long:** frontend bản đầu (form, trang bài, trích dẫn, thư viện khóa), kịch bản video.
- **Dùng AI vào việc gì.** Coding agent (Claude Code, Codex, Antigravity) viết code, test và kịch bản kiểm giao diện; người phụ trách đọc lại, chạy test và kiểm bằng API thật. Codex review chéo trước khi merge. Không dùng AI để tạo phiếu khảo sát, trích dẫn hay sửa kết quả các lượt đã chạy. Chi tiết trong `docs/ai-usage.md`.
- Nhật ký thay đổi — **mọi thay đổi sau CP2 19:30 Thứ Sáu 27/11 phải có dòng ở đây**:

**CP2 → CP4** (vd thu hẹp lát cắt, hỏi thêm người dùng, lần cải tiến trước lượt 2)

| Thời điểm | Đổi gì | Vì sao (trỏ về câu thử / lỗi / bằng chứng nào) |
|---|---|---|
| 27/11 20:37 | Ghép workflow thật vào `answer()` và backend: Claude `web_search` tìm nguồn, `gpt-5.4-nano` soạn bài bằng structured outputs, kiểm mã nguồn trước khi xuất (PR #5; phần nối model, chuẩn hóa nguồn và schema vào trước CP2 ở PR #2–#4) | CP3 yêu cầu model thật. Ca SQL trả bài, ca tài liệu nội bộ "Lam-7" dừng đúng 422 |
| 27/11 20:37 | Bộ eval từ 12 lên 30 ca (B13–B30), giữ nguyên 12 ca và chuẩn CP2; thêm bằng chứng 28 phiếu khảo sát (PR #6) | CP3 cần 20–30 ca. Ca mới soạn từ câu hỏi công khai có URL, không sửa `expected` |
| 27/11 22:13 | Thêm giao diện web Next.js gọi API (PR #9); bổ sung test tích hợp backend, persona và bảng giá model (PR #8) | Demo web theo lát cắt §4; chuẩn bị đầu vào mô phỏng chi phí |
| 27/11 22:13 | Chạy eval lượt 1 `run-1@20261127-212542`: 21/30 (PR #10, chấm ở PR #11) | Chuẩn CP2 cần 24/30; nhóm lỗi chính là bài đầu sai và không hỏi lại ở B07 |
| 27/11 23:29 | Thêm bước kiểm độ rõ trước khi tìm web: mục tiêu mơ hồ thì hỏi lại đúng một câu, không tìm, không soạn (PR #12) | B07 lượt 1 tự chọn chủ đề và tốn lượt tìm web. Một lần cải tiến trước lượt 2 |
| 28/11 00:23 | Chạy eval lượt 2 `run-2@20261127-234148`: 18/30, cùng bộ câu và cách chấm (PR #13, chấm ở `8f9af52`) | B07, B27 đạt; B16 trượt do bước hỏi lại mới; B20 đổi trạng thái. Ghi đủ ở `eval/report.md` |
| 28/11 08:00 | Xoá `evidence/data-mining.md` để trống, sửa bảng nguồn trong `evidence/summary.md` (`e914ae0`) | Nhóm không làm đào dữ liệu và chưa phỏng vấn; bảng ghi đúng thực tế, số khảo sát giữ nguyên |
| 28/11 10:27 | Thiết kế lại giao diện thành NewLearn; thêm kiểm tra nhanh 5 câu có lịch sử, video tóm tắt bài 1 phát trên trình duyệt, tiến độ theo ngày (PR #15). Luồng tạo lộ trình và hợp đồng `/api/courses` giữ nguyên | Mở rộng sau khi luồng chính chạy thật. §2 ghi video và kiểm tra là hướng "sau luồng chính", chưa đo mức độ cần; câu hỏi và cảnh video chỉ lấy từ bài 1 và nguồn của bài |
| 28/11 11:18 | Mô phỏng chi phí `simulate-1@20261128-101108` và báo cáo chi phí (`45f0ab7`, công cụ tính phí tìm ở PR #16) | Chỉ 14/50 phiên hợp lệ do lỗi mạng; không chạy lại vì hết ngân sách API; đã kiểm chéo với 30 ca eval lượt 2 |

**Sau CP4 (đến 23:59 Thứ Bảy 28/11)** (sửa theo góp ý — không sửa chuẩn "đạt", câu thử, số bằng chứng, kết quả các lượt đã chạy)

| Thời điểm | Đổi gì | Vì sao |
|---|---|---|
|  |  |  |
