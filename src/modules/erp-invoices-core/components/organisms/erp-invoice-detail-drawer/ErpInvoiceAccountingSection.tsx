import React from "react";
import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { PostedAccountingSummary } from "@/shared/components/accounting/PostedAccountingSummary";
import { PostingSection } from "@/shared/components/accounting/PostingSection";
import { resolvePurchaseDebitAccountCode } from "@/modules/erp-invoices-core/utils/invoiceTaxCodeAccounting";
import { createClientId } from "./ErpInvoiceDetailDrawer.state";
import { resolveBranchIds } from "@/shared/utils/branchIds";
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

  const titleExtra = (
    <div className="flex items-center gap-1.5">
      {isPosted && !pendingUnpost ? (
        <Badge
          variant="ghost"
          className="border border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-mono font-bold"
        >
          {t("statusPosted", "✓ ĐÃ HẠCH TOÁN")}
        </Badge>
      ) : accountingEnabled ? (
        <Badge
          variant="ghost"
          className="border border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-mono font-bold"
        >
          {t("statusAccountingActive", "ĐANG BẬT HẠCH TOÁN")}
        </Badge>
      ) : (
        <Badge
          variant="ghost"
          className="border border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-mono"
        >
          {t("statusUnposted", "CHƯA HẠCH TOÁN")}
        </Badge>
      )}
    </div>
  );

  return (
    <DrawerSection
      title={
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
          <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
          <span>
            {t("accountingEntryTitle", "Định khoản nghiệp vụ kế toán")}
          </span>
        </div>
      }
      titleExtra={titleExtra}
      collapsible={true}
      defaultCollapsed={false}
      className={`border border-slate-200/80 dark:border-slate-800 mb-0 ${className || ""}`}
    >
      <div className="p-3 bg-surface/50 rounded-xl">
        {editMode && postingState ? (
          <div className="py-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                {t("accountingEntrySettings", "Thiết lập định khoản")}
              </span>
              {resolveBranchIds(form).length > 0 && (
                <Button
                  type="button"
                  variant={accountingEnabled ? "outline" : "primary"}
                  size="sm"
                  className="h-7 text-xs cursor-pointer"
                  onClick={() => {
                    fieldSet?.("accountingEnabled", !accountingEnabled);
                  }}
                >
                  {accountingEnabled
                    ? t("disableAccounting", "Hủy hạch toán")
                    : t("enableAccounting", "Bật hạch toán")}
                </Button>
              )}
            </div>

            {resolveBranchIds(form).length === 0 ? (
              <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                {t(
                  "requireBranchForAccounting",
                  "Vui lòng chọn chi nhánh ở cột bên phải trước khi nhập hạch toán kế toán.",
                )}
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
                getDefaultLines={(accountOptions) => {
                  const findAccount = (prefix: string) =>
                    accountOptions.find((a) =>
                      a.label.split(" - ")[0]?.startsWith(prefix),
                    )?.value || "";
                  const preVat =
                    Number(detailInvoice?.preVatAmount || form?.preVatAmount) ||
                    0;
                  const vat =
                    Number(detailInvoice?.vatAmount || form?.vatAmount) || 0;
                  const total =
                    Number(detailInvoice?.totalAmount || form?.totalAmount) ||
                    0;
                  const baseDesc =
                    detailInvoice?.description ||
                    `${t("postingDefaultDesc", "Hạch toán hóa đơn")} ${detailInvoice?.invoiceNo || form?.invoiceNo}`;

                  const newLines = [];
                  if (direction === "IN") {
                    const sellerTaxCode =
                      detailInvoice?.sellerTaxCode || form?.sellerTaxCode || "";
                    const debitCode =
                      resolvePurchaseDebitAccountCode(sellerTaxCode);
                    const debitAccountId =
                      debitCode === "642"
                        ? findAccount("642") || findAccount("632")
                        : findAccount("632") || findAccount("642");

                    if (preVat > 0)
                      newLines.push({
                        id: createClientId(),
                        accountId:
                          debitAccountId ||
                          findAccount("152") ||
                          findAccount("156"),
                        debit: preVat,
                        credit: 0,
                        description: baseDesc,
                      });
                    if (vat > 0)
                      newLines.push({
                        id: createClientId(),
                        accountId: findAccount("133"),
                        debit: vat,
                        credit: 0,
                        description: `Thuế GTGT ${detailInvoice?.invoiceNo || form?.invoiceNo}`,
                      });
                    if (total > 0)
                      newLines.push({
                        id: createClientId(),
                        accountId: findAccount("331"),
                        debit: 0,
                        credit: total,
                        description: baseDesc,
                      });
                  } else {
                    if (total > 0)
                      newLines.push({
                        id: createClientId(),
                        accountId: findAccount("131"),
                        debit: total,
                        credit: 0,
                        description: baseDesc,
                      });
                    if (preVat > 0)
                      newLines.push({
                        id: createClientId(),
                        accountId: findAccount("511") || findAccount("711"),
                        debit: 0,
                        credit: preVat,
                        description: baseDesc,
                      });
                    if (vat > 0)
                      newLines.push({
                        id: createClientId(),
                        accountId: findAccount("3331") || findAccount("333"),
                        debit: 0,
                        credit: vat,
                        description: `Thuế GTGT ${detailInvoice?.invoiceNo || form?.invoiceNo}`,
                      });
                  }
                  return newLines;
                }}
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
