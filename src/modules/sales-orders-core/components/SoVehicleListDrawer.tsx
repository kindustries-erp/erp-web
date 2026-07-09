import React, { useState, useEffect } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { useT } from "@/core/i18n";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import { Loader2 } from "lucide-react";
import { SearchInput } from "@/shared/components/SearchInput";

export interface SoVehicleListDrawerProps {
  open: boolean;
  onClose: () => void;
  lineId: string;
}

export function SoVehicleListDrawer({
  open,
  onClose,
  lineId,
}: SoVehicleListDrawerProps) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [serials, setSerials] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await inventoryCoreApi.listSerials({
        salesOrderLineId: lineId,
        pageSize: 1000,
      });
      setSerials(res.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && lineId) {
      loadData();
    }
  }, [open, lineId]);

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={t("Danh sách Serial/Xe đã chọn")}
      layout="1-column"
      size="md"
      actions={[
        {
          label: t("Đóng"),
          onClick: onClose,
          variant: "outline",
        },
      ]}
      leftPanel={
        <div className="h-full flex flex-col p-4 bg-gray-50">
          <div className="mb-4">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t("Tìm theo số seri, số khung, số máy...")}
              className="w-full"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
              </div>
            ) : serials.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {t("Không có dữ liệu")}
              </div>
            ) : (
              (() => {
                const q = search.toLowerCase();
                const filtered = serials.filter(
                  (s) =>
                    (s.serialNo || "").toLowerCase().includes(q) ||
                    (s.vinNo || "").toLowerCase().includes(q) ||
                    (s.engineNo || "").toLowerCase().includes(q),
                );
                if (filtered.length === 0) {
                  return (
                    <div className="text-center text-gray-500 py-8">
                      {t("Không tìm thấy kết quả nào")}
                    </div>
                  );
                }
                return (
                  <div className="border rounded-md overflow-hidden bg-white">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-2 font-medium text-gray-600">
                            STT
                          </th>
                          <th className="px-4 py-2 font-medium text-gray-600">
                            {t("Số seri")}
                          </th>
                          <th className="px-4 py-2 font-medium text-gray-600">
                            {t("Số khung (VIN)")}
                          </th>
                          <th className="px-4 py-2 font-medium text-gray-600">
                            {t("Số máy")}
                          </th>
                          <th className="px-4 py-2 font-medium text-gray-600">
                            {t("Trạng thái")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filtered.map((s, idx) => (
                          <tr key={s.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-500">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-2 font-medium">
                              {s.serialNo}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {s.vinNo || "-"}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {s.engineNo || "-"}
                            </td>
                            <td className="px-4 py-2">
                              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                                {t(s.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      }
    />
  );
}
