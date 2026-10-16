import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { GARAGE_CASE_CLASSIFICATIONS } from "@/modules/garage/components/GarageCaseClassificationBadge";

export function useGarageCaseExportOptions(branches?: any[]) {
  const { t } = useTranslation("garage");

  const branchOptions = useMemo(() => {
    const list = branches || [];
    return [
      {
        value: "",
        label: t("cases.exportDrawer.allBranches", "Tất cả chi nhánh"),
      },
      ...list.map((b: any) => ({
        value: b.externalId,
        label: b.name || b.code || b.externalId,
      })),
    ];
  }, [branches, t]);

  const classificationOptions = useMemo(
    () => [
      {
        value: "",
        label: t("cases.exportDrawer.allClassifications", "Tất cả phân loại"),
      },
      ...Object.entries(GARAGE_CASE_CLASSIFICATIONS).map(([k, meta]) => ({
        value: k,
        label: meta.label,
      })),
    ],
    [t],
  );

  const dateTypeOptions = useMemo(
    () => [
      {
        value: "completion_date",
        label: t(
          "cases.exportDrawer.dateTypeCompletion",
          "Ngày hoàn thành (kết thúc)",
        ),
      },
      {
        value: "case_date",
        label: t(
          "cases.exportDrawer.dateTypeCase",
          "Ngày tiếp nhận / phát sinh",
        ),
      },
    ],
    [t],
  );

  const statusOptions = useMemo(
    () => [
      {
        value: "completed",
        label: t(
          "cases.exportDrawer.statusCompletedOnly",
          "Đã kết thúc / Hoàn tất (Mặc định)",
        ),
      },
      {
        value: "all",
        label: t("cases.exportDrawer.statusAll", "Tất cả trạng thái"),
      },
    ],
    [t],
  );

  return {
    branchOptions,
    classificationOptions,
    dateTypeOptions,
    statusOptions,
  };
}
