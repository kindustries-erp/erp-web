import {
  DrawerSection,
  V2DrawerFieldGrid,
  V2DrawerRowList,
  type V2DrawerFieldItem,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import type { ProcurementApi } from "../../../../procurement.types";
import type {
  ProcurementOrderFormErrors,
  ProcurementOrderFormValue,
} from "../../../../form/procurementOrder.form";
import {
  buildOrderEditFields,
  buildOrderViewRows,
} from "./ProcurementOrderHeaderSection.fields";

export interface ProcurementOrderHeaderSectionProps {
  form: ProcurementOrderFormValue;
  errors: ProcurementOrderFormErrors;
  viewing: boolean;
  branchLocked: boolean;
  /** Chi nhánh tùy chọn (Garage): không bắt buộc, bỏ trống được, đặt ngay dưới NCC */
  branchOptional?: boolean;
  /** Số hóa đơn là combobox hóa đơn mua vào (Garage). Cần quyền đọc `invoices`, thiếu thì dùng ô text */
  invoicePicker?: boolean;
  setField: <K extends keyof ProcurementOrderFormValue>(
    key: K,
    value: ProcurementOrderFormValue[K],
  ) => void;
  /** Hiện ô chọn đề nghị mua (chỉ khi tạo mới và có quyền đọc đề nghị) */
  canPickRequest?: boolean;
  /** Tên đề nghị đã chọn, để hiện ở ô và chế độ xem */
  requestLabel?: string;
  requestApi?: ProcurementApi<unknown>;
  onPickRequest?: (requestId: string | null) => void;
}

/**
 * Section đầu đơn mua (cột phải). Lưới 2 cột: Ngày đơn và Ngày dự kiến nhận cùng hàng.
 * Đơn Garage (`branchOptional`) sắp: ngày → đề nghị → số hóa đơn → NCC → chi nhánh → ghi chú.
 * Chi nhánh khóa khi đơn gắn đề nghị.
 */
export function ProcurementOrderHeaderSection({
  form,
  errors,
  viewing,
  branchLocked,
  branchOptional = false,
  invoicePicker = false,
  setField,
  canPickRequest = false,
  requestLabel = "",
  requestApi,
  onPickRequest,
}: ProcurementOrderHeaderSectionProps) {
  const { t } = useV2Translation();
  const canReadInvoices = useV2HasPermission({ collection: "invoices" });
  const title = t("v2.procurement.sections.header", "Thông tin đơn");

  if (viewing) {
    const rows = buildOrderViewRows(form, t, requestLabel, branchOptional);
    return (
      <DrawerSection title={title}>
        <V2DrawerRowList rows={rows} />
      </DrawerSection>
    );
  }

  const fields: V2DrawerFieldItem[] = buildOrderEditFields({
    form,
    errors,
    branchLocked,
    branchOptional,
    invoicePicker: invoicePicker && canReadInvoices,
    canPickRequest,
    requestLabel,
    requestApi,
    onPickRequest,
    setField,
    t,
  });

  return (
    <DrawerSection title={title}>
      <V2DrawerFieldGrid fields={fields} />
    </DrawerSection>
  );
}
