import React from "react";
import { Building2, Plus } from "lucide-react";
import { GARAGE_CASE_CLASSIFICATIONS } from "../../GarageCaseClassificationBadge";

export function getClassificationDisplayMeta(caseItem: any, t: any) {
  const effectiveCode =
    caseItem.category?.code || caseItem.classification || "";
  const meta =
    GARAGE_CASE_CLASSIFICATIONS[
      effectiveCode === "OJ_NGOAI" ? "OJ" : effectiveCode
    ];
  const label =
    caseItem.category?.name ||
    (meta
      ? t(`cases.classification.${meta.value}`, meta.label)
      : effectiveCode) ||
    t("cases.classification.unclassified", "Chưa phân loại");
  const icon =
    meta?.icon ||
    (effectiveCode ? (
      <Building2 className="w-3 h-3 mr-1 shrink-0" />
    ) : (
      <Plus className="w-2.5 h-2.5 mr-1 opacity-70 shrink-0" />
    ));
  const colorClass =
    meta?.colorClass ||
    (effectiveCode
      ? "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800/40"
      : "border-dashed border-slate-300 dark:border-slate-700 text-muted-foreground/70 bg-transparent");

  return { label, icon, colorClass };
}
