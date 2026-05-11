# Kế hoạch: Sắp xếp Docs + Instructions để reuse tốt và scale dài hạn

## Goal
Thiết kế lại cấu trúc tài liệu trong `liouni-erp-web` để:
- AI agents/model khác nhau vẫn theo cùng 1 bộ rule
- Dễ tái sử dụng giữa feature
- Dễ mở rộng khi team và scope lớn hơn
- Giảm trùng lặp/mâu thuẫn giữa docs

## Current context / assumptions
- Repo đã có nhiều docs rời rạc: `docs/app-structure.md`, `docs/tasks/*`, `docs/guidelines/*`, workflow docs theo feature.
- `docs/app-structure.md` đã chứa nhiều rule quan trọng (Atomic Design, reuse-first, hook/page responsibilities, Tailwind structure, i18n).
- Chưa có “instruction architecture” thống nhất cho nhiều agent entrypoint.
- Nhu cầu mới: chuẩn hóa rule bắt buộc gồm Atomic Design, TailwindCSS, shadcnUI, reusable components, folder structure theo pattern `TienMat`.

## Proposed architecture (đề xuất đích)

### 1) Một nguồn chuẩn cho kỹ thuật AI
- Canonical technical rules: `docs/ai/technical-instructions.md`
- Mục tiêu: tất cả adapter files chỉ trỏ về đây, không duplicate rule dài.

### 2) Tách docs theo 4 lớp trách nhiệm
- `docs/ai/` → rules cho AI execution
- `docs/architecture/` → kiến trúc hệ thống/FE patterns
- `docs/workflows/` → quy trình thực thi theo loại việc (tasking, PRD, review)
- `docs/features/` → docs theo domain/feature (finance, auth, system...)

### 3) Adapter entrypoints mỏng cho từng agent
- Root: `AGENTS.md` (bắt buộc)
- Tool-specific:
  - `.github/copilot-instructions.md`
  - `CLAUDE.md` (nếu dùng)
  - `GEMINI.md` (nếu dùng)
- Nội dung chỉ gồm: scope + pointer đến canonical + checklist bắt buộc ngắn.

### 4) Versioning + governance
- `docs/ai/CHANGELOG.md` ghi thay đổi rules
- Rule thay đổi phải có “effective date” + “migration note”
- Có “deprecated docs” section để tránh dùng nhầm file cũ

## Step-by-step plan

### Bước 1: Thiết kế cây thư mục docs mới (không xoá vội)
- Tạo cấu trúc mục tiêu:
  - `docs/ai/`
  - `docs/architecture/`
  - `docs/workflows/`
  - `docs/features/`
- Giữ backward compatibility bằng cách để alias/redirect note ở file cũ trong giai đoạn chuyển tiếp.

### Bước 2: Đóng gói canonical technical instructions
- Tạo `docs/ai/technical-instructions.md` với các section:
  1. Scope áp dụng (mọi model/agent)
  2. Non-negotiable rules
  3. Architecture conventions
  4. Reuse policy
  5. Folder conventions (theo TienMat pattern)
  6. Validation gates
  7. Output contract cho agent
- Nạp các rule cốt lõi từ `docs/app-structure.md` để tránh tồn tại 2 bộ luật mâu thuẫn.

### Bước 3: Chuẩn hoá bộ rule bạn yêu cầu
- Atomic Design:
  - `shared/components` = atoms/molecules generic
  - `modules/<domain>/components` = organisms domain-specific
  - `pages/` = orchestration only
- TailwindCSS:
  - Ưu tiên utility classes; CSS global chỉ cho theme/shell/pattern global
- shadcnUI:
  - Ưu tiên `src/shared/components/ui/*` trước khi tạo mới
- Reuse-first:
  - Bắt buộc “reuse audit” trước khi thêm component/hook mới
- Folder structure theo TienMat:
  - Domain logic vào `modules/<domain>/{api,hooks,types,utils,components}`
  - Tránh business logic inline ở page

### Bước 4: Thiết kế doc index để scale
- Tạo `docs/README.md` làm navigation hub:
  - Where to read first
  - Theo vai trò (AI agent, FE dev, reviewer)
  - Theo use-case (new feature, bugfix, refactor)
- Mỗi thư mục con có 1 `README.md` mô tả scope + file ưu tiên đọc.

