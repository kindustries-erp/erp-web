---
name: business-partners
description: Module tri thức Đối tác (Khách hàng & Nhà cung cấp) bản V2 trong erp-web gồm V2 Core (src/v2/core/business-partners) và 2 thin modules (src/v2/modules/business-partners-customers và src/v2/modules/business-partners-suppliers). Chứa cấu trúc module, luồng API qua v2HttpClient, preference bảng dùng chung V2, quy tắc domain và danh sách parity với bản V1.
---

# 📦 Module Tri Thức: Business Partners V2 - Frontend (`erp-web`)

## 1. Phạm vi

- Route: `/v2/customers` (`partnerType = CUSTOMER`) và `/v2/suppliers` (`partnerType = VENDOR`).
- Quyền: `business_partners` với action `read` (route guard), `create` / `update` / `delete` (nút và row action).
- Backend: `/api/v2/business-partners` và `/api/v1/business-partners`, xóa là xóa mềm.
- Kiến trúc họ nghiệp vụ: Tách lõi dùng chung tại `src/v2/core/business-partners/` và 2 thin module mỏng tại `src/v2/modules/business-partners-customers/` và `src/v2/modules/business-partners-suppliers/`.
- Module V2 **không import** code V1 (`@/core/*`, `@/shared/*`, `@/modules/*` ngoại trừ `authStore`).

## 2. Cấu trúc

### A. V2 Core (`src/v2/core/business-partners/`)
```text
src/v2/core/business-partners/
├── core.manifest.json                  # Khai báo exports cho PlopJS discovery
├── businessPartners.config.type.ts   # BusinessPartnerModuleConfig
├── businessPartners.locale.ts        # i18n VI/EN v2.businessPartners.*
├── api/
│   ├── businessPartnerApi.type.ts      # Interface BusinessPartnerApi
│   ├── businessPartnersApi.ts          # businessPartnersV2Api (qua v2HttpClient)
│   ├── dtos/businessPartner.dto.ts     # DTOs
│   ├── queries/                        # useBusinessPartnersQuery, businessPartnerKeys
│   └── mutations/                      # useSaveBusinessPartnerMutation, useRemoveBusinessPartnerMutation, useSyncBusinessPartnersMutation
├── domain/
│   ├── entities/businessPartner.ts     # BusinessPartner, BusinessPartnerFormValue
│   └── rules/                          # businessPartnerRules (validate, dirty, lock code), partnerSelection
├── components/                         # Atomic: molecules/ và organisms/
│   ├── molecules/business-partner-status-badge/   # Nhãn Hoạt động/Ngưng
│   └── organisms/
│       ├── business-partner-table/     # Cột bảng + 3 chế độ xem hệ thống (overview, legal, all)
│       ├── business-partner-form/      # Các section form + control (view/edit)
│       ├── business-partner-picker/    # Ô chọn đối tượng cho sao kê
│       └── business-partner-sync-dialog/# Modal đồng bộ hóa đơn
├── drawers/                            # BusinessPartnerDrawer (hỗ trợ config) + hook
├── hooks/                              # useBusinessPartnerListController (quản lý bảng, drawer, xóa, view mode)
└── index.ts                            # Master barrel export duy nhất (@/v2/core/business-partners)
```

### B. Thin Modules (`src/v2/modules/`)
- **Khách hàng** (`src/v2/modules/business-partners-customers/`):
  - `tableId`: `business-partners-customers-table`
  - `partnerType`: `CUSTOMER`
  - `BusinessPartnersCustomersPage.tsx` + `hook.ts` + `config.ts` + `locale.ts` + `integration test`
- **Nhà cung cấp** (`src/v2/modules/business-partners-suppliers/`):
  - `tableId`: `business-partners-suppliers-table`
  - `partnerType`: `VENDOR`
  - `BusinessPartnersSuppliersPage.tsx` (có nút "Đồng bộ từ hóa đơn") + `hook.ts` + `config.ts` + `locale.ts` + `integration test`

Dùng ngoài module:
- `src/v2/modules/bank-statements`: import `BusinessPartnerPicker`, `toPartnerOptionValue`, `toPartnerSelectionPayload` từ `@/v2/core/business-partners`.
- `src/modules/bank-statements/components/BankTransactionPartnerField.tsx` & `BankTransactionDetailDrawer.hook.ts`: import từ `@/v2/core/business-partners`.

## 3. Luồng dữ liệu

- Tạo nhanh trong ô chọn: picker có nút "+ Tạo đối tác mới" mở `BusinessPartnerDrawer` (partnerId null); `onCreated` trả đối tác vừa tạo về picker, picker chọn `master:<id>`. Drawer chỉ gọi `onCreated` khi tạo mới; sửa thì vẫn đóng như cũ.
- Z-index: sheet v2 (`ui/sheet`) và popover desktop v2 nằm `z-[450]` để hiện trên drawer v1 (`z-400`).
- Đồng bộ có xem trước: nút "Đồng bộ từ hóa đơn" mở `BusinessPartnerSyncDialog` (organism), dialog gọi `syncFromInvoices(true)` để liệt kê, chỉ gọi `syncFromInvoices(false)` khi người dùng bấm "Tạo đối tác". Nút xác nhận bị khóa khi không có đối tác mới.
- API: `GET /api/v2/business-partners/options` (`listSelectOptions(direction, search, page)`), `POST /api/v2/business-partners/sync-from-invoices` (`syncFromInvoices(dryRun)`).
- Mọi request đi qua `src/v2/shared/api/v2HttpClient.ts`: gắn Bearer token, refresh 401 (single-flight), retry GET khi 502/503/504 hoặc lỗi mạng, mở modal khi 409 `DOCUMENT_IN_USE`.
- Lỗi và thành công của mutation hiện toast qua `useV2ToastStore` (`V2Toaster` mount ở `AppProviders`).
