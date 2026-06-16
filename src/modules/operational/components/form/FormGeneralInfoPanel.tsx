import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/shared/utils";
import {
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { useT } from "@/core/i18n";
import {
  invoiceOptions,
  salesStatusOptions,
  purchaseStatusOptions,
  expenseStatusOptions,
} from "@/modules/operational/utils/operationalHelpers";
import { useOperationalFormStore } from "@/modules/operational/hooks/useOperationalFormStore";
import { SalesFields } from "@/modules/operational/components/form/SalesFields";
import { ExpenseFields } from "@/modules/operational/components/form/ExpenseFields";
import { PurchaseReceiptHistory } from "@/modules/operational/components/PurchaseReceiptHistory";
import type { FormVariant } from "@/modules/operational/utils/operationalHelpers";
import type { ErpPoReceipt } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";

interface FormGeneralInfoPanelProps {
  variant: FormVariant;
  isPurchaseLocked: boolean;
  isPurchaseFullyLocked: boolean;
  purchaseFieldLocked: (
    field: "description" | "qty" | "expectedDate" | "status" | "poNo",
  ) => boolean;
  viewOnly?: boolean;
  branchOptions: Array<{ value: string; label: string }>;
  partnerOptions: Array<{ value: string; label: string }>;
  poReceipts?: ErpPoReceipt[];
}

/**
 * Cột phải của OperationalFormDrawer — thông tin chung + fields theo variant.
 * Extracted từ OperationalFormDrawer.tsx (dòng 1007–1318).
 * Có collapsible animation.
 */
export function FormGeneralInfoPanel({
  variant,
  isPurchaseLocked,
  isPurchaseFullyLocked,
  purchaseFieldLocked,
  viewOnly,
  branchOptions,
  partnerOptions,
  poReceipts,
}: FormGeneralInfoPanelProps) {
  const t = useT();
  const {
    showGeneralInfo,
    setShowGeneralInfo,
    docNo,
    setDocNo,
    branchId,
    setBranchId,
    partnerId,
    setPartnerId,
    partnerNameSnapshot,
    setPartnerNameSnapshot,
    documentDate,
    setDocumentDate,
    expectedDate,
    setExpectedDate,
    dueDate,
    setDueDate,
    invoiceStatus,
    setInvoiceStatus,
    status,
    setStatus,
    notes,
    setNotes,
    // sales fields
    vehiclePlate,
    setVehiclePlate,
    vehicleVin,
    setVehicleVin,
    vehicleModel,
    setVehicleModel,
    serviceAdvisorName,
    setServiceAdvisorName,
    // expense fields
    title,
    setTitle,
    expenseCategory,
    setExpenseCategory,
    recurrenceType,
    setRecurrenceType,
    recurrenceInterval,
    setRecurrenceInterval,
    recurrenceStartDate,
    setRecurrenceStartDate,
    recurrenceEndDate,
    setRecurrenceEndDate,
    nextDueDate,
    setNextDueDate,
    autoGenerateNext,
    setAutoGenerateNext,
    supplierInvoiceNo,
    setSupplierInvoiceNo,
  } = useOperationalFormStore();

  const statusOptions =
    variant === "sales"
      ? salesStatusOptions
      : variant === "purchase"
        ? purchaseStatusOptions
        : expenseStatusOptions;

  return (
    <div
      className={cn(
        "shrink-0 order-1 xl:order-2 space-y-4 transition-all duration-300 xl:sticky xl:top-0",
        showGeneralInfo ? "w-full xl:w-[320px]" : "w-full xl:w-[52px]",
      )}
    >
      <DrawerSection
        title={
          <span
            className={cn(
              "transition-all duration-300 inline-block overflow-hidden whitespace-nowrap align-middle",
              showGeneralInfo
                ? "max-w-[200px] opacity-100"
                : "max-w-0 opacity-0",
            )}
          >
            {t("Thông tin chung")}
          </span>
        }
        titleExtra={
          <button
            type="button"
            onClick={() => setShowGeneralInfo((s) => !s)}
            className="p-1 -mr-1 rounded hover:bg-muted text-muted-foreground transition-colors"
            title={showGeneralInfo ? t("Thu gọn") : t("Mở rộng")}
          >
            {showGeneralInfo ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        }
      >
        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            showGeneralInfo ? "opacity-100" : "opacity-0",
          )}
          style={{ gridTemplateRows: showGeneralInfo ? "1fr" : "0fr" }}
        >
          <div
            className="overflow-x-hidden overflow-y-auto w-full xl:max-h-[calc(100vh-190px)]"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex flex-col gap-3 pt-1 min-w-[280px]">
              {/* Số chứng từ */}
              <DrawerField label={t("Số chứng từ")}>
                <input
                  className={inputCls}
                  value={docNo}
                  disabled={purchaseFieldLocked("poNo")}
                  placeholder={
                    variant === "purchase" ? "PO-YYYYMM001" : undefined
                  }
                  onChange={(e) => setDocNo(e.target.value)}
                />
              </DrawerField>

              {/* Chi nhánh — chỉ sales & expenses */}
              {variant !== "purchase" && (
                <DrawerField label={t("Chi nhánh")}>
                  <Combobox
                    options={branchOptions}
                    value={branchId}
                    disabled={isPurchaseLocked}
                    onChange={(v) => setBranchId(v || "")}
                  />
                </DrawerField>
              )}

              {/* Khách hàng / Nhà cung cấp */}
              <DrawerField
                label={
                  variant === "sales" ? t("Khách hàng") : t("Nhà cung cấp")
                }
                required={variant === "purchase" || variant === "expenses"}
              >
                <Combobox
                  options={partnerOptions}
                  value={partnerId}
                  disabled={isPurchaseLocked}
                  onChange={(v) => setPartnerId(v || "")}
                />
              </DrawerField>

              {/* Tên snapshot — chỉ sales & expenses */}
              {variant !== "purchase" && (
                <DrawerField label={t("Tên snapshot")}>
                  <input
                    className={inputCls}
                    value={partnerNameSnapshot}
                    disabled={isPurchaseLocked}
                    onChange={(e) => setPartnerNameSnapshot(e.target.value)}
                  />
                </DrawerField>
              )}

              {/* Ngày chứng từ */}
              <DrawerField label={t("Ngày chứng từ")} required>
                <DatePicker
                  className={inputCls}
                  value={documentDate?.slice(0, 10) || ""}
                  disabled={isPurchaseLocked}
                  onChange={(v) => setDocumentDate(v)}
                />
              </DrawerField>

              {/* Ngày nhận dự kiến — chỉ purchase */}
              {variant === "purchase" && (
                <DrawerField label={t("Ngày nhận dự kiến")}>
                  <DatePicker
                    className={inputCls}
                    value={expectedDate?.slice(0, 10) || ""}
                    disabled={purchaseFieldLocked("expectedDate")}
                    onChange={(v) => setExpectedDate(v)}
                  />
                </DrawerField>
              )}

              {/* Số HĐ nhà cung cấp — chỉ purchase */}
              {variant === "purchase" && (
                <DrawerField label={t("Số HĐ nhà cung cấp")}>
                  <input
                    className={inputCls}
                    value={supplierInvoiceNo}
                    disabled={isPurchaseFullyLocked}
                    placeholder="Số hóa đơn VAT từ nhà cung cấp"
                    onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                  />
                </DrawerField>
              )}

              {/* Ngày đến hạn — chỉ sales & expenses */}
              {variant !== "purchase" && (
                <DrawerField label={t("Ngày đến hạn")}>
                  <DatePicker
                    className={inputCls}
                    value={dueDate?.slice(0, 10) || ""}
                    disabled={isPurchaseLocked}
                    onChange={(v) => setDueDate(v)}
                  />
                </DrawerField>
              )}

              {/* Trạng thái hóa đơn — chỉ sales & expenses */}
              {variant !== "purchase" && (
                <DrawerField label={t("Trạng thái hóa đơn")}>
                  <Combobox
                    options={invoiceOptions}
                    value={invoiceStatus}
                    disabled={isPurchaseLocked}
                    onChange={(v) => setInvoiceStatus(v || "NO_INVOICE")}
                    allowClear={false}
                  />
                </DrawerField>
              )}

              {/* Trạng thái — chỉ sales & expenses */}
              {variant !== "purchase" && (
                <DrawerField label={t("Trạng thái")}>
                  <Combobox
                    options={statusOptions}
                    value={status}
                    disabled={purchaseFieldLocked("status")}
                    onChange={(v) => setStatus(v || "DRAFT")}
                    allowClear={false}
                  />
                </DrawerField>
              )}

              {/* Fields theo variant */}
              {variant === "sales" && (
                <SalesFields
                  vehiclePlate={vehiclePlate}
                  vehicleVin={vehicleVin}
                  vehicleModel={vehicleModel}
                  serviceAdvisorName={serviceAdvisorName}
                  expectedDate={expectedDate}
                  disabled={isPurchaseLocked}
                  onVehiclePlate={setVehiclePlate}
                  onVehicleVin={setVehicleVin}
                  onVehicleModel={setVehicleModel}
                  onServiceAdvisorName={setServiceAdvisorName}
                  onExpectedDate={setExpectedDate}
                />
              )}

              {variant === "expenses" && (
                <ExpenseFields
                  title={title}
                  expenseCategory={expenseCategory}
                  recurrenceType={recurrenceType}
                  recurrenceInterval={recurrenceInterval}
                  recurrenceStartDate={recurrenceStartDate}
                  recurrenceEndDate={recurrenceEndDate}
                  nextDueDate={nextDueDate}
                  autoGenerateNext={autoGenerateNext}
                  disabled={isPurchaseLocked}
                  onTitle={setTitle}
                  onExpenseCategory={setExpenseCategory}
                  onRecurrenceType={setRecurrenceType}
                  onRecurrenceInterval={setRecurrenceInterval}
                  onRecurrenceStartDate={setRecurrenceStartDate}
                  onRecurrenceEndDate={setRecurrenceEndDate}
                  onNextDueDate={setNextDueDate}
                  onAutoGenerateNext={setAutoGenerateNext}
                />
              )}

              {/* Ghi chú */}
              <DrawerField label={t("Ghi chú")}>
                <textarea
                  className={`${inputCls} min-h-[84px]`}
                  value={notes}
                  disabled={viewOnly || isPurchaseFullyLocked}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </DrawerField>

              {/* Lịch sử nhập kho — chỉ purchase viewOnly */}
              {variant === "purchase" && viewOnly && poReceipts && (
                <div className="mt-2 border-t border-border pt-4">
                  <PurchaseReceiptHistory receipts={poReceipts} />
                </div>
              )}
            </div>
          </div>
        </div>
      </DrawerSection>
    </div>
  );
}
