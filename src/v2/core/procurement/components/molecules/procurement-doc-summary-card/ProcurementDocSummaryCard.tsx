import * as React from "react";
import { Eye } from "lucide-react";
import {
  V2Button,
  V2CopyButton,
  V2Text,
  V2Tooltip,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";

export interface ProcurementDocSummaryCardProps {
  /** Số đề nghị / Mã chứng từ */
  documentNo: string;
  /** Tiêu đề / Nội dung đề nghị */
  title?: string | null;
  /** Ngày đề nghị */
  date?: string | null;
  /** Chi nhánh */
  branchName?: string | null;
  /** Tổng tiền dự kiến / Tổng tiền */
  estimatedTotal?: string | number | null;
  /** Email người tạo */
  createdByEmail?: string | null;
  /** Callback khi bấm nút xem chi tiết Drawer */
  onViewDetail?: () => void;
  className?: string;
}

const formatMoney = (value: string | number | null | undefined) =>
  value == null || value === ""
    ? "—"
    : `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 0 })} đ`;

const formatDate = (value: string | null | undefined) =>
  value ? value.slice(0, 10) : "—";

/**
 * Thẻ tóm tắt thông tin cơ bản của phiếu đề nghị / đơn mua hàng trong Modal.
 * - Style viền mỏng tiệp nền theo chuẩn DrawerSection.
 * - Cho phép click số phiếu để mở Drawer xem chi tiết.
 * - Icon copy mã phiếu và icon mắt mở Drawer, tooltip không tự bật khi mở modal.
 */
export function ProcurementDocSummaryCard({
  documentNo,
  title,
  date,
  branchName,
  estimatedTotal,
  createdByEmail,
  onViewDetail,
  className,
}: ProcurementDocSummaryCardProps) {
  const { t } = useV2Translation();

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-xl border border-border/50 dark:border-white/[0.06] bg-surface/50 dark:bg-white/[0.02] shadow-sm backdrop-blur-sm p-3 sm:p-3.5 text-xs text-fg/90",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/40 dark:border-white/[0.06] pb-2">
        <div className="flex items-center gap-1.5 truncate">
          <V2Text
            as="span"
            variant="caption"
            className="shrink-0 text-muted-fg font-medium uppercase tracking-wider"
          >
            {t("v2.procurement.summaryCard.docNo", "Số phiếu")}:
          </V2Text>

          {onViewDetail ? (
            <V2Tooltip
              content={t(
                "v2.procurement.actions.viewDetailInDrawer",
                "Xem chi tiết phiếu trong Drawer",
              )}
              side="top"
              triggerOnFocus={false}
            >
              <V2Button
                type="button"
                variant="ghost"
                size="sm"
                tabIndex={-1}
                className="h-auto p-0 font-mono text-primary hover:underline font-semibold text-xs leading-none cursor-pointer"
                onClick={onViewDetail}
              >
                {documentNo}
              </V2Button>
            </V2Tooltip>
          ) : (
            <V2Text
              as="span"
              variant="body-sm"
              weight="semibold"
              className="font-mono text-primary truncate"
            >
              {documentNo}
            </V2Text>
          )}

          <V2Tooltip
            content={t(
              "v2.procurement.summaryCard.copyDocNo",
              "Sao chép mã phiếu",
            )}
            side="top"
            triggerOnFocus={false}
          >
            <V2CopyButton
              value={documentNo}
              tabIndex={-1}
              className="h-5 w-5 rounded text-muted-fg hover:text-foreground shrink-0 cursor-pointer"
              label={t(
                "v2.procurement.summaryCard.copyDocNo",
                "Sao chép mã phiếu",
              )}
            />
          </V2Tooltip>
        </div>

        {onViewDetail && (
          <V2Tooltip
            content={t(
              "v2.procurement.actions.viewDetailInDrawer",
              "Xem chi tiết phiếu trong Drawer",
            )}
            side="left"
            triggerOnFocus={false}
          >
            <V2Button
              type="button"
              variant="outline"
              size="icon-xs"
              tabIndex={-1}
              className="h-6 w-6 rounded-md hover:bg-muted/60 shrink-0 text-muted-fg hover:text-fg cursor-pointer"
              onClick={onViewDetail}
              aria-label={t(
                "v2.procurement.actions.viewDetailInDrawer",
                "Xem chi tiết phiếu trong Drawer",
              )}
            >
              <Eye className="h-3.5 w-3.5" />
            </V2Button>
          </V2Tooltip>
        )}
      </div>

      {title && (
        <div className="flex flex-col gap-0.5">
          <V2Text variant="caption" className="text-muted-fg">
            {t("v2.procurement.columns.title", "Nội dung")}
          </V2Text>
          <V2Text
            variant="body-sm"
            className="font-medium text-fg line-clamp-2"
          >
            {title}
          </V2Text>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-0.5">
        <div className="flex flex-col">
          <V2Text variant="caption" className="text-muted-fg">
            {t("v2.procurement.columns.requestDate", "Ngày đề nghị")}
          </V2Text>
          <V2Text variant="body-sm" className="font-medium">
            {formatDate(date)}
          </V2Text>
        </div>

        <div className="flex flex-col">
          <V2Text variant="caption" className="text-muted-fg">
            {t("v2.procurement.columns.estimatedTotal", "Tổng dự kiến")}
          </V2Text>
          <V2Text
            variant="body-sm"
            weight="semibold"
            className="text-emerald-500 dark:text-emerald-400 font-mono"
          >
            {formatMoney(estimatedTotal)}
          </V2Text>
        </div>

        {branchName && (
          <div className="flex flex-col">
            <V2Text variant="caption" className="text-muted-fg">
              {t("v2.procurement.columns.branchName", "Chi nhánh")}
            </V2Text>
            <V2Text variant="body-sm" className="truncate">
              {branchName}
            </V2Text>
          </div>
        )}

        {createdByEmail && (
          <div className="flex flex-col">
            <V2Text variant="caption" className="text-muted-fg">
              {t("v2.procurement.columns.createdBy", "Người tạo")}
            </V2Text>
            <V2Text variant="body-sm" className="truncate text-muted-fg">
              {createdByEmail}
            </V2Text>
          </div>
        )}
      </div>
    </div>
  );
}
