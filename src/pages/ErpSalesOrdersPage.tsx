import { useEffect, useMemo, useState } from "react";
import {
  PackageCheck,
  RotateCcw,
  Trash2,
  XCircle,
  PackagePlus,
  Eye,
  Pencil,
  FileText,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import {
  salesOrdersCoreApi,
  type ErpSalesOrder,
} from "@/modules/sales-orders-core/api/salesOrdersCoreApi";
import { basicMastersApi } from "@/modules/basic-masters/api/basicMastersApi";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { Forbidden } from "@/pages/Forbidden";
import { updateEntityTags } from "@/modules/tags/api/tagsApi";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import { DeliveryConfirmModal } from "@/modules/sales-orders-core/components/DeliveryConfirmModal";
import { useSalesOrdersList } from "@/modules/sales-orders-core/hooks/useSalesOrdersList";
import { useSalesOrderColumns } from "@/modules/sales-orders-core/hooks/useSalesOrderColumns";

import {
  SoFormDrawer,
  type SoForm,
  type SoLineForm,
  buildForm,
  emptyForm,
  emptyLine,
  toPayload,
  calcAmount,
} from "@/modules/sales-orders-core/components/SoFormDrawer";

export function ErpSalesOrdersPage() {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);

  const canRead = useHasPermission(ErpResource.SALES_ORDERS, ErpAction.READ);
  const canCreate = useHasPermission(
    ErpResource.SALES_ORDERS,
    ErpAction.CREATE,
  );
  const canUpdate = useHasPermission(
    ErpResource.SALES_ORDERS,
    ErpAction.UPDATE,
  );
  const canDelete = useHasPermission(
    ErpResource.SALES_ORDERS,
    ErpAction.DELETE,
  );

  const list = useSalesOrdersList();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [editing, setEditing] = useState<ErpSalesOrder | null>(null);
  const [viewOnly, setViewOnly] = useState(true);

  const [form, setForm] = useState<SoForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ErpSalesOrder | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<ErpSalesOrder | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [pendingTagIds, setPendingTagIds] = useState<string[]>([]);
  const [deliveryConfirmItem, setDeliveryConfirmItem] = useState<{
    id: string;
    serialIds: string[];
  } | null>(null);

  const [xlsxExportingId, setXlsxExportingId] = useState<string | null>(null);

  const [customerSearch, setCustomerSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  const {
    data: customersData,
    fetchNextPage: fetchNextCustomers,
    isFetchingNextPage: loadingCustomers,
  } = useBasicMasterInfinite({
    search: customerSearch,
    limit: 50,
    entities: "customers",
  });

  const {
    data: itemsData,
    fetchNextPage: fetchNextItems,
    isFetchingNextPage: loadingItems,
  } = useBasicMasterInfinite({
    search: itemSearch,
    limit: 50,
    entities: "inventoryItems",
    inventoryItemAttributes: viewOnly ? "" : "CAN_BE_SOLD",
  });

  const customerOptions = useMemo(() => {
    return (
      customersData?.pages.flatMap((p) =>
        (p.items.customers || []).map((c) => ({
          value: c.id,
          label: `${c.code} — ${c.displayName || c.name}`,
        })),
      ) || []
    );
  }, [customersData]);

  const itemOptions = useMemo(() => {
    return (
      itemsData?.pages.flatMap((p) =>
        (p.items.inventoryItems || []).map((i) => ({
          value: i.id,
          label: `${i.sku} — ${i.itemName}`,
          original: i,
        })),
      ) || []
    );
  }, [itemsData]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRefresh = () => {
      list.loadOrders();
    };
    window.addEventListener("refresh_erp_data", handleRefresh);
    return () => window.removeEventListener("refresh_erp_data", handleRefresh);
  }, [list]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get("viewId");
    if (viewId) {
      openView({ id: viewId } as ErpSalesOrder, "view");
      params.delete("viewId");
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState(null, "", newUrl);
    }

    const handleOpenDoc = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.type === "erp_sales_order" && detail.id) {
        openView({ id: detail.id } as ErpSalesOrder, "view");
      }
    };
    window.addEventListener("open_erp_document", handleOpenDoc);

    return () => {
      window.removeEventListener("open_erp_document", handleOpenDoc);
    };
  }, []);

  function resetForm() {
    setForm(emptyForm());
    setEditing(null);
    setViewOnly(false);
    setSaveError(null);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    resetForm();
    setPendingTagIds([]);
  }

  async function openCreate() {
    resetForm();
    try {
      const nextNo = await salesOrdersCoreApi.nextNo();
      setForm((prev) => ({ ...prev, soNo: nextNo }));
    } catch {
      // ignore
    }
    setDrawerOpen(true);
  }

  async function openView(item: ErpSalesOrder, mode: "view" | "edit" = "view") {
    setViewOnly(mode === "view");
    setSaveError(null);
    setEditing(item);
    setForm(buildForm(item));
    setDrawerLoading(true);
    setDrawerOpen(true);
    try {
      const detail = await salesOrdersCoreApi.get(item.id);
      const customerName = detail.customerName || item.customerName;

      const mergedDetail = { ...detail, customerName };
      setEditing(mergedDetail);
      setForm(buildForm(mergedDetail));

      if (!customerName && detail.customerId) {
        basicMastersApi
          .list({
            search: detail.customerId || undefined,
            entities: "customers",
          })
          .then((res) => {
            const c = res.items.customers?.find(
              (x: any) => x.id === detail.customerId,
            );
            if (c) {
              const name = `${c.code} — ${c.displayName || c.name}`;
              setEditing((prev) =>
                prev?.id === detail.id ? { ...prev, customerName: name } : prev,
              );
            }
          });
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không thể tải chi tiết sales order",
      );
    } finally {
      setDrawerLoading(false);
    }
  }

  function updateLine(index: number, patch: Partial<SoLineForm>) {
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.map((line, i) => {
        if (i !== index) return line;
        const next = { ...line, ...patch };
        return {
          ...next,
          amount: calcAmount(next.qtyOrdered, next.unitPrice),
        };
      }),
    }));
  }

  function addLine() {
    setForm((prev) => ({ ...prev, lines: [...prev.lines, emptyLine()] }));
  }

  function removeLine(index: number) {
    setForm((prev) => ({
      ...prev,
      lines:
        prev.lines.length === 1
          ? [emptyLine()]
          : prev.lines.filter((_, i) => i !== index),
    }));
  }

  async function handleSave(overrideStatus?: string) {
    if (viewOnly) {
      closeDrawer();
      return;
    }

    if (!form.soNo.trim()) {
      setSaveError("Số đơn bán hàng là bắt buộc");
      return;
    }

    if (!form.customerId) {
      setSaveError("Khách hàng là bắt buộc");
      return;
    }

    if (
      !form.lines.length ||
      form.lines.some((line) => !line.qtyOrdered.trim())
    ) {
      setSaveError("Mỗi dòng phải có số lượng đặt hợp lệ");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        ...toPayload(form),
        status: overrideStatus || form.status,
      };

      if (payload.status === "DRAFT") {
        payload.lines = payload.lines?.map((l) => ({
          ...l,
          serialIds: undefined,
        }));
      }

      if (editing) {
        await salesOrdersCoreApi.update(editing.id, payload);
      } else {
        const created = await salesOrdersCoreApi.create(payload);
        // Option B: apply pending tags after create
        if (pendingTagIds.length > 0 && created?.id) {
          try {
            await updateEntityTags(
              "erp_sales_order",
              created.id,
              pendingTagIds,
            );
          } catch {
            // tags are non-critical
          }
        }
      }
      closeDrawer();
      if (!editing && list.page !== 1) list.setPage(1);
      else await list.loadOrders();
    } catch (e: any) {
      setSaveError(
        e?.response?.data?.message || e?.message || "Không thể lưu sales order",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleReserve(item: ErpSalesOrder) {
    setError(null);
    try {
      await salesOrdersCoreApi.reserve(item.id);
      await list.loadOrders();
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Không thể reserve SO",
      );
    }
  }

  async function handleUnreserve(item: ErpSalesOrder) {
    setError(null);
    try {
      await salesOrdersCoreApi.unreserve(item.id);
      await list.loadOrders();
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Không thể unreserve SO",
      );
    }
  }

  async function handleConfirmAllDelivery(item: ErpSalesOrder) {
    setError(null);
    try {
      await salesOrdersCoreApi.confirmAllDelivery(item.id);
      await list.loadOrders();
      window.dispatchEvent(new CustomEvent("refresh_erp_data"));
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Không thể xác nhận giao hàng",
      );
    }
  }

  async function handleRowConfirmDelivery(item: ErpSalesOrder) {
    try {
      const detail = await salesOrdersCoreApi.get(item.id);
      const serialIds =
        detail?.lines?.flatMap(
          (l: any) => l.selectedSerialIds || l.serialIds || [],
        ) || [];
      if (serialIds.length > 0) {
        setDeliveryConfirmItem({ id: item.id, serialIds });
      } else {
        if (
          window.confirm(
            t(
              "Bạn có chắc chắn muốn xác nhận giao hàng cho toàn bộ đơn hàng này?",
            ),
          )
        ) {
          void handleConfirmAllDelivery(item);
        }
      }
    } catch (e: any) {
      setError(e?.message || "Không thể tải chi tiết SO");
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await salesOrdersCoreApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await list.loadOrders();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Không thể xóa SO");
    } finally {
      setDeleting(false);
    }
  }

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    setCanceling(true);
    try {
      await salesOrdersCoreApi.cancel(cancelTarget.id);
      setCancelTarget(null);
      await list.loadOrders();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Không thể hủy SO");
    } finally {
      setCanceling(false);
    }
  }

  const handleExportXlsx = async (id: string, refNo?: string) => {
    try {
      setXlsxExportingId(id);
      const blob = await salesOrdersCoreApi.exportXlsx(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `DonBanHang_${refNo || id.split("-")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      showToast({
        title: t("Lỗi xuất file"),
        description:
          err.response?.data?.message || t("Đã xảy ra lỗi khi xuất Excel."),
        variant: "destructive",
      });
    } finally {
      setXlsxExportingId(null);
    }
  };

  const columns = useSalesOrderColumns({
    tableState: list.columnState,
    onOpenDetail: openView,
  });

  const summaryRow = useMemo(() => {
    const totalQty = list.items.reduce(
      (acc, curr) =>
        acc +
        (curr.lines?.reduce(
          (sum, line) => sum + Number(line.qtyOrdered || 0),
          0,
        ) || 0),
      0,
    );
    return {
      customerName: null,
      totalQty: (
        <span className="tabular-nums font-semibold text-primary">
          {totalQty.toLocaleString("vi-VN")}
        </span>
      ),
    };
  }, [list.items]);

  if (!canRead) return <Forbidden />;

  return (
    <SpreadsheetPageTemplate<ErpSalesOrder>
      title={t("Đơn bán hàng")}
      desc={t("Quản lý đơn bán hàng và reserve tồn kho.")}
      icon={<FileText className="h-4 w-4" />}
      tableId="sales-orders-table"
      loading={list.loading || list.isFetching}
      summaryRow={summaryRow}
      onRefresh={list.loadOrders}
      activeFilterCount={list.activeFilterCount}
      onClearAllFilters={list.clearAllFilters}
      sortArray={list.columnState.sorts}
      onSort={(field) => {
        const current = list.columnState.sorts.find(
          (s) => s === field || s === `-${field}`,
        );
        const nextState: "asc" | "desc" | "none" = !current
          ? "asc"
          : current.startsWith("-")
            ? "none"
            : "desc";
        list.columnState.setSort(field, nextState);
      }}
      getRowClassName={(item) =>
        item.status === "CANCELLED"
          ? "opacity-40 text-muted-foreground"
          : undefined
      }
      createActions={
        canCreate
          ? [
              {
                groupLabel: t("groupThemMoi", "Thêm mới"),
                items: [
                  {
                    label: t("Tạo mới"),
                    icon: <PackagePlus className="w-4 h-4 text-emerald-600" />,
                    onClick: openCreate,
                  },
                ],
              },
            ]
          : undefined
      }
      error={error}
      items={list.items}
      columns={columns}
      getRowKey={(item) => item.id}
      total={list.total}
      totalPages={list.totalPages}
      page={list.page}
      pageSize={list.pageSize}
      onPage={list.setPage}
      onPageSize={(size) => {
        list.setPageSize(size);
        list.setPage(1);
      }}
      rowActions={(item) => [
        {
          groupLabel: t("groupTraCuu", "Tra cứu"),
          items: [
            {
              label: t("Chi tiết"),
              icon: <Eye className="h-[13px] w-[13px]" />,
              onClick: () => void openView(item, "view"),
            },
            {
              label: t("Xuất XLSX"),
              onClick: () => void handleExportXlsx(item.id, item.soNo),
              icon: <FileSpreadsheet className="h-[13px] w-[13px]" />,
              disabled: xlsxExportingId === item.id,
              hidden: item.status === "DRAFT",
            },
          ],
        },
        {
          groupLabel: t("groupThaoTac", "Thao tác"),
          items: [
            {
              label: t("Chỉnh sửa"),
              icon: <Pencil className="h-[13px] w-[13px]" />,
              onClick: () => void openView(item, "edit"),
              disabled: !canUpdate || item.status === "CANCELLED",
            },
            {
              label: t("Reserve"),
              icon: <PackageCheck className="h-[13px] w-[13px]" />,
              onClick: () => void handleReserve(item),
              hidden: !canUpdate || !["CONFIRMED"].includes(item.status || ""),
            },
            {
              label: t("Unreserve"),
              icon: <RotateCcw className="h-[13px] w-[13px]" />,
              onClick: () => void handleUnreserve(item),
              hidden:
                !canUpdate ||
                !["RESERVED", "PARTIAL_RESERVED"].includes(item.status || ""),
            },
            {
              label: t("Xác nhận giao hàng"),
              icon: <CheckCircle className="h-[13px] w-[13px]" />,
              onClick: () => {
                void handleRowConfirmDelivery(item);
              },
              hidden:
                !canUpdate ||
                !["DELIVERING", "PARTIAL_DELIVERING"].includes(
                  item.status || "",
                ),
            },
            {
              label: t("Xóa"),
              icon: <Trash2 className="h-[13px] w-[13px]" />,
              variant: "danger",
              onClick: () => setDeleteTarget(item),
              hidden: !canDelete || item.status !== "DRAFT",
            },
            {
              label: t("Hủy phiếu"),
              icon: <XCircle className="h-[13px] w-[13px]" />,
              variant: "danger",
              onClick: () => setCancelTarget(item),
              hidden:
                !canUpdate ||
                !["CONFIRMED", "PARTIAL_RESERVED", "RESERVED"].includes(
                  item.status || "",
                ),
            },
          ],
        },
      ]}
    >
      <ConfirmModal
        open={!!deleteTarget}
        title="Xác nhận xóa"
        message={deleteTarget ? `Xóa đơn bán hàng "${deleteTarget.soNo}"?` : ""}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        loading={deleting}
        danger
      />

      <ConfirmModal
        open={!!cancelTarget}
        title="Xác nhận hủy"
        message={cancelTarget ? `Hủy đơn bán hàng "${cancelTarget.soNo}"?` : ""}
        confirmLabel="Hủy phiếu"
        cancelLabel="Quay lại"
        onConfirm={() => void handleConfirmCancel()}
        onCancel={() => {
          if (!canceling) setCancelTarget(null);
        }}
        loading={canceling}
        danger
      />

      <SoFormDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        mode={viewOnly ? "view" : editing ? "edit" : "create"}
        editing={editing}
        form={form}
        setForm={setForm}
        drawerLoading={drawerLoading}
        saving={saving}
        saveError={saveError}
        handleSave={handleSave}
        onRefresh={list.loadOrders}
        customerOptions={customerOptions}
        setCustomerSearch={setCustomerSearch}
        fetchNextCustomers={fetchNextCustomers}
        loadingCustomers={loadingCustomers}
        itemOptions={itemOptions}
        setItemSearch={setItemSearch}
        fetchNextItems={fetchNextItems}
        loadingItems={loadingItems}
        addLine={addLine}
        removeLine={removeLine}
        updateLine={updateLine}
        pendingTagIds={pendingTagIds}
        onPendingTagsChange={setPendingTagIds}
        onToggleEdit={
          viewOnly &&
          canUpdate &&
          editing &&
          !["CANCELLED"].includes(editing.status || "DRAFT")
            ? () => setViewOnly(false)
            : undefined
        }
      />

      <DeliveryConfirmModal
        open={!!deliveryConfirmItem}
        onClose={() => setDeliveryConfirmItem(null)}
        serialIds={deliveryConfirmItem?.serialIds || []}
        onConfirmSuccess={() => {
          setDeliveryConfirmItem(null);
          list.loadOrders();
          window.dispatchEvent(new CustomEvent("refresh_erp_data"));
        }}
      />
    </SpreadsheetPageTemplate>
  );
}
