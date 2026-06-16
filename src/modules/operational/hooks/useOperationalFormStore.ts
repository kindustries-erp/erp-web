import { create } from "zustand";
import { today } from "@/shared/utils/format";
import {
  emptyLine,
  toLineDraft,
  newTempId,
  type LineDraft,
  type FormVariant,
} from "@/modules/operational/utils/operationalHelpers";
import type { OperationalDocument } from "@/modules/operational/api/operationalApi";

// ---------------------------------------------------------------------------
// Sort config type (reused in form + list)
// ---------------------------------------------------------------------------
export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------
interface OperationalFormState {
  // Form fields — header
  docNo: string;
  branchId: string;
  partnerId: string;
  partnerNameSnapshot: string;
  title: string;
  vehiclePlate: string;
  vehicleVin: string;
  vehicleModel: string;
  serviceAdvisorName: string;
  expenseCategory: string;
  documentDate: string;
  expectedDate: string;
  dueDate: string;
  invoiceStatus: string;
  status: string;
  paymentStatus: string;
  recurrenceType: string;
  recurrenceInterval: string;
  recurrenceStartDate: string;
  recurrenceEndDate: string;
  nextDueDate: string;
  autoGenerateNext: boolean;
  notes: string;

  // Form fields — lines
  lines: LineDraft[];

  // UI state
  showGeneralInfo: boolean;
  saving: boolean;
  error: string | null;
  submittingStatus: string | null;

  // Line detail search/sort (purchase only)
  detailSearch: string;
  detailSortConfig: SortConfig | null;

  // Async options
  branchOptions: Array<{ value: string; label: string }>;
  partnerOptions: Array<{ value: string; label: string }>;
  inventoryItemOptions: Array<{
    value: string;
    label: string;
    sku: string;
    itemName: string;
    itemType?: string;
    note?: string;
    searchText?: string;
  }>;
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------
interface OperationalFormActions {
  // Header fields
  setDocNo: (v: string) => void;
  setBranchId: (v: string) => void;
  setPartnerId: (v: string) => void;
  setPartnerNameSnapshot: (v: string) => void;
  setTitle: (v: string) => void;
  setVehiclePlate: (v: string) => void;
  setVehicleVin: (v: string) => void;
  setVehicleModel: (v: string) => void;
  setServiceAdvisorName: (v: string) => void;
  setExpenseCategory: (v: string) => void;
  setDocumentDate: (v: string) => void;
  setExpectedDate: (v: string) => void;
  setDueDate: (v: string) => void;
  setInvoiceStatus: (v: string) => void;
  setStatus: (v: string) => void;
  setPaymentStatus: (v: string) => void;
  setRecurrenceType: (v: string) => void;
  setRecurrenceInterval: (v: string) => void;
  setRecurrenceStartDate: (v: string) => void;
  setRecurrenceEndDate: (v: string) => void;
  setNextDueDate: (v: string) => void;
  setAutoGenerateNext: (v: boolean) => void;
  setNotes: (v: string) => void;

  // Line operations
  setLine: <K extends keyof LineDraft>(
    tempId: string,
    key: K,
    value: LineDraft[K],
  ) => void;
  addLine: (variant: FormVariant) => void;
  removeLine: (tempId: string, variant: FormVariant) => void;
  setLines: (lines: LineDraft[]) => void;

  // UI state
  setShowGeneralInfo: (v: boolean | ((prev: boolean) => boolean)) => void;
  setSaving: (v: boolean) => void;
  setError: (v: string | null) => void;
  setSubmittingStatus: (v: string | null) => void;

  // Detail search/sort
  setDetailSearch: (v: string) => void;
  setDetailSortConfig: (v: SortConfig | null) => void;

  // Options
  setBranchOptions: (v: OperationalFormState["branchOptions"]) => void;
  setPartnerOptions: (v: OperationalFormState["partnerOptions"]) => void;
  setInventoryItemOptions: (
    v: OperationalFormState["inventoryItemOptions"],
  ) => void;

