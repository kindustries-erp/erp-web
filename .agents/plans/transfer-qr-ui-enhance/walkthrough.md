# Walkthrough: Hoàn thiện Enhance Thẻ Thanh Toán & Style Bảng Kê PDF (Transfer QR Core)

## 1. Mục tiêu hoàn thiện
- [x] **Enhance Thẻ QR Thanh toán (Napas 247)**:
  - Phân biệt rõ ràng 2 ngữ cảnh:
    - **QR Nhận tiền từ khách (`receive`)**: Header hiển thị Logo công ty (nếu có, không có thì ẩn hẳn - không hiện fallback icon), Tên công ty đầy đủ không bị che, Mã số thuế, Badge `THẺ NHẬN TIỀN` & `VIETQR | NAPAS 247`. Chủ tài khoản nhận tiền mặc định là tên công ty.
    - **QR Trả tiền NCC / Nhiều lệnh thanh toán (`pay`)**: Header tinh gọn, không hiển thị tên & MST công ty. Hiển thị Badge Amber `#STT LỆNH THANH TOÁN` & `VIETQR | NAPAS 247`.
- [x] **Xuất ảnh Thẻ thanh toán (PNG / ZIP)**:
  - Khi tải ảnh PNG từ tab một mã QR, hoặc tải PNG từng dòng / tải ZIP tất cả từ tab nhiều lệnh thanh toán: Toàn bộ ảnh xuất ra đều là Thẻ thanh toán hoàn chỉnh, sang trọng chuẩn VietQR Napas 247.
- [x] **Enhance Style Bảng kê PDF A4 (`QR_nhieu_lenh_*.pdf`)**:
  - Từng ô thẻ trong file PDF A4 được tái thiết kế chuẩn chuyên nghiệp:
    - **Top Bar**: Badge trái `#1 LENH THANH TOAN` (vàng hổ phách), Badge phải `VIETQR | NAPAS 247` (slate/napas), đường kẻ phân cách mờ.
    - **Khung QR**: Kích thước 36x36mm sắc nét, bo viền mờ, tên ngân hàng căn giữa `[bankCode] (Napas 247)`.
    - **Details Box**: Hộp thông tin nền sáng bo viền mềm chia 2 cột rõ ràng (Trái: Label `Nguoi nhan`, `So tai khoan`, `So tien`, `Noi dung` | Phải: Giá trị căn phải, số tiền in đậm màu xanh Emerald).
    - **Footer thẻ**: Dòng ghi chú nhỏ chuẩn mực `* Quet bang app ngan hang bat ky (Napas 247)`.

---

## 2. Các file đã thay đổi & tạo mới
1. `src/v2/core/transfer-qr-core/helpers/batchPdfRender.ts`:
   - Hàm `drawBatchCardCell`: Triển khai Top Bar badge 2 bên, QR 36mm, tên ngân hàng và Details Box 4 hàng căn lề 2 bên chuẩn phiếu kế toán. (174 dòng, đạt chuẩn < 180 dòng).
2. `src/v2/core/transfer-qr-core/helpers/layoutBatchPage.ts`:
   - Điều chỉnh hằng số `QR_SIZE_MM = 36`, `CARD_HEADER_HEIGHT_MM = 8`, `QR_TOP_OFFSET_MM = 10.5` tạo không gian thoáng đãng cho Details Box.
3. `src/v2/core/transfer-qr-core/helpers/exportCardImage.ts`:
   - Trích xuất hàm `cardElementToPng` chuyên dụng render html-to-image chuẩn 2x pixel ratio.
4. `src/v2/core/transfer-qr-core/helpers/batchDownloads.ts`:
   - Hỗ trợ `downloadRowCard` và `downloadBatchZip` xuất trọn vẹn Payment Card cho từng lệnh chuyển khoản.
5. `src/v2/core/transfer-qr-core/hooks/useTransferQrBatchController.ts`:
   - Quản lý ref danh sách thẻ thanh toán `cardElementsRef`, kết nối hàm tải ảnh PNG và tải ZIP.
6. `src/v2/core/transfer-qr-core/drawers/TransferQrBatchView.tsx`:
   - Render hidden container chứa các `TransferQrPaymentCard` phục vụ xuất ảnh Thẻ thanh toán sắc nét khi tải PNG/ZIP.
7. `src/v2/core/transfer-qr-core/components/molecules/transfer-qr-payment-card/TransferQrPaymentCard.tsx`:
   - Component Thẻ thanh toán VietQR Napas 247 dùng chung cho cả đơn lẻ và hàng loạt.

---

## 3. Kết quả kiểm thử & Kiểm soát chất lượng (QC)
- **Unit Tests**:
  - `bunx vitest run src/v2/core/transfer-qr-core/`: **12/12 test files PASS, 94/94 tests PASS**.
- **Type Check**:
  - `bun run type:check`: **Hoàn toàn sạch lỗi (exit code 0)**.
- **Quy chuẩn kiến trúc**:
  - 100% file code tuân thủ nghiêm ngặt ngưỡng < 180 dòng theo `erp-ui-structure`.
