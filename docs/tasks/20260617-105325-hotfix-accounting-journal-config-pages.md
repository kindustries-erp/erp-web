# Task: Hotfix accounting journal/config pages

- Scope: FE hotfix cho `erp-accounting-journal` và `erp-accounting-config`
- Gate 0 DB: N/A nếu chỉ là page-start/runtime FE bug; sẽ escalate nếu phát hiện API contract gap
- Order: DB -> API -> UI -> QC
- Checklist:
  - [ ] Inspect mounted owner + imports + route wiring
  - [ ] Reproduce build/runtime failure
  - [ ] Patch root cause tối thiểu
  - [ ] Build verify
  - [ ] Report blocker/live verify note
