import {
  DrawerField,
  DrawerSection,
  V2DatePicker,
  V2Input,
  V2Switch,
} from "@/v2/shared/components";
import { V2PostingLinesEditor } from "@/v2/shared/components/organisms/v2-posting-lines-editor";
import { PostingSummary } from "../../molecules/posting-summary";
import type { CashPostingSectionProps } from "./CashPostingSection.type";

/** Tab Hạch toán: xem tóm tắt bút toán đã ghi sổ, hoặc bật/tắt và soạn bút toán khi sửa */
export function CashPostingSection(props: CashPostingSectionProps) {
  const { t, posting, editMode } = props;
  const accountOptions = props.accounts;
  const accountLabel = (id: string) =>
    accountOptions.find((a) => a.value === id)?.label ?? id;

  return (
    <DrawerSection title={t("v2.bankStatements.cashDetail.posting.title")}>
      {editMode ? (
        <div className="space-y-3">
          <V2Switch
            checked={posting.accountingEnabled}
            onCheckedChange={props.onToggleAccounting}
            label={
              posting.accountingEnabled
                ? t("v2.bankStatements.cashDetail.posting.toggleOff")
                : t("v2.bankStatements.cashDetail.posting.toggleOn")
            }
          />
          <div
            className={
              posting.accountingEnabled
                ? "space-y-3"
                : "pointer-events-none space-y-3 opacity-50"
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <DrawerField
                label={t("v2.bankStatements.cashDetail.posting.date")}
              >
                <V2DatePicker
                  value={posting.postingDate || null}
                  onValueChange={(value) =>
                    props.onPostingDateChange(value ?? "")
                  }
                />
              </DrawerField>
              <DrawerField
                label={t("v2.bankStatements.cashDetail.posting.description")}
              >
                <V2Input
                  value={posting.description}
                  onChange={(e) => props.onDescriptionChange(e.target.value)}
                />
              </DrawerField>
            </div>
            <V2PostingLinesEditor
              lines={posting.lines}
              accounts={accountOptions}
              onChange={props.onLinesChange}
              autoBalance
            />
          </div>
        </div>
      ) : (
        <PostingSummary
          summary={posting.summary}
          isPosted={posting.isPosted}
          journalNo={posting.journalNo}
          accountLabel={accountLabel}
          t={t}
        />
      )}
    </DrawerSection>
  );
}
