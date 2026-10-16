import type { ComboboxOption } from "@/shared/components/Combobox";
import type { GarageOpexItem } from "@/modules/garage/api/garageOpexApi";
import type { CostGroupType } from "./garage-opex-drawer.type";
import { CATEGORY_PRESETS } from "./garage-opex-drawer.constants";

export function getGroupByCatKey(catKey: string): CostGroupType {
  const preset = CATEGORY_PRESETS.find((p) => p.key === catKey);
  if (preset) return preset.group;
  if (
    catKey === "HOA_HONG_TRUC_TIEP" ||
    catKey === "CHI_PHI_TRUC_TIEP_KHAC" ||
    catKey === "VAT_TU_TIEU_HAO"
  ) {
    return "COGS";
  }
  if (catKey.startsWith("HOA_HONG_")) {
    return "COMMISSION";
  }
  return "OPEX";
}

export function extractOpexFormData(
  data: Partial<GarageOpexItem>,
  currentYear: number,
) {
  const isRec = data.recurrenceType === "monthly";
  return {
    periodYear: data.periodYear || currentYear,
    periodMonth: data.periodMonth || 1,
    costGroup: getGroupByCatKey(data.categoryKey || "NHAN_SU"),
    categoryKey: data.categoryKey || "NHAN_SU",
    categoryName: data.categoryName || "",
    amount: String(data.amount || 0),
    ojAmount: String(data.ojAmount || 0),
    note: data.note || "",
    isRecurring: isRec,
    untilYear: isRec ? data.recurrenceUntilYear || currentYear : currentYear,
    untilMonth: isRec ? data.recurrenceUntilMonth || 12 : 12,
  };
}

export function buildPeriodOptions(currentYear: number): {
  monthOptions: ComboboxOption[];
  yearOptions: ComboboxOption[];
  untilYearOptions: ComboboxOption[];
} {
  return {
    monthOptions: Array.from({ length: 12 }, (_, i) => ({
      value: String(i + 1),
      label: `Tháng ${i + 1}`,
    })),
    yearOptions: Array.from({ length: 5 }, (_, i) => ({
      value: String(currentYear - 2 + i),
      label: `Năm ${currentYear - 2 + i}`,
    })),
    untilYearOptions: Array.from({ length: 5 }, (_, i) => ({
      value: String(currentYear + i),
      label: `Năm ${currentYear + i}`,
    })),
  };
}
