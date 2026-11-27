import type { Course } from "../types/course";

/** Mở /courses/view?id=mau để xem khóa mẫu mà không cần backend. */
export const SAMPLE_ROUTE_ID = "mau";

/**
 * Chép nguyên example "sql" của Course trong docs/openapi.json
 * (paths./api/courses/{id}.get.responses.200). Đây là DỮ LIỆU MẪU.
 */
export const SAMPLE_COURSE: Course = {
  id: "course-demo-sql",
  title: "SQL để phân tích doanh thu",
  learner_group: "university",
  minutes_per_day: 20,
  mode: "mock",
  source_mode: "mock",
  plan: [
    { day: 1, title: "Đọc và lọc một bảng", objective: "Chọn cột và lọc đơn hàng theo số tiền." },
    { day: 2, title: "Sắp xếp dữ liệu", objective: "Đọc doanh thu từ cao xuống thấp." },
    { day: 3, title: "Tính tổng", objective: "Nhóm đơn theo danh mục và tính tổng." },
    { day: 4, title: "Nối hai bảng", objective: "Nối đơn hàng với danh mục qua ID." },
    { day: 5, title: "Hoàn thiện báo cáo", objective: "Viết truy vấn trả doanh thu theo danh mục." },
  ],
  lesson: {
    day: 1,
    title: "Đọc và lọc một bảng",
    minutes: 20,
    sections: [
      {
        text: "SELECT lấy dữ liệu từ bảng. WHERE chọn những dòng thỏa điều kiện.",
        source_ids: ["S1"],
      },
    ],
    example: "SELECT amount FROM orders WHERE amount > 500000;",
    exercise: "Đổi ngưỡng lọc xuống 200000 và dự đoán các dòng còn lại.",
  },
  sources: [
    {
      id: "S1",
      title: "PostgreSQL Tutorial — Querying a Table",
      url: "https://www.postgresql.org/docs/current/tutorial-select.html",
      excerpt: "SELECT lấy dữ liệu từ bảng. WHERE giữ những dòng thỏa điều kiện.",
    },
  ],
};
