---
description: Quy trình chuẩn 5 giai đoạn lập Implementation Plan và chia tách Task 3 cấp (Atomic DoD, Scoped Verification, Session Checkpoint & Knowledge-Sync) chuyên nghiệp cho erp-web
---

# 📋 Standard Plan & Task Engineering Workflow (`/plan-and-task`) - Frontend Web

Workflow này định nghĩa quy chuẩn **bắt buộc** khi lập Kế hoạch Triển khai (**Implementation Plan**) và Phân rã Công việc (**Task Breakdown**) 3 cấp cho mọi tác vụ từ tạo màn hình mới (New Page), chuẩn hóa Bảng/Drawer (Standardize Table/Drawer), Tái cấu trúc (Atomic Refactor) đến Sửa lỗi Giao diện/State (UI Bugfix) trong **`erp-web`**.

---

## 🎯 6 Nguyên Tắc Cốt Lõi (Core Principles)

```mermaid
graph LR
    A["1. Discovery & UI Research"] --> B["2. Component & State Plan"]
    B --> C["3. Task 3 Cấp (X.Y.Z)"]
    C --> D["4. User Review & Approval"]
    D --> E["5. Execution & Checkpoint"]
    E --> F["6. Knowledge-Sync"]
```

1. **Plan-First, Code-Later (Strict Read-Only Discovery & Zero Execution)**:
   - Không sửa code và **TUYỆT ĐỐI KHÔNG CHẠY TEST RUNNER** (`vitest`, `bun run test`, `bun run check:ci`, `bun run build`) khi chưa có Plan được duyệt.
   - Toàn bộ Phase 1 đến Phase 4 hoạt động ở **CHẾ ĐỘ READ-ONLY 100%**.
   - Tuyệt đối **KHÔNG** viết code giao diện khi chưa làm rõ API contract, Layout mockup, Component breakdown và Form validation.

2. **Atomic Component Architecture (Rule < 180–200 lines)**:
   - Không tạo các file React nguyên khối > 200 dòng.
   - Luôn tách thành thư mục Atomic (`index.ts`, `Component.tsx`, `hooks/use[Component].ts`, `utils/...`, `types/...`).

3. **Strict UI Standards Compliance**:
   - DataTable: STT 1-based, Header Filter (`showColumnFilter: true`), Server-side sorting & search (`applyMultiKeywordFilter`), Pagination responsive (`getDefaultPageSize()`).
   - Drawer: `StandardFormDrawer` (hoặc `V2StandardDrawer`), kích thước `vw` responsive (`45vw` / `65vw` / `85vw`), Top Navigation Tabs, Collapsible Sections.

4. **Task Breakdown 3 Cấp (`X.Y.Z`) & Scoped DoD Verification**:
   - Đánh số `Phase.Group.Task` (ví dụ `1.1.1`, `2.2.1`, `3.1.2`). Mỗi task nhỏ gọn (1–2 files).
   - *Quy tắc Lập Plan (Zero Execution)*: Mã lệnh trong mục `Verification` chỉ là **ĐẶC TẢ VĂN BẢN (Text Specification)** để cam kết tiêu chí hoàn thành, **TUYỆT ĐỐI KHÔNG ĐƯỢC CHẠY** trong lúc lập Plan. Lệnh này CHỈ ĐƯỢC CHẠY ở Phase 5 sau khi User đã duyệt Plan.
   - *Runner của `erp-web`*:
     - Nếu task có file spec UI/Hook (`*.spec.tsx`): Dùng `bunx vitest run <spec>` hoặc `bunx vitest related <file> --run`.
     - Nếu là component UI/page/layout thông thường không có spec: Dùng `bunx tsc --noEmit` để type check nhanh (< 3s).
     - **TUYỆT ĐỐI CẤM** chạy full test (`bun run test`) hoặc full build (`bun run build`) ở từng task nhỏ!
   - *Final Gate (Phase 4)*: Commit (pre-commit chạy lint + `vitest related`) → `git pull --rebase` → `git push` (pre-push chạy `type:check`). Full test/build/check:ci chạy trên GitHub CI; xác nhận CI xanh ở Task 4.1.1. `bun run verify:final` là lệnh local tùy chọn.

