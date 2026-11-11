---
name: garage-procurement-requests-web
description: Module tri thức Frontend V2 cho Quản lý Đề nghị Mua hàng Garage (Garage Procurement Requests) trong erp-web. Module mỏng ghép nối với lõi core họ procurement (`src/v2/core/procurement/`). Tuân thủ quy chuẩn V2, Atomic 5 tầng (< 180 LoC), No Blue mandate, Top Navigation Tabs, V2StandardTable, Table Filter & Search Engine, DrawerAuditTimeline, DrawerRelatedDeck, Mobile-First và đa ngôn ngữ vi/en.
---

# 🎨 Module Tri Thức: Đề Nghị Mua Hàng Garage Frontend V2 (`garage-procurement-requests`)

## 1. Ranh giới Module và Core

- **Module** `src/v2/modules/garage-procurement-requests/` là lớp mỏng đặc thù của Garage:
  - Khởi tạo API client với base path `/api/v2/procurement-requests-garage`.
  - Cấu hình hiển thị bảng `garageProcurementRequestsDisplay` (`tableId: procurement-requests-garage-table`, cấu hình bảng đi qua `/api/v2/table-preferences`), tiêu đề, mô tả, quyền RBAC (`garage_procurement_requests`).
  - Gắn component `GarageProcurementRequestsPage` (còn alias `GarageProcurementPage`): trang hợp nhất 2 tab (`requests` và `orders`), đồng bộ URL `/garage-procurement?tab=requests,orders` (mặc định mở `?tab=requests`), nút Tạo mới dùng `V2SplitButton` + `V2Dropdown` và menu duy nhất trên sidebar là "Mua hàng Garage" (`/garage-procurement?tab=requests`).
- **Core** `src/v2/core/procurement/` quản lý mọi thành phần tái sử dụng của họ mua hàng (PR và PO):
  - **Table Columns** (`columns/procurementRequestColumns.tsx`): 9 cột dữ liệu với `headerFilter`, `V2TableText` tương tác click xem chi tiết + copy, format tiền tệ VNĐ, badge trạng thái ngữ nghĩa (`ProcurementStatusBadge`). Cột "Người tạo" (`createdBy`) và "Người duyệt" (`approver`) hiển thị `createdByEmail` / `approverEmail` từ API; filter và options dùng email (không UUID). Người duyệt = người đã duyệt, chưa duyệt thì người được giao (`COALESCE(approvedBy, approverId)`).
  - **Table Query & Search Engine**: Hàm `toProcurementListParams` chuyển đổi đầy đủ `V2TableQuery` (gồm `column_filters`, `column_search`, `column_operators`, `date_ranges`, `sort`, `search`) sang query params JSON chuẩn V2, kết nối trực tiếp với Database QueryBuilder bên API backend (`TABLE_COLUMNS`).
  - **Drawer Chuẩn V2** (`components/organisms/procurement-request-drawer/ProcurementRequestDrawer.tsx` và `procurement-order-drawer/ProcurementOrderDrawer.tsx`): Tích hợp phân vùng "Nhật ký duyệt" dạng Activity Feed hiện đại (Hình 1) bằng Organism dùng chung `ProcurementAuditSection` (kết nối Molecule `V2ActivityTimeline` hỗ trợ 100% theme dark/light, bo góc Featured Card cho sự kiện duyệt mới nhất, và các dòng streamline rows nối bởi đường spine mảnh cho các sự kiện trước).
  - **Atomic Sections (< 180 LoC)**: Tách biệt rõ `ProcurementRequestMainSections.tsx`, `sections/ProcurementRequestHeaderSection.tsx`, `sections/ProcurementRequestSummarySection.tsx`, `components/organisms/procurement-audit-section/` (dùng chung cho cả PR và PO), `tabs/ProcurementRequestRelatedTab.tsx`. Dòng hàng dùng chung `components/organisms/procurement-lines-editor/`.
  - **Hook danh sách (< 180 LoC)**: `useProcurementList` là orchestrator, ghép `useProcurementTransition` (mutation chuyển trạng thái/xóa nháp) và `useProcurementRowActions` (nhóm thao tác theo dòng). Modal lý do/xác nhận/xóa/purge nằm ở `components/ProcurementListModals.tsx`.
  - **Hành động trực tiếp**: Ở chế độ xem (View Mode), các thao tác duyệt (Gửi duyệt, Duyệt, Từ chối, Hủy...) được kích hoạt trực tiếp từ Drawer Footer hoặc menu dropdown `Thao tác`.
  - **View/Edit (PR và PO dùng chung quy ước)**: `open(id, "view" | "edit")` mở drawer; list remount theo `key={id-mode}`. Nút Chỉnh sửa hiện khi có quyền và chỉ bật khi đã tải xong và bản ghi là nháp (`editable = creating || (Boolean(detail.data) && status === "DRAFT")`), để tránh nút nhấp nháy khi đang tải. Lưu bản ghi cũ gọi `onSaved(id)` và về chế độ xem; tạo mới đóng drawer. Hủy khi đã đổi hỏi xác nhận (`ProcurementDiscardModal`, `confirmOnClose = dirty && !viewing`); chưa đổi thì về view ngay. Dirty so với `initial` bằng `form/procurementDirty.ts`.
  - **Layout drawer (PR và PO giống phiếu nhập kho)**: cột trái chỉ là bảng dòng hàng; cột phải là đầu đề một cột (`V2DrawerFieldGrid` dùng chung ở `shared/components/molecules/v2-drawer-field-grid/`) rồi tới tổng quan. Bảng dòng của procurement và của GR tách riêng vì khác cột nghiệp vụ (số lượng nhận, đơn giá) và cách hiển thị mobile; chỉ dùng chung lưới trường.
  - **Menu dòng**: dựng bởi `hooks/procurementRowActions.builder.tsx`. TRA CỨU [Xem chi tiết] → THAO TÁC [Chỉnh sửa, Tạo PO từ PR, chuyển trạng thái thường, chuyển trạng thái nguy hiểm (Hủy/Từ chối), Xóa, Xóa vĩnh viễn]. Nhóm rỗng bị bỏ. Chỉnh sửa luôn hiện khi có quyền, mờ kèm `disabledReason` khi không phải nháp. Nút nhanh khi hover là Xem + Chỉnh sửa.

