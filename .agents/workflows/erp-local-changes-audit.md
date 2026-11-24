---
description: Kiểm tra thay đổi local của erp-web có tuân thủ erp-ui-structure không. Nếu chưa đạt thì lập plan enhance và fix theo /erp-plan và dừng chờ OK.
---

# 🛡️ `/erp-local-changes-audit` — erp-web

Workflow này đối chiếu thay đổi local (chưa commit) của `erp/erp-web` với chuẩn cấu trúc trong `erp-ui-structure`. Nếu chưa đạt thì **lập plan** enhance và fix, trình trong hội thoại, rồi **dừng chờ `OK`**. Không tự sửa code.

Kỹ năng chi tiết nằm ở skill `erp-local-changes-audit`. Nạp `erp-ui-structure` và `erp-web-truth` trước.

## Quy trình

1. **Thu thập thay đổi** (chỉ đọc, trong `erp/erp-web`): `git status --short`, `git diff --stat`, rồi đọc từng file đổi.
2. **Đo kích thước** các file `.tsx` và `.hook.ts` đổi, loại trừ file cấu hình và dữ liệu thuần:
   ```bash
   wc -l <file>
   ```
   Chưa có scanner cho Web, nên bước này dùng `wc`, `grep` và eslint ở chế độ chỉ đọc.
3. **Quét V2 Atom** trong các file đổi (`src/v2/**`). Tìm thẻ HTML trần rồi đối chiếu với atom có sẵn:
   ```bash
   grep -nE "<(button|input|select|textarea|span|p|label|hr)[[:space:]>]|role=\"(progressbar|tab)\"" <file>
   ls src/v2/shared/components/atoms/
   ```
   - **(A) FAIL — thẻ trần khi đã có atom**: phần tử tự dựng có atom V2 tương ứng (`<button>` → `V2Button`, `<input>` → `V2Input`, `<span>` chứa chữ → `V2Text`, badge → `V2Badge`, progress → `V2Progress`).
   - **(B) FAIL — thẻ trần vì thiếu atom**: chưa có atom tương ứng nhưng không có task tạo atom trong V2 (`src/v2/shared/components/atoms/`), hoặc atom được tạo ở sai chỗ (V1 `src/shared`, module). Khi FAIL (B), plan fix phải có task tạo atom bằng `bun run plop v2-component` (tầng `atoms`) đặt **trước** task sửa file dùng atom đó.
   - Ngoại lệ theo M3 (`erp-ui-structure` `references/atomic-ui.md` mục 2.1): chính file atom/`shared/ui`, test, stories, `<span className="sr-only">`, phần trang trí thuần (chấm, gạch chân) không có atom. Ghi rõ lý do trong báo cáo.
4. **Quét màu theo token**: tìm màu raw cố định (`slate-`, `zinc-`, `teal-`, `emerald-`, `amber-`, `gray-`, `#hex`) trong file đổi. Màu có token ngữ cảnh tương ứng (`surface`, `border`, `foreground`, `muted-fg`, `primary`, `up-fg`, `warn-fg`, `faint`) phải dùng token để khớp mọi theme. Không dùng opacity modifier (`/50`) trên token dạng `var()`; dùng màu đặc hoặc `opacity-*`.
5. **Quét Stories** cho file component **mới** (`??` hoặc `A` trong `git status`, không phải `*.stories|test|spec.tsx`) ở atoms, molecules, organisms, templates, và component mới trong `src/v2/core/<họ>/` hoặc `src/v2/modules/<module>/`: phải có `*.stories.tsx` cạnh file. Page ghép (`*Page.tsx`) và hook thuần được miễn, ghi lý do.
6. **Quét V2 component chuẩn mọi tầng**: trong `src/v2/**`, component con/liên quan dùng V2 chuẩn (`V2StandardTable`, `V2StandardDrawer`, `V2DrawerRowList`, atom/molecule/organism sẵn có). Tự dựng song song là FAIL. Thiếu thì tạo bằng `bun run plop v2-component` đúng tầng, task tạo đứng trước task dùng.
6b. **Quét Template trang (V2)**: page mới hoặc đổi trong `src/v2/**/pages/*Page*.tsx` (gồm biến thể `.desktop`/`.mobile`) phải bọc bằng template `V2ModulePage` (trang bảng) hoặc `V2PageLayout` (trang khác: kanban, dashboard, form), không tự dựng header (tiêu đề + icon + nút) bằng `div`/`V2Text`. Lệnh:
   ```bash
   /usr/bin/grep -LE "V2ModulePage|V2PageLayout" <các file *Page*.tsx đổi>
   ```
   File nào được liệt kê là FAIL, trừ page chỉ chuyển tiếp sang page khác (ghi lý do).
