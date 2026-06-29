import React, { useState } from "react";
import { Wallet, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";

import {
  bankStatementApi,
  type ErpCashBook,
} from "@/modules/bank-statements/api/bankStatementApi";
import { CashFundDrawer } from "@/modules/settings/components/CashFundDrawer";
import { IconEdit, IconTrash } from "@/modules/settings/components/shared";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { money } from "@/shared/utils/format";
import toast from "react-hot-toast";

export function ThietLapQuy() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setCustomBreadcrumbs, currentBranchId } = useAppStore();
  const t = useT();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ErpCashBook | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ErpCashBook | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filterConfig = React.useMemo(() => ({ search: true }), []);
  const filter = useFilterPanel(filterConfig);

  React.useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["nav.items.cashflow"],
      ["thietlap.tabs.quy"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  const {
    data: cashBooks = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["cash-books"],
    queryFn: () => bankStatementApi.getCashBooks(),
  });

  const filteredItems = React.useMemo(() => {
    let result = cashBooks;
    if (filter.state.search) {
      const q = filter.state.search.toLowerCase();
      result = result.filter((a) => a.name?.toLowerCase().includes(q));
    }
    return result;
  }, [cashBooks, filter.state.search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await bankStatementApi.deleteCashBook(deleteTarget.id);
      refetch();
      toast.success("Xóa sổ quỹ thành công");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setDrawerOpen(true);
  };

  const columns = [
    {
      key: "name",
      header: "Tên sổ quỹ",
      cell: (a: ErpCashBook) => a.name,
      className: "text-left align-middle",
      headerClassName: "text-center",
    },
    {
      key: "branch",
      header: "Chi nhánh",
      cell: (a: any) => a.branch?.name || "",
      className: "text-left align-middle",
      headerClassName: "text-center",
    },
    {
      key: "currency",
      header: "Tiền tệ",
      cell: (a: ErpCashBook) => a.currency,
      className: "text-center align-middle",
      headerClassName: "text-center",
    },
    {
      key: "openingBalance",
      header: "Số dư ban đầu",
      cell: (a: ErpCashBook) => money(a.openingBalance || 0),
      className: "text-right align-middle",
      headerClassName: "text-center",
    },
    {
      key: "isActive",
      header: "Trạng thái",
      cell: (a: ErpCashBook) => (a.isActive ? "Hoạt động" : "Ngưng"),
      className: "text-center align-middle",
      headerClassName: "text-center",
    },
  ];

  return (
    <>
      <SpreadsheetPageTemplate
        title={t("thietlap.tabs.quy")}
        desc={t("thietlap.desc")}
        icon={<Wallet className="h-4 w-4" />}
        tableId="settings-cash-funds-table"
        items={filteredItems}
        columns={columns}
        getRowKey={(a) => a.id}
        loading={isLoading}
        emptyLabel={t("common.noData")}
        filterConfig={filterConfig}
        filter={filter}
        createActions={[
          {
            label: "Tạo mới",
            icon: <Plus className="w-4 h-4 text-emerald-600" />,
            onClick: handleCreate,
          },
        ]}
        onRefresh={() => refetch()}
        page={1}
        pageSize={500}
        total={filteredItems.length}
        totalPages={1}
        onPage={() => {}}
        onPageSize={() => {}}
        rowActions={(a: ErpCashBook) => [
          {
            label: t("common.edit"),
            icon: <IconEdit />,
            onClick: () => {
              setEditingItem(a);
              setDrawerOpen(true);
            },
          },
          {
            label: t("common.delete"),
            icon: <IconTrash />,
            variant: "danger",
            onClick: () => setDeleteTarget(a),
          },
        ]}
      />

      <CashFundDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cashBook={editingItem}
        onSuccess={() => refetch()}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t("common.delete")}
        message={`Bạn có chắc chắn muốn xóa sổ quỹ ${deleteTarget?.name}?`}
        loading={deleting}
      />
    </>
  );
}
