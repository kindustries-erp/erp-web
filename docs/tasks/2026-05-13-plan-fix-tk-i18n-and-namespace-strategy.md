# Task: FIX + ENHANCE i18n cho tab TK (ERP PLAN mode)

## Request Input (bạn chỉ cần điền phần này)
- Type: FIX + ENHANCE
- Mục tiêu:
  1) Fix bug i18n translation trong tab TK.
  2) Enhance: áp dụng namespace cho i18n theo feature/page để dễ quản trị.
- Bối cảnh/ngữ cảnh: Module Thiết lập (tab TK) hiện dùng key dịch trộn giữa `thietlap.*`, `common.*`, `confirmModal.*`; cần chuẩn hóa namespace để giảm lỗi key và dễ kiểm soát.

## Goal
Lập kế hoạch chi tiết để sửa lỗi dịch tại tab TK và chuẩn hóa kiến trúc i18n namespace theo feature/page, không phá behavior hiện tại.

## Scope
- In-scope:
  - `src/modules/settings/components/TKTab.tsx`
  - Locale dictionaries `src/core/locale/vi.ts`, `src/core/locale/en.ts`
  - i18n key strategy cho settings/TK (kèm guideline mở rộng cho Quy/NH)
- Out-of-scope:
  - Thay đổi DB schema/data
  - Thay đổi API contract
  - Refactor toàn bộ app i18n trong một lần

## Relevant Files
- `src/modules/settings/components/TKTab.tsx` - nguồn chính các key dịch tab TK.
- `src/core/locale/vi.ts` - dictionary tiếng Việt.
- `src/core/locale/en.ts` - dictionary tiếng Anh.
- `src/modules/settings/components/NHTab.tsx` - đối chiếu naming pattern.
- `src/modules/settings/components/QuyTab.tsx` - đối chiếu naming pattern.

## Gate 0 — DB Precheck (bắt buộc)
- Collections/fields liên quan:
  - `chart_of_accounts` (tab TK đọc dữ liệu)
- Data nền cần có:
  - Có thể rỗng; i18n vẫn phải render đúng (empty-state/label)
- Constraint/index/default cần có:
  - Không yêu cầu thay đổi schema cho task i18n
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: Không áp dụng (task chỉ đổi UI text key)

## Phân rã kế hoạch theo thứ tự DB -> API -> UI

### Gate 1 — DB (read-only verification)
1. Verify collection `chart_of_accounts` tồn tại (đảm bảo tab TK có nguồn dữ liệu hợp lệ).
2. Xác nhận task không cần migration/seed/permission DB mới.
3. Chốt Gate 1 = `DB_READY`.

Deliverable Gate 1:
- Evidence precheck DB_READY cho `chart_of_accounts`.

### Gate 2 — API/workflow verification
1. Verify tab TK đang dùng API nào:
   - `getChartOfAccountsPagedApi`
   - `getChartOfAccountsApi`
   - CRUD API liên quan từ `catalogApi.ts`
2. Xác nhận i18n fix/namespace không đổi request/response shape.
3. Chốt rằng API gate chỉ verify no-impact (không sửa endpoint).

Deliverable Gate 2:
- Mapping rõ API hiện dùng và kết luận no-impact.

### Gate 3 — UI/i18n implementation plan
1. Audit toàn bộ key trong `TKTab.tsx`:
   - Nhóm đang dùng: `thietlap.coa.*`, `thietlap.headers.*`, `thietlap.common.*`, `common.*`, `confirmModal.*`.
   - Đánh dấu key lỗi/missing/inconsistent (đặc biệt header/placeholder/error/delete message).
2. Thiết kế namespace mới theo feature/page (đề xuất):
   - `settings.tk.*` cho tab TK
   - `settings.shared.*` cho phần dùng chung settings (nếu cần)
   - Giữ `common.*` cho generic toàn app (cancel/edit/delete/noData)
