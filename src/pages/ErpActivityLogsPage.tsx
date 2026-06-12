import { useCallback, useEffect, useMemo, useState } from "react";
import { History } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import {
  DrawerModal,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { SearchInput } from "@/shared/components/SearchInput";
import { Button } from "@/shared/components/ui/Button";
import { useUIStore } from "@/core/config/uiStore";
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
  const [items, setItems] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [module, setModule] = useState("");
  const [actionType, setActionType] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditCoreApi.list({
        page,
        pageSize,
        module: module || undefined,
        actionType: actionType || undefined,
        status: status || undefined,
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
    actionType,
    dateFrom,
    dateTo,
    module,
    page,
    pageSize,
    search,
    showToast,
    status,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: DataTableColumn<AuditLogEntry>[] = useMemo(
    () => [
      {
        key: "actorEmail",
        header: "Actor",
        cell: (item) => item.actorEmail || "system",
      },
      {
        key: "actionType",
        header: "Action",
        cell: (item) => <span className="font-medium">{item.actionType}</span>,
      },
      { key: "module", header: "Module", cell: (item) => item.module },
      {
        key: "entity",
        header: "Entity",
        cell: (item) =>
          item.entityType ? `${item.entityType}:${item.entityId || "—"}` : "—",
      },
      {
        key: "status",
        header: "Status",
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
        header: "Thời gian",
        cell: (item) => formatDate(item.createdAt),
      },
    ],
    [],
  );

  return (
    <PageLayout
      title="Nhật ký hoạt động"
      desc="Audit logs live từ ERP CORE backend"
      icon={<History className="h-4 w-4" />}
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm actor, entity, route..."
            className="w-full xl:col-span-2"
          />
          <input
            type="date"
            className={inputCls}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            className={inputCls}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <select
            className={inputCls}
            value={module}
            onChange={(e) => setModule(e.target.value)}
          >
            <option value="">Tất cả module</option>
            <option value="auth">auth</option>
            <option value="users">users</option>
          </select>
          <select
            className={inputCls}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Tất cả status</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAIL">FAIL</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            className={inputCls + " max-w-[260px]"}
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            placeholder="Ví dụ: LOGIN_SUCCESS"
          />
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Lọc
          </Button>
        </div>

        <DataTable
          items={items}
          columns={columns}
          getRowKey={(item) => item.id}
          loading={loading}
          emptyLabel="Chưa có audit logs"
          actionsColumn={{
            cell: (raw) => {
              const item = raw as AuditLogEntry;
              return (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(item)}
                >
                  Xem
                </Button>
              );
            },
          }}
        />

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Tổng: {total}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </Button>
            <span>Trang {page}</span>
            <Button
              variant="secondary"
              size="sm"
              disabled={items.length < pageSize}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
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
