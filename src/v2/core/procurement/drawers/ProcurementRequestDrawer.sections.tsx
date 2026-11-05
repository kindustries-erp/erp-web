import * as React from "react";
import { DrawerSection } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { ProcurementLinesEditor } from "../components/organisms/procurement-lines-editor/ProcurementLinesEditor";
import {
  ProcurementRequestHeaderSection,
  type ProcurementRequestHeaderSectionProps,
} from "./sections/ProcurementRequestHeaderSection";
import {
  ProcurementRequestSummarySection,
  type ProcurementRequestSummarySectionProps,
} from "./sections/ProcurementRequestSummarySection";
import type { ProcurementLineFormValue } from "../form/procurementLine.form";
import type {
  ProcurementRequestFormErrors,
  ProcurementRequestFormValue,
} from "../form/procurementRequest.form";
import type { ProcurementRequestDetail } from "../procurement.types";

export interface ProcurementRequestSectionsProps {
  form: ProcurementRequestFormValue;
  errors: ProcurementRequestFormErrors;
  headerViewing: boolean;
  linesViewing: boolean;
  branchLocked: boolean;
  detail?: ProcurementRequestDetail;
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

/** Phần trái: đầu đề đề nghị (chỉ nhập lúc tạo) và dòng hàng. */
export function ProcurementRequestMainSections(
  props: ProcurementRequestSectionsProps,
) {
  const { t } = useV2Translation();
  const { form, errors, headerViewing, linesViewing, branchLocked, setField } =
    props;
  const linesError = errors.lines
    ? t(LINES_ERROR_KEY[errors.lines], "Dòng chứng từ chưa hợp lệ")
    : undefined;

  return (
    <div className="space-y-3">
      <ProcurementRequestHeaderSection
        form={form}
        errors={errors}
        headerViewing={headerViewing}
        branchLocked={branchLocked}
        setField={setField}
      />

      <DrawerSection
        title={t("v2.procurement.sections.lines", "Dòng hàng")}
        count={form.lines.length}
      >
        <ProcurementLinesEditor
          lines={form.lines}
          onChange={(lines: ProcurementLineFormValue[]) =>
            setField("lines", lines)
          }
          viewing={linesViewing}
          priceLabel={t("v2.procurement.lines.estPrice", "Đơn giá dự kiến")}
          errorText={linesError}
        />
      </DrawerSection>
    </div>
  );
}

/** Re-export section tổng quan bên phải. */
export const ProcurementRequestSummary = ProcurementRequestSummarySection;
export {
  ProcurementRequestHeaderSection,
  ProcurementRequestSummarySection,
  type ProcurementRequestHeaderSectionProps,
  type ProcurementRequestSummarySectionProps,
};
