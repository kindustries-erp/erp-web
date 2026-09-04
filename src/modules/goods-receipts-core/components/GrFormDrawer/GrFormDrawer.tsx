/**
 * GrFormDrawer — Goods Receipt form drawer adapter.
 * Builds type-specific config from useGrDrawer() and delegates rendering
 * to the unified InventoryVoucherFormDrawer shell.
 */
import { useRef, useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useCompanyProfile } from "@/core/api/companyProfileApi";
import { useUIStore } from "@/core/config/uiStore";
import { useT } from "@/core/i18n";
import { inputCls } from "@/shared/components/DrawerModal";
import { CellTextarea } from "@/shared/components/CellTextarea";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { InventoryVoucherFormDrawer } from "@/modules/inventory-core/components/inventory-voucher-drawer/InventoryVoucherFormDrawer";
import { useVoucherClientFilter } from "@/modules/inventory-core/hooks/useVoucherClientFilter";
import { GoodsReceiptPrintTemplate } from "@/shared/components/print-templates/GoodsReceiptPrintTemplate";
import { GoodsReceiptSerialDrawer } from "../GoodsReceiptSerialDrawer";
import type { GrFormDrawerProps, GrTableMode } from "./types";
import { useGrSerialDrawerState } from "./hooks/useGrSerialDrawerState";
import { useGrFormColumns } from "./hooks/useGrFormColumns";
import { GrFormRightPanel } from "./components/GrFormRightPanel";
import { GrFormSectionTitleExtra } from "./components/GrFormSectionTitleExtra";
import { buildGrFormActions } from "./components/GrFormActions";
import { GrFormExcelImport } from "./components/GrFormExcelImport";
import { ModuleEntityCustomFieldsSection } from "@/shared/components/ModuleEntityCustomFieldsSection";