```
src/v2/modules/garage-procurement-requests/
├── garageProcurementRequests.config.tsx    # Cấu hình API, tableId, renderDrawer, RBAC
├── garageProcurementRequests.locale.ts    # Tiêu đề & mô tả module
├── GarageProcurementRequestsPage.tsx      # Entry page ghép ProcurementListPage
└── index.ts

src/v2/core/procurement/
├── columns/
│   ├── procurementColumns.tsx             # Facade re-export
│   ├── procurementRequestColumns.tsx      # Cột bảng PR chuẩn V2 (< 130 LoC)
│   ├── procurementOrderColumns.tsx        # Cột bảng PO: số đơn click+copy, header filter status/fulfillment/payment, người tạo = email
│   └── procurementStatusOptions.ts        # Bộ option lọc trạng thái dùng chung cho PR và PO
├── components/
│   ├── molecules/
│   │   ├── procurement-pickers/           # Branch picker, Date picker
│   │   └── procurement-status-badge/      # Badge semantic No Blue (< 60 LoC)
│   ├── organisms/
│   │   └── procurement-lines-editor/      # Bảng nhập dòng hàng hóa / dịch vụ
│   │       ├── ProcurementLinesEditor.tsx # Khung bảng và nút thêm dòng (< 90 LoC)
│   │       └── ProcurementLineRow.tsx     # Dòng chi tiết nhập liệu mobile-first (< 160 LoC)
│   │   ├── procurement-audit-section/     # Organism nhật ký duyệt dùng chung PR & PO (< 70 LoC, V2ActivityTimeline)
│   │   ├── procurement-request-drawer/    # Drawer đề nghị mua (folder-per-component)
│   │   │   ├── ProcurementRequestDrawer.tsx        # V2StandardDrawer dùng trực tiếp ProcurementAuditSection
│   │   │   ├── ProcurementRequestDrawer.hook.ts    # Hook form, mode, tabs
│   │   │   ├── ProcurementRequestDrawer.biz.hook.ts # Nút footer + useProcurementRequestSave (lưu)
│   │   │   ├── ProcurementRequestMainSections.tsx  # Phần trái: dòng hàng
│   │   │   ├── sections/                           # HeaderSection, SummarySection
│   │   │   ├── tabs/                               # RelatedTab
│   │   │   └── index.ts
│   │   └── procurement-order-drawer/      # Drawer đơn mua (PO), tích hợp ProcurementAuditSection
│   ├── ProcurementListPage.tsx            # Template bảng V2ModulePage (< 130 LoC)
│   ├── ProcurementListModals.tsx          # 4 modal: lý do, xóa, purge, xác nhận
│   └── ProcurementReasonModal.tsx         # Modal nhập lý do từ chối/hủy/đóng
├── hooks/
│   ├── useProcurementList.ts              # Orchestrator màn danh sách (< 180 LoC)
│   ├── useProcurementTransition.ts        # Mutation chuyển trạng thái, xóa nháp
│   └── useProcurementRowActions.ts        # Nhóm thao tác theo dòng
├── procurement.drawer.type.ts             # Contract props drawer (ProcurementDocumentRef)
├── procurement.api.ts                     # API client & toProcurementListParams (< 130 LoC)
└── procurement.locale.ts                  # Từ điển vi/en (v2.procurement.*)
```

