---
name: drawer-document-traceability
description: Mạng lưới chứng từ liên kết & Cấn trừ thông minh (Multi-hop Traceability Graph) trong Drawer hệ thống Liouni ERP. Hướng dẫn sử dụng component DrawerDocumentTraceability, props interface, data contract, 3 view modes (Canvas, Pipeline, Table), zero-trust RBAC và thao tác ghép nối/gỡ liên kết chứng từ.
---

# 🕸️ Drawer Document Traceability Standard

Component `<DrawerDocumentTraceability>` cung cấp khả năng trực quan hóa và thao tác trên **Mạng lưới chứng từ liên kết đa tầng (Multi-hop Traceability Graph)** trong Liouni ERP.

---

## 1. Khi nào sử dụng?

- Được tích hợp vào prop `relatedTabs` của `<StandardFormDrawer>` cho các module chứng từ kế toán/kinh doanh (Hóa đơn VAT, Đơn mua hàng PO, Đơn bán hàng SO, Phiếu dịch vụ Garage, Phiếu nhập xuất kho, Sao kê ngân hàng).
- Cho phép người dùng theo dõi toàn cảnh chuỗi giá trị từ Đơn hàng/Kho -> Hóa đơn -> Dòng tiền -> Sổ cái, đồng thời thực hiện ghép nối hoặc gỡ liên kết trực tiếp khi ở chế độ Edit.

---

## 2. Cấu trúc Component & Vị trí Import

```tsx
import {
  DrawerDocumentTraceability,
  type DrawerDocumentTraceabilityProps,
  type BusinessStageKey,
  type StageConfig,
  STAGES_CONFIG,
  DOC_TYPE_META,
} from "@/shared/components/drawer/DrawerDocumentTraceability";
```

Hoặc qua barrel export:
```tsx
import { DrawerDocumentTraceability } from "@/shared/components/drawer";
```

---

## 3. Props Interface & Cấu hình

```typescript
export interface DrawerDocumentTraceabilityProps {
  /** ID của chứng từ gốc đang xem */
  rootId: string;

  /** Loại chứng từ gốc (ví dụ: "INVOICE", "GARAGE_CASE", "PURCHASE_ORDER") */
  rootType?: TraceabilityNodeType;

  /** Hàm fetch dữ liệu đồ thị từ Backend API */
  fetchGraph: (id: string) => Promise<TraceabilityGraphData>;

  /** Bật chế độ cho phép sửa / ghép nối / gỡ liên kết (thường là `mode === "edit"`) */
  editMode?: boolean;

  /** Danh sách các loại chứng từ được phép chọn khi bấm "Ghép nối chứng từ" */
  allowedDocTypes?: TraceabilityNodeType[];

  /** Callback khi người dùng chọn ghép nối chứng từ */
  onAddLink?: (
    stageKey?: BusinessStageKey,
    docType?: TraceabilityNodeType,
  ) => void;

  /** Callback khi người dùng xác nhận gỡ liên kết chứng từ 1-hop */
  onUnlinkNode?: (node: TraceabilityNode) => Promise<void> | void;

  /** Callback mở modal / drawer chỉnh sửa chi tiết giao dịch thu chi ngoài (số tiền, ngày, nội dung) */
  onEditManualSettlement?: (node: TraceabilityNode) => void;

  /** Custom class bổ sung cho container ngoài */
  className?: string;
}
```

---

## 4. 4 Enterprise Business Stages (`STAGES_CONFIG`)

Hệ thống tự động gom nhóm các chứng từ vào 4 Swimlanes giai đoạn nghiệp vụ:

| Giai đoạn (Stage Key) | Số thứ tự | Tên hiển thị | Các loại chứng từ (`TraceabilityNodeType`) |
|---|---|---|---|
| `ORDER_STOCK` | 1 | 1. Mua / Bán hàng & Kho | `PURCHASE_ORDER`, `SALES_ORDER`, `GOODS_RECEIPT`, `GOODS_ISSUE`, `GARAGE_CASE` |
| `INVOICE` | 2 | 2. Hóa đơn VAT | `INVOICE` |
| `PAYMENT` | 3 | 3. Dòng tiền | `BANK_TXN` |
| `GENERAL_LEDGER` | 4 | 4. Sổ cái Kế toán | `JOURNAL_ENTRY` |

---

## 5. 3 Chế độ hiển thị (View Modes) & Tương tác Nâng cao

1. **Canvas View (`@xyflow/react`)**:
   - **Multi-hop Flowing Dash Animation**: Khi click vào một chứng từ bất kỳ, hệ thống duyệt BFS toàn bộ chuỗi chứng từ liên quan (cả upstream & downstream) và tự động kích hoạt hiệu ứng nét đứt chuyển động (`animated: true`) trên toàn bộ dây nối trong luồng.
   - **Tô đậm viền Node đã chọn**: Node được click sẽ tự động tô đậm viền (`border-2 border-slate-800 dark:border-slate-200`) kèm bóng đổ nhẹ mà không thay đổi màu sắc gốc của Node.
   - **Kéo thả & Kết nối lại Dây nối (Edge Draggable & Reconnect)**: Kích hoạt `edgesReconnectable={true}`, `reconnectRadius={30}`, `interactionWidth={30}` và các cổng kết nối Handles `w-3 h-3 cursor-crosshair` cho phép người dùng kéo thả đầu mút dây nối sang chứng từ khác một cách mượt mà.
   - **Đổi hướng bố cục Ngang ↔ Dọc**: Nút `<ControlButton>` tích hợp sẵn trong Controls góc dưới.
   - **Toàn màn hình / Thu nhỏ**: Tích hợp trên Tab Bar đồng bộ ở mọi chế độ xem.

