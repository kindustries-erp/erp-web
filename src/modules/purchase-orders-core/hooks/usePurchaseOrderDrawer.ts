import { useEffect, useMemo } from "react";
import {
  operationalApi,
  type OperationalDocument,
} from "@/modules/operational/api/operationalApi";
import { type CreateOperationalPayload } from "@/modules/operational/api/operationalApi";
import { purchaseOrdersCoreApi } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { getBusinessPartnersPagedApi } from "@/modules/partners/api/partnerApi";
import { basicMastersApi } from "@/modules/basic-masters/api/basicMastersApi";
import { extractApiError } from "@/shared/utils/apiError";
import { useOperationalFormStore } from "@/modules/operational/hooks/useOperationalFormStore";

export interface UsePurchaseOrderDrawerProps {
  open: boolean;
  editing: OperationalDocument | null;
  viewOnly?: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

export function usePurchaseOrderDrawer({
  open,
  editing,
  viewOnly,
  onClose,
  onSaved,
}: UsePurchaseOrderDrawerProps) {
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
    setSaving,
    setError,
    setSubmittingStatus,
    setSupplierInvoiceOptions,
  } = store;

  // -------------------------------------------------------------------------
  // Lock logic
  // -------------------------------------------------------------------------
  const purchaseStatusValue = (editing?.status || "DRAFT") as string;
  const isPurchaseStatusOnlyMode =
    !!editing &&
    !viewOnly &&
    ["CONFIRMED", "PARTIAL_RECEIVED"].includes(purchaseStatusValue);
  const isPurchaseFullyLocked =
    !!editing &&
    !viewOnly &&
    ["RECEIVED", "FULLY_RECEIVED", "CANCELLED"].includes(purchaseStatusValue);
  const isPurchaseLocked =
    viewOnly || isPurchaseStatusOnlyMode || isPurchaseFullyLocked;
  const isPurchaseHeaderEditableAfterConfirm =
    !!editing && !viewOnly && isPurchaseStatusOnlyMode;

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
    getBusinessPartnersPagedApi({
      page: 1,
      pageSize: 200,
      partnerType: "VENDOR",
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
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (viewOnly) {
      setInventoryItemOptions([]);
      return;
    }
    basicMastersApi
      .list({ limit: 200, entities: "inventoryItems,erpInvoices" })
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

        // Map input invoices for PO
        const invOptions = (res.items.erpInvoices || [])
          .filter((inv) => inv.direction === "IN")
          .map((inv) => ({
            value: inv.invoiceNo,
            label: `${inv.invoiceNo} ${inv.sellerName ? `(${inv.sellerName})` : ""}`,
          }));
        setSupplierInvoiceOptions(invOptions);
      })
      .catch(() => {
        setInventoryItemOptions([]);
        setSupplierInvoiceOptions([]);
      });
  }, [open, viewOnly, setInventoryItemOptions, setSupplierInvoiceOptions]);

  // -------------------------------------------------------------------------
  // Init form
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (!editing) {
      initNew("purchase");
      void purchaseOrdersCoreApi
        .nextNo()
        .then((no) => store.setDocNo(no))
        .catch(() => {
          /* silent */
        });
      return;
    }
    initFromDoc(editing, "purchase");
  }, [open, editing]);

  // -------------------------------------------------------------------------
  // Inventory options with fallback
  // -------------------------------------------------------------------------
  const purchaseInventoryOptions = useMemo(() => {
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
  }, [inventoryItemOptions, editing]);

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  async function handleSubmit(overrideStatus?: string) {
    if (!store.documentDate) {
      setError("Ngày chứng từ là bắt buộc.");
      return;
    }
    if (!store.partnerId) {
      setError("Vui lòng chọn nhà cung cấp.");
      return;
    }
    if (!lines.length) {
      setError("Phải có ít nhất 1 dòng chứng từ.");
      return;
    }

    const purchaseEditableLines = lines.map((line, idx) => ({
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
    }));

    const totalAmount = lines.reduce(
      (sum, line) => sum + Number(line.amount || 0),
      0,
    );

    const payload = isPurchaseStatusOnlyMode
      ? {
          status: overrideStatus || store.status,
          payment_status: store.paymentStatus,
          notes: store.notes.trim() || undefined,
          lines: purchaseEditableLines,
        }
      : isPurchaseFullyLocked
        ? {
            payment_status: store.paymentStatus,
            notes: store.notes.trim() || undefined,
          }
        : {
            document_date: store.documentDate,
            due_date: store.dueDate || undefined,
            branch_id: store.branchId || undefined,
            invoice_status: store.invoiceStatus,
            status: overrideStatus || store.status,
            payment_status: store.paymentStatus,
            total_amount: totalAmount,
            notes: store.notes.trim() || undefined,
            lines: purchaseEditableLines,
            purchase_no: store.docNo || undefined,
            supplier_id: store.partnerId || undefined,
            supplier_name_snapshot:
              store.partnerNameSnapshot.trim() || undefined,
            expected_receipt_date: store.expectedDate || undefined,
            recurrence_type: store.recurrenceType,
            recurrence_interval: Number(store.recurrenceInterval || 1),
            recurrence_start_date: store.recurrenceStartDate || undefined,
            recurrence_end_date: store.recurrenceEndDate || undefined,
            next_due_date: store.nextDueDate || undefined,
            auto_generate_next: store.autoGenerateNext,
            supplier_invoice_no: store.supplierInvoiceNo.trim() || undefined,
          };

    setSubmittingStatus(overrideStatus || null);
    setSaving(true);
    setError(null);
    try {
      if (editing)
        await operationalApi.updatePurchase(
          editing.id,
          payload as CreateOperationalPayload,
        );
      else
        await operationalApi.createPurchase(
          payload as CreateOperationalPayload,
        );
      await onSaved();
      onClose();
    } catch (e) {
      setError(extractApiError(e, "Không thể lưu chứng từ."));
    } finally {
      setSubmittingStatus(null);
      setSaving(false);
    }
  }

  return {
    store,
    docNo,
    status,
    saving,
    error,
    submittingStatus,
    branchOptions,
    partnerOptions,
    isPurchaseLocked,
    isPurchaseFullyLocked,
    purchaseFieldLocked,
    purchaseInventoryOptions,
    handleSubmit,
  };
}
