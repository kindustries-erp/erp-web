# Payment Voucher Frontend Plan

## 1) Muc tieu tai lieu

- Tong hop hien trang da hoan thanh o hệ thống va Backend.
- Chot pham vi Frontend can implement tiep theo.
- Dua ra plan theo phase de chia viec cho team.
- Dua checklist TODO va checklist test/UAT de nghiem thu.

## 2) Hien trang he thong

### 2.1 hệ thống da xong

Data model `gw_payment_vouchers` da co:

- `counterparty_source`: `INTERNAL | EXTERNAL`
- `employee_id`: relation den `gw_employees`
- `counterparty_id`: nullable (optional khi `INTERNAL`)
- Snapshot fields moi:
  - `counterparty_phone_snapshot`
  - `counterparty_identity_no_snapshot`
  - `beneficiary_bank_name_snapshot`
  - `beneficiary_bank_account_snapshot`
  - `beneficiary_account_holder_snapshot`
- Constraint DB-level:
  - `INTERNAL` di voi `employee_id`
  - `EXTERNAL` di voi `counterparty_id`
- Preset: `GW Business Partners - Banks`

### 2.2 Backend NestJS da xong

Validation/DTO:

- Create bat buoc `counterparty_source`.
- `INTERNAL`: bat buoc `employee_id`, cam `counterparty_id`.
- `EXTERNAL`: bat buoc `counterparty_id`, cam `employee_id`.
- `CASH`: bat buoc `cash_fund_id`.
- `BANK`: bat buoc `company_bank_account_id`.

Auto snapshot fill:

- `INTERNAL`: tu `gw_employees` de fill
  - `counterparty_name_snapshot`
  - `counterparty_phone_snapshot`
  - `counterparty_identity_no_snapshot`
- `EXTERNAL`: tu `gw_business_partners` de fill
  - `counterparty_name_snapshot`
  - `counterparty_tax_code_snapshot`
  - `counterparty_phone_snapshot`
  - `counterparty_address_snapshot`
- Neu co `beneficiary_bank_account_id`: backend fill them bank beneficiary snapshot.

Status machine + endpoint transition:

- `POST /:id/submit`: `DRAFT -> PENDING_APPROVAL`
- `POST /:id/approve`: `PENDING_APPROVAL -> APPROVED`
- `POST /:id/reject`: `PENDING_APPROVAL -> REJECTED`
- `POST /:id/post`: `APPROVED -> POSTED`
- `POST /:id/cancel`: `DRAFT | PENDING_APPROVAL | APPROVED -> CANCELLED`

Rule bo sung:

- Moi transition deu ghi log vao `gw_payment_voucher_approval_logs`.
- `PATCH /:id` chi cho phep khi status la `DRAFT`.
- List filter da ho tro them `counterparty_source`, `employee_id`.

## 3) Frontend hien trang (as-is)

Frontend dang chay flow cu va can cap nhat de theo contract moi.

### 3.1 Diem dung tot

- Da co luong create/edit/list cho CASH va BANK.
- Da co status badge va status filter.
- Da co API doc approval logs.

### 3.2 Gap chinh can dong

- Chua co field `counterparty_source`, `employee_id` trong form model.
- Chua render logic UI theo INTERNAL/EXTERNAL.
- Transition status dang su dung update status qua PATCH thay vi endpoint moi.
- Chua co filter `counterparty_source`, `employee_id` tren list.
- Chua render approval history trong detail/drawer.
- Chua hien thi day du snapshot readonly cho audit.

## 4) Nguyen tac implement

- Tuan thu Atomic Design va quy tac trong [docs/app-structure.md](docs/app-structure.md).
- Tai su dung hook/component hien co, han che viet lai.
- Tach ro:
  - API layer: map contract backend.
  - Hook layer: business logic + validation + orchestration.
  - Component layer: UI + conditional render.
  - Page layer: compose, khong giam logic vao page.

## 5) Plan trien khai theo phase