5. **Session Checkpoint Protocol (Pause & Resume)**:
   - Hỗ trợ tạm dừng và tiếp tục mượt mà. Khi tạm dừng, bắt buộc ghi log vào mục `## ⏸️ Session Checkpoint`.
   - Khi tiếp tục, Agent đọc lại Checkpoint để xác định chính xác task đang dang dở và bắt đầu làm tiếp ngay mà không phải hỏi lại từ đầu.

6. **Knowledge-Sync Guard (Cập nhật Tri thức / Skill Liền Tay)**:
   - Ngay sau khi hoàn thành task/feature/refactor có thay đổi về UI layout, Component architecture, Token styling, Store state hoặc Props interface, Agent **BẮT BUỘC cập nhật lại Module Skill** tương ứng (tại `erp/erp-web/.agents/skills/modules/<module>/SKILL.md`) hoặc tạo mới skill (ví dụ `v2-layout`) để lưu giữ tri thức.
   - Tuyệt đối không để tri thức trong skill bị lỗi thời.

---

## 🧩 Tầng Cơ Chế Plan Theo Agent (`/plan` Bridge)

Workflow này là chuẩn chung. Mỗi agent dùng cơ chế plan gốc của mình để chạy Giai đoạn 1–4, nhưng artifact đầu ra luôn giống nhau: `implementation_plan.md` và Task 3 cấp.

| Agent | Cơ chế plan | Cách dùng |
| :--- | :--- | :--- |
| Claude Code | Plan mode gốc: `/plan` (tool `EnterPlanMode`) | Vào plan mode để khảo sát read-only và trình plan trong hội thoại. Sau khi user `OK` mới `ExitPlanMode`, lưu bản chốt vào `.agents/plans/<task-slug>/implementation_plan.md`, rồi chuyển sang Giai đoạn 5. |
| Antigravity | `implementation_plan.md` + `walkthrough.md` (Brain) | Dùng trực tiếp mẫu trong workflow này. Hai file này là artifact chính. |
| Codex, Copilot, Trae, agent khác | Không có plan mode tùy chỉnh | Trình plan trong chat, lưu bản chốt vào `.agents/plans/<task-slug>/implementation_plan.md` trong repo, chờ `OK`. |

Quy tắc áp dụng cho mọi agent:
- Cổng `OK` của user là bắt buộc. Plan mode chỉ thay thế bước khảo sát read-only, không thay thế cổng duyệt.
- Giai đoạn plan không chạy test runner, không sửa code.
- Sau `OK`: tạo task trên Plane (project KINDU) theo skill `plane-work-items`. Task ERP luôn có Story/Task.
- Task mới phải đi qua chuỗi `/plan-and-task`. Đừng bỏ qua giai đoạn 4 chỉ vì agent có plan mode riêng.

---

## 🧭 Quy Trình 5 Giai Đoạn Chuẩn (5-Phase SOP)

### 🔹 GIAI ĐOẠN 1: Discovery & UI/UX Research (Khảo sát API & UI Hiện Trạng - READ-ONLY)

1. **Kiểm tra Backend API Contract (READ-ONLY)**:
   - Xác nhận Backend đã có `getList` và `getColumnOptions`.
   - Kiểm tra định dạng DTO trả về, enum, permission keys.
2. **Khảo sát Reusable UI Patterns**:
   - Sử dụng các skill `/erp-find-ui-patterns`, `/standardize-table`, `/standardize-drawer`.
   - Tìm kiếm các component dùng chung (`SpreadsheetPageTemplate`, `StandardFormDrawer`, `ConfirmModal`, `DateRangePicker`).
   - ⚠️ **Tuyệt đối KHÔNG chạy test runner, build script hay sửa file ở bước này.**

---

### 🔹 GIAI ĐOẠN 2: Component Architecture & State Design (Thiết Kế Kỹ Thuật)

Soạn thảo tài liệu `implementation_plan.md`:

#### 1. Sơ đồ Cấu Trúc Component (Component Hierarchy)
```mermaid
graph TD
    Page["ListPage (SpreadsheetPageTemplate)"] --> FilterBar["Header Filter Bar"]
    Page --> Table["DataTable (1-based STT, Numeric Align, Badges)"]
    Page --> Drawer["Detail/Edit Drawer (StandardFormDrawer)"]
    
    Drawer --> TopTabs["Top Navigation Tabs"]
    Drawer --> Sec1["DrawerSection: General Info"]
    Drawer --> Sec2["DrawerSection: Sub-items / Traceability Graph"]
    Drawer --> Footer["Standard Drawer Footer (Submit/Cancel/Audit)"]
```

