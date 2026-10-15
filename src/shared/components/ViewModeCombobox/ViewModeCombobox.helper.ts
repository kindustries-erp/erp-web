import type { TableViewPreset } from "@/shared/hooks/useUserPreferences";

export const isDefaultPreset = (preset: TableViewPreset): boolean => {
  return (
    preset.key === "overview" ||
    preset.key === "audit" ||
    preset.key === "all_columns" ||
    preset.key === "financial_progress" ||
    preset.isDefault === true
  );
};

export const getPresetLabel = (
  preset: TableViewPreset,
  t: (key: string, opts?: any) => string,
): string => {
  if (preset.key === "overview" || preset.key === "all_columns") {
    if (
      !preset.label ||
      preset.label === "Tổng quan" ||
      preset.label === "Tất cả cột" ||
      preset.label === "Overview"
    ) {
      return t("viewModeOverview", {
        defaultValue: t("cases.viewModeOverview", {
          defaultValue: "Tổng quan",
        }),
      });
    }
  }
  if (preset.key === "audit" || preset.key === "financial_progress") {
    if (
      !preset.label ||
      preset.label === "Đối soát" ||
      preset.label === "Kiểm toán / Đối soát" ||
      preset.label === "Tiến độ & Dòng tiền" ||
      preset.label === "Audit"
    ) {
      return t("viewModeAudit", {
        defaultValue: t("cases.viewModeAudit", { defaultValue: "Đối soát" }),
      });
    }
  }
  return preset.label;
};
