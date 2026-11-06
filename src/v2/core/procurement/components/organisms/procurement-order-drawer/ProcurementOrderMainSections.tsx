import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementLineFormValue } from "../../../form/procurementLine.form";
import type {
  ProcurementOrderFormErrors,
  ProcurementOrderFormValue,
} from "../../../form/procurementOrder.form";
import { ProcurementLinesEditor } from "../procurement-lines-editor/ProcurementLinesEditor";

export interface ProcurementOrderMainSectionsProps {
  form: ProcurementOrderFormValue;
  errors: ProcurementOrderFormErrors;
  viewing: boolean;
  setField: <K extends keyof ProcurementOrderFormValue>(
    key: K,
    value: ProcurementOrderFormValue[K],
  ) => void;
}

const LINES_ERROR_KEY = {
  empty: "v2.procurement.errors.linesEmpty",
  itemName: "v2.procurement.errors.itemName",
  qty: "v2.procurement.errors.qty",
} as const;

/** Phần trái của drawer đơn mua: bảng dòng hàng. Đầu đơn nằm ở cột phải. */
export function ProcurementOrderMainSections({
  form,
  errors,
  viewing,
  setField,
}: ProcurementOrderMainSectionsProps) {
  const { t } = useV2Translation();
  const linesError = errors.lines
    ? t(LINES_ERROR_KEY[errors.lines], "Dòng chứng từ chưa hợp lệ")
    : undefined;

  return (
    <ProcurementLinesEditor
      lines={form.lines}
      onChange={(lines: ProcurementLineFormValue[]) => setField("lines", lines)}
      viewing={viewing}
      priceLabel={t("v2.procurement.lines.price", "Đơn giá")}
      errorText={linesError}
    />
  );
}
