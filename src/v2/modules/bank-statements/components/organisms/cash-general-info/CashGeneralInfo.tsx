import {
  DrawerField,
  DrawerRow,
  DrawerSection,
  V2MultiCombobox,
  V2Textarea,
} from "@/v2/shared/components";
import { BusinessPartnerPicker } from "@/v2/modules/business-partners/components/organisms/business-partner-picker";
import { CashClassificationFields } from "../../molecules/cash-classification-fields";
import type { CashGeneralInfoProps } from "./CashGeneralInfo.type";

/** Cột phải của drawer: chi nhánh, đối tượng, ghi chú và phân loại dòng tiền */
export function CashGeneralInfo(props: CashGeneralInfoProps) {
  const { t, editMode, draft, branchOptions, transaction } = props;
  const empty = t("v2.bankStatements.cashDetail.labels.empty");
  const direction = Number(transaction.creditAmount) > 0 ? "OUT" : "IN";
  const branchLabels = draft.branchIds
    .map((id) => branchOptions.find((b) => b.value === id)?.label)
    .filter(Boolean);

  return (
    <DrawerSection title={t("v2.bankStatements.cashDetail.labels.generalInfo")}>
      {editMode ? (
        <div className="grid gap-3">
          <DrawerField label={t("v2.bankStatements.cashDetail.labels.branch")}>
            <V2MultiCombobox
              options={branchOptions}
              value={draft.branchIds}
              onValueChange={props.onBranchChange}
            />
          </DrawerField>
          <DrawerField label={t("v2.bankStatements.cashDetail.labels.partner")}>
            <BusinessPartnerPicker
              direction={direction}
              value={draft.partnerValue}
              selectedLabel={draft.partnerLabel}
              onValueChange={props.onPartnerChange}
            />
          </DrawerField>
          <DrawerField label={t("v2.bankStatements.cashDetail.labels.note")}>
            <V2Textarea
              className="min-h-20"
              value={draft.description}
              onChange={(e) => props.onDescriptionChange(e.target.value)}
            />
          </DrawerField>
          <CashClassificationFields
            classification={draft.classification}
            purpose={draft.purpose}
            editMode
            onClassificationChange={props.onClassificationChange}
            onPurposeChange={props.onPurposeChange}
            t={t}
          />
        </div>
      ) : (
        <div className="space-y-1">
          <DrawerRow
            label={t("v2.bankStatements.cashDetail.labels.branch")}
            value={branchLabels.length ? branchLabels.join(", ") : empty}
          />
          <DrawerRow
            label={t("v2.bankStatements.cashDetail.labels.partner")}
            value={draft.partnerLabel || empty}
          />
          <DrawerRow
            label={t("v2.bankStatements.cashDetail.labels.note")}
            value={draft.description || empty}
          />
          <CashClassificationFields
            classification={draft.classification}
            purpose={draft.purpose}
            editMode={false}
            onClassificationChange={() => undefined}
            onPurposeChange={() => undefined}
            t={t}
          />
        </div>
      )}
    </DrawerSection>
  );
}
