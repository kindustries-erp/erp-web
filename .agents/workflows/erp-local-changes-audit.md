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
3. **Quét tái sử dụng atom V2** trong các file đổi. Tìm phần tử HTML tự dựng rồi đối chiếu với atom có sẵn:
   ```bash
   grep -n "<button\|<input\|<select\|<textarea\|role=\"progressbar\"\|role=\"tab\"" <file>
   ls src/v2/shared/components/atoms/
   ```
   Nếu một phần tử tự dựng có atom V2 tương ứng (ví dụ `<button>` → `V2Button`, progress → `V2Progress`, chữ → `V2Text`) thì ghi FAIL. Ngoại lệ được phép: phần trang trí không có atom sẵn (chấm, gạch chân), ghi rõ lý do trong báo cáo.
4. **Quét màu theo token**: tìm màu raw cố định (`slate-`, `zinc-`, `teal-`, `emerald-`, `amber-`, `gray-`, `#hex`) trong file đổi. Màu có token ngữ cảnh tương ứng (`surface`, `border`, `foreground`, `muted-fg`, `primary`, `up-fg`, `warn-fg`, `faint`) phải dùng token để khớp mọi theme. Không dùng opacity modifier (`/50`) trên token dạng `var()`; dùng màu đặc hoặc `opacity-*`.
5. **Đối chiếu từng rule** trong bảng dưới. Mỗi dòng ghi PASS hoặc FAIL kèm `file#dòng`.
6. **Xuất báo cáo** theo bố cục tuân thủ: `1. Tổng quan`, `2. Bảng tuân thủ`, `3. Kết luận`.
7. **Nếu có FAIL**: lập plan enhance và fix theo mẫu `/erp-plan` (Task 3 cấp, DoD, Verification), trình trong hội thoại, đặt `RequestFeedback: true`, rồi **DỪNG** chờ `OK`.

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
| Tái sử dụng atom V2 | Không tự dựng `<button>`, `<input>`, progress, chữ khi đã có `V2Button`, `V2Input`, `V2Progress`, `V2Text`… Ngoại lệ phải ghi lý do | `erp-web/.agents/AGENTS.md` mục 1, skill `erp-find-ui-patterns` |
| Zustand | Selector riêng lẻ | `erp-ui-structure` mục 2 |
| Server state | `@tanstack/react-query`, không `useEffect` + fetch | `erp-web/.agents/AGENTS.md` mục 3 |
| Bảng và drawer chuẩn | `SpreadsheetPageTemplate` hoặc `V2StandardTable`; `StandardFormDrawer` hoặc `V2StandardDrawer` | `erp-ui-structure` Phần C |
| Test đi kèm | Logic mới có `.test.tsx` hoặc `.test.ts` | `erp-web/.agents/AGENTS.md` mục 4 |

## Quy tắc

- Không chạy `bun run build`, test runner hay lệnh ghi file.
- Không in giá trị từ `.env`.
- Chỉ kết luận từ mã đã đọc. Nếu chưa kiểm, ghi "chưa kiểm".
- Ghi rõ đây là kiểm tra thủ công, có thể bổ sung scanner Web sau.
