import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InvoiceShapePage } from "./invoice-shape";

const queryClient = new QueryClient();

/**
 * Bằng chứng parity: một trang có hình dạng erp-invoice (dashboard + 2 bảng + drawer chi tiết 2 cột
 * + drawer hạch toán xếp tầng + drawer xuất + modal hàng loạt + modal nhập XML) chỉ gồm thành phần V2
 * và logic giả. Không gọi API, không import module thật.
 */
const meta: Meta<typeof InvoiceShapePage> = {
  title: "Components/Templates/V2ModulePage/InvoiceShape",
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
