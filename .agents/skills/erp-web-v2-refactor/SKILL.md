---
name: erp-web-v2-refactor
description: Cẩm nang kỹ thuật và playbook migrate module V1 → V2 trong erp-web (src/v2/): cấu trúc module chuẩn sinh bởi plop `v2-module`, hạ tầng shared V2 (HTTP client, toast, preference, locale), luật i18n `v2.*`, luật không import V1, và bảng parity V1→V2.
---

# 🚀 Kỹ Thuật Tái Cấu Trúc ERP Web v2 (`src/v2/`)

Skill này là nguồn tri thức cho việc tạo và migrate module sang V2. Chạy theo workflow `/erp-web-v2-refactor`. Module mẫu đã hoàn chỉnh: `src/v2/modules/business-partners/`.

---

## 1. Nguyên tắc

| # | Nguyên tắc | Thực tế hiện tại |
| :--- | :--- | :--- |
| 1 | **Dual-Run `/v2/`** | `/v2/*` và `/` (V1) chạy song song trên cùng bundle. V2 dùng chung session qua `useAuthStore` (V1). |
| 2 | **Không import V1** | Module và shared V2 không import `@/core`, `@/shared`, `@/modules` (trừ `@/modules/auth/domain/authStore`, session dùng chung). Kiểm bằng audit mục 7. |
| 3 | **Key i18n `v2.*`** | Mọi `t()` dùng key có tiền tố `v2.`. Key không có tiền tố trả fallback, không đi sang V1. |
| 4 | **Atomic** | `components/molecules/` và `components/organisms/`, mỗi thư mục kebab-case có `index.ts` và test co-located. |
| 5 | **< 180 LoC** | Tách `.hook.ts`, helper, sub-component khi gần ngưỡng. |
| 6 | **No Blue** | Dùng token ngữ cảnh (`bg-primary`, `text-muted-fg`...), không dùng `blue-*`. |
| 7 | **Rolling migration** | Chỉ migrate module khi user ra lệnh. Mỗi module verify đủ audit trước khi báo xong. |
| 8 | **Storybook** | Component trong `shared/` bắt buộc có `*.stories.tsx` (test `storyCoverage` kiểm). Module không bắt buộc. |

**Đã quyết định, chưa áp dụng:** tách `*.desktop.tsx` / `*.mobile.tsx` cho module. Hiện các template dùng chung (`V2ModulePage`, `V2StandardDrawer`) đã responsive nên module chưa tách. Chỉ tách khi UX thực sự khác, và cần chốt với user.

---

## 2. Cây module chuẩn

Sinh bởi `bun plop v2-module` (chi tiết ở skill `plop-generate`, Generator 5):

```text
src/v2/modules/<module>/
├── api/
│   ├── dtos/<entity>.dto.ts            # Hình dạng backend (không phụ thuộc V1)
│   ├── <plural>Api.ts                  # <plural>V2Api qua v2HttpClient + toListParams + toPayload
│   ├── queries/                        # <plural>Keys, use<Plural>Query (onError cho toast)
│   └── mutations/                      # useSave<Entity>Mutation, useRemove<Entity>Mutation
├── domain/
│   ├── entities/<entity>.ts            # Entity + FormValue (mọi trường là string) + empty form
│   └── rules/<entity>Rules.ts          # validate bắt buộc, dirty, trạng thái (+ test)
├── components/
│   ├── molecules/<entity>-status-badge/   # chỉ khi có trường status
│   └── organisms/
│       ├── <entity>-table/             # columns, views, index (+ test)
│       └── <entity>-form/              # FormSections, index (+ test)
├── drawers/                            # <Entity>Drawer.tsx + .hook.ts
├── pages/                              # <Plural>Page.tsx + use<Plural>Page.tsx
├── tests/integration/                  # Page + service mock
├── <namespace>.locale.ts               # registerV2ModuleLocale(namespace, vi/en)
└── index.ts
```

Điểm nối chung (marker, sinh tự động khi `wire = true`): route (`v2RouteConfig.ts`), menu (`v2Navigation.config.ts`), nhãn nav (`shared/locales/vi.ts|en.ts`), registry trang (`app/router/v2PageRegistry.tsx`). Thêm trang mới vào registry, không sửa `v2Routes.tsx`.

---

## 3. Hạ tầng shared V2 (dùng lại, không viết lại)

