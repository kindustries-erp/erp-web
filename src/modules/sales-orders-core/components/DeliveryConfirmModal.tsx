import { useState, useEffect } from "react";
import { useT } from "@/core/i18n";
import {
  DrawerModal,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import { SearchInput } from "@/shared/components/SearchInput";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import type { InventorySerialRow } from "@/modules/inventory-core/api/inventoryCoreApi";

interface DeliveryConfirmModalProps {
  open: boolean;
  onClose: () => void;
  serialIds: string[];
  onConfirmSuccess?: () => void;
}

export function DeliveryConfirmModal({
  open,
  onClose,
  serialIds,
  onConfirmSuccess,
}: DeliveryConfirmModalProps) {
  const t = useT();
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serials, setSerials] = useState<InventorySerialRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSerials = serials.filter((s) => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    const v = s.vinNo?.toLowerCase() || "";
    const m = s.engineNo?.toLowerCase() || "";
    const n = s.serialNo?.toLowerCase() || "";
    return v.includes(term) || m.includes(term) || n.includes(term);
  });

  const isAllSelected =
    filteredSerials.length > 0 &&
    filteredSerials.every((s) => selectedIds.includes(s.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const filteredIds = new Set(filteredSerials.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const newIds = new Set(selectedIds);
      filteredSerials.forEach((s) => newIds.add(s.id));
      setSelectedIds(Array.from(newIds));
    }
  };

  useEffect(() => {
    let active = true;
    if (open && serialIds.length > 0) {
      inventoryCoreApi
        .listSerials({ ids: serialIds, pageSize: 100 })
        .then((res) => {
          if (active) {
            const deliverable = res.items.filter(
              (s) => s.status === "DELIVERING",
            );
            setSerials(deliverable);
            setSelectedIds(deliverable.map((s) => s.id));
          }
        })
        .catch(console.error);
    } else {
      setSerials([]);
      setSelectedIds([]);
    }
    return () => {
      active = false;
    };
  }, [open, serialIds]);

  const handleConfirm = async () => {
    if (!deliveryDate) {
      setError(t("Vui lòng chọn ngày giao hàng"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await inventoryCoreApi.confirmDeliveries({
        serialIds: selectedIds,
        deliveryDate,
        notes: notes.trim() || undefined,
      });
      if (onConfirmSuccess) onConfirmSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          t("Có lỗi xảy ra khi xác nhận giao hàng"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={t("Xác nhận giao hàng thực tế")}
      subtitle={`${t("Cập nhật ngày giao cho")} ${selectedIds.length} / ${serials.length} ${t("serial")}`}
      panelClassName="max-w-5xl w-full"
      actions={[
        {
          label: t("Hủy"),
          onClick: onClose,
          variant: "outline",
          disabled: saving,
        },
        {
          label: t("Xác nhận"),
          primary: true,
          onClick: handleConfirm,
          disabled: saving || selectedIds.length === 0,
        },
      ]}
    >
      <div className="flex flex-col md:flex-row gap-6 pt-4 h-[60vh] min-h-[450px]">
        {/* Left Column: Table */}
        <div className="flex-1 flex flex-col min-w-0 border border-border rounded-md overflow-hidden bg-white">
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t("Tìm kiếm số VIN, số máy...")}
              className="w-72"
            />
            <div className="text-sm text-muted-foreground">
              {t("Đã chọn")}:{" "}
              <span className="font-semibold text-foreground">
                {selectedIds.length}
              </span>{" "}
              / {filteredSerials.length}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted sticky top-0 z-10 text-xs uppercase text-muted-foreground shadow-sm">
                <tr>
                  <th className="px-4 py-3 w-12 text-center border-b border-border">
                    <Checkbox
                      checked={
                        isAllSelected ||
                        (selectedIds.length > 0 &&
                        selectedIds.length < filteredSerials.length
                          ? "indeterminate"
                          : false)
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium border-b border-border">
                    {t("Serial / Số khung")}
                  </th>
                  <th className="px-4 py-3 font-medium border-b border-border">
                    {t("Số VIN")}
                  </th>
                  <th className="px-4 py-3 font-medium border-b border-border">
                    {t("Số máy")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSerials.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      {t("Không tìm thấy kết quả")}
                    </td>
                  </tr>
                ) : (
                  filteredSerials.map((s) => {
                    const isSelected = selectedIds.includes(s.id);
                    return (
                      <tr
                        key={s.id}
                        className={`hover:bg-muted/50 cursor-pointer transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedIds((prev) =>
                              prev.filter((id) => id !== s.id),
                            );
                          } else {
                            setSelectedIds((prev) => [...prev, s.id]);
                          }
                        }}
                      >
                        <td
                          className="px-4 py-2.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (!checked) {
                                setSelectedIds((prev) =>
                                  prev.filter((id) => id !== s.id),
                                );
                              } else {
                                setSelectedIds((prev) => [...prev, s.id]);
                              }
                            }}
                          />
                        </td>
                        <td className="px-4 py-2.5 font-medium">
                          {s.serialNo || "-"}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {s.vinNo || "-"}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {s.engineNo || "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200 shadow-sm">
              {error}
            </div>
          )}
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200 shadow-sm">
            {t(
              "Lưu ý: Chỉ cập nhật ngày giao hàng thực tế, các thông tin khách hàng sẽ được cập nhật trong phân hệ Hậu mãi.",
            )}
          </div>

          <DrawerField label={t("Ngày giao hàng")} required>
            <DatePicker
              className={inputCls}
              value={deliveryDate}
              onChange={(v) => setDeliveryDate(v)}
              disabled={saving}
            />
          </DrawerField>

          <DrawerField label={t("Ghi chú")}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${inputCls} min-h-[120px]`}
              placeholder={t("Ghi chú thêm (nếu có)")}
              disabled={saving}
            />
          </DrawerField>
        </div>
      </div>
    </DrawerModal>
  );
}