6c. **Quét UI tự dựng có component V2 tương ứng**: đối chiếu file đổi với bảng ánh xạ bên dưới. Mỗi mẫu khớp mà không dùng component V2 tương ứng là FAIL (C), ghi `file#dòng` và component thay thế.
7. **Quét tách core/modules**: UI, rule, hook controller, locale của một họ ở `src/v2/core/<họ>/`; module chỉ giữ API, cấu hình ghép, page, locale riêng. Core không import module (`from "@/v2/modules/` trong `src/v2/core/` là FAIL). Ngoại lệ duy nhất: auth store dùng chung `from "@/modules/auth/domain/authStore"` (theo `erp-web-truth` mục 4), không tính FAIL. Import qua barrel, không import sâu. Tính năng mới nằm ở V2, không thêm vào V1 `src/modules`.
8. **Đối chiếu từng rule** trong bảng dưới. Mỗi dòng ghi PASS hoặc FAIL kèm `file#dòng`.
9. **Xuất báo cáo** theo bố cục tuân thủ: `1. Tổng quan`, `2. Bảng tuân thủ`, `3. Kết luận`. Dòng bắt buộc: `Stories: PASS/FAIL`, `Core/Modules: PASS/FAIL`, `Plane: KINDU-xx` hoặc `Plane: không theo dõi`.
10. **Nếu có FAIL**: quét Plane tìm tiền lệ (skill `plane-work-items`, mục Quét tiền lệ), rồi lập plan enhance và fix theo mẫu `/erp-plan` (Task 3 cấp, DoD, Verification). Plan phải có bước tạo hoặc cập nhật Plane (Module, Cycle, Story, Task con) **trước** mọi sửa file. Trình trong hội thoại, đặt `RequestFeedback: true`, rồi **DỪNG** chờ `OK`.

## Bảng rule kiểm

