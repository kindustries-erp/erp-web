---
description: Quy trình kiểm tra, review code, phân tích giao diện và hỏi đáp kỹ thuật trong erp-web (Read-Only 100%, không tự ý lập plan hay sửa code)
---

# 🔍 ERP Web Review & Technical Q&A Workflow (`/erp-review`) - Frontend

Workflow khi người dùng muốn kiểm tra, review giao diện, phân tích component/hook hoặc hỏi đáp kỹ thuật liên quan đến **`erp-web`** (React, Vite, TanStack Query, Tailwind, zustand) mà **CHƯA MUỐN LÊN PLAN & CHƯA SỬA CODE**.

Nạp trước: `erp-web-truth`, `erp-ui-structure`, và `.agents/skills/modules/<module>/SKILL.md` của module đang hỏi (nếu có). Rule đối chiếu lấy từ `/erp-local-changes-audit` (bảng rule web), không chép lại ở đây.

---

## 🎯 Khi Nào Kích Hoạt

1. Hỏi về luồng render, state management, form handling hoặc custom hook.
2. Review một Component, Page, Drawer, Modal hoặc API Client Hook.
3. Tìm nguyên nhân bug giao diện (lệch CSS, mất state, fetch loop, filter không ăn, validation không chạy).
4. Thảo luận chuẩn hóa giao diện (V1 hay V2) trước khi làm.

Phân biệt với workflow khác: `/erp-local-changes-audit` kiểm diff local và lập plan nếu FAIL; `/erp-bug-fix` sửa lỗi có kiểm chứng; `/erp-plan` lập kế hoạch tính năng.

---

## 🛡️ 4 Nguyên Tắc Cốt Lõi

1. **Read-Only 100%**: chỉ đọc mã (tìm file, grep, đọc file). Không sửa component, không chạy build hay test sinh artifact, không commit/push.
2. **Zero Premature Plan**: không tạo plan, task `X.Y.Z` hay tài liệu triển khai. Chỉ chuyển sang plan khi user yêu cầu rõ (ví dụ "OK, lên plan đi" hoặc gõ `/erp-plan`).
3. **Evidence-First**: mọi nhận định trích `file#dòng`. Đối chiếu response API thật với TypeScript interface, không suy đoán.
4. **Chuẩn V2 và token**: đối chiếu theo bảng rule của audit web, không tự đặt tiêu chí mới.

---

## 📋 Checklist Đánh Giá

Đánh giá nhanh theo các mảng dưới. Với file hoặc module được hỏi, áp dụng đầy đủ bảng rule của `/erp-local-changes-audit` web. Mỗi rule ghi PASS, FAIL hoặc "chưa kiểm", kèm `file#dòng`.

- **Cấu trúc**: giới hạn 180/250 dòng; tách Presentation và hook; folder-per-component; import một chiều; core theo họ qua barrel (`erp-ui-structure`).
- **V2 Atom và component chuẩn**: trong `src/v2/**` không có thẻ HTML trần khi đã có atom; bảng dùng `V2StandardTable` (V2) hoặc `SpreadsheetPageTemplate` (V1); drawer dùng `V2StandardDrawer` (V2) hoặc `StandardFormDrawer` (V1); xác nhận dùng `V2ConfirmModal`. Chọn đúng skill: `standardize-table`, `standardize-drawer`, `standardize-modal`.
- **Field FK + giá trị song song**: dùng `V2LinkedField`/`useLinkedField`, không tự dựng cặp combobox + input; giá trị điền là giá trị nguồn thuần (`getSourceText`), id và giá trị song song đặt bằng hai setter riêng.
- **Data fetching**: `@tanstack/react-query` với query key chuẩn; không `useEffect` + fetch thủ công.
- **Token và theme**: không `blue-*`; màu có token ngữ cảnh phải dùng token; không opacity trên token `var()`.
- **i18n**: không chuỗi hiển thị cứng; V2 dùng `useV2Translation`, key `v2.*`, đủ VI và EN.
- **TypeScript**: không `any`; có Props interface; không tắt lint bằng comment tùy tiện.
- **Test**: logic mới có `.test.tsx` hoặc `.test.ts` đi kèm.

Nếu hỏi về contract API, đối chiếu DTO của `erp-api` (xem `erp-api-truth`), không đoán field.

---

## 💬 Định Dạng Phản Hồi

```markdown
### 1. Hiện trạng / Trả lời
[Nhận định hoặc giải đáp ngắn gọn, đi thẳng vào câu hỏi]

### 2. Dẫn chứng mã nguồn (Evidence)
- File `[erp/erp-web/src/...#L...]`: [Component hoặc hook liên quan]
- Rule audit (nếu có review): PASS/FAIL/chưa kiểm, kèm `file#dòng`
- Rủi ro (nếu có): [render loop, mất type safety, layout vỡ, lệch chuẩn V2...]

### 3. Đề xuất phương án
- **Phương án 1 (Khuyến nghị)**: [mô tả + ưu điểm theo chuẩn V2]
- **Phương án 2 (Thay thế)**: [mô tả + hạn chế]

---
*(Chờ phản hồi từ User trước khi chuyển sang lập Plan triển khai)*
```
