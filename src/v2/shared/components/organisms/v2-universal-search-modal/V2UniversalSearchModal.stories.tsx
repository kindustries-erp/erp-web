import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FileText, Users, ShoppingCart, Warehouse } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms";
import { V2UniversalSearchModal } from "./V2UniversalSearchModal";
import type { V2SearchItem } from "./V2UniversalSearchModal.type";

const mockItems: V2SearchItem[] = [
  {
    id: "dashboard",
    title: "Tổng quan",
    category: "HỆ THỐNG",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "sales-orders",
    title: "Đơn bán hàng",
    category: "BÁN HÀNG",
    group: "Bán hàng",
    keywords: ["SO", "don hang", "ban xe"],
    icon: <ShoppingCart className="w-4 h-4" />,
  },
  {
    id: "customers",
    title: "Khách hàng",
    category: "BÁN HÀNG",
    group: "Bán hàng",
    keywords: ["doi tac", "nguoi mua"],
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: "inventory",
    title: "Tồn kho",
    category: "KHO",
    group: "Kho vận",
    keywords: ["so du", "vat tu", "phu tung"],
    icon: <Warehouse className="w-4 h-4" />,
  },
];

const meta: Meta<typeof V2UniversalSearchModal> = {
  title: "Components/Organisms/Navigation & Search/V2UniversalSearchModal",
  component: V2UniversalSearchModal,
  parameters: {
    layout: "centered",
  },
};
export default meta;

type Story = StoryObj<typeof V2UniversalSearchModal>;

const DefaultStory: React.FC = () => {
  const [open, setOpen] = useState(true);
  return (
    <div className="p-4">
      <V2Button type="button" variant="default" onClick={() => setOpen(true)}>
        Mở Tìm Kiếm Toàn Cục (Ctrl+K)
      </V2Button>
      <V2UniversalSearchModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(item) => {
          alert(`Selected: ${item.title} (${item.id})`);
          setOpen(false);
        }}
        items={mockItems}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <DefaultStory />,
};