## Phase 1 - Dong bo contract FE voi backend

Muc tieu: FE model/DTO ho tro day du field moi.

Viec can lam:

- Cap nhat type Payment Voucher:
  - Them `counterparty_source`, `employee_id`.
  - Them snapshot fields moi (phone, identity, beneficiary bank snapshot).
  - Dinh nghia type relation an toan cho du lieu populate object.
- Cap nhat Create/Update DTO:
  - Ho tro rule INTERNAL/EXTERNAL.
  - Ho tro CASH/BANK requirement theo channel.
- Cap nhat mapper form:
  - `emptyForm`, `buildForm` cho ca CASH/BANK.

Deliverable:

- Type compile pass.
- Khong vo form cu khi edit du lieu ton tai.

## Phase 2 - Status machine endpoint moi

Muc tieu: bo PATCH status cu, chuyen sang endpoint transition.

Viec can lam:

- Them API functions:
  - submit voucher
  - approve voucher
  - reject voucher
  - post voucher
  - cancel voucher
- Hook transition goi dung endpoint theo action button.
- Action cancel gui `cancel_reason` khi can.

Deliverable:

- Moi action button goi dung endpoint.
- UI thong bao dung ket qua transition.

## Phase 3 - Form dynamic theo source va channel

Muc tieu: an/hien field dung nghiep vu.

Viec can lam:

- Neu `counterparty_source = INTERNAL`:
  - Hien `employee_id`.
  - An `counterparty_id`.
  - An beneficiary bank section.
- Neu `counterparty_source = EXTERNAL`:
  - Hien `counterparty_id`.
  - An `employee_id`.
  - Neu voucher channel la BANK thi hien beneficiary section.
- Neu `voucher_channel = CASH`:
  - Hien `cash_fund_id`.
  - An `company_bank_account_id`.
- Neu `voucher_channel = BANK`:
  - Hien `company_bank_account_id`.
  - An `cash_fund_id`.

Deliverable:

- UI khong cho phep nhap sai cap field.
- Validation FE va backend khop nhau.

## Phase 4 - Snapshot preview readonly

Muc tieu: user co the xac nhan snapshot truoc submit.

Viec can lam:

- Them khu vuc preview snapshot readonly trong drawer.
- Khi chon employee/partner, preview cap nhat ngay tu du lieu local.
- Neu thieu du lieu local, hien placeholder ro rang.
- Khong cho edit tay cac snapshot audit field quan trong.

Deliverable:

- User nhin thay du lieu se duoc backend chot.

## Phase 5 - Action button theo status

Muc tieu: button dung theo state machine moi.

Matrix:

- `DRAFT`: `Gui duyet`, `Huy`.
- `PENDING_APPROVAL`: `Duyet`, `Tu choi`, `Huy`.
- `APPROVED`: `Hach toan`, `Huy`.
- `POSTED`: readonly.
- `REJECTED`: readonly.
- `CANCELLED`: readonly.

Viec can lam:

- Dieu chinh action generator cho CASH va BANK.
- Dong bo logic canEdit theo backend rule PATCH chi DRAFT.

Deliverable:

- Action hien dung theo status.
- Khong con duong update sai rule.

## Phase 6 - List filter + Detail/Audit

Muc tieu: ho tro tim kiem va audit dung thong tin moi.

Viec can lam:

- Them filter list:
  - `counterparty_source` (Tat ca/Noi bo/Ben ngoai)
  - `employee_id` (neu can loc theo nhan vien)
- Detail/drawer:
  - Render dung theo source:
    - INTERNAL: ten nhan vien
    - EXTERNAL: ten doi tac + MST
  - Hien snapshot readonly day du.
  - Hien approval history tu `gw_payment_voucher_approval_logs`.

Deliverable:

- Filter list hoat dong dung.
- Detail phuc vu audit day du.

## 6) Checklist TODO de giao viec

## 6.1 API + Types

