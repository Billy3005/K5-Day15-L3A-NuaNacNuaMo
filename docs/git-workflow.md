# Quy ước Git cho nhóm Nửa Nạc Nửa Mỡ

`main` là nhánh dùng để chạy demo và nộp checkpoint. Mỗi thay đổi phát triển đi qua một nhánh riêng và một Pull Request (PR) vào `main`. Bảo phối hợp review và merge. Kết quả chấm, thay đổi sau checkpoint và trạng thái task có thể đối chiếu trong repo và tab DEV.

## 1. Bắt đầu một task

Cập nhật `main`, rồi tạo nhánh theo mã task. Ví dụ Long nhận `LONG-01`:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feat/long-01-form
```

Dùng `feat/<ma-task>-<mo-ta>` cho tính năng hoặc `fix/<ma-task>-<mo-ta>` cho sửa lỗi. Mỗi PR tập trung vào một task hoặc một nhóm task phải ghép cùng nhau. Chuyển task sang **Đang làm** trong Sheet khi bắt đầu.

| Người | Phần sở hữu | Trao đổi trước khi sửa chung |
|---|---|---|
| **Long** | Giao diện và cách chạy frontend | Báo Đạo cách phục vụ UI, dùng mẫu OpenAPI để nối request, response và trạng thái lỗi. |
| **Đạo** | API, lưu khóa và điểm chạy web tại `codebase/app.py` | Thống nhất với An cách truyền đầu vào và đọc đầu ra của `answer(text)`. |
| **An** | `codebase/agent.py`, `codebase/ai.py`, `codebase/tools.py` | Báo Đạo nếu thay đổi cấu trúc kết quả hoặc mã trạng thái. |
| **Bảo** | `spec.md`, hợp đồng API, tài liệu, bằng chứng và bộ eval | Khi cần thay hợp đồng, thống nhất với Long, Đạo và An trước rồi cập nhật OpenAPI cùng PR. |

## 2. Kiểm tra, commit và mở PR

1. Chạy kiểm tra phù hợp với task. Dùng `python run.py check` cho benchmark và metric, `python run.py` cho luồng demo và `python run.py eval --try` khi nối model thật.
2. Xem `git status --short` và `git diff`. Stage đúng file của task và kiểm lại nội dung đã stage trước khi commit.

```powershell
git add -- "duong-dan-file-cua-task"
git diff --cached --stat
git commit -m "LONG-01: Dựng form tạo lộ trình"
git push -u origin HEAD
```

3. Trên GitHub, mở PR từ nhánh task vào `main`. Ghi mã task, thay đổi, cách test, kết quả đã kiểm và điểm còn vướng. Chuyển task sang **Chờ review** và dán link PR vào ghi chú ở tab DEV.
4. Bảo và người phụ trách phần tích hợp xem PR. Khi bản ghép qua kiểm tra, Bảo merge vào `main` và cập nhật task sang **Xong**.

## 3. Cập nhật nhánh đang làm

Chạy trên nhánh task sau khi xử lý các thay đổi đang dở:

```powershell
git fetch origin
git merge origin/main
```

Nếu conflict, phối hợp với người sở hữu file để giữ đúng cả hai phía, chạy lại luồng bị ảnh hưởng rồi commit phần xử lý. Dùng `git push` thông thường. Tránh force-push trên nhánh có người khác đang dùng.

## 4. Trước mỗi checkpoint

- Bảo kiểm bản `main` trên GitHub, chạy lệnh theo README và ghi commit dùng để nộp ở Sheet hoặc hồ sơ mốc.
- Giữ `.env` và key ở máy cá nhân. Dùng `.env.example` cho tên biến cấu hình. Dữ liệu người dùng phải được ẩn danh trước khi đưa vào repo. Xem [luật dữ liệu và eval](../AGENTS.md#luật--agent-không-được-làm).
- Giữ nguyên chuẩn đạt và metric đã khóa tại CP2. Chạy lại eval hoặc mô phỏng thành lượt mới và giữ hồ sơ các lượt cũ.
