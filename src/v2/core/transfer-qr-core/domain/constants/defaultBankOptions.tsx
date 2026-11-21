import { V2Image } from "@/v2/shared/components/atoms";
import type { V2ComboboxOption } from "@/v2/shared/components/molecules/v2-combobox";
import { V2_API_BASE_URL } from "@/v2/shared/api/v2HttpClient";
import { VIETQR_BANKS } from "./vietQrBanks";

export function getBankLogoUrl(code: string): string {
  const base = (V2_API_BASE_URL || "").replace(/\/$/, "");
  const cleanCode = (code || "").trim().toUpperCase();
  return `${base}/api/v2/banks-management/logo/${cleanCode}`;
}

export const DEFAULT_BANK_OPTIONS: V2ComboboxOption[] = VIETQR_BANKS.map(
  (b) => ({
    value: b.bin,
    label: `${b.code} - ${b.shortName}`,
    description: b.name,
    icon: (
      <V2Image
        src={getBankLogoUrl(b.code)}
        alt={b.code}
        className="h-4 w-4 object-contain rounded-sm"
        loading="lazy"
      />
    ),
  }),
);
