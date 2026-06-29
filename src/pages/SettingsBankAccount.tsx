import React, { useState } from "react";
import { Landmark, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";

import {
  bankStatementApi,
  type ErpBankAccount,
} from "@/modules/bank-statements/api/bankStatementApi";
import { BankAccountDrawer } from "@/modules/settings/components/BankAccountDrawer";
import { IconEdit, IconTrash } from "@/modules/settings/components/shared";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { money } from "@/shared/utils/format";
import toast from "react-hot-toast";

export function ThietLapNganHang() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setCustomBreadcrumbs, currentBranchId } = useAppStore();
  const t = useT();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ErpBankAccount | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ErpBankAccount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filterConfig = React.useMemo(() => ({ search: true }), []);
  const filter = useFilterPanel(filterConfig);

  React.useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["nav.items.cashflow"],
      ["thietlap.tabs.ngan-hang"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  const {
    data: accounts = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: () => bankStatementApi.getBankAccounts(),
  });

  const filteredItems = React.useMemo(() => {
    let result = accounts;
    if (filter.state.search) {
      const q = filter.state.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.bankCode?.toLowerCase().includes(q) ||
          a.bankName?.toLowerCase().includes(q) ||
          a.accountNumber?.toLowerCase().includes(q) ||
          a.accountName?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [accounts, filter.state.search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await bankStatementApi.deleteBankAccount(deleteTarget.id);
      refetch();
      toast.success("Xóa tài khoản thành công");
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
      key: "bankCode",
      header: "Mã NH",
      cell: (a: ErpBankAccount) => a.bankCode,
      className: "text-left align-middle",
      headerClassName: "text-center",
    },
    {
      key: "bankName",
      header: "Tên ngân hàng",
      cell: (a: ErpBankAccount) => a.bankName,
      className: "text-left align-middle",
      headerClassName: "text-center",
    },
    {
      key: "accountNumber",
      header: "Số tài khoản",
      cell: (a: ErpBankAccount) => a.accountNumber,
      className: "text-left align-middle",
      headerClassName: "text-center",
    },
    {
      key: "accountName",
      header: "Tên tài khoản",
      cell: (a: ErpBankAccount) => a.accountName,
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
      key: "openingBalance",
      header: "Số dư ban đầu",
      cell: (a: ErpBankAccount) => money(a.openingBalance || 0),
      className: "text-right align-middle",
      headerClassName: "text-center",
    },
    {
      key: "isActive",
      header: "Trạng thái",
      cell: (a: ErpBankAccount) => (a.isActive ? "Hoạt động" : "Ngưng"),
      className: "text-center align-middle",
      headerClassName: "text-center",
    },
  ];

  return (
    <>
      <SpreadsheetPageTemplate
        title={t("thietlap.tabs.ngan-hang")}
        desc={t("thietlap.desc")}
        icon={<Landmark className="h-4 w-4" />}
        tableId="settings-bank-accounts-table"
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
        rowActions={(a: ErpBankAccount) => [
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

      <BankAccountDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        bankAccount={editingItem}
        onSuccess={() => refetch()}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t("common.delete")}
        message={`Bạn có chắc chắn muốn xóa tài khoản ${deleteTarget?.accountNumber}?`}
        loading={deleting}
      />
    </>
  );
}
