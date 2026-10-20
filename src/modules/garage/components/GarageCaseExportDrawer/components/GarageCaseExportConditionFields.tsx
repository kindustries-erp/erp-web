import React from "react";
import { useTranslation } from "react-i18next";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import {
  GarageCaseExportExtraFields,
  type GarageCaseExportExtraFieldsProps,
} from "./GarageCaseExportExtraFields";

export interface GarageCaseExportConditionFieldsProps extends GarageCaseExportExtraFieldsProps {
  /** Loại ngày, phân loại, trạng thái chỉ áp dụng ở chế độ "Theo kỳ". */
  showExtraFields: boolean;
  selectedBranchId: string;
  branchOptions: ComboboxOption[];
}

/** Trường riêng của "Bảng kê phiếu dịch vụ" trong section điều kiện xuất: lọc phiếu + chi nhánh (chỉ xem). */
export function GarageCaseExportConditionFields({
  showExtraFields,
  selectedBranchId,
  branchOptions,
  ...extraFields
}: GarageCaseExportConditionFieldsProps) {
  const { t } = useTranslation("garage");

  return (
    <div className="space-y-3">
      {showExtraFields && <GarageCaseExportExtraFields {...extraFields} />}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">
          {t("cases.exportDrawer.branch", "Chi nhánh")}
        </label>
        {/* Chi nhánh chỉ xem: lấy theo chi nhánh đang chọn ở trang */}
        <Combobox
          options={branchOptions}
          value={selectedBranchId}
          onChange={() => {}}
          placeholder={t("cases.exportDrawer.allBranches", "Tất cả chi nhánh")}
          disabled={true}
          allowClear={false}
        />
      </div>
    </div>
  );
}
