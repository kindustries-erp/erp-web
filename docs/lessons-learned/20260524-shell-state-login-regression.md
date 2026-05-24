# Lessons Learned Entry

- ID: LL-2026-05-024
- Date: 2026-05-24
- Task Link: docs/tasks/20260524-0824-fix-shell-state-login-regression.md
- Owner: Hermes Agent

## Context

Regression trên ERP Web staging sau các task trước: user login lại nhưng shell có thể tự bật lại overlay cũ như import modal/drawer, làm snapshot UI nhiễu và khó QC nghiệp vụ.

## Issue / Symptom

Sau logout/login trong cùng SPA runtime, các overlay shell-level có thể vẫn mở hoặc mang state cũ, tạo cảm giác API/module hiện tại bị lỗi dù dữ liệu và route thật vẫn đúng.

## Root Cause

`useUIStore` là zustand store global sống xuyên suốt runtime nhưng không được reset ở auth transition. `App.tsx` chỉ ẩn shell bằng `return <Login />` khi logout, nên khi login lại các state như `panelOpen`, `panelContent`, `importModalOpen`, `importSrc`, `importFile` vẫn còn trong memory và render lại ngay.

## Fix Applied

- Thêm `resetShellState()` trong `src/core/config/uiStore.ts`.
- Chuẩn hóa `closePanel()` clear luôn `panelContent`.
- Chuẩn hóa `closeImport()` clear luôn `importSrc` và `importFile`.
- Gọi `useUIStore.getState().resetShellState()` tại cả `loginAction` và `logoutAction` trong `src/modules/auth/domain/authStore.ts` trước khi mount/unmount shell logic tiếp tục.

## Preventive Action

- Mọi shell/global overlay state phải có explicit reset hook và được gọi ở auth transition hoặc route reset boundary.
- Khi QC màn dùng shell chung, nếu thấy overlay lạ sau login/đổi route, ưu tiên nghi shell-state leak trước khi đổ sang DB/API.
- Với store zustand global không persist nhưng sống suốt SPA session, phải kiểm tra reset path tương tự logout/login.

## Reusable Snippet / Pattern (optional)

```ts
resetShellState: () => {
  const prev = get().importFile;
  if (prev) URL.revokeObjectURL(prev.name);
  set(shellStateDefaults);
};
```
