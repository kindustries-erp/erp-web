import * as React from "react";
import { DrawerSection } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementLineFormValue } from "../../../form/procurementLine.form";
import type {
  ProcurementRequestFormErrors,
  ProcurementRequestFormValue,
} from "../../../form/procurementRequest.form";
import type { ProcurementRequestDetail } from "../../../procurement.types";
import { ProcurementLinesEditor } from "../procurement-lines-editor/ProcurementLinesEditor";
import { ProcurementRequestHeaderSection } from "./sections/ProcurementRequestHeaderSection";

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
