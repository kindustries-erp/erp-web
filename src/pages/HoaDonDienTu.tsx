import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  RefreshCw,
  Send,
  Settings,
  Trash2,
  CalendarDays,
} from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { KpiCard } from "@/shared/components/KpiCard";
import { SearchInput } from "@/shared/components/SearchInput";
import { DatePicker } from "@/shared/components/DatePicker";
import { TablePagination } from "@/shared/components/TablePagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import { PageWithTabsLayout } from "@/shared/components/PageWithTabsLayout";
import {
  getConfigApi,
  getSinvoiceHealthApi,
  getTaxPortalConfigApi,
  listLocalDraftEinvoicesApi,
  listLocalEinvoicesApi,
  listLocalIssuedEinvoicesApi,
  resetConfigApi,
  resetTaxPortalConfigApi,
  saveConfigApi,
  saveTaxPortalConfigApi,
  syncSinvoiceDraftApi,
  syncSinvoiceIssuedApi,
  syncTaxPortalApi,
  type Einvoice,
  type SinvoiceConfig,
  type TaxPortalConfig,
} from "@/modules/accounting/api/sinvoiceApi";
import { SinvoiceDraftModal } from "@/modules/accounting/components/SinvoiceDraftModal";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { AppTabs } from "@/shared/components/AppTabs";
import { useDebounce } from "@/shared/hooks/useDebounce";

type TaxTabKey =
  | "hoa-don-nhap"
  | "hoa-don-da-phat-hanh"
  | "hoa-don-ban-ra"
  | "hoa-don-mua-vao"
  | "cau-hinh";

const TAX_PORTAL_PAGE_SIZE_OPTIONS = [15, 30, 50] as const;

const TAB_LABELS = (t: any): Array<{ key: TaxTabKey; label: string }> => [
  { key: "hoa-don-nhap", label: t("hoadondientuPage.tabs.draft") },
  { key: "hoa-don-da-phat-hanh", label: t("hoadondientuPage.tabs.issued") },
  { key: "hoa-don-ban-ra", label: t("hoadondientuPage.tabs.output") },
  { key: "hoa-don-mua-vao", label: t("hoadondientuPage.tabs.input") },
  { key: "cau-hinh", label: t("hoadondientuPage.tabs.config") },
];

const TAB_DESCRIPTIONS = (t: any): Record<TaxTabKey, string> => ({
  "hoa-don-nhap": t("hoadondientuPage.descriptions.draft"),
  "hoa-don-da-phat-hanh": t("hoadondientuPage.descriptions.issued"),
  "hoa-don-ban-ra": t("hoadondientuPage.descriptions.output"),
  "hoa-don-mua-vao": t("hoadondientuPage.descriptions.input"),
  "cau-hinh": t("hoadondientuPage.descriptions.config"),
});

const TAB_ACCENT: Record<TaxTabKey, string> = {
  "hoa-don-nhap": "border-l-sky-500",
  "hoa-don-da-phat-hanh": "border-l-emerald-500",
  "hoa-don-ban-ra": "border-l-indigo-500",
  "hoa-don-mua-vao": "border-l-violet-500",
  "cau-hinh": "border-l-amber-500",
};

const EXEC_SUMMARY_LABEL = (t: any): Record<TaxTabKey, string> => ({
  "hoa-don-nhap": t("hoadondientuPage.execSummary.draft"),
  "hoa-don-da-phat-hanh": t("hoadondientuPage.execSummary.issued"),
  "hoa-don-ban-ra": t("hoadondientuPage.execSummary.output"),
  "hoa-don-mua-vao": t("hoadondientuPage.execSummary.input"),
  "cau-hinh": t("hoadondientuPage.execSummary.config"),
});

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

