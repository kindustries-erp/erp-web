import { useTranslation } from "react-i18next";
import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { GdtPortalAuthForm } from "./GdtPortalAuthForm";
import type { GdtPortalAuthDrawerProps } from "./GdtPortalAuthDrawer.type";
export type { GdtPortalAuthDrawerProps };

export function GdtPortalAuthDrawer({
  open,
  onClose,
  onSuccess,
}: GdtPortalAuthDrawerProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <V2StandardDrawer
      open={open}
      mode="edit"
      onClose={onClose}
      title={t("loginTaxPortal", "Đăng nhập Cổng Hóa đơn điện tử (GDT)")}
      layout="1-column"
      size="sm"
      confirmOnClose
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
export default GdtPortalAuthDrawer;
