import type { Meta, StoryObj } from "@storybook/react";
import { V2SyncProgress } from "./V2SyncProgress";
import type { V2SyncProgressEntry } from "./V2SyncProgress.type";

const labels = {
  empty: "Chưa có tiến trình nào...",
  running: "Đang đồng bộ",
  done: "Hoàn tất",
  error: "Đồng bộ thất bại",
};

const now = Date.now();
const sampleLogs: V2SyncProgressEntry[] = [
  { at: now - 9000, message: "Đang khởi tạo tiến trình đồng bộ..." },
  { at: now - 6000, message: "Đang lấy danh sách hóa đơn (trang 1)..." },
  { at: now - 3000, message: "Đang tải chi tiết & XML (3/10)..." },
  { at: now, message: "Đã tải xong 10 hóa đơn", level: "success" },
];

const meta: Meta<typeof V2SyncProgress> = {
  title: "Components/Molecules/Display/V2SyncProgress",
  component: V2SyncProgress,
  tags: ["autodocs"],
  args: { status: "idle", logs: [], labels },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof V2SyncProgress>;

export const Idle: Story = {};
export const Running: Story = {
  args: {
    status: "running",
    progress: 45,
    currentItem: "HĐ 1847 · C26MSP · CÔNG TY ABC",
    logs: sampleLogs.slice(0, 3),
  },
};
export const Indeterminate: Story = {
  args: {
    status: "running",
    progress: undefined,
    logs: sampleLogs.slice(0, 1),
  },
};
export const Done: Story = {
  args: { status: "done", logs: sampleLogs },
};
export const Error: Story = {
  args: {
    status: "error",
    progress: 30,
    logs: [
      ...sampleLogs.slice(0, 2),
      {
        at: now,
        message: "Token Cổng Thuế hết hạn",
        level: "error",
      },
    ],
  },
};
