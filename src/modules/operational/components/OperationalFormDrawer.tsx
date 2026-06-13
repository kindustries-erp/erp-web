import { useEffect, useMemo, useState } from "react";
import { Combobox } from "@/shared/components/Combobox";
import {
  DrawerField,
  DrawerModal,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DatePicker } from "@/shared/components/DatePicker";
import { Trash2, Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/shared/utils";
import {
  getBusinessPartnersPagedApi,
  type BusinessPartner,
} from "@/modules/partners/api/partnerApi";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import {
  inventoryCoreApi,
  type ErpInventoryItem,
} from "@/modules/inventory-core/api/inventoryCoreApi";
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

function fmtDate(value?: string | null) {
  if (!value) return "—";
  return value.slice(0, 10);
}

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

const invoiceOptions = [
  { value: "NO_INVOICE", label: "Chưa có hóa đơn" },
  { value: "HAS_INVOICE", label: "Đã có hóa đơn" },
  { value: "NOT_REQUIRED", label: "Không yêu cầu" },
];

const salesStatusOptions = [
  { value: "DRAFT", label: "Nháp" },
  { value: "CONFIRMED", label: "Xác nhận" },
  { value: "IN_PROGRESS", label: "Đang xử lý" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "CANCELLED", label: "Hủy" },
];

const purchaseStatusOptions = [
  { value: "DRAFT", label: "Nháp" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
];

const expenseStatusOptions = [
  { value: "DRAFT", label: "Nháp" },
  { value: "CONFIRMED", label: "Xác nhận" },
  { value: "CANCELLED", label: "Hủy" },
];

const recurrenceOptions = [
  { value: "ONE_TIME", label: "Một lần" },
  { value: "MONTHLY", label: "Hàng tháng" },
  { value: "QUARTERLY", label: "Hàng quý" },
  { value: "YEARLY", label: "Hàng năm" },
];

const lineTypeOptions = [
  { value: "SERVICE", label: "Dịch vụ" },
  { value: "PRODUCT", label: "Hàng hóa" },
  { value: "PART", label: "Phụ tùng" },
  { value: "EXPENSE", label: "Chi phí" },
];

const today = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
const newTempId = () =>
  `line-${Date.now()}-${Math.random().toString(36).slice(2)}`;

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
          label: fallbackSku
            ? `${fallbackSku} — ${fallbackName}`
            : fallbackName,
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
              (p: any) => p.status !== "INACTIVE" && p.is_active !== false,
            )
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
    if (variant !== "purchase") {
      setInventoryItemOptions([]);
      return;
    }
    inventoryCoreApi
      .list({ page: 1, pageSize: 200 })
      .then((res) => {
        const options = (res.items || []).map((item: ErpInventoryItem) => ({
          value: item.id,
          label: `${item.sku} — ${item.itemName}`,
          sku: item.sku,
          itemName: item.itemName,
          itemType: item.itemType,
          note: item.note || "",
        }));
        setInventoryItemOptions(options);
      })
      .catch(() => setInventoryItemOptions([]));
  }, [variant, open]);

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
    setVehicleVin((editing as any).vehicle_vin || "");
    setVehicleModel((editing as any).vehicle_model || "");
    setServiceAdvisorName((editing as any).service_advisor_name || "");
    setExpenseCategory(editing.expense_category || "");
    setDocumentDate((editing.document_date || today()).slice(0, 16));
    setExpectedDate(
      (
        (editing as any).expected_delivery_date ||
        (editing as any).expected_receipt_date ||
        ""
      ).slice(0, 16),
    );
    setDueDate((editing.due_date || "").slice(0, 10));
    setInvoiceStatus(editing.invoice_status || "NO_INVOICE");
    setStatus(editing.status || "DRAFT");
    setPaymentStatus(editing.payment_status || "UNPAID");
    setRecurrenceType(editing.recurrence_type || "ONE_TIME");
    setRecurrenceInterval(String((editing as any).recurrence_interval ?? 1));
    setRecurrenceStartDate(
      String((editing as any).recurrence_start_date || "").slice(0, 10),
    );
    setRecurrenceEndDate(
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

  function setLine<K extends keyof LineDraft>(
    idx: number,
    key: K,
    value: LineDraft[K],
  ) {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== idx) return line;
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

  function removeLine(idx: number) {
    setLines((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length ? next : [emptyLine(variant)];
    });
  }

  async function handleSubmit() {
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
          status,
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
            status,
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
          ? "min-[1024px]:min-w-[1120px]"
          : "min-[1024px]:min-w-[920px]"
      }
      title={
        viewOnly
          ? t(`Chi tiết ${variantTitle[variant]}`)
          : editing
            ? t(`Cập nhật ${variantTitle[variant]}`)
            : t(`Tạo mới ${variantTitle[variant]}`)
      }
      subtitle={
        editing
          ? `${t("Mã")}: ${docNo || editing.id}`
          : t("Nhập thông tin chứng từ")
      }
      actions={
        viewOnly
          ? [{ label: t("Đóng"), onClick: onClose, variant: "outline" }]
          : [
              { label: t("Hủy"), onClick: onClose, variant: "outline" },
              {
                label: editing ? t("Lưu thay đổi") : t("Tạo mới"),
                primary: true,
                loading: saving,
                disabled: saving,
                onClick: handleSubmit,
              },
            ]
      }
    >
      {/* 4/5 và 1/5 split */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Cột trái (4/5): Dòng chứng từ & Lịch sử nhập kho */}
        <div className="flex-1 min-w-0 order-2 xl:order-1 space-y-4">
          <DrawerSection
            title={t("Chi tiết")}
            titleExtra={
              <span className="text-foreground font-semibold">
                {t("Tổng")}: {Number(totalAmount || 0).toLocaleString("vi-VN")}{" "}
                VND
              </span>
            }
          >
            <div className="w-full overflow-x-auto rounded-lg border border-[color:var(--border)]">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="px-3 py-2 font-medium w-10 text-center shrink-0">
                      #
                    </th>
                    <th className="px-3 py-2 font-medium min-w-[260px]">
                      {t("Linh kiện / Tên hàng")}
                    </th>
                    <th className="px-3 py-2 font-medium min-w-[140px]">
                      {t("Số lượng")}
                    </th>
                    <th className="px-3 py-2 font-medium min-w-[180px]">
                      {t("Đơn giá")}
                    </th>
                    <th className="px-3 py-2 font-medium min-w-[180px]">
                      {t("Thành tiền")}
                    </th>
                    <th className="px-3 py-2 font-medium min-w-[240px]">
                      {t("Mô tả")}
                    </th>
                    {!viewOnly && (
                      <th className="px-3 py-2 font-medium w-12 text-center"></th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-background">
                  {lines.map((line, idx) => (
                    <tr key={line.tempId} className="group hover:bg-muted/30">
                      <td className="px-3 py-3 text-center text-muted-foreground align-top mt-2">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {variant === "purchase" ? (
                          <Combobox
                            options={purchaseInventoryOptions}
                            value={line.inventory_item_id}
                            readOnly={isPurchaseLocked}
                            onChange={(v) => {
                              const selected = purchaseInventoryOptions.find(
                                (item) => item.value === (v || ""),
                              );
                              setLines((prev) =>
                                prev.map((draft, i) =>
                                  i !== idx
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
                                setLine(idx, "line_type", v || "SERVICE")
                              }
                              allowClear={false}
                            />
                            <input
                              className={inputCls}
                              placeholder={t("Mã hàng/SKU")}
                              value={line.item_code}
                              disabled={isPurchaseLocked}
                              onChange={(e) =>
                                setLine(idx, "item_code", e.target.value)
                              }
                            />
                            <input
                              className={inputCls}
                              placeholder={t("Tên hàng/dịch vụ")}
                              value={line.item_name}
                              disabled={isPurchaseLocked}
                              onChange={(e) =>
                                setLine(idx, "item_name", e.target.value)
                              }
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className={inputCls}
                          value={line.qty}
                          disabled={purchaseFieldLocked("qty")}
                          onChange={(e) => setLine(idx, "qty", e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className={inputCls}
                          value={line.unit_price}
                          disabled={isPurchaseLocked}
                          onChange={(e) =>
                            setLine(idx, "unit_price", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className={inputCls}
                          value={line.amount}
                          disabled={isPurchaseLocked}
                          onChange={(e) =>
                            setLine(idx, "amount", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          className={inputCls}
                          value={line.description}
                          disabled={purchaseFieldLocked("description")}
                          onChange={(e) =>
                            setLine(idx, "description", e.target.value)
                          }
                          placeholder={t("Nhập mô tả")}
                        />
                      </td>
                      {!viewOnly && (
                        <td className="px-3 py-2 align-top text-center">
                          {lines.length > 1 && !isPurchaseLocked && (
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors mt-1"
                              disabled={isPurchaseLocked}
                              onClick={() => removeLine(idx)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {!viewOnly && !isPurchaseLocked && (
                <div className="p-3 border-t border-border bg-muted/10">
                  <button
                    type="button"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground bg-background hover:bg-muted border border-border px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors w-fit shadow-sm"
                    disabled={isPurchaseLocked}
                    onClick={addLine}
                  >
                    <Plus className="w-4 h-4" />
                    {t("Thêm dòng")}
                  </button>
                </div>
              )}
            </div>
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
                      variant === "sales" ? t("Khách hàng") : t("Nhà cung cấp")
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
                        onChange={(e) => setPartnerNameSnapshot(e.target.value)}
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
                  <DrawerField label={t("Trạng thái")}>
                    <Combobox
                      options={statusOptions}
                      value={status}
                      disabled={purchaseFieldLocked("status")}
                      onChange={(v) => setStatus(v || "DRAFT")}
                      allowClear={false}
                    />
                  </DrawerField>

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
                              onCheckedChange={(v) => setAutoGenerateNext(!!v)}
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
                      <div className="text-[11px] font-bold text-foreground/80 uppercase tracking-[0.06em] mb-3">
                        {t("Lịch sử nhập kho")}
                      </div>
                      {poReceipts.length ? (
                        <div className="space-y-3">
                          {poReceipts.map((receipt) => (
                            <div
                              key={receipt.id}
                              className="rounded-xl border border-border p-3 text-sm bg-muted/10"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="font-medium">
                                  {receipt.receiptNo}
                                </div>
                                <div className="text-xs text-[color:var(--muted-fg)]">
                                  {fmtDate(receipt.receiptDate)} ·{" "}
                                  {receipt.status || "—"}
                                </div>
                              </div>
                              {receipt.remarks ? (
                                <div className="mt-1 text-xs text-[color:var(--muted-fg)]">
                                  {receipt.remarks}
                                </div>
                              ) : null}
                              <div className="mt-2 space-y-1">
                                {(receipt.lines || []).map((line, idx) => (
                                  <div
                                    key={line.id || `${receipt.id}-${idx}`}
                                    className="text-xs text-[color:var(--muted-fg)]"
                                  >
                                    {t("Mục")} {line.lineNo || idx + 1}:{" "}
                                    {t("nhận")}{" "}
                                    {Number(
                                      line.qtyReceived || 0,
                                    ).toLocaleString("vi-VN")}{" "}
                                    {t("đơn vị")}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-[color:var(--muted-fg)]">
                          {t("Chưa có lần nhập kho nào cho PO này.")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DrawerSection>
        </div>
      </div>

      {error && (
        <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2 mt-3">
          {error}
        </div>
      )}
    </DrawerModal>
  );
}
