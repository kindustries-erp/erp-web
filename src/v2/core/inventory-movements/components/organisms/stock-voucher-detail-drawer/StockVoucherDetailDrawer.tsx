import {
  DrawerRow,
  DrawerSection,
  V2DrawerLayout,
  V2DrawerLinesTable,
  V2DrawerSize,
  V2StandardDrawer,
} from "@/v2/shared/components";
import type { V2DrawerLinesColumn } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useStockVoucherQuery } from "../../../api/queries/useStockVoucherQuery";
import type { StockVoucherLine } from "../../../domain/stockVoucher";
import { sumStockVoucherLines } from "../../../domain/stockVoucherRules";
import type { InventoryMovementsModuleConfig } from "../../../inventoryMovements.config.type";
import {
  StockVoucherStatusBadge,
  StockVoucherTypeBadge,
} from "../../molecules/stock-voucher-badges";

export interface StockVoucherDetailDrawerProps {
  config: InventoryMovementsModuleConfig;
  type: string;
  id: string;
  onClose: () => void;
}

const fmt = (value: number | null) =>
  value === null || value === undefined
    ? "—"
    : Number(value).toLocaleString("vi-VN");

/** Drawer xem chi tiết chỉ đọc của một chứng từ kho (đầu phiếu và các dòng hàng) */
export function StockVoucherDetailDrawer({
  config,
  type,
  id,
  onClose,
}: StockVoucherDetailDrawerProps) {
  const { t } = useV2Translation();
  const { data, isLoading } = useStockVoucherQuery({
    api: config.api,
    keys: config.keys,
    type,
    id,
  });
  const columns: V2DrawerLinesColumn[] = [
    {
      id: "itemCode",
      header: t("v2.inventoryMovements.lines.itemCode", "Mã hàng"),
      width: 130,
    },
    {
      id: "itemName",
      header: t("v2.inventoryMovements.lines.itemName", "Tên hàng"),
      grow: true,
      minWidth: 160,
      wrap: true,
    },
    {
      id: "unit",
      header: t("v2.inventoryMovements.lines.unit", "ĐVT"),
      width: 70,
    },
    {
      id: "qty",
      header: t("v2.inventoryMovements.lines.qty", "Số lượng"),
      width: 100,
      align: "right",
    },
    {
      id: "unitCost",
      header: t("v2.inventoryMovements.lines.unitCost", "Đơn giá"),
      width: 110,
      align: "right",
    },
    {
      id: "amount",
      header: t("v2.inventoryMovements.lines.amount", "Thành tiền"),
      width: 120,
      align: "right",
    },
  ];
  const cell = (col: V2DrawerLinesColumn, row: StockVoucherLine) => {
    if (col.id === "qty") return fmt(row.qty);
    if (col.id === "unitCost") return fmt(row.unitCost);
    if (col.id === "amount") return fmt(row.amount);
    return String(row[col.id as "itemCode" | "itemName" | "unit"] ?? "");
  };
  const lines = data?.lines ?? [];

  return (
    <V2StandardDrawer
      id={`stockVoucher-${id}`}
      open
      onClose={onClose}
      mode="view"
      title={
        data?.voucherNo ??
        t("v2.inventoryMovements.detail.title", "Chi tiết chứng từ")
      }
      titleExtra={
        data ? <StockVoucherStatusBadge status={data.status} /> : null
      }
      layout={V2DrawerLayout.TWO_COLUMNS}
      size={V2DrawerSize.XL}
      loading={isLoading}
      rightPanel={
        data ? (
          <DrawerSection
            title={t("v2.inventoryMovements.detail.general", "Thông tin chung")}
          >
            <DrawerRow
              label={t("v2.inventoryMovements.columns.type", "Loại phiếu")}
              value={
                <StockVoucherTypeBadge
                  type={type}
                  types={config.voucherTypes}
                />
              }
            />
            <DrawerRow
              label={t(
                "v2.inventoryMovements.columns.voucherDate",
                "Ngày phiếu",
              )}
              value={new Intl.DateTimeFormat("vi-VN").format(
                new Date(data.voucherDate),
              )}
            />
            <DrawerRow
              label={t("v2.inventoryMovements.columns.partnerName", "Đối tác")}
              value={data.partnerName || "—"}
            />
            <DrawerRow
              label={t("v2.inventoryMovements.columns.remarks", "Ghi chú")}
              value={data.remarks || "—"}
              multiline
            />
          </DrawerSection>
        ) : null
      }
    >
      <DrawerSection
        title={t("v2.inventoryMovements.detail.lines", "Dòng hàng")}
        count={lines.length}
      >
        <V2DrawerLinesTable<StockVoucherLine>
          ariaLabel={t("v2.inventoryMovements.detail.lines", "Dòng hàng")}
          columns={columns}
          rows={lines}
          getRowKey={(row) => row.id}
          renderCell={cell}
          footerLabel={t("v2.inventoryMovements.detail.total", "Tổng cộng")}
          footerCells={{ amount: fmt(sumStockVoucherLines(lines)) }}
          emptyLabel={t(
            "v2.inventoryMovements.detail.noLines",
            "Phiếu chưa có dòng hàng",
          )}
        />
      </DrawerSection>
    </V2StandardDrawer>
  );
}
