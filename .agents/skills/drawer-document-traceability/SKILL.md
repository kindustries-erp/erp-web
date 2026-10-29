---
name: drawer-document-traceability
description: Mạng lưới chứng từ liên kết & Cấn trừ thông minh (Multi-hop Traceability Graph) trong Drawer hệ thống ERP. Hướng dẫn sử dụng component DrawerDocumentTraceability, props interface, data contract, 3 view modes (Canvas, Pipeline, Table), zero-trust RBAC và thao tác ghép nối/gỡ liên kết chứng từ.
---

# 🕸️ Drawer Document Traceability Standard

Component `<DrawerDocumentTraceability>` cung cấp khả năng trực quan hóa và thao tác trên **Mạng lưới chứng từ liên kết đa tầng (Multi-hop Traceability Graph)** trong ERP.

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
  fetchGraph?: (id: string) => Promise<TraceabilityGraphData>;

  /** Truyền trực tiếp dữ liệu đồ thị từ component cha (hỗ trợ Controlled state & Optimistic update khi edit) */
  graphData?: TraceabilityGraphData | null;

  /** Bật chế độ cho phép sửa / ghép nối / gỡ liên kết (thường là `mode === "edit"`) */
  editMode?: boolean;

  /** Cho phép chỉnh sửa (tương đương editMode) */
  allowEdit?: boolean;

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

## 4. Mẫu tích hợp chuẩn vào `StandardFormDrawer`

Khi gắn `<DrawerDocumentTraceability>` vào `relatedTabs` của `StandardFormDrawer`, **bắt buộc phải bật `flush: true`** để biểu đồ tràn viền tối đa và không bị padding của Card Container làm hẹp diện tích kéo thả node:

```tsx
import {
  StandardFormDrawer,
  DrawerDocumentTraceability,
  type DrawerRelatedTabItem,
} from "@/shared/components/drawer";
import { Network } from "lucide-react";
import { useTranslation } from "react-i18next";

export function InvoiceDetailDrawer({ open, onClose, mode, setMode, invoice }) {
  const { t } = useTranslation("invoices");

  const relatedTabs: DrawerRelatedTabItem[] = [
    {
      key: "traceability",
      label: t("Mạng lưới chứng từ", "Traceability Network"),
      icon: <Network className="w-3.5 h-3.5" />,
      badgeCount: invoice?.linkedDocsCount,
      flush: true, // ⚠️ BẮT BUỘC bật flush: true cho Canvas Graph tràn viền
      content: (
        <DrawerDocumentTraceability
          rootId={invoice.id}
          rootType="INVOICE"
          fetchGraph={invoiceApi.getTraceabilityGraph}
          editMode={mode === "edit"}
          allowedDocTypes={["PURCHASE_ORDER", "BANK_TXN", "GOODS_RECEIPT"]}
          onAddLink={(stage, docType) => openLinkModal(stage, docType)}
          onUnlinkNode={(node) => handleStageUnlink(node)}
        />
      ),
    },
  ];

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      onToggleEdit={() => setMode("edit")}
      title={invoice.invoiceNumber}
      layout="2-columns"
      size="xl"
      relatedTabs={relatedTabs}
      leftPanel={<div>{/* Main form */}</div>}
      rightPanel={<div>{/* Metadata */}</div>}
    />
  );
}
```

---

## 5. 4 Enterprise Business Stages (`STAGES_CONFIG`)

Hệ thống tự động gom nhóm các chứng từ vào 4 Swimlanes giai đoạn nghiệp vụ:

| Giai đoạn (Stage Key) | Số thứ tự | Tên hiển thị | Các loại chứng từ (`TraceabilityNodeType`) |
|---|---|---|---|
| `ORDER_STOCK` | 1 | 1. Mua / Bán hàng & Kho | `PURCHASE_ORDER`, `SALES_ORDER`, `GOODS_RECEIPT`, `GOODS_ISSUE`, `GARAGE_CASE` |
| `INVOICE` | 2 | 2. Hóa đơn VAT | `INVOICE` |
| `PAYMENT` | 3 | 3. Dòng tiền | `BANK_TXN` |
| `GENERAL_LEDGER` | 4 | 4. Sổ cái Kế toán | `JOURNAL_ENTRY` |

---

## 6. 3 Chế độ hiển thị (View Modes) & Tương tác Nâng cao

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

## 7. Bảng Màu Chuẩn Hóa Theo Bản Chất Thu - Chi Tài Chính

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

## 8. Điều hướng Node Chi tiết & Zero-Trust RBAC

- **Phân nhánh điều hướng khi click nút chi tiết hoặc Double-click**:
  1. **Sổ cái kế toán (`JOURNAL_ENTRY` / `GL`)**: Ẩn nút icon `[↗]`, không kích hoạt mở drawer.
  2. **Thu / Chi ngoài sổ sách (`manual-*` / `NOTE-TIEN_MAT_NGOAI`)**: Kích hoạt `onEditManualSettlement` để mở Drawer/Modal chỉnh sửa chi tiết nội dung, số tiền, ngày giao dịch.
  3. **Chứng từ ERP chuẩn (Hóa đơn, PO, SO, RO, Sao kê ERP)**: Dispatch event `open_erp_document` để mở Global Drawer của module tương ứng.
- **Zero-Trust RBAC**:
  - Nếu node có `restricted: true` (người dùng không có quyền trên module đó), dữ liệu số tiền sẽ bị mask thành `***`, tiêu đề hiển thị icon 🔒 `Chứng từ bảo mật` nhưng cấu trúc cầu nối trên đồ thị vẫn được bảo toàn.

