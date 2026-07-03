import { useEffect, useState } from "react";
import { Eye, ExternalLink, FileText, Paperclip } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Panel, PanelMore } from "@/shared/components/Panel";
import { PageLayout } from "@/shared/components/PageLayout";
import { SearchInput } from "@/shared/components/SearchInput";
import { useT } from "@/core/i18n";
import { Combobox } from "@/shared/components/Combobox";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { DrawerModal, DrawerRow } from "@/shared/components/DrawerModal";
import {
  getFileViewUrl,
  getPaymentVoucherApi,
  getPaymentVoucherAttachmentsPagedApi,
  type AttachmentType,
  type PaymentVoucher,
  type PaymentVoucherAttachment,
} from "@/modules/finance/api/financeApi";

const TYPE_OPTS: { value: AttachmentType; label: string }[] = [
  { value: "INVOICE", label: "Hóa đơn" },
  { value: "RECEIPT", label: "Biên lai" },
  { value: "CONTRACT", label: "Hợp đồng" },
  { value: "PAYMENT_REQUEST", label: "Đề nghị thanh toán" },
  { value: "BANK_STATEMENT", label: "Sao kê ngân hàng" },
  { value: "OTHER", label: "Khác" },
];

const TYPE_LABEL: Record<AttachmentType, string> = Object.fromEntries(
  TYPE_OPTS.map((x) => [x.value, x.label]),
) as Record<AttachmentType, string>;

function getVoucher(a: PaymentVoucherAttachment): PaymentVoucher | null {
  return typeof a.payment_voucher_id === "object" ? a.payment_voucher_id : null;
}

function voucherId(a: PaymentVoucherAttachment) {
  if (!a.payment_voucher_id) return "";
  return typeof a.payment_voucher_id === "object"
    ? a.payment_voucher_id.id
    : a.payment_voucher_id;
}

function fileId(a: PaymentVoucherAttachment) {
  if (!a.file) return "";
  return typeof a.file === "object" ? a.file.id : a.file;
}

function fileName(a: PaymentVoucherAttachment) {
  if (!a.file) return "File không còn tồn tại";
  if (typeof a.file === "object") {
    return a.file.filename_download ?? a.file.filename_disk ?? a.file.id;
  }
  return `File ${a.file.slice(0, 8)}`;
}

function fileType(a: PaymentVoucherAttachment) {
  return a.file && typeof a.file === "object" ? (a.file.type ?? "") : "";
}

function channelLabel(v: PaymentVoucher | null) {
  if (!v) return "Chưa phân loại";
  return v.voucher_channel === "BANK" ? "Tiền gửi / UNT-UNC" : "Tiền mặt";
}

function typeLabel(type: AttachmentType | null) {
  return type ? (TYPE_LABEL[type] ?? type) : "Khác";
}