## 2. Quy Chuẩn V2 Đã Đáp Ứng

- **Atomic 5 Tầng & Giới hạn < 180 LoC**: 100% các file thành phần đều nằm dưới 175 LoC, phân rã rành mạch theo nguyên tắc single responsibility.
- **Không dùng Blue**: Màu sắc sử dụng bảng token ngữ nghĩa V2 (`emerald` cho duyệt/đặt đủ, `amber` cho chờ duyệt/đang đặt, `destructive` cho từ chối/hủy, `secondary` cho nháp, `outline` cho đóng/chưa đặt).
- **V2StandardTable & Header Filter**: Cột số đề nghị dùng `V2TableText` hỗ trợ copy và click mở Drawer; cột ngày dùng `headerFilter.date`; cột tổng tiền dùng `headerFilter.amount` căn phải; cột trạng thái dùng `headerFilter.select`.
- **Search & Filter Đồng Bộ Hai Chiều (Web ↔ Backend)**:
  - Frontend chuyển đổi các filter header sang `column_filters`, `column_search`, `date_ranges`, `sort` dạng JSON.
  - Backend `ListProcurementRequestsDto` kế thừa `TableQueryDto`, query service bóc tách bằng `applyTableFilters`, `applyTableSort` và `applyMultiKeywordMultiFieldFilter` lọc chính xác trên SQL TypeORM.
- **Drawer Top Tabs & Audit Timeline**: 2 tab (`general`: Chi tiết, `traceability`: Chứng từ liên kết qua `DrawerRelatedDeck`). Nhật ký duyệt là `ProcurementRequestAuditSection` (`DrawerSection` + `DrawerAuditTimeline layout="stacked"`) nằm ở cột phải, dưới Tổng quan; không còn là tab. Section mặc định thu gọn (`defaultCollapsed`, vẫn hiện số lượng). Mỗi dòng: hành động, badge trạng thái theo `toStatus`, "tác nhân · dd/MM/yyyy HH:mm", lý do (`comment`). Dữ liệu qua `toAuditRows` (helper thuần): tác nhân = họ tên, rồi email, rồi "Không xác định"; không bao giờ hiện UUID (cập nhật 2026-11-06).
- **Nguồn dữ liệu nhật ký (API)**: `GET /api/v2/procurement-requests-garage/:id/approval-events` trả `actorName`, `actorEmail` (resolve bởi `ApprovalActorService`) và `comment`; không có `id` nội bộ. Hành động "Đóng" và "Hủy" đều được ghi nhật ký; nút "Đóng" ở chân drawer chỉ đóng cửa sổ.
- **Thao tác duyệt ngay trong Drawer**: Người dùng có thể Duyệt, Từ chối, Gửi duyệt, Hủy trực tiếp từ Drawer Footer khi đang xem đề nghị.
- **Mobile-First Ergonomics**: Kích thước vùng bấm chạm $\ge 44\text{px}$, input font $\ge 16\text{px}$ trên mobile, responsive layout co giãn 1 cột trên điện thoại / 2 cột trên máy tính.
- **Đa ngôn ngữ 100%**: 100% chuỗi văn bản sử dụng `t()` với prefix `v2.procurement.*` và `v2.garageProcurementRequests.*`.

## 4. Cập nhật 2026-11-06: chi nhánh tùy chọn

