# Chi phí khi dùng thật

> Điền ở guide bước 4.2, nộp ở CP4 14:30 Thứ Bảy 28/11. Ôn lại: ngày 13, ngày 1, ngày 14 · lab ngày 13, lab ngày 14. Chấm ở rubric R6.
> Số **không điền tay**: điền `cost/personas.yaml` → `python run.py simulate --rate-from eval/run-2.csv` → chép bảng trong `cost/simulate-N-summary.md` vào đây.
> Lúc build dùng gói miễn phí vẫn tính theo **giá gói trả phí** — đây là chi phí cho lúc đưa vào dùng thật.

## 1. Đầu vào

- **Persona** (`cost/personas.yaml`): 3 kiểu người dùng theo `spec.md §2` & khảo sát `evidence/summary.md` (`BAO-02`/`BAO-04`: 28 phiếu đúng mục đích học ngoài nhóm, 19/28 gặp trở ngại chính, trung vị **2–3 lần / 30 ngày**; phân bổ 3 nhóm cho kỳ vọng `2,75` phiên/người/tháng là _(tự ước tính)_):
  - `dung_it`: tỉ lệ `50%` · `1` phiên/người/tháng · `1` lượt hỏi/phiên.
  - `dung_vua`: tỉ lệ `35%` · `3` phiên/người/tháng · `2` lượt hỏi/phiên.
  - `dung_nhieu`: tỉ lệ `15%` · `8` phiên/người/tháng · `3` lượt hỏi/phiên.