| Nhu cầu | Dùng | File |
| :--- | :--- | :--- |
| Gọi API (token, refresh 401, retry GET, mở modal 409) | `v2HttpClient` | `src/v2/shared/api/v2HttpClient.ts` |
| Thông báo lỗi từ server | `extractV2ApiError`, `isDocumentInUseError` | `src/v2/shared/utils/v2ApiError.ts` |
| Toast | `useV2ToastStore` (+ `V2Toaster` đã mount ở `AppProviders`, hỗ trợ 4 variants glassmorphism adaptive Light/Dark theme) | `src/v2/shared/stores/useV2ToastStore.ts`, `molecules/v2-toaster/` |
| Modal chứng từ phụ thuộc (409) | `useV2DocumentDependencyStore` (+ `V2DocumentDependencyModal` đã mount) | `src/v2/shared/stores/`, `molecules/v2-document-dependency-modal/` |
| Cấu hình cột/view theo bảng | `v2ColumnPreferencesStorage`, `v2ViewPresetStorage`, `applyV2SystemView` | `src/v2/shared/preferences/v2TablePreferenceStorages.ts` |
| Đồng bộ preference lên server | `scheduleTablePreferenceSync` (PATCH `/api/v1/app/table-preferences/:tableId`, mỗi bảng một bản ghi) | `src/v2/shared/preferences/v2TablePreferences.sync.ts` |
| Nạp preference + ngôn ngữ khi đăng nhập | `loadV2ServerPreferences()` (GET bảng + GET ngôn ngữ) | `src/v2/shared/preferences/v2ServerPreferences.ts` |
| Ngôn ngữ V2 | `useV2LocaleStore` (seed một lần từ `erp-app` của V1) | `src/v2/shared/stores/useV2LocaleStore.ts` |
| Dịch | `useV2Translation` (chỉ đọc dict V2 và module registry) | `src/v2/shared/hooks/useV2Translation.ts` |
| Quyền | `useV2HasPermission` | `src/v2/shared/hooks/useV2HasPermission.ts` |
| Ô nhập form chỉ đọc/sửa | `V2ReadValue`, `V2TextField` | `molecules/v2-form-controls/` |
| Quản lý state form & validation | `useV2Form` | `src/v2/shared/hooks/useV2Form.ts` |
| Component tổng render form field (100% V2 atoms/molecules, view/edit switch, label lookup) | `V2FormField` | `molecules/v2-form-field/` |
| Textarea | `V2Textarea` | `atoms/v2-textarea/` |
| Khung trang / drawer / xác nhận | `V2ModulePage`, `V2StandardDrawer`, `V2ConfirmModal` | `templates/`, `organisms/`, `molecules/` |

Preference bảng dùng store `useV2TablePreferencesStore` (persist key `v2_table_preferences`, `migrationVersion` = 1). Lần đầu chép cấu hình từ `erp_preferences` của V1 (chỉ đọc localStorage).

---

## 4. Quy ước

- **Namespace i18n:** `v2.<namespace>.<nhóm>.<khóa>`, với `namespace` = camelCase tên module. Nhóm cố định: `title`, `description`, `list`, `empty`, `create`, `listLoadError`, `columns.*`, `status.*`, `views.*`, `actions.*`, `form.*`, `delete.*`.
- **Nav:** `v2.nav.items.<routeCamel>` và `v2.nav.sections.<section>`. Giá trị lấy đúng từ V1 khi migrate để UI không đổi.
- **Chung:** `v2.common.close|cancel|save|actions`, `v2.dropdown.optionsTitle`.
- **Cột STT:** do `V2StandardTable` tự render (`__index`). Không khai báo thêm cột `index`.
- **Mã đối tác / mã chứng từ:** chỉ nhập khi tạo; sửa thì khóa. Nút sinh mã chỉ hiện khi tạo.
- **Xóa:** xóa mềm, luôn có `V2ConfirmModal`.
- **Lỗi:** mutation hiện toast; 409 `DOCUMENT_IN_USE` do modal chung xử lý (mutation không toast lại).
- **Preference:** giữ nguyên `tableId` của V1 (`erp-<x>-table`) để người dùng không mất cấu hình cột.
- **Popover (dropdown, lịch):** tự đóng khi click ra ngoài và chỉ một popover mở tại một thời điểm. Dùng hook `useV2PopoverDismiss` (`src/v2/shared/hooks/useV2PopoverDismiss.ts`), không tự gắn listener `pointerdown`. Áp dụng cho `V2Combobox`, `V2DatePicker`, `V2DateRangePicker`.
- **Hiệu ứng Glassmorphism & Tối ưu GPU:** Giới hạn `--drawer-blur: 10px`, `--glass-blur: 8px`. Cấm lồng nested `backdrop-filter` bên trong Drawer (thẻ `DrawerSection` dùng `--drawer-section-blur: 0px` kết hợp nền thẻ `0.85 - 0.9` và viền sắc nét). Thanh hover table actions dùng `backdrop-blur-sm` (4px). Tự động hạ blur về `0px` khi hệ điều hành kích hoạt `prefers-reduced-motion: reduce`.

