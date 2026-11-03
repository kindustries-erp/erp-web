---
name: erp-find-ui-patterns
description: Tìm kiếm và trích xuất interface/props của các reusable UI components (như ConfirmModal, Spreadsheet, Drawer, FilterPanel) của erp-web để tái sử dụng. V1 nằm ở src/shared/components/, V2 nằm ở src/v2/shared/ui/ và src/v2/shared/components/. Dùng trước khi viết bất kỳ Modal, Drawer, Table, Filter hoặc form field mới.
---

# Kỹ năng Tìm kiếm và Tái sử dụng UI Component (ERP)

## Mục đích

Tránh việc Agent tự phát minh lại bánh xe (reinvent the wheel) bằng cách tạo ra các component UI cơ bản (như Modal, Drawer, Table) từ đầu. Kỹ năng này hướng dẫn agent cách tìm kiếm và đọc interface của component đã có sẵn.

## Cách thực hiện

Mỗi khi bạn được yêu cầu xây dựng một giao diện hoặc luồng xử lý liên quan đến hiển thị dữ liệu dạng bảng, form nhập liệu trong modal/drawer, bạn BẮT BUỘC thực hiện các bước sau TRƯỚC KHI sinh code mới:

1. Dùng công cụ tìm kiếm nội dung của agent đang chạy (`grep`/`Grep`/`grep_search`, hoặc `rg`) để tìm keyword (ví dụ: `Drawer`, `Modal`, `Spreadsheet`, `Filter`) theo đúng phiên bản đang làm:
   - **V1** (code ngoài `src/v2/`): `src/shared/components/`.
   - **V2** (code trong `src/v2/`): `src/v2/shared/ui/` (primitive) và `src/v2/shared/components/{atoms,molecules,organisms,templates}/`. Code V2 không import V1 (xem `erp-web-truth` mục 4).
2. Xác định file chứa component cốt lõi (thường nằm ở `common` hoặc `shared`).
3. Dùng công cụ đọc file của agent (`Read`/`view_file`/`cat`) để đọc nội dung file đó.
4. Trích xuất block `interface Props` hoặc các param truyền vào component (V2: file `*.type.ts` cạnh component).
5. Sử dụng component đó với đúng các props yêu cầu.
6. Nếu không có component phù hợp, ghi lý do tạo mới vào task (quy tắc reuse-first trong `.agents/AGENTS.md`).

## Ví dụ

Nếu bạn cần tạo một Modal để xác nhận xoá:

- KHÔNG tự viết:
  ```tsx
  export const MyDeleteModal = () => {
    return <div className="fixed ...">...</div>;
  };
  ```
- MÀ HÃY:
  Tìm xem hệ thống có `ConfirmModal` không. Sau đó import và sử dụng (luôn nhớ dùng i18n cho text):

  ```tsx
  import { ConfirmModal } from "@/shared/components/ConfirmModal";
  import { useTranslation } from "react-i18next"; // hoặc thư viện i18n tương ứng

  // Bên trong component:
  const { t } = useTranslation();

  <ConfirmModal
    isOpen={isOpen}
    title={t("common.confirm")}
    onConfirm={handleDelete}
    onCancel={closeModal}
  />;
  ```

- Trong code **V2**, dùng bản V2 tương ứng thay vì bản V1 (ví dụ `V2ConfirmModal` tại `@/v2/shared/components/molecules/v2-confirm-modal`, `V2FormField` tại `@/v2/shared/components/molecules/v2-form-field`). Key i18n của V2 có prefix `v2.`.
