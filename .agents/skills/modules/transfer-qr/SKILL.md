---
name: transfer-qr-web
description: Tri thức frontend cho drawer tạo mã QR chuyển khoản VietQR (lõi transfer-qr-core, module transfer-qr-bank-statements, nối vào dropdown Thao tác của tab Ngân hàng).
---

# Transfer QR (erp-web)

## Phạm vi
- Lõi họ: `src/v2/core/transfer-qr-core/` (barrel `@/v2/core/transfer-qr-core`, manifest `core.manifest.json`).
- Module: `src/v2/modules/transfer-qr-bank-statements/` (lớp ghép: map tài khoản ERP sang kiểu lõi, drawer bọc, API client `banksCatalogApi.ts` và hook `useBanksCatalog.tsx` hỗ trợ infinite scroll và tìm kiếm từ `GET /api/v2/banks-management` lưu trong DB nội bộ).
- Điểm nối V1: dropdown "Thao tác" của tab Ngân hàng `/cashflow?tab=bank`, mục "Tạo mã QR chuyển khoản", chỉ khi `type === "bank"`. Nối tại `modules/bank-statements/components/BankStatementsTab/` (`hooks/useBankStatementActions.tsx`, `useBankStatementsTabLogic.tsx`, `BankStatementSection.tsx`, `components/BankStatementDrawers.tsx`).
- Điểm nối Settings: `BankAccountDrawer.tsx` dùng `useBanksCatalog` cho phép chọn ngân hàng trực tiếp từ Combobox có sẵn logo icon, tự động điền mã và tên ngân hàng.

## Hai luồng
- **Trả tiền nhà cung cấp** (`TransferQrMode.PAY_TO_SUPPLIER`): chọn ngân hàng, nhập số tài khoản, tên chủ tài khoản (tùy chọn / optional để đối chiếu, không bắt buộc, không nằm trong chuỗi QR), số tiền, nội dung.
- **Nhận tiền từ khách** (`TransferQrMode.RECEIVE_FROM_CUSTOMER`): chọn tài khoản công ty. Nếu tài khoản không khớp được BIN thì hiện thêm combobox chọn ngân hàng.
- **Nhiều lệnh thanh toán** (tab thứ hai "Nhiều lệnh thanh toán", chỉ trả NCC): bảng tối đa 50 dòng (`MAX_BATCH_ROWS`), mỗi dòng một mã QR. Có ô "Dán từ Excel": copy các cột theo thứ tự cố định `Ngân hàng | Số tài khoản | Tên chủ tài khoản | Số tiền | Nội dung`, tự bỏ dòng tiêu đề (cột đầu là "Ngân hàng" hoặc "Bank"), dán thêm vào cuối và bỏ dòng trống đang có. Ngân hàng khớp bằng `resolveBankBin`; không khớp thì dòng báo lỗi và không có QR. Số tiền chấp nhận `1.500.000`, `1,500,000`, `1500000`, `1.500`, hậu tố `VND`/`đ`; số thập phân (`150.5`, `1,5`) hoặc không đọc được thì đánh dấu lỗi dòng, không tự chia tỷ lệ. Trường tên chủ tài khoản là tùy chọn, không chặn tính hợp lệ của dòng.
  - Xuất: tải PNG từng mã, ZIP (`QR_nhieu_lenh_<yyyymmdd-hhmm>.zip`, tên trong ZIP có số thứ tự `01_QR_…`), PDF A4 (`QR_nhieu_lenh_<yyyymmdd-hhmm>.pdf`, lưới 2x3, 6 mã mỗi trang). Toàn bộ ảnh PNG, ZIP và PDF A4 đều dùng chung helper `captureCardImage` (`helpers/batchDownloads.ts`) chụp DOM `TransferQrPaymentCard` (nền trắng bo góc, logo VietQR/Napas 247/ngân hàng, logo tâm QR, tiếng Việt có dấu) để đồng nhất 100% với tab "Một mã QR".
  - Bố cục PDF do `helpers/layoutBatchPage.ts` và `helpers/batchPdfRender.ts` quyết định: ô 93x86 mm, giữ header/footer trang A4; khi có `cardImageDataUrl` thì dùng `fitRectInBox` nhúng ảnh thẻ giữ nguyên tỷ lệ khung hình (không méo QR); nếu thiếu DOM thẻ hoặc capture lỗi thì tự động fallback về vẽ vector `jsPDF` (chữ bỏ dấu qua `foldForPdf`, QR giữ nguyên dữ liệu gốc).
