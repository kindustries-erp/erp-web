import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  RefreshCw,
  Send,
  Settings,
  Trash2,
  FileCode,
  Download,
} from "lucide-react";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { KpiCard } from "@/shared/components/KpiCard";
import { SearchInput } from "@/shared/components/SearchInput";
import { DatePicker } from "@/shared/components/DatePicker";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import { PageLayout } from "@/shared/components/PageLayout";
import {
  getConfigApi,
  getSinvoiceHealthApi,
  getTaxPortalConfigApi,
  listLocalDraftEinvoicesApi,
  listLocalEinvoicesApi,
  listLocalIssuedEinvoicesApi,
  syncSinvoiceDraftApi,
  syncSinvoiceIssuedApi,
  syncTaxPortalApi,
  type Einvoice,
  type SinvoiceConfig,
  type TaxPortalConfig,
} from "@/modules/accounting/api/sinvoiceApi";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { SinvoiceDraftModal } from "@/modules/accounting/components/SinvoiceDraftModal";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { useDebounce } from "@/shared/hooks/useDebounce";

type TaxTabKey =
  | "hoa-don-nhap"
  | "hoa-don-da-phat-hanh"
  | "hoa-don-ban-ra"
  | "hoa-don-mua-vao"
  | "cau-hinh";

const TAX_PORTAL_PAGE_SIZE_OPTIONS = [50, 100, 200] as const;

const TAB_LABELS = (t: any): Array<{ key: TaxTabKey; label: string }> => [
  { key: "hoa-don-nhap", label: t("hoadondientuPage.tabs.draft") },
  { key: "hoa-don-da-phat-hanh", label: t("hoadondientuPage.tabs.issued") },
  { key: "hoa-don-ban-ra", label: t("hoadondientuPage.tabs.output") },
  { key: "hoa-don-mua-vao", label: t("hoadondientuPage.tabs.input") },
  { key: "cau-hinh", label: t("hoadondientuPage.tabs.config") },
];

function statusLabel(status: Einvoice["status"]) {
  switch (status) {
    case "ISSUED":
      return "Đã phát hành";
    case "ERROR":
      return "Lỗi";
    case "CANCELLED":
      return "Đã hủy";
    case "SYNCED":
      return "Đã đồng bộ";
    default:
      return "Bản nháp";
  }
}

function statusVariant(status: Einvoice["status"]) {
  if (status === "ISSUED" || status === "SYNCED") return "default";
  if (status === "ERROR" || status === "CANCELLED") return "destructive";
  return "secondary";
}

function formatTaxInvoiceType(type?: string | null) {
  if (type === "CASH_REGISTER") return "HĐ Máy tính tiền";
  if (type === "STANDARD") return "HĐ Điện tử";
  return type || "-";
}

function formatTaxInvoiceStatus(val?: number | null) {
  switch (val) {
    case 1:
      return "Mới";
    case 2:
      return "Thay thế";
    case 3:
      return "Điều chỉnh";
    case 4:
      return "Bị thay thế";
    case 5:
      return "Bị điều chỉnh";
    case 6:
      return "Bị hủy";
    default:
      return val?.toString() || "—";
  }
}

function formatTaxProcessStatus(val?: number | null) {
  switch (val) {
    case 0:
      return "Cục Thuế đã nhận";
    case 1:
      return "Đang tiến hành kiểm tra điều kiện cấp mã";
    case 2:
      return "CQT từ chối hóa đơn theo từng lần phát sinh";
    case 3:
      return "Hóa đơn đủ điều kiện cấp mã";
    case 4:
      return "Hóa đơn không đủ điều kiện cấp mã";
    case 5:
      return "Đã cấp mã hóa đơn";
    case 6:
      return "Cục Thuế đã nhận không mã";
    case 7:
      return "Đã kiểm tra định kỳ HĐĐT không có mã";
    case 8:
      return "Cục Thuế đã nhận hóa đơn có mã khởi tạo từ máy tính tiền";
    default:
      return val?.toString() || "-";
  }
}

function formatMoney(value?: number) {
  return `${Number(value ?? 0).toLocaleString()} đ`;
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    startDate: formatDateInput(start),
    endDate: formatDateInput(end),
  };
}

function normalizeTaxPortalPageSize(pageSize: number): 50 | 100 | 200 {
  return TAX_PORTAL_PAGE_SIZE_OPTIONS.includes(pageSize as 50 | 100 | 200)
    ? (pageSize as 50 | 100 | 200)
    : 50;
}

