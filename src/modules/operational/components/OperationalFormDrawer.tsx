import { useEffect, useMemo } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
import { useT } from "@/core/i18n";
import {
  operationalApi,
  type CreateOperationalPayload,
  type OperationalDocument,
  type OperationalVariant,
} from "@/modules/operational/api/operationalApi";
import { purchaseOrdersCoreApi } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { type ErpPoReceipt } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { getBusinessPartnersPagedApi } from "@/modules/partners/api/partnerApi";
import { basicMastersApi } from "@/modules/basic-masters/api/basicMastersApi";
import { extractApiError } from "@/shared/utils/apiError";
import { useOperationalFormStore } from "@/modules/operational/hooks/useOperationalFormStore";
import {} from "@/modules/operational/components/form/FormLoadingSkeleton";
import { FormLineDetailPanel } from "@/modules/operational/components/form/FormLineDetailPanel";
import { FormGeneralInfoPanel } from "@/modules/operational/components/form/FormGeneralInfoPanel";
import type { FormVariant } from "@/modules/operational/utils/operationalHelpers";

// ---------------------------------------------------------------------------
// Variant title map
// ---------------------------------------------------------------------------
const variantTitle: Record<FormVariant, string> = {
  sales: "Bán hàng / Đơn sửa xe",
  purchase: "Mua hàng",
  expenses: "Chi phí vận hành",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
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
  const store = useOperationalFormStore();
  const {
    docNo,
    status,
    saving,
    error,
    submittingStatus,
    branchOptions,
    partnerOptions,
    inventoryItemOptions,
    lines,
    initNew,
    initFromDoc,
    setBranchOptions,
    setPartnerOptions,
    setInventoryItemOptions,
    setSupplierInvoiceOptions,
    setSaving,
    setError,
    setSubmittingStatus,
  } = store;

  // -------------------------------------------------------------------------
  // Lock logic (purchase workflow states)
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // Load options
  // -------------------------------------------------------------------------
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
      pageSize: 500,
      partnerType: partnerRole,
    })
      .then((res) => {
        setPartnerOptions(
          (res.items || [])
            .filter(
              (p: { status?: string; is_active?: boolean }) =>
                p.status !== "INACTIVE" && p.is_active !== false,
            )
            .map((p: { id: string; code?: string; name: string }) => ({
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
    if (variant !== "purchase" || viewOnly) {
      setSupplierInvoiceOptions([]);
      return;
    }
    basicMastersApi
      .list({ limit: 200, entities: "erpInvoices" })
      .then((res) => {
        const options = (res.items.erpInvoices || [])
          .filter((inv) => inv.direction === "IN") // Only Hóa đơn đầu vào
          .map((inv) => ({
            value: inv.invoiceNo,
            label: `${inv.invoiceNo} — ${inv.invoiceDate.slice(0, 10)}${inv.sellerName ? ` — ${inv.sellerName}` : ""}`,
          }));
        setSupplierInvoiceOptions(options);
      })
      .catch(() => setSupplierInvoiceOptions([]));
  }, [variant, open, viewOnly]);

  // -------------------------------------------------------------------------
  // Init form khi open / editing thay đổi
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (!editing) {
      initNew(variant as FormVariant);
      if (variant === "purchase") {
        void purchaseOrdersCoreApi
          .nextNo()
          .then((no) => store.setDocNo(no))
          .catch(() => {
            /* silent */
          });
      }
      return;
    }
    initFromDoc(editing, variant as FormVariant);
  }, [open, editing, variant]);

  // -------------------------------------------------------------------------
  // Inventory options với fallback cho purchase
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  async function handleSubmit(overrideStatus?: string) {
    if (!store.documentDate) {
      setError("Ngày chứng từ là bắt buộc.");
      return;
    }
    if (
      variant === "sales" &&
      !store.partnerId &&
      !store.partnerNameSnapshot.trim()
    ) {
      setError("Vui lòng chọn khách hàng hoặc nhập tên snapshot.");
      return;
    }
    if (
      (variant === "purchase" || variant === "expenses") &&
      !store.partnerId
    ) {
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

    const totalAmount = lines.reduce(
      (sum, line) => sum + Number(line.amount || 0),
      0,
    );

    const payload: CreateOperationalPayload = isPurchaseStatusOnlyMode
      ? {
          status: overrideStatus || store.status,
          notes: store.notes.trim() || undefined,
          ...(purchaseEditableLines ? { lines: purchaseEditableLines } : {}),
        }
      : isPurchaseFullyLocked
        ? {
            notes: store.notes.trim() || undefined,
          }
        : {
            document_date: store.documentDate,
            due_date: store.dueDate || undefined,
            branch_id: store.branchId || undefined,
            status: overrideStatus || store.status,
            total_amount: totalAmount,
            notes: store.notes.trim() || undefined,
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
        order_no: store.docNo || undefined,
        customer_id: store.partnerId || undefined,
        customer_name_snapshot: store.partnerNameSnapshot.trim() || undefined,
        vehicle_plate: store.vehiclePlate.trim() || undefined,
        vehicle_vin: store.vehicleVin.trim() || undefined,
        vehicle_model: store.vehicleModel.trim() || undefined,
        service_advisor_name: store.serviceAdvisorName.trim() || undefined,
        expected_delivery_date: store.expectedDate || undefined,
        source_system: "ERP",
      });
    }

    if (variant === "purchase") {
      Object.assign(payload, {
        purchase_no: store.docNo || undefined,
        supplier_id: store.partnerId || undefined,
        supplier_name_snapshot: store.partnerNameSnapshot.trim() || undefined,
        expected_receipt_date: store.expectedDate || undefined,
        recurrence_type: store.recurrenceType,
        recurrence_interval: Number(store.recurrenceInterval || 1),
        recurrence_start_date: store.recurrenceStartDate || undefined,
        recurrence_end_date: store.recurrenceEndDate || undefined,
        next_due_date: store.nextDueDate || undefined,
        auto_generate_next: store.autoGenerateNext,
        supplier_invoice_no: store.supplierInvoiceNo.trim() || undefined,
      });
    }

    if (variant === "expenses") {
      Object.assign(payload, {
        expense_no: store.docNo || undefined,
        supplier_id: store.partnerId || undefined,
        supplier_name_snapshot: store.partnerNameSnapshot.trim() || undefined,
        title: store.title.trim() || undefined,
        expense_category: store.expenseCategory.trim() || undefined,
        recurrence_type: store.recurrenceType,
        recurrence_interval: Number(store.recurrenceInterval || 1),
        recurrence_start_date: store.recurrenceStartDate || undefined,
        recurrence_end_date: store.recurrenceEndDate || undefined,
        next_due_date: store.nextDueDate || undefined,
        auto_generate_next: store.autoGenerateNext,
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

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  const actions =
    viewOnly || loading
      ? [
          {
            label: t("Đóng"),
            onClick: onClose,
            variant: "outline" as const,
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
          ];

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const mode: DrawerMode = viewOnly ? "view" : editing ? "edit" : "create";

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      onToggleEdit={onToggleEdit}
      title={
        viewOnly
          ? t(`Chi tiết ${variantTitle[variant as FormVariant]}`)
          : editing
            ? t(`Cập nhật ${variantTitle[variant as FormVariant]}`)
            : t(`Tạo mới ${variantTitle[variant as FormVariant]}`)
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
      actions={actions}
      loading={loading}
      error={error}
      leftPanel={
        <FormLineDetailPanel
          variant={variant as FormVariant}
          isPurchaseLocked={isPurchaseLocked}
          purchaseFieldLocked={purchaseFieldLocked}
          viewOnly={viewOnly}
          purchaseInventoryOptions={purchaseInventoryOptions}
        />
      }
      rightPanel={
        <FormGeneralInfoPanel
          variant={variant as FormVariant}
          isPurchaseLocked={isPurchaseLocked}
          isPurchaseFullyLocked={isPurchaseFullyLocked}
          purchaseFieldLocked={purchaseFieldLocked}
          viewOnly={viewOnly}
          branchOptions={branchOptions}
          partnerOptions={partnerOptions}
          poReceipts={poReceipts}
        />
      }
    />
  );
}
