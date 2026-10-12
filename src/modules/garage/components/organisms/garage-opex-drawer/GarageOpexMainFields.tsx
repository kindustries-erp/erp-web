import React from "react";
import { DrawerField, inputCls } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import type { useGarageOpexDrawer } from "./garage-opex-drawer.hook";
import { GarageOpexAmountFields } from "./GarageOpexAmountFields";

interface GarageOpexMainFieldsProps {
  form: ReturnType<typeof useGarageOpexDrawer>;
  isView: boolean;
}

export function GarageOpexMainFields({
  form,
  isView,
}: GarageOpexMainFieldsProps) {
  const {
    periodYear,
    setPeriodYear,
    periodMonth,
    setPeriodMonth,
    costGroup,
    categoryKey,
    categoryName,
    setCategoryName,
    note,
    setNote,
    loading,
    isReadOnlyRecord,
    handleCostGroupChange,
    handleCategoryChange,
    monthOptions,
    yearOptions,
    costGroupOptions,
    categoryOptions,
    t,
  } = form;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <DrawerField label={t("opex.drawer.periodMonth", "Tháng")}>
          <Combobox
            options={monthOptions}
            value={String(periodMonth)}
            onChange={(v) => v && setPeriodMonth(Number(v))}
            disabled={isView || loading}
            allowClear={false}
          />
        </DrawerField>
        <DrawerField label={t("opex.drawer.periodYear", "Năm")}>
          <Combobox
            options={yearOptions}
            value={String(periodYear)}
            onChange={(v) => v && setPeriodYear(Number(v))}
            disabled={isView || loading}
            allowClear={false}
          />
        </DrawerField>
      </div>

      <DrawerField label={t("opex.drawer.costGroupLabel", "Nhóm chi phí (*)")}>
        <Combobox
          options={costGroupOptions}
          value={costGroup}
          onChange={(v) => v && handleCostGroupChange(v)}
          disabled={isView || loading}
          allowClear={false}
        />
      </DrawerField>

      <DrawerField
        label={t("opex.drawer.categoryKeyLabel", "Loại chi phí chi tiết (*)")}
      >
        <Combobox
          options={categoryOptions}
          value={categoryKey}
          onChange={(v) => v && handleCategoryChange(v)}
          disabled={isView || loading}
          allowClear={false}
        />
      </DrawerField>

      <DrawerField
        label={t("opex.drawer.categoryNameLabel", "Nội dung / Diễn giải (*)")}
      >
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          disabled={isView || loading || isReadOnlyRecord}
          className={inputCls}
        />
      </DrawerField>

      <GarageOpexAmountFields form={form} isView={isView} />

      <DrawerField label={t("opex.drawer.noteLabel", "Ghi chú")}>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isView || loading}
          className={`${inputCls} min-h-[80px] resize-y`}
          rows={3}
        />
      </DrawerField>
    </>
  );
}
