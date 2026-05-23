# Technical Instructions (Canonical)

Status: Active
Scope: Áp dụng cho mọi AI agent/model làm việc trong repo này (Copilot, Codex, Claude, Gemini, Hermes subagent...)

## 1) Source of truth và thứ tự đọc

Khi bắt đầu một task code, agent phải đọc theo thứ tự:

1. `AGENTS.md` (repo root)
2. File này: `docs/ai/technical-instructions.md`
3. `docs/app-structure.md`
4. Task file cụ thể trong `docs/tasks/`

Nếu có mâu thuẫn, ưu tiên theo thứ tự trên.

## 2) Universal DB-first policy (FEATURE / ENHANCE / FIX)

Áp dụng cho mọi thay đổi, kể cả enhancement và bugfix.

### Gate 0 — DB Precheck bắt buộc

Trước khi sửa API/UI, phải làm DB precheck và ghi rõ kết quả trong task:

- Collections/fields liên quan
- Data nền cần có
- Constraint/index/default cần có
- Kết quả bắt buộc: `DB_READY` hoặc `DB_GAP_FOUND`

Nếu `DB_GAP_FOUND`: mở/hoàn tất DB task trước, sau đó mới qua API/UI.

### Gate order bắt buộc

1. DB / Directus staging
2. Backend workflow/API
3. UI

Không được nhảy gate.

## 3) Non-negotiable workflow

### 3.1 No code without task

- Không bắt đầu sửa code khi chưa có task file trong `docs/tasks/`.
- Task phải có checklist `- [ ]` rõ ràng theo sub-task.

### 3.2 Tick done realtime

- Mỗi sub-task hoàn tất phải đổi ngay `- [ ]` -> `- [x]`.
- Không được chờ đến cuối task mới tick hàng loạt.

### 3.3 Lessons learned bắt buộc khi có issue

- Nếu gặp lỗi, blocker, hoặc sai hướng triển khai, phải ghi vào lessons learned trước khi đóng task.
- Dùng template tại `docs/lessons-learned/_template.md`.

### 3.4 Task closing rule

- Hoàn tất task phải commit + push code repo web/api liên quan.
- Riêng phần DB/directus staging: không bắt buộc commit/push code DB repo; bắt buộc có evidence apply + verify + documentation.

## 4) Frontend architecture rules

### 4.1 Atomic Design

- `src/shared/components/*`: Atoms/Molecules generic, không chứa domain knowledge.
- `src/modules/<domain>/components/*`: Organisms theo domain.
- `src/pages/*`: Chỉ orchestration; không nhồi business logic nặng.

### 4.2 TailwindCSS-first

- Ưu tiên Tailwind utility classes.
- Chỉ thêm global CSS khi thật sự là concern toàn app (theme/shell/pattern global).

### 4.3 shadcnUI-first

- Ưu tiên tái sử dụng `src/shared/components/ui/*` trước khi tạo component UI mới.
- Khi tạo component mới, phải tương thích pattern utility `cn()`.

### 4.4 Reuse-first policy

Trước khi tạo mới component/hook/helper, bắt buộc rà soát:

- `src/shared/components`
- `src/shared/hooks`
- `src/modules/<domain>/components`
- `src/modules/<domain>/hooks`
- `src/modules/<domain>/utils`

Nếu tạo mới, phải ghi lý do ngắn trong task hoặc PR note.

### 4.5 Folder structure theo pattern TienMat

- API contracts: `src/modules/<domain>/api`
- Domain hooks/state handlers: `src/modules/<domain>/hooks`
- Domain types/constants/options: `src/modules/<domain>/types`
- Pure helpers: `src/modules/<domain>/utils`
- Domain UI: `src/modules/<domain>/components`
- Page chỉ compose hook + components

### 4.6 Axios & API error handling

Single instance tại `src/core/api/axiosInstance.ts`. Interceptor pipeline (theo thứ tự):

1. **Request**: gắn Bearer token
2. **Retry**: network errors + 502/503/504 → retry tối đa 2 lần, backoff 1s/2s
3. **Success toast**: POST/PUT/PATCH/DELETE thành công → auto show toast i18n
4. **Auth + Error toast**:
   - 401 → refresh token → retry request gốc; fail → logout
   - 403 → set forbidden page
   - Còn lại → auto show destructive toast với message từ API

**Opt-out flags** (truyền trong request config):

- `_silentSuccess: true` — tắt success toast (khi component tự show feedback)
- `_silentError: true` — tắt error toast (khi component dùng ErrorBanner inline)

**Quy tắc cho agent**:

- Khi viết API call mới, KHÔNG cần gọi `showToast` thủ công — interceptor tự xử lý.
- Chỉ dùng `_silentSuccess` / `_silentError` khi component có UI feedback riêng (inline error, custom success message).
- Error message từ API (Directus/NestJS) được giữ nguyên, không translate lại ở frontend.
- i18n keys: `apiErrors.*` (lỗi hệ thống), `apiToast.*` (toast titles).

## 5) i18n và UI consistency

- Mọi text hiển thị phải qua i18n key (`vi.ts` và `en.ts` nếu thêm mới).
- Không hardcode text tiếng Việt trong shared component.
- Ưu tiên component/style pattern hiện có để UI đồng nhất.

## 6) Validation gates (tối thiểu)

Khi task có thay đổi TypeScript:

- `npx tsc --noEmit`

Khi task có thay đổi UI:

- Smoke check route liên quan (render, empty state, loading state, basic interaction).

## 7) Output contract khi agent báo hoàn tất

Agent phải báo rõ:

1. Danh sách file đã đổi
2. Checklist tasks đã tick xong
3. DB precheck result + gate evidence
4. Nếu có issue đã gặp -> link/entry lessons learned
5. Kết quả validation (`tsc`, smoke check)
6. Trạng thái commit/push cho web/api

## 8) Templates và tài liệu liên quan

- Task template: `docs/tasks/_template.md`
- Lessons template: `docs/lessons-learned/_template.md`
- Task index/rules: `docs/tasks/README.md`
- Kiến trúc app: `docs/app-structure.md`
