# ERP Frontend — Kết nối Backend mới

## Context

Backend vừa hoàn thành 9 module mới (Business Partners, Contacts, Partner Bank Accounts, Cash Funds, Opening Balances, Payment Vouchers, Attachments, Approval Logs, Voucher Numbering Configs) cùng một module cũ chưa có frontend (Business Partner Roles). Nhiệm vụ là tạo API layer, trang mới, và kết nối UI vào các trang đã có — theo đúng pattern hiện tại của dự án (axiosInstance, DrawerModal, ConfirmModal, TablePagination, Skeleton, Combobox).

---

## Files cần tạo mới (3 files)

### 1. `src/modules/partners/api/partnerApi.ts` (~220 lines)

Types cần export (theo đúng API doc):

```ts
// BusinessPartner
interface BusinessPartner { id, code, name, display_name, partner_kind, tax_code, phone, email, address, country, province, district, ward, is_active, note, created_at, updated_at }
interface CreateBusinessPartnerDto { code*, name*, partner_kind*, display_name?, tax_code?, phone?, email?, address?, country?, province?, district?, ward?, is_active?, note? }

// BusinessPartnerContact
interface BusinessPartnerContact { id, business_partner_id, full_name, position, phone, email, identity_no, address, is_default_receiver, is_default_payer, is_active, note, created_at }
interface CreateBusinessPartnerContactDto { business_partner_id*, full_name*, position?, phone?, email?, identity_no?, address?, is_default_receiver?, is_default_payer?, is_active?, note? }

// BusinessPartnerBankAccount
interface BusinessPartnerBankAccount { id, business_partner_id, bank_name, bank_branch, account_number, account_holder, currency, is_default, is_active, note, created_at }
interface CreateBusinessPartnerBankAccountDto { business_partner_id*, bank_name*, account_number*, account_holder*, bank_branch?, currency?, is_default?, is_active?, note? }
```

Functions (mỗi entity: `get<X>Api()` flat pageSize:200, `get<X>PagedApi({page,pageSize,search?,business_partner_id?})`, `create/update/delete<X>Api`):
- Endpoints: `/api/v1/business-partners`, `/api/v1/business-partner-contacts`, `/api/v1/business-partner-bank-accounts`

### 2. `src/modules/finance/api/financeApi.ts` (~380 lines)

Types và functions cho:

**CashFund** (`/api/v1/cash-funds`):
```ts
interface CashFund { id, fund_code, fund_name, currency, accounting_account_id, responsible_user_id, is_active, note, created_at, updated_at }
interface CreateCashFundDto { fund_code*, fund_name*, currency?, accounting_account_id*, responsible_user_id?, is_active?, note? }
```
→ `getCashFundsApi()`, `getCashFundsPagedApi()`, `createCashFundApi()`, `updateCashFundApi()`, `deleteCashFundApi()`

**OpeningBalance** (`/api/v1/opening-balances`):
```ts
interface OpeningBalance { id, fiscal_period, balance_date, account_id, cash_fund_id, company_bank_account_id, debit_amount, credit_amount, currency, note, created_at, created_by }
interface CreateOpeningBalanceDto { fiscal_period*, balance_date*, account_id*, cash_fund_id?, company_bank_account_id?, debit_amount?, credit_amount?, currency?, note? }
```
→ `getOpeningBalancesPagedApi({page,pageSize,fiscal_period?})`, CRUD functions

**VoucherNumberingConfig** (`/api/v1/voucher-numbering-configs`):
```ts
type ResetPeriod = 'NONE' | 'YEARLY' | 'MONTHLY'
interface VoucherNumberingConfig { id, voucher_type, prefix, date_pattern, current_sequence, padding_length, reset_period, is_active, note, updated_at }
interface CreateVoucherNumberingConfigDto { voucher_type*, prefix*, date_pattern?, current_sequence?, padding_length?, reset_period*, is_active?, note? }
```
→ `getVoucherNumberingConfigsApi()` (flat, no pagination — bounded set), `createVoucherNumberingConfigApi()`, `updateVoucherNumberingConfigApi()` (no delete)

