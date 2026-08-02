import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Mail, Paperclip } from "lucide-react";
import toast from "react-hot-toast";

import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DrawerModal, DrawerRow } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import {
  getEmailFileViewUrl,
  getEmailMessagesApi,
  syncEmailMailboxApi,
  type EmailMessage,
} from "@/modules/email/api/emailApi";

function formatAddresses(items: EmailMessage["fromJson"]) {
  if (!items || items.length === 0) return "—";
  return items
    .map((item) => {
      const name = item.name?.trim();
      const address = item.address?.trim();
      if (name && address) return `${name} <${address}>`;
      return name || address || "";
    })
    .filter(Boolean)
    .join(", ");
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function bodyPreview(message: EmailMessage) {
  const text = message.bodyText?.trim();
  if (text) return text.slice(0, 6000);
  return "—";
}

export function EmailInboxPage() {
  const canRead = useHasPermission("email_ingest", "read");
  const canSync = useHasPermission("email_ingest", "create");
  const queryClient = useQueryClient();
  const [sortArray, setSortArray] = useState<string[]>(["-receivedAt"]);
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selected, setSelected] = useState<EmailMessage | null>(null);

  const filterConfig = useMemo<FilterPanelConfig>(
    () => ({
      search: {
        placeholder: "Tìm theo tiêu đề, nội dung, message-id...",
      },
      custom: [
        {
          key: "mailbox",
          label: "Hộp thư",
          placeholder: "Tất cả hộp thư",
          options: [
            { value: "INBOX", label: "INBOX" },
            { value: "Sent", label: "Sent" },
            { value: "Drafts", label: "Drafts" },
            { value: "Spam", label: "Spam" },
            { value: "Trash", label: "Trash" },
          ],
          type: "combobox",
          initialValue: "INBOX",
        },
      ],
    }),
    [],
  );

  const filter = useFilterPanel(filterConfig, () => setPage(1));
  const search = filter.state.search;
  const mailbox = filter.state.custom.mailbox || "INBOX";
  const apiSortableFields = useMemo(
    () => new Set(["receivedAt", "subject", "mailbox"]),
    [],
  );

  const apiSortArray = useMemo(
    () =>
      sortArray.filter((entry) =>
        apiSortableFields.has(entry.replace(/^-/, "")),
      ),
    [sortArray, apiSortableFields],
  );

  const { data, isFetching, error } = useQuery({
    queryKey: ["email-inbox", page, pageSize, search, mailbox, apiSortArray],
    queryFn: () =>
      getEmailMessagesApi({
        page,
        pageSize,
        search: search || undefined,
        mailbox: mailbox || undefined,
        sort: apiSortArray,
      }),
  });

  const syncMutation = useMutation({
    mutationFn: () => syncEmailMailboxApi({ mailbox: mailbox || undefined }),
    onSuccess: async () => {
      toast.success("Đã đồng bộ email");
      await queryClient.invalidateQueries({ queryKey: ["email-inbox"] });
    },
    onError: () => {
      toast.error("Không thể đồng bộ email");
    },
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const getSortState = (key: string): "asc" | "desc" | "none" => {
    if (sortArray.includes(key)) return "asc";
    if (sortArray.includes(`-${key}`)) return "desc";
    return "none";
  };

  const applySortState = (key: string, state: "asc" | "desc" | "none") => {
    if (state === "none") {
      setSortArray([]);
      setPage(1);
      return;
    }
    setSortArray([state === "desc" ? `-${key}` : key]);
    setPage(1);
  };

  const getColumnValue = (item: EmailMessage, columnKey: string): string => {
    switch (columnKey) {
      case "receivedAt":
        return formatDate(item.receivedAt || item.ingestedAt);
      case "mailbox":
        return item.mailbox || "";
      case "subject":
        return item.subject || "";
      case "fromJson":
        return formatAddresses(item.fromJson);
      case "attachmentCount":
        return String(item.attachmentCount ?? 0);
      default:
        return "";
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      for (const [key, value] of Object.entries(columnSearch)) {
        const keyword = (value || "").trim().toLowerCase();
        if (!keyword) continue;
        const haystack = getColumnValue(item, key).toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }

      for (const [key, values] of Object.entries(columnFilters)) {
        const selectedValues = values || [];
        if (selectedValues.length === 0) continue;
        const currentValue = getColumnValue(item, key);
        if (!selectedValues.includes(currentValue)) return false;
      }

      return true;
    });
  }, [items, columnFilters, columnSearch]);

  const fetchColumnOptions = async ({
    columnKey,
    search: searchText,
    pageParam,
  }: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => {
    const keyword = (searchText || "").trim().toLowerCase();

    const options = Array.from(
      new Set(
        filteredItems
          .map((item) => getColumnValue(item, columnKey))
          .filter((value) => value && value !== "—"),
      ),
    )
      .filter((value) => value.toLowerCase().includes(keyword))
      .sort((a, b) => a.localeCompare(b, "vi"));

    const pageSize = 20;
    const start = (pageParam - 1) * pageSize;
    const pageItems = options.slice(start, start + pageSize);

    return {
      items: pageItems.map((value) => ({ label: value, value })),
      total: options.length,
      next: start + pageSize < options.length ? pageParam + 1 : null,
    };
  };

  const displayItems = useMemo(() => {
    if (sortArray.length === 0) return filteredItems;
    const activeSort = sortArray[0];
    const sortKey = activeSort.replace(/^-/, "");
    const isDesc = activeSort.startsWith("-");

    if (apiSortableFields.has(sortKey)) {
      return filteredItems;
    }

    const sorted = [...filteredItems].sort((a, b) => {
      const aValue = getColumnValue(a, sortKey);
      const bValue = getColumnValue(b, sortKey);
      return aValue.localeCompare(bValue, "vi", {
        numeric: true,
        sensitivity: "base",
      });
    });

    return isDesc ? sorted.reverse() : sorted;
  }, [filteredItems, sortArray, apiSortableFields]);

  const columns: DataTableColumn<EmailMessage>[] = useMemo(
    () => [
      {
        key: "receivedAt",
        header: (
          <TableColumnHeaderFilter
            align="center"
            title="Nhận lúc"
            columnKey="receivedAt"
            sortState={getSortState("receivedAt")}
            onSortChange={(state) => applySortState("receivedAt", state)}
            searchValue={columnSearch.receivedAt || ""}
            onSearchChange={(value) =>
              setColumnSearch((prev) => ({ ...prev, receivedAt: value }))
            }
            selectedFilters={columnFilters.receivedAt || []}
            onFilterChange={(values) => {
              setColumnFilters((prev) => ({ ...prev, receivedAt: values }));
              setPage(1);
            }}
            fetchOptions={fetchColumnOptions}
            queryKeyPrefix="email-inbox-column-options"
            allFilters={columnFilters}
          />
        ),
        cell: (item) => formatDate(item.receivedAt || item.ingestedAt),
        className: "whitespace-nowrap text-[color:var(--muted-fg)]",
        headerClassName: "text-center",
        skeletonClassName: "w-28",
      },
      {
        key: "mailbox",
        header: (
          <TableColumnHeaderFilter
            align="center"
            title="Hộp thư"
            columnKey="mailbox"
            sortState={getSortState("mailbox")}
            onSortChange={(state) => applySortState("mailbox", state)}
            searchValue={columnSearch.mailbox || ""}
            onSearchChange={(value) =>
              setColumnSearch((prev) => ({ ...prev, mailbox: value }))
            }
            selectedFilters={columnFilters.mailbox || []}
            onFilterChange={(values) => {
              setColumnFilters((prev) => ({ ...prev, mailbox: values }));
              setPage(1);
            }}
            filterOptions={[
              { value: "INBOX", label: "INBOX" },
              { value: "Sent", label: "Sent" },
              { value: "Drafts", label: "Drafts" },
              { value: "Spam", label: "Spam" },
              { value: "Trash", label: "Trash" },
            ]}
          />
        ),
        cell: (item) => item.mailbox,
        className: "whitespace-nowrap",
        headerClassName: "text-center",
        skeletonClassName: "w-20",
      },
      {
        key: "subject",
        header: (
          <TableColumnHeaderFilter
            align="center"
            title="Tiêu đề"
            columnKey="subject"
            sortState={getSortState("subject")}
            onSortChange={(state) => applySortState("subject", state)}
            searchValue={columnSearch.subject || ""}
            onSearchChange={(value) =>
              setColumnSearch((prev) => ({ ...prev, subject: value }))
            }
            selectedFilters={columnFilters.subject || []}
            onFilterChange={(values) => {
              setColumnFilters((prev) => ({ ...prev, subject: values }));
              setPage(1);
            }}
            fetchOptions={fetchColumnOptions}
            queryKeyPrefix="email-inbox-column-options"
            allFilters={columnFilters}
          />
        ),
        cell: (item) => (
          <div className="max-w-[360px] truncate font-medium">
            {item.subject || "(Không có tiêu đề)"}
          </div>
        ),
        className: "max-w-[360px] truncate",
        headerClassName: "text-center",
        skeletonClassName: "w-56",
      },
      {
        key: "fromJson",
        header: (
          <TableColumnHeaderFilter
            align="center"
            title="Từ"
            columnKey="fromJson"
            sortState={getSortState("fromJson")}
            onSortChange={(state) => applySortState("fromJson", state)}
            searchValue={columnSearch.fromJson || ""}
            onSearchChange={(value) =>
              setColumnSearch((prev) => ({ ...prev, fromJson: value }))
            }
            selectedFilters={columnFilters.fromJson || []}
            onFilterChange={(values) => {
              setColumnFilters((prev) => ({ ...prev, fromJson: values }));
              setPage(1);
            }}
            fetchOptions={fetchColumnOptions}
            queryKeyPrefix="email-inbox-column-options"
            allFilters={columnFilters}
            hideFilter={false}
          />
        ),
        cell: (item) => (
          <div className="max-w-[280px] truncate text-[color:var(--muted-fg)]">
            {formatAddresses(item.fromJson)}
          </div>
        ),
        className: "max-w-[280px] truncate",
        headerClassName: "text-center",
        skeletonClassName: "w-44",
      },
      {
        key: "attachmentCount",
        header: (
          <TableColumnHeaderFilter
            align="center"
            title="Đính kèm"
            columnKey="attachmentCount"
            sortState={getSortState("attachmentCount")}
            onSortChange={(state) => applySortState("attachmentCount", state)}
            searchValue={columnSearch.attachmentCount || ""}
            onSearchChange={(value) =>
              setColumnSearch((prev) => ({ ...prev, attachmentCount: value }))
            }
            selectedFilters={columnFilters.attachmentCount || []}
            onFilterChange={(values) => {
              setColumnFilters((prev) => ({
                ...prev,
                attachmentCount: values,
              }));
              setPage(1);
            }}
            fetchOptions={fetchColumnOptions}
            queryKeyPrefix="email-inbox-column-options"
            allFilters={columnFilters}
          />
        ),
        cell: (item) => (
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-[color:var(--muted)] px-2 py-1 text-xs text-[color:var(--muted-fg)]">
            <Paperclip className="h-3.5 w-3.5" />
            {item.attachmentCount}
          </span>
        ),
        className: "text-center",
        headerClassName: "text-center",
        skeletonClassName: "w-16",
      },
    ],
    [columnFilters, columnSearch, sortArray],
  );

  if (!canRead) return <Forbidden />;

  return (
    <SpreadsheetPageTemplate<EmailMessage>
      title="Hộp thư ERP"
      desc="Xem email đã đồng bộ từ IMAP/Gmail vào ERP."
      icon={<Mail className="h-4 w-4" />}
      tableId="email-inbox-table"
      items={displayItems}
      columns={columns}
      getRowKey={(item) => item.id}
      loading={isFetching || syncMutation.isPending}
      error={error ? "Không thể tải email." : null}
      emptyLabel="Chưa có email được lưu."
      minWidth={980}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      onPage={setPage}
      onPageSize={(value) => {
        setPageSize(value);
        setPage(1);
      }}
      onRefresh={canSync ? () => syncMutation.mutate() : undefined}
      filterConfig={filterConfig}
      filter={filter}
      onRowClick={setSelected}
      topNode={
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm text-[color:var(--muted-fg)]">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Xem email đã đồng bộ từ IMAP/Gmail vào ERP.</span>
          </div>
          {canSync ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              Đồng bộ
            </Button>
          ) : null}
        </div>
      }
    >
      <EmailDetailDrawer item={selected} onClose={() => setSelected(null)} />
    </SpreadsheetPageTemplate>
  );
}