export function GrFormDrawer({ drawer }: GrFormDrawerProps) {
  const {
    open,
    loading,
    editing,
    viewOnly,
    form,
    setForm,
    saveError,
    saving,
    poDetail,
    poOptions,
    itemsDict,
    close,
    setViewOnly,
  } = drawer;

  const t = useT();
  const setGlobalLoading = useUIStore((s) => s.setGlobalLoading);
  useEffect(() => {
    setGlobalLoading(saving);
  }, [saving, setGlobalLoading]);

  const canUpdate = useHasPermission(
    ErpResource.GOODS_RECEIPTS,
    ErpAction.UPDATE,
  );
  const isAdmin = useHasPermission(ErpResource.SUPER_ADMIN, ErpAction.ALL);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `PhieuNhapKho_${editing?.receiptNo || "New"}`,
  });
  const { data: companyProfile } = useCompanyProfile();
  const [isImportOpen, setIsImportOpen] = useState(false);

  const {
    serialDrawerState,
    handleOpenSerialDrawer,
    handleCloseSerialDrawer,
    handleSaveSerialsForLine,
  } = useGrSerialDrawerState(form, setForm);

  const tableMode: GrTableMode = poDetail
    ? "po"
    : !viewOnly
      ? "other-edit"
      : "view";

  const sourceLines = tableMode === "po" ? poDetail?.lines || [] : form.lines;

  const { listHook, processedLines, buildFilterOptions } =
    useVoucherClientFilter({
      tableId: "gr-details-table",
      lines: sourceLines,
      isOpen: open,
      getCode: (line: any) =>
        (line.itemId && itemsDict[line.itemId]
          ? itemsDict[line.itemId].sku
          : line.itemCode) || "",
      getName: (line: any) =>
        line.itemName ||
        (line.itemId && itemsDict[line.itemId]
          ? itemsDict[line.itemId].itemName
          : "") ||
        line.description ||
        "",
      customSort: (a, b, field, isDesc) => {
        if (field === "ordered") {
          return isDesc
            ? Number(b.qtyOrdered ?? 0) - Number(a.qtyOrdered ?? 0)
            : Number(a.qtyOrdered ?? 0) - Number(b.qtyOrdered ?? 0);
        }
        if (field === "remaining") {
          const remA = Math.max(
            0,
            Number(a.qtyOrdered ?? 0) - Number(a.qtyReceived ?? 0),
          );
          const remB = Math.max(
            0,
            Number(b.qtyOrdered ?? 0) - Number(b.qtyReceived ?? 0),
          );
          return isDesc ? remB - remA : remA - remB;
        }
        return null;
      },
    });

  const { tableColumns, summaryRow, actionsColumn } = useGrFormColumns({
    drawer,
    tableMode,
    listHook,
    buildFilterOptions,
    handleOpenSerialDrawer,
    t,
  });

  const tableItems =
    tableMode === "view"
      ? processedLines.filter((l) => Number(l.qtyReceived) > 0)
      : processedLines;

  const getRowKey = (line: any) =>
    tableMode === "po"
      ? line.id || String(Math.random())
      : String(form.lines.indexOf(line));

  const sectionTitle =
    t("Chi tiết") +
    " (" +
    (tableMode === "po" ? (poDetail?.lines?.length ?? 0) : form.lines.length) +
    ")";

  const sectionTitleExtra = (
    <GrFormSectionTitleExtra
      drawer={drawer}
      tableMode={tableMode}
      activeFilterCount={listHook.activeFilterCount}
      onResetFilters={listHook.resetFilters}
      onOpenImport={() => setIsImportOpen(true)}
      t={t}
    />
  );

  const emptyLabel = !form.receiptType
    ? t("Vui lòng chọn loại nhập để tiếp tục.")
    : !poDetail && form.receiptType === "PO"
      ? t("Chọn PO để hiện danh sách hàng cần nhận.")
      : t("Không có dữ liệu");

  const actions = buildGrFormActions({
    drawer,
    isAdmin,
    handlePrint,
    t,
  });

  const statusBadge =
    editing?.status === "DRAFT" ? (
      <span className="inline-flex rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
        {t("Nháp")}
      </span>
    ) : editing?.status === "CANCELLED" ? (
      <span className="inline-flex rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
        {t("Đã hủy")}
      </span>
    ) : undefined;

  const rightPanelContent = <GrFormRightPanel drawer={drawer} t={t} />;

  const remarksContent = (
    <CellTextarea
      className={`${inputCls} min-h-[60px] resize-y`}
      value={form.remarks}
      disabled={viewOnly}
      onValueChange={(val) => setForm((f) => ({ ...f, remarks: val }))}
      placeholder={t("Nhập ghi chú chung nếu có...")}
    />
  );

  return (
    <>
      <InventoryVoucherFormDrawer
        open={open}
        mode={viewOnly ? "view" : editing ? "edit" : "create"}
        noAnimation={!!drawer.unifiedContext}
        title={
          editing
            ? viewOnly
              ? t("Phiếu nhập kho")
              : t("Sửa nhập kho")
            : t("Tạo phiếu nhập kho")
        }
        subtitle={editing?.receiptNo ?? t("Nhập kho")}
        statusBadge={statusBadge}
        onClose={close}
        onToggleEdit={
          viewOnly &&
          editing &&
          canUpdate &&
          !["CANCELLED", "VOIDED"].includes(editing.status || "DRAFT")
            ? () => setViewOnly(false)
            : undefined
        }
        actions={actions}
        loading={loading}
        error={saveError}
        unifiedContext={drawer.unifiedContext}
        // Table
        sectionTitle={sectionTitle}
        sectionTitleExtra={sectionTitleExtra}
        tableItems={tableItems}
        getRowKey={getRowKey}
        tableColumns={tableColumns}
        summaryRow={summaryRow}
        actionsColumn={actionsColumn}
        emptyLabel={emptyLabel}
        // Right panel
        rightPanelContent={rightPanelContent}
        remarksContent={remarksContent}
        customFieldsSlot={
          <ModuleEntityCustomFieldsSection
            moduleKey="GOODS_RECEIPT"
            entityId={editing?.id}
            editMode={!viewOnly}
            globalAttributes={form.globalAttributes}
            onGlobalAttributesChange={(attrs) =>
              setForm((f) => ({ ...f, globalAttributes: attrs }))
            }
            hideCategorySection={true}
            globalTitle={t("moduleConfig.customFields", "Trường tùy chỉnh")}
            globalCollapsible={true}
            globalDefaultCollapsed={false}
          />
        }
        // Slots
        printSlot={
          <div className="hidden">
            <GoodsReceiptPrintTemplate
              ref={printRef}
              companyProfile={companyProfile}
              data={{
                receiptNo: editing?.receiptNo || form.receiptNo || "...",
                receiptDate:
                  editing?.receiptDate ||
                  form.receiptDate ||
                  new Date().toISOString(),
                supplierName:
                  poOptions.find((o) => o.value === form.purchaseOrderId)
                    ?.label || "",
                remarks: form.remarks,
                lines: form.lines.map((l) => {
                  const dictItem = itemsDict[l.itemId];
                  return {
                    itemId: l.itemId,
                    itemCode: dictItem?.sku || l.itemId,
                    itemName: l.itemName || dictItem?.itemName || "",
                    qtyReceived: l.qtyReceived,
                    unitCost: l.unitCost,
                  };
                }),
              }}
            />
          </div>
        }
        importModalSlot={
          <GrFormExcelImport
            isOpen={isImportOpen}
            onClose={() => setIsImportOpen(false)}
            drawer={drawer}
          />
        }
      />
      <GoodsReceiptSerialDrawer
        open={serialDrawerState.open}
        onClose={handleCloseSerialDrawer}
        viewOnly={
          serialDrawerState.viewOnly ??
          (viewOnly || editing?.status === "POSTED")
        }
        itemId={serialDrawerState.itemId}
        itemSku={serialDrawerState.itemSku}
        itemName={serialDrawerState.itemName}
        trackingPolicyCode={serialDrawerState.trackingPolicyCode}
        trackingPolicyName={serialDrawerState.trackingPolicyName}
        requiredQty={serialDrawerState.requiredQty}
        receiptDate={serialDrawerState.receiptDate}
        initialSerials={serialDrawerState.initialSerials}
        onSaveSerials={handleSaveSerialsForLine}
      />
    </>
  );
}
