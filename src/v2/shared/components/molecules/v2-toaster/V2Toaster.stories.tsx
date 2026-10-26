import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { V2Toaster } from "./V2Toaster";

const ToasterDemo = () => {
  useEffect(() => {
    const { showToast } = useV2ToastStore.getState();
    showToast({
      title: "Thông báo hệ thống",
      description: "Hệ thống đang hoạt động ổn định",
      variant: "default",
    });
    showToast({
      title: "Đã lưu đối tác thành công",
      description: "Mã đối tác: BP-2026-001",
      variant: "success",
    });
    showToast({
      title: "Cảnh báo tồn kho",
      description: "Mặt hàng sắp chạm ngưỡng an toàn",
      variant: "warning",
    });
    showToast({
      title: "Không thể xóa đối tác",
      description: "Đối tác đang có chứng từ liên quan",
      variant: "destructive",
    });
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        <V2Button
          size="sm"
          variant="secondary"
          onClick={() =>
            useV2ToastStore.getState().showToast({
              title: "Thông báo mặc định",
              description: "Chi tiết thông báo dạng kính",
              variant: "default",
            })
          }
        >
          Default (Glass)
        </V2Button>
        <V2Button
          size="sm"
          onClick={() =>
            useV2ToastStore.getState().showToast({
              title: "Thao tác thành công",
              description: "Dữ liệu đã được lưu trữ an toàn",
              variant: "success",
            })
          }
        >
          Success
        </V2Button>
        <V2Button
          size="sm"
          variant="secondary"
          onClick={() =>
            useV2ToastStore.getState().showToast({
              title: "Cảnh báo giới hạn",
              description: "Bạn đã dùng 90% hạn mức",
              variant: "warning",
            })
          }
        >
          Warning
        </V2Button>
        <V2Button
          size="sm"
          variant="destructive"
          onClick={() =>
            useV2ToastStore.getState().showToast({
              title: "Lỗi kết nối",
              description: "Không thể kết nối đến máy chủ",
              variant: "destructive",
            })
          }
        >
          Destructive
        </V2Button>
      </div>
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
