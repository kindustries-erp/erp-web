import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AttachmentsPage } from "./AttachmentsPage";
import * as useHasPermissionModule from "@/shared/hooks/useHasPermission";

vi.mock("@/pages/Forbidden", () => ({
  Forbidden: () => <div data-testid="forbidden-screen">Forbidden Access</div>,
}));

vi.mock("../../organisms/attachments-table", () => ({
  AttachmentsTable: () => (
    <div data-testid="attachments-table-mock">Attachments Table Component</div>
  ),
}));

vi.mock("../../molecules/attachment-detail-modal", () => ({
  AttachmentDetailModal: () => null,
}));

vi.mock("@/modules/erp-invoices-core/hooks/useErpInvoiceForm", () => ({
  useErpInvoiceForm: () => ({
    internalDrawerOpen: false,
    setInternalDrawerOpen: vi.fn(),
    editMode: false,
    detailInvoice: null,
    startEdit: vi.fn(),
    saving: false,
    handleSave: vi.fn(),
    cancelEdit: vi.fn(),
    handleSyncDetail: vi.fn(),
    loadingDetail: false,
    form: {},
    setForm: vi.fn(),
    pendingTagIds: [],
    setPendingTagIds: vi.fn(),
    postingState: null,
    pendingUnpost: false,
    setPendingUnpost: vi.fn(),
    openInternal: vi.fn(),
  }),
}));

vi.mock("@/modules/erp-invoices-core/components", () => ({
  ErpInvoiceInternalDrawer: ({ children }: any) => <div>{children}</div>,
  ErpInvoiceInternalMain: () => null,
  ErpInvoiceInternalSidebar: () => null,
  ErpInvoicePdfUpload: () => null,
  VietnamInvoiceTemplate: () => null,
}));

describe("AttachmentsPage RBAC Guard", () => {
  it("renders Forbidden screen when user lacks ATTACHMENTS:READ permission", () => {
    vi.spyOn(useHasPermissionModule, "useHasPermission").mockReturnValue(false);

    render(<AttachmentsPage />);
    expect(screen.getByTestId("forbidden-screen")).toBeDefined();
    expect(screen.queryByTestId("attachments-table-mock")).toBeNull();
  });

  it("renders Attachments Table when user has ATTACHMENTS:READ permission", () => {
    vi.spyOn(useHasPermissionModule, "useHasPermission").mockReturnValue(true);

    render(<AttachmentsPage />);
    expect(screen.getByTestId("attachments-table-mock")).toBeDefined();
    expect(screen.queryByTestId("forbidden-screen")).toBeNull();
  });
});
