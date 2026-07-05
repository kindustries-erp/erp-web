import { useEffect, useState } from "react";
import { useT } from "@/core/i18n";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import type { InventorySerialRow } from "@/modules/inventory-core/api/inventoryCoreApi";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { SearchInput } from "@/shared/components/SearchInput";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { TablePagination } from "@/shared/components/TablePagination";

interface SerialPickerProps {
  itemId: string;
  trackingPolicyId: string;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function SerialPicker({
  itemId,
  trackingPolicyId,
  value,
  onChange,
  disabled,
  readOnly,
}: SerialPickerProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [serials, setSerials] = useState<InventorySerialRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;

  // Local selection state inside the modal
  const [localSelection, setLocalSelection] = useState<Set<string>>(
    new Set(value),
  );

  useEffect(() => {
    if (open) {
      setLocalSelection(new Set(value));
      setPage(1);
      setSearch("");
    }
  }, [open, value]);

  useEffect(() => {
    let active = true;
    if (!itemId || trackingPolicyId === "NONE" || !open) return;

    const fetchSerials = async () => {
      setLoading(true);
      try {
        // Fetch available serials
        const res = await inventoryCoreApi.listSerials({
          itemId,
          status: "IN_STOCK",
          pageSize,
          page,
          search,
        });

        // Also fetch selected serials if they might not be IN_STOCK (e.g. RESERVED)
        // Only do this on page 1 and if we have values and no search (for simplicity)
        if (value.length > 0 && page === 1 && !search) {
          const selectedRes = await inventoryCoreApi.listSerials({
            itemId,
            ids: value,
            pageSize: 1000,
          });

          if (active) {
            // Merge unique serials
            const map = new Map<string, InventorySerialRow>();
            selectedRes.items.forEach((s) => map.set(s.id, s));
            res.items.forEach((s) => map.set(s.id, s));

            // Sort selected first
            const merged = Array.from(map.values()).sort((a, b) => {
              const aSelected = value.includes(a.id);
              const bSelected = value.includes(b.id);
              if (aSelected && !bSelected) return -1;
              if (!aSelected && bSelected) return 1;
              return 0;
            });

            setSerials(merged);
            // Rough total estimation
            setTotal(Math.max(res.total, merged.length));
          }
        } else {
          if (active) {
            setSerials(res.items);
            setTotal(res.total);
          }
        }
      } catch (err) {
        console.error("Failed to load serials", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(fetchSerials, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [itemId, trackingPolicyId, search, page, open, value]);

  if (!itemId || trackingPolicyId === "NONE") {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const handleToggle = (id: string) => {
    setLocalSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    setLocalSelection((prev) => {
      const next = new Set(prev);
      const allSelected = serials.every((s) => next.has(s.id));
      if (allSelected) {
        serials.forEach((s) => next.delete(s.id));
      } else {
        serials.forEach((s) => next.add(s.id));
      }
      return next;
    });
  };

  const isAllSelected =
    serials.length > 0 && serials.every((s) => localSelection.has(s.id));
  const isSomeSelected = serials.some((s) => localSelection.has(s.id));

  return (
    <>
      <div className="flex items-center gap-2 h-9 px-1 whitespace-nowrap flex-nowrap">
        {value.length > 0 ? (
          <div className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-md">
            {value.length} {t("serial đã chọn")}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            {t("Chưa chọn serial")}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setOpen(true)}
          disabled={disabled || readOnly}
        >
          {value.length > 0 ? t("Chỉnh sửa") : t("Chọn Serial")}
        </Button>
      </div>

      <DrawerModal
        open={open}
        onClose={() => setOpen(false)}
        title={t("Chọn Serial / Số khung")}
        subtitle={t("Tìm kiếm và chọn các mã serial cho dòng hàng")}
        panelClassName="max-w-4xl w-full"
        actions={[
          {
            label: t("Hủy"),
            onClick: () => setOpen(false),
            variant: "outline",
          },
          {
            label: `${t("Xác nhận")} (${localSelection.size})`,
            primary: true,
            onClick: () => {
              onChange(Array.from(localSelection));
              setOpen(false);
            },
          },
        ]}
      >
        <div className="flex flex-col h-full space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t("Tìm theo serial, số khung, số máy...")}
              className="w-80"
            />
            <div className="text-sm text-muted-foreground">
              {t("Đã chọn")}:{" "}
              <span className="font-semibold text-foreground">
                {localSelection.size}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-auto border border-border rounded-md">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted sticky top-0 z-10 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 w-12 text-center border-b border-border">
                    <Checkbox
                      checked={
                        isAllSelected ||
                        (isSomeSelected ? "indeterminate" : false)
                      }
                      onCheckedChange={handleToggleAll}
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
                  <th className="px-4 py-3 font-medium border-b border-border">
                    {t("Trạng thái")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && serials.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      {t("Đang tải...")}
                    </td>
                  </tr>
                ) : serials.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      {t("Không tìm thấy serial nào")}
                    </td>
                  </tr>
                ) : (
                  serials.map((s) => (
                    <tr
                      key={s.id}
                      className={`hover:bg-muted/50 cursor-pointer transition-colors ${localSelection.has(s.id) ? "bg-primary/5" : ""}`}
                      onClick={() => handleToggle(s.id)}
                    >
                      <td
                        className="px-4 py-2.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={localSelection.has(s.id)}
                          onCheckedChange={() => handleToggle(s.id)}
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
                      <td className="px-4 py-2.5">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${s.status === "IN_STOCK" ? "bg-green-100 text-green-700 border border-green-200" : "bg-amber-100 text-amber-700 border border-amber-200"}`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pb-2">
            <div className="text-sm text-muted-foreground">
              {t("Hiển thị")} {serials.length} / {total}
            </div>
            <TablePagination
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={Math.ceil(total / pageSize)}
              onPage={setPage}
              onPageSize={() => {}}
              pageSizeOptions={[pageSize]}
            />
          </div>
        </div>
      </DrawerModal>
    </>
  );
}