**PaymentVoucher** (`/api/v1/payment-vouchers`):
```ts
type VoucherChannel = 'CASH' | 'BANK'
type VoucherDirection = 'IN' | 'OUT'
type VoucherType = 'CASH_RECEIPT' | 'CASH_PAYMENT' | 'BANK_RECEIPT' | 'BANK_PAYMENT'
type VoucherStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'POSTED' | 'REJECTED' | 'CANCELLED'
type CounterpartyRole = 'CUSTOMER' | 'VENDOR' | 'EMPLOYEE' | 'BANK' | 'GOVERNMENT' | 'INTERNAL' | 'SHAREHOLDER' | 'OTHER'

interface PaymentVoucher { id, voucher_no, voucher_channel, voucher_direction, voucher_type, document_date, posting_date, counterparty_id, counterparty_role, actual_person_name, actual_person_id_no, actual_person_phone, description, debit_account_id, credit_account_id, cash_fund_id, company_bank_account_id, beneficiary_bank_account_id, amount, currency, amount_in_words, status, counterparty_name_snapshot, counterparty_tax_code_snapshot, counterparty_address_snapshot, created_by, approved_by, approved_at, posted_at, cancelled_at, cancel_reason, created_at, updated_at }

interface CreatePaymentVoucherDto { voucher_no*, voucher_channel*, voucher_direction*, voucher_type*, document_date*, posting_date*, counterparty_id*, description*, debit_account_id*, credit_account_id*, amount*, counterparty_name_snapshot*, counterparty_role?, actual_person_name?, ..., cash_fund_id?, company_bank_account_id?, beneficiary_bank_account_id?, currency?, amount_in_words?, status? }
```
→ `getPaymentVouchersPagedApi({page,pageSize,search?,voucher_channel?,voucher_type?,status?})`, `createPaymentVoucherApi()`, `updatePaymentVoucherApi()`, `deletePaymentVoucherApi()`

**Attachments & Approval Logs** (sub-entities):
→ `getVoucherAttachmentsApi(voucherId)`, `getVoucherApprovalLogsApi(voucherId)` (read-only ở phase 1)

### 3. `src/pages/DoiTac.tsx` (~580 lines)

Trang mới cho Business Partners — 3 tab nội bộ (local `useState<"partners"|"contacts"|"bankaccounts">("partners")`):

**Tab "Đối tác" (PartnersTab):**
- State: list, loading, error, pagination, search (400ms debounce), drawerOpen, editing, form, saving, saveError, deleteTarget, deleting
- Form: `{ code, name, display_name, partner_kind, tax_code, phone, email, address, is_active, note }`
- partner_kind: Combobox(['ORGANIZATION','INDIVIDUAL'])
- API: `getBusinessPartnersPagedApi`, create/update/delete

**Tab "Liên hệ" (ContactsTab):**
- Thêm filter `partnerFilter: string` (Combobox from flat `getBusinessPartnersApi()`)
- Form: `{ business_partner_id, full_name, position, phone, email, identity_no, is_default_receiver, is_default_payer, is_active, note }`
- API: `getBusinessPartnerContactsPagedApi({...search, business_partner_id: partnerFilter || undefined})`

**Tab "Tài khoản NH" (PartnerBankTab):**
- Tương tự ContactsTab với filter theo partner
- Form: `{ business_partner_id, bank_name, bank_branch, account_number, account_holder, currency, is_default, is_active, note }`

---

## Files cần update lớn (3 files)

### 4. `src/modules/accounting/api/catalogApi.ts` (append ~60 lines)

Thêm BusinessPartnerRoles section giống pattern CompanyBankAccount:
```ts
interface BusinessPartnerRole { id, role_code, role_name, description, is_active, created_at, updated_at }
interface CreateBusinessPartnerRoleDto { role_code*, role_name*, description?, is_active? }
```
Endpoint: `/api/v1/business-partner-roles`
→ `getBusinessPartnerRolesPagedApi()`, `getBusinessPartnerRolesApi()`, create/update/delete

### 5. `src/pages/ThietLap.tsx` (modify ~+650 lines)

**QuyTab — replace local store với real API:**
- Xóa import `useSettingsStore` và type `Quy`
- State pattern giống NHTab
- Load `coaItems` một lần cho dropdown accounting_account
- Form: `{ fund_code, fund_name, currency, accounting_account_id, responsible_user_id, is_active, note }`
- API: `getCashFundsPagedApi`, `createCashFundApi`, `updateCashFundApi`, `deleteCashFundApi`
- Columns: Mã quỹ, Tên quỹ, TK kế toán (lookup từ coaItems), Tiền tệ, Trạng thái, Actions

**Thêm VaiTroTab (tab "vaitro"):**
- Copy pattern NHTab, swap BusinessPartnerRoles API
- Form: `{ role_code, role_name, description, is_active }`
- Columns: Mã vai trò, Tên vai trò, Mô tả, Trạng thái, Actions

