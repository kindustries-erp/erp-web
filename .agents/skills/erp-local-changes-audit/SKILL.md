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
3. Quét tái sử dụng atom V2: `grep -n "<button\|<input\|<select\|<textarea\|role=\"progressbar\"\|role=\"tab\"" <file>`, đối chiếu với `src/v2/shared/components/atoms/`. Phần tử tự dựng mà đã có atom V2 tương ứng (`V2Button`, `V2Progress`, `V2Text`…) là FAIL. Ngoại lệ (chấm, gạch chân trang trí) phải ghi lý do.
4. Quét màu theo token theme: tìm `slate-`, `zinc-`, `teal-`, `emerald-`, `amber-`, `gray-`, `#hex`. Màu có token ngữ cảnh tương ứng phải dùng token. Không dùng opacity modifier (`/50`) trên token `var()`.
5. Đối chiếu từng file với `erp-ui-structure`: tầng Atomic và import một chiều, folder-per-component, tên hook, core theo họ, i18n (prefix `v2.` cho V2), No Blue, selector Zustand, react-query, bảng và drawer chuẩn, test đi kèm.
6. Ghi bảng tuân thủ: rule | file#dòng | PASS hoặc FAIL. Bảng phải có đủ các dòng: tái sử dụng atom V2 và màu theo token.
7. Nếu có FAIL, đưa plan enhance và fix theo mẫu `/erp-plan`, rồi dừng chờ `OK`.
