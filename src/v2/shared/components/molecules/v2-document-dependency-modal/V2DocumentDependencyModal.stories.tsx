import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { useV2DocumentDependencyStore } from "@/v2/shared/stores/useV2DocumentDependencyStore";
import { V2DocumentDependencyModal } from "./V2DocumentDependencyModal";

const OpenOnMount = () => {
  useEffect(() => {
    useV2DocumentDependencyStore
      .getState()
      .openModal("Đối tác đang được sử dụng", ["PO-001", "HD-002", "PT-003"]);
  }, []);
  return <V2DocumentDependencyModal />;
};

const meta: Meta<typeof V2DocumentDependencyModal> = {
  title: "Components/Molecules/V2DocumentDependencyModal",
  component: V2DocumentDependencyModal,
  tags: ["autodocs"],
  render: () => <OpenOnMount />,
};

export default meta;
type Story = StoryObj<typeof V2DocumentDependencyModal>;

export const Default: Story = {};
