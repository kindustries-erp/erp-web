import React from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, AlertCircle } from "lucide-react";
import { DrawerSection } from "@/v2/shared/components";
import { Badge } from "@/v2/shared/ui/badge";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { PostedAccountingSummary } from "@/shared/components/accounting/PostedAccountingSummary";
import { PostingSection } from "@/shared/components/accounting/PostingSection";
import { resolveBranchIds } from "@/shared/utils/branchIds";
import { buildDefaultAccountingLines } from "./ErpInvoiceAccountingSection.helper";
import type {
  ErpInvoice,
  CreateErpInvoicePayload,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface ErpInvoiceAccountingSectionProps {
  detailInvoice: ErpInvoice | null;
  form?: CreateErpInvoicePayload;
  editMode?: boolean;
  fieldSet?: (key: string, value: unknown) => void;
  direction?: "IN" | "OUT";
  postingState?: any;
  pendingUnpost?: boolean;
  onUnpost?: () => void;
  className?: string;
}

export function ErpInvoiceAccountingSection({
  detailInvoice,
  form,
  editMode = false,
  fieldSet,
  direction = "IN",
  postingState,
  pendingUnpost = false,
  onUnpost,
  className,
}: ErpInvoiceAccountingSectionProps) {
  const { t } = useTranslation("erpInvoices");

  if (!detailInvoice) return null;

  const isPosted = detailInvoice.postingStatus === "POSTED";
  const accountingEnabled = (form as any)?.accountingEnabled;
  const hasBranch = resolveBranchIds(form).length > 0;

  const titleExtra = (
    <div className="flex items-center gap-1.5">
      {isPosted && !pendingUnpost ? (
        <Badge variant="success" className="text-[10px] font-mono font-bold">
          {t("statusPosted", "✓ ĐÃ HẠCH TOÁN")}
        </Badge>
      ) : accountingEnabled ? (
        <Badge variant="warning" className="text-[10px] font-mono font-bold">
          {t("statusAccountingActive", "ĐANG BẬT HẠCH TOÁN")}
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="text-muted-foreground border-border/60 bg-muted/20 text-[10px] font-mono"
        >
          {t("statusUnposted", "CHƯA HẠCH TOÁN")}
        </Badge>
      )}
    </div>
  );

  return (
    <DrawerSection
      title={
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-foreground">
          <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
          <span>
            {t("accountingEntryTitle", "Định khoản nghiệp vụ kế toán")}
          </span>
        </div>
      }
      titleExtra={titleExtra}
      collapsible={true}
      defaultCollapsed={false}
      className={`mb-0 ${className || ""}`}
    >
      <div className="w-full space-y-3 pt-1">
        {editMode && postingState ? (
          <div className="py-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                {t("accountingEntrySettings", "Thiết lập định khoản")}
              </span>
              {hasBranch && (
                <V2Button
                  type="button"
                  variant={accountingEnabled ? "outline" : "default"}
                  size="sm"
                  className="h-7 text-xs cursor-pointer"
                  onClick={() => {
                    fieldSet?.("accountingEnabled", !accountingEnabled);
                  }}
                >
                  {accountingEnabled
                    ? t("disableAccounting", "Hủy hạch toán")
                    : t("enableAccounting", "Bật hạch toán")}
                </V2Button>
              )}
            </div>

            {!hasBranch ? (
              <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  {t(
                    "requireBranchForAccounting",
                    "Vui lòng chọn chi nhánh ở cột bên phải trước khi nhập hạch toán kế toán.",
                  )}
                </span>
              </div>
            ) : null}

            <div
              className={`transition-all duration-200 ${
                accountingEnabled
                  ? "opacity-100"
                  : "opacity-40 grayscale pointer-events-none"
              }`}
            >
              <PostingSection
                postingState={postingState}
                editMode={true}
                isPosted={isPosted && !pendingUnpost}
                journalEntryId={detailInvoice.journalEntryId}
                defaultDate={form?.invoiceDate || ""}
                defaultDescription={
                  detailInvoice.description ||
                  form?.description ||
                  `${t("postingDefaultDesc", "Hạch toán hóa đơn")} ${form?.invoiceNo || ""}`
                }
                onUnpost={() => {
                  if (onUnpost) {
                    onUnpost();
                    postingState?.reset?.();
                  }
                }}
                getDefaultLines={(accountOptions) =>
                  buildDefaultAccountingLines({
                    detailInvoice,
                    form,
                    direction,
                    accountOptions,
                    defaultDescriptionPrefix: t(
                      "postingDefaultDesc",
                      "Hạch toán hóa đơn",
                    ),
                    vatDescriptionPrefix: t("vatDescPrefix", "Thuế GTGT"),
                  })
                }
              />
            </div>
          </div>
        ) : (
          <div className="py-1">
            <PostedAccountingSummary
              isPosted={isPosted}
              journalEntryId={detailInvoice.journalEntryId}
              postingDate={detailInvoice.postingDate}
            />
          </div>
        )}
      </div>
    </DrawerSection>
  );
}
