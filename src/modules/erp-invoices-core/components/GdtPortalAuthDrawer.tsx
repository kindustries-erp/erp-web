import React from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { GdtPortalAuthForm } from "./GdtPortalAuthForm";
import { useTranslation } from "react-i18next";

export interface GdtPortalAuthDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GdtPortalAuthDrawer({
  open,
  onClose,
  onSuccess,
}: GdtPortalAuthDrawerProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <StandardFormDrawer
      open={open}
      mode="edit"
      onClose={onClose}
      title={t("loginTaxPortal", "Đăng nhập Cổng Hóa đơn điện tử (GDT)")}
      layout="1-column"
      size="sm"
      confirmOnClose={true}
      leftPanel={
        <div className="flex flex-col gap-4">
          <GdtPortalAuthForm
            onSuccess={() => {
              onSuccess?.();
              onClose();
            }}
            onCancel={onClose}
            showCancelButton
          />
        </div>
      }
    />
  );
}