#### 2. Thiết kế State & Data Fetching
- TanStack Query Keys: `[moduleKey, 'list', queryParams]`, `[moduleKey, 'detail', id]`, `[moduleKey, 'column-options', columnKey]`.
- Mutations & Invalidation: Invalidate query list khi create/update/delete thành công.
- Custom Hooks: `use[Module]List`, `use[Module]Detail`, `use[Module]Mutations`.

#### 3. Thiết kế Form & Validation
- Zod Schema / React Hook Form rules.
- Trạng thái Loading, Error, Empty State, Skeleton.

---

### 🔹 GIAI ĐOẠN 3: 3-Level Task Breakdown & Concrete DoD (Phân Rã Task 3 Cấp)

Phân chia toàn bộ công việc theo hệ thống đánh số 3 cấp **`X.Y.Z`**:
* **`X` - Phase (Tầng giao diện)**:
  - `1`: API Client, Contracts & React Query Hooks
  - `2`: Data Tables & List Pages
  - `3`: Drawers, Forms & Modal Dialogs
  - `4`: QC, CI Check & Knowledge Sync
* **`Y` - Component Group (Nhóm chức năng)**:
  - `1.1`: Type Contracts & API Client | `1.2`: TanStack Query Hooks
  - `2.1`: DataTable Columns & Filters | `2.2`: List Page Assembly
  - `3.1`: Form Sections & Validation | `3.2`: Drawer / Modal Assembly
  - `4.1`: Unit Tests & Build Check | `4.2`: Module Skill & Knowledge Sync
* **`Z` - Atomic Task (Đơn vị thực thi nguyên tử & Scoped Verification)**:
  - Mỗi task giới hạn tác động trong 1–2 files.
  - Phải có mã lệnh **Verification** chạy độc lập thu hẹp (**Scoped Verification** < 5–10 giây).
  - ⚠️ **LƯU Ý QUAN TRỌNG**: Mã lệnh trong `Verification` ở đây chỉ là **đặc tả văn bản (Text Specification)**. **TUYỆT ĐỐI KHÔNG CHẠY LỆNH NÀY KHI ĐANG LẬP KẾ HOẠCH!**

#### ⚡ Chuẩn Lệnh Verification Cho `erp-web`:
| Loại Task | Verification Command Chuẩn (Nhanh < 5s) | Ghi chú quan trọng |
| :--- | :--- | :--- |
| **API Client / Types / Hooks** | `bunx tsc --noEmit` | Nhanh, không làm phiền test suite |
| **Component có file test spec** | `bunx vitest run src/modules/.../<file>.spec.tsx` | Chỉ chạy đúng file spec |
| **Component / Hook thay đổi** | `bunx vitest related src/modules/.../<file>.tsx --run` | Scoped test |
| **Page / Drawer / Layout** | `bunx tsc --noEmit` | Kiểm tra type strict |
| **Final Gate (Task 4.1.1)** | CI GitHub xanh: job check, test, build | Xác nhận sau khi push trên commit cuối; `verify:final` local là tùy chọn |

#### Cấu trúc một Task chuẩn:
```markdown
- [ ] **Task X.Y.Z: [Tên Task súc tích, rõ hành động]**
  - **Phân hệ**: `Frontend Web` | **Ưu tiên**: `[P0 / P1 / P2]`
  - **Runner**: `[Main Agent]` *(Mặc định là Main Agent cho mọi CLI đơn luồng như Codex/Claude. Chỉ ghi `Sub-agent (self)` khi Agent có hỗ trợ Sub-agent và task độc lập hoàn toàn)*
  - **Files**: `[NEW]` / `[MODIFY]` / `[DELETE]` [path/to/file](erp/erp-web/path/to/file)
  - **DoD**: TypeScript strict pass, render đúng layout, validate form chuẩn.
  - **Verification**: `[Lệnh kiểm thử scoped cụ thể: bunx tsc --noEmit hoặc bunx vitest run <spec>]`
```

---

