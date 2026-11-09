---
description: Quy trình full-stack (DB → API → UI bảng → UI drawer → QC) để dựng hoặc hoàn thiện một module V2 hoàn chỉnh. Đọc skill erp-v2-feature trước.
---

# ERP V2 Module Page (`/erp-v2-feature`)

Skill: `.agents/skills/erp-v2-feature/SKILL.md`. Checklist: `references/checklist.md`.

Chạy theo đúng thứ tự, dừng chờ `OK` tại các điểm trong SKILL.md:

1. **Intake và kiểm tra trạng thái** (chỉ đọc): API và web đã có module chưa.
2. **API**: entity và migration (dừng chờ duyệt nếu có DB change), sinh bằng generator plop `api-module-v2` (từ `erp/erp-api`), test và build.
3. **UI bảng**: `plop v2-module` hoặc `v2-thin-module`, hoàn thiện column selector, views, filter, summary row.
4. **UI drawer**: `V2StandardDrawer`, form khớp DTO, enum và option dùng chung.
5. **Nối và i18n**: route, menu, page registry, locale vi/en.
6. **QC**: prettier, tsc, eslint, vitest (web); test và build (API); audit Phần A và Phần B.

Không commit hoặc push khi chưa có yêu cầu.