- Drawer (`drawers/TransferQrDrawer.tsx`) theo chuẩn V2: `V2StandardDrawer` `layout="2-columns"`, cỡ XL cố định. Tab đầu drawer là "Một mã QR" | "Nhiều lệnh thanh toán"; tab một mã có `leftTabs` Trả tiền NCC / Nhận tiền (đổi `form.mode`); mỗi tab có `content` (form hoặc ô dán + bảng) và `rightPanel` (xem trước Thẻ thanh toán VietQR Napas 247 hoặc tổng hợp + lưới). Nút tải nằm ở `actions` của footer (PNG; ZIP và PDF khi có dòng hợp lệ).
  - **Khối Thẻ thanh toán (TransferQrPaymentCard)**:
    - Header chỉ giữ badge trạng thái giao dịch (`THẺ NHẬN TIỀN` hoặc `LỆNH THANH TOÁN`), bỏ badge thừa góc phải để giao diện thông thoáng.
    - Phía trên khung QR có Logo thương hiệu VietQR chữ ngang (`VIETQR_HORIZONTAL_LOGO`); ở tâm mã QR có logo chữ V đỏ của VietQR (với lệnh trả NCC) hoặc logo công ty (với lệnh nhận tiền, tự động fallback về logo V khi ảnh lỗi);
    - Phía dưới khung QR là cụm 2 logo cân đối thị giác: Napas 247 (`h-3.5 max-w-[70px]`) bên trái, vạch ngăn cách dọc và Logo Ngân hàng thụ hưởng (`h-4.5 max-w-[64px]`) bên phải.
    - Khối chi tiết thanh toán hiển thị rõ ràng thông tin người nhận, số tài khoản, số tiền và nội dung; lược bỏ dòng ghi chú phụ ở chân thẻ giúp thẻ thanh toán tinh gọn, đẹp mắt và tối giản.
    - Toàn bộ asset thương hiệu được đóng gói nội bộ Data URL Base64 (`assets/vietQrBrandAssets.ts`) để đảm bảo Zero-Leak và Zero-CORS khi xuất ảnh PNG bằng `html-to-image`.
  - **Mức sửa lỗi QR**: Dùng `errorCorrectionLevel: "H"` (30%) cho cả Single và Batch controller để đảm bảo các ứng dụng ngân hàng quét nhận diện tức thì ngay cả khi có logo che phủ ~20% ở tâm mã.
  - `jszip` và `jspdf` nạp động khi bấm tải, không tăng bundle chính.
  - Không lưu danh sách (không DB, không localStorage); đóng drawer là xóa toàn bộ danh sách.

## Hợp đồng chuỗi VietQR (`domain/rules/vietQrPayload.ts`)
- `00`=01; `01`=11 (QR tĩnh) hoặc 12 (có số tiền); `38` gồm GUID `A000000727`, tầng con BIN (`00`) + số tài khoản (`01`), dịch vụ `QRIBFTTA` (`02`); `53`=704; `54` số tiền (chỉ khi có); `58`=VN; `62.08` nội dung; `63` CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF).
- Nội dung: bỏ dấu, đ→d, giữ nguyên ký tự gạch nối `-`, các ký tự đặc biệt khác đổi thành MỘT dấu cách (không xóa, để chữ không dính), gộp khoảng trắng liên tiếp và trim đầu cuối, tối đa 95 ký tự. Ví dụ `HD-001/2025` → `HD-001 2025`, `A-B_C` → `A-B C`, `NCC (ABC)-01` → `NCC ABC -01`. Dưới ô nội dung có dòng "Nội dung trên QR" khi chuỗi làm sạch khác chuỗi gốc. Ô nhập nội dung tự động trim khoảng trắng khi blur.
- Giới hạn 95 không phải tùy ý: thẻ `62` có độ dài 2 chữ số và chứa sub-tag `08` (4 ký tự phần đầu), nên nội dung tối đa 99 - 4 = 95 để payload hợp lệ theo EMVCo. `tlv()` ném `RangeError` nếu một trường vượt 99 ký tự. VietQR/Napas thường chỉ nhận khoảng 25 ký tự; app ngân hàng có thể cắt chuỗi dài hơn, cần kiểm tra với app ngân hàng thật.
- Số tài khoản: chữ và số, tối đa 19 ký tự. Số tiền: nguyên dương, tối đa 999.999.999.999 VND. Nhập "1.500.000" hay "1,500,000" đều được.
- Test vector CRC: `"123456789"` → `29B1`.

