import React from "react";
import { useT } from "@/core/i18n";
import { cn } from "@/shared/utils";
import type {
  CashflowDuplicateGroup,
  CashflowDuplicateItem,
  CashflowDuplicateResult,
} from "../../../api/garageCashflowApi";

interface Props {
  amount: number;
  result: CashflowDuplicateResult;
}

const MAX_SHOWN = 5;

const formatMoney = (n: number) => `${n.toLocaleString("vi-VN")} đ`;

const formatDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
};

const VoucherRow: React.FC<{ v: CashflowDuplicateItem }> = ({ v }) => {
  const t = useT();
  const isReceipt = v.voucherType === "RECEIPT";
  const meta = [
    formatDate(v.transDate),
    v.licensePlate,
    v.caseCode,
    v.partnerName,
  ].filter(Boolean);

  return (
    <li className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-foreground">
            {v.voucherCode}
          </span>
          <span
            className={cn(
              "rounded px-1.5 py-px text-[10px] font-semibold",
              isReceipt
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
            )}
          >
            {isReceipt
              ? t("garage:cashflowDuplicate.receipt", "Thu")
              : t("garage:cashflowDuplicate.payment", "Chi")}
          </span>
        </div>
        <p className="truncate text-[11px] text-[color:var(--muted-fg)]">
          {meta.join(" · ")}
        </p>
      </div>
      <span className="shrink-0 font-mono text-xs font-semibold tabular-nums text-foreground">
        {formatMoney(v.amount)}
      </span>
    </li>
  );
};

export const GarageCashflowDuplicateWarning: React.FC<Props> = ({
  amount,
  result,
}) => {
  const t = useT();

  const groups: Array<[string, CashflowDuplicateGroup]> = [
    [
      t(
        "garage:cashflowDuplicate.groupNearby",
        "Cùng số tiền trong 7 ngày trước/sau ngày nhập",
      ),
      result.nearbyDate,
    ],
    [
      t(
        "garage:cashflowDuplicate.groupCase",
        "Cùng số tiền cho phiếu dịch vụ này",
      ),
      result.sameCase,
    ],
    [
      t(
        "garage:cashflowDuplicate.groupPlate",
        "Cùng số tiền cho biển số xe này",
      ),
      result.samePlate,
    ],
  ];

  const [before, after] = t(
    "garage:cashflowDuplicate.intro",
    "Số tiền {{amount}} đã xuất hiện ở các phiếu sau. Bạn có muốn nhập tiếp không?",
  ).split("{{amount}}");

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-foreground">
        {before}
        <strong className="font-semibold">{formatMoney(amount)}</strong>
        {after}
      </p>
      <div className="max-h-[320px] space-y-4 overflow-y-auto pr-1">
        {groups
          .filter(([, g]) => g.total > 0)
          .map(([label, g]) => (
            <section key={label}>
              <h4 className="flex items-center justify-between border-b border-border pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                <span>{label}</span>
                <span className="font-mono">{g.total}</span>
              </h4>
              <ul className="divide-y divide-border/60">
                {g.items.slice(0, MAX_SHOWN).map((v) => (
                  <VoucherRow key={v.id} v={v} />
                ))}
              </ul>
              {g.total > MAX_SHOWN && (
                <p className="pt-1.5 text-[11px] text-[color:var(--muted-fg)]">
                  {t(
                    "garage:cashflowDuplicate.more",
                    "+{{count}} phiếu khác",
                  ).replace("{{count}}", String(g.total - MAX_SHOWN))}
                </p>
              )}
            </section>
          ))}
      </div>
    </div>
  );
};
