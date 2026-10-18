import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { V2Toaster } from "./V2Toaster";

const ToasterDemo = () => {
  useEffect(() => {
    const { showToast } = useV2ToastStore.getState();
    showToast({ title: "Đã lưu đối tác thành công", variant: "success" });
    showToast({
      title: "Không thể xóa đối tác",
      description: "Đối tác đang có chứng từ liên quan",
      variant: "destructive",
    });
  }, []);

  return (
    <div className="p-6">
      <V2Button
        size="sm"
        onClick={() =>
          useV2ToastStore.getState().showToast({ title: "Thông báo mới" })
        }
      >
        Hiện thông báo
      </V2Button>
      <V2Toaster />
    </div>
  );
};

const meta: Meta<typeof V2Toaster> = {
  title: "Components/Molecules/V2Toaster",
  component: V2Toaster,
  tags: ["autodocs"],
  render: () => <ToasterDemo />,
};

export default meta;
type Story = StoryObj<typeof V2Toaster>;

export const Default: Story = {};
