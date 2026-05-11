# Kế hoạch: Chuẩn hoá technical instructions cho mọi AI agent trong repo ERP Web

## Mục tiêu
Tạo bộ hướng dẫn kỹ thuật nằm trong `liouni-erp-web` để khi dùng bất kỳ model/agent nào (Copilot, Codex, Claude, Gemini, Hermes subagent, v.v.) vẫn bám cùng một bộ quy tắc triển khai.

## Bối cảnh hiện tại / giả định
- Repo hiện có `README.md` và `docs/tasks/README.md` với một số quy tắc làm task.
- Chưa thấy file chỉ dẫn agent chuẩn ở root repo như `AGENTS.md`.
- Mục tiêu chính là tính nhất quán giữa nhiều agent, không phụ thuộc 1 công cụ duy nhất.
- Ưu tiên cách “source-of-truth + adapter files” để dễ bảo trì.

## Hướng tiếp cận đề xuất
Dùng 3 lớp:
1. **Canonical rules (1 nguồn chuẩn):** 1 file chính mô tả coding rules, scope, Do/Don’t, quy tắc test, quy tắc commit/PR.
2. **Agent adapters:** các file entrypoint theo từng agent chỉ tham chiếu về canonical rules (tránh copy-paste diverge).
3. **Enforcement nhẹ:** checklist trước khi merge + mẫu prompt/task để agent luôn nạp đúng context.

## Kế hoạch từng bước
1. Khảo sát cấu trúc repo và xác định nơi đặt policy bền vững
   - Chốt vị trí file chuẩn: `docs/ai/technical-instructions.md` (hoặc `AGENTS.md` ở root + chi tiết trong docs).
   - Chốt mức độ chi tiết: rule coding, testing, localization, API contract, giới hạn refactor.

2. Thiết kế “canonical instruction”
   - Viết mục tiêu và phạm vi áp dụng (mọi AI agent, mọi model).
   - Viết rule bắt buộc:
     - Không sửa ngoài scope task.
     - Không đổi API contract nếu chưa có task.
     - Bắt buộc `npx tsc --noEmit` cho thay đổi TS.
     - Quy tắc i18n (en/vi), UI consistency, logging/toast.
     - Quy tắc không động vào file generated/dist nếu không được yêu cầu.
   - Viết output contract cho agent: định dạng báo cáo thay đổi, checklist self-verify.

3. Tạo adapter files cho từng hệ agent phổ biến
   - `AGENTS.md` (generic).
   - `CLAUDE.md` (nếu team dùng Claude Code).
   - `GEMINI.md` hoặc `.gemini/GEMINI.md` trong repo (nếu quy trình hỗ trợ).
   - `.github/copilot-instructions.md` (cho Copilot chat/coding experience).
   - Mỗi adapter chỉ gồm: mô tả ngắn + link/reference tới canonical rules.

4. Kết nối với tài liệu task hiện có
   - Cập nhật `docs/tasks/README.md` để thêm mục “Agent must load canonical instructions before task execution”.
   - Nếu cần, thêm section trong `README.md` hướng dẫn contributors/AI runner.

5. Tạo template prompt chuẩn trong repo
   - Thêm `docs/ai/prompt-template.md` với khung:
     - Task objective
     - Scope files
     - Constraints
     - Validation commands
     - Expected output format
   - Dùng template này cho mọi lần giao việc cho agent để giảm drift.

6. Định nghĩa quy trình kiểm chứng
   - Manual check: mở 2–3 agent khác nhau và xác nhận đều đọc cùng nguồn rule.
   - Tech check (khuyến nghị): script kiểm tra tồn tại các file adapter và link canonical không bị lệch.

7. Rollout
   - Pilot trên 1 task nhỏ.
   - Thu feedback, cập nhật canonical rules.
   - Chốt versioning cho instruction docs (changelog ngắn).

## File dự kiến thay đổi
- `/opt/repos/liouni-erp-web/AGENTS.md` (mới)
- `/opt/repos/liouni-erp-web/docs/ai/technical-instructions.md` (mới)
- `/opt/repos/liouni-erp-web/.github/copilot-instructions.md` (mới)
- `/opt/repos/liouni-erp-web/CLAUDE.md` (mới, nếu dùng)
- `/opt/repos/liouni-erp-web/GEMINI.md` hoặc `/opt/repos/liouni-erp-web/.gemini/GEMINI.md` (mới, tuỳ workflow)
- `/opt/repos/liouni-erp-web/docs/ai/prompt-template.md` (mới)
- `/opt/repos/liouni-erp-web/docs/tasks/README.md` (cập nhật)
- `/opt/repos/liouni-erp-web/README.md` (cập nhật ngắn, nếu cần)

## Kiểm thử / xác thực
- Validate nội dung:
  - Tất cả adapter files đều trỏ về cùng canonical doc.
  - Không có rule mâu thuẫn giữa README/tasks/canonical.
- Validate kỹ thuật (khi bắt đầu thực thi thật):
  - `npx tsc --noEmit`
  - Nếu có test suite: chạy test phạm vi module bị ảnh hưởng.

## Rủi ro & trade-off
- Rủi ro trùng lặp quy tắc giữa nhiều file → xử lý bằng canonical-only + adapter mỏng.
- Rủi ro agent không auto-read một số file đặc thù → giảm thiểu bằng đặt `AGENTS.md` ở root và nhắc explicit trong prompt template.
- Trade-off: thêm tài liệu upfront nhưng đổi lại giảm sai lệch hành vi lâu dài.

## Câu hỏi mở cần chốt trước khi implement
1. Anh muốn canonical file đặt ở root (`AGENTS.md` là nguồn chuẩn) hay đặt trong `docs/ai/` và root chỉ trỏ link?
2. Danh sách agent bắt buộc hỗ trợ ngay từ đầu gồm những cái nào (Copilot, Codex CLI, Claude Code, Gemini CLI, Hermes)?
3. Có muốn thêm bước CI check để fail nếu adapter file lệch canonical không?
