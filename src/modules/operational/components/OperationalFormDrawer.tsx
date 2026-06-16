// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useMemo, useState, useRef } from "react";
import { Combobox } from "@/shared/components/Combobox";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DrawerAction,
  DrawerField,
  DrawerModal,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { PurchaseReceiptHistory } from "./PurchaseReceiptHistory";
import { Skeleton } from "@/shared/components/Skeleton";
import { SearchInput } from "@/shared/components/SearchInput";
import {
  DocumentLineTable,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type DocumentLineTableColumn,
} from "@/shared/components/DocumentLineTable";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DatePicker } from "@/shared/components/DatePicker";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Trash2, Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/shared/utils";
import {
  getBusinessPartnersPagedApi,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type BusinessPartner,
} from "@/modules/partners/api/partnerApi";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type ErpInventoryItem } from "@/modules/inventory-core/api/inventoryCoreApi";
import { basicMastersApi } from "@/modules/basic-masters/api/basicMastersApi";
import {
  operationalApi,
  type CreateOperationalPayload,
  type OperationalDocument,
  type OperationalVariant,
  type OperationalLine,
} from "../api/operationalApi";
import { purchaseOrdersCoreApi } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { extractApiError } from "@/shared/utils/apiError";
import { useT } from "@/core/i18n";
import { Button } from "@/shared/components/ui/Button";
import { type ErpPoReceipt } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";

import { today } from "@/shared/utils/format";
import {
  invoiceOptions,
  salesStatusOptions,
  purchaseStatusOptions,
  expenseStatusOptions,
  recurrenceOptions,
  lineTypeOptions,
  newTempId,
} from "../utils/operationalHelpers";