- Chi nhánh ở drawer đề nghị Garage là **tùy chọn**: chọn 1 chi nhánh hoặc để trống. Cờ `branchOptional` truyền từ `garageProcurementRequests.config.tsx` (`renderDrawer` → `<ProcurementRequestDrawer branchOptional />`). Luồng mua hàng thường không truyền cờ nên giữ nguyên bắt buộc.
- Ô chi nhánh dùng `ProcurementBranchPicker` (`clearable` khi tùy chọn), không còn ô text tự do. Placeholder `v2.procurement.fields.branchPlaceholder`.
- Vị trí: ô chi nhánh nằm **sau các trường chính, trước ghi chú** (helper `placeBranchField` trong `procurement.branch.ts`).
- Sửa chi nhánh chỉ khi DRAFT (`branchLocked` = `false` ở chế độ tùy chọn; trạng thái khác thì khóa theo quy ước cũ). Gửi `null` khi bỏ trống; tạo mới gửi `undefined` khi rỗng (tránh lỗi `@IsUUID` của chuỗi rỗng).
- Form: `validateRequestForm(form, branchOptional)`, `toRequestCreatePayload`, `toRequestHeaderPayload(form, branchOptional)` (core `form/procurementRequest.form.ts`).
- Test: `procurement.branch.test.ts`, `form/procurementBranchOptional.form.test.ts`.
- Ràng buộc PO: chi nhánh PO phải khớp PR nguồn kể cả khi cùng trống (backend kiểm tra).

## 6. Cập nhật 2026-11-06: layout đầu đề và lưu nháp

- Lưu nháp (cập nhật) đưa drawer về chế độ xem trước khi báo `onSaved` (`useProcurementRequestSave`, `onUpdated: setMode("view")`). Trước đó drawer ở lại chế độ sửa vì list không remount khi mode đổi từ bên trong drawer.
- Đầu đề khi sửa: Chi nhánh (một hàng) → Ngày đề nghị | Ngày cần hàng (cùng hàng) → Nội dung → Ghi chú. Chi nhánh đặt trên đầu, không còn đẩy xuống dưới theo `placeBranchField` ở PR.
- Ngày cần hàng mặc định bằng ngày đề nghị khi tạo mới. Đổi ngày đề nghị kéo theo ngày cần nếu ngày cần đang đồng bộ (trống hoặc bằng ngày đề nghị cũ); đã sửa lệch thì giữ (`nextNeededDate`, `form/procurementRequest.form.ts`).

## 5. Cập nhật 2026-11-06: khóa duyệt và chọn người duyệt

- Khóa bật/tắt chỉ ở BE, **không có công tắc trên UI**. Web đọc khóa qua `fetchApprovalSetting` (`{path}/setting`) để quyết định gating.
- Khi khóa **bật**: "Gửi duyệt" mở `SubmitApprovalModal` (`organisms/submit-approval-modal`), chọn người duyệt bằng `ApproverPicker` (`molecules/approver-picker`, dữ liệu từ `fetchApprovers`). Xác nhận bị khóa đến khi chọn người. Nút Duyệt/Từ chối chỉ hiện với đúng người được chỉ định (`applyApprovalGate`, `approval.gate.ts`).
- Khi khóa **tắt**: "Gửi duyệt" tự duyệt, không mở modal.
- Hook: `useProcurementApprovalGate` (orchestrator trong `useProcurementList`), `useApprovalSettingQuery`, `useApproversQuery`. Submit gửi `{ approverId }` qua `ProcurementApi.transition(id, 'submit', undefined, approverId)`.
- Label: tiêu đề và nhãn ở `procurement.approval.locale.ts` (`v2.procurementApproval.*`, VI/EN).

## 7. Cập nhật 2026-11-07: tối ưu hóa Mobile Card

- **Hỗ trợ đa badge trên card mobile**: `resolveMobileSlots` và `V2StandardTableMobileCard` mở rộng mảng `badges: V2Column<T>[]`, giữ `badge?: V2Column<T>` tương thích ngược. Mọi cột có `mobileSlot === "badge"` đều được render trên header card cạnh `#STT`.
- **Cột Tiến độ đặt (`orderingStatus`)**: Cấu hình `mobileSlot: "badge"`, hiển thị badge kế bên badge trạng thái duyệt (`status`).
- **Cột Người tạo (`createdBy`) và Người duyệt (`approver`)**: Chuyển từ `mobileSlot: "hidden"` sang `mobileSlot: "meta"`, hiển thị email qua atom `V2Text` variant `body-sm`, màu sắc semantic `foreground` / `muted`.