2. **Pipeline View (Quy trình tuần tự)**:
   - Hiển thị các cột giai đoạn theo luồng tuần tự từ trái sang phải với đầy đủ badge nhận diện và số tiền `+` / `-`.

3. **Matrix Table View (Bảng kê chi tiết)**:
   - Phân tách rõ thành 2 bảng:
     - **Chứng từ liên kết trực tiếp (1-hop)**: Có nút gỡ liên kết `[🗑]` khi ở `editMode`.
     - **Chứng từ liên kết trung gian / gián tiếp (Multi-hops)**: Chỉ xem và điều hướng.

---

## 6. Bảng Màu Chuẩn Hóa Theo Bản Chất Thu - Chi Tài Chính

| Nhóm Tài Chính | Loại Chứng Từ | Badge Label | Màu sắc Badge | Viền nhận diện Node | Định dạng Tiền |
|---|---|---|---|---|---|
| **Dòng Tiền Chi (Tiền ra)** | `HĐ MUA` (Đầu vào) | `HĐ MUA` | `bg-orange-50 text-[#ea580c] border-orange-200` | `border-l-4 border-l-[#ea580c]` | Số tiền chuẩn |
| | `UNC` (Ngân hàng) | `UNC` | `bg-orange-50 text-[#ea580c] border-orange-200` | `border-l-4 border-l-[#ea580c]` | `-[Số tiền] ₫` (Màu cam) |
| | `Phiếu Chi` (Tiền mặt) | `PHIẾU CHI` | `bg-orange-50 text-[#ea580c] border-orange-200` | `border-l-4 border-l-[#ea580c]` | `-[Số tiền] ₫` (Màu cam) |
| | `Chi Ngoài ERP` | `CHI NGOÀI` | `bg-orange-50 text-[#ea580c] border-orange-200` | `border-l-4 border-l-[#ea580c]` | `-[Số tiền] ₫` (Màu cam) |
| **Dòng Tiền Thu (Tiền vào)** | `HĐ BÁN` (Đầu ra) | `HĐ BÁN` | `bg-emerald-50 text-emerald-700 border-emerald-200` | `border-l-4 border-l-emerald-500` | Số tiền chuẩn |
| | `GBC` (Ngân hàng) | `GBC` | `bg-emerald-50 text-emerald-700 border-emerald-200` | `border-l-4 border-l-emerald-500` | `+[Số tiền] ₫` (Màu xanh) |
| | `Phiếu Thu` (Tiền mặt) | `PHIẾU THU` | `bg-emerald-50 text-emerald-700 border-emerald-200` | `border-l-4 border-l-emerald-500` | `+[Số tiền] ₫` (Màu xanh) |
| | `Thu Ngoài ERP` | `THU NGOÀI` | `bg-emerald-50 text-emerald-700 border-emerald-200` | `border-l-4 border-l-emerald-500` | `+[Số tiền] ₫` (Màu xanh) |

---

## 7. Điều hướng Node Chi tiết & Zero-Trust RBAC

- **Phân nhánh điều hướng khi click nút chi tiết hoặc Double-click**:
  1. **Sổ cái kế toán (`JOURNAL_ENTRY` / `GL`)**: Ẩn nút icon `[↗]`, không kích hoạt mở drawer.
  2. **Thu / Chi ngoài sổ sách (`manual-*` / `NOTE-TIEN_MAT_NGOAI`)**: Kích hoạt `onEditManualSettlement` để mở Drawer/Modal chỉnh sửa chi tiết nội dung, số tiền, ngày giao dịch.
  3. **Chứng từ ERP chuẩn (Hóa đơn, PO, SO, RO, Sao kê ERP)**: Dispatch event `open_erp_document` để mở Global Drawer của module tương ứng.
- **Zero-Trust RBAC**:
  - Nếu node có `restricted: true` (người dùng không có quyền trên module đó), dữ liệu số tiền sẽ bị mask thành `***`, tiêu đề hiển thị icon 🔒 `Chứng từ bảo mật` nhưng cấu trúc cầu nối trên đồ thị vẫn được bảo toàn.

---

## 8. Quy tắc Gỡ liên kết Client-side & Lưu theo Batch (Client-side Staging)

- **Nguyên tắc cốt lõi**:
  1. Khi ở chế độ Chỉnh sửa (`editMode`), thao tác gỡ liên kết chứng từ (bấm nút thùng rác và xác nhận trong `ConfirmModal`) **phải được xử lý hoàn toàn trên Client-side** (lưu vào mảng pending changes của form/hook).
  2. `useTraceabilityLogic` tự động cập nhật lạc quan (`optimistic update`) loại bỏ node và các edges kết nối khỏi state đồ thị cục bộ `graphData`, đồng thời tự động tính toán lại số tiền đã cấn trừ (`summary.totalNetOffAmount`).
  3. **Tuyệt đối không gọi API xóa ngay lập tức** trong `onUnlinkNode` khi đang `editMode`.
  4. Chỉ khi người dùng bấm nút **"Lưu thay đổi"** của Drawer thì toàn bộ danh sách chứng từ đã đánh dấu gỡ liên kết mới được gửi xuống Backend API theo batch.
  5. Nếu người dùng bấm **"Hủy"**, toàn bộ thay đổi pending sẽ được reset và đồ thị khôi phục lại trạng thái ban đầu.
