import React from "react";
import { resolveTransactionBranchIds } from "@/modules/bank-statements/utils/transactionBranchIds";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { DrawerField, DrawerSection } from "@/shared/components/DrawerModal";
import {
  Building2,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
} from "lucide-react";
import { V2MultiCombobox } from "@/v2/shared/components";
import { CopyButton } from "@/shared/components/CopyButton";
import { BufferedTextarea } from "@/shared/components/BufferedTextarea";
import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import { formatGMT7 } from "@/shared/utils/format";

export interface BankTransactionGeneralInfoSectionProps {
  transaction: any | null;
  editMode?: boolean;
  branchIds?: string[];
  onBranchChange?: (branchIds: string[]) => void;
  description?: string;
  onDescriptionChange?: (description: string) => void;
  className?: string;
  defaultCollapsed?: boolean;
  showTags?: boolean;
  /** Ô bổ sung ngay dưới Chi nhánh (ví dụ ô Đối tượng) */
  partnerField?: React.ReactNode;
}

export const BankTransactionGeneralInfoSection = React.memo(
  function BankTransactionGeneralInfoSection({
    transaction,
    editMode = false,
    branchIds,
    onBranchChange,
    description,
    onDescriptionChange,
    className = "space-y-3 text-sm",
    defaultCollapsed = false,
    showTags = true,
    partnerField,
  }: BankTransactionGeneralInfoSectionProps) {
    const { t } = useTranslation();

    const { data: branchOptions = [] } = useQuery({
      queryKey: ["branches-options"],
      queryFn: getBranchOptionsApi,
      staleTime: 5 * 60 * 1000,
    });

    if (!transaction) return null;

    const partnerName = transaction.correspondentName?.trim() || "";

    const effectiveBranchIds: string[] =
      editMode && branchIds !== undefined
        ? branchIds
        : resolveTransactionBranchIds(transaction);

    const branchLabel = (() => {
      if (effectiveBranchIds.length === 0) {
        return transaction.branch?.name || transaction.branchName || "—";
      }
      const names = effectiveBranchIds.map((id) => {
        const option = branchOptions.find((o) => o.value === id);
        if (option?.label) return option.label.split(" — ")[1] || option.label;
        if (transaction.branch?.id === id && transaction.branch?.name) {
          return transaction.branch.name;
        }
        return id;
      });
      return names.join(", ");
    })();

    // Ghi chú ERP (note) có thể sửa; diễn giải ngân hàng (description) chỉ đọc
    const effectiveNote =
      editMode && description !== undefined
        ? description
        : transaction.note || "";
    const bankDescription = transaction.description || "";

    const sourceAccountLabel =
      transaction.sourceType === "BANK"
        ? [
            transaction.bankAccount?.accountName,
            transaction.bankAccount?.accountNumber,
          ]
            .filter(Boolean)
            .join(" - ") ||
          transaction.bankAccount?.accountingAccountId ||
          "—"
        : transaction.cashBook?.name ||
          transaction.cashBook?.accountingAccountId ||
          "—";

    if (editMode) {
      return (
        <DrawerSection
          title={t("bankStatement.generalInfo", {
            defaultValue: "THÔNG TIN CHUNG",
          })}
          collapsible={true}
          defaultCollapsed={defaultCollapsed}
        >
          <div className="space-y-4">
            {/* Đối tác */}
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">
                {t("bankStatement.partner", { defaultValue: "Đối tác" })}
              </div>
              {partnerName ? (
                <div className="flex items-start justify-between gap-1.5 font-medium text-foreground text-sm">
                  <div className="flex items-start gap-1.5 min-w-0">
                    <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                    <span className="break-words">{partnerName}</span>
                  </div>
                  <CopyButton
                    value={partnerName}
                    tooltip={t("bankStatement.copyName", {
                      defaultValue: "Copy tên",
                    })}
                    copiedTooltip={t("bankStatement.copied", {
                      defaultValue: "Đã copy",
                    })}
                    toastMessage={t("bankStatement.copiedName", {
                      defaultValue: "Đã copy tên đối tác",
                    })}
                    toastId="bank-general-partner-name-copy"
                    className="p-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                  />
                </div>
              ) : (
                <div className="flex items-start gap-1.5 font-medium text-muted-foreground/60 text-sm">
                  <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/40" />
                  <span>—</span>
                </div>
              )}
            </div>

            {/* Chi nhánh (Combobox) */}
            <DrawerField
              label={t("bankStatement.branch", { defaultValue: "Chi nhánh" })}
            >
              {editMode && onBranchChange ? (
                <V2MultiCombobox
                  options={branchOptions}
                  value={effectiveBranchIds}
                  onValueChange={(vals) => onBranchChange(vals)}
                  placeholder="-- Chọn chi nhánh --"
                  clearable
                />
              ) : (
                <span className="text-sm">{branchLabel}</span>
              )}
            </DrawerField>
            {partnerField}

            {/* Tài khoản nguồn */}
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">
                {t("bankStatement.sourceAccount", {
                  defaultValue: "Tài khoản nguồn",
                })}
              </div>
              <div className="flex items-start gap-1.5 font-medium break-all text-foreground text-sm">
                <CreditCard className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                <span>{sourceAccountLabel}</span>
              </div>
            </div>

            {/* Ngày giao dịch */}
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">
                {t("bankStatement.transDate", {
                  defaultValue: "Ngày giao dịch",
                })}
              </div>
              <div className="flex items-start gap-1.5 font-medium text-foreground text-sm">
                <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                <span>{formatGMT7(transaction.transDate, "date") || "—"}</span>
              </div>
            </div>

            {/* Diễn giải ngân hàng (chỉ đọc) */}
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">
                {t("bankStatement.bankDescription", {
                  defaultValue: "Diễn giải ngân hàng",
                })}
              </div>
              <div className="flex items-start gap-1.5 font-medium break-words text-foreground text-sm">
                <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                <span className="whitespace-pre-wrap">
                  {bankDescription || "—"}
                </span>
              </div>
            </div>

            {/* Ghi chú ERP (BufferedTextarea) */}
            <DrawerField
              label={t("bankStatement.erpNote", {
                defaultValue: "Ghi chú ERP",
              })}
            >
              <BufferedTextarea
                className="w-full text-sm"
                value={effectiveNote}
                onChange={(val) => onDescriptionChange?.(val)}
                placeholder="Nhập ghi chú ERP..."
                rows={3}
              />
            </DrawerField>

            {/* Thẻ nhãn */}
            {showTags && transaction.id && (
              <div className="pt-1">
                <div className="text-sm font-medium mb-1.5 text-gray-700">
                  {t("bankStatement.tags", { defaultValue: "Thẻ nhãn" })}
                </div>
                <EntityTagSelector
                  entityType="bank_transaction"
                  entityId={transaction.id}
                  readOnly={false}
                />
              </div>
            )}
          </div>
        </DrawerSection>
      );
    }

    return (
      <DrawerSection
        title={t("bankStatement.generalInfo", {
          defaultValue: "THÔNG TIN CHUNG",
        })}
        collapsible={true}
        defaultCollapsed={defaultCollapsed}
      >
        <div className={className}>
          {/* Tên đối tác */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("bankStatement.partner", { defaultValue: "Đối tác" })}
            </div>
            {partnerName ? (
              <div className="flex items-start justify-between gap-1.5 font-medium text-foreground text-sm">
                <div className="flex items-start gap-1.5 min-w-0">
                  <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                  <span className="break-words">{partnerName}</span>
                </div>
                <CopyButton
                  value={partnerName}
                  tooltip={t("bankStatement.copyName", {
                    defaultValue: "Copy tên",
                  })}
                  copiedTooltip={t("bankStatement.copied", {
                    defaultValue: "Đã copy",
                  })}
                  toastMessage={t("bankStatement.copiedName", {
                    defaultValue: "Đã copy tên đối tác",
                  })}
                  toastId="bank-general-partner-name-copy"
                  className="p-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                />
              </div>
            ) : (
              <div className="flex items-start gap-1.5 font-medium text-muted-foreground/60 text-sm">
                <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/40" />
                <span>—</span>
              </div>
            )}
          </div>

          {/* Chi nhánh */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("bankStatement.branch", { defaultValue: "Chi nhánh" })}
            </div>
            <div className="flex items-start gap-1.5 font-medium break-words text-foreground text-sm">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
              <span>{branchLabel}</span>
            </div>
          </div>
          {partnerField}

          {/* Tài khoản nguồn */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("bankStatement.sourceAccount", {
                defaultValue: "Tài khoản nguồn",
              })}
            </div>
            <div className="flex items-start gap-1.5 font-medium break-all text-foreground text-sm">
              <CreditCard className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
              <span>{sourceAccountLabel}</span>
            </div>
          </div>

          {/* Ngày giao dịch */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("bankStatement.transDate", { defaultValue: "Ngày giao dịch" })}
            </div>
            <div className="flex items-start gap-1.5 font-medium text-foreground text-sm">
              <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
              <span>{formatGMT7(transaction.transDate, "date") || "—"}</span>
            </div>
          </div>

          {/* Diễn giải ngân hàng (chỉ đọc) */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("bankStatement.bankDescription", {
                defaultValue: "Diễn giải ngân hàng",
              })}
            </div>
            {bankDescription ? (
              <div className="flex items-start gap-1.5 font-medium break-words text-foreground text-sm">
                <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                <span className="whitespace-pre-wrap">{bankDescription}</span>
              </div>
            ) : (
              <div className="flex items-start gap-1.5 font-medium text-muted-foreground/60 text-sm">
                <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/40" />
                <span>—</span>
              </div>
            )}
          </div>

          {/* Ghi chú ERP */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("bankStatement.erpNote", { defaultValue: "Ghi chú ERP" })}
            </div>
            {effectiveNote ? (
              <div className="flex items-start gap-1.5 font-medium break-words text-foreground text-sm">
                <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                <span className="whitespace-pre-wrap">{effectiveNote}</span>
              </div>
            ) : (
              <div className="flex items-start gap-1.5 font-medium text-muted-foreground/60 text-sm">
                <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/40" />
                <span>—</span>
              </div>
            )}
          </div>

          {/* Thẻ nhãn */}
          {showTags && transaction.id && (
            <div className="pt-1 border-t border-border/50">
              <div className="text-xs text-muted-foreground mb-1.5">
                {t("bankStatement.tags", { defaultValue: "Thẻ nhãn" })}
              </div>
              <EntityTagSelector
                entityType="bank_transaction"
                entityId={transaction.id}
                readOnly={true}
              />
            </div>
          )}
        </div>
      </DrawerSection>
    );
  },
);
