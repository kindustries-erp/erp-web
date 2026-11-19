import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { V2OwnerFilesApi } from "@/v2/shared/files";
import { V2AttachmentsPanel } from "./V2AttachmentsPanel";

const api: V2OwnerFilesApi = {
  basePath: "/story/attachments",
  list: async () => ({
    items: [
      {
        id: "1",
        ownerType: "INVOICE",
        ownerId: "x",
        category: "HOA_DON",
        isOriginal: true,
        fileName: "HD-0001234.pdf",
        fileSize: 245_000,
        mimeType: "application/pdf",
        origin: "V2",
        createdBy: null,
        createdAt: "2026-11-16T00:00:00Z",
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
    ],
    policy: {
      maxFileBytes: 20 * 1024 * 1024,
      maxFilesPerRequest: 10,
      allowedExtensions: ["pdf", "xml"],
      allowedMimeTypes: [],
    },
    categories: ["HOA_DON", "KHAC"],
  }),
  upload: async () => [],
  remove: async () => undefined,
  downloadUrl: async () => ({ url: "", expiresIn: 300 }),
};

const meta: Meta<typeof V2AttachmentsPanel> = {
  title: "Components/Organisms/V2AttachmentsPanel",
  component: V2AttachmentsPanel,
  tags: ["autodocs"],
  args: { api, canEdit: true },
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="w-[520px] p-6">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof V2AttachmentsPanel>;

export const Editable: Story = {};
export const ReadOnly: Story = { args: { canEdit: false } };
