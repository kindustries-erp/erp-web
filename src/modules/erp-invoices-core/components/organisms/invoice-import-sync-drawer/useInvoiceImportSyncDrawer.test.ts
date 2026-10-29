import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInvoiceImportSyncDrawer } from "./useInvoiceImportSyncDrawer";

const portal = {
  needsRelogin: false,
  loading: false,
  clearResult: vi.fn(),
  sync: vi.fn(),
  result: null,
  hasToken: true,
  hasPassword: true,
};
const canEdit = { value: true };
const bulkXml = { mutateAsync: vi.fn(), isPending: false };

vi.mock("@/modules/erp-invoices-core/hooks/usePortalSync", () => ({
  usePortalSync: () => portal,
}));

vi.mock("@/modules/erp-invoices-core/hooks/useInvoiceXmlUpload", () => ({
  useInvoiceXmlUpload: () => ({
    step: "select",
    files: [],
    setDirection: vi.fn(),
    handleReset: vi.fn(),
  }),
}));

vi.mock("@/modules/erp-invoices-core/hooks/useBulkDownloadXmlMutation", () => ({
  useBulkDownloadXmlMutation: () => bulkXml,
}));

vi.mock("./useInvoiceSyncDrawerProgress", () => ({
  useInvoiceSyncDrawerProgress: () => ({
    startSyncLog: vi.fn(),
    addSyncLog: vi.fn(),
    failSync: vi.fn(),
    progress: { status: "idle", progress: 0, logs: [] },
  }),
}));

vi.mock(
  "@/v2/modules/finance-invoice/drawers/InvoiceSyncDrawer.period.hook",
  () => ({
    useInvoiceSyncPeriod: () => ({ reset: vi.fn(), dateFrom: "", dateTo: "" }),
  }),
);

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: () => canEdit.value,
}));

const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("react-hot-toast", () => ({ toast: toastMock }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: unknown) =>
      typeof fallback === "string" ? fallback : key,
  }),
}));

function renderDrawer(onOpenLogin = vi.fn()) {
  const hook = renderHook(() =>
    useInvoiceImportSyncDrawer({
      open: true,
      onClose: vi.fn(),
      onImported: vi.fn(),
      initialDirection: "IN",
      onOpenLogin,
    }),
  );
  return { ...hook, onOpenLogin };
}

describe("useInvoiceImportSyncDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    portal.needsRelogin = false;
    canEdit.value = true;
  });

  it("mở đăng nhập Cổng Thuế khi token cần đăng nhập lại và người dùng có quyền", () => {
    portal.needsRelogin = true;

    const { onOpenLogin } = renderDrawer();

    expect(onOpenLogin).toHaveBeenCalled();
  });

  it("không mở đăng nhập khi người dùng không có quyền sửa hóa đơn", () => {
    portal.needsRelogin = true;
    canEdit.value = false;

    const { onOpenLogin } = renderDrawer();

    expect(onOpenLogin).not.toHaveBeenCalled();
  });

  it("tải lại XML thành công thì báo toast bằng thông điệp server", async () => {
    bulkXml.mutateAsync.mockResolvedValueOnce({ message: "Đã xếp hàng XML" });

    const { result } = renderDrawer();
    await act(async () => {
      await result.current.handleBulkXml();
    });

    expect(bulkXml.mutateAsync).toHaveBeenCalledWith("IN");
    expect(toastMock.success).toHaveBeenCalledWith("Đã xếp hàng XML");
  });
});
