import * as React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementLineFormValue } from "../../../form/procurementLine.form";
import type {
  ProcurementRequestFormErrors,
  ProcurementRequestFormValue,
} from "../../../form/procurementRequest.form";
import { ProcurementLinesEditor } from "../procurement-lines-editor/ProcurementLinesEditor";

export interface ProcurementRequestSectionsProps {
  form: ProcurementRequestFormValue;
  errors: ProcurementRequestFormErrors;
  linesViewing: boolean;
  setField: <K extends keyof ProcurementRequestFormValue>(
    key: K,
    value: ProcurementRequestFormValue[K],
  ) => void;
}

const LINES_ERROR_KEY = {
  empty: "v2.procurement.errors.linesEmpty",
  itemName: "v2.procurement.errors.itemName",
  qty: "v2.procurement.errors.qty",
} as const;

/** Phần trái của drawer đề nghị: bảng dòng hàng. Đầu đề nằm ở cột phải. */
export function ProcurementRequestMainSections({
  form,
  errors,
  linesViewing,
  setField,
}: ProcurementRequestSectionsProps) {
  const { t } = useV2Translation();
  const linesError = errors.lines
    ? t(LINES_ERROR_KEY[errors.lines], "Dòng chứng từ chưa hợp lệ")
    : undefined;

  return (
    <ProcurementLinesEditor
      lines={form.lines}
      onChange={(lines: ProcurementLineFormValue[]) => setField("lines", lines)}
      viewing={linesViewing}
      priceLabel={t("v2.procurement.lines.estPrice", "Đơn giá dự kiến")}
      errorText={linesError}
    />
  );
}
