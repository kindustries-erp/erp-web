import React, { useState, useEffect } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { useT } from "@/core/i18n";
import { Loader2 } from "lucide-react";
import { SearchInput } from "@/shared/components/SearchInput";
import { manufacturingApi, type AsBuiltBomItem } from "../api/manufacturingApi";
import { formatGMT7 } from "@/shared/utils/format";

export interface AsBuiltBomDrawerProps {
  open: boolean;
  onClose: () => void;
  vehicleId: string | null;
  vehicleLabel: string;
}

export function AsBuiltBomDrawer({
  open,
  onClose,
  vehicleId,
  vehicleLabel,
}: AsBuiltBomDrawerProps) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AsBuiltBomItem[]>([]);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    if (!vehicleId) return;
    try {
      setLoading(true);
      const res = await manufacturingApi.getAsBuiltBom(vehicleId);
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && vehicleId) {
      loadData();
    } else {
      setItems([]);
      setSearch("");
    }
  }, [open, vehicleId]);

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={t("Chi tiết linh kiện (As-Built BOM)")}
      subtitle={vehicleLabel ? `${t("Xe")}: ${vehicleLabel}` : undefined}
      layout="1-column"
      size="lg"
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
              placeholder={t("Tìm theo mã phụ tùng, tên, số seri...")}
              className="w-full"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center text-gray-500 py-8 bg-white border rounded-md">
                {t("Chưa có linh kiện nào được lắp ráp")}
              </div>
            ) : (
              (() => {
                const q = search.toLowerCase();
                const filtered = items.filter((item) => {
                  const s = item.serial;
                  if (!s) return false;
                  return (
                    (s.sku || "").toLowerCase().includes(q) ||
                    (s.item_name || "").toLowerCase().includes(q) ||
                    (s.serial_no || "").toLowerCase().includes(q)
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center text-gray-500 py-8 bg-white border rounded-md">
                      {t("Không tìm thấy kết quả phù hợp")}
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
                            {t("Mã VT (SKU)")}
                          </th>
                          <th className="px-4 py-2 font-medium text-gray-600">
                            {t("Tên linh kiện")}
                          </th>
                          <th className="px-4 py-2 font-medium text-gray-600">
                            {t("Số seri")}
                          </th>
                          <th className="px-4 py-2 font-medium text-gray-600">
                            {t("Nguồn gán")}
                          </th>
                          <th className="px-4 py-2 font-medium text-gray-600">
                            {t("Thời gian gán")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filtered.map((item, idx) => {
                          const s = item.serial;
                          return (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-gray-500">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-2 font-medium">
                                {s?.sku || "-"}
                              </td>
                              <td className="px-4 py-2 text-gray-600">
                                {s?.item_name || "-"}
                              </td>
                              <td className="px-4 py-2 font-medium text-gray-800">
                                {s?.serial_no || "-"}
                              </td>
                              <td className="px-4 py-2">
                                <span className="inline-block px-2 py-0.5 text-[11px] rounded-full bg-blue-100 text-blue-800">
                                  {item.assignment_source}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-gray-500 text-xs">
                                {item.assigned_at
                                  ? formatGMT7(item.assigned_at, "datetime-sec")
                                  : "-"}
                              </td>
                            </tr>
                          );
                        })}
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
