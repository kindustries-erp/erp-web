import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/Button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { money } from "@/shared/utils/format";
import { usePortalImport } from "../hooks/usePortalImport";

interface Props {
  onImported: (dir: "IN" | "OUT") => void;
}

export function PortalImportTab({ onImported }: Props) {
  const { t } = useTranslation("erpInvoices");
  const portal = usePortalImport();

  const allSelected =
    portal.items.length > 0 && portal.selected.size === portal.items.length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-4">
        <input
          type="password"
          value={portal.token}
          onChange={(e) => portal.setToken(e.target.value)}
          className="h-9 rounded-md border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          placeholder={t("tokenLabel", "Bearer token")}
        />
        <input
          type="date"
          value={portal.dateFrom}
          onChange={(e) => portal.setDateFrom(e.target.value)}
          className="h-9 rounded-md border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <input
          type="date"
          value={portal.dateTo}
          onChange={(e) => portal.setDateTo(e.target.value)}
          className="h-9 rounded-md border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <select
          value={portal.type}
          onChange={(e) =>
            portal.setType(e.target.value as "purchase" | "sale")
          }
          className="h-9 rounded-md border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="purchase">{t("purchaseType", "Mua vào (IN)")}</option>
          <option value="sale">{t("saleType", "Bán ra (OUT)")}</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => void portal.fetchList()}
          disabled={portal.loading}
        >
          {t("fetchList", "Lấy danh sách")}
        </Button>
      </div>

      {portal.items.length > 0 && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="overflow-auto">
            <Table className="min-w-[1400px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(v) =>
                        v ? portal.selectAll() : portal.deselectAll()
                      }
                    />
                  </TableHead>
                  <TableHead>Số HĐ</TableHead>
                  <TableHead>Ký hiệu</TableHead>
                  <TableHead>Ngày lập</TableHead>
                  <TableHead>Người bán</TableHead>
                  <TableHead>MST NB</TableHead>
                  <TableHead className="text-right">Trước thuế</TableHead>
                  <TableHead className="text-right">Thuế</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portal.items.map((item) => {
                  const key = `${item.shdon}__${item.khhdon ?? ""}`;
                  return (
                    <TableRow key={key}>
                      <TableCell>
                        <Checkbox
                          checked={portal.selected.has(key)}
                          onCheckedChange={() => portal.toggleSelect(key)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.shdon || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.khhdon || "—"}
                      </TableCell>
                      <TableCell>{item.tdlap || "—"}</TableCell>
                      <TableCell>{item.nbten || "—"}</TableCell>
                      <TableCell>{item.nbmst || "—"}</TableCell>
                      <TableCell className="text-right">
                        {fmtMoney(item.tgtcthue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmtMoney(item.tgtthue)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {fmtMoney(item.tgtttbso)}
                      </TableCell>
                      <TableCell>{fmtStatus(item.tthai)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 border-t border-border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <button
                className="underline"
                type="button"
                onClick={portal.selectAll}
              >
                {t("selectAll", "Chọn tất cả")}
              </button>
              <span>/</span>
              <button
                className="underline"
                type="button"
                onClick={portal.deselectAll}
              >
                {t("deselectAll", "Bỏ chọn tất cả")}
              </button>
            </div>
            <Button
              onClick={async () => {
                const res = await portal.importSelected();
                if (res) onImported(res.direction);
              }}
              disabled={portal.importLoading || portal.selected.size === 0}
            >
              {t("importToErp", "Nhập vào ERP")}
            </Button>
          </div>
        </div>
      )}

      {portal.result && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {t(
            "importSuccess",
            "Đã nhập {{imported}} hóa đơn, bỏ qua {{skipped}} trùng",
            portal.result,
          )}
        </div>
      )}
    </div>
  );
}

function fmtMoney(val: string | number | null | undefined) {
  if (val == null || val === "") return "—";
  const n = Number(val);
  return Number.isFinite(n) ? money(n) : "—";
}

function fmtStatus(val: string | number | null | undefined) {
  if (val === 1 || val === "1") return "Hợp lệ";
  if (val === 2 || val === "2") return "Hủy";
  return "Khác";
}
