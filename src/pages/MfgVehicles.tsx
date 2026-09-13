import { useEffect, useState } from "react";
import {
  manufacturingApi,
  type ErpVehicle,
} from "@/modules/manufacturing/api/manufacturingApi";
import { AsBuiltBomDrawer } from "@/modules/manufacturing/components/AsBuiltBomDrawer";
import { Cpu } from "lucide-react";

export function MfgVehicles() {
  const [rows, setRows] = useState<ErpVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bomDrawerOpen, setBomDrawerOpen] = useState(false);
  const [bomVehicleId, setBomVehicleId] = useState<string | null>(null);
  const [bomVehicleLabel, setBomVehicleLabel] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await manufacturingApi.listVehicles({
          page: 1,
          pageSize: 50,
        });

        setRows((data as any).data ?? []);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Không thể tải danh sách VIN",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold">Xe thành phẩm / VIN</h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi VIN, số khung, số máy và trạng thái bảo hành/lắp ráp.
        </p>
      </div>
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="border-b px-4 py-3 font-medium">Danh sách xe</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3">VIN</th>
                <th className="px-4 py-3">Số khung</th>
                <th className="px-4 py-3">Số máy</th>
                <th className="px-4 py-3">Ngày lắp</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
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
                  <td
                    className="px-4 py-4 text-center text-muted-foreground"
                    colSpan={6}
                  >
                    Chưa có xe nào.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{row.vin}</td>
                    <td className="px-4 py-3">{row.frame_no}</td>
                    <td className="px-4 py-3">{row.engine_no}</td>
                    <td className="px-4 py-3">
                      {row.assembly_date?.slice(0, 10) ?? "-"}
                    </td>
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        title="Xem linh kiện As-Built"
                        onClick={() => {
                          setBomVehicleId(row.id);
                          setBomVehicleLabel(row.vin || row.frame_no || row.id);
                          setBomDrawerOpen(true);
                        }}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                      >
                        <Cpu className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AsBuiltBomDrawer
        open={bomDrawerOpen}
        onClose={() => setBomDrawerOpen(false)}
        vehicleId={bomVehicleId}
        vehicleLabel={bomVehicleLabel}
      />
    </div>
  );
}
