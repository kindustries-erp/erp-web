import React, { useState } from "react";
import { GitBranch, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import {
  getBranchesApi,
  type Branch,
  deleteBranchApi,
} from "@/modules/branches/api/branchApi";
import { BranchFormDrawer } from "@/modules/branches/components/BranchFormDrawer";
import { IconEdit, IconTrash } from "@/modules/settings/components/shared";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import toast from "react-hot-toast";

export function SettingsBranch() {
  const { setCustomBreadcrumbs } = useAppStore();
  const t = useT();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filterConfig = React.useMemo(() => ({ search: true }), []);
  const filter = useFilterPanel(filterConfig);

  React.useEffect(() => {
    setCustomBreadcrumbs([
      ["nav.sections.system"],
      ["thietlap.tabs.chi-nhanh"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  const {
    data: branches = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["branches:list"],
    queryFn: getBranchesApi,
  });

  const filteredItems = React.useMemo(() => {
    let result = branches;
    if (filter.state.search) {
      const q = filter.state.search.toLowerCase();
      result = result.filter(
        (b) =>
          b.code.toLowerCase().includes(q) || b.name.toLowerCase().includes(q),
      );
    }
    return result;
  }, [branches, filter.state.search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBranchApi(deleteTarget.id);
      refetch();
      toast.success("Xóa chi nhánh thành công");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      key: "code",
      header: "Mã",
      cell: (b: Branch) => b.code,
      className: "text-left align-middle",
      headerClassName: "text-center",
    },
    {
      key: "name",
      header: "Tên chi nhánh",
      cell: (b: Branch) => b.name,
      className: "text-left align-middle",
      headerClassName: "text-center",
    },
    {
      key: "is_active",
      header: "Trạng thái",
      cell: (b: Branch) => (b.is_active ? "Hoạt động" : "Ngưng"),
      className: "text-center align-middle",
      headerClassName: "text-center",
    },
  ];

  return (
    <>
      <SpreadsheetPageTemplate
        title={t("thietlap.tabs.chi-nhanh")}
        desc={t("thietlap.desc")}
        icon={<GitBranch className="h-4 w-4" />}
        tableId="settings-branch-table"
        items={filteredItems}
        columns={columns}
        getRowKey={(b) => b.id}
        loading={isLoading}
        emptyLabel={t("common.noData")}
        page={1}
        pageSize={500}
        total={filteredItems.length}
        totalPages={1}
        onPage={() => {}}
        onPageSize={() => {}}
        filterConfig={filterConfig}
        filter={filter}
        createActions={[
          {
            label: "Tạo mới",
            icon: <Plus className="w-4 h-4 text-emerald-600" />,
            onClick: () => {
              setEditingBranch(null);
              setDrawerOpen(true);
            },
          },
        ]}
        onRefresh={() => refetch()}
        rowActions={(b: Branch) => [
          {
            label: t("common.edit"),
            icon: <IconEdit />,
            onClick: () => {
              setEditingBranch(b);
              setDrawerOpen(true);
            },
          },
          {
            label: t("common.delete"),
            icon: <IconTrash />,
            variant: "danger",
            onClick: () => setDeleteTarget(b),
          },
        ]}
      />

      <BranchFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        branch={editingBranch}
        onSuccess={() => refetch()}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t("common.delete")}
        message={`Bạn có chắc chắn muốn xóa chi nhánh ${deleteTarget?.code}?`}
        loading={deleting}
      />
    </>
  );
}
