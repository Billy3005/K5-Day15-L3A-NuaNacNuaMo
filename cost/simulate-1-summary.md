# Tóm tắt mô phỏng simulate-1@20261128-101108

Do `python run.py simulate` sinh ra — không sửa tay. Chép bảng sang `cost/cost-estimate.md`.

| Persona | Số phiên mô phỏng | Lượt hỏi / phiên | Token vào / phiên | Token ra / phiên | Gọi model / phiên | Gọi công cụ / phiên |
|---|---:|---:|---:|---:|---:|---:|
| dung_it | 7 | 1 | 21246 | 2638 | 2.7 | 0.9 |
| dung_vua | 6 | 2 | 44530 | 5332 | 5.3 | 1.7 |
| dung_nhieu | 1 | 3 | 26122 | 3446 | 5.0 | 1.0 |

Tỉ lệ đạt dùng để tính: 18/30 (60%) — lượt run-2@20261127-234148

- Tỉ lệ đạt lấy từ lượt nhóm chọn: eval/run-2.csv (--rate-from).

| Model (giá) | Chi phí / phiên | Chi phí / task thành công | Chi phí / câu hỏi đạt | Chi phí / tháng — thấp (500 người) | Chi phí / tháng — cơ sở (3.000 người) | Chi phí / tháng — cao (15.000 người) | Chi phí / người / tháng (cơ sở) |
|---|---:|---:|---:|---:|---:|---:|---:|
| **Thực đo — mỗi model giá riêng** (claude-haiku-5-5 + gpt-5.4-nano) | $0.0060 (≈ 156 ₫) | $0.0100 (≈ 259 ₫) | $0.0063 (≈ 165 ₫) | $8.60 (≈ 223.692 ₫) | $51.62 (≈ 1.342.149 ₫) | $258.11 (≈ 6.710.747 ₫) | $0.0172 (≈ 447 ₫) |
| claude-haiku-5-5 (vào 0.1 · ra 0.5 $/1M) — nếu MỌI token tính giá model này | $0.0051 (≈ 132 ₫) | $0.0085 (≈ 220 ₫) | $0.0054 (≈ 140 ₫) | $7.20 (≈ 187.184 ₫) | $43.20 (≈ 1.123.103 ₫) | $215.98 (≈ 5.615.515 ₫) | $0.0144 (≈ 374 ₫) |
| gpt-5.4-nano (vào 0.2 · ra 1.25 $/1M) — nếu MỌI token tính giá model này | $0.0111 (≈ 289 ₫) | $0.0185 (≈ 482 ₫) | $0.0118 (≈ 307 ₫) | $15.78 (≈ 410.288 ₫) | $94.68 (≈ 2.461.728 ₫) | $473.41 (≈ 12.308.641 ₫) | $0.0316 (≈ 821 ₫) |
| gpt-5.4-mini (vào 0.75 · ra 4.5 $/1M) — nếu MỌI token tính giá model này | $0.0410 (≈ 1.066 ₫) | $0.0683 (≈ 1.777 ₫) | $0.0435 (≈ 1.131 ₫) | $58.14 (≈ 1.511.640 ₫) | $348.84 (≈ 9.069.839 ₫) | $1,744.20 (≈ 45.349.196 ₫) | $0.1163 (≈ 3.023 ₫) |
| gpt-5.4 (vào 2.5 · ra 15.0 $/1M) — nếu MỌI token tính giá model này | $0.1367 (≈ 3.554 ₫) | $0.2278 (≈ 5.923 ₫) | $0.1450 (≈ 3.769 ₫) | $193.80 (≈ 5.038.800 ₫) | $1,162.80 (≈ 30.232.797 ₫) | $5,814.00 (≈ 151.163.986 ₫) | $0.3876 (≈ 10.078 ₫) |

- Chi phí / task thành công = chi phí / phiên ÷ tỉ lệ đạt. Chi phí / câu hỏi đạt = chi phí / phiên ÷ số lượt hỏi trung bình mỗi phiên (1.6) ÷ tỉ lệ đạt — tỉ lệ đạt đo theo từng câu thử.
- Token đo trên model: claude-haiku-5-5, gpt-5.4-nano. Giá tính theo từng model trong bảng — model khác bộ tách token thì số token thật có thể lệch; ghi rõ "đo trên model X, tính giá model Y" trong cost/cost-estimate.md.
- Phiên lỗi (không tính vào trung bình): 36/50.
- Tỷ giá: 1 USD = 26.000 ₫ (https://www.vietcombank.com.vn/vi-VN/KHCN/Cong-cu-Tien-ich/Ty-gia · xem 27/11/2026 (tỷ giá bán ra ~26.010 ₫/USD, làm tròn)).