function EmailDetailDrawer({
  item,
  onClose,
}: {
  item: EmailMessage | null;
  onClose: () => void;
}) {
  const htmlPreview = item?.bodyHtml
    ? `<html><head><meta charset="utf-8" /><style>body{font-family:Inter,Arial,sans-serif;padding:16px;line-height:1.55;color:#111827;} img{max-width:100%;height:auto;} pre,code{white-space:pre-wrap;}</style></head><body>${item.bodyHtml}</body></html>`
    : "";

  return (
    <DrawerModal
      open={!!item}
      onClose={onClose}
      title={item?.subject || "Chi tiết email"}
      subtitle={
        item
          ? `${item.mailbox} · ${formatDate(item.receivedAt || item.ingestedAt)}`
          : ""
      }
      icon={<Mail className="w-4 h-4" />}
      panelClassName="w-[780px]"
    >
      {item && (
        <div className="space-y-4">
          <DrawerRow label="Hộp thư" value={item.mailbox} />
          <DrawerRow label="Từ" value={formatAddresses(item.fromJson)} />
          <DrawerRow label="Đến" value={formatAddresses(item.toJson)} />
          <DrawerRow label="Cc" value={formatAddresses(item.ccJson)} />
          <DrawerRow label="Bcc" value={formatAddresses(item.bccJson)} />
          <DrawerRow
            label="Message ID"
            value={item.messageId || "—"}
            cls="break-all font-mono text-xs"
          />
          <DrawerRow label="UID" value={item.uid || "—"} />
          <DrawerRow
            label="Nhận lúc"
            value={formatDate(item.receivedAt || item.ingestedAt)}
          />
          <DrawerRow label="Gửi lúc" value={formatDate(item.sentAt)} />
          <DrawerRow label="Đính kèm" value={`${item.attachmentCount}`} />

          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="mb-2 text-xs font-medium text-[color:var(--muted-fg)]">
              Nội dung
            </div>
            {item.bodyHtml ? (
              <iframe
                title={item.subject || "Email preview"}
                className="h-[380px] w-full rounded-lg border border-border bg-white"
                sandbox=""
                srcDoc={htmlPreview}
              />
            ) : (
              <pre className="max-h-[380px] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-[color:var(--muted)] p-3 text-sm text-foreground">
                {bodyPreview(item)}
              </pre>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="mb-2 text-xs font-medium text-[color:var(--muted-fg)]">
              Đính kèm
            </div>
            {item.attachments.length > 0 ? (
              <div className="space-y-2">
                {item.attachments.map((attachment) => {
                  const file = attachment.sysFile;
                  const fileId = file?.id || attachment.sysFileId;
                  return (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-[color:var(--muted)] px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {attachment.filename ||
                            file?.filename_download ||
                            "Tệp đính kèm"}
                        </div>
                        <div className="text-xs text-[color:var(--muted-fg)]">
                          {attachment.contentType || file?.type || "—"}
                          {attachment.size ? ` · ${attachment.size} bytes` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={!fileId}
                          onClick={() =>
                            window.open(
                              getEmailFileViewUrl(fileId),
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Mở file
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-[color:var(--muted-fg)]">
                Không có đính kèm.
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="mb-2 text-xs font-medium text-[color:var(--muted-fg)]">
              Headers
            </div>
            <div className="max-h-[220px] overflow-auto rounded-lg bg-[color:var(--muted)] p-3 text-xs text-foreground">
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(item.headersJson || [], null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </DrawerModal>
  );
}
