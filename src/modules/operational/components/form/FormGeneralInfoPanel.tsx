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
import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";
import type { FormVariant } from "@/modules/operational/utils/operationalHelpers";

interface FormGeneralInfoPanelProps {
  variant: FormVariant;
  isPurchaseLocked: boolean;
  purchaseFieldLocked: (
    field: "description" | "qty" | "expectedDate" | "status" | "poNo",
  ) => boolean;
  viewOnly?: boolean;
  branchOptions: Array<{ value: string; label: string }>;
  partnerOptions: Array<{ value: string; label: string; searchText?: string }>;
  /** ID of the existing document (null when creating) */
  entityId?: string | null;
  /** Entity type string for tags: 'erp_purchase_order' | 'erp_sales_order' | 'erp_expense' */
  entityType?: "erp_purchase_order" | "erp_sales_order" | "erp_expense";
  /** Pending tag IDs for new-create Option B flow */
  pendingTagIds?: string[];
  onPendingTagsChange?: (ids: string[]) => void;
  isAdminEmail?: boolean;
}

/**
 * Cột phải của OperationalFormDrawer — thông tin chung + fields theo variant.
 */
export function FormGeneralInfoPanel({
  variant,
  isPurchaseLocked,
  purchaseFieldLocked,
  viewOnly,
  branchOptions,
  partnerOptions,
  entityId,
  entityType,
  pendingTagIds = [],
  onPendingTagsChange,
  isAdminEmail,
}: FormGeneralInfoPanelProps) {
  const t = useT();
  const {
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
  } = useOperationalFormStore();

  const statusOptions =
    variant === "sales"
      ? salesStatusOptions
      : variant === "purchase"
        ? purchaseStatusOptions
        : expenseStatusOptions;

  return (
    <div className="space-y-4">
      <DrawerSection title={t("Thông tin chung")}>
        <div className="flex flex-col gap-3 pt-1">
          {/* Số chứng từ */}
          <DrawerField label={t("Số chứng từ")}>
            <input
              className={inputCls}
              value={docNo}
              disabled={purchaseFieldLocked("poNo")}
              placeholder={variant === "purchase" ? "PO-YYYYMM001" : undefined}
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
            label={variant === "sales" ? t("Khách hàng") : t("Nhà cung cấp")}
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

          {/* Tags — purchase & sales only */}
          {isAdminEmail &&
            (variant === "purchase" || variant === "sales") &&
            entityType && (
              <DrawerField label={t("Thẻ nhãn")}>
                {entityId ? (
                  <EntityTagSelector
                    entityType={entityType}
                    entityId={entityId}
                    readOnly={viewOnly}
                  />
                ) : !viewOnly ? (
                  <EntityTagSelector
                    entityType={entityType}
                    entityId="__pending__"
                    readOnly={false}
                    pendingMode
                    pendingTagIds={pendingTagIds}
                    onPendingChange={onPendingTagsChange}
                  />
                ) : null}
              </DrawerField>
            )}
        </div>
      </DrawerSection>

      <DrawerSection title={t("Ghi chú")}>
        <div className="overflow-hidden">
          <textarea
            className={`${inputCls} min-h-[84px] w-full mt-1 mb-2`}
            value={notes}
            disabled={viewOnly}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("Nhập ghi chú...")}
          />
        </div>
      </DrawerSection>
    </div>
  );
}
