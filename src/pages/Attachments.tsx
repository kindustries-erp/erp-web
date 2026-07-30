import { useEffect, useState } from "react";
import { ExternalLink, FileText, Paperclip } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { InvoiceDateRangeSlot } from "@/modules/erp-invoices-core/components/InvoiceDateRangeSlot";
import { Badge } from "@/shared/components/ui/badge";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { DrawerModal, DrawerRow } from "@/shared/components/DrawerModal";
import {
  getAttachmentsPagedApi,
  getAttachmentDownloadUrlApi,
  getAttachmentOptionsApi,
  type ErpAttachment,
} from "@/modules/system/api/attachmentsApi";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import { ErpInvoiceInternalDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceInternalDrawer";
import {
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
} from "@/modules/erp-invoices-core/components/ErpInvoiceInternalInfo";
import { ErpInvoicePdfUpload } from "@/modules/erp-invoices-core/components/ErpInvoicePdfUpload";
import { VietnamInvoiceTemplate } from "@/modules/erp-invoices-core/components/VietnamInvoiceTemplate";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

const TYPE_OPTS = [
  { value: "HOP_DONG", label: "Hợp đồng" },
  { value: "HOA_DON", label: "Hóa đơn" },
  { value: "BANG_KE", label: "Bảng kê" },
  { value: "KHAC", label: "Khác" },
];

const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  TYPE_OPTS.map((x) => [x.value, x.label]),
);

function typeLabel(type: string | null) {
  return type ? (TYPE_LABEL[type] ?? type) : "Khác";
}

