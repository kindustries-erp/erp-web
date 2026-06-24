import type { PageKey } from "@/shared/types";
import { useT } from "@/core/i18n";
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
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      {/* Sales */}
      <div className="sidebar-nav-section py-2">
        <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
          {t("nav.sections.sales")}
        </div>
        <NavItem
          collapsed={c}
          icon={<Boxes className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.erpSalesOrders")}
          active={currentPage === "erp-sales-orders"}
          onClick={() => navTo("erp-sales-orders")}
          contextPage="erp-sales-orders"
        />
        <NavItem
          collapsed={c}
          icon={<Users className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.customers")}
          active={currentPage === "erp-customers"}
          onClick={() => navTo("erp-customers")}
          contextPage="erp-customers"
        />
      </div>

      {/* Purchasing */}
      <div className="sidebar-nav-section py-2">
        <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
          {t("nav.sections.purchasing")}
        </div>
        <NavItem
          collapsed={c}
          icon={<FileText className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.purchasing")}
          active={currentPage === "purchasing"}
          onClick={() => navTo("purchasing")}
          contextPage="purchasing"
        />
        <NavItem
          collapsed={c}
          icon={<Building2 className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.suppliers")}
          active={currentPage === "erp-suppliers"}
          onClick={() => navTo("erp-suppliers")}
          contextPage="erp-suppliers"
        />
      </div>

      {/* Kho */}
      <div className="sidebar-nav-section py-2">
        <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
          {t("nav.sections.inventory")}
        </div>
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
          <NavGroupItem
            label={t("nav.items.erpInventoryStock")}
            active={currentPage === "erp-inventory-stock"}
            onClick={() => navTo("erp-inventory-stock")}
            contextPage="erp-inventory-stock"
          />
          <NavGroupItem
            label={t("nav.items.erpInventoryTracking")}
            active={currentPage === "erp-inventory-tracking"}
            onClick={() => navTo("erp-inventory-tracking")}
            contextPage="erp-inventory-tracking"
          />
          <NavGroupItem
            label={t("nav.items.erpInventoryVouchers")}
            active={currentPage === "erp-inventory-vouchers"}
            onClick={() => navTo("erp-inventory-vouchers")}
            contextPage="erp-inventory-vouchers"
          />
        </NavGroup>

        <NavItem
          collapsed={c}
          icon={<Layers className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.erpInventoryMasters")}
          active={currentPage === "erp-inventory-masters"}
          onClick={() => navTo("erp-inventory-masters")}
          contextPage="erp-inventory-masters"
        />
      </div>

      {__APP_ENV__ !== "klotus-production" && (
        <>
          {/* Manufacturing / BOM / Production */}
          <div className="sidebar-nav-section py-2">
            <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
              {t("nav.sections.manufacturing")}
            </div>
            <NavItem
              collapsed={c}
              icon={<Network className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.erpBom")}
              active={currentPage === "erp-bom"}
              onClick={() => navTo("erp-bom")}
              contextPage="erp-bom"
            />
            <NavItem
              collapsed={c}
              icon={<Factory className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.erpProduction")}
              active={currentPage === "erp-production"}
              onClick={() => navTo("erp-production")}
              contextPage="erp-production"
            />
          </div>
          {/* Kế toán */}
          <div className="sidebar-nav-section py-2">
            <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
              {t("nav.sections.accounting")}
            </div>
            <NavItem
              collapsed={c}
              icon={<Receipt className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.erpInvoices")}
              active={currentPage === "erp-invoices"}
              onClick={() => navTo("erp-invoices")}
              contextPage="erp-invoices"
            />
          </div>
          {/* Hệ thống / Admin */}
          <div className="sidebar-nav-section py-2">
            <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
              {t("nav.sections.system")}
            </div>
            <NavItem
              collapsed={c}
              icon={<Users className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.erpEmployees")}
              active={currentPage === "erp-employees"}
              onClick={() => navTo("erp-employees")}
              contextPage="erp-employees"
            />
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
            <NavItem
              collapsed={c}
              icon={<History className="w-4 h-4 opacity-65 flex-shrink-0" />}
              label={t("nav.items.activitylog")}
              active={currentPage === "erp-activity-logs"}
              onClick={() => navTo("erp-activity-logs")}
              contextPage="erp-activity-logs"
            />
          </div>
        </>
      )}
    </div>
  );
}
