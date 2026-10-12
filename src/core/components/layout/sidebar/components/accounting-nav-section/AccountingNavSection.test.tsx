import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  renderHook,
  act,
} from "@testing-library/react";
import { AccountingNavSection } from "./AccountingNavSection";
import { useAccountingNavSection } from "./AccountingNavSection.hook";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { ErpResource } from "@/modules/system/types/rbac";

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: vi.fn(),
}));

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => {
    const map: Record<string, string> = {
      "nav.sections.accounting": "KẾ TOÁN",
      "nav.items.cashflow": "Dòng tiền",
      "nav.items.erpInvoices": "Hóa đơn",
      "nav.items.partnerDebts": "Công nợ theo đối tượng",
      "nav.items.operatingExpenses": "Chi phí vận hành",
      "nav.items.reportJournal": "Sổ nhật ký chung",
      "nav.items.catalogAccounts": "Hệ thống tài khoản",
    };
    return map[key] ?? fallback ?? key;
  },
}));

describe("useAccountingNavSection hook", () => {
  const mockNavTo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      employee: { email: "user@liouni.com" },
    } as any);
  });

  it("handles invoice active state on sub-pages", () => {
    vi.mocked(useHasPermission).mockReturnValue(true);
    const { result } = renderHook(() =>
      useAccountingNavSection({
        currentPage: "erp-invoices-in",
        navTo: mockNavTo,
      }),
    );
    expect(result.current.isInvoiceActive).toBe(true);
    expect(result.current.isCashflowActive).toBe(false);
  });

  it("dispatches navTo calls on handlers", () => {
    vi.mocked(useHasPermission).mockReturnValue(true);
    const { result } = renderHook(() =>
      useAccountingNavSection({
        currentPage: "dashboard",
        navTo: mockNavTo,
      }),
    );

    act(() => {
      result.current.handleNavCashflow();
    });
    expect(mockNavTo).toHaveBeenCalledWith("cashflow");

    act(() => {
      result.current.handleNavInvoices();
    });
    expect(mockNavTo).toHaveBeenCalledWith("erp-invoices");

    act(() => {
      result.current.handleNavDebts();
    });
    expect(mockNavTo).toHaveBeenCalledWith("invoice-debts");

    act(() => {
      result.current.handleNavOpex();
    });
    expect(mockNavTo).toHaveBeenCalledWith("opex");
  });
});

describe("AccountingNavSection RBAC Matrix", () => {
  const mockNavTo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      employee: { email: "user@liouni.com" },
    } as any);
  });

  it("renders null when user has no accounting permissions", () => {
    vi.mocked(useHasPermission).mockReturnValue(false);

    const { container } = render(
      <AccountingNavSection
        collapsed={false}
        currentPage="dashboard"
        navTo={mockNavTo}
      />,
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText("KẾ TOÁN")).toBeNull();
  });

  it("renders only Invoices and Partner Debts when user only has INVOICES permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.INVOICES;
    });

    render(
      <AccountingNavSection
        collapsed={false}
        currentPage="erp-invoices"
        navTo={mockNavTo}
      />,
    );

    expect(screen.getByText("KẾ TOÁN")).toBeInTheDocument();
    expect(screen.getByText("Hóa đơn")).toBeInTheDocument();
    expect(screen.getByText("Công nợ theo đối tượng")).toBeInTheDocument();
    expect(screen.getByText("Sổ nhật ký chung")).toBeInTheDocument();
    expect(screen.getByText("Hệ thống tài khoản")).toBeInTheDocument();

    expect(screen.queryByText("Dòng tiền")).toBeNull();
    expect(screen.queryByText("Chi phí vận hành")).toBeNull();
  });

  it("renders Cashflow but excludes OPEX for non-admin user with BANK_STATEMENTS permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.BANK_STATEMENTS;
    });

    render(
      <AccountingNavSection
        collapsed={false}
        currentPage="cashflow"
        navTo={mockNavTo}
      />,
    );

    expect(screen.getByText("KẾ TOÁN")).toBeInTheDocument();
    expect(screen.getByText("Dòng tiền")).toBeInTheDocument();
    expect(screen.queryByText("Hóa đơn")).toBeNull();
    expect(screen.queryByText("Chi phí vận hành")).toBeNull();
  });

  it("renders OPEX for admin user with BANK_STATEMENTS permission", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      employee: { email: "admin@liouni.com" },
    } as any);

    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.BANK_STATEMENTS;
    });

    render(
      <AccountingNavSection
        collapsed={false}
        currentPage="opex"
        navTo={mockNavTo}
      />,
    );

    expect(screen.getByText("Chi phí vận hành")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Chi phí vận hành"));
    expect(mockNavTo).toHaveBeenCalledWith("opex");
  });

  it("renders all 6 flat items when user has full permissions and is admin", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      employee: { email: "admin@liouni.com" },
    } as any);
    vi.mocked(useHasPermission).mockReturnValue(true);

    render(
      <AccountingNavSection
        collapsed={false}
        currentPage="erp-invoices"
        navTo={mockNavTo}
      />,
    );

    expect(screen.getByText("Dòng tiền")).toBeInTheDocument();
    expect(screen.getByText("Hóa đơn")).toBeInTheDocument();
    expect(screen.getByText("Công nợ theo đối tượng")).toBeInTheDocument();
    expect(screen.getByText("Chi phí vận hành")).toBeInTheDocument();
    expect(screen.getByText("Sổ nhật ký chung")).toBeInTheDocument();
    expect(screen.getByText("Hệ thống tài khoản")).toBeInTheDocument();
  });
});
