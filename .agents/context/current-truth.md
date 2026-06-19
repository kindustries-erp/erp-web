# Current Truth

- Main ERP lane hiện tại: **GitHub + branch `erp-master`**
- Repo này là Web repo của lane active.
- Local path có thể vẫn nằm dưới thư mục lịch sử `liouni-erp-core`, nhưng đó không phải tên branch active.
- Directus-related ERP material = **legacy/reference only** trừ khi task explicit nói legacy maintenance / historical audit.
- Gitea = historical only cho main ERP lane hiện tại.
- Old dev domains không phải current-truth endpoints mặc định.
- Removed stack wrappers `liouni-erp-core-*` không được assume còn tồn tại.

## Repo role

- UI flows
- route wiring
- action visibility by status/state
- consuming real API contract
- build/test/route smoke evidence cho Web lane
