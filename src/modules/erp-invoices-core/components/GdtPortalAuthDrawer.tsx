import React from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { GdtPortalAuthForm } from "./GdtPortalAuthForm";

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
  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title="Đăng nhập Cổng Hóa đơn điện tử (GDT)"
      panelClassName="min-[1024px]:w-[500px]"
    >
      <div className="p-1">
        <GdtPortalAuthForm
          onSuccess={() => {
            onSuccess?.();
            onClose();
          }}
          onCancel={onClose}
          showCancelButton
        />
      </div>
    </DrawerModal>
  );
}