- [ ] Mo rong type voucher voi field moi.
- [ ] Mo rong Create/Update DTO cho INTERNAL/EXTERNAL.
- [ ] Them transition APIs submit/approve/reject/post/cancel.
- [ ] Them params list filter `counterparty_source`, `employee_id`.
- [ ] Chuẩn hoa relation fields de ho tro string hoac object.

## 6.2 Hook logic

- [ ] Refactor hook CASH de ho tro INTERNAL/EXTERNAL.
- [ ] Refactor hook BANK de ho tro INTERNAL/EXTERNAL.
- [ ] Refactor status transition hook sang endpoint moi.
- [ ] Validation client-side khop voi backend rules.
- [ ] Dam bao payload submit khong gui field bi cam theo source.

## 6.3 UI Component

- [ ] Cap nhat drawer section doi tuong theo `counterparty_source`.
- [ ] Cap nhat drawer section kenh theo `voucher_channel`.
- [ ] Them snapshot preview block readonly.
- [ ] Cap nhat actions theo status matrix.
- [ ] Them approval history block trong drawer/detail.

## 6.4 List va filter

- [ ] Them combobox filter `counterparty_source`.
- [ ] Them filter `employee_id`.
- [ ] Truyen filter xuong API list.
- [ ] Cap nhat cot hien thi thong tin doi tuong theo source.

## 6.5 I18n va copy text

- [ ] Bo sung key tieng Viet va tieng Anh cho field/action moi.
- [ ] Khong hardcode text moi trong shared components.

## 6.6 Test + QA

- [ ] Test create INTERNAL thanh cong.
- [ ] Test create EXTERNAL thanh cong.
- [ ] Test INTERNAL gui `counterparty_id` bi chan.
- [ ] Test EXTERNAL gui `employee_id` bi chan.
- [ ] Test CASH/BANK required field dung.
- [ ] Test tung endpoint transition dung state machine.
- [ ] Test PATCH chi cho DRAFT.
- [ ] Test cancel flow va cancel reason.
- [ ] Test approval logs sau moi transition.
- [ ] Test list filter moi + pagination + sort.
- [ ] Test relation object rendering khong crash UI.

## 7) Checklist nghiem thu UAT

- [ ] Nguoi dung tao voucher noi bo voi nhan vien, submit thanh cong.
- [ ] Nguoi dung tao voucher ben ngoai voi doi tac, submit thanh cong.
- [ ] Snapshot hien thi dung thong tin truoc khi luu.
- [ ] Sau luu, snapshot backend tra ve khop mong doi.
- [ ] Action button thay doi dung khi status thay doi.
- [ ] Approval history hien day du submit/approve/reject/post/cancel.
- [ ] Voucher POSTED/REJECTED/CANCELLED khong cho sua sai rule.

## 8) Ke hoach rollout de xuat

- Sprint 1:
  - Phase 1 + Phase 2
  - Muc tieu: chot contract, chot transition.
- Sprint 2:
  - Phase 3 + Phase 4
  - Muc tieu: form logic + snapshot preview.
- Sprint 3:
  - Phase 5 + Phase 6
  - Muc tieu: action theo status + list/detail audit + UAT.

## 9) Rui ro va giai phap

- Rui ro: relation field tra object thay vi id gay loi render.
  - Giai phap: type union + helper resolver an toan.
- Rui ro: FE va backend validation lech nhau.
  - Giai phap: chia se mot bang rule mapping va test case bat buoc.
- Rui ro: button action cho phep thao tac sai status.
  - Giai phap: action map trung tam theo status + test e2e nhanh.

## 10) Dinh nghia hoan thanh (Definition of Done)

- Toan bo checklist muc 6 hoan thanh.
- Toan bo checklist UAT muc 7 dat.
- Khong con call PATCH status cu trong flow duyet.
- Du lieu audit (snapshot + approval logs) hien day du tren FE.
- Build pass, khong loi TypeScript va khong loi runtime voi relation object.
