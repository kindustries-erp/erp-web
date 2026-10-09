import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InvoiceShapePage } from "./invoice-shape";

const queryClient = new QueryClient();

/**
 * Use case: mô phỏng màn erp-invoice bằng V2 module page (hình dạng InvoiceShape).
 * Không có global searchbox; mỗi cột có header filter và sort; nút "Đồng bộ" có menu thao tác.
 * Dữ liệu giả, không gọi API.
 */
const meta: Meta<typeof InvoiceShapePage> = {
  title: "Use Cases/Tài chính & Hóa đơn/Hóa đơn (V2 module page)",
  component: InvoiceShapePage,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="h-screen w-full bg-background p-4">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof InvoiceShapePage>;

export const Desktop: Story = {};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
