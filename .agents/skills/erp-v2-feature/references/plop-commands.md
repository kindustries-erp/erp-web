# Lệnh plop và fieldSpec

Chạy từ `erp/erp-web`. Nguồn chuẩn: `.agents/skills/plop-generate/SKILL.md` mục 1.

## fieldSpec
`name:type[:required],...`. Type: `string | text | number | decimal | date | status`.
- `createdAt:date` luôn có sẵn.
- `number` → cột tổng số lượng (qty). `decimal` → cột tổng tiền (amount), căn phải, lọc số.
- Phải có ít nhất một trường `required`.
- Khi `hasNextCode=true`, trường đầu tiên phải là chuỗi và dùng làm mã.

## Ví dụ module đứng riêng
```bash
bun plop v2-module <moduleName> <Entity> <Plural> "<titleVi>" "<titleEn>" /api/v1/<route> <permission> <route> <navSection> erp-<moduleName>-table "<fieldSpec>" <hasNextCode> true
```
Giữ đúng `tableInput` id của V1 khi migrate để preference cột được nhận lại.

## Sau khi sinh
`bunx prettier --write src/v2/modules/<module>` (generator không format).
