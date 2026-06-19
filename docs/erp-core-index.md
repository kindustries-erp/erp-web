# ERP CORE Docs Index — Web

> **HISTORICAL REFERENCE ONLY**
> File này được giữ để bảo toàn lineage cũ của lane `erp-core`.
> Không dùng file này làm source of truth mặc định cho agent hoặc implementation mới.
> Source of truth agent-facing hiện tại nằm trong `.agents/` của repo.

File này là entrypoint nhanh cho agent/developer khi vào repo `liouni-erp-web` thuộc lane `erp-core`.

## Purpose

- Giúp agent đọc đúng bộ docs cho lane `erp-core`
- Tránh nhầm giữa:
  - **active ERP CORE UI/docs**
  - **legacy ERP web docs kept for history**

## Read this first

1. `../AGENTS.md`
2. `../docs-ai/MASTER_CONTEXT.md`
3. `../docs-ai/runbooks/liouni-erp-ops.md`
4. `../docs-ai/liouni-erp/erp-shared-context.md`
5. `../docs-ai/liouni-erp/artifacts/20260609-erp-core-master-plan-and-status.md`
6. `docs/app-structure.md`
7. File này: `docs/erp-core-index.md`
8. Task file core liên quan trong `docs/tasks/`

## Canonical lane meaning

- `/opt/repos/liouni-erp-core/liouni-erp-web` = active ERP CORE Web source root
- `/opt/repos/liouni-erp` = legacy/Directus lane source root
- Một số docs có reference sang legacy Directus/ERP cũ để giữ traceability; không mặc định xem là drift runtime

## Recommended active ERP CORE docs

Đây là nhóm file nên ưu tiên đọc khi làm lane `erp-core`:

### Scope cut / UI planning

- `docs/tasks/20260607-erp-core-web-scope-cut.md`
- `docs/tasks/20260607-221937-erp-core-ui-cases-1-5-plan.md`
- `docs/tasks/20260607-erp-core-wave2-plan.md`

### Core implementation / verify / deploy

- `docs/tasks/20260608-103200-wave2-bom-crud.md`
- `docs/tasks/20260608-110000-wave2-gr-from-po.md`
- `docs/tasks/20260608-111500-wave2-so-reserve.md`
- `docs/tasks/20260608-120600-wave2-format-cleanup.md`
- `docs/tasks/20260608-123600-erp-core-elite-deploy.md`
- `docs/tasks/20260608-154500-fix-erp-core-auth-login-path.md`
- `docs/tasks/20260608-233600-purchase-order-ui-core-compatibility-fix.md`
- `docs/tasks/20260608-235700-wave2-core-flow-verification.md`
- `docs/tasks/20260609-000800-purchase-form-and-goods-receipt-ux-fixes.md`

## Docs classification guide

### A. Active ERP CORE docs

Dấu hiệu thường gặp:

- filename chứa `erp-core`
- tập trung vào login core, purchasing, goods receipt, BOM, production, sales/shipping
- nhắc backend core API `:10010`, web `:8809`, Neon/Postgres, core route/page contracts

### B. Legacy docs kept for history

Các docs sau thường không phải active core scope mặc định:

- AR UI / customer advance
- payment voucher / cashbank UI
- einvoice / tax portal
- app-shell refinements không gắn trực tiếp với lane core hiện tại
- các UI experiments cũ còn lưu để trace history

### C. Shared shell docs

Một số docs về shell/layout/component pattern vẫn còn hữu ích cho core lane, ví dụ:

- `docs/app-structure.md`
- `docs/ai/technical-instructions.md`

Nhóm này vẫn là active reference về cách build UI, dù không phải “ERP CORE business flow docs”.

## Decision rule if docs conflict

Thứ tự ưu tiên nguồn sự thật:

1. `docs-ai/liouni-erp/artifacts/20260609-erp-core-master-plan-and-status.md`
2. `docs-ai/liouni-erp/erp-shared-context.md`
3. route/page/source hiện đang mount trong repo
4. task doc repo-local mới nhất thuộc lane `erp-core`
5. legacy task docs chỉ để tham chiếu

## Practical instruction for agents

Nếu user chỉ nói “tiếp tục lane ERP CORE” mà chưa nêu màn cụ thể, mặc định:

1. đọc canonical artifact trong `docs-ai`
2. đọc `app-structure.md`
3. đọc task core gần nhất liên quan page/flow đang sửa
4. inspect route/page/API client đang mount thật
5. làm theo DB -> API -> UI -> QC, không overclaim từ mỗi build pass