---

## 9. Quy tắc Gỡ liên kết Client-side & Lưu theo Batch (Client-side Staging)

- **Nguyên tắc cốt lõi**:
  1. Khi ở chế độ Chỉnh sửa (`editMode`), thao tác gỡ liên kết chứng từ (bấm nút thùng rác và xác nhận trong `ConfirmModal`) **phải được xử lý hoàn toàn trên Client-side** (lưu vào mảng pending changes của form/hook).
  2. `useTraceabilityLogic` tự động cập nhật lạc quan (`optimistic update`) loại bỏ node và các edges kết nối khỏi state đồ thị cục bộ `graphData`, đồng thời tự động tính toán lại số tiền đã cấn trừ (`summary.totalNetOffAmount`).
  3. **Tuyệt đối không gọi API xóa ngay lập tức** trong `onUnlinkNode` khi đang `editMode`.
  4. Chỉ khi người dùng bấm nút **"Lưu thay đổi"** của Drawer thì toàn bộ danh sách chứng từ đã đánh dấu gỡ liên kết mới được gửi xuống Backend API theo batch.
  5. Nếu người dùng bấm **"Hủy"**, toàn bộ thay đổi pending sẽ được reset và đồ thị khôi phục lại trạng thái ban đầu.

---

## 10. Kiến Trúc Layout Engine V2 & No-Drag Standard

Từ phiên bản V2, hệ thống luồng chứng từ chuyển sang sử dụng **Pure Domain Layout Engine** (`src/v2/shared/components/organisms/v2-document-traceability/utils/`):

1. **Thuật toán Sắp xếp Barycenter Sweep (`traceability.layout.barycenter.ts`)**:
   - Quét 2 chiều (Forward & Backward) để tính toán trọng tâm kết nối của từng node.
   - Tự động hoán đổi thứ tự các node trong cùng stage để triệt tiêu 80-90% tình trạng dây nối cắt chéo nhau (edge crossings).

2. **Thuật toán Gióng Hàng Y & Chống Va Chạm (`traceability.layout.alignment.ts`)**:
   - **Quan hệ 1-1**: Node con tự động lấy cùng tọa độ Y với node cha ($\Delta y = 0$), tạo thành **đường nối ngang thẳng tắp 180 độ**.
   - **Quan hệ N-1 / 1-N**: Node liên kết phân bổ đối xứng theo trọng tâm các node cha.
   - **Chống đè node**: Cơ chế Collision Push đảm bảo khoảng cách giữa các node cùng cột luôn $\ge \text{rowGap}$. Khung Stage tự động co giãn chiều cao theo nội dung thực tế.

3. **Cố Định Vị Trí Node (No-Drag Policy)**:
   - Các node được cấu hình `draggable: false` và `<ReactFlow nodesDraggable={false} nodesConnectable={false} elementsSelectable={true}>`.
   - Giữ nguyên khả năng Pan/Zoom canvas và click chọn node để xem/sửa, nhưng khóa thao tác kéo rê để bảo toàn bố cục đồ thị chuẩn.

4. **Định Vị Nhãn Trên Lưng Đường Kẻ (`V2TraceEdge.tsx`)**:
   - Nhãn số tiền / ghi chú được đặt nổi hẳn lên trên đường kẻ (`translate(-50%, -100%) translateY(-6px)`), giúp đường nét thông suốt bên dưới và nhãn hiển thị trang nhã, không bị vạch kẻ đè qua.

5. **Cơ Chế Adapter Tái Sử Dụng Cho V1 (`DrawerDocumentTraceability.tsx`)**:
   - Component V1 đóng vai trò là một **Adapter Facade** mỏng (< 60 LoC), map các props V1 (`allowEdit`, `fetchGraph`, `onAddLink`) sang `V2DocumentTraceability`.
   - Giúp toàn bộ các module V1 như `garage-cases`, `inventory-core`, `production-core` lập tức thừa hưởng giao diện và engine V2 hiện đại với 100% tương thích ngược.

---

## Summary Checklist trước khi hoàn thành:

- [ ] Canvas đã khóa kéo rê node (`nodesDraggable={false}`, `draggable: false`) để bảo toàn layout chưa?
- [ ] Nhãn dây nối (`V2TraceEdge`) đã nằm trên lưng đường kẻ (`translate(-50%, -100%) translateY(-6px)`) chưa?
- [ ] Layout engine đã áp dụng Barycenter Sweep và Target-Y alignment để các node 1-1 thẳng hàng chưa?
- [ ] Khung stage đã tự co giãn theo chiều cao thực tế của các node chưa?
- [ ] Component V1 `DrawerDocumentTraceability` đã đóng vai trò Adapter Facade chuyển tiếp sang V2 chưa?
- [ ] Đã truyền prop `editMode={mode === "edit"}` để đồng bộ quyền ghép nối/gỡ liên kết với Drawer cha chưa?
- [ ] Thao tác gỡ liên kết (`onUnlinkNode`) đã được staging trên Client-side và chỉ lưu theo batch khi submit form chưa?
- [ ] Các loại chứng từ được phép ghép nối (`allowedDocTypes`) đã được khai báo phù hợp với nghiệp vụ của module chưa?
- [ ] Dữ liệu trả về từ API `fetchGraph` đã tuân thủ đúng 4 Business Stages (`ORDER_STOCK`, `INVOICE`, `PAYMENT`, `GENERAL_LEDGER`) chưa?
- [ ] Đã kiểm tra Zero-Trust RBAC masking (`***`) đối với các node bị giới hạn quyền truy cập (`restricted: true`) chưa?

