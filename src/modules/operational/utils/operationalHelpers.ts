import type {
  OperationalDocument,
  OperationalVariant,
  OperationalDocumentType,
  CreateOperationalPayload,
  OperationalLine,
} from "@/modules/operational/api/operationalApi";
import type { InventoryMovement } from "@/modules/inventory-core/api/inventoryCoreApi";

// ---------------------------------------------------------------------------
// Variant metadata
// ---------------------------------------------------------------------------

export const variantTitle: Record<OperationalVariant, string> = {
  sales: "Bán hàng / Đơn sửa xe",
  purchase: "Mua hàng",
  expenses: "Chi phí vận hành",
  receivables: "Công nợ phải thu mới",
  payables: "Công nợ phải trả mới",
  inventory: "Kho (Tổng hợp tồn)",
};

// ---------------------------------------------------------------------------
// Select options
// ---------------------------------------------------------------------------

export const invoiceOptions = [
  { value: "NO_INVOICE", label: "Chưa có hóa đơn" },
  { value: "HAS_INVOICE", label: "Đã có hóa đơn" },
  { value: "NOT_REQUIRED", label: "Không yêu cầu" },
];

export const salesStatusOptions = [
  { value: "DRAFT", label: "Nháp" },
  { value: "CONFIRMED", label: "Xác nhận" },
  { value: "IN_PROGRESS", label: "Đang xử lý" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "CANCELLED", label: "Hủy" },
];

export const purchaseStatusOptions = [
  { value: "DRAFT", label: "Nháp" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
];

export const expenseStatusOptions = [
  { value: "DRAFT", label: "Nháp" },
  { value: "CONFIRMED", label: "Xác nhận" },
  { value: "CANCELLED", label: "Hủy" },
];

export const recurrenceOptions = [
  { value: "ONE_TIME", label: "Một lần" },
  { value: "MONTHLY", label: "Hàng tháng" },
  { value: "QUARTERLY", label: "Hàng quý" },
  { value: "YEARLY", label: "Hàng năm" },
];

export const lineTypeOptions = [
  { value: "SERVICE", label: "Dịch vụ" },
  { value: "PRODUCT", label: "Hàng hóa" },
  { value: "PART", label: "Phụ tùng" },
  { value: "EXPENSE", label: "Chi phí" },
];

// ---------------------------------------------------------------------------
// ID generator
// ---------------------------------------------------------------------------

export const newTempId = () =>
  `line-${Date.now()}-${Math.random().toString(36).slice(2)}`;

// ---------------------------------------------------------------------------
// Document display helpers
// ---------------------------------------------------------------------------

export function getDocNo(row: OperationalDocument): string {
  return row.order_no || row.purchase_no || row.expense_no || "—";
}

export function getPartner(row: OperationalDocument): string {
  return (
    row.customer_name_snapshot || row.supplier_name_snapshot || row.title || "—"
  );
}

// ---------------------------------------------------------------------------
// Helpers extracted from OperationalListPage
// ---------------------------------------------------------------------------

export function sourceLabel(
  row: OperationalDocument,
  variant: OperationalVariant,
): string {
  if (row.source_system) return row.source_system;
  if (variant === "payables" || variant === "receivables") {
    return row.document_type === "operating_expenses"
      ? "CHI PHÍ"
      : row.document_type === "purchase_orders"
        ? "MUA HÀNG"
        : "BÁN HÀNG";
  }
  return "ERP";
}

export function resolveDocumentType(
  row: OperationalDocument,
  variant: OperationalVariant,
): OperationalDocumentType | null {
  if (row.document_type === "sales_service_orders")
    return "sales_service_orders";
  if (row.document_type === "purchase_orders") return "purchase_orders";
  if (row.document_type === "operating_expenses") return "operating_expenses";
  if (variant === "sales" || variant === "receivables")
    return "sales_service_orders";
  if (variant === "purchase") return "purchase_orders";
  if (variant === "expenses") return "operating_expenses";
  return null;
}

export function inventoryStatusLabel(status?: string | null): string {
  if (status === "NOT_RECEIVED") return "Chưa nhập";
  if (status === "PARTIAL") return "Đang xử lý một phần";
  if (status === "FULLY_RECEIVED") return "Đã nhập đủ";
  if (status === "NOT_ISSUED") return "Chưa xuất";
  if (status === "ISSUED") return "Đã xuất";
  return status || "—";
}

export function canPostReceipt(
  row: OperationalDocument,
  variant: OperationalVariant,
): boolean {
  return (
    variant === "purchase" &&
    row.status === "RECEIVED" &&
    row.inventory_status !== "FULLY_RECEIVED"
  );
}

export function canPostIssue(
  row: OperationalDocument,
  variant: OperationalVariant,
): boolean {
  return (
    variant === "sales" &&
    ["CONFIRMED", "IN_PROGRESS"].includes(row.status) &&
    row.inventory_status !== "ISSUED"
  );
}

export function buildSamplePayload(
  variant: OperationalVariant,
): CreateOperationalPayload | null {
  if (variant === "sales") {
    return {
      source_system: "ERP",
      customer_name_snapshot: "Khách hàng mẫu",
      vehicle_plate: "51A-000.00",
      status: "CONFIRMED",
      invoice_status: "NO_INVOICE",
      total_amount: 1500000,
      lines: [
        {
          line_type: "SERVICE",
          item_name: "Dịch vụ sửa chữa mẫu",
          qty: 1,
          unit_price: 1500000,
        },
      ],
    };
  }
  if (variant === "expenses") {
    return {
      supplier_name_snapshot: "NCC dịch vụ mẫu",
      title: "Chi phí vận hành mẫu",
      expense_category: "UTILITY",
      status: "CONFIRMED",
      recurrence_type: "MONTHLY",
      auto_generate_next: true,
      total_amount: 800000,
      lines: [{ description: "Điện/nước/internet mẫu", amount: 800000 }],
    };
  }
  return null;
}

export function movementLabel(m: InventoryMovement): string {
  const type = m.transactionType || "—";
  const doc = m.documentType ? ` • ${m.documentType}` : "";
  return `${type}${doc}`;
}

// ---------------------------------------------------------------------------
// LineDraft type + helpers extracted from OperationalFormDrawer
// ---------------------------------------------------------------------------

export interface LineDraft {
  tempId: string;
  line_type: string;
  inventory_item_id: string;
  item_code: string;
  item_name: string;
  description: string;
  qty: string;
  unit_price: string;
  amount: string;
  notes: string;
}

export type FormVariant = Extract<
  OperationalVariant,
  "sales" | "purchase" | "expenses"
>;

export function emptyLine(variant: FormVariant): LineDraft {
  return {
    tempId: newTempId(),
    line_type: variant === "expenses" ? "EXPENSE" : "PART",
    inventory_item_id: "",
    item_code: "",
    item_name: "",
    description: "",
    qty: "1",
    unit_price: "0",
    amount: "0",
    notes: "",
  };
}

export function toLineDraft(
  line: OperationalLine,
  variant: FormVariant,
): LineDraft {
  return {
    tempId: newTempId(),
    line_type: line.line_type || (variant === "expenses" ? "EXPENSE" : "PART"),
    inventory_item_id: line.inventory_item_id || "",
    item_code: line.item_code || "",
    item_name: line.item_name || "",
    description: line.description || "",
    qty: String(line.qty ?? 1),
    unit_price: String(line.unit_price ?? 0),
    amount: String(line.amount ?? 0),
    notes: line.notes || "",
  };
}
