import React, { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Settings,
  Eye,
  Pencil,
  Trash2,
  Lock,
  Tag,
  AlignLeft,
  Hash,
  ListFilter,
  Calendar,
  ToggleLeft,
  Layers,
  FolderTree,
  Building2,
  Package,
} from "lucide-react";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import { cn } from "@/shared/utils";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { Badge } from "@/shared/components/ui/badge";
import { PillTabs } from "@/shared/components/PillTabs";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import type { TabItem } from "@/shared/components/PageLayout";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import {
  moduleConfigApi,
  type ModuleAttributeFieldType,
} from "@/core/api/moduleConfigApi";
import {
  ERP_MODULE_REGISTRY,
  ERP_DOMAIN_REGISTRY,
} from "@/shared/components/ModuleCustomFieldConfigDrawer";
import {
  useCustomFieldsList,
  type CustomFieldRow,
} from "./settings/hooks/useCustomFieldsList";
import { CustomFieldFormDrawer } from "./settings/components/CustomFieldFormDrawer";

const FIELD_TYPE_BADGES: Record<
  ModuleAttributeFieldType,
  {
    labelKey: string;
    defaultLabel: string;
    icon: React.ReactNode;
    colorCls: string;
  }
> = {
  TEXT: {
    labelKey: "moduleConfig.fieldTypes.text.short",
    defaultLabel: "Văn bản",
    icon: <AlignLeft className="w-3 h-3" />,
    colorCls:
      "border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 text-foreground",
  },
  NUMBER: {
    labelKey: "moduleConfig.fieldTypes.number.short",
    defaultLabel: "Số",
    icon: <Hash className="w-3 h-3" />,
    colorCls:
      "border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 text-foreground",
  },
  SELECT: {
    labelKey: "moduleConfig.fieldTypes.select.short",
    defaultLabel: "Lựa chọn",
    icon: <ListFilter className="w-3 h-3" />,
    colorCls: "border-primary/30 bg-primary/10 text-primary font-medium",
  },
  DATE: {
    labelKey: "moduleConfig.fieldTypes.date.short",
    defaultLabel: "Ngày",
    icon: <Calendar className="w-3 h-3" />,
    colorCls:
      "border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 text-foreground",
  },
  CHECKBOX: {
    labelKey: "moduleConfig.fieldTypes.checkbox.short",
    defaultLabel: "Hộp kiểm",
    icon: <ToggleLeft className="w-3 h-3" />,
    colorCls:
      "border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 text-foreground",
  },
};

