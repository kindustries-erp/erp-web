import * as React from "react";
import {
  DrawerSection,
  V2DrawerLayout,
  V2DrawerSize,
  V2StandardDrawer,
  V2Text,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { InventoryMovementsModuleConfig } from "../../../inventoryMovements.config.type";
import { StockVoucherDetailDrawer } from "../stock-voucher-detail-drawer/StockVoucherDetailDrawer";
import { useStockLedgerDrawer } from "./StockLedgerDrawer.hook";
import { StockLedgerItemInfoPanel } from "./StockLedgerItemInfoPanel";
import { StockLedgerPagination } from "./StockLedgerPagination";
import { StockLedgerTable } from "./StockLedgerTable";
import { StockLedgerTableSkeleton } from "./StockLedgerTableSkeleton";
import { StockLedgerToolbar } from "./StockLedgerToolbar";

export interface StockLedgerDrawerItemInfo {
  itemCode?: string;
  itemName?: string;
  unit?: string;
  avgCost?: number;
  qtyOnHand?: number;
  [key: string]: any;
}

export interface StockLedgerDrawerProps {
  config: InventoryMovementsModuleConfig;
  itemCode: string;
  itemName: string;
  itemInfo?: StockLedgerDrawerItemInfo;
  onClose: () => void;
  onOpenDocument?: (docType: string, docId: string) => void;
}

/**
 * Drawer Thẻ kho 2 cột gọn gàng (Size XL) theo chuẩn V2:
 * - Cột trái: Bảng Thẻ kho 9 cột phẳng + Switcher FIFO/Bình quân + Nút Xuất Excel + Phân trang.
 * - Cột phải: Panel Thông tin mặt hàng + 3 thẻ KPI (Tổng Nhập, Tổng Xuất, Tồn Cuối) theo chuẩn VinFast.
 * - Khi đổi tab: Chỉ hiển thị Skeleton loading mượt mà trên bảng và thẻ KPI, không render lại toàn bộ Drawer.
 */
export function StockLedgerDrawer(props: StockLedgerDrawerProps) {
  const { config, itemCode, itemName, onClose } = props;
  const { t } = useV2Translation();
  const state = useStockLedgerDrawer(props);

  return (
    <>
      <V2StandardDrawer
        id={`stockLedger-${itemCode}`}
        open
        onClose={onClose}
        mode="view"
        title={t(
          "v2.inventoryMovements.ledger.drawerTitle",
          "Lịch sử xuất nhập kho",
        )}
        subtitle={`${itemCode} - ${itemName}`}
        layout={V2DrawerLayout.TWO_COLUMNS}
        size={V2DrawerSize.XL}
        collapsibleRightPanel={true}
        rightPanel={
          <StockLedgerItemInfoPanel
            item={state.itemDetails}
            totals={state.totals}
            costingMethod={state.costingMethod}
            isLoading={state.showSkeleton}
          />
        }
      >
        <div className="flex flex-col gap-4 pb-6">
          <DrawerSection
            title={
              <div className="flex items-center gap-2">
                <V2Text as="span">
                  {t(
                    "v2.inventoryMovements.ledger.title",
                    "Lịch sử xuất nhập kho",
                  )}
                </V2Text>
                <V2Text
                  as="span"
                  variant="caption"
                  className="font-normal text-muted-foreground"
                >
                  ({state.totalRows}{" "}
                  {t("v2.inventoryMovements.ledger.txCount", "giao dịch")})
                </V2Text>
              </div>
            }
            titleExtra={
              <StockLedgerToolbar
                costingMethod={state.costingMethod}
                onChangeMethod={state.handleChangeMethod}
                onExport={state.handleExport}
                exportDisabled={state.totalRows === 0}
              />
            }
          >
            {state.showSkeleton ? (
              <StockLedgerTableSkeleton />
            ) : (
              <>
                <StockLedgerTable
                  rows={state.pagedRows}
                  totals={state.totals}
                  onOpenDocument={state.handleOpenDoc}
                />
                <StockLedgerPagination
                  page={state.page}
                  totalPages={state.totalPages}
                  onChangePage={state.setPage}
                />
              </>
            )}
          </DrawerSection>
        </div>
      </V2StandardDrawer>

      {state.activeVoucher && (
        <StockVoucherDetailDrawer
          config={config}
          type={state.activeVoucher.type as any}
          id={state.activeVoucher.id}
          onClose={() => state.setActiveVoucher(null)}
        />
      )}
    </>
  );
}