- **Số người dùng thật** 3 kịch bản _(tự ước tính theo quy mô sinh viên đại học tại Việt Nam)_: thấp `500` (một khoa) · cơ sở `3.000` (tương đương quy mô 1 trường đại học như VinUni — https://vinuni.edu.vn, xem 27/11/2026) · cao `15.000` (liên trường; toàn quốc có ~2,6 triệu SV đại học, ~848 nghìn SV STEM theo Bộ GD&ĐT 08/2026).
- **Giá** 4 model khớp stack thật (`codebase/ai.py` sau PR #2: OpenAI soạn bài + Claude `web_search`) và 2 mức mạnh hơn để so sánh (Standard API, USD / 1 triệu token, xem 27/11/2026):
  - Tìm kiếm web (`SEARCH_MODEL` mặc định): `claude-haiku-5-5` — vào `$0.10` · ra `$0.50` (prompt ≤ 100K token, nguồn https://www.anthropic.com/pricing).
  - Soạn bài mức rẻ (model chạy thật): `gpt-5.4-nano` — vào `$0.20` · ra `$1.25` (nguồn https://openai.com/api/pricing/).
  - Soạn bài mức cân bằng (so sánh): `gpt-5.4-mini` — vào `$0.75` · ra `$4.50` (nguồn https://openai.com/api/pricing/).
  - Soạn bài mức mạnh (so sánh): `gpt-5.4` — vào `$2.50` · ra `$15.00` (prompt ≤ 272K token, nguồn https://openai.com/api/pricing/).
  - **Phí công cụ tìm web ngoài token:** Claude `web_search` tính thêm `$10 / 1.000 lượt tìm` (`$0.01 / lượt tìm`, giới hạn `SEARCH_MAX_USES=3` lượt/câu hỏi — nguồn https://www.anthropic.com/pricing). Khung `simulate.py` chỉ nhân giá token; `cost/writer_swap.py` tự cộng khoản `số lượt web_search thực đo × $0.01` vào từng phiên (đếm từ note `web_search: N lượt tìm` trong `traces/simulate-N.jsonl`) và ghi số lượt tìm trung bình / phiên dưới bảng.
- **Tỷ giá quy đổi:** `1 USD = 26.000 ₫` (Vietcombank https://www.vietcombank.com.vn/vi-VN/KHCN/Cong-cu-Tien-ich/Ty-gia · xem 27/11/2026, bán ra ~26.010 ₫/USD, làm tròn).
- **Tỉ lệ đạt** dùng để tính: `18/30 (60%)` — lượt `run-2@20261127-234148` (`eval/run-2.csv`, `BAO-09` đã chấm; xem `eval/report.md` §1).
- Đo token trên cặp model thực tế `gpt-5.4-nano` + `claude-haiku-5-5` _(chờ `AN-02` & chạy `DAO-09`)_ và lấy dòng **Thực đo — mỗi model giá riêng** làm số chính.
- **So sánh model soạn bài — không chép dòng `gpt-5.4-mini` / `gpt-5.4` của `simulate`.** Các dòng đó ghi _"nếu MỌI token tính giá model này"_, tức áp giá OpenAI lên cả token Claude `web_search` (phần lớn token vào), nên thổi phồng chi phí: với dữ liệu giả lập trong review PR #8, dòng Mini cho `$0,0375/phiên`, trong khi giữ Claude và chỉ đổi model soạn bài chỉ `$0,0100/phiên` (trước phí tìm kiếm). Kịch bản đúng giữ token `claude-haiku-5-5` ở giá Haiku và chỉ đổi giá của token model soạn bài, theo cột `tokens_by_model` của `cost/simulate-N.csv`:

  ```bash
  python3 cost/writer_swap.py cost/simulate-N.csv --rate <tỉ lệ đạt run-2, 0..1>
  ```

  Bảng in ra có 3 dòng `gpt-5.4-nano` / `gpt-5.4-mini` / `gpt-5.4` soạn bài + `claude-haiku-5-5` tìm kiếm, cùng công thức tháng/persona với khung, **đã gồm phí `web_search`**. Ghi rõ: _đo token trên `gpt-5.4-nano`, tính giá `gpt-5.4-mini` / `gpt-5.4`_ (bộ tách token và độ dài trả lời của model khác có thể lệch). Đối chiếu dòng `nano` với dòng **Thực đo** của `simulate` bằng `--search-fee 0` (khi đó hai dòng phải khớp); chênh lệch khi bật phí chính là phần phí công cụ.

## 2. Kết quả mô phỏng

Lượt mô phỏng: `cost/simulate-__.csv` · run ID `____` · `50` phiên · seed `42` _(chờ chạy `python3 run.py simulate --rate-from eval/run-2.csv` sau khi xong `AN-02` và `BAO-09`)_.

_(dán dòng **Thực đo — mỗi model giá riêng** từ `cost/simulate-N-summary.md` và 2 dòng `gpt-5.4-mini`, `gpt-5.4` từ `python3 cost/writer_swap.py` — không dùng các dòng "nếu MỌI token tính giá model này")_

| Model (giá) | Chi phí / phiên | Chi phí / task thành công | Chi phí / câu hỏi đạt | Chi phí / tháng — thấp (500 người) | Chi phí / tháng — cơ sở (3.000 người) | Chi phí / tháng — cao (15.000 người) | Chi phí / người / tháng (cơ sở) |
| ----------- | --------------: | ------------------------: | --------------------: | ---------------------------------: | ------------------------------------: | -----------------------------------: | ------------------------------: |
|             |                 |                           |                       |                                    |                                       |                                      |                                 |
|             |                 |                           |                       |                                    |                                       |                                      |                                 |
|             |                 |                           |                       |                                    |                                       |                                      |                                 |
|             |                 |                           |                       |                                    |                                       |                                      |                                 |
|             |                 |                           |                       |                                    |                                       |                                      |                                 |

Chi phí / task thành công = chi phí trung bình mỗi phiên ÷ tỉ lệ đạt — **không coi như đạt 100%**.

## 3. So với impact

- Impact / người / tháng (`spec.md` §2 & `evidence/summary.md` · `BAO-04`): trong 28 phiếu đúng mục đích học ngoài nhóm, **19/28 (67,9%)** gặp trở ngại chính liên quan trực tiếp đến lát cắt; trung vị tần suất **2–3 lần / 30 ngày** và trung vị thời gian chuẩn bị **16–30 phút / lần** (18 phiếu nhớ được) → ước tính **~57,5 phút chuẩn bị / người / tháng** trong nhóm gặp trở ngại (`2,5 × 23 phút`, tổng `~1.093 phút/tháng` cho 19 người — _(tự ước tính từ trung điểm hai khoảng trung vị, đo toàn bộ khâu chuẩn bị chứ chưa đo trực tiếp số phút sản phẩm giúp tiết kiệm)_).
- Chi phí / người / tháng (cơ sở, cặp model `gpt-5.4-nano` + `claude-haiku-5-5`): `__` _(chờ chạy `DAO-09`, kèm ước tính phí `web_search` thực đo)_.
- **Kết luận một dòng — đáng làm không:** `__` _(điền sau khi có số chi phí thực đo từ `DAO-09`)_.

## 4. _(Muốn sâu hơn, không bắt buộc)_

- Bảng độ nhạy: so sánh mức model soạn bài (`gpt-5.4-nano` vs `gpt-5.4-mini` vs `gpt-5.4`), giới hạn `SEARCH_MAX_USES` (1–3 lượt tìm) và cache nguồn web theo chủ đề phổ biến để cắt đồng thời phí `$0.01/lượt` của `web_search` và token Claude.
- Chi phí ngoài token model: phí công cụ `web_search` của Anthropic (`$10 / 1.000 lượt`), hosting FastAPI + SQLite nhỏ gọn (1 VPS/PaaS cơ bản).
- Quy mô nào thì bài toán còn đáng làm _(cập nhật sau khi có chi phí/người/tháng thực đo)_.