### 🔹 GIAI ĐOẠN 4: Review, Alignment & Approval Gate (Duyệt Kế Hoạch)

**Bước 0: Kiểm tra chéo (Consistency Check, read-only)**: làm trước khi hỏi `OK`.
1. Mỗi tiêu chí chấp nhận (`AC-n`) ánh xạ tới ít nhất một task; mỗi task truy về ít nhất một AC. Không có task mồ côi, không có AC bị bỏ sót. Điền bảng truy vết AC → Task → Verification trong mục Spec.
2. Verification của task thật sự kiểm được AC đó, không chỉ là type-check chung.
3. Mọi mục `[CẦN LÀM RÕ]` đã được trả lời, hoặc nằm trong Open Questions chờ user quyết. Không để mơ hồ ngầm.
4. Plan không mâu thuẫn với skill chuẩn liên quan (No Blue, giới hạn 180 dòng, i18n, thứ tự giao hàng theo `AGENTS.md`).
5. Ghi một dòng kết quả trong plan: `Consistency Check: đạt` hoặc liệt kê chỗ lệch kèm cách xử lý.

1. Trình bày UI flow, layout, các trường form và các điểm cần User quyết định.
2. Đặt `RequestFeedback: true` trên `implementation_plan.md`.
3. **DỪNG LẠI (STOP) HOÀN TOÀN**: Khoanh tay chờ User phê duyệt (`OK` / `Confirm`). **TUYỆT ĐỐI KHÔNG tự ý thực thi task đầu tiên, KHÔNG chạy test runner, KHÔNG sửa file trước khi có xác nhận rõ ràng từ User.**

---

### 🔸 Sau `OK`: Xác nhận tích hợp Plane (`plane-work-items`)

Ngay sau khi User trả lời `OK` / `Confirm`, Agent **PHẢI HỎI** trước khi làm gì trên Plane:

> Bạn có muốn tôi tạo và theo dõi task này trên Plane (project KINDU, workspace k-industries) không? **Có / Không**

- **Có**: load skill `plane-work-items`, tạo Module, Cycle, Story và Task theo mục 3 của skill, rồi ghi identifier (ví dụ `KINDU-12`) vào `implementation_plan.md`. Khi task đổi trạng thái thì cập nhật trên Plane.
- **Không**: chỉ theo dõi trong `implementation_plan.md`, và ghi dòng `Plane: không theo dõi` vào plan.
- Với task ERP, lựa chọn khuyến nghị là **Có**, theo quy tắc ERP trong `AGENTS.md`. Câu hỏi vẫn phải được hỏi.
- Chưa có `OK` thì không tạo gì trên Plane. Không ghi plan hay task vào Trilium.

---

### 🔹 GIAI ĐOẠN 5: Real-time Execution, Pause/Resume & Walkthrough

#### 1. Quy tắc Thực thi & Tick Done Thời Gian Thực (Real-time Tracking)
- **Single Active Task**: Khi bắt đầu làm một task, đổi ngay `[ ]` thành `[/]`. Tại một thời điểm **chỉ có 1 task duy nhất** ở trạng thái `[/]`.
- **Test-Before-Tick Guard**: 
  - Chỉ được đổi `[/]` thành `[x]` khi và chỉ khi lệnh trong mục `Verification` trả về kết quả **PASS 100%**.
  - Nếu test fail hoặc type error: giữ nguyên `[/]`, tiếp tục sửa code cho đến khi test pass.
- **Live Sync**: Ngay khi hoàn tất một task, ghi nhận trạng thái vào `implementation_plan.md` ngay lập tức, không để dồn đến cuối mới tick.

#### 1.1 Cơ chế Thực thi Thống nhất (Single-Agent vs Sub-agent Delegation)
Để đảm bảo **bất kỳ AI Agent nào (Codex CLI, Claude Code, Gemini CLI, Antigravity) cũng đều thực thi và có hành động giống hệt nhau**, toàn bộ hệ thống tuân theo các nguyên tắc chuẩn hóa:
- **Chuẩn Mặc Định Cho Mọi Agent (Single-Agent Baseline)**:
  - Mọi Agent (dù đơn luồng hay đa nhiệm) đều có thể tự mình thực thi tuần tự từ trên xuống dưới (`[/]` ➔ sửa file ➔ chạy verification ➔ PASS ➔ tick `[x]`).
  - Khi chạy trên các công cụ không có Sub-agent (Codex CLI, Claude Code), Agent chính tự làm 100% các task mà không yêu cầu thêm công cụ nào khác.
