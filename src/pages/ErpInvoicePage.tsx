import { useCallback, useEffect, useState, useMemo } from "react";

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

type InvoiceItem = NonNullable<CreateErpInvoicePayload["items"]>[number];

import { Tooltip } from "@/core/components/ui/Tooltip";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { InvoiceXmlUploadModal } from "@/modules/erp-invoices-core/components/InvoiceXmlUploadModal";
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";
import {
  PlusCircle,
  Receipt,
  ExternalLink,
  FileUp,
  Download,
  Eye,
  Trash,
  Ban,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
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
    items: [],
  };
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export function ErpInvoicePage() {
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
  const [showGeneralInfo, setShowGeneralInfo] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<CreateErpInvoicePayload>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);

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
      items:
        detailInvoice.items && detailInvoice.items.length > 0
          ? detailInvoice.items
          : [
              {
                description: detailInvoice.description || "",
                preVatAmount: detailInvoice.preVatAmount,
                vatRate: detailInvoice.vatRate,
                vatAmount: detailInvoice.vatAmount,
                discountAmount: detailInvoice.discountAmount,
                totalAmount: detailInvoice.totalAmount,
              },
            ],
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
  async function handleSave(statusOverride?: string) {
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
      const payload = { ...form };
      if (statusOverride) payload.status = statusOverride;

      if (detailInvoice) {
        const updated = await erpInvoicesCoreApi.update(
          detailInvoice.id,
          payload,
        );
        setDetailInvoice(updated);
        setEditMode(false);
      } else {
        await erpInvoicesCoreApi.create(payload);
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
      setDeleteConfirm(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Cancel
  // ---------------------------------------------------------------------------
  async function handleCancel() {
    if (!detailInvoice) return;
    setSaving(true);
    try {
      await erpInvoicesCoreApi.update(detailInvoice.id, {
        status: "CANCELLED",
      });
      setCancelConfirm(false);
      await loadInvoices();
    } catch (e) {
      setFormError(extractApiError(e, "Không thể hủy hóa đơn."));
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
  // ---------------------------------------------------------------------------
  const columns: DataTableColumn<ErpInvoice>[] = [
    {
      key: "invoiceDate",
      header: "Ngày HĐ",
      sortable: true,
      headerClassName: "w-[100px]",
      className: "w-[100px]",
      cell: (inv) => inv.invoiceDate,
    },
    {
      key: "serialNo",
      header: "Ký hiệu",
      headerClassName: "w-[100px]",
      className: "text-muted-foreground w-[100px]",
      cell: (inv) => inv.serialNo || "—",
    },
    {
      key: "invoiceNo",
      header: "Số HĐ",
      sortable: true,
      headerClassName: "w-[130px]",
      className: "font-medium text-primary w-[130px]",
      cell: (inv) => (
        <div className="flex items-center gap-2">
          <span>{inv.invoiceNo}</span>
          {inv.status !== "CONFIRMED" && (
            <span
              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${
                inv.status === "CANCELLED"
                  ? "bg-red-100 text-red-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {inv.status === "CANCELLED" ? "Đã hủy" : "Nháp"}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "partner",
      header: direction === "IN" ? "Bên bán" : "Bên mua",
      sortable: true,
      sortKey: direction === "IN" ? "sellerName" : "buyerName",
      headerClassName: "w-[320px]",
      className: "w-[320px]",
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
      headerClassName: "w-[110px]",
      className: "text-muted-foreground text-xs w-[110px]",
      cell: (inv) =>
        direction === "IN" ? inv.sellerTaxCode || "—" : inv.buyerTaxCode || "—",
    },
    {
      key: "preVatAmount",
      header: "Trước VAT",
      headerClassName: "text-right w-[110px]",
      className: "text-right w-[110px]",
      cell: (inv) => fmtAmt(inv.preVatAmount),
    },
    {
      key: "vatAmount",
      header: "Thuế VAT",
      headerClassName: "text-right w-[100px]",
      className: "text-right w-[100px]",
      cell: (inv) => fmtAmt(inv.vatAmount),
    },
    {
      key: "discountAmount",
      header: "Chiết khấu",
      headerClassName: "text-right w-[100px]",
      className: "text-right w-[100px]",
      cell: (inv) => fmtAmt(inv.discountAmount),
    },
    {
      key: "totalAmount",
      header: "Thành tiền",
      sortable: true,
      headerClassName: "text-right w-[120px]",
      className: "text-right font-semibold w-[120px]",
      cell: (inv) => fmtAmt(inv.totalAmount),
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
    ...(!detailInvoice || detailInvoice.status === "DRAFT"
      ? [
          {
            label: "Lưu nháp",
            variant: "secondary" as const,
            disabled: saving,
            onClick: () => handleSave("DRAFT"),
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
      onClick: () => handleSave("CONFIRMED"),
    },
  ];

  // ---------------------------------------------------------------------------
  // Drawer title
  // ---------------------------------------------------------------------------
  const displayItems = useMemo(() => {
    if (editMode) return form.items || [];
    if (!detailInvoice) return [];
    if (detailInvoice.items && detailInvoice.items.length > 0)
      return detailInvoice.items;
    return [
      {
        description: detailInvoice.description || "",
        preVatAmount: detailInvoice.preVatAmount,
        vatRate: detailInvoice.vatRate,
        vatAmount: detailInvoice.vatAmount,
        discountAmount: detailInvoice.discountAmount,
        totalAmount: detailInvoice.totalAmount,
      },
    ];
  }, [editMode, form.items, detailInvoice]);

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
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadInvoices()}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline-block">Tải lại</span>
            </Button>
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
                        label: "Chi tiết",
                        icon: <Eye className="w-4 h-4" />,
                        onClick: () => openDetail(inv),
                      },
                      ...(inv.status === "DRAFT"
                        ? [
                            {
                              label: "Xóa",
                              icon: <Trash className="w-4 h-4 text-red-600" />,
                              variant: "danger" as const,
                              onClick: () => {
                                setDetailInvoice(inv);
                                setDeleteConfirm(true);
                              },
                            },
                          ]
                        : []),
                      ...(inv.status === "CONFIRMED"
                        ? [
                            {
                              label: "Hủy",
                              icon: <Ban className="w-4 h-4 text-red-600" />,
                              variant: "danger" as const,
                              onClick: () => {
                                setDetailInvoice(inv);
                                setCancelConfirm(true);
                              },
                            },
                          ]
                        : []),
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
        headerExtra={
          !editMode && detailInvoice ? (
            <Button variant="secondary" size="sm" onClick={startEdit}>
              Chỉnh sửa
            </Button>
          ) : undefined
        }
        title={drawerTitle}
        panelClassName="min-[1024px]:w-[1400px]"
        actions={editMode ? editActions : viewActions}
      >
        <div className="flex flex-col gap-5">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
              {formError}
            </div>
          )}
          <div className="flex flex-col xl:flex-row gap-6 items-start w-full max-w-full">
            {/* Cột trái: Bảng Diễn giải (Tài chính) */}
            <div className="flex-1 min-w-0 w-full order-2 xl:order-1 space-y-4">
              <DrawerSection title="Chi tiết hóa đơn">
                <DocumentLineTable<InvoiceItem>
                  columns={[
                    {
                      key: "description",
                      header: "Diễn giải",
                      width: "300px",
                      cell: (row: InvoiceItem, index: number) =>
                        editMode ? (
                          <input
                            className={inputCls}
                            value={row.description || ""}
                            onChange={(e) => {
                              const newItems = [...(form.items || [])];
                              newItems[index] = {
                                ...newItems[index],
                                description: e.target.value,
                              };
                              setForm({ ...form, items: newItems });
                            }}
                          />
                        ) : (
                          <div className="min-w-[200px]">
                            {row.description || "—"}
                          </div>
                        ),
                    },
                    {
                      key: "preVatAmount",
                      header: "Trước VAT",
                      width: "120px",
                      align: "right",
                      cell: (row: InvoiceItem, index: number) =>
                        editMode ? (
                          <input
                            className={`${inputCls} text-right`}
                            type="number"
                            value={row.preVatAmount || ""}
                            onChange={(e) => {
                              const newItems = [...(form.items || [])];
                              newItems[index] = {
                                ...newItems[index],
                                preVatAmount: Number(e.target.value),
                              };

                              const preVatAmount = newItems.reduce(
                                (acc, curr) =>
                                  acc + Number(curr.preVatAmount || 0),
                                0,
                              );
                              setForm({
                                ...form,
                                items: newItems,
                                preVatAmount,
                              });
                            }}
                          />
                        ) : (
                          <div className="font-medium">
                            {fmtAmt(String(row.preVatAmount || 0))}
                          </div>
                        ),
                    },
                    {
                      key: "vatRate",
                      header: "Thuế suất",
                      width: "100px",
                      align: "right",
                      cell: (row: InvoiceItem, index: number) =>
                        editMode ? (
                          <input
                            className={`${inputCls} text-right`}
                            type="number"
                            step="0.01"
                            value={row.vatRate || ""}
                            onChange={(e) => {
                              const newItems = [...(form.items || [])];
                              newItems[index] = {
                                ...newItems[index],
                                vatRate: Number(e.target.value),
                              };
                              setForm({ ...form, items: newItems });
                            }}
                          />
                        ) : (
                          <div>
                            {row.vatRate != null
                              ? `${(Number(row.vatRate) * 100).toFixed(0)}%`
                              : "—"}
                          </div>
                        ),
                    },
                    {
                      key: "vatAmount",
                      header: "Tiền thuế VAT",
                      width: "120px",
                      align: "right",
                      cell: (row: InvoiceItem, index: number) =>
                        editMode ? (
                          <input
                            className={`${inputCls} text-right`}
                            type="number"
                            value={row.vatAmount || ""}
                            onChange={(e) => {
                              const newItems = [...(form.items || [])];
                              newItems[index] = {
                                ...newItems[index],
                                vatAmount: Number(e.target.value),
                              };
                              const vatAmount = newItems.reduce(
                                (acc, curr) =>
                                  acc + Number(curr.vatAmount || 0),
                                0,
                              );
                              setForm({ ...form, items: newItems, vatAmount });
                            }}
                          />
                        ) : (
                          <div>{fmtAmt(String(row.vatAmount || 0))}</div>
                        ),
                    },

                    {
                      key: "totalAmount",
                      header: "Thành tiền",
                      width: "120px",
                      align: "right",
                      cell: (row: InvoiceItem, index: number) =>
                        editMode ? (
                          <input
                            className={`${inputCls} text-right font-bold text-primary`}
                            type="number"
                            value={row.totalAmount || ""}
                            onChange={(e) => {
                              const newItems = [...(form.items || [])];
                              newItems[index] = {
                                ...newItems[index],
                                totalAmount: Number(e.target.value),
                              };
                              const totalAmount = newItems.reduce(
                                (acc, curr) =>
                                  acc + Number(curr.totalAmount || 0),
                                0,
                              );
                              setForm({
                                ...form,
                                items: newItems,
                                totalAmount,
                              });
                            }}
                          />
                        ) : (
                          <div className="font-bold text-primary">
                            {fmtAmt(String(row.totalAmount || 0))}
                          </div>
                        ),
                    },
                  ]}
                  data={displayItems}
                  getRowKey={(row: InvoiceItem, idx: number) =>
                    (row as InvoiceItem & { id?: string | number }).id || idx
                  }
                  viewOnly={!editMode}
                  onAddLine={() => {
                    setForm({
                      ...form,
                      items: [
                        ...(form.items || []),
                        {
                          description: "",
                          preVatAmount: 0,
                          vatRate: 0,
                          vatAmount: 0,
                          discountAmount: 0,
                          totalAmount: 0,
                        },
                      ],
                    });
                  }}
                  onRemoveLine={(index) => {
                    const newItems = [...(form.items || [])];
                    newItems.splice(index, 1);
                    const preVatAmount = newItems.reduce(
                      (acc, curr) => acc + Number(curr.preVatAmount || 0),
                      0,
                    );
                    const vatAmount = newItems.reduce(
                      (acc, curr) => acc + Number(curr.vatAmount || 0),
                      0,
                    );
                    const discountAmount = newItems.reduce(
                      (acc, curr) => acc + Number(curr.discountAmount || 0),
                      0,
                    );
                    const totalAmount = newItems.reduce(
                      (acc, curr) => acc + Number(curr.totalAmount || 0),
                      0,
                    );
                    setForm({
                      ...form,
                      items: newItems,
                      preVatAmount,
                      vatAmount,
                      discountAmount,
                      totalAmount,
                    });
                  }}
                  addLabel="Thêm dòng"
                />
              </DrawerSection>
            </div>

            {/* Cột phải: Thông tin & Các panel */}
            <div
              className={`shrink-0 order-1 xl:order-2 space-y-4 transition-all duration-300 xl:sticky xl:top-0 ${
                showGeneralInfo ? "w-full xl:w-[320px]" : "w-full xl:w-[52px]"
              }`}
            >
              {/* Thông tin chung */}
              <DrawerSection
                title={
                  <span
                    className={`transition-all duration-300 inline-block overflow-hidden whitespace-nowrap align-middle ${
                      showGeneralInfo
                        ? "max-w-[200px] opacity-100"
                        : "max-w-0 opacity-0"
                    }`}
                  >
                    Thông tin chung
                  </span>
                }
                titleExtra={
                  <button
                    type="button"
                    onClick={() => setShowGeneralInfo((s) => !s)}
                    className="p-1 -mr-1 rounded hover:bg-muted text-muted-foreground transition-colors"
                    title={showGeneralInfo ? "Thu gọn" : "Mở rộng"}
                  >
                    {showGeneralInfo ? (
                      <ChevronRight className="w-4 h-4" />
                    ) : (
                      <ChevronLeft className="w-4 h-4" />
                    )}
                  </button>
                }
              >
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    showGeneralInfo ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ gridTemplateRows: showGeneralInfo ? "1fr" : "0fr" }}
                >
                  <div
                    className="overflow-x-hidden overflow-y-auto w-full xl:max-h-[calc(100vh-190px)]"
                    style={{ scrollbarWidth: "none" }}
                  >
                    <div className="flex flex-col gap-3 pt-1 min-w-[280px]">
                      {/* Ngày hóa đơn -> Ký hiệu -> Số hóa đơn */}
                      <DrawerField label="Ngày hóa đơn" required={editMode}>
                        {editMode ? (
                          <DatePicker
                            className={inputCls}
                            value={form.invoiceDate?.slice(0, 10) || ""}
                            onChange={(v) => fieldSet("invoiceDate", v)}
                          />
                        ) : (
                          <div>{detailInvoice?.invoiceDate}</div>
                        )}
                      </DrawerField>

                      <DrawerField label="Ký hiệu">
                        {editMode ? (
                          <input
                            className={inputCls}
                            value={form.serialNo || ""}
                            placeholder="1C25TAA"
                            onChange={(e) =>
                              fieldSet("serialNo", e.target.value || undefined)
                            }
                          />
                        ) : (
                          <div>{detailInvoice?.serialNo || "—"}</div>
                        )}
                      </DrawerField>

                      <DrawerField label="Số hóa đơn" required={editMode}>
                        {editMode ? (
                          <input
                            className={inputCls}
                            value={form.invoiceNo}
                            placeholder="HD-001"
                            onChange={(e) =>
                              fieldSet("invoiceNo", e.target.value)
                            }
                          />
                        ) : (
                          <div className="font-semibold">
                            {detailInvoice?.invoiceNo}
                          </div>
                        )}
                      </DrawerField>

                      {editMode ? (
                        <DrawerField label="Loại hóa đơn">
                          <Combobox
                            options={[
                              { value: "IN", label: "Đầu vào (Mua)" },
                              { value: "OUT", label: "Đầu ra (Bán)" },
                            ]}
                            value={form.direction}
                            onChange={(v) =>
                              fieldSet("direction", v as Direction)
                            }
                            allowClear={false}
                          />
                        </DrawerField>
                      ) : null}
                    </div>
                  </div>
                </div>
              </DrawerSection>

              {/* Bên bán */}
              {showGeneralInfo && (
                <DrawerSection title="Bên bán">
                  <div className="flex flex-col gap-3 text-sm">
                    <DrawerField label="Tên" required={editMode}>
                      {editMode ? (
                        <input
                          className={inputCls}
                          value={form.sellerName || ""}
                          placeholder="Công ty A..."
                          onChange={(e) =>
                            fieldSet("sellerName", e.target.value)
                          }
                        />
                      ) : (
                        <div className="font-medium text-foreground">
                          {detailInvoice?.sellerName || "—"}
                        </div>
                      )}
                    </DrawerField>
                    <DrawerField label="MST">
                      {editMode ? (
                        <input
                          className={inputCls}
                          value={form.sellerTaxCode || ""}
                          placeholder="0101234567"
                          onChange={(e) =>
                            fieldSet("sellerTaxCode", e.target.value)
                          }
                        />
                      ) : (
                        <div>{detailInvoice?.sellerTaxCode || "—"}</div>
                      )}
                    </DrawerField>
                    <DrawerField label="Địa chỉ">
                      {editMode ? (
                        <input
                          className={inputCls}
                          value={form.sellerAddress || ""}
                          placeholder="Số 1, Đường 2..."
                          onChange={(e) =>
                            fieldSet("sellerAddress", e.target.value)
                          }
                        />
                      ) : (
                        <div>{detailInvoice?.sellerAddress || "—"}</div>
                      )}
                    </DrawerField>
                  </div>
                </DrawerSection>
              )}

              {/* Bên mua */}
              {showGeneralInfo && (
                <DrawerSection title="Bên mua">
                  <div className="flex flex-col gap-3 text-sm">
                    <DrawerField label="Tên" required={editMode}>
                      {editMode ? (
                        <input
                          className={inputCls}
                          value={form.buyerName || ""}
                          placeholder="Công ty B..."
                          onChange={(e) =>
                            fieldSet("buyerName", e.target.value)
                          }
                        />
                      ) : (
                        <div className="font-medium text-foreground">
                          {detailInvoice?.buyerName || "—"}
                        </div>
                      )}
                    </DrawerField>
                    <DrawerField label="MST">
                      {editMode ? (
                        <input
                          className={inputCls}
                          value={form.buyerTaxCode || ""}
                          placeholder="0101234567"
                          onChange={(e) =>
                            fieldSet("buyerTaxCode", e.target.value)
                          }
                        />
                      ) : (
                        <div>{detailInvoice?.buyerTaxCode || "—"}</div>
                      )}
                    </DrawerField>
                    <DrawerField label="Địa chỉ">
                      {editMode ? (
                        <input
                          className={inputCls}
                          value={form.buyerAddress || ""}
                          placeholder="Số 1, Đường 2..."
                          onChange={(e) =>
                            fieldSet("buyerAddress", e.target.value)
                          }
                        />
                      ) : (
                        <div>{detailInvoice?.buyerAddress || "—"}</div>
                      )}
                    </DrawerField>
                  </div>
                </DrawerSection>
              )}

              {/* Section: Liên kết & Ghi chú */}
              {showGeneralInfo &&
              !editMode &&
              (detailInvoice?.purchaseOrderId ||
                detailInvoice?.salesOrderId ||
                detailInvoice?.notes) ? (
                <DrawerSection title="Liên kết & Ghi chú">
                  <div className="flex flex-col gap-2 text-sm">
                    {detailInvoice?.purchaseOrderId && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">
                          Chứng từ mua hàng
                        </div>
                        <button
                          className="flex items-center gap-1.5 text-primary hover:underline font-medium"
                          onClick={() =>
                            window.open("/operational/purchasing", "_blank")
                          }
                        >
                          Xem đơn mua hàng{" "}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {detailInvoice?.salesOrderId && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">
                          Chứng từ bán hàng
                        </div>
                        <button
                          className="flex items-center gap-1.5 text-primary hover:underline font-medium"
                          onClick={() =>
                            window.open("/operational/sales", "_blank")
                          }
                        >
                          Xem đơn bán hàng{" "}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {detailInvoice?.notes && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">
                          Ghi chú
                        </div>
                        <div className="whitespace-pre-wrap">
                          {detailInvoice?.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </DrawerSection>
              ) : null}

              {/* Edit Mode: Ghi chú & Liên kết */}
              {showGeneralInfo && editMode ? (
                <DrawerSection title="Ghi chú & Liên kết">
                  <div className="flex flex-col gap-3">
                    <DrawerField label="Ghi chú">
                      <textarea
                        className={`${inputCls} min-h-[80px]`}
                        value={form.notes || ""}
                        onChange={(e) => fieldSet("notes", e.target.value)}
                      />
                    </DrawerField>
                    <DrawerField label="Chứng từ mua hàng">
                      <input
                        className={inputCls}
                        value={form.purchaseOrderId || ""}
                        placeholder="ID hoặc mã PO..."
                        onChange={(e) =>
                          fieldSet(
                            "purchaseOrderId",
                            e.target.value || undefined,
                          )
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Chứng từ bán hàng">
                      <input
                        className={inputCls}
                        value={form.salesOrderId || ""}
                        placeholder="ID hoặc mã SO..."
                        onChange={(e) =>
                          fieldSet("salesOrderId", e.target.value || undefined)
                        }
                      />
                    </DrawerField>
                  </div>
                </DrawerSection>
              ) : null}

              {/* Section: File hóa đơn */}
              {showGeneralInfo &&
                !editMode &&
                (detailInvoice?.xmlFileKey || detailInvoice?.pdfFileKey) && (
                  <DrawerSection title="File hóa đơn">
                    <div className="flex flex-wrap gap-2">
                      {detailInvoice?.xmlFileKey && (
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
                      {detailInvoice?.pdfFileKey && (
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
            </div>
          </div>
        </div>
      </DrawerModal>

      {/* XML Upload Modal */}
      <InvoiceXmlUploadModal
        open={xmlModalOpen}
        onClose={() => setXmlModalOpen(false)}
        onImported={() => {
          void loadInvoices();
        }}
      />

      <ConfirmModal
        open={deleteConfirm}
        title="Xác nhận xóa hóa đơn"
        message={`Xóa hóa đơn "${detailInvoice?.invoiceNo}"? Hành động không thể hoàn tác.`}
        confirmLabel="Xóa hóa đơn"
        onCancel={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={saving}
      />

      <ConfirmModal
        open={cancelConfirm}
        title="Xác nhận hủy hóa đơn"
        message={`Bạn có chắc muốn hủy hóa đơn "${detailInvoice?.invoiceNo}"?`}
        confirmLabel="Hủy hóa đơn"
        onCancel={() => setCancelConfirm(false)}
        onConfirm={handleCancel}
        loading={saving}
      />
    </div>
  );
}
