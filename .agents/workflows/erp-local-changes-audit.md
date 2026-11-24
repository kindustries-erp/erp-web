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
| (C) Component con dùng V2 chuẩn mọi tầng | Trong `src/v2/**`, component con/liên quan dùng `V2StandardTable`, `V2StandardDrawer`, `V2DrawerRowList` và atom/molecule/organism sẵn có. Tự dựng song song là FAIL | `erp-ui-structure` `references/atomic-ui.md`, `standardize-table/references/v2-table.md`, `standardize-drawer/references/v2-drawer.md` |
| Tách core/modules (V2) | Core ở `src/v2/core/<họ>/`, module chỉ giữ API, cấu hình ghép, page, locale. Core không import module, không chứa tên module, import qua barrel. Tính năng mới không thêm vào V1 `src/modules` | `erp-ui-structure` Phần B, `erp-web/.agents/AGENTS.md` mục 2 |
| Plane trước khi làm | Khi plan fix có FAIL: có bước tạo/cập nhật Module, Cycle, Story, Task con (tên `[module] X.Y.Z`, có start/target date, state Backlog→Todo) trước mọi sửa file. Báo cáo ghi `Plane: KINDU-xx` | `plane-work-items` (mục Luồng state, Quy ước tên, Lịch Cycle, Quét tiền lệ) |

## Quy tắc

- Không chạy `bun run build`, test runner hay lệnh ghi file.
- Không in giá trị từ `.env`.
- Chỉ kết luận từ mã đã đọc. Nếu chưa kiểm, ghi "chưa kiểm".
- Ghi rõ đây là kiểm tra thủ công, có thể bổ sung scanner Web sau.
