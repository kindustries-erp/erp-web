---
name: ai-hub
description: Tri thức AI Hub phía erp-web V2 (core/ai-hub, bộ component chat nổi dùng chung trong v2/shared, trợ lý AI đọc hóa đơn gắn vào trang garage-procurement). Đọc trước khi sửa chatbot nổi hoặc gắn trợ lý AI vào trang khác.
---

# AI Hub (erp-web V2)

## 1. Component dùng chung (`src/v2/shared`)

| Tầng | Component | Ghi chú |
| :--- | :--- | :--- |
| Atom | `V2ChatBubble` | `role`: `user` (phải, nền primary) hoặc `assistant` (trái, nền surface). `plain` bỏ nền để chứa thẻ, bảng |
| Atom | `V2TypingIndicator` | `role="status"`, ba chấm kèm nhãn |
| Atom | `V2FloatingActionButton` | Vùng chạm 48px. Vị trí do nơi dùng đặt qua `className` |
| Molecule | `V2ChatComposer` | Nút đính kèm một file (`accept`, `maxSizeBytes`, `onReject`). Có `onSend` thì hiện thêm ô nhập chữ |
| Organism | `V2FloatingChat` | Switcher theo `useViewport`. Desktop: panel `fixed` góc phải dưới, `z-40`, đóng bằng Escape. Mobile: `V2BottomSheet` cao 88dvh, nút nổi nằm trên bottom nav và vùng an toàn |
| API | `postV2Multipart(url, file, { fields, signal, timeoutMs })` | `src/v2/shared/api/v2Multipart.ts`; upload đầu tiên của V2 |

Các component trên không biết gì về AI hay hóa đơn; có story trong `Components/<Tier>/...`.

## 2. Core `src/v2/core/ai-hub`

- Namespace i18n: `v2.aiHub.*` (`locales/aiHub.vi.ts`, `aiHub.en.ts`). Tham số dùng `{{name}}`.
- `createAiInvoiceApi(basePath)`: `previewInvoice(file)` gọi `POST <base>/invoice-preview` (timeout 150 giây), `createRequest(payload)` gọi `POST <base>/purchase-requests`.
- `useAiInvoiceAssistant({ api, context, onCreated })`: máy trạng thái `idle → reading → review → creating → done`; giữ danh sách dòng nháp sửa được (mã hàng, số lượng).
- `AiInvoiceLineList`: danh sách dạng thẻ, nhãn "Đã có mã" / "Mã mới"; ô mã trống nghĩa là server tự sinh mã.
- `AiInvoiceAssistant`: ghép `V2FloatingChat` + tin nhắn + nút "Tạo đề nghị mua". Core không nhắc tên module; module truyền `api` và `onCreated`.
- Cảnh báo từ server là mã (`SKIPPED_LINES`, `MISSING_UNIT_PRICE`, `TOTAL_MISMATCH`), dịch qua `v2.aiHub.warning.<mã>`.

## 3. Gắn vào trang garage-procurement

- `src/v2/modules/garage-procurement-requests/GarageInvoiceAssistant.tsx`: API `/api/v2/ai-hub-garage`. Chỉ hiện khi có cả `ai_hub_garage:create` và `garage_procurement_requests:create`.
- Tạo xong: invalidate `["v2-garage-procurement-requests"]` rồi `requestsState.openSaved(requestId)` để mở phiếu nháp.
- Chỉ hiện ở tab `requests`. Overlays của trang đã tách thành `GarageProcurementRequestsPage.requestOverlays.tsx` và `.orderOverlays.tsx`.

## 4. Gắn trợ lý vào trang khác

1. Backend có module `ai-hub-<biến thể>` với hai endpoint cùng hợp đồng (xem skill `ai-hub-v2` của erp-api).
2. Trong module web: `createAiInvoiceApi("/api/v2/ai-hub-<biến thể>")`, bọc `AiInvoiceAssistant` bằng kiểm tra quyền, đặt vào slot `overlays` của `V2ModulePage`.
