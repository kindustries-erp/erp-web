import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  PlusCircle,
  Receipt,
  FileUp,
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
import { useUIStore } from "@/core/config/uiStore";
import { type DataTableColumn } from "@/shared/components/DataTable";

import { useErpInvoicesList } from "@/modules/erp-invoices-core/hooks/useErpInvoicesList";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import {
  erpInvoicesCoreApi,
  type ErpInvoice,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

import { ErpInvoiceDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceDrawer";
import { ErpInvoiceFormGeneral } from "@/modules/erp-invoices-core/components/ErpInvoiceFormGeneral";
import { ErpInvoiceFormItems } from "@/modules/erp-invoices-core/components/ErpInvoiceFormItems";
import { InvoiceXmlUploadDrawer } from "@/modules/erp-invoices-core/components/InvoiceXmlUploadDrawer";
import { PortalSyncDrawer } from "@/modules/erp-invoices-core/components/PortalSyncDrawer";
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

  const [xmlModalOpen, setXmlModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);

  const { data: allTags = [] } = useQuery({
    queryKey: ["sys-tags"],
    queryFn: getTags,
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
        key: "invoiceDate",
        header: t("invoiceDate", "Ngày HĐ"),
        sortable: true,
        sortKey: "invoiceDate",
        headerClassName: "text-center w-[100px]",
        className: "text-right w-[100px]",
        cell: (inv) => inv.invoiceDate,
      },
      {
        key: "serialNo",
        header: t("serialNo", "Ký hiệu"),
        headerClassName: "text-center w-[100px]",
        className: "text-muted-foreground w-[100px] text-left",
        cell: (inv) => inv.serialNo || "—",
      },
      {
        key: "invoiceNo",
        header: t("invoiceNo", "Số HĐ"),
        sortable: true,
        sortKey: "invoiceNo",
        headerClassName: "text-center w-[130px]",
        className: "font-medium text-primary w-[130px] text-left",
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
            <div className="flex items-center gap-1.5">
              {inv.xmlFileKey ? (
                <Tooltip content={t("hasXml", "Đã có file XML/ZIP")}>
                  <FileCode className="w-3.5 h-3.5 text-blue-500" />
                </Tooltip>
              ) : (
                <Tooltip content={t("noXml", "Chưa có file XML/ZIP")}>
                  <FileCode className="w-3.5 h-3.5 text-gray-300" />
                </Tooltip>
              )}
              {inv.pdfFileKey ? (
                <Tooltip content={t("hasPdf", "Đã có file PDF")}>
                  <FileText className="w-3.5 h-3.5 text-red-500" />
                </Tooltip>
              ) : (
                <Tooltip content={t("noPdf", "Chưa có file PDF")}>
                  <FileText className="w-3.5 h-3.5 text-gray-300" />
                </Tooltip>
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
        headerClassName: "text-center w-[320px]",
        className: "w-[320px] text-left",
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
        header: t("taxCode", "MST"),
        headerClassName: "text-center w-[110px]",
        className: "text-muted-foreground text-xs w-[110px] text-left",
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
        className: "text-left",
        headerClassName: "text-center",
        cell: (row) => (
          <div className="max-w-[200px] truncate" title={row.description || ""}>
            {row.description || "—"}
          </div>
        ),
      },
      {
        key: "preVatAmount",
        header: t("preVatAmount", "Trước VAT"),
        sortable: true,
        sortKey: "preVatAmount",
        headerClassName: "text-center w-[110px]",
        className: "text-right w-[110px]",
        cell: (row) => fmtAmt(row.preVatAmount),
      },
      {
        key: "vatAmount",
        header: t("vatAmount", "Thuế VAT"),
        headerClassName: "text-center w-[100px]",
        className: "text-right w-[100px]",
        cell: (inv) => fmtAmt(inv.vatAmount),
      },
      {
        key: "discountAmount",
        header: t("discountAmount", "Chiết khấu"),
        headerClassName: "text-center w-[100px]",
        className: "text-right w-[100px]",
        cell: (inv) => fmtAmt(inv.discountAmount),
      },
      {
        key: "totalAmount",
        header: t("totalAmount", "Thành tiền"),
        sortable: true,
        sortKey: "totalAmount",
        headerClassName: "text-center w-[120px]",
        className: "text-right font-semibold w-[120px]",
        cell: (inv) => fmtAmt(inv.totalAmount),
      },
    ],
    [direction, t],
  );

  const activeSortKey = listHook.sortBy;
  const activeSortOrder = listHook.sortOrder;

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
            label: t("importXml", "Import XML"),
            icon: <FileUp className="w-4 h-4 text-blue-600" />,
            onClick: () => setXmlModalOpen(true),
          },
          {
            label: t("syncGdt", "Đồng bộ từ GDT"),
            icon: <DownloadCloud className="w-4 h-4 text-indigo-600" />,
            onClick: () => setSyncModalOpen(true),
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
      >
        <div className="flex flex-col gap-5">
          {formHook.formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
              {formHook.formError}
            </div>
          )}
          <div className="flex flex-col xl:flex-row gap-6 items-start w-full max-w-full">
            <ErpInvoiceFormItems
              form={formHook.form}
              editMode={formHook.editMode}
              setForm={formHook.setForm}
              fmtAmt={fmtAmt}
            />
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
        </div>
      </ErpInvoiceDrawer>

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

      <InvoiceXmlUploadDrawer
        open={xmlModalOpen}
        onClose={() => setXmlModalOpen(false)}
        onImported={(id: string, dir: "IN" | "OUT") => {
          if (dir === direction) {
            void listHook.loadInvoices();
          }
        }}
      />

      <PortalSyncDrawer
        open={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        initialDirection={direction}
        onSynced={(dir: "IN" | "OUT") => {
          if (dir === direction) {
            void listHook.loadInvoices();
          }
        }}
      />
    </>
  );
}
