# Task Index

## Quy tắc bắt buộc cho mọi task mới

### 1) No code without task
- Không bắt đầu sửa code khi chưa có task file trong `docs/tasks/`.
- Task mới nên khởi tạo từ template: `docs/tasks/_template.md`.

### 2) Tick done realtime
- Mỗi sub-task hoàn thành phải đổi ngay `- [ ]` -> `- [x]`.
- Không để dồn tick vào cuối task.

### 3) Lessons learned khi có issue
- Nếu gặp lỗi/blocker/sai hướng triển khai, bắt buộc ghi lessons learned trước khi đóng task.
- Dùng template: `docs/lessons-learned/_template.md`.
- Link lessons entry vào cuối task file để dễ tra cứu.

### 4) Thứ tự đọc trước khi làm task
1. `AGENTS.md`
2. `docs/ai/technical-instructions.md`
3. `docs/app-structure.md`
4. Task file cụ thể

---

## Feature: Payment Voucher Frontend

Thứ tự thực hiện **bắt buộc** (mỗi task phụ thuộc task trước).

| #                               | File                                                                                                               | Scope                                                                       | Dependency          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ------------------- |
| [01](task-01-api-contract.md)   | `src/modules/finance/api/financeApi.ts`                                                                            | Thêm types mới, 5 endpoint transition, mở rộng filter params                | —                   |
| [02](task-02-form-types.md)     | `src/modules/finance/types/voucherForm.ts` + `utils/financeHelpers.ts`                                             | Mở rộng form interfaces, thêm `COUNTERPARTY_SOURCE_OPTS`, cập nhật builders | Task 01             |
| [03](task-03-hook-logic.md)     | `useVoucherDrawer.ts` + `useCashVoucherHandlers.ts` + `useBankVoucherHandlers.ts`                                  | Transition endpoints, employee handler, conditional DTO build               | Task 01, 02         |
| [04](task-04-drawer-ui.md)      | `CashVoucherDrawer/index.tsx` + `TienGui.tsx` + `TienMat.tsx`                                                      | Source toggle UI, employee picker, action button matrix, snapshot preview   | Task 01, 02, 03     |
| [05](task-05-list-and-audit.md) | `useVoucherList.ts` + `VoucherTable/index.tsx` + `ApprovalHistory/index.tsx` (mới) + `TienGui.tsx` + `TienMat.tsx` | Filter counterparty_source, badge cột partner, audit history component      | Task 01, 02, 03, 04 |

---

## Feature: Login as User (Impersonation)

Thứ tự thực hiện **bắt buộc**. Chạy `tsc --noEmit` sau mỗi task trước khi chuyển task tiếp theo.

| #                                          | File                                                                                                        | Scope                                                                                                                                                     | Dependency  |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| [06](task-06-impersonate-api-types.md)     | `src/modules/auth/api/auth.ts`                                                                              | Thêm `ImpersonationActor`, `ImpersonationMetadata`, mở rộng `AuthProfileResponse`, thêm `impersonateApi`, `hasFullDirectusRolesAccess`                    | —           |
| [07](task-07-impersonate-auth-store.md)    | `src/modules/auth/domain/authStore.ts`                                                                      | Thêm `canImpersonate`, `impersonation`, actor snapshot fields, `impersonateAction`, `stopImpersonationAction`, cập nhật `bootstrapAction` và `partialize` | Task 06     |
| [08](task-08-impersonate-axios.md)         | `src/core/api/axiosInstance.ts`                                                                             | Xử lý 401 khi impersonation token hết hạn: restore actor session thay vì logout                                                                           | Task 07     |
| [09](task-09-impersonate-nhansu-ui.md)     | `src/pages/NhanSu.tsx` + locale files                                                                       | Thêm nút "Login as user" vào cột actions, gated by `canImpersonate`, ConfirmModal, toast                                                                  | Task 06, 07 |
| [10](task-10-impersonate-topbar-banner.md) | `src/core/components/layout/Topbar.tsx` + `src/modules/auth/components/UserProfileModal.tsx` + locale files | Impersonation banner trên topbar, section "Quay lại" trong UserProfileModal                                                                               | Task 07     |

## Quy tắc thực hiện

- Mỗi task file **tự chứa đủ context** để AI agent chạy trực tiếp mà không cần thêm prompt.
- Sau mỗi task, chạy `tsc --noEmit` để xác nhận compile sạch trước khi chuyển task tiếp theo.
- Không tạo thêm file ngoài task-05 (`ApprovalHistory/index.tsx`).
- Không refactor code không liên quan đến task.

## Lệnh kiểm tra nhanh

```bash
# Compile check
npx tsc --noEmit

# Dev server
npm run dev
```

## Tài liệu liên quan

- Canonical rules: `docs/ai/technical-instructions.md`
- Task template: `docs/tasks/_template.md`
- Lessons learned template: `docs/lessons-learned/_template.md`

## File đã obsolete

`docs/payment-voucher-frontend-plan.md` — superseded bởi task series này.
