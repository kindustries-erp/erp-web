import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  operationalApi,
  type OperationalDocument,
} from "@/modules/operational/api/operationalApi";
import { type CreateOperationalPayload } from "@/modules/operational/api/operationalApi";
import { purchaseOrdersCoreApi } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { getBusinessPartnersPagedApi } from "@/modules/partners/api/partnerApi";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { extractApiError } from "@/shared/utils/apiError";
import { useOperationalFormStore } from "@/modules/operational/hooks/useOperationalFormStore";
import { updateEntityTags } from "@/modules/tags/api/tagsApi";
import { type PendingDocChange } from "@/modules/operational/components/PurchaseLinkedDocuments";
import { goodsReceiptsCoreApi } from "@/modules/goods-receipts-core/api/goodsReceiptsCoreApi";

export interface UsePurchaseOrderDrawerProps {
  open: boolean;
  editing: OperationalDocument | null;
  viewOnly?: boolean;
  poReceipts?: unknown[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
  /** Pending tag IDs (Option B: applied after create) */
  pendingTagIds?: string[];
}

export function usePurchaseOrderDrawer({
  open,
  editing,
  viewOnly,
  poReceipts,
  onClose,
  onSaved,
  pendingTagIds = [],
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
    lines,
    initNew,
    initFromDoc,
    setBranchOptions,
    setPartnerOptions,
    setSaving,
    setError,
    setSubmittingStatus,
  } = store;

  // -------------------------------------------------------------------------
  // Local State for Linked Documents
  // -------------------------------------------------------------------------
  const [pendingDocumentChanges, setPendingDocumentChanges] = useState<
    PendingDocChange[]
  >([]);

  useEffect(() => {
    if (open) setPendingDocumentChanges([]);
  }, [open]);

  const fieldSet = (key: string, value: unknown) => {
    if (key === "pendingDocumentChanges") {
      setPendingDocumentChanges(value as PendingDocChange[]);
    }
  };

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
    if (field === "poNo" && !!editing) return true;
    if (field === "description" && !viewOnly) return false;
    if (!isPurchaseLocked) return false;

    // User enhancement: if there's receipt history, lock qty
    const hasReceiptHistory = poReceipts && poReceipts.length > 0;
    if (hasReceiptHistory && field === "qty") return true;

    if (!isPurchaseHeaderEditableAfterConfirm) return true;
    return !["description", "qty", "expectedDate", "status"].includes(field);
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
      pageSize: 500,
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

  // RBAC Permission Check for Inventory Items
  const canViewInventoryItems = useHasPermission(
    ErpResource.INVENTORY_ITEMS,
    ErpAction.READ,
  );

  const [itemSearch, setItemSearch] = useState("");

  const {
    data: itemsData,
    fetchNextPage: fetchNextItems,
    isFetchingNextPage: loadingMoreItems,
    isLoading: isLoadingItems,
  } = useInfiniteQuery({
    queryKey: [
      "purchase-order-inventory-items-infinite",
      { search: itemSearch.trim() },
    ],
    queryFn: async ({ pageParam = 1 }) => {
      return inventoryCoreApi.list({
        search: itemSearch.trim() || undefined,
        page: pageParam,
        pageSize: 50,
      });
    },
    getNextPageParam: (lastPage) => {
      const page = lastPage.page || 1;
      const totalPages = lastPage.totalPages || 1;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: open && !viewOnly,
    staleTime: 60_000,
  });

  const infiniteItemOptions = useMemo(() => {
    if (!itemsData?.pages) return [];
    return itemsData.pages.flatMap((page) =>
      (page.items || []).map((item) => {
        const sku = item.sku || "";
        const itemName = item.itemName || "(Chưa có tên)";
        return {
          value: item.id,
          label: sku ? `${sku} — ${itemName}` : itemName,
          searchText: `${sku} ${itemName}`,
          sku,
          itemName,
          itemType:
            item.itemType && typeof item.itemType === "object"
              ? item.itemType?.code || item.itemType?.name || ""
              : String(item.itemType ?? ""),
          note: item.note || "",
        };
      }),
    );
  }, [itemsData]);

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
  // Inventory options with fallback from document lines
  // -------------------------------------------------------------------------
  const purchaseInventoryOptions = useMemo(() => {
    const fallbackOptions = (editing?.lines || [])
      .filter((line) => line.inventory_item_id)
      .map((line, idx) => {
        const id = line.inventory_item_id as string;
        const existing = infiniteItemOptions.find((item) => item.value === id);
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
          searchText: `${fallbackSku} ${fallbackName}`,
          sku: fallbackSku,
          itemName: fallbackName,
          itemType: line.line_type || "PART",
          note: line.description || "",
        };
      });
    return [
      ...infiniteItemOptions,
      ...fallbackOptions.filter(
        (opt) => !infiniteItemOptions.some((item) => item.value === opt.value),
      ),
    ];
  }, [infiniteItemOptions, editing]);

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
      description: line.description?.trim() ?? undefined,
      qty: Number(line.qty || 0),
      unit_price: Number(line.unit_price || 0),
      amount: Number(line.amount || 0),
      notes: line.notes?.trim() ?? undefined,
    }));

    const totalAmount = lines.reduce(
      (sum, line) => sum + Number(line.amount || 0),
      0,
    );

    const payload = isPurchaseStatusOnlyMode
      ? {
          status: overrideStatus || store.status,
          payment_status: store.paymentStatus,
          notes: store.notes?.trim() ?? "",
          lines: purchaseEditableLines,
          supplier_invoice_no: store.supplierInvoiceNo?.trim() ?? "",
          expected_receipt_date: store.expectedDate || undefined,
        }
      : isPurchaseFullyLocked
        ? {
            payment_status: store.paymentStatus,
            notes: store.notes?.trim() ?? "",
            supplier_invoice_no: store.supplierInvoiceNo?.trim() ?? "",
            lines: purchaseEditableLines,
          }
        : {
            document_date: store.documentDate,
            due_date: store.dueDate || undefined,
            branch_id: store.branchId || undefined,
            invoice_status: store.invoiceStatus,
            status: overrideStatus || store.status,
            payment_status: store.paymentStatus,
            total_amount: totalAmount,
            notes: store.notes?.trim() ?? "",
            lines: purchaseEditableLines,
            purchase_no: store.docNo || undefined,
            supplier_id: store.partnerId || undefined,
            supplier_name_snapshot:
              store.partnerNameSnapshot?.trim() ?? undefined,
            expected_receipt_date: store.expectedDate || undefined,
            recurrence_type: store.recurrenceType,
            recurrence_interval: Number(store.recurrenceInterval || 1),
            recurrence_start_date: store.recurrenceStartDate || undefined,
            recurrence_end_date: store.recurrenceEndDate || undefined,
            next_due_date: store.nextDueDate || undefined,
            auto_generate_next: store.autoGenerateNext,
            supplier_invoice_no: store.supplierInvoiceNo?.trim() ?? "",
          };

    setSubmittingStatus(overrideStatus || null);
    setSaving(true);
    setError(null);
    try {
      let savedId = editing?.id;

      if (editing)
        await operationalApi.updatePurchase(
          editing.id,
          payload as CreateOperationalPayload,
        );
      else {
        const result = await operationalApi.createPurchase(
          payload as CreateOperationalPayload,
        );
        savedId = result?.id;
        // Option B: apply pending tags after create
        if (pendingTagIds.length > 0) {
          const createdId = result?.id;
          if (createdId) {
            try {
              await updateEntityTags(
                "erp_purchase_order",
                createdId,
                pendingTagIds,
              );
            } catch {
              // tags are non-critical
            }
          }
        }
      }

      if (pendingDocumentChanges.length > 0 && savedId) {
        const snapshot = [...pendingDocumentChanges];
        setPendingDocumentChanges([]);
        for (const change of snapshot) {
          try {
            if (change.type === "GR") {
              await goodsReceiptsCoreApi.update(change.refId, {
                purchaseOrderId: (change.action === "ADD"
                  ? savedId
                  : null) as any,
              });
            } else if (change.type === "INVOICE") {
              if (change.action === "ADD") {
                await purchaseOrdersCoreApi.linkInvoices(savedId, [
                  change.refId,
                ]);
              } else {
                await purchaseOrdersCoreApi.unlinkInvoice(
                  savedId,
                  change.refId,
                );
              }
            }
          } catch (err) {
            console.error("Failed to process document change", change, err);
          }
        }
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
    pendingDocumentChanges,
    fieldSet,
    onItemSearch: setItemSearch,
    onScrollBottomItems: () => {
      if (!loadingMoreItems && !isLoadingItems) {
        void fetchNextItems();
      }
    },
    loadingItems: loadingMoreItems || isLoadingItems,
    canViewInventoryItems,
  };
}
