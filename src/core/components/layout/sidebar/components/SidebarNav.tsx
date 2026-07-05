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
  Receipt,
  Package,
  LayoutDashboard,
  Wallet,
  Settings,
  UserSquare2,
  Car,
  WalletCards,
} from "lucide-react";

import { useAppStore } from "@/core/config/appStore";

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
  const searchQuery = useAppStore((s) => s.sidebarSearchQuery) || "";

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
  const showInventory = canReadInventoryItems || canReadInventoryVouchers;

  const canReadBom = useHasPermission("bom", "read");
  const canReadProduction = useHasPermission("production", "read");
  const showManufacturing = canReadBom || canReadProduction;

  const canReadInvoices = useHasPermission("invoices", "read");
  const canReadBankStatements = useHasPermission("bank_statements", "read");
  const showAccounting = canReadInvoices || canReadBankStatements;

  const canReadEmployees = useHasPermission("employees", "read");
  const showHR = canReadEmployees;

  const canReadAdminUsers = useHasPermission("admin_users", "read");
  const canReadActivityLogs = useHasPermission("activity_logs", "read");
  const canReadSysTags = useHasPermission("sys_tags", "read");
  const canReadGreenwayIntegration = useHasPermission(
    "greenway_integration",
    "read",
  );

  const showSettingsAccess = canReadAdminUsers;
  const showSettingsGeneral =
    canReadAdminUsers ||
    canReadActivityLogs ||
    canReadSysTags ||
    canReadBankStatements;
  const showSettingsInventory = canReadInventoryItems;
  const showSettings =
    showSettingsAccess || showSettingsGeneral || showSettingsInventory;

  const normalize = (text: string) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  };

  const sq = normalize(searchQuery.trim());
  const match = (text: string) => !sq || normalize(text).includes(sq);
  const hasMatch = (texts: string[]) => texts.some(match);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      {/* Dashboard */}
      {hasMatch([t("nav.items.dashboard")]) && (
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
      )}

      {/* Garage */}
      {canReadGreenwayIntegration &&
        hasMatch([
          t("nav.items.garage"),
          t("nav.items.garageDashboard"),
          t("nav.items.garageCases"),
          t("nav.items.garageReceivables"),
          t("nav.items.garagePayables"),
        ]) && (
          <div className="sidebar-nav-section py-2">
            <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
              {t("nav.items.garage")}
            </div>
            <NavItem
              collapsed={c}
              icon={
                <LayoutDashboard className="w-4 h-4 opacity-65 flex-shrink-0" />
              }
              label={t("nav.items.garageDashboard")}
              active={currentPage === "garage-dashboard"}
              onClick={() => navTo("garage-dashboard")}
              contextPage="garage-dashboard"
            />
            <NavItem
              collapsed={c}
              icon={<Car className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.garageCases")}
              active={currentPage === "garage-cases"}
              onClick={() => navTo("garage-cases")}
              contextPage="garage-cases"
            />
            <NavItem
              collapsed={c}
              icon={
                <WalletCards className="w-4 h-4 opacity-65 flex-shrink-0" />
              }
              label={t("nav.items.garageReceivables")}
              active={currentPage === "garage-receivables"}
              onClick={() => navTo("garage-receivables")}
              contextPage="garage-receivables"
            />
            <NavItem
              collapsed={c}
              icon={
                <WalletCards className="w-4 h-4 opacity-65 flex-shrink-0" />
              }
              label={t("nav.items.garagePayables")}
              active={currentPage === "garage-payables"}
              onClick={() => navTo("garage-payables")}
              contextPage="garage-payables"
            />
          </div>
        )}

      {/* Sales */}
      {showSales &&
        hasMatch([
          t("nav.sections.sales"),
          canReadSalesOrders ? t("nav.items.erpSalesOrders") : "",
          canReadCustomers ? t("nav.items.customers") : "",
          canReadSalesOrders ? t("nav.items.afterSales") : "",
        ]) && (
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
            {canReadSalesOrders && (
              <NavItem
                collapsed={c}
                icon={<Shield className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.afterSales")}
                active={currentPage === "after-sales"}
                onClick={() => navTo("after-sales")}
                contextPage="after-sales"
              />
            )}
          </div>
        )}

      {/* Purchasing */}
      {showPurchasing &&
        hasMatch([
          t("nav.sections.purchasing"),
          canReadPurchasing ? t("nav.items.purchasing") : "",
          canReadSuppliers ? t("nav.items.suppliers") : "",
        ]) && (
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
                icon={
                  <Building2 className="w-4 h-4 opacity-65 flex-shrink-0" />
                }
                label={t("nav.items.suppliers")}
                active={currentPage === "erp-suppliers"}
                onClick={() => navTo("erp-suppliers")}
                contextPage="erp-suppliers"
              />
            )}
          </div>
        )}

      {/* Kho (Inventory) */}
      {showInventory &&
        hasMatch([
          t("nav.sections.inventory"),
          canReadInventoryItems ? t("nav.items.erpInventoryStock") : "",
          canReadInventoryVouchers ? t("nav.items.erpInventoryVouchers") : "",
          canReadInventoryItems ? t("nav.items.erpInventoryTracking") : "",
        ]) && (
          <div className="sidebar-nav-section py-2">
            <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
              {t("nav.sections.inventory")}
            </div>
            {canReadInventoryItems && (
              <NavItem
                collapsed={c}
                icon={<Package className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.erpInventoryStock")}
                active={currentPage === "erp-inventory-stock"}
                onClick={() => navTo("erp-inventory-stock")}
                contextPage="erp-inventory-stock"
              />
            )}
            {canReadInventoryVouchers && (
              <NavItem
                collapsed={c}
                icon={<FileText className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.erpInventoryVouchers")}
                active={currentPage === "erp-inventory-vouchers"}
                onClick={() => navTo("erp-inventory-vouchers")}
                contextPage="erp-inventory-vouchers"
              />
            )}
            {canReadInventoryItems && (
              <NavItem
                collapsed={c}
                icon={<Layers className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.erpInventoryTracking")}
                active={currentPage === "erp-inventory-tracking"}
                onClick={() => navTo("erp-inventory-tracking")}
                contextPage="erp-inventory-tracking"
              />
            )}
          </div>
        )}

      {/* Manufacturing / BOM / Production */}
      {showManufacturing &&
        hasMatch([
          t("nav.sections.manufacturing"),
          canReadBom ? t("nav.items.erpBom") : "",
          canReadProduction ? t("nav.items.erpProduction") : "",
        ]) && (
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
      {showAccounting &&
        hasMatch([
          t("nav.sections.accounting"),
          canReadInvoices ? t("nav.items.erpInvoices") : "",
          canReadInvoices ? t("nav.items.inbound") : "",
          canReadInvoices ? t("nav.items.outbound") : "",
          canReadBankStatements ? t("nav.items.cashflow") : "",
          canReadBankStatements ? t("nav.items.cashflowDashboard") : "",
          canReadBankStatements ? t("bankStatement.bankTitle") : "",
          canReadBankStatements ? t("bankStatement.cashTitle") : "",
        ]) && (
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
                  currentPage === "cashflow-dashboard" ||
                  currentPage === "bank-statement" ||
                  currentPage === "cash-statement"
                }
              >
                <NavGroupItem
                  label={t("nav.items.cashflowDashboard")}
                  active={currentPage === "cashflow-dashboard"}
                  onClick={() => navTo("cashflow-dashboard")}
                  contextPage="cashflow-dashboard"
                />
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
              </NavGroup>
            )}
            {showAccounting && (
              <>
                <NavItem
                  collapsed={c}
                  icon={
                    <FileText className="w-4 h-4 opacity-65 flex-shrink-0" />
                  }
                  label={t("nav.items.reportJournal")}
                  active={
                    currentPage === "journal" || currentPage === "journal-entry"
                  }
                  onClick={() => navTo("journal-entry" as PageKey)}
                  contextPage={"journal-entry" as PageKey}
                />
                <NavItem
                  collapsed={c}
                  icon={<Layers className="w-4 h-4 opacity-65 flex-shrink-0" />}
                  label={t("nav.items.catalogAccounts")}
                  active={currentPage === "settings-accounts"}
                  onClick={() => navTo("settings-accounts" as PageKey)}
                  contextPage={"settings-accounts" as PageKey}
                />
              </>
            )}
          </div>
        )}

      {/* Human Resources */}
      {showHR &&
        hasMatch([t("nav.sections.hr"), t("nav.items.erpEmployees")]) && (
          <div className="sidebar-nav-section py-2">
            <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
              {t("nav.sections.hr")}
            </div>
            <NavItem
              collapsed={c}
              icon={
                <UserSquare2 className="w-4 h-4 opacity-65 flex-shrink-0" />
              }
              label={t("nav.items.erpEmployees")}
              active={currentPage === "erp-employees"}
              onClick={() => navTo("erp-employees")}
              contextPage="erp-employees"
            />
          </div>
        )}

      {/* Settings & System */}
      {showSettings &&
        hasMatch([
          t("nav.sections.settings"),
          showSettingsAccess ? t("nav.items.accessControl") : "",
          showSettingsAccess ? t("nav.items.users") : "",
          showSettingsAccess ? t("nav.items.phanquyen") : "",
          showSettingsGeneral ? t("nav.items.catalog") : "",
          showSettingsGeneral && canReadAdminUsers
            ? t("thietlap.tabs.chi-nhanh")
            : "",
          showSettingsGeneral && canReadBankStatements
            ? t("thietlap.tabs.ngan-hang")
            : "",
          showSettingsGeneral && canReadBankStatements
            ? t("thietlap.tabs.quy")
            : "",
          showSettingsGeneral && canReadSysTags ? t("nav.items.sysTags") : "",
          showSettingsGeneral && canReadActivityLogs
            ? t("nav.items.activitylog")
            : "",
          showSettingsInventory ? t("nav.items.erpInventoryMasters") : "",
          showSettingsInventory ? t("nav.items.erpInventoryUom") : "",
          showSettingsInventory ? t("nav.items.erpInventoryItemTypes") : "",
          showSettingsInventory
            ? t("nav.items.erpInventoryTrackingCategories")
            : "",
        ]) && (
          <div className="sidebar-nav-section py-2">
            <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
              {t("nav.sections.settings")}
            </div>

            {showSettingsAccess && (
              <NavGroup
                collapsed={c}
                icon={<Shield className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.accessControl")}
                active={
                  currentPage === "erp-users" ||
                  currentPage === "erp-permissions-core"
                }
              >
                <NavGroupItem
                  label={t("nav.items.users")}
                  active={currentPage === "erp-users"}
                  onClick={() => navTo("erp-users")}
                  contextPage="erp-users"
                />
                <NavGroupItem
                  label={t("nav.items.phanquyen")}
                  active={currentPage === "erp-permissions-core"}
                  onClick={() => navTo("erp-permissions-core")}
                  contextPage="erp-permissions-core"
                />
              </NavGroup>
            )}

            {showSettingsGeneral && (
              <NavGroup
                collapsed={c}
                icon={<Settings className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.catalog")}
                active={
                  currentPage === "settings-branch" ||
                  currentPage === "settings-bank" ||
                  currentPage === "settings-cash-fund" ||
                  currentPage === "sys-tags" ||
                  currentPage === "erp-activity-logs"
                }
              >
                {canReadAdminUsers && (
                  <NavGroupItem
                    label={t("thietlap.tabs.chi-nhanh")}
                    active={currentPage === "settings-branch"}
                    onClick={() => navTo("settings-branch")}
                    contextPage="settings-branch"
                  />
                )}
                {canReadBankStatements && (
                  <>
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
                  </>
                )}
                {canReadSysTags && (
                  <NavGroupItem
                    label={t("nav.items.sysTags")}
                    active={currentPage === "sys-tags"}
                    onClick={() => navTo("sys-tags")}
                    contextPage="sys-tags"
                  />
                )}
                {canReadActivityLogs && (
                  <NavGroupItem
                    label={t("nav.items.activitylog")}
                    active={currentPage === "erp-activity-logs"}
                    onClick={() => navTo("erp-activity-logs")}
                    contextPage="erp-activity-logs"
                  />
                )}
              </NavGroup>
            )}

            {showSettingsInventory && (
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
                <NavGroupItem
                  label={t("nav.items.erpInventoryUom")}
                  active={currentPage === "erp-inventory-uom"}
                  onClick={() => navTo("erp-inventory-uom")}
                  contextPage="erp-inventory-uom"
                />
                <NavGroupItem
                  label={t("nav.items.erpInventoryItemTypes")}
                  active={currentPage === "erp-inventory-item-types"}
                  onClick={() => navTo("erp-inventory-item-types")}
                  contextPage="erp-inventory-item-types"
                />
                <NavGroupItem
                  label={t("nav.items.erpInventoryTrackingCategories")}
                  active={currentPage === "erp-inventory-tracking-categories"}
                  onClick={() => navTo("erp-inventory-tracking-categories")}
                  contextPage="erp-inventory-tracking-categories"
                />
              </NavGroup>
            )}
          </div>
        )}
    </div>
  );
}
