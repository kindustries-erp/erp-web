import { DatePicker } from "@/shared/components/DatePicker";
import { Combobox } from "@/shared/components/Combobox";
import { PERIOD_OPTS } from "@/modules/finance/utils/financeHelpers";
import { useT } from "@/core/i18n";

interface ChannelOption {
  value: string;
  label: string;
}

interface VoucherFilterBarProps {
  period: string;
  dateFrom: string;
  dateTo: string;
  channelFilter: string;
  channelOpts: ChannelOption[];
  channelLabel: string; // "Quỹ:" / "Ngân hàng:"
  channelPlaceholder: string; // "Tất cả quỹ" / "Tất cả NH"
  hasActiveFilter: boolean;
  onPeriodChange: (p: string) => void;
  onDateFrom: (v: string) => void;
  onDateTo: (v: string) => void;
  onChannelChange: (id: string) => void;
  onReset: () => void;
}

/**
 * VoucherFilterBar — Organism: thanh lọc kỳ, ngày, kênh (quỹ / NH) dùng cho
 * TienMat và TienGui. Trả về giá trị qua callbacks, không tự quản lý state.
 */
export function VoucherFilterBar({
  period,
  dateFrom,
  dateTo,
  channelFilter,
  channelOpts,
  channelLabel,
  channelPlaceholder,
  hasActiveFilter,
  onPeriodChange,
  onDateFrom,
  onDateTo,
  onChannelChange,
  onReset,
}: VoucherFilterBarProps) {
  const t = useT();
  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-[color:var(--muted-fg)] shrink-0">{t("voucher.filter.period")}</span>
        <Combobox
          options={PERIOD_OPTS}
          value={period}
          onChange={(v) => onPeriodChange(v ?? "")}
          placeholder={t("voucher.filter.periodPlaceholder")}
          className="w-[160px]"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-[color:var(--muted-fg)] shrink-0">{t("voucher.filter.from")}</span>
        <DatePicker value={dateFrom} onChange={onDateFrom} placeholder={t("voucher.filter.fromPlaceholder")} />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-[color:var(--muted-fg)] shrink-0">{t("voucher.filter.to")}</span>
        <DatePicker value={dateTo} onChange={onDateTo} placeholder={t("voucher.filter.toPlaceholder")} />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-[color:var(--muted-fg)] shrink-0">{channelLabel}</span>
        <Combobox
          options={channelOpts}
          value={channelFilter}
          onChange={(v) => onChannelChange(v ?? "")}
          placeholder={channelPlaceholder}
          className="w-[190px]"
        />
      </div>
      {hasActiveFilter && (
        <button
          type="button"
          className="text-xs text-[color:var(--muted-fg)] hover:text-foreground underline underline-offset-2"
          onClick={onReset}
        >
          {t("voucher.filter.reset")}
        </button>
      )}
    </div>
  );
}
