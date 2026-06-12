import { useCallback, useEffect, useMemo, useState } from "react";
import { History, Eye } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import {
  DataTable,
  type DataTableColumn,
  type ActionsColumnConfig,
} from "@/shared/components/DataTable";
import { DrawerModal, DrawerSection } from "@/shared/components/DrawerModal";
import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { FilterPanel } from "@/shared/components/FilterPanel";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { Button } from "@/shared/components/ui/Button";
import { useUIStore } from "@/core/config/uiStore";
import { useT } from "@/core/i18n";
import {
  auditCoreApi,
  type AuditLogEntry,
} from "@/modules/system/api/usersCoreApi";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
}

export function ErpActivityLogsPage() {
  const showToast = useUIStore((s) => s.showToast);
  const t = useT();
  const [items, setItems] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: true,
      period: true,
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

  const filter = useFilterPanel(filterConfig, () => setPage(1));

  const search = filter.state.search;
  const statusFilter = filter.state.status;
  const dateFrom = filter.state.dateFrom;
  const dateTo = filter.state.dateTo;
  const moduleFilter = filter.state.custom.module;
  const actionTypeFilter = filter.state.custom.actionType;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditCoreApi.list({
        page,
        pageSize,
        module: moduleFilter || undefined,
        actionType: actionTypeFilter || undefined,
        status: statusFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: search || undefined,
      });
      setItems(res.data);
      setTotal(res.total);
    } catch (error: any) {
      showToast({
        variant: "destructive",
        title: "Không tải được audit logs",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi không xác định",
      });
    } finally {
      setLoading(false);
    }
  }, [
    moduleFilter,
    actionTypeFilter,
    statusFilter,
    dateFrom,
    dateTo,
    search,
    page,
    pageSize,
    showToast,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: DataTableColumn<AuditLogEntry>[] = useMemo(
    () => [
      {
        key: "actorEmail",
        header: t("activityLogs.headers.actor") || "Actor",
        cell: (item) => item.actorEmail || "system",
      },
      {
        key: "actionType",
        header: t("activityLogs.headers.action") || "Action",
        cell: (item) => <span className="font-medium">{item.actionType}</span>,
      },
      {
        key: "module",
        header: t("activityLogs.headers.module") || "Module",
        cell: (item) => item.module,
      },
      {
        key: "entity",
        header: t("activityLogs.headers.entity") || "Entity",
        cell: (item) => {
          if (!item.entityType) return "—";
          const shortId = item.entityId
            ? item.entityId.substring(0, 8) + "..."
            : "";
          return (
            <div className="flex flex-col" title={item.entityId || ""}>
              <span>{item.entityType}</span>
              {shortId && (
                <span className="text-[11px] font-mono text-muted-foreground">
                  {shortId}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "status",
        header: t("activityLogs.headers.status") || "Status",
        cell: (item) => (
          <span
            className={
              item.status === "SUCCESS"
                ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                : "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
            }
          >
            {item.status}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: t("activityLogs.headers.time") || "Thời gian",
        cell: (item) => formatDate(item.createdAt),
      },
    ],
    [t],
  );

  const actionsColumn: ActionsColumnConfig<AuditLogEntry> = {
    cell: (item) => (
      <ActionDropdown
        items={[
          {
            label: "Xem chi tiết",
            icon: <Eye className="h-3.5 w-3.5" />,
            onClick: () => setSelected(item),
          },
        ]}
      />
    ),
  };

  return (
    <PageLayout
      title={t("nav.items.activitylog") || "Nhật ký hoạt động"}
      desc="Audit logs live từ ERP CORE backend"
      icon={<History className="h-4 w-4" />}
    >
      <div className="mb-3 flex items-center justify-end">
        <TableActionGroup
          onRefresh={() => void load()}
          loading={loading}
          onFilterToggle={filter.togglePanel}
          activeFilterCount={filter.activeFilterCount}
        />
      </div>

      <div className="flex items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <DataTable
            items={items}
            columns={columns}
            getRowKey={(item) => item.id}
            loading={loading}
            emptyLabel="Chưa có audit logs"
            actionsColumn={actionsColumn}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={Math.ceil(total / pageSize)}
            onPage={setPage}
            onPageSize={(value) => {
              setPage(1);
              setPageSize(value);
            }}
          />
        </div>
        <FilterPanel config={filterConfig} filter={filter} />
      </div>

      <DrawerModal
        open={Boolean(selected)}
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
      >
        {selected && (
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
        )}
      </DrawerModal>
    </PageLayout>
  );
}