function normalizeTaxPortalPageSize(pageSize: number): 15 | 30 | 50 {
  return TAX_PORTAL_PAGE_SIZE_OPTIONS.includes(pageSize as 15 | 30 | 50)
    ? (pageSize as 15 | 30 | 50)
    : 15;
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
    pageSize: 15,
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
    pageSize: 15,
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
    pageSize: 15,
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
    pageSize: 15,
    total: 0,
    totalPages: 1,
    sumTotalAmount: 0,
    sumVatAmount: 0,
  });
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [issuedDetail, setIssuedDetail] = useState<Einvoice | null>(null);
  const [sinvoiceForm, setSinvoiceForm] = useState({
    username: "",
    password: "",
    apiUrl: "https://api-vinvoice.viettel.vn",
  });
  const [taxPortalForm, setTaxPortalForm] = useState<TaxPortalConfig>({
    taxCode: "",
    username: "",
    password: "",
    providerName: "VIETTEL_TAX_PORTAL",
    apiUrl: "",
    gdtJwt: "",
    gdtCookie: "",
    isActive: true,
  });
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
      setSinvoiceForm({
        username: sinvoiceCfg.username || "",
        password: sinvoiceCfg.password || "",
        apiUrl: sinvoiceCfg.apiUrl || "https://api-vinvoice.viettel.vn",
      });
    }
    setTaxPortalConfig(taxCfg);
    if (taxCfg) {
      setTaxPortalForm({
        taxCode: taxCfg.taxCode || "",
        username: taxCfg.username || "",
        password: taxCfg.password || "",
        providerName: taxCfg.providerName || "VIETTEL_TAX_PORTAL",
        apiUrl: taxCfg.apiUrl || "",
        gdtJwt: taxCfg.gdtJwt || "",
        gdtCookie: taxCfg.gdtCookie || "",
        isActive: taxCfg.isActive ?? true,
      });
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
      ["breadcrumb.cashflow", "dongtien"],
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

  async function handleSaveSinvoiceConfig() {
    setLoading(true);
    setMessage("Đang lưu cấu hình Viettel v2.49...");
    try {
      const result = await saveConfigApi(sinvoiceForm);
      const connection = result?.connection;
      setMessage(
        connection?.ok
          ? `Lưu cấu hình Viettel v2.49 thành công. ${connection.message}`
          : `Lưu cấu hình Viettel v2.49 thành công nhưng kiểm tra kết nối thất bại. ${connection?.message ?? "Không có phản hồi test kết nối."}`,
      );
      await loadData();
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ??
          error.message ??
          "Lưu cấu hình Viettel v2.49 thất bại",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSinvoiceConfig() {
    if (
      !window.confirm("Bạn có chắc muốn xóa cấu hình Viettel v2.49 hiện tại?")
    )
      return;
    setLoading(true);
    setMessage("Đang xóa cấu hình Viettel v2.49...");
    try {
      await resetConfigApi();
      setMessage("Xóa cấu hình Viettel v2.49 thành công.");
      await loadData();
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ??
          error.message ??
          "Xóa cấu hình Viettel v2.49 thất bại",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTaxPortalConfig() {
    setLoading(true);
    setMessage("Đang lưu cấu hình cổng thuế...");
    try {
      const result = await saveTaxPortalConfigApi(taxPortalForm);
      const connection = result?.connection;
      setMessage(
        connection?.ok
          ? `Lưu cấu hình cổng thuế thành công. ${connection.message}`
          : `Lưu cấu hình cổng thuế thành công nhưng kiểm tra kết nối thất bại. ${connection?.message ?? "Không có phản hồi test kết nối."}`,
      );
      await loadData();
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ??
          error.message ??
          "Lưu cấu hình cổng thuế thất bại",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetTaxPortalConfig() {
    if (!window.confirm("Bạn có chắc muốn xóa cấu hình cổng thuế hiện tại?"))
      return;
    setLoading(true);
    setMessage("Đang xóa cấu hình cổng thuế...");
    try {
      await resetTaxPortalConfigApi();
      setMessage("Xóa cấu hình cổng thuế thành công.");
      await loadData();
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ??
          error.message ??
          "Xóa cấu hình cổng thuế thất bại",
      );
    } finally {
      setLoading(false);
    }
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
    const partnerHeader = mode === "input" ? "Người bán" : "Khách hàng";
    const taxHeader = mode === "input" ? "MST người bán" : "MST";
    const showFilters =
      mode === "draft" ||
      mode === "issued" ||
      mode === "output" ||
      mode === "input";
    const overOneMonth =
      (mode === "output" || mode === "input") &&
      isTaxPortalRangeOverOneMonth(state.startDate, state.endDate);

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
                      pageSize: 15,
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

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Ngày HĐ</TableHead>
                <TableHead>Mã chứng từ</TableHead>
                <TableHead>Số hóa đơn</TableHead>
                <TableHead>Nguồn</TableHead>
                <TableHead>{partnerHeader}</TableHead>
                <TableHead>{taxHeader}</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right pr-6">Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {loading ? "Đang tải..." : "Chưa có dữ liệu"}
                  </TableCell>
                </TableRow>
              )}
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="pl-6 text-[color:var(--muted-fg)]">
                    {inv.invoice_date
                      ? new Date(inv.invoice_date).toLocaleDateString("vi-VN")
                      : "-"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {inv.document_no || "-"}
                  </TableCell>
                  <TableCell className="font-mono">
                    {inv.invoice_no || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {inv.source === "TAX_PORTAL"
                        ? "Cổng thuế"
                        : "Viettel v2.49"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {mode === "input"
                      ? inv.seller_name || "-"
                      : inv.buyer_name || "-"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {mode === "input"
                      ? inv.seller_tax_code || "-"
                      : inv.buyer_tax_code || "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatMoney(inv.total_amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(inv.status)}>
                      {statusLabel(inv.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6 text-[10px] text-muted-foreground leading-tight">
                    {mode === "issued" ? (
                      <button
                        type="button"
                        onClick={() => setIssuedDetail(inv)}
                        className="rounded border border-border px-2 py-1 text-xs hover:bg-surface-hover"
                      >
                        Xem chi tiết
                      </button>
                    ) : (
                      <>
                        <div className="truncate max-w-[120px]">
                          {inv.tax_status || "-"}
                        </div>
                        <div className="truncate max-w-[120px]">
                          {inv.external_invoice_id || "-"}
                        </div>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {showFilters && invoices.length > 0 && (
                <TableRow className="bg-surface-hover/30 font-semibold">
                  <TableCell colSpan={6} className="pl-6 text-right py-3">
                    Tổng cộng:
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatMoney(state.sumTotalAmount)}
                  </TableCell>
                  <TableCell
                    colSpan={2}
                    className="text-xs text-muted-foreground pr-6"
                  >
                    (Thuế: {formatMoney(state.sumVatAmount)})
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {showFilters && (
          <TablePagination
            page={state.page}
            pageSize={state.pageSize}
            total={state.total}
            totalPages={state.totalPages}
            onPage={(page) => setState((prev) => ({ ...prev, page }))}
            onPageSize={(pageSize) =>
              setState((prev) => ({ ...prev, pageSize, page: 1 }))
            }
          />
        )}
      </div>
    );
  }

  return (
    <>
      <PageWithTabsLayout
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
            <BtnPrimary
              onClick={() => setActiveTab("cau-hinh")}
              disabled={loading}
            >
              <Settings className="mr-2 h-4 w-4" /> Mở cấu hình
            </BtnPrimary>
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
          { value: "cau-hinh", label: t("hoadondientuPage.tabs.config") },
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
          </div>
          {renderTable("input")}
        </div>

        <div
          className={`${activeTab === "cau-hinh" ? "grid grid-cols-1 xl:grid-cols-2 gap-6" : "hidden"} rounded-xl border border-border bg-surface p-5 card-shadow relative z-0`}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">
                Cấu hình Viettel v2.49
              </h3>
              <p className="text-sm text-muted-foreground">
                Dùng cho surface xuất hóa đơn nháp Viettel v2.49 đang được map
                qua route `sinvoice` hiện tại.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input
                className="w-full px-3 py-2 bg-background border border-border rounded-md"
                value={sinvoiceForm.username}
                onChange={(e) =>
                  setSinvoiceForm({ ...sinvoiceForm, username: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 bg-background border border-border rounded-md"
                value={sinvoiceForm.password}
                onChange={(e) =>
                  setSinvoiceForm({ ...sinvoiceForm, password: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">API URL</label>
              <input
                className="w-full px-3 py-2 bg-background border border-border rounded-md"
                value={sinvoiceForm.apiUrl}
                onChange={(e) =>
                  setSinvoiceForm({ ...sinvoiceForm, apiUrl: e.target.value })
                }
              />
            </div>
            <div className="flex justify-between gap-2">
              <button
                className="px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 text-sm font-medium"
                onClick={handleResetSinvoiceConfig}
                disabled={loading}
              >
                Xóa / Reset
              </button>
              <BtnPrimary onClick={handleSaveSinvoiceConfig} disabled={loading}>
                Lưu cấu hình Viettel v2.49
              </BtnPrimary>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">Cấu hình cổng thuế</h3>
              <p className="text-sm text-muted-foreground">
                Dùng để tra cứu hóa đơn mua vào/đầu ra từ tài khoản Tổng cục
                Thuế.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Mã số thuế đăng nhập
              </label>
              <input
                className="w-full px-3 py-2 bg-background border border-border rounded-md"
                value={taxPortalForm.taxCode || ""}
                onChange={(e) =>
                  setTaxPortalForm({
                    ...taxPortalForm,
                    taxCode: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input
                className="w-full px-3 py-2 bg-background border border-border rounded-md"
                value={taxPortalForm.username || ""}
                onChange={(e) =>
                  setTaxPortalForm({
                    ...taxPortalForm,
                    username: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 bg-background border border-border rounded-md"
                value={taxPortalForm.password || ""}
                onChange={(e) =>
                  setTaxPortalForm({
                    ...taxPortalForm,
                    password: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Provider</label>
              <input
                className="w-full px-3 py-2 bg-background border border-border rounded-md"
                value={taxPortalForm.providerName || "VIETTEL_TAX_PORTAL"}
                onChange={(e) =>
                  setTaxPortalForm({
                    ...taxPortalForm,
                    providerName: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">API URL tích hợp</label>
              <input
                className="w-full px-3 py-2 bg-background border border-border rounded-md"
                value={taxPortalForm.apiUrl || ""}
                onChange={(e) =>
                  setTaxPortalForm({ ...taxPortalForm, apiUrl: e.target.value })
                }
                placeholder="Endpoint tích hợp thực tế nếu có"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                JWT Token từ Tổng cục Thuế
              </label>
              <textarea
                className="w-full px-3 py-2 bg-background border border-border rounded-md min-h-[80px]"
                value={taxPortalForm.gdtJwt || ""}
                onChange={(e) =>
                  setTaxPortalForm({ ...taxPortalForm, gdtJwt: e.target.value })
                }
                placeholder="Bearer ey..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Cookie từ Tổng cục Thuế
              </label>
              <textarea
                className="w-full px-3 py-2 bg-background border border-border rounded-md min-h-[80px]"
                value={taxPortalForm.gdtCookie || ""}
                onChange={(e) =>
                  setTaxPortalForm({
                    ...taxPortalForm,
                    gdtCookie: e.target.value,
                  })
                }
                placeholder="_gdt_... "
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="tax-portal-active"
                type="checkbox"
                checked={taxPortalForm.isActive ?? true}
                onChange={(e) =>
                  setTaxPortalForm({
                    ...taxPortalForm,
                    isActive: e.target.checked,
                  })
                }
              />
              <label
                htmlFor="tax-portal-active"
                className="text-sm text-muted-foreground"
              >
                Kích hoạt cấu hình cổng thuế
              </label>
            </div>
            <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
              {taxPortalConfig?.username
                ? `Đã có cấu hình cổng thuế cho MST ${taxPortalConfig.taxCode || "-"}.`
                : "Chưa có cấu hình cổng thuế trong hệ thống."}
            </div>
            <div className="flex justify-between gap-2">
              <button
                className="px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 text-sm font-medium"
                onClick={handleResetTaxPortalConfig}
                disabled={loading}
              >
                Xóa / Reset
              </button>
              <BtnPrimary
                onClick={handleSaveTaxPortalConfig}
                disabled={loading}
              >
                Lưu cấu hình cổng thuế
              </BtnPrimary>
            </div>
          </div>
        </div>
      </PageWithTabsLayout>

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
    </>
  );
};

export default HoaDonDienTu;
