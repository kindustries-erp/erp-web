# Thêm cờ is_lio_device cho tính năng Quick Admin Login

## Mục tiêu
Cho phép tài khoản người dùng/admin (đặc biệt là lio) hiển thị nhanh nút Quick Login Admin trên web bằng cách set cờ `is_lio_device = 'true'` trong `localStorage`. Tính năng này được ẩn đi đối với người dùng bình thường để đảm bảo giao diện gọn gàng và tránh rủi ro bảo mật (hiển thị nút admin login ra ngoài).

## Thực hiện
- **Sửa file:** `src/pages/Login.tsx`
- **Chi tiết:** Thêm trạng thái `isLioDevice` lấy từ `localStorage` thông qua `useEffect` (để tránh lỗi hydration). Nút "Quick Login Admin" sẽ hiển thị nếu đang ở môi trường `localhost` hoặc nếu `isLioDevice` là `true`.

## Trạng thái
- [x] Đã hoàn thành code
- [x] Chờ commit và push
