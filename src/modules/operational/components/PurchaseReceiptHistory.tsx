import { useState, useMemo } from "react";
import { useT } from "@/core/i18n";
import { type ErpPoReceipt } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { SearchInput } from "@/shared/components/SearchInput";
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";
import { GoodsReceiptViewDrawer } from "@/modules/goods-receipts-core/components/GoodsReceiptViewDrawer";

function normalizeDateTime(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd} ${hh}:${min}`;
}

export function PurchaseReceiptHistory({
  receipts,
}: {
  receipts: ErpPoReceipt[];
}) {
  const t = useT();
  const [receiptSearch, setReceiptSearch] = useState("");
  const [receiptSortConfig, setReceiptSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [viewingReceiptId, setViewingReceiptId] = useState<string | null>(null);

  const filteredReceipts = useMemo(() => {
    let result = [...receipts];
    if (receiptSearch) {
      const q = receiptSearch.toLowerCase();
      result = result.filter((r) => r.receiptNo?.toLowerCase().includes(q));
    }
    if (receiptSortConfig) {
      const { key, direction } = receiptSortConfig;
      result.sort((a, b) => {
        let aVal = "";
        let bVal = "";
        if (key === "receiptNo") {
          aVal = a.receiptNo || "";
          bVal = b.receiptNo || "";
        }
        if (key === "time") {
          aVal = a.createdAt || a.receiptDate || "";
          bVal = b.createdAt || b.receiptDate || "";
        }
        if (aVal < bVal) return direction === "asc" ? -1 : 1;
        if (aVal > bVal) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [receipts, receiptSearch, receiptSortConfig]);

  const handleReceiptSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";
    if (receiptSortConfig?.key === key) {
      if (receiptSortConfig.direction === "asc") direction = "desc";
      else direction = null;
    }
    setReceiptSortConfig(direction ? { key, direction } : null);
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="font-semibold text-sm sm:text-base text-foreground whitespace-nowrap shrink-0">
          {t("Lịch sử nhập kho")} (
          {receiptSearch
            ? `${filteredReceipts.length}/${receipts.length}`
            : receipts.length}
          )
        </div>
        <SearchInput
          className="w-full sm:w-48"
          placeholder={t("Tìm mã phiếu...")}
          value={receiptSearch}
          onChange={setReceiptSearch}
        />
      </div>
      {receipts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground text-center">
          {t("Chưa có lịch sử nhập.")}
        </div>
      ) : (
        <div className="w-full overflow-x-auto max-h-[300px]">
          <DocumentLineTable
            columns={[
              {
                key: "index",
                header: "#",
                width: 40,
                align: "center",
                cell: (_, idx) => (
                  <span className="text-muted-foreground">{idx + 1}</span>
                ),
              },
              {
                key: "receiptNo",
                header: t("Mã phiếu"),
                minWidth: 100,
                sortable: true,
                cell: (receipt: ErpPoReceipt) => (
                  <span
                    className="font-medium text-primary cursor-pointer hover:underline whitespace-nowrap"
                    onClick={() => setViewingReceiptId(receipt.id)}
                  >
                    {receipt.receiptNo}
                  </span>
                ),
              },
              {
                key: "time",
                header: t("Thời gian"),
                minWidth: 140,
                sortable: true,
                cell: (receipt: ErpPoReceipt) => {
                  const dt = receipt.createdAt
                    ? normalizeDateTime(receipt.createdAt)
                    : receipt.receiptDate
                      ? receipt.receiptDate.slice(0, 10)
                      : "—";
                  if (!dt || dt === "—")
                    return (
                      <span className="text-muted-foreground whitespace-nowrap">
                        —
                      </span>
                    );
                  const [d, time] = dt.split(" ");
                  if (!time)
                    return (
                      <span className="font-semibold text-foreground whitespace-nowrap">
                        {d}
                      </span>
                    );
                  return (
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground whitespace-nowrap">
                        {d}
                      </span>
                      <span className="text-xs text-[color:var(--muted-fg)] whitespace-nowrap">
                        {time}
                      </span>
                    </div>
                  );
                },
              },
            ]}
            data={filteredReceipts}
            getRowKey={(receipt) => receipt.id}
            viewOnly={true}
            sortConfig={receiptSortConfig}
            onSort={handleReceiptSort}
          />
        </div>
      )}
      <GoodsReceiptViewDrawer
        open={!!viewingReceiptId}
        receiptId={viewingReceiptId}
        onClose={() => setViewingReceiptId(null)}
      />
    </div>
  );
}
