import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  DrawerField,
  DrawerSection,
  V2Input,
  V2Textarea,
} from "@/v2/shared/components";
import type { LoanFormValues } from "./LoanFormDrawer.type";
import { LoanFormTermsSection } from "./LoanFormTermsSection";

interface LoanFormFieldsProps {
  values: LoanFormValues;
  errors: Partial<Record<keyof LoanFormValues, string>>;
  handleChange: <K extends keyof LoanFormValues>(
    key: K,
    val: LoanFormValues[K],
  ) => void;
  isMobile?: boolean;
}

export const LoanFormFields: React.FC<LoanFormFieldsProps> = ({
  values,
  errors,
  handleChange,
  isMobile = false,
}) => {
  const { t } = useV2Translation();
  const inputSize = isMobile ? "lg" : "md";

  return (
    <div className="space-y-4">
      <DrawerSection
        title={t("v2.loans.drawer.generalSection", "Thông tin cơ bản")}
      >
        <div className="space-y-3.5">
          <DrawerField
            label={t("v2.loans.form.title", "Tên khoản vay")}
            required
            error={errors.title}
          >
            <V2Input
              sizeVariant={inputSize}
              value={values.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder={t(
                "v2.loans.form.titlePlaceholder",
                "VD: Vay vốn kinh doanh VCB",
              )}
              error={errors.title}
            />
          </DrawerField>

          <DrawerField
            label={t("v2.loans.form.lenderName", "Ngân hàng / Đơn vị cho vay")}
            required
            error={errors.lenderName}
          >
            <V2Input
              sizeVariant={inputSize}
              value={values.lenderName}
              onChange={(e) => handleChange("lenderName", e.target.value)}
              placeholder={t(
                "v2.loans.form.lenderFullPlaceholder",
                "VD: Vietcombank CN Hà Nội",
              )}
              error={errors.lenderName}
            />
          </DrawerField>
        </div>
      </DrawerSection>

      <LoanFormTermsSection
        values={values}
        errors={errors}
        handleChange={handleChange}
        inputSize={inputSize}
      />

      <DrawerSection
        title={t("v2.loans.drawer.notesSection", "Ghi chú & Điều khoản")}
        collapsible
      >
        <DrawerField label={t("v2.loans.form.notes", "Ghi chú")}>
          <V2Textarea
            rows={isMobile ? 2 : 3}
            value={values.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder={t(
              "v2.loans.form.notesPlaceholder",
              "Điều khoản hợp đồng, tài sản đảm bảo...",
            )}
          />
        </DrawerField>
      </DrawerSection>
    </div>
  );
};
