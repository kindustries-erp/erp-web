import React from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { Settings } from "lucide-react";
import { ChangePasswordForm } from "@/modules/auth/components/ChangePasswordForm";
import { InvoiceSettingsForm } from "@/modules/erp-invoices-core/components/InvoiceSettingsForm";

export function GlobalSettingsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      icon={<Settings className="w-5 h-5" />}
      title="Cài đặt hệ thống"
      panelClassName="min-[1024px]:w-[500px] flex flex-col"
      zIndex={410}
    >
      <div className="flex-1 overflow-y-auto bg-surface flex flex-col pb-4 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Tài khoản & Bảo mật
          </h2>
          <ChangePasswordForm open={open} onClose={onClose} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Hóa đơn điện tử
          </h2>
          <InvoiceSettingsForm open={open} onClose={onClose} defaultTab="gdt" />
        </div>
      </div>
    </DrawerModal>
  );
}