- **Cơ Chế Ủy Quyền Sub-agent (Khi môi trường hỗ trợ, ví dụ Antigravity)**:
  - **Điều kiện ủy quyền**: Chỉ kích hoạt khi Agent có công cụ `invoke_subagent` VÀ task thỏa mãn tính độc lập (ví dụ component/page riêng biệt, hoặc khi User chỉ định / dùng `/teamwork`).
  - **Quy tắc Giao việc**: Agent chính gọi Sub-agent (`self`) bằng cách trích xuất chính xác: `Task X.Y.Z`, `Files được phép sửa`, `DoD`, và `Lệnh Verification`.
  - **Quy tắc Thực thi của Sub-agent**: Sub-agent khi nhận task **BẮT BUỘC tuân thủ đúng DoD và Verification của task đó**, tuyệt đối không sửa lan man ngoài scope.
  - **Nguyên tắc Gatekeeper (Trách nhiệm Người Giữ Cổng)**: Sub-agent **TUYỆT ĐỐI KHÔNG** tự ý tick `[x]` vào `implementation_plan.md`. Sub-agent chỉ thực thi, chạy verification, và báo cáo kết quả kèm bằng chứng test pass về cho Agent chính.
  - **Nghiệm thu & Cập nhật**: Agent chính nhận kết quả, xác minh lại lệnh Scoped Verification thực sự PASS 100%, sau đó Agent chính mới chuyển task sang `[x]` trên `implementation_plan.md`.
  - **Tính Nhất Quán**: Dù do Main Agent tự làm hay Sub-agent thực hiện, mã nguồn, commit log, test passing và tài liệu nghiệm thu (`walkthrough.md`) là **100% ĐỒNG NHẤT**.

#### 2. Giao thức Tạm dừng (Pause Protocol)
Khi người dùng yêu cầu tạm dừng, đổi context hoặc phiên làm việc bị ngắt quãng:
Agent **bắt buộc cập nhật** section `## ⏸️ Session Checkpoint` ở cuối file `implementation_plan.md`:
```markdown
## ⏸️ Session Checkpoint (Tạm dừng lúc: YYYY-MM-DD HH:mm)
- **Active Task**: `Task X.Y.Z: [Tên Task]` (`[/] In Progress`)
- **Tiến độ chi tiết**: Đã hoàn thành các phần nào, đang dừng tại dòng/hàm nào.
- **Việc chưa xong**: Cụ thể điều kiện biên hoặc tương tác nào đang xử lý dở.
- **Git Status**: Danh sách file đã sửa nhưng chưa commit.
- **Hành động tiếp theo khi Resume**: Lệnh hoặc bước cụ thể cần làm ngay khi bật lại session.
```

#### 3. Giao thức Tiếp tục (Resume Protocol)
Khi bắt đầu lại phiên làm việc (User gõ `tiếp tục`, `continue`, hoặc gửi prompt mới):
1. **Đọc Checkpoint**: Agent đọc `implementation_plan.md` và kiểm tra mục `## ⏸️ Session Checkpoint`.
2. **Xác định Task Active**: Tìm task có trạng thái `[/]` (nếu có) hoặc task `[ ]` đầu tiên theo thứ tự từ trên xuống.
3. **Báo cáo User**: Thông báo ngắn gọn vị trí đang tiếp tục:
   > *"Phiên làm việc trước đang tạm dừng tại **Task X.Y.Z: [Tên Task]** ([Mô tả tiến độ dở]). Em sẽ tiếp tục hoàn thiện task này ngay bây giờ."*
4. **Thực thi liền mạch**: Bắt tay làm tiếp ngay từ đúng bước trong checkpoint mà không làm lại từ đầu.

