import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useV2DocumentDependencyStore } from "@/v2/shared/stores/useV2DocumentDependencyStore";
import { V2DocumentDependencyModal } from "./V2DocumentDependencyModal";

describe("V2DocumentDependencyModal", () => {
  beforeEach(() => {
    useV2DocumentDependencyStore.getState().closeModal();
  });

  it("lists the documents that block the action", () => {
    render(<V2DocumentDependencyModal />);
    act(() => {
      useV2DocumentDependencyStore
        .getState()
        .openModal("Đối tác đang được sử dụng", ["PO-001", "HD-002"]);
    });

    expect(screen.getByText("Không thể hủy chứng từ")).toBeInTheDocument();
    expect(screen.getByText("PO-001")).toBeInTheDocument();
    expect(screen.getByText("HD-002")).toBeInTheDocument();
  });

  it("closes the store when the user dismisses it", () => {
    render(<V2DocumentDependencyModal />);
    act(() => {
      useV2DocumentDependencyStore.getState().openModal("x", ["PO-001"]);
    });

    fireEvent.click(screen.getByRole("button", { name: "Đóng" }));

    expect(useV2DocumentDependencyStore.getState().isOpen).toBe(false);
  });
});
