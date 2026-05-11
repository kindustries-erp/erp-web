# Kế hoạch: Chốt vị trí canonical doc + rule kỹ thuật cho AI agents (ERP Web)

## Goal
Chốt nơi đặt canonical technical instructions và định nghĩa bộ rule bạn yêu cầu để mọi model/agent làm việc nhất quán trong repo `liouni-erp-web`.

## Kết luận nhanh (đề xuất vị trí canonical doc)
Đặt canonical doc tại:
- `docs/ai/technical-instructions.md` (nguồn chuẩn duy nhất)

Và tạo file adapter tại root:
- `AGENTS.md` (bắt buộc, vì nhiều agent tự ưu tiên đọc file này)

Lý do:
- `docs/` phù hợp để chứa policy dài, có cấu trúc, dễ versioning.
- `AGENTS.md` ở root tăng khả năng agent auto-load khi chạy từ repo.
- Tránh trùng lặp: adapter chỉ trỏ về canonical doc, không copy toàn bộ nội dung.

## Current context / assumptions
- Repo có cấu trúc feature khá rõ ở `src/modules/finance/*` và page-level ở `src/pages/TienMat.tsx`, `src/pages/TienGui.tsx`.
- Có reusable components trong `src/shared/components/*`.
- Có dấu hiệu dùng utility kiểu shadcn (`src/shared/components/ui/*`, hàm `cn()`), Tailwind class được dùng rộng.
- Bạn muốn rule chính gồm: Atomic Design, TailwindCSS, shadcnUI, ưu tiên tái sử dụng component, và tuân folder structure kiểu feature Tiền Mặt.

## Proposed approach
Thiết kế 2 lớp tài liệu:
1. Canonical policy (chi tiết) ở `docs/ai/technical-instructions.md`.
2. Adapter entrypoints (`AGENTS.md`, `.github/copilot-instructions.md`, tùy chọn `CLAUDE.md`, `GEMINI.md`) chỉ tham chiếu canonical policy + vài hard rules ngắn.

## Step-by-step plan
1. Tạo khung canonical doc
   - Các section tối thiểu:
     - Scope áp dụng
     - Tech stack constraints
     - UI architecture rules
     - Folder & feature conventions
     - Reuse policy
     - Validation checklist
     - Non-goals / forbidden changes

2. Định nghĩa rule bắt buộc theo yêu cầu của bạn
   - Atomic Design rule:
     - UI mới phải phân lớp rõ (atoms/molecules/organisms/pages) ở phạm vi phù hợp.
     - Không nhồi business logic vào atom-level components.
   - TailwindCSS rule:
     - Styling ưu tiên Tailwind utility classes.
     - Không thêm CSS custom nếu đã giải được bằng utility/component variant.
   - shadcnUI rule:
     - Ưu tiên dùng component trong `src/shared/components/ui/*` trước khi tạo mới.
     - Component mới phải tương thích pattern `cn()` + variant conventions hiện có.
   - Reuse rule:
     - Trước khi tạo component/hook mới, phải kiểm tra reuse ở:
       - `src/shared/components/*`
       - `src/shared/hooks/*`
       - `src/modules/*/components/*`
   - Folder structure rule (theo hướng TienMat feature):
     - Business domain logic đặt trong `src/modules/<feature>/` (api/hooks/types/components/utils).
     - Page chỉ orchestration/compose, không chứa logic nặng.
     - API contracts trong `api/`, DTO/form types trong `types/`, stateful behavior trong `hooks/`.

3. Chuẩn hóa “Definition of Done” cho AI agents
   - Output phải nêu rõ:
     - file nào đã sửa,
     - vì sao tuân các rule trên,
     - phần nào reuse, phần nào tạo mới và lý do.
   - Validation tối thiểu:
     - `npx tsc --noEmit`
     - nếu có thay đổi UI lớn: checklist smoke test route liên quan.

4. Tạo adapter files để mọi agent cùng đọc đúng nguồn
   - `AGENTS.md`: ghi “source of truth = docs/ai/technical-instructions.md”.
   - `.github/copilot-instructions.md`: tóm tắt ngắn + link canonical.
   - `CLAUDE.md`/`GEMINI.md` (nếu team dùng): giữ tối giản, tránh diverge.

5. Đồng bộ với tài liệu hiện có
   - Cập nhật `README.md` (mục đóng góp/dev workflow) trỏ canonical doc.
   - Cập nhật `docs/tasks/README.md` thêm yêu cầu: agent phải load canonical instructions trước khi làm task.

6. Thiết lập cơ chế chống lệch rule (khuyến nghị)
   - Tạo check script nhẹ (sau này) để đảm bảo adapter files vẫn trỏ đúng canonical path.

## Files likely to change
- `/opt/repos/liouni-erp-web/docs/ai/technical-instructions.md` (new, canonical)
- `/opt/repos/liouni-erp-web/AGENTS.md` (new)
- `/opt/repos/liouni-erp-web/.github/copilot-instructions.md` (new)
- `/opt/repos/liouni-erp-web/CLAUDE.md` (optional)
- `/opt/repos/liouni-erp-web/GEMINI.md` (optional)
- `/opt/repos/liouni-erp-web/README.md` (update)
- `/opt/repos/liouni-erp-web/docs/tasks/README.md` (update)

## Tests / validation
- Nội dung:
  - Tất cả adapter files chỉ định đúng canonical path.
  - Rule không mâu thuẫn với conventions hiện có của finance/tienmat.
- Kỹ thuật (khi implement):
  - `npx tsc --noEmit`

## Risks, tradeoffs, open questions
- Risk: Atomic Design quá cứng có thể làm chậm task nhỏ.
  - Mitigation: thêm ngưỡng “task nhỏ có thể reuse trực tiếp, không bắt buộc tách lớp sâu”.
- Tradeoff: thêm tài liệu ban đầu nhưng giảm rework khi dùng nhiều agent.

Open questions cần bạn chốt trước khi triển khai:
1. Bạn muốn naming Atomic Design theo thư mục thực tế luôn (vd `atoms/`, `molecules/`) hay chỉ áp dụng như nguyên tắc kiến trúc?
2. shadcnUI: có cho phép tạo component ngoài `src/shared/components/ui/*` khi là domain-specific không?
3. Có muốn bắt buộc mọi task UI phải ghi mục “Reuse audit” trong output không?
