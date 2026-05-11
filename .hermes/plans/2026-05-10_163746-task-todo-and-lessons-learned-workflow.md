# Kế hoạch: Bắt buộc Task/TODO + Tick Done + Lessons Learned cho mọi lần code

## Goal
Thiết lập workflow chuẩn trong repo `liouni-erp-web` để mỗi lần làm code đều:
1) tạo task list + TODO checklist trước khi làm,
2) tick done khi hoàn thành,
3) ghi issue + cách xử lý vào lessons learned để không lặp lỗi.

## Current context / assumptions
- Repo đã có `docs/tasks/README.md` và nhiều task files theo feature.
- Chưa có chuẩn thống nhất cho:
  - tracking TODO theo từng task execution,
  - trạng thái done bắt buộc,
  - nhật ký lessons learned tập trung.
- Bạn muốn đây là quy tắc bắt buộc cho mọi agent/model, không phụ thuộc tool cụ thể.

## Proposed approach
Thiết kế workflow theo 3 artifact bắt buộc cho mỗi work item:
- A. Task file (phạm vi + checklist thực thi)
- B. TODO state (đang làm/đã xong theo từng mục)
- C. Lessons learned entry (issue gặp phải + root cause + cách phòng tránh)

Áp dụng qua canonical instructions + template + process gate.

## Step-by-step plan

### Bước 1: Chuẩn hoá policy bắt buộc trong canonical instructions
- Thêm section mới trong `docs/ai/technical-instructions.md`:
  - “No code without task”
  - “Mọi sub-task phải được tick từ `[ ]` sang `[x]` ngay khi hoàn tất”
  - “Mọi issue thực tế phải được ghi lessons learned trước khi kết thúc task”
- Định nghĩa rõ ngoại lệ (nếu có): hotfix cực nhỏ vẫn phải có task file tối giản.

### Bước 2: Thiết kế cấu trúc thư mục cho tracking
- Đề xuất:
  - `docs/tasks/` → task files theo feature/work item
  - `docs/lessons-learned/` → knowledge base theo thời gian/chủ đề
- Naming chuẩn:
  - Task: `docs/tasks/task-<topic>-<yyyymmdd>.md`
  - Lessons: `docs/lessons-learned/lessons-<yyyy-mm>.md` (gộp theo tháng để tránh file quá nhiều)

### Bước 3: Chuẩn hoá template task bắt buộc
- Tạo template `docs/tasks/_template.md` gồm:
  - Goal
  - Scope / Non-scope
  - Relevant files
  - Checklist tasks + subtasks (`- [ ]`)
  - Validation checklist (tsc/test/manual)
  - Done criteria
  - Lessons-learned link target
- Quy tắc thực thi:
  - Không được bắt đầu code khi checklist chưa được tạo.
  - Không được đóng task nếu còn item `[ ]`.

### Bước 4: Chuẩn hoá template lessons learned
- Tạo template `docs/lessons-learned/_template.md` với từng entry gồm:
  - Date
  - Context/task link
  - Issue/Symptom
  - Root cause
  - Fix applied
  - Preventive rule/checklist update
  - Reusable snippet/pattern (nếu có)
- Mỗi issue có ID (vd: `LL-2026-05-001`) để dễ tham chiếu.

### Bước 5: Cập nhật docs index và luồng bắt buộc
- Cập nhật `docs/tasks/README.md`:
  - bắt buộc tick done realtime
  - bắt buộc append lessons khi gặp issue
- Tạo `docs/lessons-learned/README.md`:
  - cách ghi entry
  - cách tra cứu theo domain (finance/auth/system)
- Cập nhật `docs/README.md` (nếu có): “start-here workflow” cho agent/dev.

### Bước 6: Gắn vào agent instructions để enforce đa model
- `AGENTS.md` (root repo) thêm phần execution contract:
  1) tạo/nhận task file,
  2) cập nhật checkbox trong quá trình làm,
  3) ghi lessons learned trước khi báo hoàn tất.
- `.github/copilot-instructions.md` + file adapter khác chỉ mirror ngắn rule trên.

### Bước 7: Thêm quality gate nhẹ
- Khi review/merge phải check:
  - Có task file hợp lệ?
  - Checklist đã tick đầy đủ?
  - Nếu có issue trong quá trình làm, đã có lessons learned entry chưa?
- (Khuyến nghị tương lai) script CI chỉ kiểm tra hình thức:
  - task file có checklist syntax,
  - có link tới lessons-learned section/file.

### Bước 8: Rollout thực tế
- Phase 1: áp dụng ngay cho task mới (không backfill toàn bộ task cũ).
- Phase 2: khi đụng task cũ thì chuẩn hoá dần theo template mới.
- Phase 3: thống kê lessons định kỳ để cập nhật lại canonical rules.

## Files likely to change
- `/opt/repos/liouni-erp-web/docs/ai/technical-instructions.md` (update)
- `/opt/repos/liouni-erp-web/docs/tasks/README.md` (update)
- `/opt/repos/liouni-erp-web/docs/tasks/_template.md` (new)
- `/opt/repos/liouni-erp-web/docs/lessons-learned/README.md` (new)
- `/opt/repos/liouni-erp-web/docs/lessons-learned/_template.md` (new)
- `/opt/repos/liouni-erp-web/AGENTS.md` (new/update)
- `/opt/repos/liouni-erp-web/.github/copilot-instructions.md` (new/update)
- `/opt/repos/liouni-erp-web/docs/README.md` (new/update)

## Tests / validation
- Process validation:
  - Chạy thử 1 task mới theo template: từ tạo task -> tick done -> ghi lessons.
- Consistency validation:
  - Canonical doc và adapter đều có rule “No code without task + lessons”.
- Quality validation:
  - Task hoàn tất phải không còn checkbox mở (`[ ]`) trừ khi có ghi chú defer rõ ràng.

## Risks, tradeoffs, open questions
- Risk: tăng overhead cho task nhỏ.
  - Giảm thiểu: template ngắn gọn, cho phép “quick-task mode” nhưng vẫn bắt buộc checklist + lessons khi có issue.
- Risk: lessons-learned bị ghi hời hợt.
  - Giảm thiểu: ép format có root cause + preventive action.
- Tradeoff: thêm bước quy trình, đổi lại giảm lặp lỗi và tăng khả năng handover giữa agents.

## Open questions cần bạn chốt
1. Bạn muốn lessons learned ghi theo tháng (`lessons-YYYY-MM.md`) hay mỗi issue một file riêng?
2. Với task cực nhỏ (<=30 phút), bạn muốn template rút gọn nào (3-5 checklist items) hay vẫn dùng full template?
3. Có muốn coi việc thiếu lessons-learned (khi có issue) là blocker không cho đánh dấu task done?