**Thêm SoDuTab (tab "sodu"):**
- Load `allCoaItems` + `allFunds` + `allBankAccounts` một lần cho dropdowns
- Form: `{ fiscal_period, balance_date, account_id, cash_fund_id, company_bank_account_id, debit_amount, credit_amount, currency, note }`
- Thêm `fiscal_period` filter ở header (input type="month" → format "2026-01")
- Columns: Tài khoản, Kỳ, Ngày, Dư Nợ, Dư Có, Tiền tệ, Actions

**Thêm SoThuTuTab (tab "sothutu"):**
- Flat load, no pagination
- Form: `{ voucher_type, prefix, date_pattern, current_sequence, padding_length, reset_period, is_active, note }`
- voucher_type: Combobox(['CASH_RECEIPT','CASH_PAYMENT','BANK_RECEIPT','BANK_PAYMENT'])
- reset_period: Combobox(['NONE','YEARLY','MONTHLY'])
- Không có delete (bounded config)
- Columns: Loại CT, Tiền tố, Mẫu ngày, Số hiện tại, Độ dài đệm, Reset, Trạng thái, Actions

**Thêm vào ThietLap() component:**
```tsx
{settingsActiveTab === "vaitro" && <VaiTroTab />}
{settingsActiveTab === "sodu" && <SoDuTab />}
{settingsActiveTab === "sothutu" && <SoThuTuTab />}
```

### 6. `src/pages/TienMat.tsx` (rewrite ~380 → ~580 lines)

**Thay mock data bằng PaymentVouchers CASH:**

Load một lần on mount:
```ts
Promise.all([getCashFundsApi(), getChartOfAccountsApi(), getBusinessPartnersApi()])
  → [cashFunds, coaItems, partners]
```

Load paginated (trigger on [page, pageSize, search, statusFilter]):
```ts
getPaymentVouchersPagedApi({ page, pageSize, search, voucher_channel: "CASH", status: statusFilter || undefined })
```

**KPI cards từ data thực:**
- Thu: filter `voucher_type === "CASH_RECEIPT"`, sum amount  
- Chi: filter `voucher_type === "CASH_PAYMENT"`, sum amount
- Chờ duyệt: `voucher_status === "DRAFT" | "PENDING_APPROVAL"`, count

**Table thay TxTable:**
Columns: Ngày CT | Số CT | Loại (badge Thu/Chi) | Đối tượng | Diễn giải | Số tiền | Trạng thái | Actions(Edit+Delete)

**CashVoucherForm:**
```ts
interface CashVoucherForm {
  voucher_no: string        // user nhập hoặc auto
  voucher_type: 'CASH_RECEIPT' | 'CASH_PAYMENT'
  document_date: string
  posting_date: string
  cash_fund_id: string
  counterparty_id: string
  counterparty_name_snapshot: string   // auto-fill từ partner
  counterparty_tax_code_snapshot: string
  counterparty_address_snapshot: string
  counterparty_role: string
  debit_account_id: string
  credit_account_id: string
  amount: string
  currency: string
  amount_in_words: string
  description: string
}
```

**Auto-fill snapshot khi chọn counterparty:**
```ts
// onChange counterparty_id:
const p = partners.find(x => x.id === v);
setForm(f => ({
  ...f, counterparty_id: v,
  counterparty_name_snapshot: p?.name ?? "",
  counterparty_tax_code_snapshot: p?.tax_code ?? "",
  counterparty_address_snapshot: p?.address ?? "",
}));
```

**DrawerModal 3 sections:**
- Section 1 "Thông tin CT": voucher_no, voucher_type (locked, set by caller), document_date, posting_date, cash_fund_id
- Section 2 "Đối tượng": counterparty_id (Combobox), snapshots (editable inputs bên dưới), counterparty_role
- Section 3 "Hạch toán": debit_account_id, credit_account_id, amount, amount_in_words, description

**2 nút tạo:** "Tạo phiếu thu" → opens drawer with `voucher_type="CASH_RECEIPT"`, "Tạo phiếu chi" → `voucher_type="CASH_PAYMENT"`. `voucher_direction` = "IN" cho RECEIPT, "OUT" cho PAYMENT.

**Xóa:** `useTransactionStore`, `useUIStore`, `TxTable` import (nhưng **KHÔNG** xóa TxTable component hay uiStore — chúng còn dùng ở nơi khác).

### 7. `src/pages/TienGui.tsx` (rewrite ~220 → ~600 lines)

Giống TienMat nhưng `voucher_channel: "BANK"`, có thêm:

