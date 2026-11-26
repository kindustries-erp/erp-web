---
name: erp-local-changes-audit
description: Kiểm tra thay đổi local chưa commit của erp-web có tuân thủ erp-ui-structure không (giới hạn 180 và 250 dòng, cấu trúc Atomic, import một chiều, tên hook, i18n, No Blue, react-query, bảng và drawer chuẩn, template trang và ánh xạ UI tự dựng sang component V2, test đi kèm). Nếu chưa đạt thì lập plan enhance và fix và dừng chờ OK. Không sửa code.
---

# ERP Web — Audit thay đổi local theo erp-ui-structure

Nạp `erp-ui-structure` và `erp-web-truth` trước. Quy trình đầy đủ và bảng rule nằm ở workflow `/erp-local-changes-audit` của cùng repo.

## Nguyên tắc

- Chỉ đọc. Không sửa code, không commit, không chạy build hay test.
- Chỉ kết luận từ mã đã đọc. Chưa kiểm thì ghi "chưa kiểm".
- Nếu có FAIL, lập plan enhance và fix theo `/erp-plan` và **dừng chờ `OK`**.

## Các bước

1. Lấy danh sách file đổi bằng `git status --short` và `git diff --stat` trong `erp/erp-web`.
2. Đo số dòng các file `.tsx` và `.hook.ts` đổi bằng `wc -l`, loại trừ `*.locale.ts`, `*.options.ts`, `*.config.ts`, `*.type.ts`, `*.data.ts`.
3. Quét V2 Atom: `grep -nE "<(button|input|select|textarea|span|p|label|hr)[[:space:]>]|role=\"(progressbar|tab)\"" <file>`, đối chiếu với `ls src/v2/shared/components/atoms/`. Hai loại FAIL:
   - (i) **Thẻ trần khi đã có atom**: phần tử tự dựng có atom V2 tương ứng (`V2Button`, `V2Input`, `V2Text`, `V2Badge`, `V2Progress`…). Ví dụ: `<button>` → `V2Button`, `<span>` chứa chữ → `V2Text`.
   - (ii) **Thẻ trần vì thiếu atom**: chưa có atom tương ứng nhưng file đổi không kèm task/atom mới trong `src/v2/shared/components/atoms/`, hoặc atom được tạo ở sai chỗ (V1 `src/shared`, module). Yêu cầu: tạo atom trong V2 bằng `bun run plop v2-component` (tầng `atoms`) theo `references/atomic-ui.md` mục 2.1 M2.
   Ngoại lệ (M3 trong `references/atomic-ui.md` mục 2.1): chính file atom/`shared/ui`, test, stories, `<span className="sr-only">`, chấm hoặc gạch chân trang trí. Phải ghi lý do.
4. Quét màu theo token theme: tìm `slate-`, `zinc-`, `teal-`, `emerald-`, `amber-`, `gray-`, `#hex`. Màu có token ngữ cảnh tương ứng phải dùng token. Không dùng opacity modifier (`/50`) trên token `var()`.
4b. Quét i18n V2 trong file đổi (`src/v2/**`):
   - Key không có tiền tố `v2.` hoặc dùng `react-i18next` là FAIL.
   - Mỗi key `t("v2.…")` phải có mặt cả trong `src/v2/shared/locales/vi*.ts` và `en*.ts`, hoặc trong `<họ>.locale.ts` tương ứng. Thiếu một bên là FAIL.
   - Chuỗi tiếng Việt hoặc Anh thô trong JSX (không qua `t()`) là FAIL.
   Lệnh: `grep -nE "t\(\s*\"v2\.[^\"]+\"" <file>` và đối chiếu từng key.
   Báo cáo bắt buộc một dòng: `i18n VI/EN đủ: PASS/FAIL`.