export function DinhKemChungTu() {
  const [items, setItems] = useState<ErpAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const search = "";
  const invoiceFormHook = useErpInvoiceForm(async () => {});
  const [typeFilter, setTypeFilter] = useState<string | "">("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sort, setSort] = useState<string[]>([]);

  const getSortState = (key: string) => {
    if (sort.includes(key)) return "asc";
    if (sort.includes(`-${key}`)) return "desc";
    return "none";
  };

  const fetchAttachmentOptions = async ({
    columnKey,
    search: querySearch,
    pageParam = 1,
    filtersStr,
  }: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => {
    return getAttachmentOptionsApi({
      columnKey,
      search: querySearch,
      pageParam,
      filtersStr,
    });
  };

  const handleSortChange = (key: string, state: "asc" | "desc" | "none") => {
    if (state === "none") {
      setSort(["-createdAt"]);
    } else {
      setSort([state === "desc" ? `-${key}` : key]);
    }
    setPage(1);
  };
  const [selected, setSelected] = useState<ErpAttachment | null>(null);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [colSearch, setColSearch] = useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getAttachmentsPagedApi({
        page,
        pageSize,
        search: search || undefined,
        documentType: typeFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sort,
        filtersStr:
          Object.keys(filters).length > 0 ? JSON.stringify(filters) : undefined,
      });
      setItems(res.items || []);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setFetchError("Không thể tải danh sách tài liệu đính kèm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [page, pageSize, typeFilter, search, dateFrom, dateTo, filters]);

  function handlePageSize(size: number) {
    setPageSize(size);
    setPage(1);
  }

  async function openFile(a: ErpAttachment) {
    try {
      const res = await getAttachmentDownloadUrlApi(a.id, true);
      window.open(res.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error(e);
    }
  }

  function selectAttachment(a: ErpAttachment) {
    setSelected(a);
  }

  const columns: DataTableColumn<ErpAttachment>[] = [
    {
      key: "createdAt",
      header: (
        <TableColumnHeaderFilter
          title="Ngày tải"
          sortState={getSortState("createdAt")}
          onSortChange={(state) => handleSortChange("createdAt", state)}
          searchValue=""
          onSearchChange={() => {}}
          selectedFilters={[]}
          onFilterChange={() => {}}
          hideFilter
          hideFooter
          align="center"
          isActive={!!(dateFrom || dateTo)}
          dateRangeSlot={({ close }) => (
            <InvoiceDateRangeSlot
              dateFrom={dateFrom}
              dateTo={dateTo}
              onChange={(from: string, to: string) => {
                setDateFrom(from);
                setDateTo(to);
                setPage(1);
              }}
              onClose={close}
            />
          )}
        />
      ),
      cell: (a) => a.createdAt?.slice(0, 10) || "—",
      className: "text-[color:var(--muted-fg)] whitespace-nowrap text-center",
      headerClassName: "text-center",
      skeletonClassName: "w-20",
      size: 150,
    },
    {
      key: "documentType",
      header: (
        <TableColumnHeaderFilter
          title="Loại"
          sortState={getSortState("documentType")}
          onSortChange={(state) => handleSortChange("documentType", state)}
          searchValue=""
          onSearchChange={() => {}}
          filterOptions={TYPE_OPTS}
          selectedFilters={typeFilter ? [typeFilter] : []}
          onFilterChange={(vals) => {
            setTypeFilter(vals.length ? vals[0] : "");
            setPage(1);
          }}
          align="center"
        />
      ),
      className: "text-center",
      headerClassName: "text-center",
      cell: (a) => (
        <div className="flex justify-center w-full">
          <TypeBadge type={a.documentType} />
        </div>
      ),
      skeletonClassName: "w-24",
      size: 150,
    },
    {
      key: "fileName",
      header: (
        <TableColumnHeaderFilter
          title="Tên file"
          sortState={getSortState("fileName")}
          onSortChange={(state) => handleSortChange("fileName", state)}
          searchValue={colSearch["fileName"] || ""}
          onSearchChange={(v) =>
            setColSearch((prev) => ({ ...prev, fileName: v }))
          }
          selectedFilters={filters["fileName"] || []}
          onFilterChange={(vals) => {
            setFilters((prev) => ({ ...prev, fileName: vals }));
            setPage(1);
          }}
          align="center"
          columnKey="fileName"
          fetchOptions={fetchAttachmentOptions}
        />
      ),
      cell: (a) => (
        <TableText
          text={a.fileName}
          onDrawerClick={() => selectAttachment(a)}
          tooltip={true}
        />
      ),
      className: "max-w-[400px] truncate text-left font-medium",
      headerClassName: "text-center",
      skeletonClassName: "w-64",
      size: 250,
    },
    {
      key: "module",
      header: (
        <TableColumnHeaderFilter
          title="Phân hệ"
          sortState={getSortState("module")}
          onSortChange={(state) => handleSortChange("module", state)}
          searchValue={colSearch["module"] || ""}
          onSearchChange={(v) =>
            setColSearch((prev) => ({ ...prev, module: v }))
          }
          selectedFilters={filters["module"] || []}
          onFilterChange={(vals) => {
            setFilters((prev) => ({ ...prev, module: vals }));
            setPage(1);
          }}
          align="center"
          columnKey="module"
          fetchOptions={fetchAttachmentOptions}
        />
      ),
      cell: (a) => a.module || "—",
      className: "text-center text-[color:var(--muted-fg)]",
      headerClassName: "text-center",
      skeletonClassName: "w-32",
      size: 200,
    },
    {
      key: "relatedDocs",
      header: (
        <TableColumnHeaderFilter
          title="Chứng từ liên quan"
          sortState="none"
          onSortChange={() => {}}
          searchValue={colSearch["relatedDocs"] || ""}
          onSearchChange={(v) =>
            setColSearch((prev) => ({ ...prev, relatedDocs: v }))
          }
          selectedFilters={filters["relatedDocs"] || []}
          onFilterChange={(vals) => {
            setFilters((prev) => ({ ...prev, relatedDocs: vals }));
            setPage(1);
          }}
          columnKey="relatedDocs"
          fetchOptions={fetchAttachmentOptions}
          align="center"
        />
      ),
      cell: (a) => {
        if (!a.invoiceLinks || a.invoiceLinks.length === 0) {
          return <span>—</span>;
        }
        return (
          <div className="flex flex-col gap-1 items-start justify-center">
            {a.invoiceLinks.map((link, idx) =>
              link.invoice?.invoiceNo ? (
                <TableText
                  key={idx}
                  text={link.invoice.invoiceNo}
                  onDrawerClick={() => {
                    if (link.invoice?.id) {
                      invoiceFormHook.openInternal(link.invoice.id);
                    }
                  }}
                  className="w-auto"
                />
              ) : null,
            )}
          </div>
        );
      },
      className: "text-left pl-4",
      headerClassName: "text-center",
      skeletonClassName: "w-32",
      size: 200,
    },
    {
      key: "fileExt",
      header: (
        <TableColumnHeaderFilter
          title="Loại file"
          sortState="none"
          onSortChange={() => {}}
          searchValue={colSearch["fileExt"] || ""}
          onSearchChange={(v) =>
            setColSearch((prev) => ({ ...prev, fileExt: v }))
          }
          selectedFilters={filters["fileExt"] || []}
          onFilterChange={(vals) => {
            setFilters((prev) => ({ ...prev, fileExt: vals }));
            setPage(1);
          }}
          align="center"
          columnKey="fileExt"
          fetchOptions={fetchAttachmentOptions}
        />
      ),
      cell: (a) => {
        const ext = a.fileName.split(".").pop()?.toUpperCase() || "—";
        return <span className="text-xs font-semibold">{ext}</span>;
      },
      className: "text-center",
      headerClassName: "text-center",
      skeletonClassName: "w-16",
      size: 150,
    },
    {
      key: "fileSize",
      header: (
        <TableColumnHeaderFilter
          title="Dung lượng"
          sortState={getSortState("fileSize")}
          onSortChange={(state) => handleSortChange("fileSize", state)}
          searchValue={colSearch["fileSize"] || ""}
          onSearchChange={(v) =>
            setColSearch((prev) => ({ ...prev, fileSize: v }))
          }
          selectedFilters={filters["fileSize"] || []}
          onFilterChange={(vals) => {
            setFilters((prev) => ({ ...prev, fileSize: vals }));
            setPage(1);
          }}
          align="center"
        />
      ),
      cell: (a) =>
        a.fileSize != null ? `${(a.fileSize / 1024).toFixed(1)} KB` : "—",
      className: "text-[color:var(--muted-fg)] whitespace-nowrap text-center",
      headerClassName: "text-center",
      skeletonClassName: "w-20",
      size: 150,
    },
  ];

  return (
    <SpreadsheetPageTemplate<ErpAttachment>
      title="Quản lý tài liệu"
      desc="Quản lý tài liệu upload tập trung trong hệ thống"
      icon={<Paperclip className="h-4 w-4" />}
      tableId="attachments-table"
      items={items}
      columns={columns}
      getRowKey={(a) => a.id}
      loading={loading}
      error={fetchError}
      emptyLabel="Chưa có tài liệu đính kèm."
      minWidth={900}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      onPage={setPage}
      onPageSize={handlePageSize}
      onRefresh={loadData}
    >
      <AttachmentDetail
        item={selected}
        onOpenFile={selected ? () => openFile(selected) : undefined}
        onClose={() => setSelected(null)}
      />

      <ErpInvoiceInternalDrawer
        open={invoiceFormHook.internalDrawerOpen}
        onClose={() => invoiceFormHook.setInternalDrawerOpen(false)}
        editMode={invoiceFormHook.editMode}
        detailInvoice={invoiceFormHook.detailInvoice}
        startEdit={invoiceFormHook.startEdit}
        saving={invoiceFormHook.saving}
        handleSave={invoiceFormHook.handleSave}
        cancelEdit={invoiceFormHook.cancelEdit}
        onSyncDetail={invoiceFormHook.handleSyncDetail}
        loadingDetail={invoiceFormHook.loadingDetail}
        onDownload={async (id, type) => {
          const res = await erpInvoicesCoreApi.getDownloadUrl(id, type);
          window.open(res.url, "_blank");
        }}
        rightPanel={
          <div className="flex flex-col gap-5">
            {invoiceFormHook.loadingDetail ? (
              <div className="space-y-6">
                <div className="h-[200px] bg-slate-100 animate-pulse rounded-lg border border-slate-200" />
                <div className="h-[300px] bg-slate-100 animate-pulse rounded-lg border border-slate-200" />
              </div>
            ) : invoiceFormHook.detailInvoice ? (
              <ErpInvoiceInternalSidebar
                form={invoiceFormHook.form}
                editMode={invoiceFormHook.editMode}
                fieldSet={(key: string, value: any) =>
                  invoiceFormHook.setForm((prev) => ({ ...prev, [key]: value }))
                }
                invoiceId={invoiceFormHook.detailInvoice?.id ?? null}
                pendingTagIds={invoiceFormHook.pendingTagIds}
                onPendingTagsChange={invoiceFormHook.setPendingTagIds}
                direction={
                  invoiceFormHook.detailInvoice.direction as "IN" | "OUT"
                }
                detailInvoice={invoiceFormHook.detailInvoice}
                onRefreshDetail={invoiceFormHook.handleSyncDetail}
                pdfSlot={
                  <ErpInvoicePdfUpload
                    invoiceId={invoiceFormHook.detailInvoice?.id ?? null}
                    attachments={
                      invoiceFormHook.detailInvoice?.attachments ?? null
                    }
                    editMode={invoiceFormHook.editMode}
                    pendingDeletedPdfs={invoiceFormHook.form.pendingDeletedPdfs}
                    onPendingDeletePdf={(key) => {
                      const current =
                        invoiceFormHook.form.pendingDeletedPdfs || [];
                      invoiceFormHook.setForm((prev) => ({
                        ...prev,
                        pendingDeletedPdfs: [...current, key],
                      }));
                    }}
                    pendingAddedAttachments={
                      invoiceFormHook.form.pendingAddedAttachments
                    }
                    onPendingAddedAttachmentsChange={(files) => {
                      invoiceFormHook.setForm((prev) => ({
                        ...prev,
                        pendingAddedAttachments: files,
                      }));
                    }}
                  />
                }
              />
            ) : null}
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          {invoiceFormHook.loadingDetail ? (
            <div className="space-y-6">
              <div className="h-[250px] bg-slate-100 animate-pulse rounded-lg border border-slate-200" />
              <div className="h-[400px] bg-slate-100 animate-pulse rounded-lg border border-slate-200" />
            </div>
          ) : (
            <>
              {invoiceFormHook.formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
                  {invoiceFormHook.formError}
                </div>
              )}
              <ErpInvoiceInternalMain
                form={invoiceFormHook.form}
                editMode={invoiceFormHook.editMode}
                fieldSet={(key: string, value: any) =>
                  invoiceFormHook.setForm((prev) => ({ ...prev, [key]: value }))
                }
                direction={
                  invoiceFormHook.detailInvoice?.direction as "IN" | "OUT"
                }
                detailInvoice={invoiceFormHook.detailInvoice}
                postingState={invoiceFormHook.postingState}
                pendingUnpost={invoiceFormHook.pendingUnpost}
                onUnpost={() => invoiceFormHook.setPendingUnpost(true)}
                onRefreshDetail={() => {
                  if (invoiceFormHook.detailInvoice?.id) {
                    invoiceFormHook.openInternal(
                      invoiceFormHook.detailInvoice.id,
                    );
                  }
                }}
                invoicePreview={
                  invoiceFormHook.detailInvoice ? (
                    <VietnamInvoiceTemplate
                      invoice={invoiceFormHook.detailInvoice}
                    />
                  ) : undefined
                }
              />
            </>
          )}
        </div>
      </ErpInvoiceInternalDrawer>
    </SpreadsheetPageTemplate>
  );
}

function AttachmentDetail({
  item,
  onOpenFile,
  onClose,
}: {
  item: ErpAttachment | null;
  onOpenFile?: () => void;
  onClose: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (!item) {
      setPreviewUrl("");
      return;
    }
    let isMounted = true;
    getAttachmentDownloadUrlApi(item.id, true).then((res) => {
      if (isMounted) setPreviewUrl(res.url);
    });
    return () => {
      isMounted = false;
    };
  }, [item]);

  const previewType = item?.mimeType ?? "";

  return (
    <DrawerModal
      open={!!item}
      onClose={onClose}
      title="Chi tiết đính kèm"
      subtitle={item ? item.fileName : ""}
      icon={<FileText className="w-4 h-4" />}
      panelClassName="w-[520px]"
    >
      {item && (
        <div>
          <DrawerRow
            label="Loại tài liệu"
            value={typeLabel(item.documentType)}
          />
          <DrawerRow
            label="ID file"
            value={item.id}
            cls="font-mono break-all"
          />
          <DrawerRow label="Tên file" value={item.fileName} cls="break-all" />
          <DrawerRow
            label="Dung lượng"
            value={
              item.fileSize ? `${(item.fileSize / 1024).toFixed(1)} KB` : "—"
            }
          />
          <DrawerRow label="Định dạng" value={item.mimeType || "—"} />
          <DrawerRow label="Ngày tải" value={item.createdAt || "—"} />

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[11px] font-medium text-[color:var(--muted-fg)]">
                Xem nội dung
              </div>
              <Button
                type="button"
                onClick={onOpenFile}
                variant="secondary"
                size="sm"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Mở tab mới
              </Button>
            </div>
            <div className="h-[360px] overflow-hidden rounded-lg border border-border bg-[color:var(--muted)]">
              {previewUrl && previewType.startsWith("image/") && (
                <img
                  src={previewUrl}
                  alt={item.fileName}
                  className="h-full w-full object-contain"
                />
              )}
              {previewUrl && previewType === "application/pdf" && (
                <iframe
                  title={item.fileName}
                  src={previewUrl}
                  className="h-full w-full bg-white"
                />
              )}
              {previewUrl &&
                (previewType ===
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                  previewType === "application/msword" ||
                  previewType ===
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                  previewType === "application/vnd.ms-excel" ||
                  item.fileName.toLowerCase().endsWith(".docx") ||
                  item.fileName.toLowerCase().endsWith(".doc") ||
                  item.fileName.toLowerCase().endsWith(".xlsx") ||
                  item.fileName.toLowerCase().endsWith(".xls")) && (
                  <iframe
                    title={item.fileName}
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`}
                    className="h-full w-full bg-white"
                  />
                )}
              {previewUrl &&
                !previewType.startsWith("image/") &&
                previewType !== "application/pdf" &&
                previewType !==
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
                previewType !== "application/msword" &&
                previewType !==
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
                previewType !== "application/vnd.ms-excel" &&
                !item.fileName.toLowerCase().endsWith(".docx") &&
                !item.fileName.toLowerCase().endsWith(".doc") &&
                !item.fileName.toLowerCase().endsWith(".xlsx") &&
                !item.fileName.toLowerCase().endsWith(".xls") && (
                  <div className="flex h-full items-center justify-center px-6 text-center text-xs text-[color:var(--muted-fg)]">
                    Không thể tải preview cho loại file này. Hãy tải xuống để
                    xem.
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </DrawerModal>
  );
}

function TypeBadge({ type }: { type: string | null }) {
  let colorClass = "bg-[#f1f5f9] text-[#475569] border-transparent"; // KHAC (gray)
  if (type === "HOP_DONG")
    colorClass = "bg-[#ecfdf5] text-[#10b981] border-[#10b981]/20"; // green
  else if (type === "HOA_DON")
    colorClass = "bg-[#eff6ff] text-[#3b82f6] border-[#3b82f6]/20"; // blue
  else if (type === "BANG_KE")
    colorClass = "bg-[#fff7ed] text-[#f97316] border-[#f97316]/20"; // orange

  return (
    <Badge
      variant="outline"
      className={`w-20 inline-flex justify-center ${colorClass}`}
    >
      {typeLabel(type)}
    </Badge>
  );
}