## 8. Cập nhật: response danh sách và hàng tổng

- **Hợp đồng list**: `ProcurementApi.list` gửi `summary_keys` (qua `toSummaryKeysParam`) và đọc `{ items, pagination: { total }, summaries }` từ API (`procurement.api.ts`), trả về `{ items, total, summaries }`. `summaries[key]` là `{ total, pageSubtotal, cumulative }` hoặc `null`. `useProcurementQuery` truyền `summaries` vào `V2ModuleListData`, và `V2ModuleListTab` gắn vào `column.summary`.
- **Hàng tổng**: cột `estimatedTotal` có `summary: { variant: "amount", metricTitle }`. Cột `requestNo` có `summary: { variant: "label", label }` làm nhãn "Tổng cộng:" (key `v2.procurement.columns.summaryTotal`).
- **Phạm vi**: chỉ áp dụng cho PR garage và PO garage. Kiểu `ProcurementListResponse<T>` có `pagination` và `summaries` (xem `procurement.types.ts`).

## 9. Cập nhật: bộ lọc có sẵn, chế độ xem và xóa mềm (cả hai tab)

- **Hook dùng chung**: `core/procurement/hooks/useProcurementListTabState.ts` ghép bộ lọc, chế độ xem, cột, thao tác dòng và `fetchOptions` cho một tab. Module chỉ truyền `api`, `buildColumns`, `viewVisibility` và danh sách trạng thái (`hooks/useProcurementListFilter.ts`, `hooks/useProcurementListView.ts`).
- **Bộ lọc có sẵn** (popover `view • filter`, `toolbar.filterGroup`): `Tất cả` → không lọc; từng trạng thái → `status`; `Đã xóa mềm` → `deleted=only`. Đổi bộ lọc bump `resetCount` để bảng về trang 1. Trạng thái đưa vào: PR `Nháp / Chờ duyệt / Đã duyệt`; PO thêm `Đã phát hành`.
- **Chế độ xem** (`toolbar.viewModes`): `Tổng quan` và `Tất cả cột`, đổi cột qua `applyV2SystemView` theo `viewVisibility` của `*Display` trong `*.config.tsx`.
- **Chế độ đã xóa mềm**: không mở được drawer (click bị bỏ qua); menu dòng chỉ còn `Xóa vĩnh viễn` khi có quyền `purge` (`purgeActions` của `useProcurementList`).
- **Tách file**: `GarageProcurementRequestsPage.hook.ts` (state hai tab, `resolveDrawerTarget`, tab đang mở) và `GarageProcurementRequestsPage.tabs.tsx` (dựng `V2ModuleTab`). Trang chính 244 dòng.
- **Query**: `ProcurementTableQuery = V2TableQuery & { status?, deleted? }`; `toProcurementListParams` gửi `status` và `deleted`; `withProcurementFilter` gắn `deleted` vào gợi ý cột.

## 10. Cập nhật 2026-11-09: thông báo duyệt và deep link từ chuông

- Chuông V2 (`src/core/components/layout/V2ShellLayout.tsx`) truyền `onNotificationClick` → `resolveNotificationHref` (`src/v2/app/router/notificationTargetRoutes.ts`) → `navigateV2Url` (`src/v2/shared/utils/v2Url.ts`, pushState + popstate).
- Đích `PROCUREMENT_REQUEST_GARAGE`: `action=APPROVE` → `/garage-procurement?tab=requests&open=<id>&action=APPROVE`; `VIEW` → `?tab=requests&open=<id>`. Giữ tiền tố `/v2` nếu đang ở `/v2/*`.
- Hook `useProcurementDeepLink` (core `procurement/hooks/`) gọi trong `useGarageProcurementListStates`: đọc `open`/`action`, tải chi tiết qua `config.api.get`; mở `ProcurementApproveModal` nếu đúng người duyệt được chỉ định và phiếu `PENDING_APPROVAL` (qua `applyApprovalGate`), còn lại mở drawer xem. Lỗi tải báo toast. Luôn xóa `open`/`action` khỏi URL sau khi xử lý.
- Tab `?tab=` được theo dõi theo URL (`useGarageProcurementActiveTab`), nên đổi tab khi đang mở trang vẫn đúng.
- Response PR và PO trả `createdBy` (id) song song `createdByEmail` (đồng nhất, cập nhật 2026-11-09). Gate, deep link và nút gửi duyệt so sánh theo id; backend vẫn chặn duyệt phiếu của chính mình (400).
- Modal duyệt từ thông báo nhận dữ liệu chi tiết; `branchName` không có trong response chi tiết nên modal không hiện chi nhánh.

