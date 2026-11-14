---
name: erp-v2-feature
description: Quy trình full-stack (DB → API → UI bảng → UI drawer → QC) để dựng hoặc hoàn thiện một module V2 hoàn chỉnh cho bất kỳ tính năng nào. Dùng khi cần trang bảng có column option, filter, summary row và drawer chi tiết khớp contract API.
---

# ERP V2 Module Page (full-stack)

Skill điều phối. Không nhân bản chuẩn: mọi quy tắc chi tiết nằm ở reference có sẵn, skill này chỉ nói **làm gì, theo thứ tự nào, khi nào dừng**.

Repo liên quan:
- Web: `<workspace>/erp/erp-web` (nhánh `erp-master`)
- API: `<workspace>/erp/erp-api` (nhánh `erp-master`)
- Thứ tự bắt buộc: **DB → API → UI bảng → UI drawer → QC**.

## Bước 0. Intake và kiểm tra trạng thái (chỉ đọc)

Thu thập: tên module (kebab-case), `EntityName`/`PluralName`, fieldSpec (`name:type[:required]`), `apiBase`, `permissionCollection`, route, `navSection`, `tableInput` id.

Kiểm tra:
- API: đã có module v2 chưa, theo `erp/erp-api/.agents/skills/erp-api-structure/references/v2-module.md`?
- Web: đã có `src/v2/modules/<module>` hoặc họ lõi `src/v2/core/<họ>` chưa?

Quyết định:
- Thiếu hoặc chưa đạt chuẩn → làm từ bước 1.
- Đã đạt → chỉ chạy lại kiểm tra ở bước 5.

Chọn generator web: họ mới → `v2-core`; họ đã có lõi → `v2-thin-module`; module đứng riêng → `v2-module`.

## Bước 1. API (DB → API)

- Entity và migration nếu cần. **Migration DB phải được anh duyệt riêng trước khi chạy.**
- Sinh bằng generator plop `api-module-v2` (hoặc `api-voucher-v2` cho chứng từ), chạy từ `erp/erp-api`; tham số xem `erp/erp-api/.agents/skills/plop-generate/SKILL.md`. Dùng cùng fieldSpec với web.
- Endpoint phải có: list (filter, sort, phân trang, tổng cho cột `number`/`decimal`), detail, create, update, status, và `next-code` nếu `hasNextCode`.
- Hợp đồng HTTP theo `v2-module.md` mục 2b. DTO là nguồn sự thật cho drawer.
- Test API và build theo repo.

## Bước 2. UI bảng

- Chạy plop `v2-module` hoặc `v2-thin-module` (xem `references/plop-commands.md`), `wire=true`.
- Hoàn thiện theo `standardize-table/references/v2-table.md`:
  - Column selector: ẩn/hiện, thứ tự, độ rộng; giữ `tableInput` id.
  - Views và nhóm lọc.
  - Filter theo kiểu cột.
  - Summary row (`number` → qty, `decimal` → amount).
  - Search và query trên URL.
  - Trạng thái loading và rỗng.

## Bước 3. UI drawer

- `V2StandardDrawer` theo `standardize-drawer/references/v2-drawer.md`.
- Form map 1-1 với DTO của API. Key field và option lấy từ enum theo Phần D của `.agents/workflows/erp-ui-structure.md`.
- Validate trong `domain/rules`.
- Footer, tab liên kết, multi-drawer nếu cần.

## Bước 4. Nối và i18n

- Route, menu, page registry bằng marker `// plop:v2-*`, idempotent.
- Locale `vi.ts` và `en.ts`.

## Bước 5. QC

Chi tiết trong `references/checklist.md`. Tối thiểu:
- Web: `bunx prettier --write`, `bunx tsc --noEmit`, `bunx eslint <module> --max-warnings=0`, `bunx vitest run src/v2/modules/<module>`.
- API: test và build theo repo.
- Audit Phần A (file ≤180 dòng, không import ngược, mobile-first) và Phần B "Zero-Miss Quality Gate".

## Điểm dừng chờ OK

- Trước bước 1 nếu cần migration DB.
- Trước khi commit hoặc push.
- Trước smoke test trên DEV.

## Reference

- `references/plop-commands.md`: lệnh plop, fieldSpec, ví dụ.
- `references/checklist.md`: checklist đầy đủ từng bước.
