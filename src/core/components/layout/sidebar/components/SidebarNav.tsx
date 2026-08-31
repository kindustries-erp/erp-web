import type { PageKey } from "@/shared/types";
import { useT } from "@/core/i18n";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
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
  ReceiptText,
  Package,
  LayoutDashboard,
  Wallet,
  Settings,
  UserSquare2,
  Car,
  Paperclip,
  Mail,
  Target,
  PackageCheck,
} from "lucide-react";

import { useAuthStore } from "@/modules/auth/domain/authStore";
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
  const { openCustomFieldsDrawer } = useAppStore();
  const { employee } = useAuthStore();
  const isAdminEmail = employee?.email === "admin@liouni.com";

  const canReadSalesOrders = useHasPermission(
    ErpResource.SALES_ORDERS,
    ErpAction.READ,
  );
  const canReadCustomers = useHasPermission(
    ErpResource.BUSINESS_PARTNERS,
    ErpAction.READ,
  );
  const canReadSalesReports = useHasPermission(
    ErpResource.SALES_REPORTS,
    ErpAction.READ,
  );
  const showSales =
    canReadSalesOrders || canReadCustomers || canReadSalesReports;

  const canReadPurchasing = useHasPermission(
    ErpResource.PURCHASE_ORDERS,
    ErpAction.READ,
  );
  const canReadSuppliers = useHasPermission(
    ErpResource.BUSINESS_PARTNERS,
    ErpAction.READ,
  );
  const canReadPurchasingReports = useHasPermission(
    ErpResource.PURCHASING_REPORTS,
    ErpAction.READ,
  );
  const showPurchasing =
    canReadPurchasing || canReadSuppliers || canReadPurchasingReports;

  const canReadInventoryItems = useHasPermission(
    ErpResource.INVENTORY_ITEMS,
    ErpAction.READ,
  );
  const canReadInventoryVouchers = useHasPermission(
    ErpResource.INVENTORY_VOUCHERS,
    ErpAction.READ,
  );
  const showInventory = canReadInventoryItems || canReadInventoryVouchers;

  const canReadVinfast = useHasPermission(ErpResource.VINFAST, ErpAction.READ);
  const showVinfast = canReadVinfast;

  const canReadBom = useHasPermission(ErpResource.BOM, ErpAction.READ);
  const canReadProduction = useHasPermission(
    ErpResource.PRODUCTION,
    ErpAction.READ,
  );
  const showManufacturing = canReadBom || canReadProduction;

  const canReadGarage = useHasPermission(ErpResource.GARAGE, ErpAction.READ);
  const showGarage = canReadGarage;

  const canReadInvoices = useHasPermission(
    ErpResource.INVOICES,
    ErpAction.READ,
  );
  const canReadBankStatements = useHasPermission(
    ErpResource.BANK_STATEMENTS,
    ErpAction.READ,
  );
  const canReadCashStatements = useHasPermission(
    ErpResource.CASH_STATEMENTS,
    ErpAction.READ,
  );
  const showCashflow = canReadBankStatements || canReadCashStatements;
  const showAccounting = canReadInvoices || showCashflow;

  const canReadEmployees = useHasPermission(
    ErpResource.EMPLOYEES,
    ErpAction.READ,
  );
  const showHR = canReadEmployees;

  const canReadAdminUsers = useHasPermission(
    ErpResource.ADMIN_USERS,
    ErpAction.READ,
  );
  const canReadActivityLogs = useHasPermission(
    ErpResource.ACTIVITY_LOGS,
    ErpAction.READ,
  );
  const canReadSysTags = useHasPermission(ErpResource.SYS_TAGS, ErpAction.READ);
  const canReadEmailInbox = useHasPermission(
    ErpResource.EMAIL_INGEST,
    ErpAction.READ,
  );

  const showSettingsAccess = canReadAdminUsers || canReadActivityLogs;
  const showSettingsGeneral =
    canReadAdminUsers ||
    canReadSysTags ||
    canReadBankStatements ||
    canReadCashStatements;
  const showSettingsInventory = canReadInventoryItems;
  const showSettings =
    showSettingsAccess ||
    showSettingsGeneral ||
    showSettingsInventory ||
    canReadEmailInbox;

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      {/* Dashboard */}
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

      {/* Sales */}
      {showSales && (
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
      {showPurchasing && (
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
              icon={<Building2 className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.suppliers")}
              active={currentPage === "erp-suppliers"}
              onClick={() => navTo("erp-suppliers")}
              contextPage="erp-suppliers"
            />
          )}
        </NavSection>
      )}

      {/* Kho (Inventory) */}
      {showInventory && (
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
              icon={<Package className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.erpInventoryStock")}
              active={currentPage === "erp-inventory-stock"}
              onClick={() => navTo("erp-inventory-stock")}
              contextPage="erp-inventory-stock"
            />
          )}
          {canReadInventoryItems && (
            <NavItem
              collapsed={c}
              icon={<Layers className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.erpInventoryTrackingGroup")}
              active={
                currentPage === "erp-inventory-tracking" ||
                currentPage === "erp-inventory-tracking-parts" ||
                currentPage === "erp-inventory-tracking-lot" ||
                currentPage === "erp-inventory-tracking-custom"
              }
              onClick={() => navTo("erp-inventory-tracking")}
              contextPage="erp-inventory-tracking"
            />
          )}
        </NavSection>
      )}

      {/* Manufacturing / BOM / Production */}
      {showManufacturing && (
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
          {(canReadProduction || canReadInventoryItems) && (
            <NavItem
              collapsed={c}
              icon={
                <PackageCheck className="w-4 h-4 opacity-65 flex-shrink-0" />
              }
              label={t("nav.items.erpFinishedGoods", "Thành phẩm")}
              active={currentPage === "erp-finished-goods"}
              onClick={() => navTo("erp-finished-goods")}
              contextPage="erp-finished-goods"
            />
          )}
        </NavSection>
      )}

      {/* GARAGE */}
      {showGarage && (
        <NavSection collapsed={c} label={t("nav.sections.garage", "GARAGE")}>
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
            icon={<Users className="w-4 h-4 opacity-65 flex-shrink-0" />}
            label={t("nav.items.garagePartners", "Đối tác")}
            active={
              currentPage === "garage-partners" ||
              currentPage === "garage-customers"
            }
            onClick={() => navTo("garage-partners")}
            contextPage="garage-partners"
          />
          <NavItem
            collapsed={c}
            icon={<ReceiptText className="w-4 h-4 opacity-65 flex-shrink-0" />}
            label={t("nav.items.garageOpex", "Chi phí vận hành")}
            active={currentPage === "garage-opex"}
            onClick={() => navTo("garage-opex")}
            contextPage="garage-opex"
          />
        </NavSection>
      )}

      {/* VINFAST */}
      {showVinfast && (
        <NavSection collapsed={c} label={t("nav.sections.vinfast")}>
          <NavItem
            collapsed={c}
            icon={<Package className="w-4 h-4 opacity-65 flex-shrink-0" />}
            label={t("nav.items.vinfastPartsGroup", "Phụ tùng Vinfast")}
            active={
              currentPage === "vinfast-parts-stock" ||
              currentPage === "vinfast-parts-dashboard" ||
              currentPage === "vinfast-parts-oto-stock" ||
              currentPage === "vinfast-parts-xemay-stock" ||
              currentPage === "vinfast-parts-oto" ||
              currentPage === "vinfast-parts-xemay" ||
              currentPage === "vinfast-parts"
            }
            onClick={() => navTo("vinfast-parts-stock")}
            contextPage="vinfast-parts-stock"
          />
        </NavSection>
      )}

      {/* Kế toán */}
      {showAccounting && (
        <NavSection collapsed={c} label={t("nav.sections.accounting")}>
          {showCashflow && (
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
              {canReadBankStatements && (
                <NavGroupItem
                  label={t("bankStatement.bankTitle")}
                  active={currentPage === "bank-statement"}
                  onClick={() => navTo("bank-statement")}
                  contextPage="bank-statement"
                />
              )}
              {canReadCashStatements && (
                <NavGroupItem
                  label={t("bankStatement.cashTitle")}
                  active={currentPage === "cash-statement"}
                  onClick={() => navTo("cash-statement")}
                  contextPage="cash-statement"
                />
              )}
            </NavGroup>
          )}
          {canReadInvoices && (
            <NavGroup
              collapsed={c}
              icon={<Receipt className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.erpInvoices")}
              active={
                currentPage === "erp-invoices" ||
                currentPage === "erp-invoices-in" ||
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
                label={t("nav.items.erpInvoices")}
                active={
                  currentPage === "erp-invoices" ||
                  currentPage === "erp-invoices-in"
                }
                onClick={() => navTo("erp-invoices")}
                contextPage="erp-invoices"
              />
              <NavGroupItem
                label="Hóa đơn nháp"
                active={currentPage === "erp-invoices-draft"}
                onClick={() => navTo("erp-invoices-draft")}
                contextPage="erp-invoices-draft"
              />
            </NavGroup>
          )}
          {canReadBankStatements && isAdminEmail && (
            <NavItem
              collapsed={c}
              icon={<Target className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.operatingExpenses", "Chi phí vận hành")}
              active={currentPage === "opex"}
              onClick={() => navTo("opex" as PageKey)}
              contextPage={"opex" as PageKey}
            />
          )}

          {showAccounting && (
            <>
              <NavItem
                collapsed={c}
                icon={<FileText className="w-4 h-4 opacity-65 flex-shrink-0" />}
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
      <NavSection collapsed={c} label={t("nav.sections.admin")}>
        {showHR && (
          <NavItem
            collapsed={c}
            icon={<UserSquare2 className="w-4 h-4 opacity-65 flex-shrink-0" />}
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

      {/* Settings & System */}
      {showSettings && (
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
                <NavGroupItem
                  label={t("thietlap.tabs.ngan-hang")}
                  active={currentPage === "settings-bank"}
                  onClick={() => navTo("settings-bank")}
                  contextPage="settings-bank"
                />
              )}
              {canReadCashStatements && (
                <NavGroupItem
                  label={t("thietlap.tabs.quy")}
                  active={currentPage === "settings-cash-fund"}
                  onClick={() => navTo("settings-cash-fund")}
                  contextPage="settings-cash-fund"
                />
              )}
              {canReadSysTags && (
                <NavGroupItem
                  label={t("nav.items.sysTags")}
                  active={currentPage === "sys-tags"}
                  onClick={() => navTo("sys-tags")}
                  contextPage="sys-tags"
                />
              )}
              {(canReadInvoices || canReadBankStatements || canReadBom) && (
                <NavGroupItem
                  label={t("nav.items.customFields", "Trường tùy chỉnh")}
                  onClick={() => openCustomFieldsDrawer("ALL", "INVOICE")}
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