#### 4. Nghiệm thu, Cập nhật Tri thức & Báo cáo (Walkthrough & Knowledge Sync)
- **Nghiệm thu cuối cùng (Final Gate)**: Sau khi commit và `git pull --rebase`, push (pre-push chạy `type:check`) rồi xác nhận CI GitHub xanh trên commit cuối.
- **Knowledge & Skill Sync (Bắt buộc kiểm tra & cập nhật liền sau khi xong task)**:
  - Nếu có thay đổi cấu trúc component, props, hooks, stores, hoặc semantic tokens: cập nhật ngay file Module Skill tương ứng (như `v2-layout`, `app-store`, `standardize-drawer`, ...) hoặc tạo skill mới.
  - Liên kết skill mới vào `erp-web-truth`.
  - Tuyệt đối không để tri thức chỉ nằm trong commit hoặc đầu óc mà không ghi vào skill.
- **Tạo Báo cáo Nghiệm thu**: Tạo file `walkthrough.md` đính kèm bằng chứng test pass, screenshot giao diện (nếu có) và hướng dẫn thao tác kiểm thử UI.

---

## 📑 MẪU IMPLEMENTATION PLAN CHUẨN (`implementation_plan.md`)

```markdown
# [Tên Màn Hình / Feature]: Kế Hoạch Triển Khai Giao Diện (erp-web)

Tóm tắt mục tiêu giao diện, người dùng mục tiêu và luồng tương tác chính.

## 📝 Spec (Mục tiêu & Tiêu chí chấp nhận)
- **Mục tiêu**: một hai câu nói rõ việc này giải quyết vấn đề gì cho ai.
- **Phạm vi và ngoài phạm vi**: liệt kê rõ để tránh task lan ra ngoài yêu cầu.
- **Tiêu chí chấp nhận** (mã `AC-1`, `AC-2`, ...; mỗi tiêu chí phải kiểm chứng được bằng test, lệnh hoặc quan sát cụ thể):
  - [ ] `AC-1`: ...
- **Bảng truy vết** (điền ở Giai đoạn 4 khi Consistency Check):

| AC | Task | Verification |
| :--- | :--- | :--- |
| `AC-1` | `1.1.1` | ... |

## ⚠️ User Review Required
> [!IMPORTANT]
> - **Điểm quyết định UI**: Kích thước Drawer (`45vw` vs `65vw`), các tab điều hướng trên đầu.
> - **Behavior**: Hành vi sau khi Lưu (Đóng Drawer hay giữ nguyên form).

## ❓ Open Questions
> Mỗi điểm mơ hồ ghi thành một mục gắn nhãn `[CẦN LÀM RÕ]`. Không tự giả định thay user; nếu user bỏ qua thì ghi giả định đã chọn vào đây.
- [ ] **Câu hỏi 1**: Bảng dữ liệu có cần cột tính tổng phụ (Subtotal footer) ở dưới không?

---

## 🏛️ Thiết Kế Cấu Trúc Component & State

### 1. Phân Rã Component (Atomic Hierarchy)
- `src/modules/example/`
  - `pages/ExampleListPage.tsx` (Dùng `SpreadsheetPageTemplate`)
  - `components/ExampleDrawer/`
    - `index.ts`
    - `ExampleDetailDrawer.tsx` (Dùng `StandardFormDrawer`, size `65vw`)
    - `ExampleGeneralSection.tsx`
    - `ExampleHistorySection.tsx`
  - `hooks/`
    - `useExampleList.ts` (State: page, pageSize, filters, sorts)
    - `useExampleDetail.ts`
    - `useExampleMutations.ts`
  - `api/exampleApi.ts`

### 2. Form & Validation
- Zod schema: `code` (bắt buộc), `amount` (số dương), `status` (enum).

---

## 📋 Task Breakdown 3 Cấp & Definition of Done (DoD)

### Phase 1: API Client & Custom Hooks
#### 1.1 Type Contracts & API Client
- [ ] **Task 1.1.1: Định nghĩa Interface & API Client**
  - **Phân hệ**: `Web` | **Ưu tiên**: `P1`
  - **Files**: `[NEW]` [src/modules/example/api/exampleApi.ts](erp/erp-web/src/modules/example/api/exampleApi.ts)
  - **DoD**: Khớp type contract với Backend response DTO.
  - **Verification**: `bunx tsc --noEmit`

#### 1.2 TanStack Query Hooks
- [ ] **Task 1.2.1: Tạo useExampleList Hook**
  - **Phân hệ**: `Web` | **Ưu tiên**: `P1`
  - **Files**: `[NEW]` [src/modules/example/hooks/useExampleList.ts](erp/erp-web/src/modules/example/hooks/useExampleList.ts)
  - **DoD**: Fetch dữ liệu có phân trang, server filter.
  - **Verification**: `bunx tsc --noEmit`

### Phase 2: Data Tables & List Pages
#### 2.1 DataTable Page
- [ ] **Task 2.1.1: Xây dựng ExampleListPage**
  - **Phân hệ**: `Web` | **Ưu tiên**: `P1`
  - **Files**: `[NEW]` [src/modules/example/pages/ExampleListPage.tsx](erp/erp-web/src/modules/example/pages/ExampleListPage.tsx)
  - **DoD**: Dùng `SpreadsheetPageTemplate`, STT 1-based, Header Filter đầy đủ.
  - **Verification**: `bunx tsc --noEmit`

### Phase 3: Detail/Edit Drawer
#### 3.1 Drawer Assembly
- [ ] **Task 3.1.1: Xây dựng ExampleDetailDrawer**
  - **Phân hệ**: `Web` | **Ưu tiên**: `P1`
  - **Files**: `[NEW]` [src/modules/example/components/ExampleDrawer/ExampleDetailDrawer.tsx](erp/erp-web/src/modules/example/components/ExampleDrawer/ExampleDetailDrawer.tsx)
  - **DoD**: `StandardFormDrawer`, kích thước `65vw`, responsive, validate form chuẩn.
  - **Verification**: `bunx tsc --noEmit`

### Phase 4: QC & Knowledge Sync
#### 4.1 Automated Tests & CI Check
- [ ] **Task 4.1.1: Xác nhận CI GitHub xanh trên commit cuối**
  - **Phân hệ**: `QC` | **Ưu tiên**: `P0`
  - **DoD**: CI xanh (job check, test, build): 100% test pass, không lỗi ESLint, Prettier và TypeScript.
  - **Verification**: CI GitHub của nhánh đích xanh; tùy chọn `bun run verify:final` local.

#### 4.2 Knowledge & Skill Sync
- [ ] **Task 4.2.1: Đồng bộ Module Skill (Nếu có thay đổi UI/Layout/Store/Contract)**
  - **Phân hệ**: `Docs/Skill` | **Ưu tiên**: `P1`
  - **Files**: `[MODIFY]` / `[NEW]` [.agents/skills/modules/<module>/SKILL.md](erp/erp-web/.agents/skills/modules/<module>/SKILL.md)
  - **DoD**: Bổ sung props, tokens, component tree mới vào Module Skill.
  - **Verification**: `view_file` kiểm tra nội dung skill chuẩn xác, không còn thông tin cũ/sai lệch.

---

## ⏸️ Session Checkpoint
*(Mục này sẽ được cập nhật khi phiên làm việc cần tạm dừng hoặc đổi ngữ cảnh)*
- **Active Task**: `None`
- **Tiến độ chi tiết**: Chưa bắt đầu
- **Git Status**: Clean
- **Hành động tiếp theo khi Resume**: Bắt đầu Task 1.1.1
```

---

## 📦 MẪU BÁO CÁO NGHIỆM THU (`walkthrough.md`)

```markdown
# 🚀 Walkthrough & Verification Report: [Tên Giao Diện]

## 📝 Tóm Tắt Thay Đổi
| Phân hệ | File | Loại | Mô tả |
| :--- | :--- | :---: | :--- |
| **Web** | `src/modules/.../ListPage.tsx` | `NEW` | Màn hình DataTable chuẩn |
| **Web** | `src/modules/.../Drawer.tsx` | `NEW` | Drawer chỉnh sửa/chi tiết |

## 🧪 Bằng Chứng Xác Thực (Test Evidence)
- **Unit Tests**: `bun run test` ➔ `PASS (100% tests)`
- **CI Check**: `bun run check:ci` ➔ `PASS (0 errors)`
- **Build Check**: `bun run build` ➔ `SUCCESS (0 errors)`

## 🧠 Tri Thức & Skill Đồng Bộ (Knowledge Sync)
- **Module Skill**: Đã cập nhật `[path/to/SKILL.md]` (hoặc: *Không có thay đổi contract/component*).
- **Current Truth**: Đã liên kết vào `erp-web-truth`.
```
