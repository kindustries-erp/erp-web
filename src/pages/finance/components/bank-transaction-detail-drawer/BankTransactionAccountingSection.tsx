import React from "react";
import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { PostingSection } from "@/shared/components/accounting/PostingSection";
import { PostedAccountingSummary } from "@/shared/components/accounting/PostedAccountingSummary";
import type { BankTransactionAccountingSectionProps } from "./BankTransactionDetailDrawer.type";

export const BankTransactionAccountingSection = React.memo(
  function BankTransactionAccountingSection({
    transaction,
    editMode,
    isPosted,
    accountingEnabled,
    onToggleAccounting,
    postingState,
    defaultPostingDate,
    baseDescription,
    unpostMutation,
  }: BankTransactionAccountingSectionProps) {
    const { t } = useTranslation();

    return (
      <div className="space-y-4">
        <DrawerSection
          title={
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>
                {t("bankStatement.tabAccountingTitle", {
                  defaultValue: "Hạch toán & Định khoản kế toán",
                })}
              </span>
            </div>
          }
          collapsible={true}
          defaultCollapsed={false}
        >
          {editMode ? (
            <div className="py-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  {t("bankStatement.postingConfig", {
                    defaultValue: "Định khoản nghiệp vụ kế toán",
                  })}
                </span>
                <button
                  type="button"
                  onClick={onToggleAccounting}
                  className={`px-3 py-[5px] rounded-lg text-xs font-medium border transition-colors ${
                    accountingEnabled
                      ? "border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground"
                      : "border-amber-500 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
                  }`}
                >
                  {accountingEnabled
                    ? t("bankStatement.cancelPostingBtn", {
                        defaultValue: "Hủy hạch toán",
                      })
                    : t("bankStatement.enablePostingBtn", {
                        defaultValue: "Bật hạch toán",
                      })}
                </button>
              </div>
              <div
                className={
                  !accountingEnabled
                    ? "opacity-40 grayscale pointer-events-none"
                    : ""
                }
              >
                <PostingSection
                  postingState={postingState}
                  editMode={true}
                  isPosted={isPosted}
                  journalEntryId={transaction?.journalEntryId}
                  defaultDate={defaultPostingDate}
                  defaultDescription={baseDescription}
                  autoBalanceOnAddLine
                  onUnpost={() => unpostMutation.mutate()}
                  unposting={unpostMutation.isPending}
                />
              </div>
            </div>
          ) : (
            <div className="py-1">
              <PostedAccountingSummary
                isPosted={isPosted}
                journalEntryId={transaction?.journalEntryId}
                postingDate={transaction?.postingDate}
              />
            </div>
          )}
        </DrawerSection>
      </div>
    );
  },
);
