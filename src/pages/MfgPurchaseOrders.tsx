import { useEffect, useState } from "react";
import {
  manufacturingApi,
  type ErpPo,
  type PoImportResult,
} from "@/modules/manufacturing/api/manufacturingApi";
import { Button } from "@/shared/components/ui/Button";

export function MfgPurchaseOrders() {
  const [rows, setRows] = useState<ErpPo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<PoImportResult | null>(null);
  const [importing, setImporting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await manufacturingApi.listPos({ page: 1, pageSize: 20 });
      setRows((data as any).data ?? []);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Không thể tải danh sách PO manufacturing",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onPickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    setError(null);
    try {
      const result = await manufacturingApi.importPoExcel(file);
      setImportResult(result);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import PO thất bại");
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">PO linh kiện sản xuất</h1>
          <p className="text-sm text-muted-foreground">
            Download template mẫu, import Excel hàng loạt, theo dõi trạng thái
            DRAFT/CONFIRMED/PARTIAL/FULLY_RECEIVED.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => manufacturingApi.downloadPoTemplate()}>
            Download template PO
          </Button>
          <label className="inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent">
            {importing ? "Đang import..." : "Upload Excel PO"}
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={onPickFile}
              disabled={importing}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {importResult && (
        <div className="rounded-md border bg-muted/30 p-4 text-sm space-y-2">
          <div className="font-medium">Kết quả import PO</div>
          <div>Tổng dòng: {importResult.total_rows}</div>
          <div>PO tạo thành công: {importResult.success_pos}</div>
          <div>Dòng lỗi: {importResult.failed_rows}</div>
          {importResult.created_pos.length > 0 && (
            <div>
              <div className="font-medium">PO đã tạo:</div>
              <ul className="list-disc pl-5">
                {importResult.created_pos.map((po) => (
                  <li key={po.id}>
                    {po.po_no} — {po.line_count} dòng
                  </li>
                ))}
              </ul>
            </div>
          )}
          {importResult.errors.length > 0 && (
            <div>
              <div className="font-medium text-red-600">Danh sách lỗi:</div>
              <ul className="max-h-60 list-disc overflow-auto pl-5 text-red-700">
                {importResult.errors.map((err, idx) => (
                  <li key={`${err.row}-${err.field}-${idx}`}>
                    Dòng {err.row} / {err.field}: {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="border-b px-4 py-3 font-medium">
          Danh sách PO manufacturing
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3">PO No</th>
                <th className="px-4 py-3">Ngày CT</th>
                <th className="px-4 py-3">Ngày dự kiến nhận</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4" colSpan={5}>
                    Đang tải...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-4" colSpan={5}>
                    Chưa có PO manufacturing.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{row.po_no}</td>
                    <td className="px-4 py-3">
                      {row.document_date?.slice(0, 10) ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      {row.expected_receipt_date?.slice(0, 10) ?? "-"}
                    </td>
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3">{row.notes || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