---

## 5. Playbook migrate module V1 → V2

1. **Đọc V1.** Liệt kê feature trong `src/modules/<x>-core/` (cột, filter, view, drawer và các tab, toast, quyền, preference, nút hành động, quy tắc nghiệp vụ, endpoint). Đây là nguồn cho bảng parity.
2. **Chạy generator.** `bun plop v2-module ...` với tham số lấy từ V1 (`tableInput` = tableId V1, `fieldSpec` = cột và form V1, `permissionCollection` = resource V1). Dùng `wire = true`.
3. **Chỉnh theo V1.**
   - `api/dtos/`, `api/<plural>Api.ts`: khớp backend, thêm `toListParams` đặc thù, đường dẫn đúng.
   - `domain/rules/`: quy tắc nghiệp vụ của V1 (khóa trường, validate, trạng thái).
   - `views.ts`, `columns.tsx`: cột và view như V1.
   - `<namespace>.locale.ts` và nav: nhãn đúng từ V1 (lấy giá trị thật, đừng đoán).
   - `drawers/`, `pages/`: section, tab, row action, quyền create/update/delete.
4. **Lập bảng parity** (mục 6), tick từng dòng bằng bằng chứng (code hoặc test).
5. **Audit và kiểm thử** (mục 7). Chạy `bunx prettier --write` trên module trước khi kiểm tra.
6. **So sánh thủ công** `/` (V1) và `/v2/<route>`: lọc, sort, đổi view, tạo, sửa, xóa, toast, quyền, ngôn ngữ VI/EN, tải lại giữ cấu hình.
7. **Cập nhật skill module** `.agents/skills/modules/<module>/SKILL.md` (kiến trúc, parity, phần còn lại từ V1).

---

## 6. Bảng parity mẫu (business-partners)

| Tính năng V1 | V2 | Ghi chú |
| :--- | :---: | :--- |
| Cột STT 1-based | ✅ | Có sẵn từ `V2StandardTable` |
| Badge "Ngưng" cạnh mã khi INACTIVE + tooltip | ✅ | Cột mã trong `businessPartner-table` |
| Copy mã, MST, điện thoại, email | ✅ | `V2TextField` tự thêm nút copy cho `font-mono` và email |
| Mã chỉ nhập khi tạo, nút sinh mã chỉ khi tạo | ✅ | `codeEditable` từ rules |
| Lọc khoảng ngày `createdAt` | ✅ | Backend hỗ trợ `date_ranges` |
| Page size mặc định 50 (≥ 900px) / 20 | ✅ | `getDefaultPageSize` của V2 |
| Toast tạo/sửa/xóa thành công và thất bại | ✅ | Theo module (không qua interceptor toàn cục) |
| Toast thiếu thông tin, lỗi tải danh sách, lỗi tải chi tiết | ✅ | |
| Modal chứng từ phụ thuộc khi xóa (409) | ✅ | `V2DocumentDependencyModal` |
| Cột/view lưu theo bảng, đồng bộ server | ✅ | Bảng `core_user_table_preferences`, API `/app/table-preferences/:tableId` |
| Chặn trang khi thiếu quyền đọc | ✅ | Route guard `PermissionGuard` |
| Cờ 403 toàn cục, luồng impersonation | ❌ | Hạ tầng auth, không thuộc module (ghi nhận, chưa làm) |

---

## 7. Bẫy đã gặp

- **Plop và prompt trùng tên:** câu trả lời prompt ghi đè dữ liệu đã xử lý trong template. Vì vậy prompt đặt tên `pluralName`, `fieldSpec`, `routeInput`, `tableInput`.
- **Template có `{{` trong JSX:** `={{ ... }}` và `{{name}}}` bị Handlebars hiểu nhầm. Viết `={ { ... } }` và thêm khoảng trắng trước `}`.
- **Marker chèn hai lần vào cùng file:** tag idempotent phải duy nhất theo từng lần chèn (`<module>:<vị trí>`).
- **Import không dùng** trong module sinh ra: sinh cờ `hasText`, `needsReadValue`, `hasNextCode` để chỉ import khi cần.
- **`resetKey` của `V2ModuleTab` là chuỗi**, không phải số.
- **Trường `status` có thể null** từ backend: truyền `?? ""` cho badge.
- **Mock test ngày:** `Intl` ném `RangeError` với chuỗi không phải ngày. Fixture phải đúng kiểu trường.
- **`moduleRegistry.test`** kiểm tra `common.close` không có trong registry: đừng đổi key đó khi sửa dịch.

