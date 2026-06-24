import { useTranslation } from "react-i18next";
import { PageLayout } from "@/shared/components/PageLayout";
import { Button } from "@/shared/components/ui/Button";
import { FilterPanel, FilterButton } from "@/shared/components/FilterPanel";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { money } from "@/shared/utils/format";

import { useErpInvoicesList } from "@/modules/erp-invoices-core/hooks/useErpInvoicesList";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";

import { ErpInvoiceListTable } from "@/modules/erp-invoices-core/components/ErpInvoiceListTable";
import { ErpInvoiceDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceDrawer";
import { ErpInvoiceFormGeneral } from "@/modules/erp-invoices-core/components/ErpInvoiceFormGeneral";
import { ErpInvoiceFormItems } from "@/modules/erp-invoices-core/components/ErpInvoiceFormItems";
import { InvoiceXmlUploadModal } from "@/modules/erp-invoices-core/components/InvoiceXmlUploadModal";
import { PortalImportTab } from "@/modules/erp-invoices-core/components/PortalImportTab";

import { PlusCircle, Receipt, FileUp, RefreshCw } from "lucide-react";
import { useState } from "react";

type TabValue = "IN" | "OUT" | "PORTAL";

export function ErpInvoicePage() {
  const { t } = useTranslation("erpInvoices");

  const listHook = useErpInvoicesList();
  const formHook = useErpInvoiceForm(listHook.loadInvoices);
  const [activeTab, setActiveTab] = useState<TabValue>("IN");
  const [xmlModalOpen, setXmlModalOpen] = useState(false);

  const DIRECTION_TABS = [
    { value: "IN", label: t("inbound", "Hóa đơn mua vào") },
    { value: "OUT", label: t("outbound", "Hóa đơn bán ra") },
    { value: "PORTAL", label: t("portalTab", "HĐDT Portal") },
  ];

  const isPortal = activeTab === "PORTAL";

  function fmtAmt(val: string | null | undefined) {
    if (val == null) return "—";
    const n = Number(val);
    return isNaN(n) ? "—" : money(n);
  }

  function fieldSet(key: string, value: unknown) {
    formHook.setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="erp-page-root h-full">
      <PageLayout
        title={t("invoice", "Hóa đơn")}
        desc="Quản lý hóa đơn đầu vào, đầu ra"
        icon={<Receipt className="h-4 w-4" />}
        actions={
          <div className="flex items-center gap-2">
            {!isPortal && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void listHook.loadInvoices()}
                  disabled={listHook.loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-1.5 ${listHook.loading ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline-block">
                    {t("reload", "Tải lại")}
                  </span>
                </Button>
                <FilterButton
                  onClick={listHook.filterPanel.togglePanel}
                  activeCount={listHook.filterPanel.activeFilterCount}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setXmlModalOpen(true)}
                >
                  <FileUp className="w-4 h-4 mr-1.5" />
                  {t("importXml", "Import XML")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => formHook.openNew(listHook.direction)}
                >
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  {t("createInvoice", "Tạo hóa đơn")}
                </Button>
              </>
            )}
          </div>
        }
        tabs={DIRECTION_TABS}
        activeTab={activeTab}
        onTabChange={(v) => setActiveTab(v as TabValue)}
      >
        {isPortal ? (
          <PortalImportTab
            onImported={(dir) => {
              setActiveTab(dir);
              listHook.setDirection(dir);
              void listHook.loadInvoices();
            }}
          />
        ) : (
          <div className="flex items-start">
            <div className="flex-1 min-w-0 space-y-4">
              <ErpInvoiceListTable
                direction={listHook.direction}
                invoices={listHook.invoices}
                loading={listHook.loading}
                page={listHook.page}
                total={listHook.total}
                totalPages={listHook.totalPages}
                sortBy={listHook.sortBy}
                sortOrder={listHook.sortOrder}
                onPage={listHook.setPage}
                onSort={listHook.handleSort}
                openDetail={formHook.openDetail}
                onDeleteConfirm={(inv) => {
                  formHook.openDetail(inv);
                  formHook.setDeleteConfirm(true);
                }}
                onCancelConfirm={(inv) => {
                  formHook.openDetail(inv);
                  formHook.setCancelConfirm(true);
                }}
              />
            </div>
            <FilterPanel
              config={{
                search: true,
                period: true,
                noDefaultPeriod: true,
                status: {
                  options: listHook.STATUS_OPTIONS,
                  placeholder: t("filters", "Tất cả trạng thái"),
                },
              }}
              filter={listHook.filterPanel}
            />
          </div>
        )}
      </PageLayout>

      {!isPortal && (
        <>
          <ErpInvoiceDrawer
            open={formHook.drawerOpen}
            onClose={formHook.closeDrawer}
            editMode={formHook.editMode}
            detailInvoice={formHook.detailInvoice}
            startEdit={formHook.startEdit}
            saving={formHook.saving}
            handleSave={formHook.handleSave}
            setEditMode={formHook.setEditMode}
            setDeleteConfirm={formHook.setDeleteConfirm}
          >
            <div className="flex flex-col gap-5">
              {formHook.formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
                  {formHook.formError}
                </div>
              )}
              <div className="flex flex-col xl:flex-row gap-6 items-start w-full max-w-full">
                <ErpInvoiceFormItems
                  form={formHook.form}
                  editMode={formHook.editMode}
                  setForm={formHook.setForm}
                  fmtAmt={fmtAmt}
                />
                <ErpInvoiceFormGeneral
                  form={formHook.form}
                  editMode={formHook.editMode}
                  fieldSet={fieldSet}
                  fmtAmt={fmtAmt}
                />
              </div>
            </div>
          </ErpInvoiceDrawer>

          <ConfirmModal
            open={formHook.deleteConfirm}
            onCancel={() => formHook.setDeleteConfirm(false)}
            title="Xóa hóa đơn"
            message={`Bạn có chắc muốn xóa hóa đơn ${formHook.detailInvoice?.invoiceNo}? Thao tác này không thể hoàn tác.`}
            confirmLabel="Xóa"
            danger
            loading={formHook.saving}
            onConfirm={formHook.handleDelete}
          />

          <ConfirmModal
            open={formHook.cancelConfirm}
            onCancel={() => formHook.setCancelConfirm(false)}
            title="Hủy hóa đơn"
            message={`Bạn có chắc muốn hủy hóa đơn ${formHook.detailInvoice?.invoiceNo}?`}
            confirmLabel="Đồng ý hủy"
            danger
            loading={formHook.saving}
            onConfirm={formHook.handleCancel}
          />
        </>
      )}

      <InvoiceXmlUploadModal
        open={xmlModalOpen}
        onClose={() => setXmlModalOpen(false)}
        onImported={(id, dir) => {
          listHook.setDirection(dir);
          void listHook.loadInvoices();
        }}
      />
    </div>
  );
}
