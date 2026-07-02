import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import {
  PlusCircle,
  Receipt,
  DownloadCloud,
  Eye,
  Download,
  RefreshCw,
  Trash,
  Ban,
  FileCode,
  FileText,
} from "lucide-react";
import { money } from "@/shared/utils/format";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { getTags } from "@/modules/tags/api/tagsApi";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import { useUIStore } from "@/core/config/uiStore";
import { type DataTableColumn } from "@/shared/components/DataTable";

import { useErpInvoicesList } from "@/modules/erp-invoices-core/hooks/useErpInvoicesList";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import { useInvoiceSyncProgress } from "@/modules/erp-invoices-core/hooks/useInvoiceSyncProgress";
import {
  erpInvoicesCoreApi,
  type ErpInvoice,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

import { ErpInvoiceDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceDrawer";
import { ErpInvoiceFormGeneral } from "@/modules/erp-invoices-core/components/ErpInvoiceFormGeneral";
import { ErpInvoiceFormItems } from "@/modules/erp-invoices-core/components/ErpInvoiceFormItems";
import { InvoiceImportSyncDrawer } from "@/modules/erp-invoices-core/components/InvoiceImportSyncDrawer";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import { ErpInvoiceInternalInfo } from "@/modules/erp-invoices-core/components/ErpInvoiceInternalInfo";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import type { FilterPanelConfig } from "@/shared/hooks/useFilterPanel";

interface ErpInvoicesTabProps {
  direction: "IN" | "OUT";
}

export function ErpInvoicesTab({ direction }: ErpInvoicesTabProps) {
  const { t } = useTranslation("erpInvoices");
  const listHook = useErpInvoicesList(direction);
  const formHook = useErpInvoiceForm(listHook.loadInvoices);
  const showToast = useUIStore((s) => s.showToast);

  // Hook theo dõi tiến trình nền SSE, tự động refresh bảng khi hoàn thành
  useInvoiceSyncProgress(listHook.loadInvoices);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [detailTransactionId, setDetailTransactionId] = useState<string | null>(
    null,
  );

  const { data: allTags = [] } = useQuery({
    queryKey: ["sys-tags"],
    queryFn: getTags,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches-options"],
    queryFn: getBranchOptionsApi,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get("viewId");
    if (viewId) {
      formHook.openDetail({ id: viewId } as ErpInvoice);
      params.delete("viewId");
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState(null, "", newUrl);
    }

    const handleOpenDoc = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.type === "erp_invoice" && detail.id) {
        formHook.openDetail({ id: detail.id } as ErpInvoice);
      } else if (detail && detail.type === "bank_transaction" && detail.id) {
        setDetailTransactionId(detail.id);
      }
    };
    window.addEventListener("open_erp_document", handleOpenDoc);
    return () => window.removeEventListener("open_erp_document", handleOpenDoc);
  }, [formHook]);

  async function handleDownload(id: string, type: "pdf" | "xml") {
    try {
      showToast({
        title: `Đang tải file ${type.toUpperCase()}...`,
        variant: "default",
      });
      const { url } = await erpInvoicesCoreApi.getDownloadUrl(id, type);
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.download = "";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch {
      showToast({
        title: `Không thể tải ${type.toUpperCase()}`,
        variant: "destructive",
      });
    }
  }

  async function handleExportExcel() {
    try {
      showToast({
        title: "Đang tạo file Excel...",
        variant: "default",
      });
      const { search, dateFrom, dateTo, status, custom } =
        listHook.filterPanel.state;
      const blob = await erpInvoicesCoreApi.exportExcel({
        direction,
        search: search || undefined,
        seller_name: custom?.seller_name || undefined,
        buyer_name: custom?.buyer_name || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        status: status || undefined,
        tag_id: (custom?.tag_id as string) || undefined,
        sort_by: listHook.sortBy || undefined,
        sort_order: listHook.sortOrder || undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DanhSachHoaDon_${direction}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast({
        title: "Xuất Excel thành công",
        variant: "default",
      });
    } catch {
      showToast({
        title: "Không thể xuất Excel",
        variant: "destructive",
      });
    }
  }

  const handleReparseXml = async (inv: ErpInvoice) => {
    try {
      const token = localStorage.getItem("erp_portal_token") || "";
      showToast({ title: "Đang tải dữ liệu XML...", variant: "default" });
      await erpInvoicesCoreApi.reparseXml(inv.id, token);
      showToast({ title: "Đồng bộ chi tiết thành công", variant: "default" });
      void listHook.loadInvoices();
    } catch (e: unknown) {
      showToast({
        title:
          (e as { response?: { data?: { message?: string } } }).response?.data
            ?.message || "Đồng bộ thất bại",
        variant: "destructive",
      });
    }
  };

  function fmtAmt(val: string | null | undefined) {
    if (val == null) return "—";
    const n = Number(val);
    return isNaN(n) ? "—" : money(n);
  }

  const setCustom = listHook.filterPanel.setCustom;
  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: true,
      period: true,
      noDefaultPeriod: true,
      status: {
        options: listHook.STATUS_OPTIONS,
        placeholder: t("filters", "Tất cả trạng thái"),
      },
      custom: [
        {
          key: "seller_name",
          label: t("seller", "Nhà cung cấp / Bên bán"),
          placeholder: t("searchSeller", "Tìm tên nhà cung cấp..."),
          options: [],
          type: "combobox" as const,
          onSearch: (v: string) => setCustom("seller_name", v),
        },
        {
          key: "buyer_name",
          label: t("buyer", "Bên mua"),
          placeholder: t("searchBuyer", "Tìm tên người mua..."),
          options: [],
          type: "combobox" as const,
          onSearch: (v: string) => setCustom("buyer_name", v),
        },
        {
          key: "tag_id",
          label: t("tag", "Thẻ nhãn"),
          placeholder: t("allTags", "Tất cả thẻ"),
          options: allTags.map((tag) => ({ value: tag.id, label: tag.name })),
          type: "combobox" as const,
        },
      ],
    }),
    [t, listHook.STATUS_OPTIONS, setCustom, allTags],
  );

  const columns: DataTableColumn<ErpInvoice>[] = useMemo(
    () => [
      {
        key: "attachments",
        header: t("attachments", "Chứng từ"),
        size: 80,
        headerClassName: "text-center",
        className: "text-center",
        cell: (inv) => (
          <div className="flex items-center justify-center gap-1.5">
            {inv.xmlFileKey ? (
              <Tooltip content={t("hasXml", "Đã có file XML/ZIP")}>
                <FileCode className="w-4 h-4 text-blue-500" />
              </Tooltip>
            ) : (
              <Tooltip content={t("noXml", "Chưa có file XML/ZIP")}>
                <FileCode className="w-4 h-4 text-gray-300" />
              </Tooltip>
            )}
            {inv.pdfFileKey ? (
              <Tooltip content={t("hasPdf", "Đã có file PDF")}>
                <FileText className="w-4 h-4 text-red-500" />
              </Tooltip>
            ) : (
              <Tooltip content={t("noPdf", "Chưa có file PDF")}>
                <FileText className="w-4 h-4 text-gray-300" />
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        key: "invoiceDate",
        header: t("invoiceDate", "Ngày HĐ"),
        sortable: true,
        sortKey: "invoiceDate",
        size: 100,
        headerClassName: "text-center",
        className: "text-right",
        cell: (inv) => inv.invoiceDate,
      },
      {
        key: "serialNo",
        header: t("serialNo", "Ký hiệu"),
        size: 80,
        headerClassName: "text-center",
        className: "text-muted-foreground text-left",
        cell: (inv) => inv.serialNo || "—",
      },
      {
        key: "invoiceNo",
        header: t("invoiceNo", "Số HĐ"),
        sortable: true,
        sortKey: "invoiceNo",
        size: 80,
        headerClassName: "text-center",
        className: "font-medium text-primary text-left",
        cell: (inv) => (
          <div className="flex flex-col gap-1">
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
                  {inv.status === "CANCELLED"
                    ? t("statusCancelled", "Đã hủy")
                    : t("statusDraft", "Nháp")}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "partner",
        header:
          direction === "IN" ? t("seller", "Bên bán") : t("buyer", "Bên mua"),
        sortable: true,
        sortKey: direction === "IN" ? "sellerName" : "buyerName",
        size: 250,
        headerClassName: "text-center",
        className: "text-left",
        cell: (inv) => {
          const text =
            direction === "IN" ? inv.sellerName || "—" : inv.buyerName || "—";
          return (
            <Tooltip content={text !== "—" ? text : ""}>
              <div className="whitespace-normal break-words w-full cursor-pointer">
                {text}
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: "taxCode",
        header: t("taxCode", "MST"),
        size: 120,
        headerClassName: "text-center",
        className: "text-muted-foreground text-xs text-left",
        cell: (inv) =>
          direction === "IN"
            ? inv.sellerTaxCode || "—"
            : inv.buyerTaxCode || "—",
      },
      {
        key: "description",
        header: t("description", "Diễn giải"),
        sortable: true,
        sortKey: "description",
        size: 300,
        className: "text-left",
        headerClassName: "text-center",
        cell: (row) => (
          <div
            className="whitespace-normal break-words w-full"
            title={row.description || ""}
          >
            {row.description || "—"}
          </div>
        ),
      },
      {
        key: "preVatAmount",
        header: t("preVatAmount", "Trước VAT"),
        sortable: true,
        sortKey: "preVatAmount",
        size: 120,
        headerClassName: "text-center",
        className: "text-right",
        cell: (row) => fmtAmt(row.preVatAmount),
      },
      {
        key: "vatAmount",
        header: t("vatAmount", "Thuế VAT"),
        size: 120,
        headerClassName: "text-center",
        className: "text-right",
        cell: (inv) => fmtAmt(inv.vatAmount),
      },
      {
        key: "discountAmount",
        header: t("discountAmount", "Chiết khấu"),
        size: 120,
        headerClassName: "text-center",
        className: "text-right",
        cell: (inv) => fmtAmt(inv.discountAmount),
      },
      {
        key: "totalAmount",
        header: t("totalAmount", "Thành tiền"),
        sortable: true,
        sortKey: "totalAmount",
        size: 120,
        headerClassName: "text-center",
        className: "text-right font-semibold",
        cell: (inv) => fmtAmt(inv.totalAmount),
      },
      ...(direction === "OUT"
        ? [
            {
              key: "settlementOrder",
              header: t("settlementOrder", "Lệnh quyết toán"),
              headerClassName: "text-center w-[150px]",
              className: "text-left w-[150px]",
              cell: (inv: ErpInvoice) => inv.settlementOrder || "—",
            },
            {
              key: "licensePlate",
              header: t("licensePlate", "Biển số xe"),
              headerClassName: "text-center w-[110px]",
              className: "text-left w-[110px]",
              cell: (inv: ErpInvoice) => inv.licensePlate || "—",
            },
          ]
        : []),
      {
        key: "netOffAmount",
        header: t("invoice.columns.netOffAmount", "Đã cấn trừ"),
        size: 120,
        headerClassName: "text-center bg-blue-50/50 border-l border-blue-200",
        className: "text-right bg-blue-50/50 border-l border-blue-200",
        cell: (inv: any) => {
          const netOff = parseFloat(inv.netOffAmount) || 0;
          if (netOff === 0) return "--";
          return (
            <span className="text-blue-600">{fmtAmt(inv.netOffAmount)}</span>
          );
        },
      },
      {
        key: "remainingAmount",
        header: t("invoice.columns.remainingAmount", "Còn lại"),
        size: 120,
        headerClassName: "text-center bg-blue-50/50",
        className: "text-right font-semibold bg-blue-50/50",
        cell: (inv: any) => {
          const total = parseFloat(inv.totalAmount) || 0;
          const netOff = parseFloat(inv.netOffAmount) || 0;
          const remaining = total - netOff;
          if (remaining === 0)
            return <span className="text-emerald-600">0</span>;
          return (
            <span className="text-orange-600">
              {fmtAmt(remaining.toString())}
            </span>
          );
        },
      },
      {
        key: "branchId",
        header: t("branch", "Chi nhánh"),
        size: 100,
        headerClassName: "text-center",
        className: "text-center",
        cell: (inv: any) => {
          if (!inv.branchId) return "—";
          const branch = branches.find((b) => b.value === inv.branchId);
          return branch ? branch.label : inv.branchId;
        },
      },
    ],
    [direction, t, branches],
  );

  const activeSortKey = listHook.sortBy;
  const activeSortOrder = listHook.sortOrder;

  const summaryRow = useMemo(() => {
    if (!listHook.invoices || listHook.invoices.length === 0) return undefined;

    const totalPreVatAmount = listHook.invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.preVatAmount) || 0),
      0,
    );
    const totalVatAmount = listHook.invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.vatAmount) || 0),
      0,
    );
    const totalDiscountAmount = listHook.invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.discountAmount) || 0),
      0,
    );
    const totalTotalAmount = listHook.invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.totalAmount) || 0),
      0,
    );
    const totalNetOff = listHook.invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.netOffAmount) || 0),
      0,
    );
    const totalRemaining = listHook.invoices.reduce(
      (acc: number, curr: any) =>
        acc +
        ((parseFloat(curr.totalAmount) || 0) -
          (parseFloat(curr.netOffAmount) || 0)),
      0,
    );

    return {
      preVatAmount:
        totalPreVatAmount === 0 ? (
          "--"
        ) : (
          <span className="font-medium">
            {fmtAmt(totalPreVatAmount.toString())}
          </span>
        ),
      vatAmount:
        totalVatAmount === 0 ? (
          "--"
        ) : (
          <span className="font-medium">
            {fmtAmt(totalVatAmount.toString())}
          </span>
        ),
      discountAmount:
        totalDiscountAmount === 0 ? (
          "--"
        ) : (
          <span className="font-medium">
            {fmtAmt(totalDiscountAmount.toString())}
          </span>
        ),
      totalAmount:
        totalTotalAmount === 0 ? (
          "--"
        ) : (
          <span className="font-semibold">
            {fmtAmt(totalTotalAmount.toString())}
          </span>
        ),
      netOffAmount:
        totalNetOff === 0 ? (
          "--"
        ) : (
          <span className="text-blue-600 font-medium">
            {fmtAmt(totalNetOff.toString())}
          </span>
        ),
      remainingAmount:
        totalRemaining === 0 ? (
          <span className="text-emerald-600 font-medium">0</span>
        ) : (
          <span className="text-orange-600 font-medium">
            {fmtAmt(totalRemaining.toString())}
          </span>
        ),
    };
  }, [listHook.invoices]);

  return (
    <>
      <SpreadsheetPageTemplate
        title={
          direction === "IN"
            ? t("inbound", "Hóa đơn mua vào")
            : t("outbound", "Hóa đơn bán ra")
        }
        desc={t("invoiceDesc", "Quản lý danh sách hóa đơn điện tử")}
        icon={<Receipt className="h-5 w-5" />}
        tableId={`erp-invoices-table-${direction}`}
        items={listHook.invoices}
        columns={columns}
        getRowKey={(r) => r.id}
        summaryRow={summaryRow}
        loading={listHook.loading}
        emptyLabel={t("emptyData", "Chưa có hóa đơn nào.")}
        minWidth={1200}
        sortArray={
          activeSortKey
            ? [activeSortOrder === "desc" ? `-${activeSortKey}` : activeSortKey]
            : undefined
        }
        onSort={listHook.handleSort}
        page={listHook.page}
        pageSize={listHook.pageSize}
        total={listHook.total}
        totalPages={listHook.totalPages}
        onPage={listHook.setPage}
        onPageSize={listHook.setPageSize}
        onRefresh={() => void listHook.loadInvoices()}
        filterConfig={filterConfig}
        filter={listHook.filterPanel}
        rowActions={(inv) => {
          const items = [];
          items.push({
            label: t("actionDetail", "Chi tiết"),
            icon: <Eye className="w-3.5 h-3.5" />,
            onClick: () => formHook.openDetail(inv),
          });
          if (inv.xmlFileKey) {
            items.push({
              label: t("actionDownloadXml", "Tải XML"),
              icon: <Download className="w-3.5 h-3.5" />,
              onClick: () => handleDownload(inv.id, "xml"),
            });
          }
          items.push({
            label: t("actionReparseXml", "Đồng bộ lại từ XML"),
            icon: <RefreshCw className="w-3.5 h-3.5" />,
            onClick: () => handleReparseXml(inv),
          });
          if (inv.pdfFileKey) {
            items.push({
              label: t("actionDownloadPdf", "Tải PDF"),
              icon: <Download className="w-3.5 h-3.5" />,
              onClick: () => handleDownload(inv.id, "pdf"),
            });
          }
          if (inv.status === "DRAFT") {
            items.push({
              label: t("actionDelete", "Xóa"),
              icon: <Trash className="w-3.5 h-3.5" />,
              variant: "danger" as const,
              onClick: () => {
                formHook.openDetail(inv);
                formHook.setDeleteConfirm(true);
              },
            });
          }
          if (inv.status === "CONFIRMED") {
            items.push({
              label: t("actionCancel", "Hủy"),
              icon: <Ban className="w-3.5 h-3.5" />,
              variant: "danger" as const,
              onClick: () => {
                formHook.openDetail(inv);
                formHook.setCancelConfirm(true);
              },
            });
          }
          return items;
        }}
        createActions={[
          {
            label: t("createInvoice", "Tạo hóa đơn"),
            icon: <PlusCircle className="h-4 w-4 text-emerald-600" />,
            onClick: () => formHook.openNew(direction),
          },
          {
            label: t("syncInvoices", "Đồng bộ hóa đơn"),
            icon: <DownloadCloud className="w-4 h-4 text-indigo-600" />,
            onClick: () => setImportModalOpen(true),
          },
          {
            label: t("bulkDownloadXml", "Tải lại XML hàng loạt"),
            icon: <RefreshCw className="w-4 h-4 text-orange-600" />,
            onClick: async () => {
              const token = localStorage.getItem("erp_portal_token");
              if (!token) {
                toast.error(
                  "Vui lòng cấu hình token Cổng thuế trong chức năng Đồng bộ từ GDT trước.",
                );
                return;
              }
              try {
                const res = await erpInvoicesCoreApi.bulkDownloadXml({
                  token,
                  direction,
                });
                toast.success(res.message);
                // Optionally reload after some time or let user refresh manually
              } catch (e: any) {
                toast.error(
                  e.response?.data?.message || e.message || "Lỗi tải lại XML",
                );
              }
            },
          },
          {
            label: t("exportExcel", "Xuất Excel"),
            icon: <Download className="w-4 h-4 text-green-600" />,
            onClick: handleExportExcel,
          },
        ]}
      />

      <ErpInvoiceDrawer
        open={formHook.drawerOpen}
        onClose={formHook.closeDrawer}
        editMode={formHook.editMode}
        detailInvoice={formHook.detailInvoice}
        startEdit={formHook.startEdit}
        saving={formHook.saving}
        handleSave={formHook.handleSave}
        setEditMode={formHook.setEditMode}
        setDeleteConfirm={formHook.setDeleteConfirm}
        onDownload={handleDownload}
        loadingDetail={formHook.loadingDetail}
        onSyncDetail={formHook.handleSyncDetail}
        leftPanel={
          <div className="flex flex-col gap-5">
            {formHook.formError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
                {formHook.formError}
              </div>
            )}
            <ErpInvoiceInternalInfo
              form={formHook.form}
              editMode={formHook.editMode}
              fieldSet={(key, value) =>
                formHook.setForm((prev) => ({ ...prev, [key]: value }))
              }
              invoiceId={formHook.detailInvoice?.id ?? null}
              pendingTagIds={formHook.pendingTagIds}
              onPendingTagsChange={formHook.setPendingTagIds}
              direction={direction}
              detailInvoice={formHook.detailInvoice}
              onRefreshDetail={() =>
                formHook.openDetail({
                  id: formHook.detailInvoice!.id,
                } as ErpInvoice)
              }
            />
            <ErpInvoiceFormItems
              form={formHook.form}
              editMode={formHook.editMode}
              setForm={formHook.setForm}
              fmtAmt={fmtAmt}
            />
          </div>
        }
        rightPanel={
          <div className="flex flex-col gap-5">
            <ErpInvoiceFormGeneral
              form={formHook.form}
              editMode={formHook.editMode}
              fieldSet={(key, value) =>
                formHook.setForm((prev) => ({ ...prev, [key]: value }))
              }
              fmtAmt={fmtAmt}
              invoiceId={formHook.detailInvoice?.id ?? null}
              pendingTagIds={formHook.pendingTagIds}
              onPendingTagsChange={formHook.setPendingTagIds}
            />
          </div>
        }
      />

      <ConfirmModal
        open={formHook.deleteConfirm}
        onCancel={() => formHook.setDeleteConfirm(false)}
        title="Xóa hóa đơn"
        message={`Bạn có chắc muốn xóa hóa đơn ${formHook.detailInvoice?.invoiceNo}? Thao tác này không thể hoàn tác.`}
        confirmLabel="Xóa"
        danger
        loading={formHook.saving}
        onConfirm={formHook.handleDelete}
      />

      <ConfirmModal
        open={formHook.cancelConfirm}
        onCancel={() => formHook.setCancelConfirm(false)}
        title="Hủy hóa đơn"
        message={`Bạn có chắc muốn hủy hóa đơn ${formHook.detailInvoice?.invoiceNo}?`}
        confirmLabel="Đồng ý hủy"
        danger
        loading={formHook.saving}
        onConfirm={formHook.handleCancel}
      />

      <InvoiceImportSyncDrawer
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        initialDirection={direction}
        onImported={(dir: "IN" | "OUT") => {
          if (dir === direction) {
            void listHook.loadInvoices();
          }
        }}
      />

      <BankTransactionDetailDrawer
        isOpen={!!detailTransactionId}
        onClose={() => setDetailTransactionId(null)}
        transactionId={detailTransactionId}
      />
    </>
  );
}
