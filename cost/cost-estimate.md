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
- Đo token trên cặp model thực tế `gpt-5.4-nano` + `claude-haiku-5-5` (lượt `simulate-1`, xem §2) và lấy dòng **Thực đo — mỗi model giá riêng** làm số token chính, cộng phí `web_search` thực đo.
- **So sánh model soạn bài — không chép dòng `gpt-5.4-mini` / `gpt-5.4` của `simulate`.** Các dòng đó ghi _"nếu MỌI token tính giá model này"_, tức áp giá OpenAI lên cả token Claude `web_search` (phần lớn token vào), nên thổi phồng chi phí: với dữ liệu giả lập trong review PR #8, dòng Mini cho `$0,0375/phiên`, trong khi giữ Claude và chỉ đổi model soạn bài chỉ `$0,0100/phiên` (trước phí tìm kiếm). Kịch bản đúng giữ token `claude-haiku-5-5` ở giá Haiku và chỉ đổi giá của token model soạn bài, theo cột `tokens_by_model` của `cost/simulate-N.csv`:

  ```bash
  python3 cost/writer_swap.py cost/simulate-N.csv --rate <tỉ lệ đạt run-2, 0..1>
  ```

  Bảng in ra có 3 dòng `gpt-5.4-nano` / `gpt-5.4-mini` / `gpt-5.4` soạn bài + `claude-haiku-5-5` tìm kiếm, cùng công thức tháng/persona với khung, **đã gồm phí `web_search`**. Ghi rõ: _đo token trên `gpt-5.4-nano`, tính giá `gpt-5.4-mini` / `gpt-5.4`_ (bộ tách token và độ dài trả lời của model khác có thể lệch). Đối chiếu dòng `nano` với dòng **Thực đo** của `simulate` bằng `--search-fee 0` (khi đó hai dòng phải khớp); chênh lệch khi bật phí chính là phần phí công cụ.

## 2. Kết quả mô phỏng

Lượt mô phỏng: [`cost/simulate-1.csv`](simulate-1.csv) · run ID `simulate-1@20261128-101108` · chạy `50` phiên, seed `42`, lệnh `python run.py simulate --rate-from eval/run-2.csv` · tóm tắt khung: [`cost/simulate-1-summary.md`](simulate-1-summary.md) · trace: `traces/simulate-1.jsonl`.

**Chỉ 14/50 phiên hợp lệ — ghi thật, chưa đạt yêu cầu ≥50 phiên.** 36 phiên lỗi do mạng của máy chạy, không do code: 11 phiên trong S001–S025 bị treo tới hết thời gian chờ (`call_search_model` 240 giây, `call_model` 180 giây), rồi từ S026 máy mất kết nối (`URLError … getaddrinfo failed`) nên mọi lượt sau lỗi ngay. Khung tự loại phiên lỗi khỏi trung bình. 14 phiên hợp lệ gồm `dung_it` 7, `dung_vua` 6, `dung_nhieu` 1 (nhóm dùng nhiều chỉ có 1 phiên, nên số tháng của nhóm này kém chắc nhất). Nhóm không chạy lại vì hết ngân sách API; lượt chạy lại bắt đầu lúc 11:13 đã dừng trước khi xong phiên đầu, không ghi file.

**Kiểm chéo tính đại diện** (cùng cặp model, cùng giá, đếm từ trace; lượt eval đã chạy trước, không tốn thêm):

| Nguồn | Lượt hỏi hợp lệ | Token / lượt | Lượt `web_search` / lượt | Tổng / lượt (gồm phí tìm) |
|---|---:|---:|---:|---:|
| `simulate-1` (mọi lượt hỏi không lỗi) | 30 | $0.0041 | 1.80 | $0.0221 |
| `run-2@20261127-234148` (30 ca eval) | 30 | $0.0042 | 1.87 | $0.0228 |
| `run-1@20261127-212542` (30 ca eval) | 30 | $0.0046 | 2.20 | $0.0266 |

Chi phí mỗi lượt hỏi của `simulate-1` thấp hơn lượt eval 2 khoảng 3% và thấp hơn lượt 1 khoảng 17% (lượt 2 tìm ít hơn nhờ hỏi lại sớm ở AN-09), nên 14 phiên hợp lệ dùng được làm số cơ sở, kèm cảnh báo cỡ mẫu nhỏ ở trên.

Bảng dưới lấy từ `python cost/writer_swap.py cost/simulate-1.csv --rate 0.6` (giữ `claude-haiku-5-5` cho tìm kiếm, **đã cộng phí `web_search`**: trung bình 2,57 lượt tìm / phiên → $0.0257 / phiên). Dòng đầu là dòng **Thực đo** của khung (`cost/simulate-1-summary.md`), **chỉ token, chưa gồm phí tìm**; chạy `writer_swap.py --search-fee 0` cho đúng $0.0060 / phiên, khớp dòng này. Mini và GPT-5.4: _đo token trên `gpt-5.4-nano`, tính giá `gpt-5.4-mini` / `gpt-5.4`_.