| Rule | Ngưỡng hoặc tiêu chí | Nguồn |
| :--- | :--- | :--- |
| Giới hạn dòng `.tsx` và `.hook.ts` | Cảnh báo ở 180, chặn ở 250 | `erp-ui-structure` mục 2 |
| Folder-per-component, có `index.ts` | Bắt buộc | `erp-ui-structure` mục 2 |
| Import một chiều theo tầng Atomic | Không import ngang hàng, không import ngược | `erp-ui-structure` mục 2 |
| Tên hook | `[Component].hook.ts` hoặc `use<Tên>.ts` | `erp-ui-structure` mục 2 |
| Core theo họ | UI, rule, hook controller ở `src/v2/core/<họ>/`, import qua barrel | `erp-ui-structure` Phần B |
| i18n | Không hardcode chuỗi hiển thị; V2 có prefix `v2.` | `erp-ui-structure` mục 2 |
| No Blue | Không `blue-*` | `erp-ui-structure` mục 2 |
| Màu theo token theme | Màu có token ngữ cảnh phải dùng token (`surface`, `border`, `primary`, `muted-fg`…); không màu raw cố định; không opacity trên token `var()` | `erp-web-truth` mục 7, `erp-ui-structure` mục 2 |
| (A) Không thẻ trần khi đã có atom V2 | Trong `src/v2/**`, không tự dựng `<button>`, `<input>`, `<span>` chứa chữ, progress, badge… khi đã có `V2Button`, `V2Input`, `V2Text`, `V2Badge`, `V2Progress`… Ngoại lệ theo M3 phải ghi lý do | `erp-ui-structure` `references/atomic-ui.md` mục 2.1, `erp-web/.agents/AGENTS.md` mục 1 |
| (B) Thiếu atom → tạo trong V2 | Khi chưa có atom tương ứng: tạo trong `src/v2/shared/components/atoms/v2-<tên>/` bằng `bun run plop v2-component` (tầng `atoms`), đủ `V2<Tên>.tsx`, `.type.ts`, `index.ts`, `.stories.tsx`, barrel `atoms/index.ts`. Không tạo atom ở V1 hay trong module. Task tạo atom phải đứng trước task dùng atom | `erp-ui-structure` `references/atomic-ui.md` mục 2.1 M2 |
| Zustand | Selector riêng lẻ | `erp-ui-structure` mục 2 |
| Server state | `@tanstack/react-query`, không `useEffect` + fetch | `erp-web/.agents/AGENTS.md` mục 3 |
| Bảng và drawer chuẩn | `SpreadsheetPageTemplate` hoặc `V2StandardTable`; `StandardFormDrawer` hoặc `V2StandardDrawer` | `erp-ui-structure` Phần C |
| Drawer V2 view mode render thông tin | Ở view mode không có `V2ReadValue`, `V2TextField viewing`, input khóa; có `*View.tsx` dùng `V2DrawerRowList`; test khẳng định không có textbox/combobox. Audit: `/usr/bin/grep -rnE "V2ReadValue\|V2TextField[^>]*viewing" <file đổi>` | `standardize-drawer/references/v2-drawer.md` mục "View mode" |
| i18n V2 đủ VI/EN | Không hardcode chuỗi hiển thị. V2 dùng `useV2Translation`, key `v2.*`; mỗi key có đủ vi và en (`src/v2/shared/locales/` hoặc `<họ>.locale.ts`). Thiếu một bên là FAIL. Atom mới phải kèm key vi/en | `erp-ui-structure` `references/atomic-ui.md` mục 6.1, `erp-ui-structure` mục 2 |
| Field FK + giá trị song song dùng bộ chung | Cặp chọn FK + ô sửa cục bộ dùng `V2LinkedField`/`useLinkedField`, không tự dựng; giá trị điền là giá trị nguồn thuần (`getSourceText`), không nhãn "mã — tên"; id và giá trị song song đặt bằng hai setter riêng; có test hook, component và kiểm chọn-không-sửa không bị "Đã chỉnh" | `erp-ui-structure` Phần C, `standardize-drawer` |
| Test đi kèm | Logic mới có `.test.tsx` hoặc `.test.ts` | `erp-web/.agents/AGENTS.md` mục 4 |
| Stories cho component mới | File component mới có UI (atoms → organisms, kể cả core/modules) có `*.stories.tsx` cạnh file; story có state chính, chuỗi cố định có đủ VI/EN. Page ghép và hook thuần miễn, ghi lý do | `erp-ui-structure` `SKILL.md` mục 2, `references/atomic-ui.md` mục 2.1, I4 |
| Template trang V2 | Page trong `src/v2/**/pages/` dùng `V2ModulePage` hoặc `V2PageLayout`, không tự dựng header | `erp-ui-structure` `references/atomic-ui.md`, bước 6b |
| Ánh xạ UI tự dựng → V2 | Không tự dựng timeline, nhóm chọn dạng thẻ, kanban, panel, form field, combobox, date picker, confirm, modal, empty state, tab khi đã có component V2 (bảng ánh xạ bước 6c) | bước 6c |
| (C) Component con dùng V2 chuẩn mọi tầng | Trong `src/v2/**`, component con/liên quan dùng `V2StandardTable`, `V2StandardDrawer`, `V2DrawerRowList` và atom/molecule/organism sẵn có. Tự dựng song song là FAIL | `erp-ui-structure` `references/atomic-ui.md`, `standardize-table/references/v2-table.md`, `standardize-drawer/references/v2-drawer.md` |
| Tách core/modules (V2) | Core ở `src/v2/core/<họ>/`, module chỉ giữ API, cấu hình ghép, page, locale. Core không import module, không chứa tên module, import qua barrel. Tính năng mới không thêm vào V1 `src/modules` | `erp-ui-structure` Phần B, `erp-web/.agents/AGENTS.md` mục 2 |
| Plane trước khi làm | Khi plan fix có FAIL: có bước tạo/cập nhật Module, Cycle, Story, Task con (tên `[module] X.Y.Z`, có start/target date, state Backlog→Todo) trước mọi sửa file. Báo cáo ghi `Plane: KINDU-xx` | `plane-work-items` (mục Luồng state, Quy ước tên, Lịch Cycle, Quét tiền lệ) |

