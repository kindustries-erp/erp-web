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
  const canReadGarageStockVouchers =
    useHasPermission(ErpResource.GARAGE_STOCK_VOUCHERS, ErpAction.READ) ||
    canReadGarageCases;
  const canReadGarageStockLedger =
    useHasPermission(ErpResource.GARAGE_STOCK_LEDGER, ErpAction.READ) ||
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

  const isStockVouchersActive = currentPage === "garage-stock-vouchers";
  const isStockBalancesActive = currentPage === "garage-stock-balances";

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
  const handleNavStockVouchers = () => navTo("garage-stock-vouchers");
  const handleNavStockBalances = () => navTo("garage-stock-balances");
  const handleNavProcurementRequests = () => navTo("garage-procurement");
  const handleNavPurchaseOrders = () => navTo("garage-procurement");
  const handleNavDebts = () => navTo("garage-debts");
  const handleNavOpex = () => navTo("garage-opex");

  return {
    canReadGarageCashflow,
    canReadGarageCases,
    canReadGarageStockVouchers,
    canReadGarageStockLedger,
    canReadGarageProcurementRequests,
    canReadGaragePurchaseOrders,
    canReadGarageDebts,
    canReadGarageOpex,
    isCashflowActive,
    isCasesActive,
    isStockVouchersActive,
    isStockBalancesActive,
    isProcurementRequestsActive,
    isPurchaseOrdersActive,
    isDebtsActive,
    isOpexActive,
    handleNavCashflow,
    handleNavCases,
    handleNavStockVouchers,
    handleNavStockBalances,
    handleNavProcurementRequests,
    handleNavPurchaseOrders,
    handleNavDebts,
    handleNavOpex,
  };
}