- Load thêm `companyBankAccounts` (flat) on mount
- `BankVoucherForm` thêm: `company_bank_account_id`, `beneficiary_bank_account_id`
- Khi chọn counterparty → load thêm partner bank accounts:
  ```ts
  getBusinessPartnerBankAccountsPagedApi({ business_partner_id: v, pageSize: 100 })
    → setPartnerBankAccounts(r.items)
  ```
- Section 1 thêm: company_bank_account_id (Combobox từ companyBankAccounts)
- Section 2 thêm: beneficiary_bank_account_id (Combobox từ partnerBankAccounts, disabled nếu chưa chọn counterparty)
- 2 nút tạo: "Tạo UNT" → BANK_RECEIPT/IN, "Tạo UNC" → BANK_PAYMENT/OUT
- Bank account cards: thay hardcode VCB/TCB bằng real `companyBankAccounts` data

---

## Files cần update nhỏ (8 files)

### 8. `src/shared/types/index.ts`
```ts
// Thêm "doitac" vào PageKey union
| "activitylog"
| "doitac";
```

### 9. `src/shared/utils/pageUrl.ts`
```ts
// ALL_PAGE_KEYS: thêm "doitac"
// PAGE_SLUG: thêm doitac: "doi-tac"
```

### 10. `src/core/routing/index.ts`
```ts
{ key: "doitac", label: "Đối tác", group: "partners" },
```

### 11. `src/core/config/appStore.ts`
```ts
// SECTION_ROOTS:
doitac: { label: "Đối tác", group: "partners" },

// BREADCRUMBS:
doitac: [["breadcrumb.accounting"], ["breadcrumb.partners"]],
```
settingsActiveTab default "quy" giữ nguyên — các tab mới ("vaitro", "sodu", "sothutu") chỉ cần là valid string, không cần type guard.

### 12. `src/core/components/layout/Sidebar.tsx`

**a) Thêm DoiTac nav item** trong Kế toán section (sau "Thiết lập danh mục" group), dùng icon mới (People/Briefcase SVG):
```tsx
<NavItem
  label={t("nav.items.partners")}
  icon={<IconBriefcase />}
  active={currentPage === "doitac"}
  onClick={() => navigate("doitac")}
  contextPage="doitac"
/>
```

**b) Thêm 3 SubItem** trong `<SubNav id="sub-thietlap">` sau item "tk":
```tsx
<SubItem active={isThietLap && settingsActiveTab === "vaitro"} label={t("nav.items.catalogRoles")} onClick={() => navigate("thietlap", "vaitro")} />
<SubItem active={isThietLap && settingsActiveTab === "sodu"} label={t("nav.items.catalogOpeningBalance")} onClick={() => navigate("thietlap", "sodu")} />
<SubItem active={isThietLap && settingsActiveTab === "sothutu"} label={t("nav.items.catalogVoucherNumbering")} onClick={() => navigate("thietlap", "sothutu")} />
```

### 13. `src/core/locale/vi.ts`

Thêm các keys:
```ts
nav.items: { partners: "Đối tác", catalogRoles: "Vai trò đối tác", catalogOpeningBalance: "Số dư đầu kỳ", catalogVoucherNumbering: "Số thứ tự CT" }
breadcrumb: { partners: "Đối tác" }
doitac: { title, desc, tabs: { partners, contacts, bankAccounts }, headers: { code, name, taxCode, phone, email, kind, status, contactName, position, bankName, accountNumber, accountHolder, branch } }
thietlap.roles: { title, desc }
thietlap.openingBalance: { title, desc }
thietlap.voucherNumbering: { title, desc }
// tienmat/tiengui headers cho voucher table
```

### 14. `src/core/locale/en.ts`

**Phải update đồng thời với vi.ts** vì en.ts dùng `typeof vi` làm kiểu — nếu thiếu key sẽ build error.

### 15. `src/App.tsx`

```tsx
import { DoiTac } from "@/pages/DoiTac";
// ...
{currentPage === "doitac" && <DoiTac />}
// Bỏ "doitac" ra khỏi ComingSoon block nếu có (hiện tại PageKey chưa có nên không trong đó)
```

---

## Thứ tự thực hiện

1. **partnerApi.ts + financeApi.ts** — API layer trước, không dependency
2. **catalogApi.ts** — thêm BusinessPartnerRoles
3. **types/index.ts + pageUrl.ts + routing/index.ts + appStore.ts** — navigation foundation
4. **locale/vi.ts + en.ts** — i18n (phải làm cùng nhau)
5. **DoiTac.tsx** — trang mới (phụ thuộc API + navigation)
6. **ThietLap.tsx** — update QuyTab + thêm 3 tabs
7. **TienMat.tsx** — replace mock với real voucher CRUD
8. **TienGui.tsx** — tương tự TienMat
9. **Sidebar.tsx** — thêm nav items
10. **App.tsx** — wire DoiTac vào render tree

