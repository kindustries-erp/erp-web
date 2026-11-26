import { V2Combobox, V2SearchInput, V2Stack } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

/** Phạm vi xem: theo chi nhánh đang chọn ở shell, hoặc mọi chi nhánh (không gửi `x-erp-branch-id`). */
export type GarageWorkshopBranchScope = "current" | "all";

export interface GarageWorkshopFiltersProps {
  isDesktop: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  classification: string | null;
  onClassificationChange: (value: string | null) => void;
  /** Có chi nhánh ở shell thì mới hiện ô phạm vi; không có thì trang đã xem mọi chi nhánh. */
  showScope: boolean;
  scope: GarageWorkshopBranchScope;
  onScopeChange: (value: GarageWorkshopBranchScope) => void;
}

const k = (key: string) => `v2.garageCases.workshop.${key}`;

/** Hàng lọc của trang tiến độ xưởng: tìm kiếm, phạm vi chi nhánh, phân loại. */
export function GarageWorkshopFilters({
  isDesktop,
  search,
  onSearchChange,
  classification,
  onClassificationChange,
  showScope,
  scope,
  onScopeChange,
}: GarageWorkshopFiltersProps) {
  const { t } = useV2Translation();
  const width = isDesktop ? "w-48" : "w-full";
  return (
    <V2Stack className={isDesktop ? "flex-row gap-2" : "w-full gap-2"}>
      <V2SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder={t(
          k("searchPlaceholder"),
          "Tìm biển số, mã phiếu, khách, người làm",
        )}
        className={isDesktop ? "max-w-md" : "w-full"}
      />
      {showScope ? (
        <V2Combobox
          searchable={false}
          value={scope}
          onValueChange={(v) => {
            if (v === "current" || v === "all") onScopeChange(v);
          }}
          options={[
            {
              value: "current",
              label: t(k("scopeCurrent"), "Chi nhánh đang chọn"),
            },
            { value: "all", label: t(k("scopeAll"), "Tất cả chi nhánh") },
          ]}
          aria-label={t(k("scope"), "Phạm vi chi nhánh")}
          className={width}
        />
      ) : null}
      <V2Combobox
        searchable={false}
        clearable
        value={classification}
        onValueChange={onClassificationChange}
        options={[{ value: "OJ", label: t(k("classificationOj"), "Xe OJ") }]}
        placeholder={t(k("classificationAll"), "Tất cả phân loại")}
        aria-label={t(k("classification"), "Phân loại")}
        className={width}
      />
    </V2Stack>
  );
}
