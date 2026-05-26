import { useEffect, useState } from "react";
import {
  manufacturingApi,
  type ErpItem,
} from "@/modules/manufacturing/api/manufacturingApi";

export function MfgItems() {
  const [rows, setRows] = useState<ErpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await manufacturingApi.listItems({
          page: 1,
          pageSize: 50,
        });
        setRows((data as any).data ?? []);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Không thể tải danh sách linh kiện",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold">Danh mục linh kiện</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý mã linh kiện, thành phẩm và tracking type (NONE / LOT /
          SERIAL).
        </p>
      </div>
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="border-b px-4 py-3 font-medium">
          Danh sách linh kiện
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3">Đơn vị</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4" colSpan={6}>
                    Đang tải...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-4" colSpan={6}>
                    Chưa có linh kiện nào.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{row.item_code}</td>
                    <td className="px-4 py-3">{row.item_name}</td>
                    <td className="px-4 py-3">{row.item_type}</td>
                    <td className="px-4 py-3">{row.tracking_type}</td>
                    <td className="px-4 py-3">{row.uom || "-"}</td>
                    <td className="px-4 py-3">
                      {row.is_active ? "Hoạt động" : "Tắt"}
                    </td>
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
