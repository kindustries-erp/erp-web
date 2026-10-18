---
name: business-partners
description: Module tri thức Đối tác (Khách hàng & Nhà cung cấp) bản V2 trong erp-web (src/v2/modules/business-partners). Chứa cấu trúc module, luồng API qua v2HttpClient, preference bảng dùng chung V2, quy tắc domain và danh sách parity với bản V1.
---

# 📦 Module Tri Thức: Business Partners V2 - Frontend (`erp-web`)

## 1. Phạm vi

- Route: `/v2/customers` (`partnerType = CUSTOMER`) và `/v2/suppliers` (`partnerType = VENDOR`).
- Quyền: `business_partners` với action `read` (route guard), `create` / `update` / `delete` (nút và row action).
- Backend: `/api/v1/business-partners` (không đổi), xóa là xóa mềm.
- Module V2 **không import** code V1 (`@/core/*`, `@/shared/*`, `@/modules/*` ngoại trừ `authStore`). Xem mục 5.

## 2. Cấu trúc

```text
src/v2/modules/business-partners/
├── api/
│   ├── businessPartnersApi.ts          # businessPartnersV2Api (qua v2HttpClient) + toBusinessPartnerListParams
│   ├── dtos/businessPartner.dto.ts     # Hình dạng response/payload backend
│   ├── queries/                        # useBusinessPartnersQuery, businessPartnerKeys
│   └── mutations/                      # useSaveBusinessPartnerMutation, useRemoveBusinessPartnerMutation
├── domain/
│   ├── entities/businessPartner.ts     # BusinessPartner, BusinessPartnerFormValue
│   └── rules/businessPartnerRules.ts   # validate form, dirty, khóa mã, trạng thái ngưng
├── components/                         # Atomic: molecules/ và organisms/ (mỗi thư mục có index.ts + test)
│   ├── molecules/business-partner-status-badge/   # Nhãn Hoạt động/Ngưng dùng ở cột bảng và tiêu đề drawer
│   └── organisms/
│       ├── business-partner-table/     # Cột bảng + 3 chế độ xem hệ thống
│       └── business-partner-form/      # Các section form + control (view/edit)
├── drawers/                            # Drawer chi tiết/tạo mới (hook + drawer, ghép organism form)
├── pages/                              # BusinessPartnersPage + useBusinessPartnersPage
├── tests/integration/                  # Page + form + mutation với service mock
└── businessPartners.locale.ts          # i18n VI/EN (registerV2ModuleLocale "partners")
```

## 3. Luồng dữ liệu

- Mọi request đi qua `src/v2/shared/api/v2HttpClient.ts`: gắn Bearer token, refresh 401 (single-flight), retry GET khi 502/503/504 hoặc lỗi mạng, mở modal khi 409 `DOCUMENT_IN_USE`.
- Lỗi và thành công của mutation hiện toast qua `useV2ToastStore` (`V2Toaster` mount ở `AppProviders`). Thông báo lỗi ưu tiên `message` từ server, không có thì dùng chuỗi đã dịch.
- Bảng dùng `V2StandardTable` server mode; `tableId` là `erp-customers-table` / `erp-vendors-table` (giữ nguyên từ V1 để migrate đúng preference).

## 4. Preference bảng (dùng chung V2)

- Store: `src/v2/shared/preferences/useV2TablePreferencesStore.ts`, persist key `v2_table_preferences`.
- Đồng bộ server: `PATCH /api/v1/app/preferences` với key `v2:<tableId>` (không ghi đè shape V1 ở key `<tableId>`). Nạp lại khi đăng nhập qua `loadFromServer()`.
- Migration một lần từ `erp_preferences` (V1): `migrationVersion` = 1. Map key view hệ thống `legal_tax` → `legal`, `all_columns` → `all`.
- Storage cho bảng: `v2ColumnPreferencesStorage`, `v2ViewPresetStorage`, `applyV2SystemView`.

## 5. Phụ thuộc còn lại từ V1 (có chủ đích)

- `@/modules/auth/domain/authStore`: session đăng nhập dùng chung giữa V1 và V2 (theo workflow Dual-Run).
- Translation V2 đã tách khỏi V1: `useV2Translation` đọc `useV2LocaleStore` (seed một lần từ `erp-app` của V1 bằng cách đọc localStorage). Mọi key phải có tiền tố `v2.`.

## 6. Parity với V1 (`modules/business-partners-core`)

| Tính năng V1 | V2 |
|---|---|
| Cột STT 1-based | Có (V2StandardTable tự render `__index`) |
| Badge "Ngưng" + tooltip cạnh mã khi INACTIVE | Có |
| Copy mã, MST, điện thoại, email | Có |
| Mã chỉ nhập khi tạo; nút sinh mã chỉ hiện khi tạo | Có |
| Lọc khoảng ngày `createdAt` | Có (`date_ranges`, backend đã hỗ trợ) |
| Page size mặc định 50 (màn hình ≥ 900px) / 20 | Có (`getDefaultPageSize` của V2) |
| Toast tạo/sửa/xóa thành công và thất bại | Có (theo module, không qua interceptor) |
| Toast thiếu tên đối tác | Có |
| Toast lỗi tải danh sách và chi tiết | Có |
| Modal chứng từ phụ thuộc khi xóa (409) | Có (`V2DocumentDependencyModal`) |
| Lưu cột/view theo bảng, đồng bộ server | Có (mục 4) |
| Chặn trang khi không có quyền đọc | Có (route guard) |

Khác biệt đã biết: thông báo lỗi mạng/timeout dùng chuỗi do caller truyền (V1 có chuỗi riêng); V2 không đặt cờ 403 toàn cục và không có luồng impersonation (đều là hạ tầng auth, không thuộc module này).

## 7. Kiểm thử

```bash
cd erp/erp-web
bun run test src/v2/modules/business-partners/
bun run test src/v2/shared/api src/v2/shared/preferences src/v2/shared/stores
bunx tsc --noEmit
```

## 8. Liên quan

- Workflow: `/erp-web-v2-refactor` (Rolling Migration: chỉ chạy khi có lệnh từ user).
- Module V1 đối chiếu: `src/modules/business-partners-core/` (vẫn được dùng bởi PurchaseOrder V1, không xóa).
