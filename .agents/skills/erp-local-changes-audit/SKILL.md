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
3. Đối chiếu từng file với `erp-ui-structure`: tầng Atomic và import một chiều, folder-per-component, tên hook, core theo họ, i18n (prefix `v2.` cho V2), No Blue, selector Zustand, react-query, bảng và drawer chuẩn, test đi kèm.
4. Ghi bảng tuân thủ: rule | file#dòng | PASS hoặc FAIL.
5. Nếu có FAIL, đưa plan enhance và fix theo mẫu `/erp-plan`, rồi dừng chờ `OK`.
