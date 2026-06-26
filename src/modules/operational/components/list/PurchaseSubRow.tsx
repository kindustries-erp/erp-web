import { useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useT } from "@/core/i18n";
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";
import { SearchInput } from "@/shared/components/SearchInput";
import { PurchaseReceiptHistory } from "@/modules/operational/components/PurchaseReceiptHistory";
import { operationalApi } from "@/modules/operational/api/operationalApi";
import { purchaseOrdersCoreApi } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import type { OperationalDocument } from "@/modules/operational/api/operationalApi";
import type {
  ErpPoReceipt,
  ErpPurchaseOrder,
} from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface PurchaseSubRowProps {
  rowId: string;
}

/**
 * Sub-row hiển thị chi tiết dòng + lịch sử nhập kho cho 1 đơn mua hàng.
 * Extracted từ OperationalListPage.tsx (dòng 353–608).
 */
export function PurchaseSubRow({ rowId }: PurchaseSubRowProps) {
  const [detail, setDetail] = useState<OperationalDocument | null>(null);
  const [poDetail, setPoDetail] = useState<ErpPurchaseOrder | null>(null);
  const [receipts, setReceipts] = useState<ErpPoReceipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailSearch, setDetailSearch] = useState("");
  const [detailSortConfig, setDetailSortConfig] = useState<SortConfig | null>(
    null,
  );
  const t = useT();

  const handleDetailSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";
    if (detailSortConfig?.key === key) {
      if (detailSortConfig.direction === "asc") direction = "desc";
      else direction = null;
    }
    setDetailSortConfig(direction ? { key, direction } : null);
  };

  const filteredLines = useMemo(() => {
    const srcLines = detail?.lines;
    if (!srcLines) return [];
    let lines = [...srcLines];
    if (detailSearch) {
      const q = detailSearch.toLowerCase();
      lines = lines.filter(
        (line) =>
          (line.item_code || "").toLowerCase().includes(q) ||
          (line.item_name || "").toLowerCase().includes(q) ||
          (line.description || "").toLowerCase().includes(q) ||
          String(line.qty || "").includes(q),
      );
    }
    if (detailSortConfig) {
      const { key, direction } = detailSortConfig;
      lines.sort((a, b) => {
        let aVal: string | number = "";
        let bVal: string | number = "";
        if (key === "itemCode") {
          aVal = a.item_code || "";
          bVal = b.item_code || "";
        }
        if (key === "itemName") {
          aVal = a.item_name || a.description || "";
          bVal = b.item_name || b.description || "";
        }
        if (key === "qtyOrdered") {
          aVal = Number(a.qty || 0);
          bVal = Number(b.qty || 0);
        }
        if (key === "qtyReceived") {
          const poLineA = poDetail?.lines?.find((l) => l.id === a.id);
          const poLineB = poDetail?.lines?.find((l) => l.id === b.id);
          aVal = Number(poLineA?.qtyReceived || 0);
          bVal = Number(poLineB?.qtyReceived || 0);
        }
        if (key === "qtyRemaining") {
          const poLineA = poDetail?.lines?.find((l) => l.id === a.id);
          const poLineB = poDetail?.lines?.find((l) => l.id === b.id);
          const aRcv = Number(poLineA?.qtyReceived || 0);
          const bRcv = Number(poLineB?.qtyReceived || 0);
          const aOrd = Number(a.qty || poLineA?.qtyOrdered || 0);
          const bOrd = Number(b.qty || poLineB?.qtyOrdered || 0);
          aVal = Math.max(0, aOrd - aRcv);
          bVal = Math.max(0, bOrd - bRcv);
        }
        if (aVal < bVal) return direction === "asc" ? -1 : 1;
        if (aVal > bVal) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return lines;
  }, [detail?.lines, detailSearch, detailSortConfig, poDetail?.lines]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const doc = await operationalApi.getDocument("purchase_orders", rowId);
        if (active) setDetail(doc);
        const po = await purchaseOrdersCoreApi.get(rowId);
        if (active) {
          setReceipts(po.receipts || []);
          setPoDetail(po);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        if (active) setError(t("Không tải được chi tiết dòng"));
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [rowId, t]);

  if (loading)
    return (
      <div className="rounded-xl bg-slate-50 dark:bg-zinc-950/50 p-8 flex items-center justify-center text-sm text-muted-foreground my-2 shadow-sm border border-border">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t("Đang tải chi tiết...")}
      </div>
    );
  if (error)
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 flex items-center justify-center text-sm text-red-700 my-2 shadow-sm">
        <AlertCircle className="mr-2 h-5 w-5" />
        {error}
      </div>
    );
  if (!detail) return null;

  return (
    <div className="rounded-xl bg-slate-50 dark:bg-zinc-950/50 p-4 md:p-6 my-2 shadow-sm border border-border flex flex-col md:flex-row gap-6">
      <div className="flex-1 min-w-0">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="font-semibold text-base text-foreground whitespace-nowrap shrink-0">
            {t("Chi tiết")} (
            {detailSearch
              ? `${filteredLines.length}/${detail?.lines?.length || 0}`
              : detail?.lines?.length || 0}
            )
          </div>
          <SearchInput
            className="w-full sm:w-64"
            placeholder={t("Tìm mã/tên linh kiện, SL...")}
            value={detailSearch}
            onChange={setDetailSearch}
          />
        </div>
        {!detail.lines || detail.lines.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
            {t("Không có dòng chi tiết.")}
          </div>
        ) : (
          <div className="w-full overflow-auto max-h-[300px]">
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
                  key: "itemCode",
                  header: t("Mã linh kiện"),
                  minWidth: 140,
                  sortable: true,
                  cell: (
                    line: NonNullable<OperationalDocument["lines"]>[number],
                  ) => line.item_code || "—",
                },
                {
                  key: "itemName",
                  header: t("Linh kiện / Tên hàng"),
                  minWidth: 260,
                  sortable: true,
                  cell: (
                    line: NonNullable<OperationalDocument["lines"]>[number],
                    idx: number,
                  ) => (
                    <div className="font-medium text-foreground">
                      {line.item_name ||
                        line.description ||
                        `${t("Dòng")} ${idx + 1}`}
                    </div>
                  ),
                },
                {
                  key: "qtyOrdered",
                  header: t("Số lượng"),
                  minWidth: 100,
                  align: "center",
                  sortable: true,
                  cell: (
                    line: NonNullable<OperationalDocument["lines"]>[number],
                  ) => (
                    <div className="font-medium text-foreground">
                      {Number(line.qty || 0).toLocaleString("vi-VN")}
                    </div>
                  ),
                },
                {
                  key: "qtyReceived",
                  header: t("Đã nhập"),
                  minWidth: 100,
                  align: "center",
                  sortable: true,
                  cell: (
                    line: NonNullable<OperationalDocument["lines"]>[number],
                    idx: number,
                  ) => {
                    const poLine = poDetail?.lines?.find(
                      (l, i) => l.id === line.id || i === idx,
                    );
                    const qtyReceived = Number(poLine?.qtyReceived || 0);
                    return (
                      <div className="font-medium text-emerald-600">
                        {qtyReceived.toLocaleString("vi-VN")}
                      </div>
                    );
                  },
                },
                {
                  key: "qtyRemaining",
                  header: t("Còn lại"),
                  minWidth: 100,
                  align: "center",
                  sortable: true,
                  cell: (
                    line: NonNullable<OperationalDocument["lines"]>[number],
                    idx: number,
                  ) => {
                    const poLine = poDetail?.lines?.find(
                      (l, i) => l.id === line.id || i === idx,
                    );
                    const qtyReceived = Number(poLine?.qtyReceived || 0);
                    const qtyOrdered = Number(
                      line.qty || poLine?.qtyOrdered || 0,
                    );
                    const qtyRemaining = Math.max(0, qtyOrdered - qtyReceived);
                    return (
                      <div className="font-medium text-amber-600">
                        {qtyRemaining.toLocaleString("vi-VN")}
                      </div>
                    );
                  },
                },
              ]}
              data={filteredLines}
              getRowKey={(line, idx) => line.id || idx}
              viewOnly={true}
              sortConfig={detailSortConfig}
              onSort={handleDetailSort}
            />
          </div>
        )}
      </div>

      <div className="w-full md:w-80 lg:w-96 shrink-0 md:border-l md:border-border md:pl-6">
        <PurchaseReceiptHistory receipts={receipts} />
      </div>
    </div>
  );
}
