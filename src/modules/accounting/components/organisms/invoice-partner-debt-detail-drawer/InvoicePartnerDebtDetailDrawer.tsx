import React from "react";
import { useTranslation } from "react-i18next";
import { Building2, ReceiptText, TrendingUp } from "lucide-react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { PillTabs } from "@/shared/components/PillTabs";
import {
  ErpInvoicePartnerInvoicesSection,
  PartnerDebtAnalyticsSection,
  ErpInvoiceInternalDrawer,
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
  VietnamInvoiceTemplate,
} from "@/modules/erp-invoices-core/components";
import { InvoicePartnerDebtRightPanel } from "../../molecules/invoice-partner-debt-right-panel";
import { useInvoicePartnerDebtDetailDrawer } from "./InvoicePartnerDebtDetailDrawer.hook";
import type { InvoicePartnerDebtDetailDrawerProps } from "./InvoicePartnerDebtDetailDrawer.type";

export const InvoicePartnerDebtDetailDrawer = React.memo(
  function InvoicePartnerDebtDetailDrawer(
    props: InvoicePartnerDebtDetailDrawerProps,
  ) {
    const { t } = useTranslation(["debts", "common"]);
    const {
      isCustomer,
      activeSubTab,
      setActiveSubTab,
      invoices,
      isLoadingInvoices,
      isLoadingStats,
      totals,
      resolvedName,
      partnerAddress,
      formHook,
    } = useInvoicePartnerDebtDetailDrawer(props);

    const leftPanel = (
      <div className="space-y-3 pb-2 flex-1 min-w-0 w-full flex flex-col">
        {/* Thanh Điều Hướng Sub-Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
          <div className="flex items-center gap-2">
            <PillTabs<"invoices" | "analytics">
              size="sm"
              value={activeSubTab}
              onValueChange={setActiveSubTab}
              items={[
                {
                  value: "invoices",
                  label: t(
                    "debts:drawer.tabInvoices",
                    "1. Chi tiết theo đối tượng",
                  ),
                  icon: ReceiptText,
                  badgeCount: invoices.length > 0 ? invoices.length : undefined,
                },
                {
                  value: "analytics",
                  label: t(
                    "debts:drawer.tabAnalytics",
                    "2. Biến động & Phân tích",
                  ),
                  icon: TrendingUp,
                },
              ]}
            />
          </div>
        </div>

        {/* Nội Dung Theo Sub-Tab */}
        {activeSubTab === "invoices" ? (
          <ErpInvoicePartnerInvoicesSection
            taxCode={props.taxCode}
            partnerName={props.partnerName}
            partnerType={props.partnerType}
            direction={isCustomer ? "OUT" : "IN"}
            onPreviewInvoice={(subInv) => formHook.openInternal(subInv as any)}
          />
        ) : (
          <PartnerDebtAnalyticsSection
            invoices={invoices}
            isLoading={isLoadingStats || isLoadingInvoices}
            isCustomer={isCustomer}
          />
        )}
      </div>
    );

    return (
      <>
        <StandardFormDrawer
          open={props.open}
          onClose={props.onClose}
          mode="view"
          title={resolvedName}
          subtitle={
            <span className="text-xs text-muted-foreground font-mono font-normal">
              MST:{" "}
              {props.taxCode === "KHONG_MST" || !props.taxCode
                ? "Không có MST"
                : props.taxCode}{" "}
              •{" "}
              {isCustomer
                ? t("debts:tabs.customers", "Khách hàng")
                : t("debts:tabs.suppliers", "Nhà cung cấp")}
            </span>
          }
          icon={<Building2 className="w-5 h-5 text-primary shrink-0" />}
          size="xl"
          layout="2-columns"
          collapsibleRightPanel={true}
          leftPanel={leftPanel}
          rightPanel={
            <InvoicePartnerDebtRightPanel
              resolvedName={resolvedName}
              taxCode={props.taxCode}
              isCustomer={isCustomer}
              partnerAddress={partnerAddress}
              totals={totals}
              invoicesCount={invoices.length}
            />
          }
        />

        {/* Full Detail Invoice Internal Drawer */}
        <ErpInvoiceInternalDrawer
          open={formHook.internalDrawerOpen}
          onClose={formHook.closeDrawer}
          editMode={formHook.editMode}
          detailInvoice={formHook.detailInvoice}
          startEdit={formHook.startEdit}
          saving={formHook.saving}
          handleSave={formHook.handleSave}
          cancelEdit={formHook.cancelEdit}
          form={formHook.form}
          fieldSet={(key: string, value: any) =>
            formHook.setForm((prev) => ({ ...prev, [key]: value }))
          }
          direction={formHook.form.direction || "IN"}
          postingState={formHook.postingState}
          pendingUnpost={formHook.pendingUnpost}
          onUnpost={() => formHook.setPendingUnpost(true)}
          rightPanel={
            <div className="flex flex-col gap-4">
              <ErpInvoiceInternalSidebar
                form={formHook.form}
                editMode={formHook.editMode}
                fieldSet={(key: string, value: any) =>
                  formHook.setForm((prev) => ({ ...prev, [key]: value }))
                }
                invoiceId={formHook.detailInvoice?.id ?? null}
                pendingTagIds={formHook.pendingTagIds}
                onPendingTagsChange={formHook.setPendingTagIds}
                direction={formHook.form.direction || "IN"}
                detailInvoice={formHook.detailInvoice}
                onRefreshDetail={formHook.handleSyncDetail}
              />
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <ErpInvoiceInternalMain
              detailInvoice={formHook.detailInvoice}
              invoicePreview={
                formHook.detailInvoice ? (
                  <VietnamInvoiceTemplate invoice={formHook.detailInvoice} />
                ) : undefined
              }
            />
          </div>
        </ErpInvoiceInternalDrawer>
      </>
    );
  },
);
