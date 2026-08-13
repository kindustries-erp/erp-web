import type { PageKey } from "@/shared/types";
import { useT } from "@/core/i18n";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import {
  NavItem,
  NavGroup,
  NavGroupItem,
  NavSection,
} from "./SidebarPrimitives";
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
  Paperclip,
  Mail,
  Target,
} from "lucide-react";

import { useAppStore } from "@/core/config/appStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";

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
  const { employee } = useAuthStore();
  const isAdminEmail = employee?.email === "admin@liouni.com";

  const canReadSalesOrders = useHasPermission("sales_orders", "read");
  const canReadCustomers = useHasPermission("business_partners", "read");
  const canReadSalesReports = useHasPermission("sales_reports", "read");
  const showSales =
    canReadSalesOrders || canReadCustomers || canReadSalesReports;

  const canReadPurchasing = useHasPermission("purchase_orders", "read");
  const canReadSuppliers = useHasPermission("business_partners", "read");
  const canReadPurchasingReports = useHasPermission(
    "purchasing_reports",
    "read",
  );
  const showPurchasing =
    canReadPurchasing || canReadSuppliers || canReadPurchasingReports;

  const canReadInventoryItems = useHasPermission("inventory_items", "read");
  const canReadInventoryVouchers = useHasPermission(
    "inventory_vouchers",
    "read",
  );
  const canReadVinfastParts = useHasPermission("vinfast_parts_reports", "read");
  const showInventory =
    canReadInventoryItems || canReadInventoryVouchers || canReadVinfastParts;

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
  const canReadEmailInbox = useHasPermission("email_ingest", "read");
  const canReadGreenwayIntegration = useHasPermission(
    "greenway_integration",
    "read",
  );

  const showSettingsAccess = canReadAdminUsers || canReadActivityLogs;
  const showSettingsGeneral =
    canReadAdminUsers || canReadSysTags || canReadBankStatements;
  const showSettingsInventory = canReadInventoryItems;
  const showSettings =
    showSettingsAccess ||
    showSettingsGeneral ||
    showSettingsInventory ||
    canReadEmailInbox;

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
        <NavSection collapsed={c}>
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
        </NavSection>
      )}

      {/* Sales */}
      {showSales &&
        hasMatch([
          t("nav.sections.sales"),
          canReadSalesOrders ? t("nav.items.erpSalesOrders") : "",
          canReadCustomers ? t("nav.items.customers") : "",
          canReadSalesOrders ? t("nav.items.afterSales") : "",
          canReadSalesReports ? t("nav.items.salesReportDashboard") : "",
        ]) && (
          <NavSection collapsed={c} label={t("nav.sections.sales")}>
            {canReadSalesReports && (
              <NavItem
                collapsed={c}
                icon={
                  <LayoutDashboard className="w-4 h-4 opacity-65 flex-shrink-0" />
                }
                label={t("nav.items.salesReportDashboard")}
                active={currentPage === "sales-report-dashboard"}
                onClick={() => navTo("sales-report-dashboard")}
                contextPage="sales-report-dashboard"
              />
            )}
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
          </NavSection>
        )}

      {/* Purchasing */}
      {showPurchasing &&
        hasMatch([
          t("nav.sections.purchasing"),
          canReadPurchasing ? t("nav.items.purchasing") : "",
          canReadSuppliers ? t("nav.items.suppliers") : "",
          canReadPurchasingReports
            ? t("nav.items.purchasingReportDashboard")
            : "",
        ]) && (
          <NavSection collapsed={c} label={t("nav.sections.purchasing")}>
            {canReadPurchasingReports && (
              <NavItem
                collapsed={c}
                icon={
                  <LayoutDashboard className="w-4 h-4 opacity-65 flex-shrink-0" />
                }
                label={t("nav.items.purchasingReportDashboard")}
                active={currentPage === "purchasing-report-dashboard"}
                onClick={() => navTo("purchasing-report-dashboard")}
                contextPage="purchasing-report-dashboard"
              />
            )}
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
          </NavSection>
        )}

      {/* Kho (Inventory) */}
      {showInventory &&
        hasMatch([
          t("nav.sections.inventory"),
          canReadInventoryItems ? t("nav.items.inventoryDashboard") : "",
          canReadInventoryItems ? t("nav.items.erpInventoryStock") : "",
          canReadInventoryVouchers ? t("nav.items.erpInventoryVouchers") : "",
          canReadInventoryItems ? t("nav.items.erpInventoryTrackingGroup") : "",
          canReadInventoryItems ? t("nav.items.erpInventoryTracking") : "",
          canReadInventoryItems ? t("nav.items.erpInventoryTrackingParts") : "",
        ]) && (
          <NavSection collapsed={c} label={t("nav.sections.inventory")}>
            {canReadInventoryItems && (
              <NavItem
                collapsed={c}
                icon={
                  <LayoutDashboard className="w-4 h-4 opacity-65 flex-shrink-0" />
                }
                label={t("nav.items.inventoryDashboard")}
                active={currentPage === "inventory-dashboard"}
                onClick={() => navTo("inventory-dashboard")}
                contextPage="inventory-dashboard"
              />
            )}
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
              <NavGroup
                collapsed={c}
                icon={<Layers className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.erpInventoryTrackingGroup")}
                active={
                  currentPage === "erp-inventory-tracking" ||
                  currentPage === "erp-inventory-tracking-parts" ||
                  currentPage === "erp-inventory-tracking-lot" ||
                  currentPage === "erp-inventory-tracking-custom"
                }
              >
                <NavGroupItem
                  label={t("nav.items.erpInventoryTracking")}
                  active={currentPage === "erp-inventory-tracking"}
                  onClick={() => navTo("erp-inventory-tracking")}
                  contextPage="erp-inventory-tracking"
                />
                <NavGroupItem
                  label={t("nav.items.erpInventoryTrackingParts")}
                  active={currentPage === "erp-inventory-tracking-parts"}
                  onClick={() => navTo("erp-inventory-tracking-parts")}
                  contextPage="erp-inventory-tracking-parts"
                />
                <NavGroupItem
                  label={t("nav.items.erpInventoryTrackingLot")}
                  active={currentPage === "erp-inventory-tracking-lot"}
                  onClick={() => navTo("erp-inventory-tracking-lot")}
                  contextPage="erp-inventory-tracking-lot"
                />
                <NavGroupItem
                  label={t("nav.items.erpInventoryTrackingCustom")}
                  active={currentPage === "erp-inventory-tracking-custom"}
                  onClick={() => navTo("erp-inventory-tracking-custom")}
                  contextPage="erp-inventory-tracking-custom"
                />
              </NavGroup>
            )}
            {canReadVinfastParts && (
              <NavGroup
                collapsed={c}
                icon={<FileText className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label="Phụ tùng Vinfast"
                active={
                  currentPage === "vinfast-parts-dashboard" ||
                  currentPage === "vinfast-parts-oto" ||
                  currentPage === "vinfast-parts-xemay" ||
                  currentPage === "vinfast-parts-oto-stock" ||
                  currentPage === "vinfast-parts-xemay-stock" ||
                  currentPage === "vinfast-parts"
                }
              >
                <NavGroupItem
                  label="Tổng quan"
                  active={currentPage === "vinfast-parts-dashboard"}
                  onClick={() => navTo("vinfast-parts-dashboard")}
                  contextPage="vinfast-parts-dashboard"
                />
                <NavGroupItem
                  label="Phụ tùng ôtô"
                  active={currentPage === "vinfast-parts-oto"}
                  onClick={() => navTo("vinfast-parts-oto")}
                  contextPage="vinfast-parts-oto"
                />
                <NavGroupItem
                  label="Phụ tùng xe máy"
                  active={currentPage === "vinfast-parts-xemay"}
                  onClick={() => navTo("vinfast-parts-xemay")}
                  contextPage="vinfast-parts-xemay"
                />
                <NavGroupItem
                  label="Tồn kho ôtô"
                  active={currentPage === "vinfast-parts-oto-stock"}
                  onClick={() => navTo("vinfast-parts-oto-stock")}
                  contextPage="vinfast-parts-oto-stock"
                />
                <NavGroupItem
                  label="Tồn kho xe máy"
                  active={currentPage === "vinfast-parts-xemay-stock"}
                  onClick={() => navTo("vinfast-parts-xemay-stock")}
                  contextPage="vinfast-parts-xemay-stock"
                />
              </NavGroup>
            )}
          </NavSection>
        )}

      {/* Manufacturing / BOM / Production */}
      {showManufacturing &&
        hasMatch([
          t("nav.sections.manufacturing"),
          canReadBom ? t("nav.items.erpBom") : "",
          canReadProduction ? t("nav.items.erpProduction") : "",
          canReadGreenwayIntegration ? t("nav.items.garage") : "",
          canReadGreenwayIntegration ? t("nav.items.garageCases") : "",
          canReadGreenwayIntegration ? t("nav.items.garageGrossProfit") : "",
          "Xưởng Vinfast",
          "Quyết toán Hóa đơn",
        ]) && (
          <NavSection collapsed={c} label={t("nav.sections.manufacturing")}>
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
            {canReadGreenwayIntegration && (
              <NavGroup
                collapsed={c}
                icon={<Factory className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label="Xưởng Vinfast"
                active={currentPage === "vinfast-invoice-settlement"}
              >
                <NavGroupItem
                  label="Quyết toán Hóa đơn"
                  active={currentPage === "vinfast-invoice-settlement"}
                  onClick={() => navTo("vinfast-invoice-settlement")}
                  contextPage="vinfast-invoice-settlement"
                />
              </NavGroup>
            )}
            {canReadGreenwayIntegration && (
              <NavGroup
                collapsed={c}
                icon={<Car className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.garage")}
                active={
                  currentPage === "garage-cases" ||
                  currentPage === "garage-gross-profit"
                }
              >
                <NavGroupItem
                  label={t("nav.items.garageCases")}
                  active={currentPage === "garage-cases"}
                  onClick={() => navTo("garage-cases")}
                  contextPage="garage-cases"
                />
                <NavGroupItem
                  label={t("nav.items.garageGrossProfit")}
                  active={currentPage === "garage-gross-profit"}
                  onClick={() => navTo("garage-gross-profit")}
                  contextPage="garage-gross-profit"
                />
              </NavGroup>
            )}
          </NavSection>
        )}

      {/* Kế toán */}
      {showAccounting &&
        hasMatch([
          t("nav.sections.accounting"),
          canReadInvoices ? t("nav.items.erpInvoices") : "",
          canReadInvoices ? "Tổng quan hóa đơn" : "",
          canReadBankStatements ? "Budget" : "",
          canReadInvoices ? t("nav.items.inbound") : "",
          canReadInvoices ? t("nav.items.outbound") : "",
          canReadBankStatements ? t("nav.items.cashflow") : "",
          canReadBankStatements ? t("nav.items.cashflowDashboard") : "",
          canReadBankStatements ? t("bankStatement.bankTitle") : "",
          canReadBankStatements ? t("bankStatement.cashTitle") : "",
          canReadGreenwayIntegration ? t("nav.items.garageReceivables") : "",
          canReadGreenwayIntegration ? t("nav.items.garagePayables") : "",
        ]) && (
          <NavSection collapsed={c} label={t("nav.sections.accounting")}>
            {canReadBankStatements && isAdminEmail && (
              <NavItem
                collapsed={c}
                icon={<Target className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label="Budget"
                active={currentPage === "budget"}
                onClick={() => navTo("budget" as PageKey)}
                contextPage={"budget" as PageKey}
              />
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
            {canReadInvoices && (
              <NavGroup
                collapsed={c}
                icon={<Receipt className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.erpInvoices")}
                active={
                  currentPage === "erp-invoices-in" ||
                  currentPage === "erp-invoices-out" ||
                  currentPage === "erp-invoices-draft" ||
                  currentPage === "invoice-dashboard"
                }
              >
                <NavGroupItem
                  label="Tổng quan"
                  active={currentPage === "invoice-dashboard"}
                  onClick={() => navTo("invoice-dashboard")}
                  contextPage="invoice-dashboard"
                />
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
                <NavGroupItem
                  label="Hóa đơn nháp"
                  active={currentPage === "erp-invoices-draft"}
                  onClick={() => navTo("erp-invoices-draft")}
                  contextPage="erp-invoices-draft"
                />
              </NavGroup>
            )}
            {/* TODO: Tính sau - tạm ẩn
            canReadGreenwayIntegration && (
              <NavGroup
                collapsed={c}
                icon={
                  <WalletCards className="w-4 h-4 opacity-65 flex-shrink-0" />
                }
                label={t("nav.items.garage")}
                active={
                  currentPage === "garage-receivables" ||
                  currentPage === "garage-payables"
                }
              >
                <NavGroupItem
                  label={t("nav.items.garageReceivables")}
                  active={currentPage === "garage-receivables"}
                  onClick={() => navTo("garage-receivables")}
                  contextPage="garage-receivables"
                />
                <NavGroupItem
                  label={t("nav.items.garagePayables")}
                  active={currentPage === "garage-payables"}
                  onClick={() => navTo("garage-payables")}
                  contextPage="garage-payables"
                />
              </NavGroup>
            )
            */}
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
          </NavSection>
        )}

      {/* Admin */}
      {hasMatch([
        t("nav.sections.admin"),
        t("nav.items.erpEmployees"),
        t("nav.items.attachments"),
      ]) && (
        <NavSection collapsed={c} label={t("nav.sections.admin")}>
          {showHR && (
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
          )}
          <NavItem
            collapsed={c}
            icon={<Paperclip className="w-4 h-4 opacity-65 flex-shrink-0" />}
            label={t("nav.items.attachments")}
            active={currentPage === "attachments"}
            onClick={() => navTo("attachments" as PageKey)}
            contextPage={"attachments" as PageKey}
          />
        </NavSection>
      )}

      {/* Settings & System */}
      {showSettings &&
        hasMatch([
          t("nav.sections.settings"),
          showSettingsAccess ? t("nav.items.accessControl") : "",
          canReadAdminUsers ? t("nav.items.users") : "",
          canReadAdminUsers ? t("nav.items.phanquyen") : "",
          canReadActivityLogs ? t("nav.items.activitylog") : "",
          canReadEmailInbox ? t("nav.items.emailInbox") : "",
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
          showSettingsInventory ? t("nav.items.erpInventoryMasters") : "",
          showSettingsInventory ? t("nav.items.erpInventoryUom") : "",
          showSettingsInventory ? t("nav.items.erpInventoryItemTypes") : "",
          showSettingsInventory
            ? t("nav.items.erpInventoryTrackingCategories")
            : "",
        ]) && (
          <NavSection collapsed={c} label={t("nav.sections.settings")}>
            {canReadEmailInbox && isAdminEmail && (
              <NavItem
                collapsed={c}
                icon={<Mail className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.emailInbox")}
                active={currentPage === "email-inbox"}
                onClick={() => navTo("email-inbox")}
                contextPage="email-inbox"
              />
            )}

            {showSettingsAccess && (
              <NavGroup
                collapsed={c}
                icon={<Shield className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.accessControl")}
                active={
                  currentPage === "erp-users" ||
                  currentPage === "erp-permissions-core" ||
                  currentPage === "erp-activity-logs"
                }
              >
                {canReadAdminUsers && (
                  <>
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
                  </>
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

            {showSettingsGeneral && (
              <NavGroup
                collapsed={c}
                icon={<Settings className="w-4 h-4 opacity-65 flex-shrink-0" />}
                label={t("nav.items.catalog")}
                active={
                  currentPage === "settings-branch" ||
                  currentPage === "settings-bank" ||
                  currentPage === "settings-cash-fund" ||
                  currentPage === "sys-tags"
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
          </NavSection>
        )}
    </div>
  );
}