export function CustomFieldsPage() {
  const t = useT();
  const { setCustomBreadcrumbs } = useAppStore();

  // Read initial query params from URL
  const initialTab = useMemo(() => {
    if (typeof window === "undefined") return "ALL";
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "ALL";
  }, []);

  const initialModule = useMemo(() => {
    if (typeof window === "undefined") return "ALL";
    const params = new URLSearchParams(window.location.search);
    return params.get("module") || "ALL";
  }, []);

  // Main List Hook
  const listHook = useCustomFieldsList(initialTab, initialModule);

  // Sync state changes with URL query parameters
  useEffect(() => {
    const url = new URL(window.location.href);
    if (listHook.activeDomain === "ALL") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", listHook.activeDomain);
    }

    if (listHook.activeModule === "ALL") {
      url.searchParams.delete("module");
    } else {
      url.searchParams.set("module", listHook.activeModule);
    }

    window.history.replaceState(null, "", url.toString());
  }, [listHook.activeDomain, listHook.activeModule]);

  // Set standard 3-tier Breadcrumb
  useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.settings"],
      ["breadcrumb.catalog"],
      ["nav.items.customFields"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  // Drawer Management
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "create">(
    "view",
  );
  const [selectedRow, setSelectedRow] = useState<CustomFieldRow | null>(null);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState<CustomFieldRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setSelectedRow(null);
    setDrawerMode("create");
    setDrawerOpen(true);
  };

  const openDetail = (row: CustomFieldRow, mode: "view" | "edit" = "view") => {
    setSelectedRow(row);
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.isSystem) {
      toast.error(
        t(
          "moduleConfig.coreSystemOptionCantDelete",
          "Thuộc tính hệ thống không thể xóa.",
        ),
      );
      setDeleteTarget(null);
      return;
    }
    if (deleteTarget.usageCount > 0) {
      toast.error(
        t(
          "moduleConfig.deleteAttrInUse",
          `Thuộc tính đang được sử dụng trong ${deleteTarget.usageCount} bản ghi, không thể xóa. Vui lòng chuyển sang Ngừng hoạt động.`,
        ),
      );
      setDeleteTarget(null);
      return;
    }

    setDeleting(true);
    try {
      await moduleConfigApi.deleteAttributeDef(deleteTarget.id);
      toast.success(t("moduleConfig.attrDeleted", "Xóa thuộc tính thành công"));
      listHook.refetch();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e.message || "Lỗi xóa thuộc tính",
      );
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // 1. Header Page Tabs (by Domain)
  const pageTabs: TabItem[] = useMemo(
    () => [
      { value: "ALL", label: t("common.all", "Tất cả") },
      {
        value: "FINANCE",
        label: t(
          ERP_DOMAIN_REGISTRY.FINANCE.titleKey,
          ERP_DOMAIN_REGISTRY.FINANCE.defaultTitle,
        ),
      },
      {
        value: "INVENTORY",
        label: t(
          ERP_DOMAIN_REGISTRY.INVENTORY.titleKey,
          ERP_DOMAIN_REGISTRY.INVENTORY.defaultTitle,
        ),
      },
      {
        value: "PRODUCTION",
        label: t(
          ERP_DOMAIN_REGISTRY.PRODUCTION.titleKey,
          ERP_DOMAIN_REGISTRY.PRODUCTION.defaultTitle,
        ),
      },
      {
        value: "COMMERCE",
        label: t(
          ERP_DOMAIN_REGISTRY.COMMERCE.titleKey,
          ERP_DOMAIN_REGISTRY.COMMERCE.defaultTitle,
        ),
      },
      {
        value: "GARAGE",
        label: t(
          ERP_DOMAIN_REGISTRY.GARAGE.titleKey,
          ERP_DOMAIN_REGISTRY.GARAGE.defaultTitle,
        ),
      },
    ],
    [t],
  );

  // Available modules for Toolbar Sub-filter
  const availableSubModules = useMemo(() => {
    if (listHook.activeDomain === "ALL") {
      return ERP_MODULE_REGISTRY;
    }
    return ERP_MODULE_REGISTRY.filter(
      (m) => m.domain === listHook.activeDomain,
    );
  }, [listHook.activeDomain]);

  const modulePillItems = useMemo(() => {
    return [
      { value: "ALL", label: t("common.all", "Tất cả phân hệ") },
      ...availableSubModules.map((m) => ({
        value: m.key,
        label: t(m.nameKey, m.defaultName),
      })),
    ];
  }, [availableSubModules, t]);

  // Column Header Filter Builder
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook,
        items: listHook.rows,
      }),
    [listHook],
  );

  // Table Columns Definition
  const columns: DataTableColumn<CustomFieldRow>[] = useMemo(
    () => [
      // 1. Cột STT (Index) — 40px, 1-based, căn giữa
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className:
          "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
        cell: (_, idx) => (
          <span className="w-full block text-center font-mono">{idx}</span>
        ),
      },

      // 2. Cột Khối nghiệp vụ (Domain) — Bên trái cột Phân hệ
      {
        key: "domain",
        header: headerFilter(
          "domain",
          t("moduleConfig.domain", "Khối nghiệp vụ"),
          {
            filterOptions: [
              {
                label: t("moduleConfig.domains.finance", "Kế toán & Tài chính"),
                value: "FINANCE",
              },
              {
                label: t("moduleConfig.domains.inventory", "Kho vận & Tồn kho"),
                value: "INVENTORY",
              },
              {
                label: t(
                  "moduleConfig.domains.production",
                  "Sản xuất & Kỹ thuật",
                ),
                value: "PRODUCTION",
              },
              {
                label: t(
                  "moduleConfig.domains.commerce",
                  "Mua hàng & Bán hàng",
                ),
                value: "COMMERCE",
              },
              {
                label: t("moduleConfig.domains.garage", "Garage & Dịch vụ"),
                value: "GARAGE",
              },
            ],
          },
        ),
        size: 170,
        minSize: 140,
        enableResizing: true,
        cell: (row) => {
          const domDef = ERP_DOMAIN_REGISTRY[row.domain];
          return (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="opacity-70 text-muted-foreground shrink-0">
                {domDef?.icon || <Building2 className="w-3.5 h-3.5" />}
              </span>
              <span className="truncate text-xs font-medium text-foreground">
                {domDef ? t(domDef.titleKey, domDef.defaultTitle) : row.domain}
              </span>
            </div>
          );
        },
      },

      // 3. Cột Phân hệ (Module)
      {
        key: "moduleKey",
        header: headerFilter(
          "moduleKey",
          t("moduleConfig.targetModule", "Phân hệ"),
          {
            showBlankOption: false,
          },
        ),
        size: 160,
        minSize: 130,
        enableResizing: true,
        cell: (row) => {
          const modDef = ERP_MODULE_REGISTRY.find(
            (m) => m.key === row.moduleKey,
          );
          return (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="opacity-70 text-muted-foreground shrink-0">
                {modDef?.icon || <Package className="w-3.5 h-3.5" />}
              </span>
              <span className="truncate text-xs font-medium text-foreground">
                {row.moduleName}
              </span>
            </div>
          );
        },
      },

      // 4. Cột Mã trường (Code) — TableText + onDetailClick view mode
      {
        key: "code",
        header: headerFilter("code", t("moduleConfig.attrCode", "Mã trường"), {
          showBlankOption: false,
        }),
        size: 160,
        minSize: 130,
        enableResizing: true,
        cell: (row) => (
          <div className="flex items-center gap-1.5 w-full min-w-0">
            <TableText
              text={row.code}
              enableCopy={true}
              tooltip={true}
              textClassName="font-mono text-xs font-semibold text-primary select-text"
              onDetailClick={() => openDetail(row, "view")}
            />
            {row.isSystem && (
              <span
                title={t(
                  "moduleConfig.systemAttrTooltip",
                  "Thuộc tính mặc định của hệ thống, không thể xóa để bảo toàn dữ liệu",
                )}
              >
                <Lock className="w-3 h-3 text-muted-foreground/60 shrink-0" />
              </span>
            )}
          </div>
        ),
      },

      // 5. Cột Tên hiển thị (Name)
      {
        key: "name",
        header: headerFilter(
          "name",
          t("moduleConfig.attrName", "Tên hiển thị"),
          {
            showBlankOption: false,
          },
        ),
        size: 220,
        minSize: 170,
        enableResizing: true,
        cell: (row) => (
          <div className="flex flex-col min-w-0">
            <TableText
              text={row.name}
              tooltip={true}
              enableCopy={true}
              textClassName="truncate text-xs font-medium text-foreground select-text"
            />
            {row.nameEn && (
              <span className="text-[11px] text-muted-foreground truncate font-sans">
                {row.nameEn}
              </span>
            )}
          </div>
        ),
      },

      // 6. Cột Kiểu dữ liệu (Field Type)
      {
        key: "fieldType",
        header: headerFilter(
          "fieldType",
          t("moduleConfig.attrFieldType", "Kiểu dữ liệu"),
          {
            filterOptions: [
              { label: "Văn bản (TEXT)", value: "TEXT" },
              { label: "Số (NUMBER)", value: "NUMBER" },
              { label: "Lựa chọn (SELECT)", value: "SELECT" },
              { label: "Ngày tháng (DATE)", value: "DATE" },
              { label: "Hộp kiểm (CHECKBOX)", value: "CHECKBOX" },
            ],
          },
        ),
        size: 140,
        minSize: 120,
        enableResizing: true,
        cell: (row) => {
          const badgeCfg =
            FIELD_TYPE_BADGES[row.fieldType] || FIELD_TYPE_BADGES.TEXT;
          return (
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className={cn(
                  "gap-1 h-5 px-2 text-[11px] font-normal leading-none",
                  badgeCfg.colorCls,
                )}
              >
                {badgeCfg.icon}
                <span>{t(badgeCfg.labelKey, badgeCfg.defaultLabel)}</span>
                {row.fieldType === "SELECT" && row.optionsCount > 0 && (
                  <span className="font-mono text-[10px] opacity-80">
                    ({row.optionsCount})
                  </span>
                )}
              </Badge>
            </div>
          );
        },
      },

      // 7. Cột Phạm vi (Scope / Category)
      {
        key: "scope",
        header: headerFilter("scope", t("moduleConfig.scopeType", "Phạm vi"), {
          filterOptions: [
            { label: "Toàn phân hệ (Global)", value: "GLOBAL" },
            { label: "Theo danh mục (Category)", value: "CATEGORY" },
          ],
        }),
        size: 170,
        minSize: 130,
        enableResizing: true,
        cell: (row) => {
          if (row.isGlobal) {
            return (
              <Badge
                variant="secondary"
                className="gap-1 h-5 px-2 text-[10px] font-medium leading-none"
              >
                <Layers className="w-3 h-3 text-muted-foreground" />
                <span>{t("moduleConfig.globalScope", "Toàn phân hệ")}</span>
              </Badge>
            );
          }
          return (
            <div className="flex items-center gap-1 min-w-0">
              <FolderTree className="w-3 h-3 text-muted-foreground shrink-0" />
              <span
                className="truncate text-xs text-foreground font-medium"
                title={row.categoryName || ""}
              >
                {row.categoryName || row.categoryCode || "Danh mục"}
              </span>
              {row.defaultDebitAccountCode && (
                <Badge
                  variant="outline"
                  className="ml-1 font-mono text-[10px] h-4 px-1 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-foreground shrink-0"
                  title={`${t("moduleConfig.defaultDebitAccountCol", "TK Nợ")}: ${row.defaultDebitAccountCode}${row.defaultDebitAccountName ? ` - ${row.defaultDebitAccountName}` : ""}`}
                >
                  {row.defaultDebitAccountCode}
                </Badge>
              )}
            </div>
          );
        },
      },

      // 8. Cột Nguồn gốc / Loại trường (isSystem) — Giải thích rõ Hệ thống vs Tùy chỉnh
      {
        key: "isSystem",
        header: headerFilter(
          "isSystem",
          t("moduleConfig.origin", "Nguồn gốc"),
          {
            filterOptions: [
              {
                label: t("moduleConfig.systemBadge", "Hệ thống (Mặc định)"),
                value: "true",
              },
              {
                label: t(
                  "moduleConfig.customBadge",
                  "Tùy chỉnh (Doanh nghiệp)",
                ),
                value: "false",
              },
            ],
          },
        ),
        size: 130,
        minSize: 110,
        enableResizing: true,
        className: "text-center",
        cell: (row) => (
          <div className="w-full flex justify-center">
            {row.isSystem ? (
              <Badge
                variant="outline"
                className="gap-1 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-foreground text-[10px] h-5 px-1.5 cursor-help"
                title={t(
                  "moduleConfig.systemAttrTooltip",
                  "Thuộc tính mặc định của hệ thống, không thể xóa để bảo toàn dữ liệu",
                )}
              >
                <Lock className="w-2.5 h-2.5 opacity-70" />
                <span>{t("moduleConfig.systemBadge", "Hệ thống")}</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 border-primary/30 bg-primary/10 text-primary text-[10px] h-5 px-1.5 cursor-help"
                title={t(
                  "moduleConfig.customAttrTooltip",
                  "Thuộc tính tùy chỉnh do doanh nghiệp tự tạo",
                )}
              >
                <Tag className="w-2.5 h-2.5" />
                <span>{t("moduleConfig.customBadge", "Tùy chỉnh")}</span>
              </Badge>
            )}
          </div>
        ),
      },

      // 9. Cột Bắt buộc (Required)
      {
        key: "isRequired",
        header: headerFilter(
          "isRequired",
          t("moduleConfig.isRequired", "Bắt buộc"),
          {
            filterOptions: [
              {
                label: t("moduleConfig.requiredBadge", "Bắt buộc (*)"),
                value: "true",
              },
              {
                label: t("moduleConfig.optionalBadge", "Tùy chọn"),
                value: "false",
              },
            ],
          },
        ),
        size: 100,
        minSize: 90,
        enableResizing: true,
        className: "text-center",
        cell: (row) => (
          <div className="w-full flex justify-center">
            {row.isRequired ? (
              <span className="text-[11px] font-semibold text-destructive">
                {t("moduleConfig.requiredBadge", "Bắt buộc *")}
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground font-normal">
                {t("moduleConfig.optionalBadge", "Tùy chọn")}
              </span>
            )}
          </div>
        ),
      },

      // 9. Cột Sử dụng (Usage Count)
      {
        key: "usageCount",
        header: (
          <span className="w-full block text-center">
            {t("moduleConfig.used", "Sử dụng")}
          </span>
        ),
        size: 90,
        minSize: 80,
        enableResizing: true,
        className: "text-center",
        cell: (row) => (
          <div className="w-full flex justify-center font-mono">
            {row.usageCount > 0 ? (
              <Badge
                variant="secondary"
                className="text-[10px] font-mono px-1.5 h-4 min-w-[24px] justify-center"
              >
                {row.usageCount}
              </Badge>
            ) : (
              <span className="text-muted-foreground text-[11px]">0</span>
            )}
          </div>
        ),
      },

      // 10. Cột Thứ tự (Sort Order)
      {
        key: "sortOrder",
        header: (
          <span className="w-full block text-center">
            {t("moduleConfig.sortOrderShort", "Thứ tự")}
          </span>
        ),
        size: 70,
        minSize: 60,
        enableResizing: true,
        className: "text-center",
        cell: (row) => (
          <span className="w-full block text-center font-mono text-[11px] text-muted-foreground">
            {row.sortOrder}
          </span>
        ),
      },

      // 11. Cột Trạng thái (Active)
      {
        key: "isActive",
        header: headerFilter("isActive", t("common.status", "Trạng thái"), {
          filterOptions: [
            { label: "Hoạt động", value: "true" },
            { label: "Ngưng hoạt động", value: "false" },
          ],
        }),
        size: 130,
        minSize: 110,
        enableResizing: true,
        className: "text-center",
        cell: (row) => (
          <div className="w-full flex justify-center">
            <Badge
              variant="ghost"
              className={cn(
                "border min-h-[18px] h-[18px] py-0 px-2 text-[10px] leading-none",
                row.isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
              )}
            >
              {row.isActive
                ? t("common.active", "Hoạt động")
                : t("common.inactive", "Ngưng")}
            </Badge>
          </div>
        ),
      },
    ],
    [headerFilter, listHook, t],
  );

  // Row Actions Dropdown
  const getRowActions = useCallback(
    (row: CustomFieldRow): ActionDropdownItem[] => [
      {
        groupLabel: t("common.lookup", "TRA CỨU"),
        items: [
          {
            label: t("common.viewDetail", "Xem chi tiết"),
            icon: <Eye className="w-4 h-4" />,
            onClick: () => openDetail(row, "view"),
          },
        ],
      },
      {
        groupLabel: t("common.actions", "THAO TÁC"),
        items: [
          {
            label: t("common.edit", "Chỉnh sửa"),
            icon: <Pencil className="w-4 h-4" />,
            onClick: () => openDetail(row, "edit"),
          },
          ...(!row.isSystem
            ? [
                {
                  label: t("common.delete", "Xóa"),
                  icon: <Trash2 className="w-4 h-4 text-destructive" />,
                  variant: "danger" as const,
                  disabled: row.usageCount > 0,
                  onClick: () => setDeleteTarget(row),
                },
              ]
            : []),
        ],
      },
    ],
    [t],
  );

  // Custom Toolbar Actions: Sub-module PillTabs (chỉ hiển thị khi đã chọn 1 Khối cụ thể, ẩn khi ở tab Tất cả)
  const customToolbarActions =
    listHook.activeDomain !== "ALL" && modulePillItems.length > 1 ? (
      <div className="flex items-center gap-2 flex-wrap py-0.5">
        <PillTabs
          className="w-full sm:w-auto shrink-0"
          listClassName="h-8 p-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_1px_2px_rgba(15,23,42,.03)]"
          triggerClassName="h-7 px-3 text-xs rounded-full"
          items={modulePillItems}
          value={listHook.activeModule}
          onValueChange={listHook.setActiveModule}
          hideBorder
        />
      </div>
    ) : undefined;

  return (
    <>
      <SpreadsheetPageTemplate<CustomFieldRow>
        tabs={pageTabs}
        activeTab={listHook.activeDomain}
        onTabChange={listHook.setActiveDomain}
        title={t("nav.items.customFields", "Trường tùy chỉnh")}
        desc={t(
          "moduleConfig.subtitleUnified",
          "Quản lý danh mục & các thuộc tính động cấu hình theo từng phân hệ",
        )}
        icon={<Settings className="w-5 h-5 text-primary" />}
        tableId={`settings-custom-fields-table-${listHook.activeDomain}`}
        items={listHook.rows}
        columns={columns}
        getRowKey={(row) => row.id}
        loading={listHook.isLoading}
        emptyLabel={t(
          "moduleConfig.noCustomAttributes",
          "Không có trường tùy chỉnh nào.",
        )}
        page={listHook.page}
        pageSize={listHook.pageSize}
        total={listHook.total}
        totalPages={listHook.totalPages}
        onPage={(p) => listHook.setPage(p)}
        onPageSize={(s) => {
          listHook.setPageSize(s);
          listHook.setPage(1);
        }}
        onRefresh={() => listHook.refetch()}
        activeFilterCount={listHook.activeFilterCount}
        onClearAllFilters={listHook.clearAllFilters}
        customActionsNode={customToolbarActions}
        onCreate={() => openCreate()}
        createLabel={t("moduleConfig.addAttr", "Tạo trường tùy chỉnh")}
        rowActions={getRowActions}
      />

      {/* Detail & Edit Drawer */}
      <CustomFieldFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode={drawerMode}
        setMode={setDrawerMode}
        fieldRow={selectedRow}
        defaultModuleKey={
          listHook.activeModule !== "ALL"
            ? listHook.activeModule
            : "GOODS_RECEIPT"
        }
        onSuccess={() => listHook.refetch()}
      />

      {/* Confirm Modal for Field Delete */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t("moduleConfig.deleteAttrTitle", "Xóa trường tùy chỉnh")}
        message={t(
          "moduleConfig.deleteAttrMsg",
          `Bạn có chắc chắn muốn xóa thuộc tính "${deleteTarget?.name}" (${deleteTarget?.code})?`,
        )}
        loading={deleting}
      />
    </>
  );
}
