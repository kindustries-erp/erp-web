import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationPopover } from "@/core/components/layout/sidebar/components/NotificationPopover";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string) => {
    const map: Record<string, string> = {
      "topbar.notifications.title": "Thông báo",
      "topbar.notifications.empty": "Chưa có thông báo nào",
    };
    return map[key] ?? key;
  },
}));

describe("NotificationPopover", () => {
  it("renders trigger button", () => {
    render(
      <NotificationPopover>
        <button>Bell</button>
      </NotificationPopover>,
    );
    expect(screen.getByRole("button", { name: "Bell" })).toBeInTheDocument();
  });

  it("shows notification panel with title when clicked", () => {
    render(
      <NotificationPopover>
        <button>Bell</button>
      </NotificationPopover>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Bell" }));

    expect(screen.getByText("Thông báo")).toBeInTheDocument();
  });

  it("shows empty state message", () => {
    render(
      <NotificationPopover>
        <button>Bell</button>
      </NotificationPopover>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Bell" }));

    expect(screen.getByText("Chưa có thông báo nào")).toBeInTheDocument();
  });

  it("does not show content before clicking", () => {
    render(
      <NotificationPopover>
        <button>Bell</button>
      </NotificationPopover>,
    );

    expect(screen.queryByText("Thông báo")).not.toBeInTheDocument();
    expect(screen.queryByText("Chưa có thông báo nào")).not.toBeInTheDocument();
  });
});
