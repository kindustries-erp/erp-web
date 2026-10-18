import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCashflowTable } from "./GarageCashflowTable";
import { useGarageCashflowTable } from "./GarageCashflowTable.hook";
import { getGarageCashflowRowActions } from "./GarageCashflowTable.columns";
import {
  renderCaseCodeCell,
  renderLicensePlateCell,
  renderPaymentMethodCell,
  renderPaymentContentCell,
  renderPaymentStatusCell,
} from "./GarageCashflowTable.helper";
import { getGarageCashflowColumns } from "./GarageCashflowTable.columns";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the hook
vi.mock("./GarageCashflowTable.hook", () => ({
  useGarageCashflowTable: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const mockRow: GarageCashflowVoucher = {
  id: "test-v-1",
  voucherCode: "PT-GARA-001",
  voucherType: "RECEIPT",
  amount: 1000000,
  transDate: "2026-10-11",
  createdAt: "2026-10-11T10:00:00Z",
  updatedAt: "2026-10-11T10:00:00Z",
} as any;

describe("GarageCashflowTable", () => {
  it("renders correctly without crashing", () => {
    (useGarageCashflowTable as any).mockReturnValue({
      data: [],
      total: 0,
      totalPages: 0,
      isLoading: false,
      page: 1,
      setPage: vi.fn(),
      pageSize: 20,
      setPageSize: vi.fn(),
      sorts: [],
      setSort: vi.fn(),
      columnFilters: {},
      setColumnFilter: vi.fn(),
      columnSearch: {},
      setColumnSearch: vi.fn(),
      activeFilterCount: 0,
      clearAllFilters: vi.fn(),
      refetch: vi.fn(),
      getColumnOptions: vi.fn(),
      createMutation: { mutate: vi.fn(), isPending: false },
      updateMutation: { mutate: vi.fn(), isPending: false },
      deleteMutation: { mutate: vi.fn(), isPending: false },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCashflowTable
          tabs={[{ value: "all", label: "Tất cả" }]}
          activeTab="all"
          onTabChange={vi.fn()}
          onCreate={vi.fn()}
          canDelete={false}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Thu chi garage")).toBeInTheDocument();
    expect(screen.getByText("Tạo phiếu mới")).toBeInTheDocument();
  });

  describe("getGarageCashflowRowActions", () => {
    it("omits delete action when canDelete is false", () => {
      const onDelete = vi.fn();
      const actionsFn = getGarageCashflowRowActions(
        vi.fn(),
        onDelete,
        true,
        false,
      );
      const actions = actionsFn(mockRow);

      const hasDelete = actions.some((group: any) =>
        group.items?.some((item: any) => item.key === "delete"),
      );
      expect(hasDelete).toBe(false);
    });

    it("omits delete action when onDelete is undefined even if canDelete is true", () => {
      const actionsFn = getGarageCashflowRowActions(
        vi.fn(),
        undefined,
        true,
        true,
      );
      const actions = actionsFn(mockRow);

      const hasDelete = actions.some((group: any) =>
        group.items?.some((item: any) => item.key === "delete"),
      );
      expect(hasDelete).toBe(false);
    });

    it("includes delete action with red icon and normal text without danger variant when canDelete is true and onDelete exists", () => {
      const onDelete = vi.fn();
      const actionsFn = getGarageCashflowRowActions(
        vi.fn(),
        onDelete,
        true,
        true,
      );
      const actions = actionsFn(mockRow);

      const deleteGroup = actions.find(
        (group: any) => group.groupLabel === "Khác",
      );
      expect(deleteGroup).toBeDefined();

      const deleteItem = deleteGroup?.items.find(
        (item: any) => item.key === "delete",
      ) as any;
      expect(deleteItem).toBeDefined();
      expect(deleteItem?.label).toBe("Xóa phiếu");
      expect(deleteItem?.variant).toBeUndefined();

      expect(React.isValidElement(deleteItem?.icon)).toBe(true);
      expect((deleteItem?.icon.props as any).className).toContain(
        "text-red-500",
      );

      deleteItem?.onClick();
      expect(onDelete).toHaveBeenCalledWith(mockRow);
    });
  });

  describe("renderCaseCodeCell", () => {
    it("renders case code and calls onOpenCaseDetail when clicked", () => {
      const onOpenCaseDetail = vi.fn();
      const mockVoucher = {
        ...mockRow,
        case: { id: "c-1", soChungTu: "GR-PDV-001" },
      } as any;

      render(<div>{renderCaseCodeCell(mockVoucher, onOpenCaseDetail)}</div>);

      expect(screen.getByText("GR-PDV-001")).toBeInTheDocument();
      const detailButton = screen.getByRole("button", {
        name: "Xem chi tiết",
      });
      expect(detailButton).toBeInTheDocument();
      detailButton.click();
      expect(onOpenCaseDetail).toHaveBeenCalledWith("GR-PDV-001");
    });
  });

  describe("renderLicensePlateCell", () => {
    it("renders licensePlate from voucher or case", () => {
      const mockVoucher = {
        ...mockRow,
        licensePlate: "51A-888.88",
      } as any;

      render(<div>{renderLicensePlateCell(mockVoucher)}</div>);
      expect(screen.getByText("51A-888.88")).toBeInTheDocument();
    });

    it("renders dash when no license plate", () => {
      render(<div>{renderLicensePlateCell({} as any)}</div>);
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });

  describe("renderPaymentMethodCell", () => {
    it("renders Tiền mặt badge with emerald styling", () => {
      const mockVoucher = {
        ...mockRow,
        paymentMethod: "Tiền mặt",
      } as any;

      const { container } = render(
        <div>{renderPaymentMethodCell(mockVoucher)}</div>,
      );
      expect(screen.getByText("Tiền mặt")).toBeInTheDocument();
      expect(container.innerHTML).toContain("text-emerald-600");
    });

    it("renders Chuyển khoản badge with sky styling", () => {
      const mockVoucher = {
        ...mockRow,
        paymentMethod: "Chuyển khoản",
      } as any;

      const { container } = render(
        <div>{renderPaymentMethodCell(mockVoucher)}</div>,
      );
      expect(screen.getByText("Chuyển khoản")).toBeInTheDocument();
      expect(container.innerHTML).toContain("text-sky-600");
    });
  });

  describe("renderPaymentContentCell", () => {
    it("renders 1. KH thanh toán badge with emerald styling", () => {
      const mockVoucher = {
        ...mockRow,
        paymentContent: "1. KH thanh toán",
      } as any;

      const { container } = render(
        <div>{renderPaymentContentCell(mockVoucher)}</div>,
      );
      expect(screen.getByText("1. KH thanh toán")).toBeInTheDocument();
      expect(container.innerHTML).toContain("text-emerald-600");
    });

    it("renders 8. Vật tư tiêu hao badge with cyan styling", () => {
      const mockVoucher = {
        ...mockRow,
        paymentContent: "8. Vật tư tiêu hao",
      } as any;

      const { container } = render(
        <div>{renderPaymentContentCell(mockVoucher)}</div>,
      );
      expect(screen.getByText("8. Vật tư tiêu hao")).toBeInTheDocument();
      expect(container.innerHTML).toContain("text-cyan-600");
    });

    it("renders 7. Phụ tùng / vật tư badge with orange styling", () => {
      const mockVoucher = {
        ...mockRow,
        paymentContent: "7. Phụ tùng / vật tư",
      } as any;

      const { container } = render(
        <div>{renderPaymentContentCell(mockVoucher)}</div>,
      );
      expect(screen.getByText("7. Phụ tùng / vật tư")).toBeInTheDocument();
      expect(container.innerHTML).toContain("text-orange-600");
    });

    it("renders legacy Ứng trước badge with amber styling", () => {
      const mockVoucher = {
        ...mockRow,
        paymentContent: "Ứng trước",
      } as any;

      const { container } = render(
        <div>{renderPaymentContentCell(mockVoucher)}</div>,
      );
      expect(screen.getByText("Ứng trước")).toBeInTheDocument();
      expect(container.innerHTML).toContain("text-amber-600");
    });
  });

  describe("renderPaymentStatusCell", () => {
    it("renders Dự thu for RECEIPT with EXPECTED status", () => {
      const mockReceipt = {
        ...mockRow,
        voucherType: "RECEIPT",
        paymentStatus: "EXPECTED",
      } as any;
      const { container } = render(
        <div>{renderPaymentStatusCell(mockReceipt)}</div>,
      );
      expect(screen.getByText("Dự thu")).toBeInTheDocument();
      expect(container.innerHTML).toContain("text-amber-600");
    });

    it("renders Đã thu for RECEIPT with PAID or null status", () => {
      const mockReceipt = {
        ...mockRow,
        voucherType: "RECEIPT",
        paymentStatus: "PAID",
      } as any;
      const { container } = render(
        <div>{renderPaymentStatusCell(mockReceipt)}</div>,
      );
      expect(screen.getByText("Đã thu")).toBeInTheDocument();
      expect(container.innerHTML).toContain("text-emerald-600");

      const mockLegacyReceipt = {
        ...mockRow,
        voucherType: "RECEIPT",
        paymentStatus: null,
      } as any;
      render(<div>{renderPaymentStatusCell(mockLegacyReceipt)}</div>);
      expect(screen.getAllByText("Đã thu")).toHaveLength(2);
    });

    it("renders Chờ duyệt for PAYMENT with PENDING status", () => {
      const mockPayment = {
        ...mockRow,
        voucherType: "PAYMENT",
        paymentStatus: "PENDING",
      } as any;
      const { container } = render(
        <div>{renderPaymentStatusCell(mockPayment)}</div>,
      );
      expect(screen.getByText("Chờ duyệt")).toBeInTheDocument();
      expect(container.innerHTML).toContain("text-amber-600");
    });

    it("renders Đã duyệt for PAYMENT with APPROVED status", () => {
      const mockPayment = {
        ...mockRow,
        voucherType: "PAYMENT",
        paymentStatus: "APPROVED",
      } as any;
      const { container } = render(
        <div>{renderPaymentStatusCell(mockPayment)}</div>,
      );
      expect(screen.getByText("Đã duyệt")).toBeInTheDocument();
      expect(container.innerHTML).toContain("text-indigo-600");
    });

    it("renders Đã chi for PAYMENT with PAID status", () => {
      const mockPayment = {
        ...mockRow,
        voucherType: "PAYMENT",
        paymentStatus: "PAID",
      } as any;
      const { container } = render(
        <div>{renderPaymentStatusCell(mockPayment)}</div>,
      );
      expect(screen.getByText("Đã chi")).toBeInTheDocument();
      expect(container.innerHTML).toContain("text-emerald-600");
    });
  });

  describe("getGarageCashflowColumns", () => {
    it("sets column width to 160 for paymentMethod and paymentContent", () => {
      const mockFilterBuilder = vi.fn((key) => key) as any;
      mockFilterBuilder.date = vi.fn(() => "date");
      mockFilterBuilder.amount = vi.fn(() => "amount");

      const columns = getGarageCashflowColumns(
        mockFilterBuilder,
        vi.fn(),
        vi.fn(),
      );

      const pmCol = columns.find((c) => c.key === "paymentMethod");
      const pcCol = columns.find((c) => c.key === "paymentContent");
      expect(pmCol?.size).toBe(160);
      expect(pcCol?.size).toBe(160);
    });

    it("places paymentContent right after paymentMethod, followed by caseCode and licensePlate", () => {
      const mockFilterBuilder = vi.fn((key) => key) as any;
      mockFilterBuilder.date = vi.fn(() => "date");
      mockFilterBuilder.amount = vi.fn(() => "amount");

      const columns = getGarageCashflowColumns(
        mockFilterBuilder,
        vi.fn(),
        vi.fn(),
      );

      const keys = columns.map((c) => c.key);
      const chiIndex = keys.indexOf("chi");
      expect(keys[chiIndex + 1]).toBe("paymentStatus");
      const paymentIndex = keys.indexOf("paymentMethod");
      expect(paymentIndex).toBeGreaterThan(-1);
      expect(keys[paymentIndex + 1]).toBe("paymentContent");
      expect(keys[paymentIndex + 2]).toBe("caseCode");
      expect(keys[paymentIndex + 3]).toBe("licensePlate");
    });
  });
});