## Bảng ánh xạ UI tự dựng → component V2 (bước 6c)

Kiểm tồn tại trước khi kết luận: `ls src/v2/shared/components/{atoms,molecules,organisms,templates}/`. Bảng này không thay rule (A) về atom; nó bổ sung cho các mẫu nhiều phần tử.

| Mẫu tự dựng | Dùng | Lệnh grep gợi ý trên file đổi |
| :--- | :--- | :--- |
| Header trang (tiêu đề, icon, nút) tự dựng trong page | `V2PageLayout` hoặc `V2ModulePage` (templates) | `/usr/bin/grep -LE "V2ModulePage\|V2PageLayout" <*Page*.tsx>` |
| Danh sách nhật ký/lịch sử theo thời gian (`<ol>`/`<ul>` + chấm + đường kẻ dọc, hoặc map log ra hàng có giờ) | `V2ActivityTimeline` (hoặc `V2DrawerAuditTimeline` cho lịch sử chứng từ) | `/usr/bin/grep -nE "<(ol\|ul)[ >]\|border-l\|timeline" <file>` |
| Nhóm lựa chọn dạng thẻ/nút bấm chọn một (map option ra `V2Button` với `aria-pressed`/`variant` theo chọn) | `V2RadioCardGroup` cho 2-4 lựa chọn ngắn; từ 5 lựa chọn trở lên hoặc nhãn dài dùng `V2Combobox` `searchable={false}` (mobile tự mở bottom sheet) | `/usr/bin/grep -nE "aria-pressed\|aria-checked\|role=\"radio" <file>` |
| Bảng kanban, cột kéo thả | `V2KanbanBoard` | `/usr/bin/grep -nE "onDragStart\|onDrop\|draggable" <file>` |
| Khung có tiêu đề + viền bao nội dung | `V2Panel`; trong drawer dùng `DrawerSection` | `/usr/bin/grep -nE "rounded[^\"]*border[^\"]*p-" <file>` |
| Nhãn + control + lỗi tự ghép | `V2FormField` (form thường) hoặc `DrawerField` (trong drawer) | `/usr/bin/grep -nE "<label\|htmlFor=" <file>` |
| Chọn một giá trị từ danh sách có tìm kiếm | `V2Combobox` (một), `V2MultiCombobox` (nhiều); FK + giá trị song song dùng `V2LinkedField` | `/usr/bin/grep -nE "<select\|role=\"listbox" <file>` |
| Ô nhập tự do có gợi ý từ danh sách (gõ tên, chọn nhanh, không có thì giữ chữ đã gõ); không dùng công tắc "ngoài danh sách" | `V2AutocompleteInput` | `/usr/bin/grep -nE "<datalist\|V2Switch" <file>` |
| Chọn ngày | `V2DatePicker` | `/usr/bin/grep -nE "type=\"date\"" <file>` |
| Chọn ngày giờ | `V2DateTimePicker` (ngày + giờ + nút chọn nhanh); không dùng `V2Input type="datetime-local"` | `/usr/bin/grep -nE "datetime-local" <file>` |
| Hộp xác nhận xóa/hủy | `V2ConfirmModal` | `/usr/bin/grep -nE "window\.confirm\|confirm\(" <file>` |
| Hộp thoại tự dựng (overlay + khung) | `V2Modal` hoặc `V2BottomSheet` (mobile) | `/usr/bin/grep -nE "fixed inset-0" <file>` |
| Trạng thái rỗng | `V2EmptyState` | `/usr/bin/grep -nE "Không có\|Chưa có\|empty" <file>` |
| Thanh tab | `V2TabBar` hoặc `tabs` của `V2PageLayout` | `/usr/bin/grep -nE "role=\"tab" <file>` |

Khớp grep chưa đủ kết luận FAIL: đọc đoạn mã rồi mới ghi. Ngoại lệ (component V2 thiếu tính năng cần) phải ghi lý do và đề xuất mở rộng component V2 thay vì tự dựng.

## Quy tắc

- Không chạy `bun run build`, test runner hay lệnh ghi file.
- Không in giá trị từ `.env`.
- Chỉ kết luận từ mã đã đọc. Nếu chưa kiểm, ghi "chưa kiểm".
- Ghi rõ đây là kiểm tra thủ công, có thể bổ sung scanner Web sau.
