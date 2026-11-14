---
name: erp-local-changes-audit
description: Kiểm tra thay đổi local chưa commit của erp-web có tuân thủ erp-ui-structure không (giới hạn 180 và 250 dòng, cấu trúc Atomic, import một chiều, tên hook, i18n, No Blue, react-query, bảng và drawer chuẩn, test đi kèm). Nếu chưa đạt thì lập plan enhance và fix và dừng chờ OK. Không sửa code.
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
5. Đối chiếu từng file với `erp-ui-structure`: tầng Atomic và import một chiều, folder-per-component, tên hook, core theo họ, i18n (prefix `v2.` cho V2), No Blue, selector Zustand, react-query, bảng và drawer chuẩn, test đi kèm.
6. Ghi bảng tuân thủ: rule | file#dòng | PASS hoặc FAIL. Bảng phải có đủ các dòng: tái sử dụng atom V2 và màu theo token.
7. Nếu có FAIL, đưa plan enhance và fix theo mẫu `/erp-plan`, rồi dừng chờ `OK`.