---

## Shared utilities cần extract (làm khi implement)

- `src/shared/utils/apiError.ts` → `extractApiError(e, fallback)` — tránh lặp pattern cast `(e as {response?...})` ở mọi page
- Không cần extract hook mới ngay — useSearchDebounce có thể để sau

---

## Gotchas cần chú ý

1. **en.ts + vi.ts luôn update cùng nhau** — TypeScript báo lỗi build ngay nếu thiếu key
2. **settingsStore.ts vẫn giữ mock data** — chỉ xóa sau khi QuyTab hoàn toàn dùng real API và không còn import nào trỏ vào
3. **transactionStore + uiStore** — chưa xóa, còn SlidePanel/ImportModal trong App.tsx dùng chúng
4. **Beneficiary bank accounts** load async khi counterparty thay đổi — cần `partnerBankAccountsLoading: boolean`, disable Combobox trong lúc fetch
5. **`counterparty_name_snapshot` là required** trong CreatePaymentVoucherDto — phải auto-fill hoặc validate không rỗng trước khi save
6. **`voucher_no` required và unique** — nên để user nhập (sau này sẽ auto-generate từ VoucherNumberingConfig)
7. **Charts trong TienMat/TienGui** — giữ nguyên mock/decorative trong phase 1, chỉ thay table data

---

## Verification

Sau khi implement xong, test:
1. `npm run build` — không có TypeScript error
2. Đăng nhập → sidebar thấy "Đối tác" mới + ThietLap có đủ sub-items
3. Mở DoiTac → 3 tabs hoạt động, CRUD Business Partners
4. Mở ThietLap → "Quỹ tiền mặt" load từ real API, 3 tabs mới hiển thị
5. Mở TienMat → table hiển thị PaymentVouchers từ backend, tạo phiếu thu/chi thành công
6. Mở TienGui → tương tự, UNT/UNC hoạt động
7. Kiểm tra auto-fill snapshot khi chọn đối tác trong form chứng từ

---

## ✅ Implementation Status

### Completed (2026-04-29)

| Task | File | Status |
|------|------|--------|
| partnerApi.ts | `src/modules/partners/api/partnerApi.ts` | ✅ Done |
| financeApi.ts | `src/modules/finance/api/financeApi.ts` | ✅ Done |
| apiError.ts utility | `src/shared/utils/apiError.ts` | ✅ Done |
| catalogApi.ts — BusinessPartnerRoles | `src/modules/accounting/api/catalogApi.ts` | ✅ Done |
| types/index.ts — add "doitac" | `src/shared/types/index.ts` | ✅ Done |
| pageUrl.ts — add "doitac" slug | `src/shared/utils/pageUrl.ts` | ✅ Done |
| routing/index.ts | `src/core/routing/index.ts` | ✅ Done |
| appStore.ts — SECTION_ROOTS + BREADCRUMBS | `src/core/config/appStore.ts` | ✅ Done |
| vi.ts locale | `src/core/locale/vi.ts` | ✅ Done |
| en.ts locale | `src/core/locale/en.ts` | ✅ Done |
| DoiTac.tsx — new page | `src/pages/DoiTac.tsx` | ✅ Done |
| ThietLap.tsx — QuyTab real API + 3 new tabs | `src/pages/ThietLap.tsx` | ✅ Done |
| TienMat.tsx — real PaymentVouchers CASH | `src/pages/TienMat.tsx` | ✅ Done |
| TienGui.tsx — real PaymentVouchers BANK | `src/pages/TienGui.tsx` | ✅ Done |
| Sidebar.tsx — DoiTac nav + 3 ThietLap sub-items | `src/core/components/layout/Sidebar.tsx` | ✅ Done |
| App.tsx — wire DoiTac | `src/App.tsx` | ✅ Done |
| `npm run build` — zero TypeScript errors | — | ✅ Passed |

### Build fixes applied
- Removed `ignoreDeprecations: "6.0"` from `tsconfig.json` (invalid in TS 5.9)
- Removed extra `themeLight` key from `en.ts` bottom section (not in Dict type)
- Fixed `||` + `??` operator precedence in `TienMat.tsx` and `TienGui.tsx` (TS5076)
