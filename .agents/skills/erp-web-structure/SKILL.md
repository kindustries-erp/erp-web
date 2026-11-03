---
name: erp-web-structure
description: Playbook cấu trúc UI của erp-web (React/Vite) - chuẩn Atomic Design 5 tầng, quy tắc import, folder-per-component, co-located test, giới hạn 180 dòng, i18n, No Blue, và quy trình migrate module V1 sang V2 (src/v2/, dual-run /v2/, generator plop). Dùng khi tạo mới, tách file lớn, chuẩn hóa component hoặc migrate V2 trong erp-web. Nạp erp-web-truth trước.
---

# ERP Web — Structure & Refactor

Skill gộp hai playbook: chuẩn Atomic cho component (V1 và V2) và quy trình migrate module sang `src/v2/`. Nạp `erp-web-truth` trước để có ngữ cảnh repo, lane và luồng API.

Chỉ tách, refactor hoặc migrate khi user yêu cầu rõ hoặc task đã được duyệt. Migrate V2 theo nguyên tắc rolling: mỗi module chạy riêng, kiểm audit đầy đủ trước khi báo xong.

## 1. Chọn hướng xử lý

| Tình huống | Làm gì | Tài liệu chi tiết |
| :--- | :--- | :--- |
| Tạo component mới, hoặc tách file trên 180 dòng | Áp dụng 5 tầng Atomic, folder-per-component, decision tree chọn nơi đặt | `references/atomic-ui.md` |
| Chuẩn hóa table, drawer, modal, dashboard | Dùng skill `standardize_*` tương ứng, rồi kiểm theo chuẩn Atomic | `references/atomic-ui.md` |
| Migrate module V1 sang V2 (`src/v2/`) | Scaffold bằng generator `v2-module`, làm parity, audit | `references/v2-migration.md` |

## 2. Chuẩn Atomic (V1 và V2)

Năm tầng:

1. **Atoms**: primitive UI (`@/shared/components/ui`, `atoms`), không có logic nghiệp vụ, props-driven.
2. **Molecules**: UI kèm state cục bộ (useState/useRef), không gọi API hay store.
3. **Organisms**: khối phức hợp có store, RBAC, form hoặc API qua hook.
4. **Templates**: khung layout chưa gắn dữ liệu.
5. **Pages**: gắn route, lấy dữ liệu qua domain hook, ghép template và organism.

Quy tắc:

- **Import**: chỉ đi từ tầng cao xuống tầng thấp. Cấm import ngang hàng giữa các component cùng tầng, trừ trường hợp được phép ghi trong `references/atomic-ui.md`.
- **Folder-per-component**: mỗi component một thư mục kebab-case, có `index.ts`, file `.type.ts`, `.hook.ts` khi cần, và thư mục `__tests__` hoặc file test co-located.
- **Giới hạn**: mỗi file dưới 180 dòng. Tách hook, helper và sub-component khi gần ngưỡng.
- **i18n**: 100% chuỗi hiển thị đi qua `t()` cho VI/EN. Với V2, key bắt buộc có prefix `v2.`.
- **Màu**: không dùng `blue-*`. Dùng token ngữ cảnh.
- **Responsive**: dùng layout responsive. Tách `*.desktop.tsx` / `*.mobile.tsx` chỉ khi UX thực sự khác, và phải chốt với user trước.
- **Storybook**: component trong `shared/` nên có `*.stories.tsx`.

## 3. Migrate V2 (`src/v2/`)

Nguyên tắc chính:

- **Dual-run**: `/v2/*` và `/` (V1) chạy song song trên cùng bundle. V2 dùng session qua `useAuthStore`.
- **Không import V1**: module và shared V2 không import `@/core`, `@/shared`, `@/modules`, trừ auth store dùng chung.
- **Rolling migration**: chỉ migrate khi user ra lệnh cho module đó.
- **Parity**: trước khi viết, liệt kê feature của module V1 và lập bảng parity V1 → V2.
- **Audit**: chạy audit ở `references/v2-migration.md` mục 8 trước khi báo hoàn tất (không import V1, key i18n `v2.*`, không `blue-*`, file dưới 180 dòng, type-check, test).

Generator (plop):

- `v2-module`: tạo module đầy đủ trong `src/v2/modules/<module>/` (api, domain, components, drawers, pages, locale, tests), đồng thời nối route, menu và i18n.
- `v2-component`: tạo component dùng chung (index, component, type, test, stories) và nối barrel của tầng Atomic đã chọn.

Module mẫu đã hoàn chỉnh: `src/v2/modules/business-partners/`.

## 4. Checklist tối thiểu trước khi báo xong

- [ ] `bun run type:check` pass.
- [ ] `bun run check:ci` pass (tsc + eslint `--max-warnings=0` + prettier).
- [ ] `bun run test` (hoặc scope liên quan) pass. Ghi rõ scope.
- [ ] Không có file vượt 180 dòng trong phạm vi đã đổi (trừ V1 cũ không được chạm).
- [ ] Không có chuỗi hardcode, không có `blue-*`, không import V1 từ V2.
- [ ] Route và luồng gọi API khớp contract thật của backend.
- [ ] Đã kiểm trên cả light và dark khi đụng token.

## 5. Tài liệu đi kèm

- `references/atomic-ui.md`: 5 tầng chi tiết, ma trận import, decision tree, co-located testing, i18n, No Blue, responsive, checklist DoD.
- `references/v2-migration.md`: nguyên tắc V2, cây module chuẩn, hạ tầng shared V2, quy ước, playbook migrate, bảng parity, bẫy đã gặp, audit, trạng thái migrate.
- Workflow đầy đủ: `.agents/workflows/ui-structure.md` và `.agents/workflows/ui-structure.md`.
- Các skill chuẩn hóa theo loại: `standardize-table-page`, `standardize-table`, `standardize-drawer`, `standardize-modal`, `standardize-dashboard-page`.