## 11. Đã duyệt rồi (thông báo và nút Duyệt) (cập nhật 2026-11-09)

- Bấm thông báo `action=APPROVE` mà phiếu không còn `PENDING_APPROVAL`: `useProcurementDeepLink` gọi `showAlreadyDecided` và mở `ProcurementAlreadyDecidedModal` (core `procurement/components/organisms/procurement-already-decided-modal/`), không mở drawer im lặng. Nhãn trạng thái lấy từ `v2.procurement.status.*`.
- Bấm Duyệt mà server trả 409 `code: INVALID_STATUS_TRANSITION` (kèm `currentStatus`): `useProcurementTransition` đóng modal duyệt, làm mới danh sách và gọi `onAlreadyDecided` thay toast lỗi. Helper: `isStatusConflictError`, `readCurrentStatus` trong `shared/utils/v2ApiError.ts`.
- State modal: `hooks/useProcurementAlreadyDecided.ts`. Locale: `procurement.alreadyDecided.locale.ts` (`v2.procurementAlreadyDecided.*`).
- Tab `orders` chưa có deep link và chưa có thông báo PO, nên chưa áp dụng.

## 12. Cập nhật: lập đơn mua từ đề nghị (cập nhật 2026-11-10)

- Nhãn menu và nút trên tab liên quan: "Lập đơn mua từ đề nghị này" (`v2.procurement.actions.createOrder`).
- Luồng: bấm menu gọi `orderFromRequest` (`hooks/useProcurementList.ts`): đóng drawer đề nghị đang mở, đặt ý định (`procurement.intent.ts`), chuyển sang `?tab=orders`.
- Chỉ danh sách có `requestApi` mới nhận ý định, qua `hooks/useProcurementOrderIntent.ts`. Trang Garage có hai danh sách cùng lúc, nên danh sách đề nghị không được nhận ý định (trước đây nó nuốt ý định và mở nhầm drawer đề nghị).
- Điền sẵn từ đề nghị (`orderFormFromRequestDraft`): chi nhánh, dòng còn lại, ngày dự kiến nhận = ngày cần hàng.
- Test: `hooks/useProcurementOrderIntent.test.tsx`, `procurement.intent.test.ts`.

## 13. Cập nhật: bố cục đầu đơn mua và chi nhánh khóa (cập nhật 2026-11-10)

- Đầu đơn mua (`procurement-order-drawer/sections/ProcurementOrderHeaderSection.tsx`) dùng lưới 2 cột: ô đề nghị (nếu có), Ngày đơn và Ngày dự kiến nhận cùng hàng, rồi chi nhánh. Garage đặt chi nhánh ngay dưới hai ô ngày (`placeBranchAfter`); luồng ERP giữ chi nhánh đầu.
- `ProcurementBranchPicker` có prop `locked`: hiện combobox vô hiệu hóa (cùng kiểu với ô đề nghị), không hiện khung chỉ-đọc. Đơn gắn đề nghị luôn khóa chi nhánh vì API bắt cùng chi nhánh với đề nghị.
- `V2Combobox` khi `clearable`: trigger `pl-3`, `pr-16` (có X) hoặc `pr-9`; nút X là `V2Button` ghost `icon-xs` trong cụm neo `right-3` cùng mũi tên, không đè nhau.
- Cột dòng hàng (PR và PO): Mã `w-24 min-w-[88px]`, Tên `min-w-[160px] w-[26%]`, Ghi chú `min-w-[180px] w-[34%]`, Thành tiền `w-40 min-w-[160px] whitespace-nowrap` (đủ số 12 chữ số).
- Đơn mua Garage bắt buộc mã hàng: `itemCodeRequired` (truyền từ `garageProcurementOrders.config.tsx`) → `validateProcurementLines(lines, true)` trả `"itemCode"`; cột Mã có dấu `*`. PR và ERP PO giữ mã tùy chọn.

## 9. Cập nhật 2026-11-11: REJECTED, Nhân bản, PO duyệt tắt

