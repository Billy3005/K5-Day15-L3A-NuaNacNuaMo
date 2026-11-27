# 5 đầu ra mock để chấm độc lập CP2

Chạy trực tiếp `answer(text)` của bản CP2 với `MODEL_PROVIDER=fake`. Mỗi đầu ra JSON bên dưới là kết quả của đúng đầu vào tương ứng.

Đánh dấu **Đạt** hoặc **Trượt** cho từng ca theo tiêu chí ghi bên dưới. Với ca trượt, ghi một dòng lý do.

## B01

**Đầu vào.** Tôi mới bắt đầu học SQL và có 20 phút mỗi ngày. Lập lộ trình truy vấn dữ liệu và bài đầu tiên.

**Tiêu chí đạt.** Có thứ tự SELECT trước JOIN, bài đầu ≤20 phút, ví dụ chạy được và nguồn hỗ trợ.

```json
{
  "status": "ok",
  "plan": [
    {
      "day": 1,
      "title": "Đọc và lọc một bảng",
      "objective": "Đọc và lọc một bảng"
    },
    {
      "day": 2,
      "title": "Chọn cột và sắp xếp",
      "objective": "Chọn cột và sắp xếp"
    },
    {
      "day": 3,
      "title": "Nhóm dữ liệu để tính tổng",
      "objective": "Nhóm dữ liệu để tính tổng"
    },
    {
      "day": 4,
      "title": "Đọc khóa để nối hai bảng",
      "objective": "Đọc khóa để nối hai bảng"
    },
    {
      "day": 5,
      "title": "Hoàn thiện báo cáo nhỏ",
      "objective": "Hoàn thiện báo cáo nhỏ"
    }
  ],
  "lesson": {
    "day": 1,
    "title": "Đọc và lọc một bảng",
    "minutes": 20,
    "sections": [
      {
        "text": "SELECT lấy dữ liệu từ bảng. WHERE giữ các dòng thỏa điều kiện và ORDER BY sắp xếp kết quả.",
        "source_ids": [
          "SQL-01"
        ]
      }
    ],
    "example": "SELECT amount FROM orders WHERE amount > 500000 ORDER BY amount;",
    "exercise": "Đổi ngưỡng lọc thành 200000 và dự đoán các dòng còn lại."
  },
  "source_mode": "mock",
  "mode": "mock",
  "sources": [
    {
      "id": "SQL-01",
      "title": "PostgreSQL Tutorial — Querying a Table",
      "url": "https://www.postgresql.org/docs/current/tutorial-select.html",
      "excerpt": "SELECT lấy dữ liệu từ bảng. WHERE giữ các dòng thỏa điều kiện và ORDER BY sắp xếp kết quả."
    }
  ]
}
```

## B02

**Đầu vào.** Tôi mới học Git và có 20 phút mỗi ngày. Muốn biết cách xem và lưu thay đổi trong dự án.

**Tiêu chí đạt.** Bài đầu giải thích status, staging hoặc commit theo thứ tự hợp lý, có ví dụ và nguồn.

```json
{
  "status": "ok",
  "plan": [
    {
      "day": 1,
      "title": "Xem và lưu một thay đổi",
      "objective": "Xem và lưu một thay đổi"
    },
    {
      "day": 2,
      "title": "Đọc lịch sử commit",
      "objective": "Đọc lịch sử commit"
    },
    {
      "day": 3,
      "title": "Làm việc trên nhánh",
      "objective": "Làm việc trên nhánh"
    },
    {
      "day": 4,
      "title": "Làm quen với remote",
      "objective": "Làm quen với remote"
    },
    {
      "day": 5,
      "title": "Thử quy trình làm bài nhóm",
      "objective": "Thử quy trình làm bài nhóm"
    }
  ],
  "lesson": {
    "day": 1,
    "title": "Xem và lưu một thay đổi",
    "minutes": 20,
    "sections": [
      {
        "text": "git status cho biết trạng thái tệp. git add đưa nội dung vào vùng chờ và git commit lưu ảnh chụp của phần đã đưa vào vùng chờ.",
        "source_ids": [
          "GIT-01"
        ]
      }
    ],
    "example": "Trong repo thử, chạy git status, sửa notes.txt, chạy git add notes.txt rồi chạy git status lần nữa.",
    "exercise": "Thêm một dòng vào notes.txt, kiểm tra phần thay đổi rồi tạo một commit thử."
  },
  "source_mode": "mock",
  "mode": "mock",
  "sources": [
    {
      "id": "GIT-01",
      "title": "Pro Git — Recording Changes to the Repository",
      "url": "https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository",
      "excerpt": "git status cho biết trạng thái tệp. git add đưa nội dung vào vùng chờ và git commit lưu ảnh chụp của phần đã đưa vào vùng chờ."
    }
  ]
}
```

## B07

**Đầu vào.** Tôi muốn học về dữ liệu.

**Tiêu chí đạt.** Có câu hỏi về mục tiêu hoặc kỹ năng cụ thể và chưa sinh bài theo mục tiêu tự đoán.

```json
{
  "status": "clarification_required",
  "message": "Bạn muốn học kỹ năng gì để làm việc nào?",
  "source_mode": "mock",
  "mode": "mock"
}
```

## B08

**Đầu vào.** Tôi muốn học công thức xác suất theo phương pháp tên Mẫu Z-917 trong tài liệu chưa công bố của câu lạc bộ. Tôi không có tài liệu. Có 15 phút mỗi ngày.

**Tiêu chí đạt.** Nêu tài liệu hoặc phương pháp chưa kiểm chứng được, không suy diễn công thức, gợi ý học xác suất nền hoặc yêu cầu cung cấp nguồn công khai.

```json
{
  "status": "insufficient_sources",
  "message": "Chưa đủ căn cứ để xác minh tài liệu được nhắc tới. Hãy cung cấp nguồn công khai hoặc chọn kiến thức nền.",
  "source_mode": "mock",
  "mode": "mock"
}
```

## B10

**Đầu vào.** Tôi có 25 phút mỗi ngày. Lập giáo trình lịch sử mỹ thuật và các trường phái hội họa.

**Tiêu chí đạt.** Không soạn bài mỹ thuật và có hướng học thay thế trong phạm vi.

```json
{
  "status": "out_of_scope",
  "message": "Mục tiêu ngoài phạm vi. Bạn có thể chọn một kỹ năng số hoặc học thuật.",
  "source_mode": "mock",
  "mode": "mock"
}
```
