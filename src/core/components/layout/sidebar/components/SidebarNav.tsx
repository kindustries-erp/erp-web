import type { PageKey } from "@/shared/types";
import { useT } from "@/core/i18n";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { NavItem, NavGroup, NavGroupItem } from "./SidebarPrimitives";
import {
  Boxes,
  Users,
  FileText,
  Building2,
  Layers,
  Network,
  Factory,
  Shield,
  History,
  Key,
  Receipt,
  Package,
  LayoutDashboard,
  Wallet,
} from "lucide-react";

export function SidebarNav({
  c,
  currentPage,
  navTo,
}: {
  c: boolean;
  currentPage: string;
  navTo: (p: PageKey) => void;
}) {
  const t = useT();

  const canReadSalesOrders = useHasPermission("sales_orders", "read");
  const canReadCustomers = useHasPermission("business_partners", "read");
  const showSales = canReadSalesOrders || canReadCustomers;

  const canReadPurchasing = useHasPermission("purchase_orders", "read");
  const canReadSuppliers = useHasPermission("business_partners", "read");
  const showPurchasing = canReadPurchasing || canReadSuppliers;

  const canReadInventoryItems = useHasPermission("inventory_items", "read");
  const canReadInventoryVouchers = useHasPermission(
    "inventory_vouchers",
    "read",
  );
  const showInventoryGroup1 = canReadInventoryItems || canReadInventoryVouchers;
  const showInventoryGroup2 = canReadInventoryItems;
  const showInventory = showInventoryGroup1 || showInventoryGroup2;

  const canReadBom = useHasPermission("bom", "read");
  const canReadProduction = useHasPermission("production", "read");
  const showManufacturing = canReadBom || canReadProduction;

  const canReadInvoices = useHasPermission("invoices", "read");
  const canReadBankStatements = useHasPermission("bank_statements", "read");
  const showAccounting = canReadInvoices || canReadBankStatements;

  const canReadEmployees = useHasPermission("employees", "read");
  const canReadAdminUsers = useHasPermission("admin_users", "read");
  const canReadActivityLogs = useHasPermission("activity_logs", "read");
  const canReadSysTags = useHasPermission("sys_tags", "read");
  const showSystem =
    canReadEmployees ||
    canReadAdminUsers ||
    canReadActivityLogs ||
    canReadSysTags;

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      {/* Dashboard */}
      <div className="sidebar-nav-section py-2">
        <NavItem
          collapsed={c}
          icon={
            <LayoutDashboard className="w-4 h-4 opacity-65 flex-shrink-0" />
          }
          label={t("nav.items.dashboard")}
          active={currentPage === "dashboard"}
          onClick={() => navTo("dashboard")}
          contextPage="dashboard"
        />
      </div>

      {/* Sales */}
      {showSales && (
        <div className="sidebar-nav-section py-2">
          <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
            {t("nav.sections.sales")}
          </div>
          {canReadSalesOrders && (
            <NavItem
              collapsed={c}
              icon={<Boxes className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.erpSalesOrders")}
              active={currentPage === "erp-sales-orders"}
              onClick={() => navTo("erp-sales-orders")}
              contextPage="erp-sales-orders"
            />
          )}
          {canReadCustomers && (
            <NavItem
              collapsed={c}
              icon={<Users className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.customers")}
              active={currentPage === "erp-customers"}
              onClick={() => navTo("erp-customers")}
              contextPage="erp-customers"
            />
          )}
        </div>
      )}

      {/* Purchasing */}
      {showPurchasing && (
        <div className="sidebar-nav-section py-2">
          <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
            {t("nav.sections.purchasing")}
          </div>
          {canReadPurchasing && (
            <NavItem
              collapsed={c}
              icon={<FileText className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.purchasing")}
              active={currentPage === "purchasing"}
              onClick={() => navTo("purchasing")}
              contextPage="purchasing"
            />
          )}
          {canReadSuppliers && (
            <NavItem
              collapsed={c}
              icon={<Building2 className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.suppliers")}
              active={currentPage === "erp-suppliers"}
              onClick={() => navTo("erp-suppliers")}
              contextPage="erp-suppliers"
            />
          )}
        </div>
      )}

      {/* Kho */}
      {showInventory && (
        <div className="sidebar-nav-section py-2">
          <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
            {t("nav.sections.inventory")}
          </div>
          {showInventoryGroup1 && (
            <NavGroup
              collapsed={c}
              icon={<Package className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.inventoryGroup")}
              active={
                currentPage === "erp-inventory-stock" ||
                currentPage === "erp-inventory-tracking" ||
                currentPage === "erp-inventory-vouchers"
              }
            >
              {canReadInventoryItems && (
                <NavGroupItem
                  label={t("nav.items.erpInventoryStock")}
                  active={currentPage === "erp-inventory-stock"}
                  onClick={() => navTo("erp-inventory-stock")}
                  contextPage="erp-inventory-stock"
                />
              )}
              {canReadInventoryVouchers && (
                <NavGroupItem
                  label={t("nav.items.erpInventoryVouchers")}
                  active={currentPage === "erp-inventory-vouchers"}
                  onClick={() => navTo("erp-inventory-vouchers")}
                  contextPage="erp-inventory-vouchers"
                />
              )}
              {canReadInventoryItems && (
                <NavGroupItem
                  label={t("nav.items.erpInventoryTracking")}
                  active={currentPage === "erp-inventory-tracking"}
                  onClick={() => navTo("erp-inventory-tracking")}
                  contextPage="erp-inventory-tracking"
                />
              )}
            </NavGroup>
          )}

          {showInventoryGroup2 && (
            <NavGroup
              collapsed={c}
              icon={<Layers className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.erpInventoryMasters")}
              active={
                currentPage === "erp-inventory-uom" ||
                currentPage === "erp-inventory-item-types" ||
                currentPage === "erp-inventory-tracking-categories"
              }
            >
              {canReadInventoryItems && (
                <NavGroupItem
                  label={t("nav.items.erpInventoryUom")}
                  active={currentPage === "erp-inventory-uom"}
                  onClick={() => navTo("erp-inventory-uom")}
                  contextPage="erp-inventory-uom"
                />
              )}
              {canReadInventoryItems && (
                <NavGroupItem
                  label={t("nav.items.erpInventoryItemTypes")}
                  active={currentPage === "erp-inventory-item-types"}
                  onClick={() => navTo("erp-inventory-item-types")}
                  contextPage="erp-inventory-item-types"
                />
              )}
              {canReadInventoryItems && (
                <NavGroupItem
                  label={t("nav.items.erpInventoryTrackingCategories")}
                  active={currentPage === "erp-inventory-tracking-categories"}
                  onClick={() => navTo("erp-inventory-tracking-categories")}
                  contextPage="erp-inventory-tracking-categories"
                />
              )}
            </NavGroup>
          )}
        </div>
      )}

      {/* Manufacturing / BOM / Production */}
      {showManufacturing && (
        <div className="sidebar-nav-section py-2">
          <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
            {t("nav.sections.manufacturing")}
          </div>
          {canReadBom && (
            <NavItem
              collapsed={c}
              icon={<Network className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.erpBom")}
              active={currentPage === "erp-bom"}
              onClick={() => navTo("erp-bom")}
              contextPage="erp-bom"
            />
          )}
          {canReadProduction && (
            <NavItem
              collapsed={c}
              icon={<Factory className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.erpProduction")}
              active={currentPage === "erp-production"}
              onClick={() => navTo("erp-production")}
              contextPage="erp-production"
            />
          )}
        </div>
      )}

      {/* Kế toán */}
      {showAccounting && (
        <div className="sidebar-nav-section py-2">
          <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
            {t("nav.sections.accounting")}
          </div>
          {canReadInvoices && (
            <NavGroup
              collapsed={c}
              icon={<Receipt className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.erpInvoices")}
              active={
                currentPage === "erp-invoices-in" ||
                currentPage === "erp-invoices-out"
              }
            >
              <NavGroupItem
                label={t("nav.items.inbound")}
                active={currentPage === "erp-invoices-in"}
                onClick={() => navTo("erp-invoices-in")}
                contextPage="erp-invoices-in"
              />
              <NavGroupItem
                label={t("nav.items.outbound")}
                active={currentPage === "erp-invoices-out"}
                onClick={() => navTo("erp-invoices-out")}
                contextPage="erp-invoices-out"
              />
            </NavGroup>
          )}
          {canReadBankStatements && (
            <NavGroup
              collapsed={c}
              icon={<Wallet className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.cashflow")}
              active={
                currentPage === "bank-statement" ||
                currentPage === "cash-statement" ||
                currentPage === "settings-bank" ||
                currentPage === "settings-cash-fund"
              }
            >
              <NavGroupItem
                label={t("bankStatement.bankTitle")}
                active={currentPage === "bank-statement"}
                onClick={() => navTo("bank-statement")}
                contextPage="bank-statement"
              />
              <NavGroupItem
                label={t("bankStatement.cashTitle")}
                active={currentPage === "cash-statement"}
                onClick={() => navTo("cash-statement")}
                contextPage="cash-statement"
              />
              <NavGroupItem
                label={t("thietlap.tabs.ngan-hang")}
                active={currentPage === "settings-bank"}
                onClick={() => navTo("settings-bank")}
                contextPage="settings-bank"
              />
              <NavGroupItem
                label={t("thietlap.tabs.quy")}
                active={currentPage === "settings-cash-fund"}
                onClick={() => navTo("settings-cash-fund")}
                contextPage="settings-cash-fund"
              />
            </NavGroup>
          )}
        </div>
      )}

      {/* Hệ thống / Admin */}
      {showSystem && (
        <div className="sidebar-nav-section py-2">
          <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
            {t("nav.sections.system")}
          </div>
          {canReadEmployees && (
            <NavItem
              collapsed={c}
              icon={<Users className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.erpEmployees")}
              active={currentPage === "erp-employees"}
              onClick={() => navTo("erp-employees")}
              contextPage="erp-employees"
            />
          )}
          {canReadAdminUsers && (
            <>
              <NavItem
                collapsed={c}
                icon={<Shield className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.users")}
                active={currentPage === "erp-users"}
                onClick={() => navTo("erp-users")}
                contextPage="erp-users"
              />
              <NavItem
                collapsed={c}
                icon={<Key className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.phanquyen")}
                active={currentPage === "erp-permissions-core"}
                onClick={() => navTo("erp-permissions-core")}
                contextPage="erp-permissions-core"
              />
            </>
          )}
          {canReadAdminUsers && (
            <NavItem
              collapsed={c}
              icon={<Building2 className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("thietlap.tabs.chi-nhanh")}
              active={currentPage === "settings-branch"}
              onClick={() => navTo("settings-branch")}
              contextPage="settings-branch"
            />
          )}
          {canReadActivityLogs && (
            <NavItem
              collapsed={c}
              icon={<History className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.activitylog")}
              active={currentPage === "erp-activity-logs"}
              onClick={() => navTo("erp-activity-logs")}
              contextPage="erp-activity-logs"
            />
          )}
          {canReadSysTags && (
            <NavItem
              collapsed={c}
              icon={<Package className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.sysTags")}
              active={currentPage === "sys-tags"}
              onClick={() => navTo("sys-tags")}
              contextPage="sys-tags"
            />
          )}
        </div>
      )}
    </div>
  );
}
