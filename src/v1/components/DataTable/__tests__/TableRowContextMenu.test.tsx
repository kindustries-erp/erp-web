import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { TableRowContextMenu } from "../TableRowContextMenu";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";

describe("TableRowContextMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockItems: ActionDropdownItem[] = [
    {
      groupLabel: "TRA CỨU",
      items: [
        {
          label: "Xem chi tiết",
          onClick: vi.fn(),
        },
      ],
    },
    {
      groupLabel: "THAO TÁC",
      items: [
        {
          label: "Chỉnh sửa",
          onClick: vi.fn(),
        },
        {
          label: "Xóa",
          variant: "danger",
          onClick: vi.fn(),
        },
        {
          label: "Bị vô hiệu",
          disabled: true,
          onClick: vi.fn(),
        },
      ],
    },
  ];

  it("does not render when isOpen is false", () => {
    render(
      <TableRowContextMenu
        x={100}
        y={100}
        items={mockItems}
        isOpen={false}
        onClose={vi.fn()}
      />,
    );
    expect(
      screen.queryByTestId("table-row-context-menu"),
    ).not.toBeInTheDocument();
  });

  it("renders correctly with groups and items when isOpen is true", () => {
    render(
      <TableRowContextMenu
        x={100}
        y={100}
        items={mockItems}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByTestId("table-row-context-menu")).toBeInTheDocument();
    expect(screen.getByText("TRA CỨU")).toBeInTheDocument();
    expect(screen.getByText("THAO TÁC")).toBeInTheDocument();
    expect(screen.getByText("Xem chi tiết")).toBeInTheDocument();
    expect(screen.getByText("Chỉnh sửa")).toBeInTheDocument();
    expect(screen.getByText("Xóa")).toBeInTheDocument();
    expect(screen.getByText("Bị vô hiệu")).toBeInTheDocument();
  });

  it("calls action onClick and onClose when clicked", async () => {
    const handleClose = vi.fn();
    const handleEditClick = vi.fn();

    const items: ActionDropdownItem[] = [
      {
        label: "Chỉnh sửa",
        onClick: handleEditClick,
      },
    ];

    render(
      <TableRowContextMenu
        x={150}
        y={200}
        items={items}
        isOpen={true}
        onClose={handleClose}
      />,
    );

    const editBtn = screen.getByText("Chỉnh sửa");
    fireEvent.click(editBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);

    // Wait for timeout dispatch
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(handleEditClick).toHaveBeenCalledTimes(1);
  });

  it("does not trigger onClick when disabled", () => {
    const handleClose = vi.fn();
    const handleDisabledClick = vi.fn();

    const items: ActionDropdownItem[] = [
      {
        label: "Disabled action",
        disabled: true,
        onClick: handleDisabledClick,
      },
    ];

    render(
      <TableRowContextMenu
        x={150}
        y={200}
        items={items}
        isOpen={true}
        onClose={handleClose}
      />,
    );

    const btn = screen.getByText("Disabled action");
    fireEvent.click(btn);

    expect(handleClose).not.toHaveBeenCalled();
    expect(handleDisabledClick).not.toHaveBeenCalled();
  });

  it("closes when Escape key is pressed", async () => {
    const handleClose = vi.fn();

    render(
      <TableRowContextMenu
        x={150}
        y={200}
        items={mockItems}
        isOpen={true}
        onClose={handleClose}
      />,
    );

    // Allow event listener timer to attach
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("closes on outside click", async () => {
    const handleClose = vi.fn();

    render(
      <div>
        <div data-testid="outside-area">Outside</div>
        <TableRowContextMenu
          x={150}
          y={200}
          items={mockItems}
          isOpen={true}
          onClose={handleClose}
        />
      </div>,
    );

    // Allow event listener timer to attach
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    fireEvent.click(screen.getByTestId("outside-area"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
