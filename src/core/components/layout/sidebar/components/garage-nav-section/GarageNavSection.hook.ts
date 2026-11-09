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
  // Quyền truy cập trang mua hàng garage (gồm cả đề nghị và đơn mua)
  const canReadGaragePurchaseOrders = useHasPermission(
    ErpResource.GARAGE_PROCUREMENT_ORDERS,
    ErpAction.READ,
  );
  const canReadGarageProcurementRequests =
    useHasPermission(ErpResource.GARAGE_PROCUREMENT_REQUESTS, ErpAction.READ) ||
    canReadGaragePurchaseOrders;

  const isCashflowActive = currentPage === "garage-cashflow";

  const isCasesActive =
    currentPage === "garage-cases" || currentPage === "garage-dashboard";

  const isGoodsReceiptsActive = currentPage === "garage-goods-receipts";

  const isProcurementRequestsActive =
    currentPage === "garage-procurement" ||
    currentPage === "garage-procurement-requests";

  const isPurchaseOrdersActive = currentPage === "garage-procurement-orders";

  const isDebtsActive =
    currentPage === "garage-debts" ||
    currentPage === "garage-partners" ||
    currentPage === "garage-customers";

  const isOpexActive = currentPage === "garage-opex";

  const handleNavCashflow = () => navTo("garage-cashflow");
  const handleNavCases = () => navTo("garage-cases");
  const handleNavGoodsReceipts = () => navTo("garage-goods-receipts");
  const handleNavProcurementRequests = () => navTo("garage-procurement");
  const handleNavPurchaseOrders = () => navTo("garage-procurement");
  const handleNavDebts = () => navTo("garage-debts");
  const handleNavOpex = () => navTo("garage-opex");

  return {
    canReadGarageCashflow,
    canReadGarageCases,
    canReadGarageGoodsReceipts,
    canReadGarageProcurementRequests,
    canReadGaragePurchaseOrders,
    canReadGarageDebts,
    canReadGarageOpex,
    isCashflowActive,
    isCasesActive,
    isGoodsReceiptsActive,
    isProcurementRequestsActive,
    isPurchaseOrdersActive,
    isDebtsActive,
    isOpexActive,
    handleNavCashflow,
    handleNavCases,
    handleNavGoodsReceipts,
    handleNavProcurementRequests,
    handleNavPurchaseOrders,
    handleNavDebts,
    handleNavOpex,
  };
}