- Trạng thái REJECTED hiển thị nhãn "Đã từ chối". Bộ lọc trạng thái PR và PO có REJECTED (`GarageProcurementRequestsPage.hook.ts`, `procurementStatusOptions.ts`).
- Nhân bản: mục "Nhân bản" trong menu dòng, chỉ khi config có `cloneable` và trạng thái là REJECTED hoặc CANCELLED (`procurementRowActions.builder.tsx`). Gọi `api.clone` (`procurement.api.ts`, bật bằng `supportsClone`). Thành công thì mở drawer sửa của bản nháp mới.
- PO garage (`directConfirmWhenApprovalOff: true`): menu bỏ "Gửi duyệt" khi khóa tắt (`applyApprovalGate`, tham số `directConfirmWhenOff`). Drawer có nút "Tạo mới" (phiếu mới) hoặc "Cập nhật" (phiếu nháp) cạnh "Lưu nháp". Bấm là lưu rồi gửi, PO chuyển APPROVED.
- Bắt buộc truyền `directConfirm` cho mọi nơi render `ProcurementOrderDrawer`. Có hai nơi: `ProcurementListPage.tsx` và `GarageProcurementRequestsPage.tsx`. Thiếu prop ở một nơi thì nút không hiện (đã gặp và sửa 2026-11-11).
- Có E2E Playwright cho luồng này: xem `erp-web/e2e/` và skill `erp-e2e-playwright`.

## 14. Cập nhật 2026-11-11: hóa đơn/NCC, nhập nhiều đợt, xóa vĩnh viễn

- **Hóa đơn → NCC (đơn Garage)**: `ProcurementInvoicePicker` (combobox hóa đơn mua vào, tìm kiếm + cuộn tải thêm) ở hàng riêng; NCC ở hàng dưới, chỉ đọc "Tự điền theo hóa đơn". Chọn hóa đơn điền `supplierName` theo người bán và tìm NCC cùng MST (`findSupplierByTaxCode`); bỏ hóa đơn thì xóa NCC. Thiếu quyền đọc `invoices` thì lùi về ô text + chọn NCC. Số hóa đơn được gửi lúc tạo (`toOrderCreatePayload`).
- **Nhập nhiều đợt**: bảng dòng PO đã phát hành có cột Đã nhận / Còn lại (`showReceived`, `ProcurementLinesEditor.columns.received.tsx`); mục "Lịch sử nhập kho" (`ProcurementReceiptsSection`, nhận `receiptHistory` qua props, Garage tải bằng `listGarageOrderReceipts` lọc `garageProcurementOrderId`); bấm số phiếu mở `/garage-goods-receipts?receipt=<id>`. Form phiếu giới hạn số nhận theo `maxQty`.
- **Xóa vĩnh viễn chỉ ở bộ lọc "Đã xóa mềm"**: `buildProcurementRowActions` không còn nhận `purgeActions`; `useProcurementListTabState` chỉ trả nhóm "Xóa vĩnh viễn" khi bộ lọc có sẵn là "Đã xóa mềm" (cần quyền `purge`, chỉ phiếu nháp). Test: `useProcurementListTabState.test.tsx`.
- **V2 component**: `ProcurementReceiptsSection`, `ProcurementInvoicePicker`, `ProcurementLinesEditor` dùng `V2Text`/`V2Button` (không còn `<p>/<span>/<button>` thô). `ProcurementLinesEditor.helper.ts` giữ phần chèn cột và tổng chân bảng để file < 180 dòng.

## 7. Cập nhật 2026-11-12: Tạo mới / Cập nhật và bỏ Gửi duyệt riêng

- Drawer PR Garage: Hủy | Lưu nháp | Tạo mới (khi tạo) hoặc Cập nhật (khi sửa nháp). Chỉ nút Tạo mới/Cập nhật gửi duyệt, qua `api.saveAndSubmit` (`POST` / `PATCH .../save-and-submit`, một request).
- Khóa duyệt bật: modal chọn người duyệt (`SubmitApprovalModal`) mở trước khi gọi. `ProcurementListPage` và `GarageProcurementRequestsPage` truyền `approvalConfigPath` cho drawer để tải danh sách người duyệt.
- PR nháp không còn "Gửi duyệt" ở menu dòng (`availableActions` lọc `submit`) và trong drawer xem.
- Code: `ProcurementRequestDrawer.save.hook.ts` (tách khỏi `biz.hook`), `ProcurementRequestDrawer.hook.ts`.
