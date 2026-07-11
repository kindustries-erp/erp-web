---
name: erp-find-ui-patterns
description: Tìm kiếm và trích xuất interface/props của các reusable UI components (như ConfirmModal, Spreadsheet, Drawer, FilterPanel) trong thư mục src/components của erp-web để tái sử dụng.
---

# Kỹ năng Tìm kiếm và Tái sử dụng UI Component (ERP)

## Mục đích

Tránh việc Agent tự phát minh lại bánh xe (reinvent the wheel) bằng cách tạo ra các component UI cơ bản (như Modal, Drawer, Table) từ đầu. Kỹ năng này hướng dẫn agent cách tìm kiếm và đọc interface của component đã có sẵn.

## Cách thực hiện

Mỗi khi bạn được yêu cầu xây dựng một giao diện hoặc luồng xử lý liên quan đến hiển thị dữ liệu dạng bảng, form nhập liệu trong modal/drawer, bạn BẮT BUỘC thực hiện các bước sau TRƯỚC KHI sinh code mới:

1. Dùng công cụ `grep_search` để tìm keyword (ví dụ: `Drawer`, `Modal`, `Spreadsheet`, `Filter`) trong thư mục `src/components/`.
2. Xác định file chứa component cốt lõi (thường nằm ở `common` hoặc `shared`).
3. Dùng công cụ `view_file` để đọc nội dung file đó.
4. Trích xuất block `interface Props` hoặc các param truyền vào component.
5. Sử dụng component đó với đúng các props yêu cầu.

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
  import { ConfirmModal } from "@/components/common/ConfirmModal";
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
