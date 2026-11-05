import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import type { GarageNavSectionProps } from "./GarageNavSection.type";

export function useGarageNavSection({
  currentPage,
  navTo,
}: Pick<GarageNavSectionProps, "currentPage" | "navTo">) {
  const canReadGarageCashflow = useHasPermission(
    ErpResource.GARAGE_CASHFLOW,
    ErpAction.READ,
  );
  const canReadGarageCases = useHasPermission(
    ErpResource.GARAGE,
    ErpAction.READ,
  );
  const canReadGarageDebts = useHasPermission(
    ErpResource.GARAGE_DEBTS,
    ErpAction.READ,
  );
  const canReadGarageGoodsReceipts =
    useHasPermission(ErpResource.GARAGE_GOODS_RECEIPTS, ErpAction.READ) ||
    canReadGarageCases;
  const canReadGarageOpex = canReadGarageCases;
  // Menu PO garage chỉ dựa vào quyền của chính nó (không fallback sang garage)
  const canReadGaragePurchaseOrders = useHasPermission(
    ErpResource.GARAGE_PROCUREMENT_ORDERS,
    ErpAction.READ,
  );

  const isCashflowActive = currentPage === "garage-cashflow";

  const isCasesActive =
    currentPage === "garage-cases" || currentPage === "garage-dashboard";

  const isGoodsReceiptsActive = currentPage === "garage-goods-receipts";

  const isPurchaseOrdersActive = currentPage === "garage-procurement-orders";

  const isDebtsActive =
    currentPage === "garage-debts" ||
    currentPage === "garage-partners" ||
    currentPage === "garage-customers";

  const isOpexActive = currentPage === "garage-opex";

  const handleNavCashflow = () => navTo("garage-cashflow");
  const handleNavCases = () => navTo("garage-cases");
  const handleNavGoodsReceipts = () => navTo("garage-goods-receipts");
  const handleNavPurchaseOrders = () => navTo("garage-procurement-orders");
  const handleNavDebts = () => navTo("garage-debts");
  const handleNavOpex = () => navTo("garage-opex");

  return {
    canReadGarageCashflow,
    canReadGarageCases,
    canReadGarageGoodsReceipts,
    canReadGaragePurchaseOrders,
    canReadGarageDebts,
    canReadGarageOpex,
    isCashflowActive,
    isCasesActive,
    isGoodsReceiptsActive,
    isPurchaseOrdersActive,
    isDebtsActive,
    isOpexActive,
    handleNavCashflow,
    handleNavCases,
    handleNavGoodsReceipts,
    handleNavPurchaseOrders,
    handleNavDebts,
    handleNavOpex,
  };
}