5. Đối chiếu từng file với `erp-ui-structure`: tầng Atomic và import một chiều, folder-per-component, tên hook, core theo họ, i18n (prefix `v2.` cho V2), No Blue, selector Zustand, react-query, bảng và drawer chuẩn, drawer V2 view mode render thông tin bằng `V2DrawerRowList` (không `V2ReadValue`/`V2TextField viewing`), test đi kèm.
5b. **Stories** (AC-1): với file component **mới** (`??` hoặc `A` trong `git status`, trừ `*.stories|test|spec.tsx`) ở atoms, molecules, organisms, templates, và component mới trong `src/v2/core/<họ>/` hoặc `src/v2/modules/<module>/`: kiểm `ls <thư mục>/*.stories.tsx`. Thiếu = FAIL. Page ghép (`*Page.tsx`) và hook thuần miễn, ghi lý do. Báo cáo: `Stories: PASS/FAIL`.
5c. **V2 component chuẩn mọi tầng** (AC-2): trong `src/v2/**`, component con/liên quan phải dùng `V2StandardTable`, `V2StandardDrawer`, `V2DrawerRowList` và atom/molecule/organism sẵn có. Kiểm: `ls src/v2/shared/components/*/` và tìm import tương ứng. Tự dựng bảng/drawer/bộ điều khiển song song là FAIL; thiếu thì task tạo bằng `plop v2-component` đứng trước.
5c-1. **Template trang**: page mới/đổi trong `src/v2/**/pages/*Page*.tsx` phải dùng `V2ModulePage` hoặc `V2PageLayout`; `/usr/bin/grep -LE "V2ModulePage|V2PageLayout" <file>` liệt kê file thiếu = FAIL (trừ page chỉ chuyển tiếp, ghi lý do).
5c-2. **Ánh xạ UI tự dựng → V2**: đối chiếu file đổi với bảng ánh xạ ở workflow (bước 6c): timeline → `V2ActivityTimeline`, nhóm chọn dạng thẻ → `V2RadioCardGroup` (≥5 lựa chọn → `V2Combobox` không tìm kiếm), kanban → `V2KanbanBoard`, khung có tiêu đề → `V2Panel`/`DrawerSection`, nhãn + control → `V2FormField`/`DrawerField`, chọn từ danh sách → `V2Combobox`/`V2LinkedField`, nhập tự do có gợi ý → `V2AutocompleteInput`, ngày → `V2DatePicker`, ngày giờ → `V2DateTimePicker` (cấm `datetime-local`), giờ → `V2TimePicker` (cấm `type="time"`), xác nhận → `V2ConfirmModal`, hộp thoại → `V2Modal`/`V2BottomSheet`, rỗng → `V2EmptyState`, tab → `V2TabBar`. Đọc mã trước khi kết luận; ngoại lệ ghi lý do. Báo cáo: `Template/Ánh xạ V2: PASS/FAIL`.
5d. **Tách core/modules** (AC-3): `grep -rnE "from \"@/v2/modules/" src/v2/core/` (core import module = FAIL); `grep -rnE "from \"@/v2/(core|modules)/[^\"]+/[^\"]+/" <file đổi>` (import sâu = FAIL); tính năng mới nằm ở V2, không thêm vào `src/modules` (V1). Báo cáo: `Core/Modules: PASS/FAIL`.
6. Ghi bảng tuân thủ: rule | file#dòng | PASS hoặc FAIL. Bảng phải có đủ các dòng: tái sử dụng atom V2, màu theo token, stories, V2 chuẩn mọi tầng, template trang, ánh xạ UI tự dựng → V2, tách core/modules.
7. Nếu có FAIL: quét Plane tiền lệ (skill `plane-work-items`, mục Quét tiền lệ) rồi đưa plan enhance và fix theo mẫu `/erp-plan`. Plan có bước tạo hoặc cập nhật Plane (Module, Cycle, Story, Task con) **trước** mọi sửa file, và báo cáo ghi `Plane: KINDU-xx`. Sau đó dừng chờ `OK`.
