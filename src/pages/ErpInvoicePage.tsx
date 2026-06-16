import { useCallback, useEffect, useState } from "react";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import {
  DrawerModal,
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import { Button } from "@/shared/components/ui/Button";
import { Combobox } from "@/shared/components/Combobox";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { FilterPanel, FilterButton } from "@/shared/components/FilterPanel";
import { PageLayout } from "@/shared/components/PageLayout";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { extractApiError } from "@/shared/utils/apiError";
import { money, today } from "@/shared/utils/format";
import {
  erpInvoicesCoreApi,
  type ErpInvoice,
  type CreateErpInvoicePayload,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { InvoiceXmlUploadModal } from "@/modules/erp-invoices-core/components/InvoiceXmlUploadModal";
import {
  PlusCircle,
  Receipt,
  ExternalLink,
  FileUp,
  Download,
  Eye,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
type Direction = "IN" | "OUT";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Nháp" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const DIRECTION_TABS: { value: Direction; label: string }[] = [
  { value: "IN", label: "Hóa đơn mua vào" },
  { value: "OUT", label: "Hóa đơn bán ra" },
];

// ---------------------------------------------------------------------------
// Empty form state
// ---------------------------------------------------------------------------
function emptyForm(): CreateErpInvoicePayload {
  return {
    invoiceNo: "",
    invoiceDate: today(),
    direction: "IN",
    status: "DRAFT",
    sellerName: "",
    sellerTaxCode: "",
    sellerAddress: "",
    sellerBank: "",
    buyerName: "",
    buyerTaxCode: "",
    buyerAddress: "",
    description: "",
    preVatAmount: 0,
    vatRate: 0,
    vatAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
  };
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export function ErpInvoicePage() {
  const t = useT();
  const { navigate } = useAppStore();

  // List state
  const [direction, setDirection] = useState<Direction>("IN");
  const [page, setPage] = useState(1);
  const [invoices, setInvoices] = useState<ErpInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const [sortBy, setSortBy] = useState<string>("invoiceDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filterPanel = useFilterPanel(
    {
      search: true,
      period: true,
      noDefaultPeriod: true,
      status: { options: STATUS_OPTIONS, placeholder: "Tất cả trạng thái" },
    },
    () => setPage(1),
  );

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<ErpInvoice | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<CreateErpInvoicePayload>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // XML Upload modal state
  const [xmlModalOpen, setXmlModalOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Load invoices
  // ---------------------------------------------------------------------------
  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const { search, dateFrom, dateTo, status } = filterPanel.state;
      const res = await erpInvoicesCoreApi.list({
        direction,
        search: search || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        status: status || undefined,
        page,
        pageSize: 40,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
      });
      setInvoices(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [
    direction,
    filterPanel.state.search,
    filterPanel.state.dateFrom,
    filterPanel.state.dateTo,
    filterPanel.state.status,
    sortBy,
    sortOrder,
    page,
  ]);

  useEffect(() => {
    setPage(1);
  }, [direction]);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  // ---------------------------------------------------------------------------
  // Drawer open handlers
  // ---------------------------------------------------------------------------
  function openNew() {
    setDetailInvoice(null);
    setEditMode(true);
    setForm({ ...emptyForm(), direction });
    setFormError(null);
    setDeleteConfirm(false);
    setDrawerOpen(true);
  }

  function openDetail(inv: ErpInvoice) {
    setDetailInvoice(inv);
    setEditMode(false);
    setDeleteConfirm(false);
    setDrawerOpen(true);
  }

  function startEdit() {
    if (!detailInvoice) return;
    setForm({
      invoiceNo: detailInvoice.invoiceNo,
      serialNo: detailInvoice.serialNo ?? undefined,
      invoiceDate: detailInvoice.invoiceDate,
      direction: detailInvoice.direction,
      status: detailInvoice.status,
      sellerName: detailInvoice.sellerName ?? "",
      sellerTaxCode: detailInvoice.sellerTaxCode ?? "",
      sellerAddress: detailInvoice.sellerAddress ?? "",
      sellerBank: detailInvoice.sellerBank ?? "",
      buyerName: detailInvoice.buyerName ?? "",
      buyerTaxCode: detailInvoice.buyerTaxCode ?? "",
      buyerAddress: detailInvoice.buyerAddress ?? "",
      description: detailInvoice.description ?? "",
      preVatAmount: Number(detailInvoice.preVatAmount),
      vatRate:
        detailInvoice.vatRate != null
          ? Number(detailInvoice.vatRate)
          : undefined,
      vatAmount: Number(detailInvoice.vatAmount),
      discountAmount: Number(detailInvoice.discountAmount),
      totalAmount: Number(detailInvoice.totalAmount),
      purchaseOrderId: detailInvoice.purchaseOrderId ?? undefined,
      salesOrderId: detailInvoice.salesOrderId ?? undefined,
      notes: detailInvoice.notes ?? "",
    });
    setFormError(null);
    setEditMode(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setDetailInvoice(null);
    setEditMode(false);
    setDeleteConfirm(false);
  }

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------
  async function handleSave() {
    if (!form.invoiceNo.trim()) {
      setFormError("Số hóa đơn là bắt buộc.");
      return;
    }
    if (!form.invoiceDate) {
      setFormError("Ngày hóa đơn là bắt buộc.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (detailInvoice) {
        const updated = await erpInvoicesCoreApi.update(detailInvoice.id, form);
        setDetailInvoice(updated);
        setEditMode(false);
      } else {
        await erpInvoicesCoreApi.create(form);
        closeDrawer();
      }
      await loadInvoices();
    } catch (e) {
      setFormError(extractApiError(e, "Không thể lưu hóa đơn."));
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------
  async function handleDelete() {
    if (!detailInvoice) return;
    setSaving(true);
    try {
      await erpInvoicesCoreApi.remove(detailInvoice.id);
      closeDrawer();
      await loadInvoices();
    } catch (e) {
      setFormError(extractApiError(e, "Không thể xóa hóa đơn."));
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  function fmtAmt(val: string | null | undefined) {
    if (val == null) return "—";
    const n = Number(val);
    return isNaN(n) ? "—" : money(n);
  }

  function fieldSet<K extends keyof CreateErpInvoicePayload>(
    key: K,
    value: CreateErpInvoicePayload[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------
  const columns: DataTableColumn<ErpInvoice>[] = [
    {
      key: "invoiceDate",
      header: "Ngày HĐ",
      sortable: true,
      headerClassName: "min-w-[100px]",
      className: "min-w-[100px]",
      cell: (inv) => inv.invoiceDate,
    },
    {
      key: "serialNo",
      header: "Ký hiệu",
      headerClassName: "min-w-[100px]",
      className: "text-muted-foreground min-w-[100px]",
      cell: (inv) => inv.serialNo || "—",
    },
    {
      key: "invoiceNo",
      header: "Số HĐ",
      sortable: true,
      headerClassName: "min-w-[110px]",
      className: "font-medium text-primary min-w-[110px]",
      cell: (inv) => inv.invoiceNo,
    },
    {
      key: "serialNo",
      header: "Ký hiệu",
      headerClassName: "min-w-[100px]",
      className: "text-muted-foreground min-w-[100px]",
      cell: (inv) => inv.serialNo || "—",
    },
    {
      key: "partner",
      header: direction === "IN" ? "Bên bán" : "Bên mua",
      sortable: true,
      sortKey: direction === "IN" ? "sellerName" : "buyerName",
      headerClassName: "min-w-[500px]",
      className: "min-w-[500px] max-w-[625px]",
      cell: (inv) => {
        const text =
          direction === "IN" ? inv.sellerName || "—" : inv.buyerName || "—";
        return (
          <Tooltip content={text !== "—" ? text : ""}>
            <div className="truncate w-full cursor-pointer">{text}</div>
          </Tooltip>
        );
      },
    },
    {
      key: "taxCode",
      header: "MST",
      headerClassName: "min-w-[120px]",
      className: "text-muted-foreground text-xs min-w-[120px]",
      cell: (inv) =>
        direction === "IN" ? inv.sellerTaxCode || "—" : inv.buyerTaxCode || "—",
    },
    {
      key: "preVatAmount",
      header: "Trước VAT",
      headerClassName: "text-right min-w-[110px]",
      className: "text-right min-w-[110px]",
      cell: (inv) => fmtAmt(inv.preVatAmount),
    },
    {
      key: "vatAmount",
      header: "Thuế VAT",
      headerClassName: "text-right min-w-[100px]",
      className: "text-right min-w-[100px]",
      cell: (inv) => fmtAmt(inv.vatAmount),
    },
    {
      key: "discountAmount",
      header: "Chiết khấu",
      headerClassName: "text-right min-w-[100px]",
      className: "text-right min-w-[100px]",
      cell: (inv) => fmtAmt(inv.discountAmount),
    },
    {
      key: "totalAmount",
      header: "Thành tiền",
      sortable: true,
      headerClassName: "text-right min-w-[120px]",
      className: "text-right font-semibold min-w-[120px]",
      cell: (inv) => fmtAmt(inv.totalAmount),
    },
    {
      key: "status",
      header: "Trạng thái",
      sortable: true,
      headerClassName: "min-w-[110px]",
      className: "min-w-[110px]",
      cell: (inv) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            inv.status === "CONFIRMED"
              ? "bg-green-100 text-green-800"
              : inv.status === "CANCELLED"
                ? "bg-red-100 text-red-800"
                : "bg-amber-100 text-amber-800"
          }`}
        >
          {inv.status === "CONFIRMED"
            ? "Đã xác nhận"
            : inv.status === "CANCELLED"
              ? "Đã hủy"
              : "Nháp"}
        </span>
      ),
    },
    {
      key: "link",
      header: "Chứng từ",
      headerClassName: "min-w-[90px]",
      className: "text-xs text-muted-foreground min-w-[90px]",
      cell: (inv) =>
        inv.purchaseOrderId ? (
          <button
            className="flex items-center gap-1 text-primary hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              navigate("purchasing");
            }}
          >
            PO <ExternalLink className="w-3 h-3" />
          </button>
        ) : inv.salesOrderId ? (
          <button
            className="flex items-center gap-1 text-primary hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              navigate("erp-sales-orders");
            }}
          >
            SO <ExternalLink className="w-3 h-3" />
          </button>
        ) : (
          "—"
        ),
    },
  ];

  // ---------------------------------------------------------------------------
  // Drawer actions
  // ---------------------------------------------------------------------------
  const viewActions = [
    {
      label: "Đóng",
      onClick: closeDrawer,
      variant: "outline" as const,
    },
    {
      label: "Chỉnh sửa",
      onClick: startEdit,
      variant: "secondary" as const,
    },
  ];

  const editActions = [
    {
      label: detailInvoice ? "Hủy" : "Đóng",
      onClick: detailInvoice ? () => setEditMode(false) : closeDrawer,
      variant: "outline" as const,
      disabled: saving,
    },
    ...(detailInvoice
      ? [
          {
            label: "Xóa",
            onClick: () => setDeleteConfirm(true),
            variant: "outline" as const,
            disabled: saving,
          },
        ]
      : []),
    {
      label: saving
        ? "Đang lưu..."
        : detailInvoice
          ? "Lưu thay đổi"
          : "Tạo mới",
      primary: true,
      loading: saving,
      disabled: saving,
      onClick: handleSave,
    },
  ];

  // ---------------------------------------------------------------------------
  // Drawer title
  // ---------------------------------------------------------------------------
  const drawerTitle = editMode
    ? detailInvoice
      ? `Chỉnh sửa: ${detailInvoice.invoiceNo}`
      : "Tạo hóa đơn mới"
    : detailInvoice
      ? `Chi tiết: ${detailInvoice.invoiceNo}`
      : "Hóa đơn";

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="erp-page-root h-full">
      <PageLayout
        title="Hóa đơn"
        desc="Quản lý hóa đơn đầu vào, đầu ra"
        icon={<Receipt className="h-4 w-4" />}
        actions={
          <div className="flex items-center gap-2">
            <FilterButton
              onClick={filterPanel.togglePanel}
              activeCount={filterPanel.activeFilterCount}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setXmlModalOpen(true)}
            >
              <FileUp className="w-4 h-4 mr-1.5" />
              Import XML
            </Button>
            <Button size="sm" onClick={openNew}>
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Tạo hóa đơn
            </Button>
          </div>
        }
        tabs={DIRECTION_TABS}
        activeTab={direction}
        onTabChange={(v) => setDirection(v as Direction)}
      >
        <div className="flex items-start">
          <div className="flex-1 min-w-0 space-y-4">
            <DataTable<ErpInvoice>
              minWidth={1200}
              items={invoices}
              columns={columns}
              getRowKey={(inv) => inv.id}
              actionsColumn={{
                headerClassName: "w-[48px] text-center",
                cell: (inv) => (
                  <ActionDropdown
                    items={[
                      {
                        label: t("common.edit"),
                        icon: <Eye className="w-4 h-4" />,
                        onClick: () => openDetail(inv),
                      },
                    ]}
                  />
                ),
              }}
              loading={loading}
              emptyLabel="Chưa có hóa đơn nào."
              page={page}
              pageSize={40}
              total={total}
              totalPages={totalPages}
              onPage={setPage}
              onPageSize={() => {}}
              onRowClick={openDetail}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(key) => {
                if (sortBy === key) {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                } else {
                  setSortBy(key);
                  setSortOrder("desc");
                }
                setPage(1);
              }}
            />
          </div>
          <FilterPanel
            config={{
              search: true,
              period: true,
              noDefaultPeriod: true,
              status: {
                options: STATUS_OPTIONS,
                placeholder: "Tất cả trạng thái",
              },
            }}
            filter={filterPanel}
          />
        </div>
      </PageLayout>

      {/* Drawer */}
      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        title={drawerTitle}
        panelClassName="min-[1024px]:min-w-[720px]"
        actions={editMode ? editActions : viewActions}
      >
        {/* Delete confirm */}
        {deleteConfirm && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 flex items-center justify-between gap-3">
            <span className="text-sm text-red-800">
              Xóa hóa đơn này? Hành động không thể hoàn tác.
            </span>
            <div className="flex gap-2">
              <button
                className="text-xs px-3 py-1 rounded border border-border"
                onClick={() => setDeleteConfirm(false)}
              >
                Hủy
              </button>
              <button
                className="text-xs px-3 py-1 rounded bg-red-600 text-white"
                onClick={handleDelete}
                disabled={saving}
              >
                Xóa
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-5">
          {/* VIEW MODE */}
          {!editMode && detailInvoice && (
            <>
              {/* Section: Thông tin hóa đơn */}
              <DrawerSection title="Thông tin hóa đơn">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Số hóa đơn
                    </div>
                    <div className="font-semibold">
                      {detailInvoice.invoiceNo}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Ký hiệu
                    </div>
                    <div>{detailInvoice.serialNo || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Ngày hóa đơn
                    </div>
                    <div>{detailInvoice.invoiceDate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Trạng thái
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        detailInvoice.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : detailInvoice.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {detailInvoice.status === "CONFIRMED"
                        ? "Đã xác nhận"
                        : detailInvoice.status === "CANCELLED"
                          ? "Đã hủy"
                          : "Nháp"}
                    </span>
                  </div>
                </div>
              </DrawerSection>

              {/* Section: Bên bán */}
              <DrawerSection title="Bên bán">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Tên
                    </div>
                    <div className="font-medium">
                      {detailInvoice.sellerName || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">
                      MST
                    </div>
                    <div>{detailInvoice.sellerTaxCode || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Ngân hàng
                    </div>
                    <div>{detailInvoice.sellerBank || "—"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Địa chỉ
                    </div>
                    <div>{detailInvoice.sellerAddress || "—"}</div>
                  </div>
                </div>
              </DrawerSection>

              {/* Section: Bên mua */}
              <DrawerSection title="Bên mua">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Tên
                    </div>
                    <div className="font-medium">
                      {detailInvoice.buyerName || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">
                      MST
                    </div>
                    <div>{detailInvoice.buyerTaxCode || "—"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Địa chỉ
                    </div>
                    <div>{detailInvoice.buyerAddress || "—"}</div>
                  </div>
                </div>
              </DrawerSection>

              {/* Section: Tài chính */}
              <DrawerSection title="Tài chính">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Diễn giải
                    </div>
                    <div>{detailInvoice.description || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Giá trước VAT
                    </div>
                    <div className="font-medium">
                      {fmtAmt(detailInvoice.preVatAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Thuế suất (%)
                    </div>
                    <div>
                      {detailInvoice.vatRate != null
                        ? `${(Number(detailInvoice.vatRate) * 100).toFixed(0)}%`
                        : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Tiền thuế VAT
                    </div>
                    <div>{fmtAmt(detailInvoice.vatAmount)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Chiết khấu
                    </div>
                    <div>{fmtAmt(detailInvoice.discountAmount)}</div>
                  </div>
                  <div className="col-span-2 border-t border-border pt-2">
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Thành tiền
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {fmtAmt(detailInvoice.totalAmount)}
                    </div>
                  </div>
                </div>
              </DrawerSection>

              {/* Section: Chứng từ liên quan */}
              {(detailInvoice.purchaseOrderId ||
                detailInvoice.salesOrderId ||
                detailInvoice.notes) && (
                <DrawerSection title="Liên kết & Ghi chú">
                  <div className="flex flex-col gap-2 text-sm">
                    {detailInvoice.purchaseOrderId && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">
                          Chứng từ mua hàng
                        </div>
                        <button
                          className="flex items-center gap-1.5 text-primary hover:underline font-medium"
                          onClick={() => {
                            navigate("purchasing");
                          }}
                        >
                          Xem đơn mua hàng{" "}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {detailInvoice.salesOrderId && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">
                          Chứng từ bán hàng
                        </div>
                        <button
                          className="flex items-center gap-1.5 text-primary hover:underline font-medium"
                          onClick={() => {
                            navigate("erp-sales-orders");
                          }}
                        >
                          Xem đơn bán hàng{" "}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {detailInvoice.notes && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">
                          Ghi chú
                        </div>
                        <div>{detailInvoice.notes}</div>
                      </div>
                    )}
                  </div>
                </DrawerSection>
              )}

              {/* Section: File hóa đơn */}
              {(detailInvoice.xmlFileKey || detailInvoice.pdfFileKey) && (
                <DrawerSection title="File hóa đơn">
                  <div className="flex flex-wrap gap-2">
                    {detailInvoice.xmlFileKey && (
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted transition-colors"
                        onClick={async () => {
                          try {
                            const { url } =
                              await erpInvoicesCoreApi.getDownloadUrl(
                                detailInvoice.id,
                                "xml",
                              );
                            window.open(url, "_blank");
                          } catch {
                            alert("Không thể tải file XML.");
                          }
                        }}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Tải XML
                      </button>
                    )}
                    {detailInvoice.pdfFileKey && (
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted transition-colors"
                        onClick={async () => {
                          try {
                            const { url } =
                              await erpInvoicesCoreApi.getDownloadUrl(
                                detailInvoice.id,
                                "pdf",
                              );
                            window.open(url, "_blank");
                          } catch {
                            alert("Không thể tải file PDF.");
                          }
                        }}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Tải PDF
                      </button>
                    )}
                  </div>
                </DrawerSection>
              )}
            </>
          )}

          {/* EDIT / CREATE MODE */}
          {editMode && (
            <>
              {/* Thông tin hóa đơn */}
              <DrawerSection title="Thông tin hóa đơn">
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <DrawerField label="Số hóa đơn" required>
                      <input
                        className={inputCls}
                        value={form.invoiceNo}
                        placeholder="HD-001"
                        onChange={(e) => fieldSet("invoiceNo", e.target.value)}
                      />
                    </DrawerField>
                    <DrawerField label="Ký hiệu">
                      <input
                        className={inputCls}
                        value={form.serialNo || ""}
                        placeholder="1C25TAA"
                        onChange={(e) =>
                          fieldSet("serialNo", e.target.value || undefined)
                        }
                      />
                    </DrawerField>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <DrawerField label="Ngày hóa đơn" required>
                      <DatePicker
                        className={inputCls}
                        value={form.invoiceDate?.slice(0, 10) || ""}
                        onChange={(v) => fieldSet("invoiceDate", v)}
                      />
                    </DrawerField>
                    <DrawerField label="Loại hóa đơn">
                      <Combobox
                        options={[
                          { value: "IN", label: "Đầu vào (Mua)" },
                          { value: "OUT", label: "Đầu ra (Bán)" },
                        ]}
                        value={form.direction}
                        onChange={(v) =>
                          fieldSet("direction", (v || "IN") as Direction)
                        }
                        allowClear={false}
                      />
                    </DrawerField>
                  </div>
                  <DrawerField label="Trạng thái">
                    <Combobox
                      options={STATUS_OPTIONS}
                      value={form.status || "DRAFT"}
                      onChange={(v) => fieldSet("status", v || "DRAFT")}
                      allowClear={false}
                    />
                  </DrawerField>
                </div>
              </DrawerSection>

              {/* Bên bán */}
              <DrawerSection title="Bên bán">
                <div className="flex flex-col gap-3">
                  <DrawerField label="Tên">
                    <input
                      className={inputCls}
                      value={form.sellerName || ""}
                      onChange={(e) => fieldSet("sellerName", e.target.value)}
                    />
                  </DrawerField>
                  <div className="grid grid-cols-2 gap-3">
                    <DrawerField label="MST">
                      <input
                        className={inputCls}
                        value={form.sellerTaxCode || ""}
                        onChange={(e) =>
                          fieldSet("sellerTaxCode", e.target.value)
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Ngân hàng">
                      <input
                        className={inputCls}
                        value={form.sellerBank || ""}
                        onChange={(e) => fieldSet("sellerBank", e.target.value)}
                      />
                    </DrawerField>
                  </div>
                  <DrawerField label="Địa chỉ">
                    <input
                      className={inputCls}
                      value={form.sellerAddress || ""}
                      onChange={(e) =>
                        fieldSet("sellerAddress", e.target.value)
                      }
                    />
                  </DrawerField>
                </div>
              </DrawerSection>

              {/* Bên mua */}
              <DrawerSection title="Bên mua">
                <div className="flex flex-col gap-3">
                  <DrawerField label="Tên">
                    <input
                      className={inputCls}
                      value={form.buyerName || ""}
                      onChange={(e) => fieldSet("buyerName", e.target.value)}
                    />
                  </DrawerField>
                  <div className="grid grid-cols-2 gap-3">
                    <DrawerField label="MST">
                      <input
                        className={inputCls}
                        value={form.buyerTaxCode || ""}
                        onChange={(e) =>
                          fieldSet("buyerTaxCode", e.target.value)
                        }
                      />
                    </DrawerField>
                  </div>
                  <DrawerField label="Địa chỉ">
                    <input
                      className={inputCls}
                      value={form.buyerAddress || ""}
                      onChange={(e) => fieldSet("buyerAddress", e.target.value)}
                    />
                  </DrawerField>
                </div>
              </DrawerSection>

              {/* Tài chính */}
              <DrawerSection title="Tài chính">
                <div className="flex flex-col gap-3">
                  <DrawerField label="Diễn giải">
                    <textarea
                      className={`${inputCls} min-h-[60px]`}
                      value={form.description || ""}
                      onChange={(e) => fieldSet("description", e.target.value)}
                    />
                  </DrawerField>
                  <div className="grid grid-cols-2 gap-3">
                    <DrawerField label="Giá trước VAT">
                      <input
                        className={inputCls}
                        type="number"
                        min={0}
                        value={form.preVatAmount ?? ""}
                        onChange={(e) =>
                          fieldSet("preVatAmount", Number(e.target.value))
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Thuế suất (0-1)">
                      <input
                        className={inputCls}
                        type="number"
                        step="0.01"
                        min={0}
                        max={1}
                        placeholder="0.1 = 10%"
                        value={form.vatRate ?? ""}
                        onChange={(e) =>
                          fieldSet(
                            "vatRate",
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Tiền thuế VAT">
                      <input
                        className={inputCls}
                        type="number"
                        min={0}
                        value={form.vatAmount ?? ""}
                        onChange={(e) =>
                          fieldSet("vatAmount", Number(e.target.value))
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Chiết khấu">
                      <input
                        className={inputCls}
                        type="number"
                        min={0}
                        value={form.discountAmount ?? ""}
                        onChange={(e) =>
                          fieldSet("discountAmount", Number(e.target.value))
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Thành tiền" required>
                      <input
                        className={inputCls}
                        type="number"
                        min={0}
                        value={form.totalAmount ?? ""}
                        onChange={(e) =>
                          fieldSet("totalAmount", Number(e.target.value))
                        }
                      />
                    </DrawerField>
                  </div>
                </div>
              </DrawerSection>

              {/* Ghi chú */}
              <DrawerSection title="Ghi chú">
                <DrawerField label="Ghi chú">
                  <textarea
                    className={`${inputCls} min-h-[60px]`}
                    value={form.notes || ""}
                    onChange={(e) =>
                      fieldSet("notes", e.target.value || undefined)
                    }
                  />
                </DrawerField>
              </DrawerSection>
            </>
          )}

          {/* Error */}
          {formError && (
            <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
              {formError}
            </div>
          )}
        </div>
      </DrawerModal>

      {/* XML Upload Modal */}
      <InvoiceXmlUploadModal
        open={xmlModalOpen}
        onClose={() => setXmlModalOpen(false)}
        onImported={(_importId, _dir) => {
          void loadInvoices();
        }}
      />
    </div>
  );
}