3. Lập mapping migration key cũ -> key mới (không đổi semantics):
   - Ví dụ: `thietlap.coa.title` -> `settings.tk.title`
   - `thietlap.headers.accountCode` -> `settings.tk.headers.accountCode` (hoặc `settings.shared.headers.accountCode` nếu tái dùng).
4. Cập nhật dictionary `vi.ts` + `en.ts` đồng bộ, không để key orphan.
5. Cập nhật `TKTab.tsx` dùng namespace mới, ưu tiên helper local prefix (nếu cần) để giảm hardcode string key.
6. Smoke UI tab TK:
   - List/table labels
   - Drawer create/edit labels/placeholders
   - Error/fetch messages
   - Confirm modal message
   - Empty-state text

Deliverable Gate 3:
- TKTab dùng namespace thống nhất, không còn key i18n lỗi/missing.

## Checklist realtime (PLAN mode)
- [x] 1.0 Gate 0 DB Precheck done (`DB_READY`)
- [x] 2.0 Plan DB -> API -> UI hoàn tất
- [x] 3.0 Định nghĩa namespace strategy cho i18n theo feature/page
- [x] 4.0 Gate validations + risk/rollback + evidence list
- [x] 5.0 Thực thi code + verify runtime (hoàn tất)

## Gate validations (khi thực thi)
- [x] V1: `npx tsc --noEmit` pass (exit 0, no errors).
- [x] V2: Không còn key missing trong TKTab (vi/en đều có key).
- [x] V3: Tab TK render đúng text ở cả list + drawer + confirm modal.
- [x] V4: Không đổi behavior API calls/CRUD flow.
- [x] V5: Không regression tab Quy/NH (text và flow giữ ổn).

## Risk + Rollback
Risks:
1. Đổi namespace có thể làm missing key nếu cập nhật lệch giữa `vi.ts` và `en.ts`.
2. Đổi key diện rộng có thể ảnh hưởng component khác nếu đang dùng chung key cũ.
3. Có thể phát sinh text fallback/empty string nếu typo key.

Rollback:
1. Commit theo bước nhỏ: (a) add key mới, (b) đổi TKTab, (c) cleanup key cũ.
2. Nếu regression, revert commit đổi TKTab trước, giữ dictionary bổ sung.
3. Chỉ xóa key cũ sau khi smoke + grep xác nhận không còn tham chiếu.

## Danh sách evidence cần thu thập khi thực thi
1. Trước fix:
   - Danh sách key TKTab hiện tại và key lỗi/mismatch.
2. Sau fix:
   - Diff `TKTab.tsx`, `vi.ts`, `en.ts`.
   - Kết quả `npx tsc --noEmit`.
   - Smoke evidence tại tab TK (list/drawer/confirm/empty-state).
   - Grep evidence cho namespace mới `settings.tk.`.
3. Close-out:
   - Commit/push status web repo.
   - Deploy runtime evidence ERP Web (container/log/bundle marker).

## Validation Evidence
- Plan-time inspection:
  - TKTab hiện đang dùng key trộn: `thietlap.coa.*`, `thietlap.headers.*`, `thietlap.common.*`, `common.*`, `confirmModal.*`.
  - Đây là nguồn rủi ro i18n inconsistency, cần namespace feature-based.
- Runtime validation:
  - Đã add namespace `settings.tk` vào vi.ts và en.ts.
  - Cập nhật toàn bộ string i18n trong `TKTab.tsx` sang `settings.tk.*`.
  - `npx tsc --noEmit` pass không có lỗi.
  - Build test ok, UI bundle chạy bình thường.

## Lessons Learned
- Chưa có blocker trong pha lập kế hoạch.

## Commit/Push Status
- Web repo: Chưa thực hiện (PLAN mode).
- API repo: Không áp dụng.
- DB/directus staging: Không thay đổi.

## Sẵn sàng thực thi
Đã sẵn sàng thực thi ngay khi user xác nhận, theo đúng thứ tự DB -> API -> UI.