interface LineDraft {
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

interface Props {
  variant: Extract<OperationalVariant, "sales" | "purchase" | "expenses">;
  open: boolean;
  loading?: boolean;
  editing: OperationalDocument | null;
  viewOnly?: boolean;
  poReceipts?: ErpPoReceipt[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
  onToggleEdit?: () => void;
}

const variantTitle: Record<Props["variant"], string> = {
  sales: "Bán hàng / Đơn sửa xe",
  purchase: "Mua hàng",
  expenses: "Chi phí vận hành",
};

function emptyLine(variant: Props["variant"]): LineDraft {
  return {
    tempId: newTempId(),
    line_type: variant === "expenses" ? "EXPENSE" : "PART",
    inventory_item_id: "",
    item_code: "",
    item_name: "",
    description: "",
    qty: variant === "expenses" ? "1" : "1",
    unit_price: "0",
    amount: "0",
    notes: "",
  };
}

function toLineDraft(
  line: OperationalLine,
  variant: Props["variant"],
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

export function OperationalFormDrawer({
  variant,
  open,
  loading,
  editing,
  viewOnly,
  poReceipts,
  onClose,
  onSaved,
  onToggleEdit,
}: Props) {
  const t = useT();
  const purchaseStatusValue = (editing?.status || "DRAFT") as string;
  const isPurchaseStatusOnlyMode =
    variant === "purchase" &&
    !!editing &&
    !viewOnly &&
    ["CONFIRMED", "PARTIAL_RECEIVED"].includes(purchaseStatusValue);
  const isPurchaseFullyLocked =
    variant === "purchase" &&
    !!editing &&
    !viewOnly &&
    ["RECEIVED", "FULLY_RECEIVED", "CANCELLED"].includes(purchaseStatusValue);
  const isPurchaseLocked =
    viewOnly || isPurchaseStatusOnlyMode || isPurchaseFullyLocked;
  const isPurchaseHeaderEditableAfterConfirm =
    variant === "purchase" &&
    !!editing &&
    !viewOnly &&
    isPurchaseStatusOnlyMode;
  const purchaseFieldLocked = (
    field: "description" | "qty" | "expectedDate" | "status" | "poNo",
  ) => {
    if (!isPurchaseLocked) return false;
    if (!isPurchaseHeaderEditableAfterConfirm) return true;
    return !["description", "qty", "expectedDate", "status", "poNo"].includes(
      field,
    );
  };
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branchOptions, setBranchOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [partnerOptions, setPartnerOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [inventoryItemOptions, setInventoryItemOptions] = useState<
    Array<{
      value: string;
      label: string;
      sku: string;
      itemName: string;
      itemType?: string;
      note?: string;
    }>
  >([]);
  const purchaseInventoryOptions = useMemo(() => {
    if (variant !== "purchase") return inventoryItemOptions;
    const fallbackOptions = (editing?.lines || [])
      .filter((line) => line.inventory_item_id)
      .map((line, idx) => {
        const id = line.inventory_item_id as string;
        const existing = inventoryItemOptions.find((item) => item.value === id);
        if (existing) return existing;
        const fallbackName =
          line.item_name?.trim() ||
          line.description?.trim() ||
          line.item_code?.trim() ||
          `Linh kiện #${idx + 1}`;
        const fallbackSku = line.item_code?.trim() || "";
        return {
          value: id,
          label: fallbackName,
          searchText: `${fallbackSku} ${fallbackName}`,
          sku: fallbackSku,
          itemName: fallbackName,
          itemType: line.line_type,
          note: line.description || "",
        };
      });
    return [
      ...inventoryItemOptions,
      ...fallbackOptions.filter(
        (opt) => !inventoryItemOptions.some((item) => item.value === opt.value),
      ),
    ];
  }, [variant, inventoryItemOptions, editing]);

  const [showGeneralInfo, setShowGeneralInfo] = useState(true);

  const [docNo, setDocNo] = useState("");
  const [branchId, setBranchId] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [partnerNameSnapshot, setPartnerNameSnapshot] = useState("");
  const [title, setTitle] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleVin, setVehicleVin] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [serviceAdvisorName, setServiceAdvisorName] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [documentDate, setDocumentDate] = useState(today());
  const [expectedDate, setExpectedDate] = useState("");
  const [submittingStatus, setSubmittingStatus] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState("NO_INVOICE");
  const [status, setStatus] = useState("DRAFT");
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [recurrenceType, setRecurrenceType] = useState("ONE_TIME");
  const [recurrenceInterval, setRecurrenceInterval] = useState("1");
  const [recurrenceStartDate, setRecurrenceStartDate] = useState("");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [autoGenerateNext, setAutoGenerateNext] = useState(false);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([emptyLine(variant)]);
  const [detailSearch, setDetailSearch] = useState("");
  const [detailSortConfig, setDetailSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const handleDetailSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";
    if (detailSortConfig?.key === key) {
      if (detailSortConfig.direction === "asc") direction = "desc";
      else direction = null;
    }
    setDetailSortConfig(direction ? { key, direction } : null);
  };

  const filteredLines = useMemo(() => {
    let result = [...lines];
    if (variant !== "purchase") return result;

    if (detailSearch) {
      const q = detailSearch.toLowerCase();
      result = result.filter(
        (line) =>
          (line.item_code || "").toLowerCase().includes(q) ||
          (line.item_name || "").toLowerCase().includes(q) ||
          (line.description || "").toLowerCase().includes(q) ||
          String(line.qty || "").includes(q) ||
          String(line.unit_price || "").includes(q),
      );
    }
    if (detailSortConfig) {
      const { key, direction } = detailSortConfig;
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
  }, [lines, variant, detailSearch, detailSortConfig]);

  const statusOptions = useMemo(() => {
    if (variant === "sales") return salesStatusOptions;
    if (variant === "purchase") return purchaseStatusOptions;
    return expenseStatusOptions;
  }, [variant]);

  useEffect(() => {
    if (!open) return;
    getBranchesApi()
      .then((branches) => {
        setBranchOptions(
          (branches ?? []).map((branch) => ({
            value: branch.id,
            label: branch.code
              ? `${branch.code} — ${branch.name}`
              : branch.name,
          })),
        );
      })
      .catch(() => setBranchOptions([]));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const partnerRole = variant === "sales" ? "CUSTOMER" : "VENDOR";
    getBusinessPartnersPagedApi({
      page: 1,
      pageSize: 200,
      partnerType: partnerRole,
    })
      .then((res) => {
        setPartnerOptions(
          (res.items || [])
            .filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (p: any) => p.status !== "INACTIVE" && p.is_active !== false,
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((p: any) => ({
              value: p.id,
              label: p.code ? `${p.code} — ${p.name}` : p.name,
            })),
        );
      })
      .catch(() => setPartnerOptions([]));
  }, [variant, open]);

  useEffect(() => {
    if (!open) return;
    if (variant !== "purchase" || viewOnly) {
      setInventoryItemOptions([]);
      return;
    }
    basicMastersApi
      .list({ limit: 200, entities: "inventoryItems" })
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const options = (res.items.inventoryItems || []).map((item: any) => ({
          value: item.id,
          label: item.itemName || "(Chưa có tên)",
          searchText: `${item.sku} ${item.itemName}`,
          sku: item.sku,
          itemName: item.itemName,
          itemType: item.itemType,
          note: "",
        }));
        setInventoryItemOptions(options);
      })
      .catch(() => setInventoryItemOptions([]));
  }, [variant, open, viewOnly]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (!editing) {
      setDocNo("");
      setBranchId("");
      setPartnerId("");
      setPartnerNameSnapshot("");
      setTitle("");
      setVehiclePlate("");
      setVehicleVin("");
      setVehicleModel("");
      setServiceAdvisorName("");
      setExpenseCategory("");
      setDocumentDate(today());
      setExpectedDate("");
      setDueDate("");
      setInvoiceStatus("NO_INVOICE");
      setStatus("DRAFT");
      setPaymentStatus("UNPAID");
      setRecurrenceType("ONE_TIME");
      setRecurrenceInterval("1");
      setRecurrenceStartDate("");
      setRecurrenceEndDate("");
      setNextDueDate("");
      setAutoGenerateNext(false);
      setNotes("");
      setLines([emptyLine(variant)]);
      // Auto-fill số PO tiếp theo khi tạo mới purchase
      if (variant === "purchase") {
        void purchaseOrdersCoreApi
          .nextNo()
          .then((no) => {
            setDocNo(no);
          })
          .catch(() => {
            /* silent — user nhập tay */
          });
      }
      return;
    }

    setDocNo(
      editing.order_no || editing.purchase_no || editing.expense_no || "",
    );
    setBranchId(editing.branch_id || "");
    setPartnerId(
      variant === "sales"
        ? editing.customer_id || ""
        : editing.supplier_id || "",
    );
    setPartnerNameSnapshot(
      editing.customer_name_snapshot || editing.supplier_name_snapshot || "",
    );
    setTitle(editing.title || "");
    setVehiclePlate(editing.vehicle_plate || "");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setVehicleVin((editing as any).vehicle_vin || "");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setVehicleModel((editing as any).vehicle_model || "");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setServiceAdvisorName((editing as any).service_advisor_name || "");
    setExpenseCategory(editing.expense_category || "");
    setDocumentDate((editing.document_date || today()).slice(0, 16));
    setExpectedDate(
      (
        (editing as any).expected_delivery_date || // eslint-disable-line @typescript-eslint/no-explicit-any
        (editing as any).expected_receipt_date || // eslint-disable-line @typescript-eslint/no-explicit-any
        ""
      ).slice(0, 16),
    );
    setDueDate((editing.due_date || "").slice(0, 10));
    setInvoiceStatus(editing.invoice_status || "NO_INVOICE");
    setStatus(editing.status || "DRAFT");
    setPaymentStatus(editing.payment_status || "UNPAID");
    setRecurrenceType(editing.recurrence_type || "ONE_TIME");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setRecurrenceInterval(String((editing as any).recurrence_interval ?? 1));
    setRecurrenceStartDate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      String((editing as any).recurrence_start_date || "").slice(0, 10),
    );
    setRecurrenceEndDate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      String((editing as any).recurrence_end_date || "").slice(0, 10),
    );
    setNextDueDate(String(editing.next_due_date || "").slice(0, 10));
    setAutoGenerateNext(Boolean(editing.auto_generate_next));
    setNotes(editing.notes || "");
    setLines(
      editing.lines?.length
        ? editing.lines.map((line) => toLineDraft(line, variant))
        : [emptyLine(variant)],
    );
  }, [open, editing, variant]);

  const totalAmount = useMemo(() => {
    return lines.reduce((sum, line) => sum + Number(line.amount || 0), 0);
  }, [lines]);

  const filteredTotalAmount = useMemo(() => {
    return filteredLines.reduce(
      (sum, line) => sum + Number(line.amount || 0),
      0,
    );
  }, [filteredLines]);

  function setLine<K extends keyof LineDraft>(
    tempId: string,
    key: K,
    value: LineDraft[K],
  ) {
    setLines((prev) =>
      prev.map((line) => {
        if (line.tempId !== tempId) return line;
        const next = { ...line, [key]: value };
        const qty = Number(next.qty || 0);
        const unit = Number(next.unit_price || 0);
        if (key === "qty" || key === "unit_price") {
          next.amount = String(qty * unit);
        }
        return next;
      }),
    );
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine(variant)]);
  }

  function removeLine(tempId: string) {
    setLines((prev) => {
      const next = prev.filter((line) => line.tempId !== tempId);
      return next.length ? next : [emptyLine(variant)];
    });
  }

  async function handleSubmit(overrideStatus?: string) {
    if (!documentDate) {
      setError("Ngày chứng từ là bắt buộc.");
      return;
    }
    if (variant === "sales" && !partnerId && !partnerNameSnapshot.trim()) {
      setError("Vui lòng chọn khách hàng hoặc nhập tên snapshot.");
      return;
    }
    if ((variant === "purchase" || variant === "expenses") && !partnerId) {
      setError("Vui lòng chọn nhà cung cấp.");
      return;
    }
    if (!lines.length) {
      setError("Phải có ít nhất 1 dòng chứng từ.");
      return;
    }

    const purchaseEditableLines =
      variant === "purchase"
        ? lines.map((line, idx) => ({
            line_no: idx + 1,
            line_type: line.line_type || undefined,
            inventory_item_id: line.inventory_item_id || undefined,
            item_code: line.item_code.trim() || undefined,
            item_name: line.item_name.trim() || undefined,
            description: line.description.trim() || undefined,
            qty: Number(line.qty || 0),
            unit_price: Number(line.unit_price || 0),
            amount: Number(line.amount || 0),
            notes: line.notes.trim() || undefined,
          }))
        : undefined;

    const payload: CreateOperationalPayload = isPurchaseStatusOnlyMode
      ? {
          status: overrideStatus || status,
          payment_status: paymentStatus,
          notes: notes.trim() || undefined,
          ...(purchaseEditableLines ? { lines: purchaseEditableLines } : {}),
        }
      : isPurchaseFullyLocked
        ? {
            payment_status: paymentStatus,
            notes: notes.trim() || undefined,
          }
        : {
            document_date: documentDate,
            due_date: dueDate || undefined,
            branch_id: branchId || undefined,
            invoice_status: invoiceStatus,
            status: overrideStatus || status,
            payment_status: paymentStatus,
            total_amount: totalAmount,
            notes: notes.trim() || undefined,
            lines: lines.map((line, idx) => ({
              line_no: idx + 1,
              line_type: line.line_type || undefined,
              inventory_item_id: line.inventory_item_id || undefined,
              item_code: line.item_code.trim() || undefined,
              item_name: line.item_name.trim() || undefined,
              description: line.description.trim() || undefined,
              qty: Number(line.qty || 0),
              unit_price: Number(line.unit_price || 0),
              amount: Number(line.amount || 0),
              notes: line.notes.trim() || undefined,
            })),
          };

    if (variant === "sales") {
      Object.assign(payload, {
        order_no: docNo || undefined,
        customer_id: partnerId || undefined,
        customer_name_snapshot: partnerNameSnapshot.trim() || undefined,
        vehicle_plate: vehiclePlate.trim() || undefined,
        vehicle_vin: vehicleVin.trim() || undefined,
        vehicle_model: vehicleModel.trim() || undefined,
        service_advisor_name: serviceAdvisorName.trim() || undefined,
        expected_delivery_date: expectedDate || undefined,
        source_system: "ERP",
      });
    }

    if (variant === "purchase") {
      Object.assign(payload, {
        purchase_no: docNo || undefined,
        supplier_id: partnerId || undefined,
        supplier_name_snapshot: partnerNameSnapshot.trim() || undefined,
        expected_receipt_date: expectedDate || undefined,
        recurrence_type: recurrenceType,
        recurrence_interval: Number(recurrenceInterval || 1),
        recurrence_start_date: recurrenceStartDate || undefined,
        recurrence_end_date: recurrenceEndDate || undefined,
        next_due_date: nextDueDate || undefined,
        auto_generate_next: autoGenerateNext,
      });
    }

    if (variant === "expenses") {
      Object.assign(payload, {
        expense_no: docNo || undefined,
        supplier_id: partnerId || undefined,
        supplier_name_snapshot: partnerNameSnapshot.trim() || undefined,
        title: title.trim() || undefined,
        expense_category: expenseCategory.trim() || undefined,
        recurrence_type: recurrenceType,
        recurrence_interval: Number(recurrenceInterval || 1),
        recurrence_start_date: recurrenceStartDate || undefined,
        recurrence_end_date: recurrenceEndDate || undefined,
        next_due_date: nextDueDate || undefined,
        auto_generate_next: autoGenerateNext,
      });
    }

    setSubmittingStatus(overrideStatus || null);
    setSaving(true);
    setError(null);
    try {
      if (variant === "sales") {
        if (editing) await operationalApi.updateSales(editing.id, payload);
        else await operationalApi.createSales(payload);
      } else if (variant === "purchase") {
        if (editing) await operationalApi.updatePurchase(editing.id, payload);
        else await operationalApi.createPurchase(payload);
      } else {
        if (editing) await operationalApi.updateExpense(editing.id, payload);
        else await operationalApi.createExpense(payload);
      }
      await onSaved();
      onClose();
    } catch (e) {
      setError(extractApiError(e, "Không thể lưu chứng từ."));
    } finally {
      setSubmittingStatus(null);
      setSaving(false);
    }
  }

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      headerExtra={
        viewOnly && onToggleEdit ? (
          <Button variant="secondary" size="sm" onClick={onToggleEdit}>
            Chỉnh sửa
          </Button>
        ) : undefined
      }
      panelClassName={
        variant === "purchase"
          ? "min-[1024px]:min-w-[1400px]"
          : "min-[1024px]:min-w-[920px]"
      }
      title={
        viewOnly
          ? t(`Chi tiết ${variantTitle[variant]}`)
          : editing
            ? t(`Cập nhật ${variantTitle[variant]}`)
            : t(`Tạo mới ${variantTitle[variant]}`)
      }
      titleExtra={
        status === "DRAFT" && (
          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
            {t("Nháp")}
          </span>
        )
      }
      subtitle={
        editing
          ? `${t("Mã")}: ${docNo || editing.id}`
          : t("Nhập thông tin chứng từ")
      }
      actions={
        viewOnly || loading
          ? [
              {
                label: t("Đóng"),
                onClick: onClose,
                variant: "outline",
                disabled: loading,
              },
            ]
          : variant === "purchase"
            ? status === "DRAFT" || !editing
              ? [
                  {
                    label: t("Hủy"),
                    onClick: onClose,
                    variant: "outline" as const,
                    disabled: saving,
                  },
                  {
                    label: editing ? t("Lưu Nháp") : t("Tạo Nháp"),
                    variant: "outline" as const,
                    loading: saving && submittingStatus === "DRAFT",
                    disabled: saving,
                    onClick: () => handleSubmit("DRAFT"),
                  },
                  {
                    label: editing ? t("Xác nhận") : t("Tạo Mới"),
                    primary: true,
                    loading: saving && submittingStatus === "CONFIRMED",
                    disabled: saving,
                    onClick: () => handleSubmit("CONFIRMED"),
                  },
                ]
              : [
                  {
                    label: t("Hủy"),
                    onClick: onClose,
                    variant: "outline" as const,
                    disabled: saving,
                  },
                  {
                    label: t("Lưu thay đổi"),
                    primary: true,
                    loading: saving,
                    disabled: saving,
                    onClick: () => handleSubmit(),
                  },
                ]
            : [
                {
                  label: t("Hủy"),
                  onClick: onClose,
                  variant: "outline" as const,
                  disabled: saving,
                },
                {
                  label: editing ? t("Lưu thay đổi") : t("Tạo mới"),
                  primary: true,
                  loading: saving,
                  disabled: saving,
                  onClick: () => handleSubmit(),
                },
              ]
      }
    >
      {loading ? (
        <div className="flex flex-col xl:flex-row gap-6 items-start w-full max-w-full">
          <div className="flex-1 min-w-0 w-full order-2 xl:order-1 space-y-4">
            <DrawerSection title={t("Chi tiết")}>
              <div className="space-y-3">
                <Skeleton className="h-[52px] w-full" />
                <Skeleton className="h-[52px] w-full" />
                <Skeleton className="h-[52px] w-full" />
              </div>
            </DrawerSection>
          </div>
          <div className="w-full xl:w-[320px] shrink-0 order-1 xl:order-2 space-y-4">
            <DrawerSection title={t("Thông tin chung")}>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </DrawerSection>
          </div>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6 items-start w-full max-w-full">
          {/* Cột trái (4/5): Dòng chứng từ & Lịch sử nhập kho */}
          <div className="flex-1 min-w-0 w-full order-2 xl:order-1 space-y-4">
            <DrawerSection
              title={
                variant === "purchase" ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:justify-between pr-4 mt-2 sm:mt-0">
                    <span className="shrink-0 mb-2 sm:mb-0">
                      {t("Chi tiết")} (
                      {detailSearch
                        ? `${filteredLines.length}/${lines.length}`
                        : lines.length}
                      )
                    </span>
                    <div className="w-full sm:w-64 relative font-normal text-sm">
                      <SearchInput
                        className="w-full"
                        placeholder={t("Tìm mã/tên, SL...")}
                        value={detailSearch}
                        onChange={setDetailSearch}
                      />
                    </div>
                  </div>
                ) : (
                  `${t("Chi tiết")} (${lines.length})`
                )
              }
              titleExtra={
                <span className="text-foreground font-semibold shrink-0">
                  {t("Tổng")}:{" "}
                  {Number(
                    variant === "purchase" ? filteredTotalAmount : totalAmount,
                  ).toLocaleString("vi-VN")}{" "}
                  VND
                </span>
              }
            >
              <DocumentLineTable
                columns={[
                  {
                    key: "index",
                    header: "#",
                    width: 40,
                    align: "center",
                    cell: (_, idx) => (
                      <span className="text-muted-foreground">{idx + 1}</span>
                    ),
                  },
                  ...(variant === "purchase"
                    ? [
                        {
                          key: "item_code",
                          header: t("Mã linh kiện"),
                          minWidth: 140,
                          sortable: true,
                          cell: (line: LineDraft) => line.item_code || "—",
                        },
                      ]
                    : []),
                  {
                    key: "item_name",
                    header: t("Linh kiện / Tên hàng"),
                    minWidth: 160,
                    width: 180,
                    sortable: true,
                    cell: (line: LineDraft) => {
                      return variant === "purchase" ? (
                        <Combobox
                          options={purchaseInventoryOptions}
                          value={line.inventory_item_id}
                          readOnly={isPurchaseLocked}
                          onChange={(v) => {
                            const selected = purchaseInventoryOptions.find(
                              (item) => item.value === (v || ""),
                            );
                            setLines((prev) =>
                              prev.map((draft) =>
                                draft.tempId !== line.tempId
                                  ? draft
                                  : {
                                      ...draft,
                                      inventory_item_id: v || "",
                                      item_code: selected?.sku || "",
                                      item_name: selected?.itemName || "",
                                      description: selected
                                        ? selected.note || ""
                                        : draft.description,
                                      line_type: selected
                                        ? selected.itemType === "GOODS"
                                          ? "PRODUCT"
                                          : "PART"
                                        : draft.line_type,
                                    },
                              ),
                            );
                          }}
                          placeholder={t("Chọn linh kiện từ danh mục")}
                          searchPlaceholder={t("Tìm SKU / tên linh kiện...")}
                          emptyLabel={t("Không có linh kiện phù hợp")}
                          allowClear={false}
                        />
                      ) : (
                        <div className="space-y-2">
                          <Combobox
                            options={lineTypeOptions}
                            value={line.line_type}
                            disabled={isPurchaseLocked}
                            onChange={(v) =>
                              setLine(line.tempId, "line_type", v || "SERVICE")
                            }
                            allowClear={false}
                          />
                          <input
                            className={inputCls}
                            placeholder={t("Mã hàng/SKU")}
                            value={line.item_code}
                            disabled={isPurchaseLocked}
                            onChange={(e) =>
                              setLine(line.tempId, "item_code", e.target.value)
                            }
                          />
                          <input
                            className={inputCls}
                            placeholder={t("Tên hàng/dịch vụ")}
                            value={line.item_name}
                            disabled={isPurchaseLocked}
                            onChange={(e) =>
                              setLine(line.tempId, "item_name", e.target.value)
                            }
                          />
                        </div>
                      );
                    },
                  },
                  {
                    key: "qty",
                    header: t("Số lượng"),
                    minWidth: 140,
                    sortable: true,
                    cell: (line: LineDraft) => (
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className={inputCls}
                        value={line.qty}
                        disabled={purchaseFieldLocked("qty")}
                        onChange={(e) =>
                          setLine(line.tempId, "qty", e.target.value)
                        }
                      />
                    ),
                  },
                  {
                    key: "unit_price",
                    header: t("Đơn giá"),
                    minWidth: 180,
                    sortable: true,
                    cell: (line: LineDraft) => (
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className={inputCls}
                        value={line.unit_price}
                        disabled={isPurchaseLocked}
                        onChange={(e) =>
                          setLine(line.tempId, "unit_price", e.target.value)
                        }
                      />
                    ),
                  },
                  {
                    key: "amount",
                    header: t("Thành tiền"),
                    minWidth: 180,
                    sortable: true,
                    cell: (line: LineDraft) => (
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className={inputCls}
                        value={line.amount}
                        disabled={isPurchaseLocked}
                        onChange={(e) =>
                          setLine(line.tempId, "amount", e.target.value)
                        }
                      />
                    ),
                  },
                  {
                    key: "description",
                    header: t("Mô tả"),
                    minWidth: 240,
                    sortable: false,
                    cell: (line: LineDraft) => (
                      <input
                        className={inputCls}
                        value={line.description}
                        disabled={purchaseFieldLocked("description")}
                        onChange={(e) =>
                          setLine(line.tempId, "description", e.target.value)
                        }
                        placeholder={t("Nhập mô tả")}
                      />
                    ),
                  },
                ]}
                data={variant === "purchase" ? filteredLines : lines}
                getRowKey={(line) => line.tempId}
                sortConfig={
                  variant === "purchase" ? detailSortConfig : undefined
                }
                onSort={variant === "purchase" ? handleDetailSort : undefined}
                onAddLine={addLine}
                onRemoveLine={
                  lines.length > 1 && !isPurchaseLocked
                    ? (idx) => {
                        const targetId =
                          variant === "purchase"
                            ? filteredLines[idx].tempId
                            : lines[idx].tempId;
                        removeLine(targetId);
                      }
                    : undefined
                }
                disabled={isPurchaseLocked}
                viewOnly={viewOnly}
              />
            </DrawerSection>
          </div>

          {/* Cột phải (1/5): Thông tin chung */}
          <div
            className={cn(
              "shrink-0 order-1 xl:order-2 space-y-4 transition-all duration-300 xl:sticky xl:top-0",
              showGeneralInfo ? "w-full xl:w-[320px]" : "w-full xl:w-[52px]",
            )}
          >
            <DrawerSection
              title={
                <span
                  className={cn(
                    "transition-all duration-300 inline-block overflow-hidden whitespace-nowrap align-middle",
                    showGeneralInfo
                      ? "max-w-[200px] opacity-100"
                      : "max-w-0 opacity-0",
                  )}
                >
                  {t("Thông tin chung")}
                </span>
              }
              titleExtra={
                <button
                  type="button"
                  onClick={() => setShowGeneralInfo((s) => !s)}
                  className="p-1 -mr-1 rounded hover:bg-muted text-muted-foreground transition-colors"
                  title={showGeneralInfo ? t("Thu gọn") : t("Mở rộng")}
                >
                  {showGeneralInfo ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>
              }
            >
              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  showGeneralInfo ? "opacity-100" : "opacity-0",
                )}
                style={{ gridTemplateRows: showGeneralInfo ? "1fr" : "0fr" }}
              >
                <div
                  className="overflow-x-hidden overflow-y-auto w-full xl:max-h-[calc(100vh-190px)]"
                  style={{ scrollbarWidth: "none" }}
                >
                  <div className="flex flex-col gap-3 pt-1 min-w-[280px]">
                    <DrawerField label={t("Số chứng từ")}>
                      <input
                        className={inputCls}
                        value={docNo}
                        disabled={purchaseFieldLocked("poNo")}
                        placeholder={
                          variant === "purchase" ? "PO-YYYYMM001" : undefined
                        }
                        onChange={(e) => setDocNo(e.target.value)}
                      />
                    </DrawerField>
                    {variant !== "purchase" && (
                      <DrawerField label={t("Chi nhánh")}>
                        <Combobox
                          options={branchOptions}
                          value={branchId}
                          disabled={isPurchaseLocked}
                          onChange={(v) => setBranchId(v || "")}
                        />
                      </DrawerField>
                    )}
                    <DrawerField
                      label={
                        variant === "sales"
                          ? t("Khách hàng")
                          : t("Nhà cung cấp")
                      }
                      required={
                        variant === "purchase" || variant === "expenses"
                      }
                    >
                      <Combobox
                        options={partnerOptions}
                        value={partnerId}
                        disabled={isPurchaseLocked}
                        onChange={(v) => setPartnerId(v || "")}
                      />
                    </DrawerField>
                    {variant !== "purchase" && (
                      <DrawerField label={t("Tên snapshot")}>
                        <input
                          className={inputCls}
                          value={partnerNameSnapshot}
                          disabled={isPurchaseLocked}
                          onChange={(e) =>
                            setPartnerNameSnapshot(e.target.value)
                          }
                        />
                      </DrawerField>
                    )}
                    <DrawerField label={t("Ngày chứng từ")} required>
                      <DatePicker
                        className={inputCls}
                        value={documentDate?.slice(0, 10) || ""}
                        disabled={isPurchaseLocked}
                        onChange={(v) => setDocumentDate(v)}
                      />
                    </DrawerField>
                    {variant === "purchase" && (
                      <DrawerField label={t("Ngày nhận dự kiến")}>
                        <DatePicker
                          className={inputCls}
                          value={expectedDate?.slice(0, 10) || ""}
                          disabled={purchaseFieldLocked("expectedDate")}
                          onChange={(v) => setExpectedDate(v)}
                        />
                      </DrawerField>
                    )}
                    {variant !== "purchase" && (
                      <DrawerField label={t("Ngày đến hạn")}>
                        <DatePicker
                          className={inputCls}
                          value={dueDate?.slice(0, 10) || ""}
                          disabled={isPurchaseLocked}
                          onChange={(v) => setDueDate(v)}
                        />
                      </DrawerField>
                    )}
                    {variant !== "purchase" && (
                      <DrawerField label={t("Trạng thái hóa đơn")}>
                        <Combobox
                          options={invoiceOptions}
                          value={invoiceStatus}
                          disabled={isPurchaseLocked}
                          onChange={(v) => setInvoiceStatus(v || "NO_INVOICE")}
                          allowClear={false}
                        />
                      </DrawerField>
                    )}
                    {variant !== "purchase" && (
                      <DrawerField label={t("Trạng thái")}>
                        <Combobox
                          options={statusOptions}
                          value={status}
                          disabled={purchaseFieldLocked("status")}
                          onChange={(v) => setStatus(v || "DRAFT")}
                          allowClear={false}
                        />
                      </DrawerField>
                    )}

                    {/* T.thái thanh toán tạm ẩn theo yêu cầu */}

                    {variant === "sales" && (
                      <>
                        <DrawerField label={t("Biển số xe")}>
                          <input
                            className={inputCls}
                            value={vehiclePlate}
                            disabled={isPurchaseLocked}
                            onChange={(e) => setVehiclePlate(e.target.value)}
                          />
                        </DrawerField>
                        <DrawerField label="VIN">
                          <input
                            className={inputCls}
                            value={vehicleVin}
                            disabled={isPurchaseLocked}
                            onChange={(e) => setVehicleVin(e.target.value)}
                          />
                        </DrawerField>
                        <DrawerField label={t("Model xe")}>
                          <input
                            className={inputCls}
                            value={vehicleModel}
                            disabled={isPurchaseLocked}
                            onChange={(e) => setVehicleModel(e.target.value)}
                          />
                        </DrawerField>
                        <DrawerField label={t("Cố vấn dịch vụ")}>
                          <input
                            className={inputCls}
                            value={serviceAdvisorName}
                            disabled={isPurchaseLocked}
                            onChange={(e) =>
                              setServiceAdvisorName(e.target.value)
                            }
                          />
                        </DrawerField>
                        <DrawerField label={t("Ngày giao dự kiến")}>
                          <DatePicker
                            className={inputCls}
                            value={expectedDate?.slice(0, 10) || ""}
                            disabled={isPurchaseLocked}
                            onChange={(v) => setExpectedDate(v)}
                          />
                        </DrawerField>
                      </>
                    )}

                    {(variant === "purchase" || variant === "expenses") && (
                      <>
                        {variant === "expenses" && (
                          <>
                            <DrawerField label={t("Tiêu đề")}>
                              <input
                                className={inputCls}
                                value={title}
                                disabled={isPurchaseLocked}
                                onChange={(e) => setTitle(e.target.value)}
                              />
                            </DrawerField>
                            <DrawerField label={t("Nhóm chi phí")}>
                              <input
                                className={inputCls}
                                value={expenseCategory}
                                disabled={isPurchaseLocked}
                                onChange={(e) =>
                                  setExpenseCategory(e.target.value)
                                }
                                placeholder="VD: UTILITY"
                              />
                            </DrawerField>
                          </>
                        )}
                        {variant === "expenses" && (
                          <>
                            <DrawerField label={t("Chu kỳ")}>
                              <Combobox
                                options={recurrenceOptions}
                                value={recurrenceType}
                                disabled={isPurchaseLocked}
                                onChange={(v) =>
                                  setRecurrenceType(v || "ONE_TIME")
                                }
                                allowClear={false}
                              />
                            </DrawerField>
                            <DrawerField label={t("Khoảng lặp")}>
                              <input
                                type="number"
                                min={1}
                                className={inputCls}
                                value={recurrenceInterval}
                                disabled={isPurchaseLocked}
                                onChange={(e) =>
                                  setRecurrenceInterval(e.target.value)
                                }
                              />
                            </DrawerField>
                            <DrawerField label={t("Bắt đầu")}>
                              <input
                                type="date"
                                className={inputCls}
                                value={recurrenceStartDate}
                                disabled={isPurchaseLocked}
                                onChange={(e) =>
                                  setRecurrenceStartDate(e.target.value)
                                }
                              />
                            </DrawerField>
                            <DrawerField label={t("Kết thúc")}>
                              <input
                                type="date"
                                className={inputCls}
                                value={recurrenceEndDate}
                                disabled={isPurchaseLocked}
                                onChange={(e) =>
                                  setRecurrenceEndDate(e.target.value)
                                }
                              />
                            </DrawerField>
                            <DrawerField label={t("Kỳ tiếp theo")}>
                              <input
                                type="date"
                                className={inputCls}
                                value={nextDueDate}
                                disabled={isPurchaseLocked}
                                onChange={(e) => setNextDueDate(e.target.value)}
                              />
                            </DrawerField>
                            <DrawerField label={t("Tự sinh kỳ sau")}>
                              <Checkbox
                                checked={autoGenerateNext}
                                disabled={isPurchaseLocked}
                                onCheckedChange={(v) =>
                                  setAutoGenerateNext(!!v)
                                }
                              />
                            </DrawerField>
                          </>
                        )}
                      </>
                    )}

                    <DrawerField label={t("Ghi chú")}>
                      <textarea
                        className={`${inputCls} min-h-[84px]`}
                        value={notes}
                        disabled={viewOnly || isPurchaseFullyLocked}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </DrawerField>

                    {/* Lịch sử nhập kho (di chuyển vào đây) */}
                    {variant === "purchase" && viewOnly && poReceipts && (
                      <div className="mt-2 border-t border-border pt-4">
                        <PurchaseReceiptHistory receipts={poReceipts} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DrawerSection>
          </div>
        </div>
      )}

      {error && (
        <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2 mt-3">
          {error}
        </div>
      )}
    </DrawerModal>
  );
}