### Bước 5: Chuẩn hóa workflow docs
- Chuyển/chuẩn hóa:
  - `docs/guidelines/create-prd.md` → `docs/workflows/prd.md`
  - `docs/guidelines/generate-tasks.md` → `docs/workflows/task-generation.md`
  - `docs/tasks/README.md` giữ vai trò feature-task index + quy tắc task execution
- Bổ sung mapping “workflow nào dùng khi nào”.

### Bước 6: Feature-doc strategy để reuse
- Tạo chuẩn cho docs theo feature:
  - `docs/features/<feature>/overview.md`
  - `docs/features/<feature>/api-contract.md`
  - `docs/features/<feature>/ui-patterns.md`
- Với finance: quy chiếu các pattern từ `TienMat`/`TienGui` thành reusable guideline.

### Bước 7: Adapter files cho nhiều agent
- `AGENTS.md` (root): entrypoint chính, ngắn gọn, trỏ canonical
- `.github/copilot-instructions.md`: mirror tối giản
- `CLAUDE.md`, `GEMINI.md` (nếu dùng): chỉ chứa pointer + hard constraints ngắn
- Nguyên tắc: adapter tuyệt đối không chứa full rules dài.

### Bước 8: Chống drift (không đồng bộ)
- Tạo checklist review docs:
  - canonical còn đúng?
  - adapter còn trỏ đúng?
  - file cũ có đánh dấu deprecate?
- (Tuỳ chọn) thêm script CI nhẹ kiểm tra các pointer path.

### Bước 9: Rollout theo pha
- Pha 1: publish structure + canonical + AGENTS
- Pha 2: migrate workflow docs + update links
- Pha 3: thêm CI/checks và governance cadence

## Files likely to change
- `/opt/repos/liouni-erp-web/docs/README.md` (new)
- `/opt/repos/liouni-erp-web/docs/ai/technical-instructions.md` (new, canonical)
- `/opt/repos/liouni-erp-web/docs/ai/CHANGELOG.md` (new)
- `/opt/repos/liouni-erp-web/docs/architecture/README.md` (new)
- `/opt/repos/liouni-erp-web/docs/workflows/README.md` (new)
- `/opt/repos/liouni-erp-web/docs/features/README.md` (new)
- `/opt/repos/liouni-erp-web/AGENTS.md` (new)
- `/opt/repos/liouni-erp-web/.github/copilot-instructions.md` (new)
- `/opt/repos/liouni-erp-web/CLAUDE.md` (optional)
- `/opt/repos/liouni-erp-web/GEMINI.md` (optional)
- `/opt/repos/liouni-erp-web/docs/app-structure.md` (update/cross-link)
- `/opt/repos/liouni-erp-web/docs/tasks/README.md` (update: load canonical before task execution)
- `/opt/repos/liouni-erp-web/docs/guidelines/create-prd.md` (migrate or add deprecation note)
- `/opt/repos/liouni-erp-web/docs/guidelines/generate-tasks.md` (migrate or add deprecation note)

## Tests / validation
- Navigation validation:
  - Từ `docs/README.md` truy cập được tất cả mục chính
- Consistency validation:
  - Agent adapter files đều trỏ đúng `docs/ai/technical-instructions.md`
  - Không có 2 file cùng định nghĩa rule trái nhau
- Workflow validation:
  - Chạy thử 2–3 prompt task với agent khác nhau để xác nhận rule được áp dụng nhất quán

## Risks & tradeoffs
- Rủi ro migration làm đứt link tài liệu cũ
  - Giải pháp: deprecation notes + forward links
- Rủi ro canonical quá dài, agent bỏ sót
  - Giải pháp: thêm “TL;DR non-negotiables” ở đầu file
- Tradeoff: tốn công chuẩn hóa ban đầu, đổi lại giảm rất mạnh sai lệch khi scale team/agent

## Open questions cần bạn chốt
1. Bạn muốn đặt mức ưu tiên đọc: `AGENTS.md` trước rồi `docs/ai/technical-instructions.md`, hay ngược lại?
2. Có muốn bắt buộc CI check cho adapter pointer ngay từ phase 1 không?
3. Có cần tách thêm `docs/features/finance/` ngay đợt đầu để chuẩn hóa pattern TienMat/TienGui luôn không?
