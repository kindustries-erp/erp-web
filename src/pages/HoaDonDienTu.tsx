import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, RefreshCw, Send, Settings, Trash2 } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { KpiCard } from "@/shared/components/KpiCard";
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
import {
  getConfigApi,
  getSinvoiceHealthApi,
  getTaxPortalConfigApi,
  listLocalEinvoicesApi,
  resetConfigApi,
  resetTaxPortalConfigApi,
  saveConfigApi,
  saveTaxPortalConfigApi,
  syncSinvoiceApi,
  syncTaxPortalApi,
  type Einvoice,
  type SinvoiceConfig,
  type TaxPortalConfig,
} from "@/modules/accounting/api/sinvoiceApi";
import { SinvoiceDraftModal } from "@/modules/accounting/components/SinvoiceDraftModal";

type TaxTabKey = "issue" | "output" | "input" | "config";

const TAB_LABELS: Array<{ key: TaxTabKey; label: string }> = [
  { key: "issue", label: "Xuất hóa đơn" },
  { key: "output", label: "Hóa đơn bán ra" },
  { key: "input", label: "Hóa đơn mua vào" },
  { key: "config", label: "Cấu hình" },
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

function formatMoney(value?: number) {
  return `${Number(value ?? 0).toLocaleString()} đ`;
}

const HoaDonDienTu: React.FC = () => {
  const t = useT();
  const [activeTab, setActiveTab] = useState<TaxTabKey>("issue");
  const [config, setConfig] = useState<SinvoiceConfig | null>(null);
  const [taxPortalConfig, setTaxPortalConfig] = useState<TaxPortalConfig | null>(null);
  const [allInvoices, setAllInvoices] = useState<Einvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [sinvoiceForm, setSinvoiceForm] = useState({
    supplierTaxCode: "",
    username: "",
    password: "",
    apiUrl: "https://demo-sinvoice.viettel.vn:8443/InvoiceAPI",
    environment: "demo",
  });
  const [taxPortalForm, setTaxPortalForm] = useState<TaxPortalConfig>({
    taxCode: "",
    username: "",
    password: "",
    providerName: "VIETTEL_TAX_PORTAL",
    apiUrl: "",
    isActive: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const [health, items, sinvoiceCfg, taxCfg] = await Promise.all([
        getSinvoiceHealthApi(),
        listLocalEinvoicesApi(),
        getConfigApi().catch(() => null),
        getTaxPortalConfigApi().catch(() => null),
      ]);
      setConfig(health);
      setAllInvoices(items);
      if (sinvoiceCfg) {
        setSinvoiceForm({
          supplierTaxCode: sinvoiceCfg.supplierTaxCode || "",
          username: sinvoiceCfg.username || "",
          password: sinvoiceCfg.password || "",
          apiUrl: sinvoiceCfg.apiUrl || "https://demo-sinvoice.viettel.vn:8443/InvoiceAPI",
          environment: sinvoiceCfg.environment || "demo",
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
          isActive: taxCfg.isActive ?? true,
        });
      }
    } catch (error: any) {
      setMessage(error?.response?.data?.message ?? error.message ?? "Không tải được dữ liệu quản lý thuế");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const issueInvoices = useMemo(
    () => allInvoices.filter((item) => (item.source ?? "SINVOICE") === "SINVOICE"),
    [allInvoices],
  );
  const outputInvoices = useMemo(
    () => allInvoices.filter((item) => item.direction === "OUT" || (item.source ?? "SINVOICE") === "SINVOICE"),
    [allInvoices],
  );
  const inputInvoices = useMemo(
    () => allInvoices.filter((item) => item.direction === "IN"),
    [allInvoices],
  );

  const stats = useMemo(() => {
    return allInvoices.reduce(
      (acc, item) => {
        if (item.status === "ISSUED" || item.status === "SYNCED") acc.issued += 1;
        else if (item.status === "ERROR") acc.error += 1;
        else if (item.status === "CANCELLED") acc.cancelled += 1;
        else acc.draft += 1;
        if ((item.source ?? "SINVOICE") === "TAX_PORTAL") acc.taxPortal += 1;
        if (item.direction === "IN") acc.input += 1;
        if (item.direction === "OUT" || (item.source ?? "SINVOICE") === "SINVOICE") acc.output += 1;
        return acc;
      },
      { issued: 0, draft: 0, cancelled: 0, error: 0, taxPortal: 0, input: 0, output: 0 },
    );
  }, [allInvoices]);

  async function handleDraftSaved(result: any) {
    setMessage(result?.response?.message ?? "Đã lưu hóa đơn nháp nội bộ thành công.");
    await loadData();
    setActiveTab("issue");
  }

  async function handleSyncSinvoice() {
    setLoading(true);
    setMessage("Đang tra cứu danh sách hóa đơn trên Viettel SInvoice...");
    try {
      await syncSinvoiceApi();
      setMessage("Tra cứu SInvoice thành công.");
      await loadData();
    } catch (error: any) {
      setMessage(error?.response?.data?.message ?? error.message ?? "Đồng bộ SInvoice thất bại");
    } finally {
      setLoading(false);
    }
  }


  async function handleSyncTax(direction: "IN" | "OUT") {
    setLoading(true);
    setMessage(direction === "IN" ? "Đang đồng bộ hóa đơn mua vào từ cổng thuế..." : "Đang đồng bộ hóa đơn bán ra từ cổng thuế...");
    try {
      const result = await syncTaxPortalApi({ direction });
      setMessage(`Đồng bộ ${result.count} hóa đơn ${direction === "IN" ? "mua vào" : "bán ra"} thành công (${result.note})`);
      await loadData();
      setActiveTab(direction === "IN" ? "input" : "output");
    } catch (error: any) {
      setMessage(error?.response?.data?.message ?? error.message ?? "Đồng bộ cổng thuế thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSinvoiceConfig() {
    setLoading(true);
    setMessage("Đang lưu cấu hình SInvoice...");
    try {
      const result = await saveConfigApi(sinvoiceForm);
      const connection = result?.connection;
      setMessage(
        connection?.ok
          ? `Lưu cấu hình SInvoice thành công. ${connection.message}`
          : `Lưu cấu hình SInvoice thành công nhưng kiểm tra kết nối thất bại. ${connection?.message ?? "Không có phản hồi test kết nối."}`,
      );
      await loadData();
    } catch (error: any) {
      setMessage(error?.response?.data?.message ?? error.message ?? "Lưu cấu hình SInvoice thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSinvoiceConfig() {
    if (!window.confirm("Bạn có chắc muốn xóa cấu hình SInvoice hiện tại?")) return;
    setLoading(true);
    setMessage("Đang xóa cấu hình SInvoice...");
    try {
      await resetConfigApi();
      setMessage("Xóa cấu hình SInvoice thành công.");
      await loadData();
    } catch (error: any) {
      setMessage(error?.response?.data?.message ?? error.message ?? "Xóa cấu hình SInvoice thất bại");
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
      setMessage(error?.response?.data?.message ?? error.message ?? "Lưu cấu hình cổng thuế thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetTaxPortalConfig() {
    if (!window.confirm("Bạn có chắc muốn xóa cấu hình cổng thuế hiện tại?")) return;
    setLoading(true);
    setMessage("Đang xóa cấu hình cổng thuế...");
    try {
      await resetTaxPortalConfigApi();
      setMessage("Xóa cấu hình cổng thuế thành công.");
      await loadData();
    } catch (error: any) {
      setMessage(error?.response?.data?.message ?? error.message ?? "Xóa cấu hình cổng thuế thất bại");
    } finally {
      setLoading(false);
    }
  }

  function renderTable(invoices: Einvoice[], mode: "issue" | "output" | "input") {
    const partnerHeader = mode === "input" ? "Người bán" : "Khách hàng";
    const taxHeader = mode === "input" ? "MST người bán" : "MST";
    return (
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Mã chứng từ</TableHead>
              <TableHead>Số hóa đơn</TableHead>
              <TableHead>Nguồn</TableHead>
              <TableHead>{partnerHeader}</TableHead>
              <TableHead>{taxHeader}</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right pr-6">Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  {loading ? "Đang tải..." : "Chưa có dữ liệu"}
                </TableCell>
              </TableRow>
            )}
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="pl-6 font-medium">{inv.document_no || "-"}</TableCell>
                <TableCell>{inv.invoice_no || "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{inv.source === "TAX_PORTAL" ? "Cổng thuế" : "SInvoice"}</Badge>
                </TableCell>
                <TableCell>{mode === "input" ? inv.seller_name || "-" : inv.buyer_name || "-"}</TableCell>
                <TableCell>{mode === "input" ? inv.seller_tax_code || "-" : inv.buyer_tax_code || "-"}</TableCell>
                <TableCell className="text-right">{formatMoney(inv.total_amount)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(inv.status)}>{statusLabel(inv.status)}</Badge>
                </TableCell>
                <TableCell className="text-right pr-6 text-xs text-muted-foreground">
                  {inv.tax_status || inv.error_message || inv.external_invoice_id || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title={t("nav.items.hoadondientu")}
        desc={config ? `Trung tâm quản lý thuế • SInvoice ${config.environment} • ${config.supplierTaxCode}` : "Quản lý tập trung xuất hóa đơn, hóa đơn đầu ra/đầu vào và cấu hình thuế"}
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
            <BtnPrimary onClick={() => setActiveTab("config")} disabled={loading}>
              <Settings className="mr-2 h-4 w-4" /> Mở cấu hình
            </BtnPrimary>
          </div>
        }
      />

      {message && <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KpiCard label="Đã phát hành/đồng bộ" value={String(stats.issued)} icon={<FileText />} />
        <KpiCard label="Hóa đơn bán ra" value={String(stats.output)} icon={<Send />} />
        <KpiCard label="Hóa đơn mua vào" value={String(stats.input)} icon={<RefreshCw />} />
        <KpiCard label="Nguồn cổng thuế" value={String(stats.taxPortal)} icon={<Settings />} />
        <KpiCard label="Lỗi" value={String(stats.error)} icon={<Trash2 />} warn />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border">
        {TAB_LABELS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-t-lg border px-4 py-2 text-sm font-medium ${active ? "border-border border-b-surface bg-surface text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "issue" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold">Xuất hóa đơn điện tử nháp</h3>
                <p className="text-sm text-muted-foreground">
                  Luồng hiện tại chỉ cho phép lưu nháp nội bộ để kiểm tra trước. Tính năng ký/phát hành đang tạm ẩn.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="flex items-center px-3 py-1.5 border border-border rounded-md text-sm font-medium bg-surface hover:bg-surface-hover disabled:opacity-60"
                  onClick={handleSyncSinvoice}
                  disabled={loading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Đồng bộ SInvoice
                </button>
                <BtnPrimary onClick={() => setDraftModalOpen(true)} disabled={loading}>
                  <Send className="mr-2 h-4 w-4" /> Tạo hóa đơn nháp mới
                </BtnPrimary>
              </div>
            </div>
          </div>
          {renderTable(issueInvoices, "issue")}
        </div>
      )}

      {activeTab === "output" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <BtnPrimary onClick={() => handleSyncTax("OUT")} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> Đồng bộ hóa đơn bán ra từ cổng thuế
            </BtnPrimary>
          </div>
          {renderTable(outputInvoices, "output")}
        </div>
      )}

      {activeTab === "input" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <BtnPrimary onClick={() => handleSyncTax("IN")} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> Đồng bộ hóa đơn mua vào từ cổng thuế
            </BtnPrimary>
          </div>
          {renderTable(inputInvoices, "input")}
        </div>
      )}

      {activeTab === "config" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold">Cấu hình SInvoice</h3>
              <p className="text-sm text-muted-foreground">Dùng để xuất hóa đơn điện tử Viettel SInvoice.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Môi trường</label>
              <select
                className="w-full px-3 py-2 bg-background border border-border rounded-md"
                value={sinvoiceForm.environment}
                onChange={(e) => setSinvoiceForm({ ...sinvoiceForm, environment: e.target.value })}
              >
                <option value="demo">Demo</option>
                <option value="production">Production</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mã số thuế</label>
              <input className="w-full px-3 py-2 bg-background border border-border rounded-md" value={sinvoiceForm.supplierTaxCode} onChange={(e) => setSinvoiceForm({ ...sinvoiceForm, supplierTaxCode: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input className="w-full px-3 py-2 bg-background border border-border rounded-md" value={sinvoiceForm.username} onChange={(e) => setSinvoiceForm({ ...sinvoiceForm, username: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input type="password" className="w-full px-3 py-2 bg-background border border-border rounded-md" value={sinvoiceForm.password} onChange={(e) => setSinvoiceForm({ ...sinvoiceForm, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">API URL</label>
              <input className="w-full px-3 py-2 bg-background border border-border rounded-md" value={sinvoiceForm.apiUrl} onChange={(e) => setSinvoiceForm({ ...sinvoiceForm, apiUrl: e.target.value })} />
            </div>
            <div className="flex justify-between gap-2">
              <button className="px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 text-sm font-medium" onClick={handleResetSinvoiceConfig} disabled={loading}>Xóa / Reset</button>
              <BtnPrimary onClick={handleSaveSinvoiceConfig} disabled={loading}>Lưu cấu hình SInvoice</BtnPrimary>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold">Cấu hình cổng thuế</h3>
              <p className="text-sm text-muted-foreground">Dùng để tra cứu hóa đơn mua vào/đầu ra từ tài khoản Tổng cục Thuế.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mã số thuế đăng nhập</label>
              <input className="w-full px-3 py-2 bg-background border border-border rounded-md" value={taxPortalForm.taxCode || ""} onChange={(e) => setTaxPortalForm({ ...taxPortalForm, taxCode: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input className="w-full px-3 py-2 bg-background border border-border rounded-md" value={taxPortalForm.username || ""} onChange={(e) => setTaxPortalForm({ ...taxPortalForm, username: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input type="password" className="w-full px-3 py-2 bg-background border border-border rounded-md" value={taxPortalForm.password || ""} onChange={(e) => setTaxPortalForm({ ...taxPortalForm, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Provider</label>
              <input className="w-full px-3 py-2 bg-background border border-border rounded-md" value={taxPortalForm.providerName || "VIETTEL_TAX_PORTAL"} onChange={(e) => setTaxPortalForm({ ...taxPortalForm, providerName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">API URL tích hợp</label>
              <input className="w-full px-3 py-2 bg-background border border-border rounded-md" value={taxPortalForm.apiUrl || ""} onChange={(e) => setTaxPortalForm({ ...taxPortalForm, apiUrl: e.target.value })} placeholder="Endpoint tích hợp thực tế nếu có" />
            </div>
            <div className="flex items-center gap-2">
              <input id="tax-portal-active" type="checkbox" checked={taxPortalForm.isActive ?? true} onChange={(e) => setTaxPortalForm({ ...taxPortalForm, isActive: e.target.checked })} />
              <label htmlFor="tax-portal-active" className="text-sm text-muted-foreground">Kích hoạt cấu hình cổng thuế</label>
            </div>
            <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
              {taxPortalConfig?.username ? `Đã có cấu hình cổng thuế cho MST ${taxPortalConfig.taxCode || "-"}.` : "Chưa có cấu hình cổng thuế trong hệ thống."}
            </div>
            <div className="flex justify-between gap-2">
              <button className="px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 text-sm font-medium" onClick={handleResetTaxPortalConfig} disabled={loading}>Xóa / Reset</button>
              <BtnPrimary onClick={handleSaveTaxPortalConfig} disabled={loading}>Lưu cấu hình cổng thuế</BtnPrimary>
            </div>
          </div>
        </div>
      )}
      <SinvoiceDraftModal
        open={draftModalOpen}
        onClose={() => setDraftModalOpen(false)}
        onSaved={handleDraftSaved}
      />
    </div>
  );
};

export default HoaDonDienTu;
