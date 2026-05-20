import type { CashBankTagPreset } from "@/modules/finance/api/financeApi";

interface AccountOption {
  value: string;
  label: string;
}

interface Props {
  presets: CashBankTagPreset[];
  selectedId?: string;
  debitAccountOpts?: AccountOption[];
  creditAccountOpts?: AccountOption[];
  disabled?: boolean;
  onSelect: (preset: CashBankTagPreset) => void;
  /** When true, cards scroll horizontally instead of grid layout */
  horizontal?: boolean;
}

function accountLabel(opts: AccountOption[], id?: string | null) {
  if (!id) return "—";
  return opts.find((opt) => opt.value === id)?.label ?? "Tài khoản cấu hình";
}

export function CashBankTagPresetCards({
  presets,
  selectedId,
  debitAccountOpts,
  creditAccountOpts,
  disabled,
  onSelect,
  horizontal,
}: Props) {
  const safePresets = Array.isArray(presets) ? presets : [];
  const safeDebitOpts = Array.isArray(debitAccountOpts) ? debitAccountOpts : [];
  const safeCreditOpts = Array.isArray(creditAccountOpts)
    ? creditAccountOpts
    : [];
  return (
    <div className="mb-3">
      {!horizontal && (
        <div className="mb-2 text-xs font-medium text-muted-fg">
          Chọn nghiệp vụ nhanh để tự điền tài khoản
        </div>
      )}
      {!safePresets.length ? (
        <div className="py-4 border border-dashed border-border rounded-xl text-center text-[11px] text-muted-fg">
          Chưa có nghiệp vụ nhanh được cấu hình.
        </div>
      ) : (
        <div
          className={
            horizontal
              ? "flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin"
              : "grid grid-cols-2 max-[560px]:grid-cols-1 gap-2"
          }
        >
          {safePresets.map((preset) => {
            const active = selectedId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(preset)}
                className={[
                  "rounded-xl border px-3 py-2 text-left transition-colors",
                  horizontal ? "min-w-[180px] flex-shrink-0" : "",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-[color:var(--surface)] hover:bg-muted/50",
                  disabled ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
              >
                <div className="text-sm font-medium">{preset.label}</div>
                {preset.description && (
                  <div className="mt-1 text-xs text-muted-fg line-clamp-2">
                    {preset.description}
                  </div>
                )}
                <div className="mt-1 text-[11px] text-muted-fg">
                  Nợ: {accountLabel(safeDebitOpts, preset.debit_account_id)} ·
                  Có: {accountLabel(safeCreditOpts, preset.credit_account_id)}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
