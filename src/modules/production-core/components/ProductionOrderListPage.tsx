import { useCallback, useEffect, useMemo, useState } from "react";
import { Factory } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { StandardTable } from "@/shared/components/StandardTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { FilterPanel } from "@/shared/components/FilterPanel";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import { Button } from "@/shared/components/ui/Button";

import {
  productionCoreApi,
  type ErpProductionOrder,
} from "@/modules/production-core/api/productionCoreApi";
import { bomCoreApi } from "@/modules/bom-core/api/bomCoreApi";
import { ProductionOrderDrawer } from "./ProductionOrderDrawer";
import { useProductionOrderDrawer } from "../hooks/useProductionOrderDrawer";

function fmtDate(value?: string | null) {
  if (!value) return "—";
  return value.slice(0, 10);
}

function fmtQty(value?: string | null) {
  if (!value) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

export function ProductionOrderListPage() {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);
  const canRead = useHasPermission("production", "read");
  const canCreate = useHasPermission("production", "create");
  const canUpdate = useHasPermission("production", "update");

  const [orders, setOrders] = useState<ErpProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [itemOptions, setItemOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    bomCoreApi
      .list({ pageSize: 500 })
      .then((res) => {
        const uniqueFgs = new Map();
        res.items.forEach((bom) => {
          if (bom.finishedGoodItemId) {
            uniqueFgs.set(bom.finishedGoodItemId, {
              value: bom.finishedGoodItemId,
              label: bom.finishedGoodItemName || bom.finishedGoodItemId,
            });
          }
        });
        setItemOptions(Array.from(uniqueFgs.values()));
      })
      .catch(console.error);
  }, []);

  const filterConfig = useMemo(
    () => ({
      period: true,
      search: true,
      status: {
        options: [
          { value: "DRAFT", label: "DRAFT" },
          { value: "CONFIRMED", label: "CONFIRMED" },
          { value: "IN_PROGRESS", label: "IN_PROGRESS" },
          { value: "COMPLETED", label: "COMPLETED" },
          { value: "CANCELLED", label: "CANCELLED" },
        ],
        placeholder: t("Trạng thái"),
      },
      custom: [
        {
          key: "finishedGoodItemId",
          label: t("Thành phẩm"),
          placeholder: t("Chọn thành phẩm"),
          options: itemOptions,
          type: "combobox" as const,
        },
      ],
    }),
    [t, itemOptions],
  );

  const filter = useFilterPanel(filterConfig, () => setPage(1));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [editingOrder, setEditingOrder] = useState<ErpProductionOrder | null>(
    null,
  );
  const [drawerLoading, setDrawerLoading] = useState(false);

  const [cancelTarget, setCancelTarget] = useState<ErpProductionOrder | null>(
    null,
  );
  const [canceling, setCanceling] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productionCoreApi.list({
        page,
        pageSize,
        search: filter.state.search || undefined,
        status: filter.state.status || undefined,
        dateFrom: filter.state.dateFrom || undefined,
        dateTo: filter.state.dateTo || undefined,
        finishedGoodItemId: filter.state.custom.finishedGoodItemId || undefined,
      });
      setOrders(res.items);
      setTotal(res.total);
    } catch (e: any) {
      setError(e?.message || t("Không thể tải danh sách lệnh sản xuất"));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filter.state, t]);

  useEffect(() => {
    if (canRead) {
      loadData();
    }
  }, [loadData, canRead]);

  const handleCreate = () => {
    setDrawerMode("create");
    setEditingOrder(null);
    setDrawerOpen(true);
  };

  const handleEdit = async (id: string, viewOnly = false) => {
    setDrawerMode(viewOnly ? "view" : "edit");
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const data = await productionCoreApi.get(id);
      setEditingOrder(data);
    } catch (e: any) {
      showToast({ title: t("Lỗi tải chi tiết"), variant: "destructive" });
      setDrawerOpen(false);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelTarget) return;
    setCanceling(true);
    try {
      await productionCoreApi.cancel(cancelTarget.id);
      showToast({ title: t("Đã hủy lệnh sản xuất"), variant: "success" });
      setCancelTarget(null);
      loadData();
    } catch (e: any) {
      showToast({
        title:
          e?.response?.data?.message || e?.message || t("Không thể hủy lệnh"),
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
    }
  };

  const drawerState = useProductionOrderDrawer({
    open: drawerOpen,
    editing: editingOrder,
    onClose: () => {
      setDrawerOpen(false);
      setEditingOrder(null);
    },
    onSaved: loadData,
  });

  const columns = useMemo(
    () => [
      {
        key: "referenceNo",
        header: t("Reference No"),
        cell: (item: ErpProductionOrder) => (
          <span
            className="cursor-pointer font-medium text-emerald-600 hover:underline"
            onClick={() => handleEdit(item.id, !canUpdate)}
          >
            {item.referenceNo || item.id.split("-")[0]}
          </span>
        ),
      },
      {
        key: "status",
        header: t("Trạng thái"),
        cell: (item: ErpProductionOrder) => (
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
              item.status === "COMPLETED"
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : item.status === "IN_PROGRESS"
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : item.status === "CANCELLED"
                    ? "bg-red-100 text-red-800 border-red-200"
                    : "bg-amber-100 text-amber-800 border-amber-200"
            }`}
          >
            {item.status || "—"}
          </span>
        ),
      },
      {
        key: "finishedGoodItemName",
        header: t("Thành phẩm"),
        cell: (item: ErpProductionOrder) =>
          item.finishedGoodItemName || item.finishedGoodItemId || "—",
      },
      {
        key: "qtyProduced",
        header: t("Tiến độ"),
        cell: (item: ErpProductionOrder) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-700">
              {fmtQty(item.qtyProduced)}
            </span>
            <span className="text-muted-foreground text-xs">
              / {fmtQty(item.qtyToProduce)}
            </span>
          </div>
        ),
      },
      {
        key: "plannedStartDate",
        header: t("Ngày bắt đầu"),
        cell: (item: ErpProductionOrder) => fmtDate(item.plannedStartDate),
      },
      {
        key: "plannedEndDate",
        header: t("Ngày kết thúc"),
        cell: (item: ErpProductionOrder) => fmtDate(item.plannedEndDate),
      },
      {
        key: "actions",
        header: "",
        cell: (item: ErpProductionOrder) => (
          <div className="flex justify-end">
            <ActionDropdown
              items={[
                {
                  label: t("Xem chi tiết"),
                  onClick: () => handleEdit(item.id, true),
                },
                {
                  label: t("Cập nhật"),
                  onClick: () => handleEdit(item.id, false),
                  hidden: !canUpdate || item.status === "CANCELLED",
                },
                {
                  label: t("Hủy lệnh"),
                  onClick: () => setCancelTarget(item),
                  variant: "danger",
                  hidden: !canUpdate || item.status === "CANCELLED",
                },
              ]}
            />
          </div>
        ),
      },
    ],
    [t, canUpdate],
  );

  if (!canRead) return <Forbidden />;

  return (
    <PageLayout
      title={t("Lệnh Sản Xuất")}
      desc={t("Quản lý và theo dõi tiến độ lệnh sản xuất.")}
      icon={<Factory className="h-5 w-5" />}
      actions={
        <TableActionGroup
          loading={loading}
          onRefresh={loadData}
          onFilterToggle={filter.togglePanel}
          activeFilterCount={filter.activeFilterCount}
          onCreate={canCreate ? handleCreate : undefined}
          createLabel={t("Tạo mới")}
        />
      }
    >
      {error && (
        <div className="mb-4 text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <StandardTable<ErpProductionOrder>
            items={orders}
            columns={columns}
            getRowKey={(i) => i.id}
            loading={loading}
            emptyLabel={t("Chưa có lệnh sản xuất nào")}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={Math.ceil(total / pageSize)}
            onPage={setPage}
            onPageSize={setPageSize}
          />
        </div>
        <FilterPanel config={filterConfig} filter={filter} />
      </div>

      <ProductionOrderDrawer
        open={drawerOpen}
        loading={drawerLoading}
        editing={editingOrder}
        viewOnly={drawerMode === "view"}
        onClose={() => setDrawerOpen(false)}
        onSaved={loadData}
        drawerState={drawerState}
      />

      {cancelTarget && (
        <ConfirmModal
          open={true}
          title={t("Hủy lệnh sản xuất")}
          message={t(
            `Bạn có chắc muốn hủy lệnh sản xuất ${cancelTarget.referenceNo || cancelTarget.id}? Hành động này không thể hoàn tác và sẽ hoàn trả các nguyên vật liệu đã xuất (nếu có).`,
          )}
          confirmLabel={t("Xác nhận hủy")}
          danger={true}
          onConfirm={handleCancelOrder}
          onCancel={() => setCancelTarget(null)}
          loading={canceling}
        />
      )}
    </PageLayout>
  );
}
