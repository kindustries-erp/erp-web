import React from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { Settings } from "lucide-react";
import { useT } from "@/core/i18n";
import { ChangePasswordForm } from "@/modules/auth/components/ChangePasswordForm";
import { InvoiceSettingsForm } from "@/modules/erp-invoices-core/components/InvoiceSettingsForm";

export function GlobalSettingsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      icon={<Settings className="w-5 h-5" />}
      title={t("globalSettings.title")}
      panelClassName="min-[1024px]:w-[500px] flex flex-col"
      zIndex={410}
    >
      <div className="flex-1 overflow-y-auto bg-surface flex flex-col pb-4 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {t("globalSettings.accountSecurity")}
          </h2>
          <ChangePasswordForm onClose={onClose} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {t("globalSettings.eInvoice")}
          </h2>
          <InvoiceSettingsForm open={open} onClose={onClose} defaultTab="gdt" />
        </div>
      </div>
    </DrawerModal>
  );
}