---

## 8. Kiểm toán (chạy trước khi báo hoàn tất)

```bash
cd erp/erp-web
# Không import V1 (chỉ authStore được phép)
grep -rnE "from \"@/(core|shared|modules|pages|components)/" src/v2/modules/<module> src/v2/shared --include="*.ts" --include="*.tsx" | grep -vE "\.test\.|\.stories\.|authStore"
# Key dịch ngoài namespace v2.
grep -rnP "\bt\(\s*\"(?!v2\.)[a-zA-Z]+\.[A-Za-z.]+\"" src/v2 --include="*.ts" --include="*.tsx" | grep -v "\.test\.\|stories"
# No Blue và textarea thô
grep -rn "blue-" src/v2/modules/<module>
grep -rn "<textarea" src/v2/modules/<module>
# Dưới 180 dòng
find src/v2/modules/<module> -name "*.ts*" -exec wc -l {} + | awk '$1>180 && $2!="total"'
# Chất lượng
bunx tsc --noEmit && bun run check:ci && bun run test src/v2
```

---

## 8b. Trạng thái migrate (cập nhật mỗi lần migrate)

Các module đã có thư mục trong `src/v2/modules/`: `admin-core`, `bank-statements`, `business-partners`, `finance-invoice`, `inventory`, `production-bom`, `vinfast-parts`. **Trạng thái từng module (đủ parity hay còn thiếu) chưa được xác minh trong tài liệu này**; trước khi dựa vào, kiểm tra parity bằng playbook mục 5.

Knowledge-Sync: mỗi lần migrate xong, cập nhật bảng này và `.agents/skills/modules/<module>/SKILL.md` của module.

- `admin-dashboard` & `v2-admin-layout`: Phân tách hoàn chỉnh 2 luồng định tuyến trong V2 (Nghiệp vụ thường `/v2/*` vs Cổng quản trị `/v2/admin/*`). Tích hợp `V2AdminLayout` (Platform Split Desktop/Mobile), `AdminRouteGuard` (chặn nhân viên không có `ADMIN_USERS.READ` hoặc role Admin/Manager), `V2WorkspaceModeToggle` (TopBar Switcher), và trang `V2AdminDashboardPage` kết nối API `/api/v2/admin/dashboard/summary`. Chi tiết tại `.agents/skills/modules/v2-admin-layout/SKILL.md`.
- `bank-statements`: Đã hoàn thiện V2 cho toàn bộ các drawer cốt lõi:
  - `BankStatementExportDrawer` (`V2ExportExcelDrawer` xuất Excel sao kê ngân hàng & sổ quỹ tiền mặt).
  - `CashTransactionDetailDrawer` (`V2StandardDrawer` 2-columns cho chi tiết giao dịch tiền mặt, hạch toán, đối tác, cấn trừ hóa đơn).
  - `BankTransactionDetailDrawer` (`V2StandardDrawer` 2-columns cho chi tiết giao dịch ngân hàng / `cashflow?tab=bank`, xem trước chứng từ UNC/GBC `BankVoucherPreview`, hạch toán `CashPostingSection`, đối tác `CashPartnerTransactions`, truy vết cấn trừ `CashTraceabilitySection` & `CashInvoiceNetOffModal`). V1 giữ Facade Adapter chuyển tiếp 100% props. Chưa có route `/v2` cho toàn trang danh sách.
- `vinfast-parts` (drawer xuất Excel tồn kho): đã V2 thuần (data layer, toast, icon, locale module, validate ngày). Các drawer khác của module chưa kiểm parity.
- `finance-invoice` (drawer đồng bộ hóa đơn, chỉ lớp UI): `InvoiceSyncDrawer` v2 (2 cột, `financeInvoiceSync.locale.ts`) được container V1 `InvoiceImportSyncDrawer` render. Logic, API, SSE và 2 dialog V1 vẫn V1, không port trong đợt này.

## 9. Hạn chế đã biết

- Generator chỉ sinh khung. Nhãn, quy tắc nghiệp vụ, quyền và endpoint thực phải chỉnh tay.
- Chưa có tách desktop/mobile cho module (xem mục 1).
- V2 vẫn dùng `authStore` của V1 cho session.
- Chưa có E2E trong `src/v2/tests/e2e/`.