## Khớp ngân hàng (`domain/rules/resolveBankBin.ts`)
- `bank_code` của `erp_bank_accounts` là chuỗi tự do. `resolveBankBin` khớp theo mã, tên ngắn, BIN, alias (không phân biệt dấu, hoa thường). Không khớp chính xác thì thử khớp chứa alias dài ≥ 4 ký tự, lấy alias dài nhất (ví dụ tên đầy đủ của Saigonbank không bị nhầm sang SCB). Nếu hai ngân hàng khác nhau cùng có alias dài nhất bằng nhau thì trả null, không đoán. Không khớp trả null.
- Danh sách BIN: `domain/constants/vietQrBanks.ts` (37 ngân hàng). Đã đối chiếu 2026-11-18 với `https://api.vietqr.io/v2/banks`: BIN khớp 100%, mã viết tắt và tên ngắn theo VietQR; tên cũ nằm trong `aliases`. Khi Napas đổi BIN hoặc thêm ngân hàng, đối chiếu lại với cùng API.

## Quy tắc
- QR tạo hoàn toàn trên trình duyệt bằng thư viện `qrcode`. Không gọi `img.vietqr.io` hay dịch vụ ngoài, không log số tài khoản.
- Đóng drawer thì reset form (`useTransferQrController`).
- Tải về là PNG, tên `QR_<mã ngân hàng>_<số tài khoản>[_<số tiền>].png`.
- Lệnh chuyển tiền vẫn do người dùng xác nhận trong app ngân hàng; hệ thống không tự chuyển tiền.
- i18n: namespace `transferQr`, key `v2.transferQr.*`, VI/EN có test parity (`transferQr.locale.test.ts`).
- Module `bank-statements` không chứa code QR; chỉ có hai dòng nối ở drawers và dropdown.

## Còn lại
- E2E `e2e/transfer-qr-bank-statements.e2e.mjs` đã PASS trên dev (một lệnh, batch dán 3 dòng, ZIP, PDF, không request ra ngoài). Chạy bằng `bun run e2e:transfer-qr-bank-statements`.
- Chưa có "người nhận gần đây" (task 2.4.1, P2, chưa làm).
- Chưa có QR theo từng dòng sao kê.
- Chưa có batch cho chế độ "Nhận tiền từ khách".
- `domain/constants/vietQrBanks.ts` dài 278 dòng, là bảng dữ liệu thuần nên không tách.

## Trạng thái và enum (đợt nâng cấp)
- Mode và tab là enum: `TransferQrMode` (`PAY_TO_SUPPLIER`, `RECEIVE_FROM_CUSTOMER`), `TransferQrDrawerTab` (`SINGLE`, `BATCH`) trong `transferQr.types.ts`. Nhãn tab trái lấy từ map `TRANSFER_QR_MODE_LABEL_KEY: Record<TransferQrMode, string>`. Không dùng chuỗi cứng cho mode.
- Đổi chế độ thì xóa `bin` cũ (`patchForm` trong `useTransferQrController`) để BIN của chế độ trả tiền không rò sang chế độ nhận tiền.
- Tải ZIP/PDF lỗi: `downloadFailed` của `useTransferQrBatchController` bật và hiện thông báo trong side panel; thao tác thành công sau đó tắt cờ.
- QR của phiên đã đóng: `generationRef` bỏ kết quả cũ, không ghi vào cache.
- `confirmOnClose` của drawer QR bật khi đã nhập dữ liệu (một mã) hoặc có dòng (nhiều lệnh), cả khi đã tải QR.
- Bảng nhiều lệnh: đổi ngân hàng đi qua `bankFieldsFromBin` nên BIN và mã viết tắt luôn khớp (tên file, chữ dưới QR, lưới).
- Chế độ nhận tiền: số tài khoản ERP phải qua `isValidAccountNumber` trước khi tạo QR; BIN dự phòng chọn tay cập nhật mã viết tắt theo BIN đó.


## Biến thể HORIZONTAL và prop `stacked` (2026-11-27)

- `TransferQrPaymentCardDetails` nhận `stacked?: boolean` (mặc định `false`). `TransferQrPaymentCard` truyền `stacked={isHorizontal}`.
- `stacked`: "Chủ tài khoản" và "Nội dung" xếp nhãn một dòng, giá trị xuống dòng bên dưới (`break-words` / `break-all`, không `truncate`). "Số tài khoản" và "Số tiền" giữ bố cục nhãn trái, giá trị phải.
- Biến thể `FULL` không đổi (drawer, tải QR, PDF hàng loạt).
- Test: `TransferQrPaymentCardDetails.test.tsx`.