function isTaxPortalRangeOverOneMonth(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
    return false;
  const limit = new Date(start);
  limit.setMonth(limit.getMonth() + 1);
  return end > limit;
}

const HoaDonDienTu: React.FC = () => {
  const defaultDateRange = useMemo(() => getDefaultDateRange(), []);
  const t = useT();
  const [activeTab, setActiveTab] = useState<TaxTabKey>("hoa-don-nhap");
  const [config, setConfig] = useState<SinvoiceConfig | null>(null);
  const [taxPortalConfig, setTaxPortalConfig] =
    useState<TaxPortalConfig | null>(null);
  const [draftInvoices, setDraftInvoices] = useState<Einvoice[]>([]);
  const [issuedInvoices, setIssuedInvoices] = useState<Einvoice[]>([]);
  const [outputInvoices, setOutputInvoices] = useState<Einvoice[]>([]);
  const [inputInvoices, setInputInvoices] = useState<Einvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [draftFilters, setDraftFilters] = useState({
    search: "",
    startDate: defaultDateRange.startDate,
    endDate: defaultDateRange.endDate,
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 1,
    sumTotalAmount: 0,
    sumVatAmount: 0,
  });
  const [issuedFilters, setIssuedFilters] = useState({
    search: "",
    startDate: defaultDateRange.startDate,
    endDate: defaultDateRange.endDate,
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 1,
    sumTotalAmount: 0,
    sumVatAmount: 0,
  });
  const [outputFilters, setOutputFilters] = useState({
    search: "",
    startDate: defaultDateRange.startDate,
    endDate: defaultDateRange.endDate,
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 1,
    sumTotalAmount: 0,
    sumVatAmount: 0,
  });
  const [inputFilters, setInputFilters] = useState({
    search: "",
    startDate: defaultDateRange.startDate,
    endDate: defaultDateRange.endDate,
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 1,
    sumTotalAmount: 0,
    sumVatAmount: 0,
  });
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [issuedDetail, setIssuedDetail] = useState<Einvoice | null>(null);
  const [bulkDrawerOpen, setBulkDrawerOpen] = useState(false);
  const [bulkMonth, setBulkMonth] = useState("");
  const [bulkTypes, setBulkTypes] = useState<string[]>(["pdf", "xml"]);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const monthOptions = useMemo(() => {
    const opts = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      opts.push({
        label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`,
        value: val,
      });
    }
    return opts;
  }, []);

  useEffect(() => {
    if (!bulkMonth && monthOptions.length > 0) {
      setBulkMonth(monthOptions[0].value);
    }
  }, [bulkMonth, monthOptions]);

  const debouncedDraftSearch = useDebounce(draftFilters.search, 400);
  const debouncedIssuedSearch = useDebounce(issuedFilters.search, 400);
  const debouncedOutputSearch = useDebounce(outputFilters.search, 400);
  const debouncedInputSearch = useDebounce(inputFilters.search, 400);

  const loadBaseData = useCallback(async () => {
    const [health, sinvoiceCfg, taxCfg] = await Promise.all([
      getSinvoiceHealthApi(),
      getConfigApi().catch(() => null),
      getTaxPortalConfigApi().catch(() => null),
    ]);
    setConfig(health);
    if (sinvoiceCfg) {
      // Intentionally left blank as sinvoiceForm is removed
    }
    setTaxPortalConfig(taxCfg);
    if (taxCfg) {
      // Intentionally left blank as taxPortalForm is removed
    }
  }, []);

  const loadDraftData = useCallback(async () => {
    const result = await listLocalDraftEinvoicesApi({
      page: draftFilters.page,
      pageSize: draftFilters.pageSize,
      search: debouncedDraftSearch,
      startDate: draftFilters.startDate,
      endDate: draftFilters.endDate,
    });
    setDraftInvoices(result.data);
    const meta = result?.meta ?? {
      total: 0,
      totalPages: 1,
      sum_total_amount: 0,
      sum_vat_amount: 0,
    };
    setDraftFilters((prev) => ({
      ...prev,
      total: meta.total ?? 0,
      totalPages: meta.totalPages ?? 1,
      sumTotalAmount: meta.sum_total_amount ?? 0,
      sumVatAmount: meta.sum_vat_amount ?? 0,
    }));
  }, [
    draftFilters.page,
    draftFilters.pageSize,
    debouncedDraftSearch,
    draftFilters.startDate,
    draftFilters.endDate,
  ]);

  const loadIssuedData = useCallback(async () => {
    const result = await listLocalIssuedEinvoicesApi({
      page: issuedFilters.page,
      pageSize: issuedFilters.pageSize,
      search: debouncedIssuedSearch,
      startDate: issuedFilters.startDate,
      endDate: issuedFilters.endDate,
    });
    setIssuedInvoices(result.data);
    const meta = result?.meta ?? {
      total: 0,
      totalPages: 1,
      sum_total_amount: 0,
      sum_vat_amount: 0,
    };
    setIssuedFilters((prev) => ({
      ...prev,
      total: meta.total ?? 0,
      totalPages: meta.totalPages ?? 1,
      sumTotalAmount: meta.sum_total_amount ?? 0,
      sumVatAmount: meta.sum_vat_amount ?? 0,
    }));
  }, [
    issuedFilters.page,
    issuedFilters.pageSize,
    debouncedIssuedSearch,
    issuedFilters.startDate,
    issuedFilters.endDate,
  ]);

  const loadOutputData = useCallback(async () => {
    const result = await listLocalEinvoicesApi({
      source: "TAX_PORTAL",
      direction: "OUT",
      search: debouncedOutputSearch,
      startDate: outputFilters.startDate,
      endDate: outputFilters.endDate,
      page: outputFilters.page,
      pageSize: outputFilters.pageSize,
    });
    setOutputInvoices(result.data);
    const outputMeta = result?.meta ?? {
      total: 0,
      totalPages: 1,
      sum_total_amount: 0,
      sum_vat_amount: 0,
    };
    setOutputFilters((prev) => ({
      ...prev,
      total: outputMeta.total ?? 0,
      totalPages: outputMeta.totalPages ?? 1,
      sumTotalAmount: outputMeta.sum_total_amount ?? 0,
      sumVatAmount: outputMeta.sum_vat_amount ?? 0,
    }));
  }, [
    debouncedOutputSearch,
    outputFilters.startDate,
    outputFilters.endDate,
    outputFilters.page,
    outputFilters.pageSize,
  ]);

  const loadInputData = useCallback(async () => {
    const result = await listLocalEinvoicesApi({
      source: "TAX_PORTAL",
      direction: "IN",
      search: debouncedInputSearch,
      startDate: inputFilters.startDate,
      endDate: inputFilters.endDate,
      page: inputFilters.page,
      pageSize: inputFilters.pageSize,
    });
    setInputInvoices(result.data);
    const inputMeta = result?.meta ?? {
      total: 0,
      totalPages: 1,
      sum_total_amount: 0,
      sum_vat_amount: 0,
    };
    setInputFilters((prev) => ({
      ...prev,
      total: inputMeta.total ?? 0,
      totalPages: inputMeta.totalPages ?? 1,
      sumTotalAmount: inputMeta.sum_total_amount ?? 0,
      sumVatAmount: inputMeta.sum_vat_amount ?? 0,
    }));
  }, [
    debouncedInputSearch,
    inputFilters.startDate,
    inputFilters.endDate,
    inputFilters.page,
    inputFilters.pageSize,
  ]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      await loadBaseData();
      await Promise.all([
        loadDraftData(),
        loadIssuedData(),
        loadOutputData(),
        loadInputData(),
      ]);
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ??
          error.message ??
          "Không tải được dữ liệu hóa đơn điện tử",
      );
    } finally {
      setLoading(false);
    }
  }, [
    loadBaseData,
    loadDraftData,
    loadIssuedData,
    loadOutputData,
    loadInputData,
  ]);

  const handleBulkDownloadFiles = async () => {
    if (bulkTypes.length === 0) {
      alert("Vui lòng chọn ít nhất 1 loại file (PDF hoặc XML)");
      return;
    }
    if (!bulkMonth) {
      alert("Vui lòng chọn kỳ tải hóa đơn");
      return;
    }
    try {
      setBulkDownloading(true);
      const [year, month] = bulkMonth.split("-");
      const dateFrom = `${year}-${month}-01`;
      const dateTo = new Date(Number(year), Number(month), 0)
        .toISOString()
        .slice(0, 10);

      let direction = "OUT";
      if (activeTab === "hoa-don-nhap" || activeTab === "hoa-don-mua-vao") {
        direction = "IN";
      }

      const blob = await erpInvoicesCoreApi.bulkDownloadFiles({
        query: {
          date_from: dateFrom,
          date_to: dateTo,
          direction,
        },
        types: bulkTypes,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HoaDon_${bulkMonth}_${direction}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setBulkDrawerOpen(false);
    } catch (error: any) {
      console.error(error);
      alert("Tải hàng loạt thất bại: " + error.message);
    } finally {
      setBulkDownloading(false);
    }
  };

  useEffect(() => {
    const tabFromUrl = new URLSearchParams(window.location.search).get(
      "tab",
    ) as TaxTabKey | null;
    if (
      tabFromUrl &&
      TAB_LABELS(t).some((tab: any) => tab.key === tabFromUrl)
    ) {
      setActiveTab(tabFromUrl);
    }
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", activeTab);
    window.history.replaceState({}, "", url.toString());
  }, [activeTab]);

  const { setCustomBreadcrumbs } = useAppStore();

  useEffect(() => {
    const keys: Record<TaxTabKey, string> = {
      "hoa-don-nhap": "hoadondientuPage.tabs.draft",
      "hoa-don-da-phat-hanh": "hoadondientuPage.tabs.issued",
      "hoa-don-ban-ra": "hoadondientuPage.tabs.output",
      "hoa-don-mua-vao": "hoadondientuPage.tabs.input",
      "cau-hinh": "hoadondientuPage.tabs.config",
    };

    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["breadcrumb.cashflow", "cashflow"],
      [keys[activeTab]],
    ]);
  }, [activeTab, setCustomBreadcrumbs]);

  const stats = useMemo(() => {
    const allInvoices = [
      ...draftInvoices,
      ...issuedInvoices,
      ...outputInvoices,
      ...inputInvoices,
    ];
    return allInvoices.reduce(
      (acc, item) => {
        if (item.status === "ISSUED" || item.status === "SYNCED")
          acc.issued += 1;
        else if (item.status === "ERROR") acc.error += 1;
        else if (item.status === "CANCELLED") acc.cancelled += 1;
        else acc.draft += 1;
        if ((item.source ?? "SINVOICE") === "TAX_PORTAL") acc.taxPortal += 1;
        if (item.direction === "IN") acc.input += 1;
        if (item.direction === "OUT") acc.output += 1;
        return acc;
      },
      {
        issued: 0,
        draft: 0,
        cancelled: 0,
        error: 0,
        taxPortal: 0,
        input: 0,
        output: 0,
      },
    );
  }, [draftInvoices, issuedInvoices, outputInvoices, inputInvoices]);

  async function handleDraftSaved(result: any) {
    setMessage(
      result?.response?.message ?? "Đã lưu hóa đơn nháp nội bộ thành công.",
    );
    await loadData();
    setActiveTab("hoa-don-nhap");
  }

  async function handleSyncDraft() {
    setLoading(true);
    setMessage("Đang lấy hóa đơn nháp từ Viettel...");
    try {
      await syncSinvoiceDraftApi({
        startDate: defaultDateRange.startDate,
        endDate: defaultDateRange.endDate,
        size: 50,
      });
      setMessage("Đồng bộ hóa đơn nháp thành công.");
      await loadData();
      setActiveTab("hoa-don-nhap");
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ??
          error.message ??
          "Đồng bộ hóa đơn nháp thất bại",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSyncIssued() {
    setLoading(true);
    setMessage("Đang lấy hóa đơn đã phát hành từ Viettel...");
    try {
      const result = await syncSinvoiceIssuedApi({
        startDate: defaultDateRange.startDate,
        endDate: defaultDateRange.endDate,
        rowPerPage: 50,
      });
      setMessage(
        `Đồng bộ hóa đơn đã phát hành thành công (${result?.count ?? 0} hóa đơn).`,
      );
      setActiveTab("hoa-don-da-phat-hanh");

      try {
        await loadData();
      } catch (reloadError: any) {
        setMessage(
          `Đồng bộ hóa đơn đã phát hành thành công (${result?.count ?? 0} hóa đơn) nhưng tải lại danh sách thất bại: ${reloadError?.response?.data?.message ?? reloadError?.message ?? "Lỗi không xác định"}`,
        );
      }
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ??
          error.message ??
          "Đồng bộ hóa đơn đã phát hành thất bại",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSyncTax(direction: "IN" | "OUT") {
    setLoading(true);
    setMessage(
      direction === "IN"
        ? "Đang đồng bộ hóa đơn mua vào từ cổng thuế..."
        : "Đang đồng bộ hóa đơn bán ra từ cổng thuế...",
    );
    try {
      const activeFilters = direction === "IN" ? inputFilters : outputFilters;
      const normalizedPageSize = normalizeTaxPortalPageSize(
        activeFilters.pageSize,
      );
      const result = await syncTaxPortalApi({
        direction,
        startDate: activeFilters.startDate,
        endDate: activeFilters.endDate,
        pageSize: normalizedPageSize,
      });
      setMessage(
        `Đồng bộ ${result.count} hóa đơn ${direction === "IN" ? "mua vào" : "bán ra"} thành công (${result.note})`,
      );
      await loadData();
      setActiveTab(direction === "IN" ? "hoa-don-mua-vao" : "hoa-don-ban-ra");
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ??
          error.message ??
          "Đồng bộ cổng thuế thất bại",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSyncDetail(id: string) {
    if (!taxPortalConfig?.gdtJwt) {
      setMessage(
        "Vui lòng cấu hình token Cổng thuế trước khi đồng bộ chi tiết.",
      );
      return;
    }
    setLoading(true);
    setMessage("Đang đồng bộ chi tiết hóa đơn từ cổng thuế...");
    try {
      await erpInvoicesCoreApi.syncDetail(id, taxPortalConfig.gdtJwt);
      setMessage("Đồng bộ chi tiết thành công");
      await loadData();
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ??
          error.message ??
          "Đồng bộ chi tiết thất bại",
      );
    } finally {
      setLoading(false);
    }
  }

  function getColumns(
    mode: "draft" | "issued" | "output" | "input",
  ): DataTableColumn<Einvoice>[] {
    const partnerHeader = mode === "input" ? "Người bán" : "Khách hàng";
    const taxHeader = mode === "input" ? "MST người bán" : "MST";

    return [
      {
        key: "invoice_date",
        header: "Ngày HĐ",
        headerClassName: "text-center pl-6",
        className: "pl-6 text-[color:var(--muted-fg)] text-right",
        cell: (inv) =>
          inv.invoice_date
            ? new Date(inv.invoice_date).toLocaleDateString("vi-VN")
            : "-",
      },
      {
        key: "document_no",
        header: "Mã chứng từ",
        className: "font-medium text-left",
        headerClassName: "text-center",
        cell: (inv) => inv.document_no || "-",
      },
      {
        key: "invoice_no",
        header: "Số hóa đơn",
        className: "font-mono text-left",
        headerClassName: "text-center",
        cell: (inv) => (
          <div className="flex items-center gap-2">
            <span>{inv.invoice_no || inv.invoiceNo || "-"}</span>
            {(inv.xml_file_key || inv.xmlFileKey) && (
              <span title="Đã có file XML">
                <FileCode className="h-4 w-4 text-green-600" />
              </span>
            )}
          </div>
        ),
      },
      {
        key: "source",
        header: "Nguồn",
        className: "text-center",
        headerClassName: "text-center",
        cell: (inv) => (
          <div className="flex justify-center w-full">
            <Badge variant="outline">
              {inv.source === "TAX_PORTAL" ? "Cổng thuế" : "Viettel v2.49"}
            </Badge>
          </div>
        ),
      },
      {
        key: "partner",
        header: partnerHeader,
        className: "max-w-[200px] truncate text-left",
        headerClassName: "text-center",
        cell: (inv) =>
          mode === "input" ? inv.seller_name || "-" : inv.buyer_name || "-",
      },
      {
        key: "tax_code",
        header: taxHeader,
        className: "font-mono text-xs text-left",
        headerClassName: "text-center",
        cell: (inv) =>
          mode === "input"
            ? inv.seller_tax_code || "-"
            : inv.buyer_tax_code || "-",
      },
      {
        key: "total_amount",
        header: "Tổng tiền",
        headerClassName: "text-center",
        className: "text-right font-mono",
        cell: (inv) => formatMoney(inv.total_amount),
      },
      {
        key: "tax_invoice_type",
        header: "Loại HĐ",
        className: "text-center whitespace-nowrap",
        headerClassName: "text-center whitespace-nowrap",
        cell: (inv) =>
          formatTaxInvoiceType(inv.tax_invoice_type || inv.taxInvoiceType),
      },
      {
        key: "tax_invoice_status",
        header: "Trạng thái (GDT)",
        className: "text-center whitespace-nowrap",
        headerClassName: "text-center whitespace-nowrap",
        cell: (inv) => (
          <div className="flex justify-center w-full">
            <Badge variant="outline">
              {formatTaxInvoiceStatus(
                inv.tax_invoice_status ?? inv.taxInvoiceStatus,
              )}
            </Badge>
          </div>
        ),
      },
      {
        key: "tax_process_status",
        header: "KQ Kiểm tra",
        className: "text-center whitespace-nowrap max-w-[200px] truncate",
        headerClassName: "text-center whitespace-nowrap",
        cell: (inv) => {
          const lbl = formatTaxProcessStatus(
            inv.tax_process_status ?? inv.taxProcessStatus,
          );
          return <span title={lbl}>{lbl}</span>;
        },
      },
      {
        key: "status",
        header: "Trạng thái",
        className: "text-center",
        headerClassName: "text-center",
        cell: (inv) => (
          <div className="flex justify-center w-full">
            <Badge variant={statusVariant(inv.status)}>
              {statusLabel(inv.status)}
            </Badge>
          </div>
        ),
      },
      {
        key: "detail",
        header: "Chi tiết",
        headerClassName: "text-center pr-6",
        className:
          "text-right pr-6 text-[10px] text-muted-foreground leading-tight",
        cell: (inv) =>
          mode === "issued" ? (
            <button
              type="button"
              onClick={() => setIssuedDetail(inv)}
              className="rounded border border-border px-2 py-1 text-xs hover:bg-surface-hover"
            >
              Xem chi tiết
            </button>
          ) : (
            <>
              <div className="truncate max-w-[120px]" title="Trạng thái CQT">
                {inv.tax_status || "-"}
              </div>
              <div className="flex items-center justify-end gap-2 mt-1">
                <span
                  className="truncate max-w-[100px] text-muted-foreground"
                  title="ID trên Portal"
                >
                  {inv.external_invoice_id || inv.externalId || "-"}
                </span>
                <button
                  type="button"
                  title="Đồng bộ lại chi tiết"
                  onClick={() => handleSyncDetail(inv.id)}
                  className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>
            </>
          ),
      },
    ];
  }

  function renderTable(mode: "draft" | "issued" | "output" | "input") {
    const invoices =
      mode === "draft"
        ? draftInvoices
        : mode === "issued"
          ? issuedInvoices
          : mode === "output"
            ? outputInvoices
            : inputInvoices;
    const state =
      mode === "draft"
        ? draftFilters
        : mode === "issued"
          ? issuedFilters
          : mode === "output"
            ? outputFilters
            : inputFilters;
    const setState =
      mode === "draft"
        ? setDraftFilters
        : mode === "issued"
          ? setIssuedFilters
          : mode === "output"
            ? setOutputFilters
            : setInputFilters;
    const showFilters =
      mode === "draft" ||
      mode === "issued" ||
      mode === "output" ||
      mode === "input";
    const overOneMonth =
      (mode === "output" || mode === "input") &&
      isTaxPortalRangeOverOneMonth(state.startDate, state.endDate);

    const columns = getColumns(mode);

    return (
      <div className="space-y-4">
        {showFilters && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                placeholder="Tìm theo số HĐ, tên đối tác..."
                value={state.search}
                onChange={(v) =>
                  setState((prev) => ({ ...prev, search: v, page: 1 }))
                }
                className="w-full md:w-[300px]"
              />
              <div className="flex items-center gap-2">
                <DatePicker
                  value={state.startDate}
                  onChange={(v) =>
                    setState((prev) => ({ ...prev, startDate: v, page: 1 }))
                  }
                  placeholder="Từ ngày"
                  className="w-[140px]"
                />
                <span className="text-muted-foreground">→</span>
                <DatePicker
                  value={state.endDate}
                  onChange={(v) =>
                    setState((prev) => ({ ...prev, endDate: v, page: 1 }))
                  }
                  placeholder="Đến ngày"
                  className="w-[140px]"
                />
              </div>
              {(state.search || state.startDate || state.endDate) && (
                <button
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      search: "",
                      startDate: defaultDateRange.startDate,
                      endDate: defaultDateRange.endDate,
                      page: 1,
                      pageSize: 50,
                    }))
                  }
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                  Đặt lại
                </button>
              )}
            </div>
            {overOneMonth && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Khoảng ngày đang lớn hơn 1 tháng. Khi bấm đồng bộ, hệ thống sẽ
                tự chia request theo từng tháng và upsert dữ liệu trùng.
              </div>
            )}
          </div>
        )}

        <DataTable<Einvoice>
          items={invoices}
          columns={columns}
          getRowKey={(inv) => inv.id}
          loading={loading}
          emptyLabel="Chưa có dữ liệu"
          page={state.page}
          pageSize={state.pageSize}
          total={state.total}
          totalPages={state.totalPages}
          onPage={(page) => setState((prev) => ({ ...prev, page }))}
          onPageSize={(pageSize) =>
            setState((prev) => ({ ...prev, pageSize, page: 1 }))
          }
        />

        {showFilters && invoices.length > 0 && (
          <div className="bg-surface border border-border rounded-xl px-6 py-3 flex items-center font-semibold">
            <span className="flex-1 text-right">Tổng cộng:</span>
            <span className="text-right font-mono ml-4">
              {formatMoney(state.sumTotalAmount)}
            </span>
            <span className="text-xs text-muted-foreground ml-4">
              (Thuế: {formatMoney(state.sumVatAmount)})
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <PageLayout
        title={t("nav.items.hoadondientu")}
        desc={
          config
            ? `Trung tâm hóa đơn điện tử • Viettel v2.49 • ${config.supplierTaxCode || config.username || "-"}`
            : t("hoadondientuPage.descriptions.fallback")
        }
        icon={<FileText className="h-4 w-4" />}
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              className="flex items-center px-3 py-1.5 border border-border rounded-md text-sm font-medium bg-surface hover:bg-surface-hover disabled:opacity-60"
              onClick={() => void loadData()}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
            </button>
            <button
              className="flex items-center px-3 py-1.5 border border-border rounded-md text-sm font-medium bg-surface hover:bg-surface-hover disabled:opacity-60"
              onClick={() => setBulkDrawerOpen(true)}
              disabled={loading}
            >
              <Download className="mr-2 h-4 w-4" /> Tải hàng loạt
            </button>
          </div>
        }
        middleContent={
          <>
            {message && (
              <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted-foreground mb-4">
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <KpiCard
                label={t("hoadondientuPage.kpi.issued")}
                value={String(stats.issued)}
                icon={<FileText />}
              />
              <KpiCard
                label={t("hoadondientuPage.kpi.output")}
                value={String(stats.output)}
                icon={<Send />}
              />
              <KpiCard
                label={t("hoadondientuPage.kpi.input")}
                value={String(stats.input)}
                icon={<RefreshCw />}
              />
              <KpiCard
                label={t("hoadondientuPage.kpi.taxPortal")}
                value={String(stats.taxPortal)}
                icon={<Settings />}
              />
              <KpiCard
                label={t("hoadondientuPage.kpi.error")}
                value={String(stats.error)}
                icon={<Trash2 />}
                warn
              />
            </div>
          </>
        }
        tabs={[
          { value: "hoa-don-nhap", label: t("hoadondientuPage.tabs.draft") },
          {
            value: "hoa-don-da-phat-hanh",
            label: t("hoadondientuPage.tabs.issued"),
          },
          { value: "hoa-don-ban-ra", label: t("hoadondientuPage.tabs.output") },
          { value: "hoa-don-mua-vao", label: t("hoadondientuPage.tabs.input") },
        ]}
        activeTab={activeTab}
        onTabChange={(v) => setActiveTab(v as TaxTabKey)}
      >
        <div
          className={`${activeTab === "hoa-don-nhap" ? "space-y-6" : "hidden"} rounded-xl border border-border bg-surface p-5 card-shadow relative z-0`}
        >
          <div className="mb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold">Hóa đơn nháp</h3>
                <p className="text-sm text-muted-foreground">
                  Danh sách hóa đơn nháp đồng bộ từ Viettel.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="flex items-center px-3 py-1.5 border border-border rounded-md text-sm font-medium bg-surface hover:bg-surface-hover disabled:opacity-60"
                  onClick={handleSyncDraft}
                  disabled={loading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Lấy hóa đơn nháp
                </button>
                <BtnPrimary
                  onClick={() => setDraftModalOpen(true)}
                  disabled={loading}
                >
                  <Send className="mr-2 h-4 w-4" /> Tạo hóa đơn nháp mới
                </BtnPrimary>
              </div>
            </div>
          </div>
          {renderTable("draft")}
        </div>

        <div
          className={`${activeTab === "hoa-don-da-phat-hanh" ? "space-y-6" : "hidden"} rounded-xl border border-border bg-surface p-5 card-shadow relative z-0`}
        >
          <div className="mb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold">
                  Hóa đơn đã phát hành
                </h3>
                <p className="text-sm text-muted-foreground">
                  Danh sách hóa đơn đã phát hành đồng bộ từ Viettel.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <BtnPrimary onClick={handleSyncIssued} disabled={loading}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Lấy hóa đơn đã phát
                  hành
                </BtnPrimary>
              </div>
            </div>
          </div>
          {renderTable("issued")}
        </div>

        <div
          className={`${activeTab === "hoa-don-ban-ra" ? "space-y-6" : "hidden"} rounded-xl border border-border bg-surface p-5 card-shadow relative z-0`}
        >
          <div className="flex flex-wrap gap-2">
            <BtnPrimary onClick={() => handleSyncTax("OUT")} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> Đồng bộ hóa đơn bán ra qua
              Viettel Tax Portal
            </BtnPrimary>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSyncTax("OUT")}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Đồng bộ & cập nhật lại hóa
              đơn cũ
            </Button>
          </div>
          {renderTable("output")}
        </div>

        <div
          className={`${activeTab === "hoa-don-mua-vao" ? "space-y-6" : "hidden"} rounded-xl border border-border bg-surface p-5 card-shadow relative z-0`}
        >
          <div className="flex flex-wrap gap-2">
            <BtnPrimary onClick={() => handleSyncTax("IN")} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> Đồng bộ hóa đơn mua vào qua
              Viettel Tax Portal
            </BtnPrimary>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSyncTax("IN")}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Đồng bộ & cập nhật lại hóa
              đơn cũ
            </Button>
          </div>
          {renderTable("input")}
        </div>
      </PageLayout>

      <DrawerModal
        open={!!issuedDetail}
        onClose={() => setIssuedDetail(null)}
        title="Chi tiết hóa đơn đã phát hành"
        subtitle={
          issuedDetail?.invoice_no || issuedDetail?.external_invoice_id || "-"
        }
      >
        <pre className="text-xs whitespace-pre-wrap break-all rounded-lg bg-muted/40 p-3">
          {JSON.stringify(
            issuedDetail?.response_payload ?? issuedDetail ?? {},
            null,
            2,
          )}
        </pre>
      </DrawerModal>

      <SinvoiceDraftModal
        open={draftModalOpen}
        onClose={() => setDraftModalOpen(false)}
        onSaved={handleDraftSaved}
      />

      <DrawerModal
        open={bulkDrawerOpen}
        onClose={() => setBulkDrawerOpen(false)}
        title="Tải hàng loạt hóa đơn"
      >
        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kỳ tải hóa đơn *</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={bulkMonth}
              onChange={(e) => setBulkMonth(e.target.value)}
            >
              <option value="" disabled>
                Chọn kỳ...
              </option>
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Hệ thống sẽ tải toàn bộ hóa đơn trong tháng đã chọn để tránh quá
              tải.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Định dạng file tải về *
            </label>
            <div className="flex flex-col gap-2 mt-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  checked={bulkTypes.includes("pdf")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setBulkTypes((prev) => [...prev, "pdf"]);
                    } else {
                      setBulkTypes((prev) => prev.filter((t) => t !== "pdf"));
                    }
                  }}
                />
                <span className="text-sm">File PDF</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  checked={bulkTypes.includes("xml")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setBulkTypes((prev) => [...prev, "xml"]);
                    } else {
                      setBulkTypes((prev) => prev.filter((t) => t !== "xml"));
                    }
                  }}
                />
                <span className="text-sm">File XML</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2 border-t border-border">
            <button
              onClick={() => setBulkDrawerOpen(false)}
              className="px-4 py-2 text-sm font-medium border border-border rounded bg-surface hover:bg-surface-hover"
              disabled={bulkDownloading}
            >
              Hủy
            </button>
            <BtnPrimary
              onClick={handleBulkDownloadFiles}
              disabled={bulkDownloading}
            >
              {bulkDownloading ? "Đang nén file..." : "Xác nhận tải"}
            </BtnPrimary>
          </div>
        </div>
      </DrawerModal>
    </>
  );
};

export default HoaDonDienTu;