export function DinhKemChungTu() {
  const [items, setItems] = useState<PaymentVoucherAttachment[]>([]);
  const [voucherMap, setVoucherMap] = useState<Record<string, PaymentVoucher>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AttachmentType | "">("");
  const [selected, setSelected] = useState<PaymentVoucherAttachment | null>(
    null,
  );
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState("");

  const loadData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getPaymentVoucherAttachmentsPagedApi({
        page,
        pageSize,
        search: search || undefined,
        attachment_type: typeFilter,
        sort: ["-uploaded_at"],
      });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      const ids = Array.from(
        new Set(res.items.map(voucherId).filter((id) => id && !voucherMap[id])),
      );
      if (ids.length) {
        const vouchers = await Promise.all(
          ids.map((id) => getPaymentVoucherApi(id).catch(() => null)),
        );
        setVoucherMap((prev) => ({
          ...prev,
          ...Object.fromEntries(
            vouchers.filter(Boolean).map((v) => [v!.id, v as PaymentVoucher]),
          ),
        }));
      }
    } catch {
      setFetchError("Không thể tải danh sách tài liệu đính kèm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [page, pageSize, typeFilter, search]);

  function handlePageSize(size: number) {
    setPageSize(size);
    setPage(1);
  }

  function openFile(a: PaymentVoucherAttachment) {
    const id = fileId(a);
    if (!id) return;
    window.open(getFileViewUrl(id), "_blank", "noopener,noreferrer");
  }

  function selectAttachment(a: PaymentVoucherAttachment) {
    const id = fileId(a);
    setSelected(a);
    setPreviewType(fileType(a));
    setPreviewUrl(id ? getFileViewUrl(id) : "");
  }

  const columns: DataTableColumn<PaymentVoucherAttachment>[] = [
    {
      key: "uploaded_at",
      header: "Ngày tải",
      cell: (a) => a.uploaded_at?.slice(0, 10) || "—",
      className: "text-[color:var(--muted-fg)] whitespace-nowrap text-right",
      headerClassName: "text-center",
      skeletonClassName: "w-20",
    },
    {
      key: "attachment_type",
      header: "Loại",
      className: "text-center",
      headerClassName: "text-center",
      cell: (a) => (
        <div className="flex justify-center w-full">
          <TypeBadge type={a.attachment_type} />
        </div>
      ),
      skeletonClassName: "w-24",
    },
    {
      key: "channel",
      header: "Phân hệ",
      cell: (a) => {
        const voucher = getVoucher(a) ?? voucherMap[voucherId(a)];
        return channelLabel(voucher);
      },
      className: "whitespace-nowrap text-left",
      headerClassName: "text-center",
      skeletonClassName: "w-28",
    },
    {
      key: "voucher_no",
      header: "Số CT",
      cell: (a) => {
        const voucher = getVoucher(a) ?? voucherMap[voucherId(a)];
        return voucher?.voucher_no ?? voucherId(a).slice(0, 8);
      },
      className: "font-mono font-semibold text-left",
      headerClassName: "text-center",
      skeletonClassName: "w-20",
    },
    {
      key: "file",
      header: "Tên file",
      cell: fileName,
      className: "max-w-[280px] truncate text-left",
      headerClassName: "text-center",
      skeletonClassName: "w-44",
    },
    {
      key: "note",
      header: "Ghi chú",
      cell: (a) => a.note || "—",
      className:
        "text-[color:var(--muted-fg)] max-w-[240px] truncate text-left",
      headerClassName: "text-center",
      skeletonClassName: "w-36",
    },
    {
      key: "actions",
      header: "",
      cell: (a) => (
        <div className="flex justify-center w-full">
          <Button
            title="Xem chi tiết"
            onClick={() => selectAttachment(a)}
            variant="ghost"
            size="icon-sm"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: "text-center",
      headerClassName: "w-[56px] text-center",
      skeletonClassName: "",
    },
  ];

  const t = useT();

  return (
    <PageLayout
      title={t("dinhkem.title")}
      desc={t("dinhkem.desc")}
      icon={<Paperclip className="h-4 w-4" />}
    >
      <Panel title="Danh sách tài liệu" extra={<PanelMore />}>
        <DataTable
          items={items}
          columns={columns}
          getRowKey={(a) => a.id}
          loading={loading}
          error={fetchError}
          emptyLabel="Chưa có tài liệu đính kèm."
          minWidth={900}
          elevated={false}
          filters={
            <>
              <SearchInput
                placeholder="Tìm file, số CT, ghi chú..."
                value={search}
                onChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
                className="max-w-[260px]"
              />
              <Combobox
                options={TYPE_OPTS}
                value={typeFilter}
                onChange={(v) => {
                  setTypeFilter((v as AttachmentType | "") ?? "");
                  setPage(1);
                }}
                placeholder="Tất cả loại tài liệu"
                className="w-[200px]"
              />
            </>
          }
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onPage={setPage}
          onPageSize={handlePageSize}
        />
      </Panel>

      <AttachmentDetail
        item={selected}
        voucher={
          selected
            ? (getVoucher(selected) ?? voucherMap[voucherId(selected)])
            : null
        }
        previewUrl={previewUrl}
        previewType={previewType}
        onOpenFile={selected ? () => openFile(selected) : undefined}
        onClose={() => setSelected(null)}
      />
    </PageLayout>
  );
}

function AttachmentDetail({
  item,
  voucher,
  previewUrl,
  previewType,
  onOpenFile,
  onClose,
}: {
  item: PaymentVoucherAttachment | null;
  voucher: PaymentVoucher | null;
  previewUrl: string;
  previewType: string;
  onOpenFile?: () => void;
  onClose: () => void;
}) {
  return (
    <DrawerModal
      open={!!item}
      onClose={onClose}
      title="Chi tiết đính kèm"
      subtitle={item ? fileName(item) : ""}
      icon={<FileText className="w-4 h-4" />}
      panelClassName="w-[520px]"
    >
      {item && (
        <div>
          <DrawerRow
            label="Loại tài liệu"
            value={typeLabel(item.attachment_type)}
          />
          <DrawerRow label="Phân hệ" value={channelLabel(voucher)} />
          <DrawerRow label="Số chứng từ" value={voucher?.voucher_no ?? "—"} />
          <DrawerRow
            label="Ngày chứng từ"
            value={voucher?.document_date ?? "—"}
          />
          <DrawerRow
            label="File ID"
            value={fileId(item)}
            cls="font-mono break-all"
          />
          <DrawerRow label="Tên file" value={fileName(item)} cls="break-all" />
          <DrawerRow label="Ghi chú" value={item.note || "—"} />
          <DrawerRow label="Ngày tải" value={item.uploaded_at || "—"} />
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[11px] font-medium text-[color:var(--muted-fg)]">
                Xem nội dung
              </div>
              <Button
                type="button"
                disabled={!fileId(item)}
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
                  alt={fileName(item)}
                  className="h-full w-full object-contain"
                />
              )}
              {previewUrl && !previewType.startsWith("image/") && (
                <iframe
                  title={fileName(item)}
                  src={previewUrl}
                  className="h-full w-full bg-white"
                />
              )}
              {!previewUrl && (
                <div className="flex h-full items-center justify-center px-6 text-center text-xs text-[color:var(--muted-fg)]">
                  Không thể tải preview. Hãy kiểm tra endpoint xem file ở
                  backend.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DrawerModal>
  );
}

function TypeBadge({ type }: { type: AttachmentType | null }) {
  return (
    <span className="inline-flex whitespace-nowrap text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium bg-[#e8f0fd] text-[#2a6dd9]">
      {typeLabel(type)}
    </span>
  );
}
