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

## 5. 3 Chế độ hiển thị (View Modes)

1. **Canvas View (`@xyflow/react`)**:
   - Hiển thị đồ thị trực quan với các Swimlane Stages bao quanh.
   - Các đường nối (`LabeledSmoothStepEdge`) với nhãn cấn trừ nổi và mũi tên định hướng (`MarkerType.ArrowClosed`).
   - Cụm điều khiển `<Controls>` góc dưới tích hợp sẵn nút **Đổi hướng bố cục Ngang ↔ Dọc** (`RotateCcw`) qua component chuẩn `<ControlButton>`.
   - Nút **Sao chép số chứng từ** có cơ chế an toàn đa tầng (`nodrag nopan` + fallback clipboard).
   - Nút **Toàn màn hình / Thu nhỏ** (`Maximize2`/`Minimize2`) nằm trực tiếp trên Tab Bar phía trên, hiển thị đồng nhất ở mọi chế độ xem.

2. **Pipeline View (Quy trình tuần tự)**:
   - Hiển thị các cột giai đoạn theo luồng tuần tự từ trái sang phải.
   - Phù hợp khi người dùng muốn xem danh sách chứng từ phân loại theo từng bước nghiệp vụ.

3. **Matrix Table View (Bảng kê chi tiết)**:
   - Phân tách rõ thành 2 bảng:
     - **Chứng từ liên kết trực tiếp (1-hop)**: Có nút gỡ liên kết `[🗑]` khi ở `editMode`.
     - **Chứng từ liên kết trung gian / gián tiếp (Multi-hops)**: Chỉ xem và điều hướng.

---

## 6. Điều hướng Node Chi tiết & Zero-Trust RBAC

- **Phân nhánh điều hướng khi click nút chi tiết hoặc Double-click**:
  1. **Sổ cái kế toán (`JOURNAL_ENTRY` / `GL`)**: Ẩn nút icon `[↗]`, không kích hoạt mở drawer (vì module đang phát triển).
  2. **Thu / Chi ngoài sổ sách (`manual-*` / `NOTE-TIEN_MAT_NGOAI`)**: Kích hoạt `onEditManualSettlement` (hoặc dispatch event `open_manual_settlement_editor`) để mở Drawer/Modal chỉnh sửa chi tiết nội dung, số tiền, ngày giao dịch.
  3. **Chứng từ ERP chuẩn (Hóa đơn, PO, SO, RO, Sao kê ERP)**: Dispatch event `open_erp_document` để mở Global Drawer của module tương ứng.
- **Zero-Trust RBAC**:
  - Nếu node có `restricted: true` (người dùng không có quyền trên module đó), dữ liệu số tiền sẽ bị mask thành `***`, tiêu đề hiển thị icon 🔒 `Chứng từ bảo mật` nhưng cấu trúc cầu nối trên đồ thị vẫn được bảo toàn.


---

## 7. Mẫu tích hợp chuẩn trong `StandardFormDrawer`

```tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Network, History, Paperclip } from "lucide-react";
import {
  StandardFormDrawer,
  type DrawerRelatedTabItem,
} from "@/shared/components/StandardFormDrawer";
import { DrawerDocumentTraceability } from "@/shared/components/drawer/DrawerDocumentTraceability";
import { getInvoiceTraceabilityGraph, unlinkInvoiceDocument } from "@/shared/api/invoices";

export function InvoiceDetailDrawer({ open, onClose, mode, setMode, invoice }) {
  const { t } = useTranslation("invoices");
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedLinkStage, setSelectedLinkStage] = useState<string | undefined>();
  const [selectedLinkType, setSelectedLinkType] = useState<string | undefined>();

  const handleOpenLink = (stageKey?: string, docType?: string) => {
    setSelectedLinkStage(stageKey);
    setSelectedLinkType(docType);
    setLinkModalOpen(true);
  };

  const handleUnlink = async (node: any) => {
    await unlinkInvoiceDocument(invoice.id, node.id, node.docType);
  };

  const relatedTabs: DrawerRelatedTabItem[] = [
    {
      key: "traceability",
      label: t("Mạng lưới chứng từ", "Document Network"),
      icon: <Network className="w-3.5 h-3.5" />,
      badgeCount: invoice?.linkedDocsCount,
      flush: true, // BẮT BUỘC: bật flush để canvas tràn viền đẹp mắt
      content: (
        <DrawerDocumentTraceability
          rootId={invoice.id}
          rootType="INVOICE"
          fetchGraph={getInvoiceTraceabilityGraph}
          editMode={mode === "edit"}
          allowedDocTypes={[
            "BANK_TXN",
            "PURCHASE_ORDER",
            "SALES_ORDER",
            "GARAGE_CASE",
            "GOODS_RECEIPT",
            "GOODS_ISSUE",
          ]}
          onAddLink={handleOpenLink}
          onUnlinkNode={handleUnlink}
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
      title={t(`Hóa đơn: ${invoice?.invoiceNo}`)}
      layout="2-columns"
      size="xl"
      relatedTabs={relatedTabs}
      leftPanel={<div>{/* Chi tiết hóa đơn */}</div>}
      rightPanel={<div>{/* Metadata hóa đơn */}</div>}
    />
  );
}
```

---

## 8. Backend Contract (`TraceabilityGraphData`)

Hàm `fetchGraph(id)` cần trả về cấu trúc dữ liệu:

```typescript
export interface TraceabilityGraphData {
  rootId: string;
  rootType: TraceabilityNodeType;
  nodes: TraceabilityNode[];
  edges: TraceabilityEdge[];
  summary: {
    totalNetOffAmount: number;
    matchRatio: number;
    directCount: number;
    transitiveCount: number;
  };
}

export interface TraceabilityNode {
  id: string;
  docType: TraceabilityNodeType;
  docNo: string;
  date?: string;
  title?: string;
  partnerName?: string;
  amount?: number;
  netOffAmount?: number;
  isCurrent?: boolean;
  depth: number;
  restricted?: boolean;
  hasPermission?: boolean;
  requiredResource?: string;
}

export interface TraceabilityEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  netOffAmount?: number;
  isTransitive?: boolean;
}
```

---

## 9. Quy tắc Gỡ liên kết Client-side & Lưu theo Batch (Client-side Staging)

- **Nguyên tắc cốt lõi**:
  1. Khi ở chế độ Chỉnh sửa (`editMode`), thao tác gỡ liên kết chứng từ (bấm nút thùng rác và xác nhận trong `ConfirmModal`) **phải được xử lý hoàn toàn trên Client-side** (lưu vào mảng pending changes của form/hook).
  2. `useTraceabilityLogic` tự động cập nhật lạc quan (`optimistic update`) loại bỏ node và các edges kết nối khỏi state đồ thị cục bộ `graphData`, đồng thời tự động tính toán lại số tiền đã cấn trừ (`summary.totalNetOffAmount`).
  3. **Tuyệt đối không gọi API xóa ngay lập tức** trong `onUnlinkNode` khi đang `editMode`.
  4. Chỉ khi người dùng bấm nút **"Lưu thay đổi"** của Drawer thì toàn bộ danh sách chứng từ đã đánh dấu gỡ liên kết mới được gửi xuống Backend API theo batch.
  5. Nếu người dùng bấm **"Hủy"**, toàn bộ thay đổi pending sẽ được reset và đồ thị khôi phục lại trạng thái ban đầu.