  // Lifecycle
  initNew: (variant: FormVariant) => void;
  initFromDoc: (doc: OperationalDocument, variant: FormVariant) => void;
}

// ---------------------------------------------------------------------------
// Default state
// ---------------------------------------------------------------------------
const defaultState = (): OperationalFormState => ({
  docNo: "",
  branchId: "",
  partnerId: "",
  partnerNameSnapshot: "",
  title: "",
  vehiclePlate: "",
  vehicleVin: "",
  vehicleModel: "",
  serviceAdvisorName: "",
  expenseCategory: "",
  documentDate: today(),
  expectedDate: "",
  dueDate: "",
  invoiceStatus: "NO_INVOICE",
  status: "DRAFT",
  paymentStatus: "UNPAID",
  recurrenceType: "ONE_TIME",
  recurrenceInterval: "1",
  recurrenceStartDate: "",
  recurrenceEndDate: "",
  nextDueDate: "",
  autoGenerateNext: false,
  notes: "",
  lines: [],
  showGeneralInfo: true,
  saving: false,
  error: null,
  submittingStatus: null,
  detailSearch: "",
  detailSortConfig: null,
  branchOptions: [],
  partnerOptions: [],
  inventoryItemOptions: [],
});

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useOperationalFormStore = create<
  OperationalFormState & OperationalFormActions
>((set) => ({
  ...defaultState(),

  setDocNo: (v) => set({ docNo: v }),
  setBranchId: (v) => set({ branchId: v }),
  setPartnerId: (v) => set({ partnerId: v }),
  setPartnerNameSnapshot: (v) => set({ partnerNameSnapshot: v }),
  setTitle: (v) => set({ title: v }),
  setVehiclePlate: (v) => set({ vehiclePlate: v }),
  setVehicleVin: (v) => set({ vehicleVin: v }),
  setVehicleModel: (v) => set({ vehicleModel: v }),
  setServiceAdvisorName: (v) => set({ serviceAdvisorName: v }),
  setExpenseCategory: (v) => set({ expenseCategory: v }),
  setDocumentDate: (v) => set({ documentDate: v }),
  setExpectedDate: (v) => set({ expectedDate: v }),
  setDueDate: (v) => set({ dueDate: v }),
  setInvoiceStatus: (v) => set({ invoiceStatus: v }),
  setStatus: (v) => set({ status: v }),
  setPaymentStatus: (v) => set({ paymentStatus: v }),
  setRecurrenceType: (v) => set({ recurrenceType: v }),
  setRecurrenceInterval: (v) => set({ recurrenceInterval: v }),
  setRecurrenceStartDate: (v) => set({ recurrenceStartDate: v }),
  setRecurrenceEndDate: (v) => set({ recurrenceEndDate: v }),
  setNextDueDate: (v) => set({ nextDueDate: v }),
  setAutoGenerateNext: (v) => set({ autoGenerateNext: v }),
  setNotes: (v) => set({ notes: v }),

  setLine: (tempId, key, value) => {
    set((state) => ({
      lines: state.lines.map((line) => {
        if (line.tempId !== tempId) return line;
        const next = { ...line, [key]: value };
        const qty = Number(next.qty || 0);
        const unit = Number(next.unit_price || 0);
        if (key === "qty" || key === "unit_price") {
          next.amount = String(qty * unit);
        }
        return next;
      }),
    }));
  },

  addLine: (variant) => {
    set((state) => ({ lines: [...state.lines, emptyLine(variant)] }));
  },

  removeLine: (tempId, variant) => {
    set((state) => {
      const next = state.lines.filter((line) => line.tempId !== tempId);
      return { lines: next.length ? next : [emptyLine(variant)] };
    });
  },

  setLines: (lines) => set({ lines }),

  setShowGeneralInfo: (v) => {
    if (typeof v === "function") {
      set((state) => ({ showGeneralInfo: v(state.showGeneralInfo) }));
    } else {
      set({ showGeneralInfo: v });
    }
  },
  setSaving: (v) => set({ saving: v }),
  setError: (v) => set({ error: v }),
  setSubmittingStatus: (v) => set({ submittingStatus: v }),

  setDetailSearch: (v) => set({ detailSearch: v }),
  setDetailSortConfig: (v) => set({ detailSortConfig: v }),

  setBranchOptions: (v) => set({ branchOptions: v }),
  setPartnerOptions: (v) => set({ partnerOptions: v }),
  setInventoryItemOptions: (v) => set({ inventoryItemOptions: v }),

  initNew: (variant) => {
    set({
      ...defaultState(),
      lines: [emptyLine(variant)],
    });
  },

  initFromDoc: (doc, variant) => {
    const lines = doc.lines?.length
      ? doc.lines.map((line) => toLineDraft(line, variant))
      : [emptyLine(variant)];

    set({
      docNo: doc.order_no || doc.purchase_no || doc.expense_no || "",
      branchId: doc.branch_id || "",
      partnerId:
        variant === "sales" ? doc.customer_id || "" : doc.supplier_id || "",
      partnerNameSnapshot:
        doc.customer_name_snapshot || doc.supplier_name_snapshot || "",
      title: doc.title || "",
      vehiclePlate: doc.vehicle_plate || "",
      vehicleVin: (doc as never as Record<string, string>)["vehicle_vin"] || "",
      vehicleModel:
        (doc as never as Record<string, string>)["vehicle_model"] || "",
      serviceAdvisorName:
        (doc as never as Record<string, string>)["service_advisor_name"] || "",
      expenseCategory: doc.expense_category || "",
      documentDate: (doc.document_date || today()).slice(0, 16),
      expectedDate: (
        (doc as never as Record<string, string>)["expected_delivery_date"] ||
        (doc as never as Record<string, string>)["expected_receipt_date"] ||
        ""
      ).slice(0, 16),
      dueDate: (doc.due_date || "").slice(0, 10),
      invoiceStatus: doc.invoice_status || "NO_INVOICE",
      status: doc.status || "DRAFT",
      paymentStatus: doc.payment_status || "UNPAID",
      recurrenceType: doc.recurrence_type || "ONE_TIME",
      recurrenceInterval: String(
        (doc as never as Record<string, number>)["recurrence_interval"] ?? 1,
      ),
      recurrenceStartDate: String(
        (doc as never as Record<string, string>)["recurrence_start_date"] || "",
      ).slice(0, 10),
      recurrenceEndDate: String(
        (doc as never as Record<string, string>)["recurrence_end_date"] || "",
      ).slice(0, 10),
      nextDueDate: String(doc.next_due_date || "").slice(0, 10),
      autoGenerateNext: Boolean(doc.auto_generate_next),
      notes: doc.notes || "",
      lines,
      error: null,
    });
  },

  // unused — suppress lint
  _newTempId: newTempId,
}));

// Selector helper — computed: filteredLines
export function getFilteredLines(
  lines: LineDraft[],
  variant: FormVariant,
  search: string,
  sortConfig: SortConfig | null,
): LineDraft[] {
  if (variant !== "purchase") return lines;
  let result = [...lines];
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (line) =>
        (line.item_code || "").toLowerCase().includes(q) ||
        (line.item_name || "").toLowerCase().includes(q) ||
        (line.description || "").toLowerCase().includes(q) ||
        String(line.qty || "").includes(q) ||
        String(line.unit_price || "").includes(q),
    );
  }
  if (sortConfig) {
    const { key, direction } = sortConfig;
    result.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";
      if (key === "item_code") {
        aVal = a.item_code || "";
        bVal = b.item_code || "";
      }
      if (key === "item_name") {
        aVal = a.item_name || a.description || "";
        bVal = b.item_name || b.description || "";
      }
      if (key === "qty") {
        aVal = Number(a.qty || 0);
        bVal = Number(b.qty || 0);
      }
      if (key === "unit_price") {
        aVal = Number(a.unit_price || 0);
        bVal = Number(b.unit_price || 0);
      }
      if (key === "amount") {
        aVal = Number(a.amount || 0);
        bVal = Number(b.amount || 0);
      }
      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }
  return result;
}
