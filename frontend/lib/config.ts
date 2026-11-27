/**
 * Chế độ gọi API khi tạo khóa. Đọc lúc build (hoặc lúc khởi động `npm run dev`).
 * - Mặc định: POST /api/courses?fixture=1 → backend trả bài SQL mẫu.
 * - NEXT_PUBLIC_USE_FIXTURE=0 → ?fixture=0, chạy workflow thật của backend.
 */
export const USE_FIXTURE = process.env.NEXT_PUBLIC_USE_FIXTURE !== "0";
