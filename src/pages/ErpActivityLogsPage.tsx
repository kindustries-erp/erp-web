import { useMemo, useState, useCallback } from "react";
import { History, Eye } from "lucide-react";
import {
  type DataTableColumn,
  TableText,
  TableDateCell,
  createColumnHeaderFilter,
} from "@/shared/components/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { Forbidden } from "@/pages/Forbidden";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { useT } from "@/core/i18n";
import {
  auditCoreApi,
  type AuditLogEntry,
} from "@/modules/system/api/usersCoreApi";
import { useAuditCoreList } from "@/modules/system/hooks/useAuditCoreList";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
}

export function ErpActivityLogsPage() {
  const canRead = useHasPermission("activity_logs", "read");
  const t = useT();

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      period: true,
      noDefaultPeriod: true,
      status: {
        options: [
          { value: "SUCCESS", label: "Thành công (SUCCESS)" },
          { value: "FAIL", label: "Thất bại (FAIL)" },
        ],
        placeholder: "Tất cả trạng thái",
      },
      custom: [
        {
          key: "actionType",
          label: "Hành động (Method)",
          placeholder: "Tất cả hành động",
          type: "multi-select",
          options: [
            { value: "GET", label: "GET" },
            { value: "POST", label: "POST" },
            { value: "PUT", label: "PUT" },
            { value: "PATCH", label: "PATCH" },
            { value: "DELETE", label: "DELETE" },
          ],
        },
        {
          key: "module",
          label: "Module",
          placeholder: "Tất cả phân hệ",
          options: [
            { value: "auth", label: "auth" },
            { value: "users", label: "users" },
            { value: "inventory", label: "inventory" },
            { value: "purchase", label: "purchase" },
          ],
        },
      ],
    }),
    [],
  );

  const filter = useFilterPanel(filterConfig);
  const status = filter.state.status;
  const dateFrom = filter.state.dateFrom;
  const dateTo = filter.state.dateTo;
  const actionType = filter.state.custom?.actionType;
  const module = filter.state.custom?.module;

  const listHook = useAuditCoreList({
    status,
    actionType,
    module,
    dateFrom,
    dateTo,
  });
  const {
    data: items,
    total,
    totalPages,
    isLoading: loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    refetch: load,
  } = listHook;

  const totalActiveFilterCount = useMemo(
    () => filter.activeFilterCount + listHook.activeFilterCount,
    [filter.activeFilterCount, listHook.activeFilterCount],
  );

  const handleClearAll = useCallback(() => {
    filter.resetAll();
    listHook.clearAllFilters();
  }, [filter, listHook]);

  const [selected, setSelected] = useState<AuditLogEntry | null>(null);

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook,
        queryKeyPrefix: "audit-logs-column-options",
        fetchOptions: ({
          columnKey,
          search,
          pageParam,
          pageSize: ps,
          filtersStr,
        }) =>
          auditCoreApi.getColumnOptions(
            columnKey,
            search,
            pageParam,
            ps || 20,
            filtersStr,
          ),
      }),
    [listHook],
  );

  const columns: DataTableColumn<AuditLogEntry>[] = useMemo(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },
      {
        key: "actorEmail",
        size: 220,
        enableResizing: true,
        header: headerFilter(
          "actorEmail",
          t("activityLogs.headers.actor") || "Actor",
          { showBlankOption: true },
        ),
        cell: (item) => (
          <TableText
            text={item.actorEmail || "system"}
            enableCopy
            tooltip
            onDetailClick={() => setSelected(item)}
          />
        ),
        className: "text-left",
      },
      {
        key: "actionType",
        size: 180,
        enableResizing: true,
        header: headerFilter(
          "actionType",
          t("activityLogs.headers.action") || "Action",
        ),
        cell: (item) => (
          <span className="font-semibold text-foreground">
            {item.actionType}
          </span>
        ),
        className: "text-left",
      },
      {
        key: "module",
        size: 140,
        enableResizing: true,
        header: headerFilter(
          "module",
          t("activityLogs.headers.module") || "Module",
        ),
        cell: (item) => (
          <Badge variant="outline" className="text-[11px] font-mono">
            {item.module}
          </Badge>
        ),
        className: "text-left",
      },
      {
        key: "entityType",
        size: 200,
        enableResizing: true,
        header: headerFilter(
          "entityType",
          t("activityLogs.headers.entity") || "Entity",
          { showBlankOption: true },
        ),
        cell: (item) => {
          if (!item.entityType) return "—";
          const shortId = item.entityId
            ? item.entityId.substring(0, 8) + "..."
            : "";
          return (
            <div className="flex flex-col" title={item.entityId || ""}>
              <span className="font-medium text-foreground">
                {item.entityType}
              </span>
              {shortId && (
                <span className="text-[11px] font-mono text-muted-foreground">
                  {shortId}
                </span>
              )}
            </div>
          );
        },
        className: "text-left",
      },
      {
        key: "createdAt",
        size: 160,
        enableResizing: true,
        className: "text-right",
        header: headerFilter.date(
          "createdAt",
          t("activityLogs.headers.time") || "Thời gian",
        ),
        cell: (item) => (
          <TableDateCell date={item.createdAt} className="justify-end w-full" />
        ),
      },
      {
        key: "status",
        size: 130,
        enableResizing: true,
        className: "text-center",
        header: headerFilter(
          "status",
          t("activityLogs.headers.status") || "Status",
        ),
        cell: (item) => (
          <div className="flex justify-center w-full">
            <Badge
              variant={item.status === "SUCCESS" ? "default" : "destructive"}
              className="w-[88px] inline-flex items-center justify-center text-center truncate"
            >
              {item.status}
            </Badge>
          </div>
        ),
      },
    ],
    [headerFilter, t],
  );

  if (!canRead) return <Forbidden />;

  return (
    <>
      <SpreadsheetPageTemplate<AuditLogEntry>
        title={t("nav.items.activitylog") || "Nhật ký hoạt động"}
        desc="Audit logs live từ ERP CORE backend"
        icon={<History className="h-4 w-4" />}
        tableId="activity-logs-table-v2"
        items={items}
        columns={columns}
        getRowKey={(item) => item.id}
        loading={loading}
        emptyLabel="Chưa có audit logs"
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={(value) => {
          setPage(1);
          setPageSize(value);
        }}
        onRefresh={() => void load()}
        filterConfig={filterConfig}
        filter={filter}
        activeFilterCount={totalActiveFilterCount}
        onClearAllFilters={handleClearAll}
        rowActions={(row) => [
          {
            groupLabel: "Tra cứu",
            items: [
              {
                label: "Xem chi tiết",
                icon: <Eye className="h-3.5 w-3.5" />,
                onClick: () => setSelected(row),
              },
            ],
          },
        ]}
      />

      <StandardFormDrawer
        open={Boolean(selected)}
        mode="view"
        onClose={() => setSelected(null)}
        title={selected?.actionType || "Chi tiết log"}
        subtitle={
          selected
            ? `${selected.module} • ${formatDate(selected.createdAt)}`
            : undefined
        }
        actions={[
          { label: "Đóng", onClick: () => setSelected(null), primary: true },
        ]}
        layout="1-column"
        leftPanel={
          selected ? (
            <>
              <DrawerSection title="Thông tin chính">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Actor:</span>{" "}
                    {selected.actorEmail || "system"}
                  </div>
                  <div>
                    <span className="font-medium">Entity:</span>{" "}
                    {selected.entityType || "—"} / {selected.entityId || "—"}
                  </div>
                  <div>
                    <span className="font-medium">Route:</span>{" "}
                    {selected.httpMethod || "—"} {selected.route || "—"}
                  </div>
                  <div>
                    <span className="font-medium">Message:</span>{" "}
                    {selected.message || "—"}
                  </div>
                </div>
              </DrawerSection>
              <DrawerSection title="Snapshot JSON">
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 text-xs font-semibold text-muted-foreground">
                      Before
                    </div>
                    <pre className="overflow-x-auto rounded-xl bg-muted p-3 text-xs">
                      {JSON.stringify(selected.beforeSnapshot, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-semibold text-muted-foreground">
                      After
                    </div>
                    <pre className="overflow-x-auto rounded-xl bg-muted p-3 text-xs">
                      {JSON.stringify(selected.afterSnapshot, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-semibold text-muted-foreground">
                      Error
                    </div>
                    <pre className="overflow-x-auto rounded-xl bg-muted p-3 text-xs">
                      {JSON.stringify(selected.errorSnapshot, null, 2)}
                    </pre>
                  </div>
                </div>
              </DrawerSection>
            </>
          ) : null
        }
      />
    </>
  );
}
