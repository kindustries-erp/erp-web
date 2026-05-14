import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileText, RefreshCw, Send, Trash2 } from "lucide-react";
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
  createSinvoiceApi,
  getSinvoiceHealthApi,
  listLocalEinvoicesApi,
  runSinvoiceDemoFlowApi,
  syncSinvoiceApi,
  type Einvoice,
  type SinvoiceConfig,
} from "@/modules/accounting/api/sinvoiceApi";

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

const HoaDonDienTu: React.FC = () => {
  const t = useT();
  const [config, setConfig] = useState<SinvoiceConfig | null>(null);
  const [invoices, setInvoices] = useState<Einvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const [health, items] = await Promise.all([
        getSinvoiceHealthApi(),
        listLocalEinvoicesApi(),
      ]);
      setConfig(health);
      setInvoices(items);
    } catch (error: any) {
      setMessage(error?.response?.data?.message ?? error.message ?? "Không tải được dữ liệu SInvoice");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    return invoices.reduce(
      (acc, item) => {
        if (item.status === "ISSUED" || item.status === "SYNCED") acc.issued += 1;
        else if (item.status === "ERROR") acc.error += 1;
        else if (item.status === "CANCELLED") acc.cancelled += 1;
        else acc.draft += 1;
        return acc;
      },
      { issued: 0, draft: 0, cancelled: 0, error: 0 },
    );
  }, [invoices]);

  async function handleCreateDemo() {
    setLoading(true);
    setMessage("Đang phát hành hóa đơn demo tới Viettel SInvoice...");
    try {
      await createSinvoiceApi({});
      setMessage("Đã gọi API tạo hóa đơn demo. Kiểm tra bảng bên dưới để xem kết quả lưu log.");
      await loadData();
    } catch (error: any) {
      setMessage(error?.response?.data?.message ?? error.message ?? "Tạo hóa đơn demo thất bại");
      await loadData();
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setLoading(true);
    setMessage("Đang tra cứu danh sách hóa đơn trên Viettel demo...");
    try {
      await syncSinvoiceApi();
      setMessage("Tra cứu Viettel demo thành công.");
      await loadData();
    } catch (error: any) {
      setMessage(error?.response?.data?.message ?? error.message ?? "Đồng bộ Viettel demo thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function handleFullDemoFlow() {
    setLoading(true);
    setMessage("Đang chạy full demo flow: health -> create -> sync...");
    try {
      const result = await runSinvoiceDemoFlowApi();
      setMessage(result?.create?.ok === false ? `Demo flow hoàn tất một phần: ${result.create.message}` : "Demo flow hoàn tất.");
      await loadData();
    } catch (error: any) {
      setMessage(error?.response?.data?.message ?? error.message ?? "Full demo flow thất bại");
      await loadData();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title={t("nav.items.hoadondientu")}
        desc={config ? `SInvoice ${config.environment} • ${config.supplierTaxCode} • ${config.apiUrl}` : "Quản lý và phát hành hóa đơn SInvoice Viettel"}
        icon={<FileText className="h-4 w-4" />}
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              className="flex items-center px-3 py-1.5 border border-border rounded-md text-sm font-medium bg-surface hover:bg-surface-hover disabled:opacity-60"
              onClick={handleSync}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Đồng bộ
            </button>
            <button
              className="flex items-center px-3 py-1.5 border border-border rounded-md text-sm font-medium bg-surface hover:bg-surface-hover disabled:opacity-60"
              onClick={handleFullDemoFlow}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Test full demo flow
            </button>
            <BtnPrimary onClick={handleCreateDemo} disabled={loading}>
              <Send className="mr-2 h-4 w-4" /> Phát hành demo
            </BtnPrimary>
          </div>
        }
      />

      {message && <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Đã phát hành" value={String(stats.issued)} icon={<FileText />} />
        <KpiCard label="Bản nháp" value={String(stats.draft)} icon={<FileText />} />
        <KpiCard label="Bị hủy" value={String(stats.cancelled)} icon={<Trash2 />} />
        <KpiCard label="Lỗi" value={String(stats.error)} icon={<FileText />} warn />
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Mã chứng từ</TableHead>
              <TableHead>Số hóa đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>MST</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right pr-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  {loading ? "Đang tải..." : "Chưa có hóa đơn demo nào"}
                </TableCell>
              </TableRow>
            )}
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="pl-6 font-medium">{inv.document_no || "-"}</TableCell>
                <TableCell>{inv.invoice_no || "-"}</TableCell>
                <TableCell>{inv.buyer_name || "-"}</TableCell>
                <TableCell>{inv.buyer_tax_code || "-"}</TableCell>
                <TableCell className="text-right">{Number(inv.total_amount ?? 0).toLocaleString()} đ</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(inv.status)}>{statusLabel(inv.status)}</Badge>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2">
                    <button className="p-1.5 rounded-md hover:bg-surface-hover text-muted-foreground" title="Tải PDF" disabled={!inv.invoice_no}>
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-surface-hover text-red-500" title="Hủy hóa đơn" disabled={!inv.invoice_no}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default HoaDonDienTu;
