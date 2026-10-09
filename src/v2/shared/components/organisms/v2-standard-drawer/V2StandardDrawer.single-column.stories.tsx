import React, { useState } from "react";
import { V2StandardDrawer } from "./V2StandardDrawer";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { DrawerField } from "@/v2/shared/components/molecules/v2-drawer-field";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";

import type { Meta } from "@storybook/react";

const meta: Meta<typeof V2StandardDrawer> = {
  title: "Components/Organisms/Drawer/V2StandardDrawer",
  component: V2StandardDrawer,
};

export default meta;

export const SingleColumnSimple = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8 flex flex-col items-start gap-4">
      <V2Button onClick={() => setOpen(true)}>Mở Single Column Drawer</V2Button>
      <V2StandardDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Biểu mẫu tạo danh mục sản phẩm"
        subtitle="Cấu hình nhanh các trường thông tin cơ bản"
        layout="1-column"
        actions={[
          {
            label: "Hủy bỏ",
            variant: "secondary",
            onClick: () => setOpen(false),
          },
          {
            label: "Lưu thay đổi",
            primary: true,
            onClick: () => setOpen(false),
          },
        ]}
      >
        <div className="space-y-4">
          <DrawerSection title="Thông tin cơ bản">
            <DrawerField label="Mã danh mục" required>
              <input
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-foreground"
                placeholder="VD: CAT-001"
              />
            </DrawerField>
            <DrawerField label="Tên danh mục" required>
              <input
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-foreground"
                placeholder="VD: Linh kiện phụ tùng xe máy điện"
              />
            </DrawerField>
          </DrawerSection>
        </div>
      </V2StandardDrawer>
    </div>
  );
};
