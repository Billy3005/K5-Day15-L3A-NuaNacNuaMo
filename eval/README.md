# Hồ sơ đánh giá — một trang

> Điền ở guide bước 2.4 (mục 1–4, trước CP2) và 4.1 (mục 5–6, trước CP4). Ôn lại: ngày 9, ngày 14 · lab ngày 9. Chấm ở rubric R4, R5.
> Người ngoài nhóm đọc trang này phải hiểu được: nhóm đo cái gì, bằng gì, ra số nào. Trang slide "Đánh giá thế nào" lấy từ đây.

## 1. Dataset → xử lý

Fixture CP2 gồm 3 đoạn được diễn giải từ tài liệu PostgreSQL, Pro Git và OpenStax, kèm URL gốc và bài mẫu. Năm câu thử được chuyển thể từ bài hỏi đáp công khai, bảy câu do nhóm soạn. Xem [data card](../data/DATA_CARD.md).

## 2. Bộ câu thử dựng ra sao

- `eval/benchmark.csv`: 12 câu (thuong 4 · kho 5 · tu_choi 3, trong đó 2 câu tấn công B11–B12).
- Nguồn: nguoi_dung 5 · data_that 0 · tu_viet 7 · sinh_seed 0. Nguồn người dùng công khai chiếm 5/12. Ca diễn giải có URL gốc trong cột `source`.
- Chiều độ phủ: lĩnh vực, kiến thức nền, thời lượng và tình trạng căn cứ hoặc phạm vi. Bốn nhóm người học là phạm vi thiết kế, bộ CP2 tập trung hồ sơ sinh viên và người mới.
- B05–B09 bao phủ 4 lớp trong `spec.md` §5. Lớp 1 B08, lớp 2 B07, lớp 3 B09, lớp 4 B05–B06.

## 3. Metric và cách chấm

| Metric (`eval/metric_spec.yaml`) | Cách chấm | Ngưỡng |
|---|---|---|
| `can_cu_trich_dan` | Người chấm đối chiếu ID, đoạn nguồn và nhận định được dẫn | ≥80% câu phải sinh bài |
| `phu_hop_nguoi_hoc` | Người chấm kiểm thứ tự, mục tiêu, ví dụ, bài tập, thời lượng và độ khó | ≥80% câu phải sinh bài |
| `xu_ly_gioi_han` | Người chấm kiểm hỏi lại, báo thiếu nguồn hoặc từ chối theo `expected` | ≥80% câu cần giới hạn phản hồi và 100% câu `tu_choi` |

- **Chấm thử CP2:** Nguyễn Gia Bảo và Phan Bá An chấm cùng 5 đầu ra mock B01, B02, B07, B08, B10. Cả hai đều chấm **5/5 ca đạt**. Kết quả đối chiếu **khớp 5/5**, đạt yêu cầu ≥4/5.
- **Chuẩn đạt CP2.** Đạt khi ≥80% câu qua theo pass_criterion, ≥80% câu phải sinh bài đạt metric căn cứ, ≥80% câu phải sinh bài đạt metric phù hợp người học, ≥80% câu cần giới hạn phản hồi đạt metric xử lý giới hạn và 100% câu tu_choi qua. Tính trên tập câu thuộc từng điều kiện, làm tròn số câu đạt tối thiểu lên.

## 4. Lệnh

- CP2: `python run.py check` và `python run.py` để kiểm hồ sơ và luồng mock.
- Kết quả kiểm CP2: đủ 12 ca, 3 metric và 4 thành viên. Luồng mock đã được chạy với ca có bài, hỏi lại, thiếu nguồn, ngoài phạm vi và từ chối bịa nguồn. Kiểm tra tích hợp này chưa tính điểm chất lượng model.
- CP3: `python run.py eval --try` để xác nhận model thật, rồi `python run.py eval` → `eval/run-N.csv` + `traces/run-N.jsonl`. Điền `pass` và chạy `python run.py score eval/run-N.csv`.

## 5. Đã chạy gì

| Lượt | Run ID | Model | Cấu hình (prompt / công cụ / thay đổi) | Đạt / tổng | % | Đạt chuẩn? |
|---|---|---|---|---|---|---|
| 1 | | | | __/__ | | |
| 2 | | | | __/__ | | |

Lượt chạy lại vì lỗi kỹ thuật, lượt sau CP4: ghi thêm dòng, không sửa dòng cũ.

## 6. Lỗi chính

Tóm 2–3 dòng từ `eval/report.md`: nhóm lỗi lớn nhất · đã sửa gì · còn lại gì.
