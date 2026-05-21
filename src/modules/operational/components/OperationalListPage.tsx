import { useEffect, useMemo, useState } from "react";
import {
  operationalApi,
  type OperationalDocument,
} from "../api/operationalApi";

type Variant =
  | "sales"
  | "purchase"
  | "expenses"
  | "receivables"
  | "payables"
  | "inventory";

const variantConfig: Record<
  Variant,
  { title: string; desc: string; cta?: string }
> = {
  sales: {
    title: "Bán hàng / Đơn sửa xe",
    desc: "Nguồn ERP, KGARA, Vinfast DMS. Công nợ phải thu sinh từ chứng từ gốc.",
    cta: "Tạo đơn sửa xe mẫu",
  },
  purchase: {
    title: "Mua hàng nhập kho",
    desc: "Phụ tùng, nguyên vật liệu; có thể định kỳ và trigger nhập kho.",
    cta: "Tạo đơn mua mẫu",
  },
  expenses: {
    title: "Chi phí vận hành",
    desc: "Điện nước, thuê máy in, dịch vụ; không qua kho, có thể định kỳ/chưa hóa đơn.",
    cta: "Tạo chi phí mẫu",
  },
  receivables: {
    title: "Công nợ phải thu mới",
    desc: "Tổng hợp từ đơn sửa xe/bán hàng, không nhập công nợ trực tiếp.",
  },
  payables: {
    title: "Công nợ phải trả mới",
    desc: "Tổng hợp từ đơn mua hàng và chi phí vận hành; link phiếu Dòng tiền.",
  },
  inventory: {
    title: "Kho",
    desc: "Nhập kho từ đơn mua, xuất kho vào đơn sửa xe; tồn theo chi nhánh.",
  },
};

function money(value: unknown) {
  const n = Number(value || 0);
  return n.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

function docNo(row: OperationalDocument) {
  return row.order_no || row.purchase_no || row.expense_no || "—";
}

function partner(row: OperationalDocument) {
  return (
    row.customer_name_snapshot || row.supplier_name_snapshot || row.title || "—"
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

export function OperationalListPage({ variant }: { variant: Variant }) {
  const [items, setItems] = useState<OperationalDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const config = variantConfig[variant];

  const loader = useMemo(() => {
    if (variant === "sales") return operationalApi.listSales;
    if (variant === "purchase") return operationalApi.listPurchases;
    if (variant === "expenses") return operationalApi.listExpenses;
    if (variant === "receivables") return operationalApi.listReceivables;
    if (variant === "payables") return operationalApi.listPayables;
    return null;
  }, [variant]);

  async function load() {
    if (!loader) return;
    setLoading(true);
    setError(null);
    try {
      const data = await loader({
        page: 1,
        pageSize: 50,
        search: search || undefined,
      });
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [loader]);

  async function createSample() {
    setLoading(true);
    setError(null);
    try {
      if (variant === "sales") {
        await operationalApi.createSales({
          source_system: "ERP",
          customer_name_snapshot: "Khách hàng mẫu",
          vehicle_plate: "51A-000.00",
          status: "CONFIRMED",
          invoice_status: "NO_INVOICE",
          total_amount: 1500000,
          lines: [
            {
              line_type: "SERVICE",
              item_name: "Dịch vụ sửa chữa mẫu",
              qty: 1,
              unit_price: 1500000,
            },
          ],
        });
      } else if (variant === "purchase") {
        await operationalApi.createPurchase({
          supplier_name_snapshot: "Nhà cung cấp mẫu",
          status: "CONFIRMED",
          invoice_status: "NO_INVOICE",
          recurrence_type: "ONE_TIME",
          total_amount: 2500000,
          lines: [{ item_name: "Phụ tùng mẫu", qty: 2, unit_price: 1250000 }],
        });
      } else if (variant === "expenses") {
        await operationalApi.createExpense({
          supplier_name_snapshot: "NCC dịch vụ mẫu",
          title: "Chi phí vận hành mẫu",
          expense_category: "UTILITY",
          status: "CONFIRMED",
          recurrence_type: "MONTHLY",
          auto_generate_next: true,
          total_amount: 800000,
          lines: [{ description: "Điện/nước/internet mẫu", amount: 800000 }],
        });
      }
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không tạo được chứng từ mẫu",
      );
    } finally {
      setLoading(false);
    }
  }

  if (variant === "inventory") {
    return (
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">{config.title}</h1>
          <p className="text-sm text-muted-foreground">{config.desc}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="font-medium">MVP kho đã có DB/API nền</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Các bảng `inventory_items` và `inventory_transactions` đã tạo. UI
            nhập/xuất chi tiết sẽ nối tiếp sau khi chốt form phiếu kho.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{config.title}</h1>
          <p className="text-sm text-muted-foreground">{config.desc}</p>
        </div>
        {config.cta && (
          <button
            className="btn-primary"
            onClick={createSample}
            disabled={loading}
          >
            {config.cta}
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Tìm số chứng từ, đối tác, ghi chú..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void load();
          }}
        />
        <button
          className="btn-secondary"
          onClick={() => void load()}
          disabled={loading}
        >
          Tải lại
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-3 border-b border-border px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
          <div>Chứng từ</div>
          <div>Đối tác/Nội dung</div>
          <div>Ngày</div>
          <div>Tổng tiền</div>
          <div>Còn mở</div>
          <div>Trạng thái</div>
        </div>
        {loading && (
          <div className="p-4 text-sm text-muted-foreground">Đang tải...</div>
        )}
        {!loading && items.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">
            Chưa có dữ liệu.
          </div>
        )}
        {!loading &&
          items.map((row) => (
            <div
              key={`${row.document_type || variant}-${row.id}`}
              className="grid grid-cols-[1.1fr_1.3fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-3 border-b border-border/60 px-4 py-3 text-sm last:border-b-0"
            >
              <div>
                <div className="font-medium">{docNo(row)}</div>
                <div className="mt-1 flex gap-1">
                  <Badge>
                    {row.source_system || row.document_type || "ERP"}
                  </Badge>
                </div>
              </div>
              <div>
                <div>{partner(row)}</div>
                {row.vehicle_plate && (
                  <div className="text-xs text-muted-foreground">
                    Xe: {row.vehicle_plate}
                  </div>
                )}
              </div>
              <div>{row.document_date || "—"}</div>
              <div>{money(row.total_amount)}</div>
              <div>{money(row.open_amount)}</div>
              <div className="space-y-1">
                <Badge>{row.status}</Badge>
                <Badge>{row.payment_status}</Badge>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
