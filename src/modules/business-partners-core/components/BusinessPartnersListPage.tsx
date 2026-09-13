import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { StatusBadge } from "@/shared/components/badges";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Badge } from "@/shared/components/ui/badge";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { ViewModeCombobox } from "@/shared/components/ViewModeCombobox";
import { usePageViewPresets } from "@/shared/hooks/usePageViewPresets";
import {
  useUserPreferencesStore,
  type TableViewPreset,
} from "@/shared/hooks/useUserPreferences";
import { useUIStore } from "@/core/config/uiStore";
import { extractApiError } from "@/shared/utils/apiError";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import {
  businessPartnersCoreApi,
  type ErpBusinessPartner,
} from "../api/businessPartnersCoreApi";
import { useBusinessPartnersList } from "../hooks/useBusinessPartnersList";
import { BusinessPartnerDetailDrawer } from "./BusinessPartnerDetailDrawer";

export interface BusinessPartnersListPageProps {
  partnerType: "CUSTOMER" | "VENDOR";
  title: string;
  desc: string;
  icon: React.ReactNode;
}

export function BusinessPartnersListPage({
  partnerType,
  title,
  desc,
  icon,
}: BusinessPartnersListPageProps) {
  const { t } = useTranslation("doitac");
  const showToast = useUIStore((s) => s.showToast);

  const tableId = `erp-${partnerType.toLowerCase()}s-table`;

  // Server-side List Hook
  const listHook = useBusinessPartnersList({ partnerType });

  // Detail Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Delete Confirmation state
  const [deleteTarget, setDeleteTarget] = useState<ErpBusinessPartner | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const openDetail = useCallback(
    (id: string | null, mode: "view" | "edit" = "view") => {
      setSelectedId(id);
      setDrawerMode(mode);
      setDrawerOpen(true);
    },
    [],
  );

  const openCreate = useCallback(() => {
    openDetail(null, "edit");
  }, [openDetail]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await businessPartnersCoreApi.remove(deleteTarget.id);
      showToast({
        title: t("Đã xóa thành công", "Đã xóa thành công"),
        variant: "success",
      });
      setDeleteTarget(null);
      void listHook.refetch();
    } catch (err) {
      showToast({
        variant: "destructive",
        title: t("Xóa thất bại", "Xóa thất bại"),
        description: extractApiError(err, t("Không thể xóa đối tác")),
      });
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, listHook, showToast, t]);

  // View Presets Setup
  const defaultPresets: TableViewPreset[] = useMemo(
    () => [
      {
        key: "overview",
        label: t("Tổng quan", "Tổng quan"),
        filters: {},
        isDefault: true,
        columnVisibility: {
          index: true,
          code: true,
          name: true,
          displayName: false,
          taxCode: false,
          phone: true,
          email: true,
          contactName: true,
          address: false,
          status: true,
          createdAt: false,
        },
      },
      {
        key: "legal_tax",
        label: t("Pháp nhân & Thuế", "Pháp nhân & Thuế"),
        filters: {},
        isDefault: false,
        columnVisibility: {
          index: true,
          code: true,
          name: true,
          displayName: true,
          taxCode: true,
          phone: true,
          email: false,
          contactName: false,
          address: true,
          status: true,
          createdAt: true,
        },
      },
      {
        key: "all_columns",
        label: t("Tất cả cột", "Tất cả cột"),
        filters: {},
        isDefault: false,
        columnVisibility: {
          index: true,
          code: true,
          name: true,
          displayName: true,
          taxCode: true,
          phone: true,
          email: true,
          contactName: true,
          address: true,
          status: true,
          createdAt: true,
        },
      },
    ],
    [t],
  );

  const [activeColumnPresetKey, setActiveColumnPresetKey] =
    useState("overview");

  const columnViewPresetsHook = usePageViewPresets({
    tableId,
    defaultPresets,
    activeView: activeColumnPresetKey,
    onViewChange: (preset: TableViewPreset) => {
      setActiveColumnPresetKey(preset.key);
      if (preset.columnVisibility) {
        const store = useUserPreferencesStore.getState();
        const current = store.getTablePreference(tableId);
        store.setTablePreferences(tableId, {
          columnOrder: current?.columnOrder || [],
          columnVisibility: preset.columnVisibility as any,
          columnSizing: current?.columnSizing,
        });
      }
    },
  });

  const handleColumnPresetChange = (preset: TableViewPreset) => {
    setActiveColumnPresetKey(preset.key);
    columnViewPresetsHook.selectView(preset.key);
  };

  // Helper Header Filter Builder
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook,
        queryKeyPrefix: `bp-${partnerType.toLowerCase()}-options`,
        fetchOptions: ({ columnKey, search, pageParam, filtersStr }) =>
          businessPartnersCoreApi.getColumnOptions({
            column: columnKey,
            search,
            page: pageParam,
            pageSize: 20,
            filters: filtersStr,
            partnerType,
          }),
      }),
    [listHook, partnerType],
  );

  // DataTable Columns Configuration
  const columns: DataTableColumn<ErpBusinessPartner>[] = useMemo(
    () => [
      // 1. Cột STT: 40px, căn giữa tuyệt đối cả header và cell, 1-based index
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: ErpBusinessPartner, idx: number) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },
      // 2. Cột Mã đối tác: TableText + onDetailClick view mode + Quick status badge
      {
        key: "code",
        size: 180,
        enableResizing: true,
        header: headerFilter("code", t("Mã đối tác", "Mã đối tác")),
        cell: (row) => (
          <div className="flex items-center gap-1.5 w-full min-w-0">
            <TableText
              className="flex-1 min-w-0"
              text={row.code}
              enableCopy={true}
              tooltip={true}
              onDetailClick={() => openDetail(row.id, "view")}
            />
            {row.status === "INACTIVE" && (
              <Tooltip content={t("Ngưng hoạt động", "Ngưng hoạt động")}>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0 font-medium ml-auto w-[50px] inline-flex items-center justify-center text-center truncate"
                >
                  {t("Ngưng", "Ngưng")}
                </Badge>
              </Tooltip>
            )}
          </div>
        ),
      },
      // 3. Cột Tên đối tác: font-medium
      {
        key: "name",
        size: 220,
        enableResizing: true,
        header: headerFilter("name", t("Tên đối tác", "Tên đối tác")),
        cell: (row) => (
          <span className="font-medium truncate block" title={row.name}>
            {row.name}
          </span>
        ),
      },
      // 4. Cột Tên hiển thị
      {
        key: "displayName",
        size: 180,
        enableResizing: true,
        header: headerFilter("displayName", t("Tên hiển thị", "Tên hiển thị"), {
          showBlankOption: true,
        }),
        cell: (row) => (
          <span className="text-muted-foreground truncate block">
            {row.displayName || "—"}
          </span>
        ),
      },
      // 5. Cột Mã số thuế
      {
        key: "taxCode",
        size: 160,
        enableResizing: true,
        header: headerFilter("taxCode", t("Mã số thuế", "Mã số thuế"), {
          showBlankOption: true,
        }),
        cell: (row) => (
          <TableText
            text={row.taxCode || "—"}
            enableCopy={Boolean(row.taxCode)}
            tooltip={Boolean(row.taxCode)}
            className="font-mono text-xs text-muted-foreground"
          />
        ),
      },
      // 6. Cột Điện thoại
      {
        key: "phone",
        size: 140,
        enableResizing: true,
        header: headerFilter("phone", t("Điện thoại", "Điện thoại"), {
          showBlankOption: true,
        }),
        cell: (row) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.phone || "—"}
          </span>
        ),
      },
      // 7. Cột Email
      {
        key: "email",
        size: 180,
        enableResizing: true,
        header: headerFilter("email", t("Email", "Email"), {
          showBlankOption: true,
        }),
        cell: (row) => (
          <span className="truncate block text-xs text-muted-foreground">
            {row.email || "—"}
          </span>
        ),
      },
      // 8. Cột Người liên hệ
      {
        key: "contactName",
        size: 180,
        enableResizing: true,
        header: headerFilter(
          "contactName",
          t("Người liên hệ", "Người liên hệ"),
          {
            showBlankOption: true,
          },
        ),
        cell: (row) => (
          <span className="truncate block">{row.contactName || "—"}</span>
        ),
      },
      // 9. Cột Địa chỉ
      {
        key: "address",
        size: 240,
        enableResizing: true,
        header: headerFilter("address", t("Địa chỉ", "Địa chỉ"), {
          showBlankOption: true,
        }),
        cell: (row) => (
          <span
            className="truncate block text-xs text-muted-foreground"
            title={row.address || undefined}
          >
            {row.address || "—"}
          </span>
        ),
      },
      // 10. Cột Trạng thái: StatusBadge fixed width w-[88px], căn giữa, Tooltip
      {
        key: "status",
        size: 130,
        enableResizing: true,
        className: "text-center",
        headerClassName: "text-center",
        header: headerFilter("status", t("Trạng thái", "Trạng thái")),
        cell: (row) => (
          <div className="w-full flex justify-center">
            <Tooltip
              content={
                row.status === "ACTIVE"
                  ? t("Hoạt động", "Hoạt động")
                  : t("Ngưng hoạt động", "Ngưng hoạt động")
              }
            >
              <StatusBadge
                status={row.status}
                className="w-[88px] inline-flex items-center justify-center text-center truncate"
              />
            </Tooltip>
          </div>
        ),
      },
      // 11. Cột Ngày tạo: DateRangeColumnSlot + TableDateCell
      {
        key: "createdAt",
        size: 140,
        enableResizing: true,
        className: "text-right",
        headerClassName: "text-center",
        header: headerFilter.date("createdAt", t("Ngày tạo", "Ngày tạo")),
        cell: (row) => (
          <TableDateCell date={row.createdAt} className="justify-end w-full" />
        ),
      },
    ],
    [headerFilter, openDetail, t],
  );

  // Row Actions: 2 Quick Actions đầu tiên là View và Edit mode
  const getRowActions = useCallback(
    (row: ErpBusinessPartner): ActionDropdownItem[] => [
      {
        groupLabel: "TRA CỨU",
        items: [
          {
            label: t("Xem chi tiết", "Xem chi tiết"),
            icon: <Eye className="w-3.5 h-3.5" />,
            onClick: () => openDetail(row.id, "view"),
          },
        ],
      },
      {
        groupLabel: "THAO TÁC",
        items: [
          {
            label: t("Chỉnh sửa", "Chỉnh sửa"),
            icon: <Pencil className="w-3.5 h-3.5" />,
            onClick: () => openDetail(row.id, "edit"),
          },
          {
            label: t("Xóa", "Xóa"),
            icon: <Trash2 className="w-3.5 h-3.5 text-destructive" />,
            variant: "danger",
            onClick: () => setDeleteTarget(row),
          },
        ],
      },
    ],
    [openDetail, t],
  );

  // View presets switcher node in customActionsNode
  const customActionsNode = (
    <div className="flex items-center gap-2">
      <ViewModeCombobox
        presets={columnViewPresetsHook.presets}
        activePresetKey={activeColumnPresetKey}
        onSelect={handleColumnPresetChange}
        onCreateView={() => {}}
        onEditView={() => {}}
        onDeleteView={() => {}}
        i18nNamespace="doitac"
      />
    </div>
  );

  return (
    <>
      <SpreadsheetPageTemplate<ErpBusinessPartner>
        title={title}
        desc={desc}
        icon={icon}
        tableId={tableId}
        items={listHook.items}
        columns={columns}
        getRowKey={(item) => item.id}
        loading={listHook.isLoading || listHook.isFetching}
        emptyLabel={t("Không có dữ liệu", "Không có dữ liệu")}
        minWidth={1100}
        page={listHook.page}
        pageSize={listHook.pageSize}
        total={listHook.total}
        totalPages={listHook.totalPages}
        onPage={(p) => listHook.setPage(p)}
        onPageSize={(s) => {
          listHook.setPageSize(s);
          listHook.setPage(1);
        }}
        onRefresh={() => void listHook.refetch()}
        activeFilterCount={listHook.activeFilterCount}
        onClearAllFilters={listHook.clearAllFilters}
        createActions={[
          {
            groupLabel: t("Thao tác", "Thao tác"),
            items: [
              {
                label: `${t("Thêm", "Thêm")} ${partnerType === "VENDOR" ? t("nhà cung cấp", "nhà cung cấp") : t("khách hàng", "khách hàng")} ${t("mới", "mới")}`,
                icon: <Plus className="w-4 h-4 text-emerald-600" />,
                onClick: openCreate,
              },
            ],
          },
        ]}
        customActionsNode={customActionsNode}
        rowActions={getRowActions}
      />

      {/* Detail & Form Drawer */}
      <BusinessPartnerDetailDrawer
        open={drawerOpen}
        mode={drawerMode}
        setMode={setDrawerMode}
        onClose={() => setDrawerOpen(false)}
        partnerId={selectedId}
        partnerType={partnerType}
        onSaved={() => void listHook.refetch()}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={t("Xác nhận xóa", "Xác nhận xóa")}
        message={
          deleteTarget
            ? `${t("Bạn có chắc muốn xóa", "Bạn có chắc muốn xóa")} "${deleteTarget.name || deleteTarget.code}"?`
            : ""
        }
        confirmLabel={t("Xóa", "Xóa")}
        cancelLabel={t("Hủy", "Hủy")}
        danger
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </>
  );
}