| Model (giá) | Chi phí / phiên | Chi phí / task thành công | Chi phí / câu hỏi đạt | Chi phí / tháng — thấp (500 người) | Chi phí / tháng — cơ sở (3.000 người) | Chi phí / tháng — cao (15.000 người) | Chi phí / người / tháng (cơ sở) |
| ----------- | --------------: | ------------------------: | --------------------: | ---------------------------------: | ------------------------------------: | -----------------------------------: | ------------------------------: |
| Thực đo — chỉ token (`claude-haiku-5-5` + `gpt-5.4-nano`, chưa gồm phí tìm) | $0.0060 (≈ 156 ₫) | $0.0100 (≈ 259 ₫) | $0.0063 (≈ 165 ₫) | $8.60 (≈ 223.692 ₫) | $51.62 (≈ 1.342.149 ₫) | $258.11 (≈ 6.710.747 ₫) | $0.0172 (≈ 447 ₫) |
| **Số nộp: `gpt-5.4-nano` soạn bài + `claude-haiku-5-5` tìm kiếm, gồm phí tìm** | **$0.0317 (≈ 824 ₫)** | **$0.0528 (≈ 1.374 ₫)** | **$0.0336 (≈ 874 ₫)** | **$44.14 (≈ 1.147.620 ₫)** | **$264.84 (≈ 6.885.721 ₫)** | **$1,324.18 (≈ 34.428.604 ₫)** | **$0.0883 (≈ 2.295 ₫)** |
| `gpt-5.4-mini` soạn bài + `claude-haiku-5-5` tìm kiếm, gồm phí tìm | $0.0359 (≈ 934 ₫) | $0.0599 (≈ 1.557 ₫) | $0.0381 (≈ 991 ₫) | $50.74 (≈ 1.319.238 ₫) | $304.44 (≈ 7.915.430 ₫) | $1,522.20 (≈ 39.577.150 ₫) | $0.1015 (≈ 2.638 ₫) |
| `gpt-5.4` soạn bài + `claude-haiku-5-5` tìm kiếm, gồm phí tìm | $0.0495 (≈ 1.288 ₫) | $0.0826 (≈ 2.147 ₫) | $0.0525 (≈ 1.366 ₫) | $71.95 (≈ 1.870.601 ₫) | $431.68 (≈ 11.223.604 ₫) | $2,158.39 (≈ 56.118.021 ₫) | $0.1439 (≈ 3.741 ₫) |

Chi phí / task thành công = chi phí trung bình mỗi phiên ÷ tỉ lệ đạt — **không coi như đạt 100%**. Tỉ lệ đạt 60% lấy từ `run-2`; ca dừng, hỏi lại hoặc trượt vẫn tốn tiền tìm kiếm nên đã nằm trong chi phí mỗi phiên.

**Phí `web_search` chiếm khoảng 81% chi phí mỗi phiên** ($0.0257 / $0.0317). Đổi model soạn bài từ nano lên GPT-5.4 chỉ tăng khoảng 56% tổng chi phí, vì phần token soạn bài nhỏ so với phí tìm.

## 3. So với impact

- Impact / người / tháng (`spec.md` §2 & `evidence/summary.md` · `BAO-04`): trong 28 phiếu đúng mục đích học ngoài nhóm, **19/28 (67,9%)** gặp trở ngại chính liên quan trực tiếp đến lát cắt; trung vị tần suất **2–3 lần / 30 ngày** và trung vị thời gian chuẩn bị **16–30 phút / lần** (18 phiếu nhớ được) → ước tính **~57,5 phút chuẩn bị / người / tháng** trong nhóm gặp trở ngại (`2,5 × 23 phút`, tổng `~1.093 phút/tháng` cho 19 người — _(tự ước tính từ trung điểm hai khoảng trung vị, đo toàn bộ khâu chuẩn bị chứ chưa đo trực tiếp số phút sản phẩm giúp tiết kiệm)_).
- Chi phí / người / tháng (cơ sở, cặp model `gpt-5.4-nano` + `claude-haiku-5-5`, gồm phí `web_search`): **$0.0883 (≈ 2.295 ₫)**; mỗi task thành công **$0.0528 (≈ 1.374 ₫)**. Ở quy mô cơ sở 3.000 người: **$264.84 / tháng (≈ 6,9 triệu ₫)**, chưa gồm hosting.
- **Kết luận một dòng — đáng làm không:** Đáng làm về chi phí: khoảng 2.300 ₫ / người / tháng cho một nhu cầu tốn ~57,5 phút chuẩn bị / người / tháng _(tự ước tính, §3 dòng đầu)_, nên chi phí model không phải rào cản; rào cản là chất lượng (lượt 2 mới đạt 18/30), và muốn giảm chi phí thì cắt phí tìm web trước, không phải đổi model soạn bài.

## 4. _(Muốn sâu hơn, không bắt buộc)_

- Bảng độ nhạy: so sánh mức model soạn bài (`gpt-5.4-nano` vs `gpt-5.4-mini` vs `gpt-5.4`), giới hạn `SEARCH_MAX_USES` (1–3 lượt tìm) và cache nguồn web theo chủ đề phổ biến để cắt đồng thời phí `$0.01/lượt` của `web_search` và token Claude.
- Chi phí ngoài token model: phí công cụ `web_search` của Anthropic (`$10 / 1.000 lượt`), hosting FastAPI + SQLite nhỏ gọn (1 VPS/PaaS cơ bản).
- Độ nhạy theo model soạn bài (đã tính ở §2, gồm phí tìm): nano $0.0883 → mini $0.1015 → GPT-5.4 $0.1439 / người / tháng ở mức cơ sở. Độ nhạy theo phí tìm _(tự ước tính, chưa đo)_: nếu cache nguồn hoặc hạ `SEARCH_MAX_USES` làm giảm một nửa số lượt tìm (2,57 → ~1,3 / phiên), chi phí mỗi phiên giảm từ $0.0317 xuống khoảng $0.019.
- Quy mô nào thì bài toán còn đáng làm: kể cả mức cao 15.000 người, chi phí model khoảng $1,324 / tháng (≈ 34,4 triệu ₫), tức vẫn ≈ 2.300 ₫ / người / tháng; chi phí tăng tuyến tính theo số người, nên điều kiện đáng làm phụ thuộc chất lượng và tỉ lệ người dùng quay lại hơn là quy mô.
