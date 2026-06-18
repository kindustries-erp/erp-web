import { useEffect, useMemo, useState } from "react";
import {
  periodFirstDay,
  periodLastDay,
  monthFirstDay,
} from "@/modules/finance/utils/financeHelpers";
import { Eye, FileText, Link2, Warehouse } from "lucide-react";
import { useUIStore } from "@/core/config/uiStore";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { getPaymentVouchersPagedApi } from "@/modules/finance/api/financeApi";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { StandardTable } from "@/shared/components/StandardTable";
import { FilterPanel } from "@/shared/components/FilterPanel";
import { PageLayout } from "@/shared/components/PageLayout";
import { type FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
import { extractApiError } from "@/shared/utils/apiError";
import { today } from "@/shared/utils/format";
import {
  isRecurringDocument,
  operationalApi,
  type InventoryStockRow,
  type OperationalDocument,
  type OperationalVariant,
} from "@/modules/operational/api/operationalApi";
import { useOperationalFlowStore } from "@/modules/operational/hooks/useOperationalFlowStore";
import { useOperationalListStore } from "@/modules/operational/hooks/useOperationalListStore";
import { useOperationalListQuery } from "@/modules/operational/hooks/useOperationalListQuery";
import {
  resolveDocumentType,
  buildSamplePayload,
  canPostReceipt,
  canPostIssue,
} from "@/modules/operational/utils/operationalHelpers";
import { OperationalFormDrawer } from "@/modules/operational/components/OperationalFormDrawer";
import { OperationalInventoryPage } from "@/modules/operational/components/list/OperationalInventoryPage";
import { OperationalDetailDrawer } from "@/modules/operational/components/list/OperationalDetailDrawer";
import { InventoryPostingDrawer } from "@/modules/operational/components/list/InventoryPostingDrawer";
import { SettlementDrawer } from "@/modules/operational/components/list/SettlementDrawer";
import { OperationalTableActions } from "@/modules/operational/components/list/OperationalTableActions";
import { PurchaseSubRow } from "@/modules/operational/components/list/PurchaseSubRow";
import { usePurchaseColumns } from "@/modules/operational/components/list/columns/purchaseColumns";
import { useBaseColumns } from "@/modules/operational/components/list/columns/baseColumns";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import {
  purchaseOrdersCoreApi,
  type ErpPoReceipt,
} from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import {
  inventoryCoreApi,
  type InventoryMovementsPayload,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import type { InventoryPostingLineForm } from "@/modules/operational/hooks/useOperationalFlowStore";

// ---------------------------------------------------------------------------
// Variant config
// ---------------------------------------------------------------------------
const variantConfig: Record<
  OperationalVariant,
  { title: string; desc: string; cta?: string; paymentLinkable?: boolean }
> = {
  sales: {
    title: "Bán hàng / Đơn sửa xe",
    desc: "Nguồn ERP, KGARA, Vinfast DMS. Công nợ phải thu sinh từ chứng từ gốc.",
    cta: "Tạo đơn sửa xe mẫu",
  },
  purchase: {
    title: "Đơn mua hàng",
    desc: "Phụ tùng, nguyên vật liệu; có thể định kỳ và trigger nhập kho.",
  },
  expenses: {
    title: "Chi phí vận hành",
    desc: "Điện nước, thuê máy in, dịch vụ; không qua kho, có thể định kỳ/chưa hóa đơn.",
    cta: "Tạo chi phí mẫu",
  },
  receivables: {
    title: "Công nợ phải thu mới",
    desc: "Tổng hợp từ đơn sửa xe/bán hàng, không nhập công nợ trực tiếp.",
    paymentLinkable: true,
  },
  payables: {
    title: "Công nợ phải trả mới",
    desc: "Tổng hợp từ đơn mua hàng và chi phí vận hành; link phiếu Dòng tiền.",
    paymentLinkable: true,
  },
  inventory: {
    title: "Kho (Tổng hợp tồn)",
    desc: "Tổng hợp tồn kho toàn bộ hàng hóa: linh kiện (RAW), thành phẩm (FG), bán thành phẩm (WIP). Có thể lọc theo loại.",
  },
};

// ---------------------------------------------------------------------------
// Filter option constants
// ---------------------------------------------------------------------------
const STATUS_OPTIONS = [
  { value: "DRAFT", label: "DRAFT" },
  { value: "CONFIRMED", label: "CONFIRMED" },
  { value: "IN_PROGRESS", label: "IN_PROGRESS" },
  { value: "COMPLETED", label: "COMPLETED" },
  { value: "RECEIVED", label: "RECEIVED" },
  { value: "CANCELLED", label: "CANCELLED" },
];
const PAYMENT_STATUS_OPTIONS = [
  { value: "UNPAID", label: "UNPAID" },
  { value: "PARTIALLY_PAID", label: "PARTIALLY_PAID" },
  { value: "PAID", label: "PAID" },
  { value: "OVERDUE", label: "OVERDUE" },
  { value: "VOID", label: "VOID" },
];
const RECURRING_OPTIONS = [
  { value: "RECURRING", label: "Recurring" },
  { value: "NON_RECURRING", label: "Không recurring" },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function OperationalListPage({
  variant,
}: {
  variant: OperationalVariant;
}) {
  const t = useT();
  const navigate = useAppStore((s) => s.navigate);
  const showToast = useUIStore((s) => s.showToast);
  const config = variantConfig[variant];

  // List store
  const listStore = useOperationalListStore();
  const {
    searchInput,
    setSearchInput,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    branchFilter,
    setBranchFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    statusFilter,
    setStatusFilter,
    recurringFilter,
    setRecurringFilter,
    period,
    setPeriod,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    itemTypeFilter,
    supplierFilter,
    setSupplierFilter,
    itemFilter,
    setItemFilter,
    purchaseSort,
    togglePurchaseSort,
    filterPanelOpen,
    setFilterPanelOpen,
    expandedRowIds,
    toggleExpandRow,
    expandedStockItemIds,
    toggleExpandStockItem,
    supplierSearch,
    setSupplierSearch,
    itemSearch,
    setItemSearch,
    resetAllFilters,
  } = listStore;

  // Local state (không cần persist, chỉ dùng trong scope component)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movLoadingId, setMovLoadingId] = useState<string | null>(null);
  const [movError, setMovError] = useState<string | null>(null);
  const [movMap, setMovMap] = useState<
    Record<string, InventoryMovementsPayload>
  >({});
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [editingRow, setEditingRow] = useState<OperationalDocument | null>(
    null,
  );
  const [poReceipts, setPoReceipts] = useState<ErpPoReceipt[]>([]);
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);
  const [branchOptions, setBranchOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // Flow store
  const {
    activeStep,
    rootDocument,
    rootDocumentType,
    detailDocument,
    detailLoading,
    detailError,
    voucherOptions,
    settlementForm,
    postingDocument,
    postingDocumentType,
    postingLoading,
    postingLineForms,
    postingNotes,
    setRootContext,
    setActiveStep,
    setDetailState,
    setSettlementState,
    setPostingState,
    resetFlow,
  } = useOperationalFlowStore();

  // -------------------------------------------------------------------------
  // Infinite suppliers / items (purchase filter)
  // -------------------------------------------------------------------------
  const {
    data: suppliersData,
    fetchNextPage: fetchNextSuppliers,
    isFetchingNextPage: loadingSuppliers,
  } = useBasicMasterInfinite({
    search: supplierSearch,
    limit: 50,
    entities: "suppliers",
    enabled: variant === "purchase",
  });
  const supplierOptions = useMemo(
    () =>
      suppliersData?.pages.flatMap((p) =>
        (p.items.suppliers || []).map((s) => ({ value: s.id, label: s.name })),
      ) || [],
    [suppliersData],
  );

  const {
    data: itemsData,
    fetchNextPage: fetchNextItems,
    isFetchingNextPage: loadingItems,
  } = useBasicMasterInfinite({
    search: itemSearch,
    limit: 50,
    entities: "inventoryItems",
    enabled: variant === "purchase",
  });
  const itemOptions = useMemo(
    () =>
      itemsData?.pages.flatMap((p) =>
        (p.items.inventoryItems || []).map((i) => ({
          value: i.id,
          label: `${i.sku} — ${i.itemName}`,
        })),
      ) || [],
    [itemsData],
  );

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    resetFlow();
    resetAllFilters();
  }, [variant]);

  // -------------------------------------------------------------------------
  // Query
  // -------------------------------------------------------------------------
  const purchaseSortArray = purchaseSort ? [purchaseSort] : undefined;
  const listQuery = useOperationalListQuery({
    variant,
    page,
    pageSize,
    search: search || undefined,
    branch_id: branchFilter || undefined,
    supplier_id: supplierFilter || undefined,
    recurring: recurringFilter === "RECURRING",
    payment_status: paymentStatusFilter || undefined,
    status: statusFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    item_type: itemTypeFilter || undefined,
    inventory_item_id: itemFilter || undefined,
    sort: purchaseSortArray,
  });

  useEffect(() => {
    setLoading(listQuery.isLoading || listQuery.isFetching);
    setError(
      listQuery.error
        ? extractApiError(listQuery.error, "Không tải được dữ liệu")
        : null,
    );
  }, [listQuery.error, listQuery.isFetching, listQuery.isLoading]);

  useEffect(() => {
    if (variant !== "purchase") return;
    void listQuery.refetch();
  }, [variant, supplierFilter, itemFilter]);

  const items = useMemo(
    () =>
      variant === "inventory"
        ? []
        : ((listQuery.data?.items || []) as OperationalDocument[]),
    [listQuery.data?.items, variant],
  );

  const stockItems = useMemo(
    () =>
      variant === "inventory"
        ? ((listQuery.data?.items || []) as InventoryStockRow[])
        : [],
    [listQuery.data?.items, variant],
  );

  const total = listQuery.data?.total || 0;
  const totalPages = listQuery.data?.totalPages || 0;

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  async function createSample() {
    const payload = buildSamplePayload(variant);
    if (!payload) return;
    setLoading(true);
    setError(null);
    try {
      if (variant === "sales") await operationalApi.createSales(payload);
      else if (variant === "purchase")
        await operationalApi.createPurchase(payload);
      else if (variant === "expenses")
        await operationalApi.createExpense(payload);
      showToast({ title: "Đã tạo chứng từ mẫu", variant: "success" });
      await listQuery.refetch();
    } catch (err) {
      setError(extractApiError(err, "Không tạo được chứng từ mẫu"));
    } finally {
      setLoading(false);
    }
  }

  async function openSettlement(row: OperationalDocument) {
    const documentType = resolveDocumentType(row, variant);
    if (!documentType) return;
    setRootContext(row, documentType);
    setActiveStep("settlement");
    setSettlementState({
      settlementError: null,
      settlementForm: {
        payment_voucher_id: "",
        applied_date: today(),
        applied_amount: Number(row.open_amount || 0),
        notes: "",
      },
      voucherLoading: true,
      paymentLinks: [],
      voucherOptions: [],
    });
    try {
      const [links, vouchers] = await Promise.all([
        operationalApi.listPaymentLinks(documentType, row.id),
        getPaymentVouchersPagedApi({
          page: 1,
          pageSize: 100,
          status: "APPROVED",
          voucher_direction: variant === "receivables" ? "IN" : "OUT",
          counterparty_id:
            typeof row.customer_id === "string"
              ? row.customer_id
              : typeof row.supplier_id === "string"
                ? row.supplier_id
                : undefined,
          sort: ["-document_date"],
        }),
      ]);
      setSettlementState({
        paymentLinks: links,
        voucherOptions: vouchers.items ?? [],
      });
    } catch (err) {
      setSettlementState({
        settlementError: extractApiError(err, "Không tải được dữ liệu cấn trừ"),
        paymentLinks: [],
        voucherOptions: [],
      });
    } finally {
      setSettlementState({ voucherLoading: false });
    }
  }

  function closeSettlement() {
    if (detailDocument) {
      setActiveStep("detail");
      setSettlementState({ settlementError: null });
      return;
    }
    resetFlow();
  }

  const selectedVoucher = useMemo(
    () =>
      voucherOptions.find((v) => v.id === settlementForm.payment_voucher_id),
    [voucherOptions, settlementForm.payment_voucher_id],
  );
  void selectedVoucher; // used inside SettlementDrawer via store

  async function refreshSettlementData() {
    if (!rootDocument || !rootDocumentType) return;
    const [document, links] = await Promise.all([
      operationalApi.getDocument(rootDocumentType, rootDocument.id),
      operationalApi.listPaymentLinks(rootDocumentType, rootDocument.id),
    ]);
    setRootContext(document, rootDocumentType);
    setDetailState({ detailDocument: document });
    setSettlementState({ paymentLinks: links });
  }

  async function saveSettlement() {
    if (!rootDocument || !rootDocumentType) return;
    if (!settlementForm.payment_voucher_id) {
      setSettlementState({ settlementError: "Vui lòng chọn phiếu dòng tiền." });
      return;
    }
    if (settlementForm.applied_amount <= 0) {
      setSettlementState({
        settlementError: "Số tiền cấn trừ phải lớn hơn 0.",
      });
      return;
    }
    setSettlementState({ settlementLoading: true, settlementError: null });
    try {
      await operationalApi.createPaymentLink({
        document_type: rootDocumentType,
        document_id: rootDocument.id,
        payment_voucher_id: settlementForm.payment_voucher_id,
        applied_amount: settlementForm.applied_amount,
        applied_date: settlementForm.applied_date,
        notes: settlementForm.notes || undefined,
      });
      await refreshSettlementData();
      await listQuery.refetch();
      showToast({ title: "Đã liên kết phiếu dòng tiền", variant: "success" });
      setSettlementState({
        settlementForm: {
          ...settlementForm,
          payment_voucher_id: "",
          notes: "",
        },
      });
    } catch (err) {
      setSettlementState({
        settlementError: extractApiError(err, "Liên kết thanh toán thất bại"),
      });
    } finally {
      setSettlementState({ settlementLoading: false });
    }
  }

  async function removePaymentLink(linkId: string) {
    if (!rootDocument || !rootDocumentType) return;
    setSettlementState({ settlementLoading: true, settlementError: null });
    try {
      await operationalApi.deletePaymentLink(
        rootDocumentType,
        rootDocument.id,
        linkId,
      );
      await refreshSettlementData();
      await listQuery.refetch();
      showToast({ title: "Đã gỡ liên kết thanh toán", variant: "success" });
    } catch (err) {
      setSettlementState({
        settlementError: extractApiError(
          err,
          "Không gỡ được liên kết thanh toán",
        ),
      });
    } finally {
      setSettlementState({ settlementLoading: false });
    }
  }

  async function openDetail(row: OperationalDocument) {
    const documentType = resolveDocumentType(row, variant);
    if (!documentType) return;

    if (variant === "purchase") {
      setEditingRow(row);
      setPoReceipts([]);
      setViewOnly(true);
      setFormOpen(true);
      setFormLoading(true);
      setError(null);
      try {
        const document = await operationalApi.getDocument(documentType, row.id);
        const po = await purchaseOrdersCoreApi.get(row.id);
        setPoReceipts(po.receipts || []);
        setEditingRow(document);
      } catch (err) {
        setError(extractApiError(err, t("Không tải được chi tiết chứng từ")));
      } finally {
        setFormLoading(false);
      }
      return;
    }

    setRootContext(row, documentType);
    setActiveStep("detail");
    setDetailState({
      detailLoading: true,
      detailError: null,
      detailDocument: null,
    });
    try {
      const document = await operationalApi.getDocument(documentType, row.id);
      setRootContext(document, documentType);
      setDetailState({ detailDocument: document });
      if (documentType === "purchase_orders") {
        try {
          const po = await purchaseOrdersCoreApi.get(row.id);
          setPoReceipts(po.receipts || []);
        } catch {
          setPoReceipts([]);
        }
      } else {
        setPoReceipts([]);
      }
    } catch (err) {
      setDetailState({
        detailError: extractApiError(err, "Không tải được chi tiết chứng từ"),
      });
    } finally {
      setDetailState({ detailLoading: false });
    }
  }

  async function openPostingDrawer(row: OperationalDocument) {
    const documentType = resolveDocumentType(row, variant);
    if (!documentType) return;
    if (documentType === "purchase_orders") {
      navigate("erp-warehouse");
      const params = new URLSearchParams(window.location.search);
      params.set("purchaseOrderId", row.id);
      params.set("mode", "from-po");
      history.replaceState(
        null,
        "",
        `${window.location.pathname}?${params.toString()}`,
      );
      return;
    }
    setPostingState({ postingLoading: true });
    setError(null);
    try {
      const document = await operationalApi.getDocument(documentType, row.id);
      const lineForms = (document.lines || [])
        .filter(
          (
            line: import("@/modules/operational/api/operationalApi").OperationalLine,
          ) => line.inventory_item_id && Number(line.qty || 0) > 0,
        )
        .map(
          (
            line: import("@/modules/operational/api/operationalApi").OperationalLine,
          ) => ({
            line_id: String(line.id || ""),
            line_name:
              line.item_name ||
              line.description ||
              line.item_code ||
              String(line.id),
            requested_qty: Number(line.qty || 0),
            max_qty: Number(line.qty || 0),
            inventory_item_id: line.inventory_item_id || null,
          }),
        )
        .filter((line: InventoryPostingLineForm) => line.line_id);
      setRootContext(document, documentType);
      setDetailState({ detailDocument: document });
      setPostingState({
        postingDocument: document,
        postingDocumentType: documentType,
        postingLineForms: lineForms,
        postingNotes: "",
      });
    } catch (err) {
      setError(extractApiError(err, "Không tải được dữ liệu post kho"));
    } finally {
      setPostingState({ postingLoading: false });
    }
  }

  function closePostingDrawer() {
    if (detailDocument) {
      setActiveStep("detail");
      setPostingState({
        postingDocument: null,
        postingDocumentType: null,
        postingLineForms: [],
        postingNotes: "",
      });
      return;
    }
    resetFlow();
  }

  async function submitPostingDrawer() {
    if (!postingDocument || !postingDocumentType) return;
    const selectedLines = postingLineForms
      .filter((line) => Number(line.requested_qty || 0) > 0)
      .map((line) => ({
        line_id: line.line_id,
        qty: Number(line.requested_qty || 0),
      }));
    if (!selectedLines.length) {
      setError("Vui lòng nhập số lượng post kho cho ít nhất 1 dòng.");
      return;
    }
    setPostingState({ postingLoading: true });
    setError(null);
    try {
      if (postingDocumentType === "purchase_orders") {
        await operationalApi.postPurchaseReceipt(postingDocument.id, {
          transaction_date: today(),
          notes: postingNotes || undefined,
          receipt_lines: selectedLines,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        showToast({ title: "Đã post nhập kho", variant: "success" });
      } else if (postingDocumentType === "sales_service_orders") {
        await operationalApi.postSalesIssue(postingDocument.id, {
          transaction_date: today(),
          notes: postingNotes || undefined,
          issue_lines: selectedLines,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        showToast({ title: "Đã post xuất kho", variant: "success" });
      }
      await listQuery.refetch();
      if (detailDocument?.id === postingDocument.id) {
        const refreshed = await operationalApi.getDocument(
          postingDocumentType,
          postingDocument.id,
        );
        setRootContext(refreshed, postingDocumentType);
        setDetailState({ detailDocument: refreshed });
      }
      closePostingDrawer();
    } catch (err) {
      setError(extractApiError(err, "Post kho thất bại"));
    } finally {
      setPostingState({ postingLoading: false });
    }
  }

  async function handleToggleInventoryExpand(row: InventoryStockRow) {
    const isExpanded = expandedStockItemIds[row.inventory_item_id];
    toggleExpandStockItem(row.inventory_item_id);
    if (isExpanded) return;
    setMovError(null);
    if (movMap[row.inventory_item_id]) return;
    setMovLoadingId(row.inventory_item_id);
    try {
      const data = await inventoryCoreApi.movements(row.inventory_item_id);
      setMovMap((prev) => ({ ...prev, [row.inventory_item_id]: data }));
    } catch (e) {
      setMovError(
        e instanceof Error ? e.message : "Không thể tải lịch sử xuất nhập kho",
      );
    } finally {
      setMovLoadingId(null);
    }
  }

  // -------------------------------------------------------------------------
  // Columns
  // -------------------------------------------------------------------------
  const purchaseColumns = usePurchaseColumns({
    variant,
    expandedRowIds,
    onToggleExpand: toggleExpandRow,
  });
  const baseColumns = useBaseColumns({
    variant,
    paymentLinkable: config.paymentLinkable,
  });
  const columns = variant === "purchase" ? purchaseColumns : baseColumns;

  // -------------------------------------------------------------------------
  // Filter config
  // -------------------------------------------------------------------------
  const filterConfig: FilterPanelConfig =
    variant === "purchase"
      ? {
          search: true,
          period: true,
          custom: [
            {
              key: "supplier_id",
              label: "Nhà cung cấp",
              placeholder: "Tất cả nhà cung cấp",
              options: supplierOptions,
              type: "combobox" as const,
              onSearch: setSupplierSearch,
              onLoadMore: fetchNextSuppliers,
              loading: loadingSuppliers,
            },
            {
              key: "inventory_item_id",
              label: "Linh kiện",
              placeholder: "Tất cả linh kiện",
              options: itemOptions,
              type: "combobox" as const,
              onSearch: setItemSearch,
              onLoadMore: fetchNextItems,
              loading: loadingItems,
            },
          ],
        }
      : {
          search: true,
          channel: {
            label: "Chi nhánh",
            placeholder: "Tất cả chi nhánh",
            options: branchOptions,
          },
          status: { options: STATUS_OPTIONS, placeholder: "Tất cả trạng thái" },
          custom: [
            {
              key: "paymentStatus",
              label: "Thanh toán",
              placeholder: "Tất cả thanh toán",
              options: PAYMENT_STATUS_OPTIONS,
            },
            {
              key: "recurring",
              label: "Recurring",
              placeholder: "Tất cả recurring",
              options: RECURRING_OPTIONS,
            },
          ],
        };

  const activeFilterCount = [
    !!searchInput,
    !!dateFrom || !!dateTo || !!period,
    ...(variant === "purchase"
      ? [!!supplierFilter, !!itemFilter]
      : [
          !!branchFilter,
          !!statusFilter,
          !!paymentStatusFilter,
          !!recurringFilter,
        ]),
  ].filter(Boolean).length;

  const visibleItems = useMemo(() => {
    if (!recurringFilter) return items;
    return items.filter((row) =>
      recurringFilter === "RECURRING"
        ? isRecurringDocument(row)
        : !isRecurringDocument(row),
    );
  }, [items, recurringFilter]);

  // -------------------------------------------------------------------------
  // inventory variant
  // -------------------------------------------------------------------------
  if (variant === "inventory") {
    return (
      <OperationalInventoryPage
        config={config}
        loading={loading}
        error={error}
        stockItems={stockItems}
        total={total}
        totalPages={totalPages}
        viewingItemId={viewingItemId}
        movLoadingId={movLoadingId}
        movError={movError}
        movMap={movMap}
        onToggleInventoryExpand={handleToggleInventoryExpand}
        onViewItem={(id) => setViewingItemId(id)}
        onCloseViewItem={() => setViewingItemId(null)}
        onRefetch={() => void listQuery.refetch()}
      />
    );
  }

  // -------------------------------------------------------------------------
  // Render — main variants
  // -------------------------------------------------------------------------
  const tableActions = (
    <OperationalTableActions
      loading={loading}
      onRefresh={() => void listQuery.refetch()}
      onFilterToggle={() => setFilterPanelOpen((v) => !v)}
      activeFilterCount={activeFilterCount}
      onCreate={
        variant === "sales" || variant === "purchase" || variant === "expenses"
          ? () => {
              setEditingRow(null);
              setFormOpen(true);
            }
          : undefined
      }
      ctaLabel={config.cta}
      onCta={config.cta ? () => void createSample() : undefined}
    />
  );

  return (
    <PageLayout
      title={config.title}
      desc={config.desc}
      icon={<FileText className="h-4 w-4" />}
      actions={tableActions}
    >
      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <StandardTable<OperationalDocument>
            columns={columns}
            items={visibleItems}
            getRowKey={(row) => `${row.document_type || variant}-${row.id}`}
            loading={loading}
            error={error}
            emptyLabel={t("Chưa có dữ liệu.")}
            minWidth={980}
            sortArray={
              variant === "purchase"
                ? purchaseSort
                  ? [purchaseSort]
                  : undefined
                : undefined
            }
            onSort={
              variant === "purchase"
                ? (key) => togglePurchaseSort(key)
                : undefined
            }
            actions={(row) => [
              {
                label: t("Chi tiết"),
                icon: <Eye className="h-4 w-4" />,
                onClick: () => void openDetail(row),
              },
              {
                label: "Liên kết tiền",
                icon: <Link2 className="h-4 w-4" />,
                onClick: () => void openSettlement(row),
                hidden:
                  !config.paymentLinkable || Number(row.open_amount || 0) <= 0,
              },
              {
                label: "Nhập kho",
                icon: <Warehouse className="h-4 w-4" />,
                onClick: () => {
                  if (!postingLoading) void openPostingDrawer(row);
                },
                hidden: !canPostReceipt(row, variant),
              },
              {
                label: "Xuất kho",
                icon: <Warehouse className="h-4 w-4" />,
                onClick: () => {
                  if (!postingLoading) void openPostingDrawer(row);
                },
                hidden: !canPostIssue(row, variant),
              },
            ]}
            renderSubRow={
              variant === "purchase"
                ? (item) => <PurchaseSubRow rowId={item.id} />
                : undefined
            }
            expandedRowIds={expandedRowIds}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPage={setPage}
            onPageSize={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
        <FilterPanel
          config={filterConfig}
          filter={{
            state: {
              period,
              dateFrom,
              dateTo,
              channel: branchFilter,
              search: searchInput,
              amountMin: "",
              amountMax: "",
              status: statusFilter,
              counterpartySource: "",
              custom:
                variant === "purchase"
                  ? {
                      supplier_id: supplierFilter,
                      inventory_item_id: itemFilter,
                    }
                  : {
                      paymentStatus: paymentStatusFilter,
                      recurring: recurringFilter,
                    },
            },
            inputs: { search: searchInput, amountMin: "", amountMax: "" },
            panelOpen: filterPanelOpen,
            openPanel: () => setFilterPanelOpen(true),
            closePanel: () => setFilterPanelOpen(false),
            togglePanel: () => setFilterPanelOpen((v) => !v),
            setPeriod: (v) => {
              setPeriod(v);
              if (v) {
                setDateFrom(periodFirstDay(v));
                setDateTo(periodLastDay(v));
              }
              setPage(1);
            },
            setDateFrom: (v) => {
              const newVal =
                v && dateTo && dateTo < v ? monthFirstDay(dateTo) : v;
              setDateFrom(newVal);
              setPeriod("");
              setPage(1);
            },
            setDateTo: (v) => {
              setDateTo(v);
              if (v && dateFrom && v < dateFrom) setDateFrom(monthFirstDay(v));
              setPeriod("");
              setPage(1);
            },
            setChannel: (v: string) => {
              setBranchFilter(v);
              setPage(1);
            },
            setSearchInput: (v: string) => setSearchInput(v),
            setAmountMinInput: () => {},
            setAmountMaxInput: () => {},
            setStatus: (v: string) => {
              setStatusFilter(v);
              setPage(1);
            },
            setCounterpartySource: () => {},
            setCustom: (key: string, v: string) => {
              if (key === "supplier_id") {
                setSupplierFilter(v);
                setPage(1);
              }
              if (key === "inventory_item_id") {
                setItemFilter(v);
                setPage(1);
              }
              if (key === "paymentStatus") {
                setPaymentStatusFilter(v);
                setPage(1);
              }
              if (key === "recurring") {
                setRecurringFilter(v);
                setPage(1);
              }
            },
            resetAll: resetAllFilters,
            hasActiveFilter: activeFilterCount > 0,
            activeFilterCount,
          }}
        />
      </div>

      {/* Form Drawer (sales / purchase / expenses) */}
      <OperationalFormDrawer
        variant={variant as "sales" | "purchase" | "expenses"}
        open={formOpen}
        loading={formLoading}
        editing={editingRow}
        viewOnly={viewOnly}
        poReceipts={poReceipts}
        onClose={() => {
          setFormOpen(false);
          setViewOnly(false);
          setEditingRow(null);
          setPoReceipts([]);
        }}
        onSaved={async () => {
          await listQuery.refetch();
        }}
        onToggleEdit={
          viewOnly
            ? () => {
                setViewOnly(false);
              }
            : undefined
        }
      />

      {/* Detail drawer (non-purchase) */}
      <OperationalDetailDrawer
        open={activeStep === "detail"}
        detailDocument={detailDocument}
        detailLoading={detailLoading}
        detailError={detailError}
        rootDocumentType={rootDocumentType}
        poReceipts={poReceipts}
        onClose={() => resetFlow()}
      />

      {/* Posting drawer */}
      <InventoryPostingDrawer
        open={activeStep === "posting"}
        onClose={closePostingDrawer}
        onSubmit={() => void submitPostingDrawer()}
      />

      {/* Settlement drawer */}
      <SettlementDrawer
        open={activeStep === "settlement"}
        onClose={closeSettlement}
        onSave={() => void saveSettlement()}
        onRemoveLink={(linkId) => void removePaymentLink(linkId)}
      />
    </PageLayout>
  );
}
