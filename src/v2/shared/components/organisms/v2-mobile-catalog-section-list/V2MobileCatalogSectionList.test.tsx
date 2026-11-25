import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Shield, Users, Mail } from "lucide-react";
import { V2MobileCatalogSectionList } from "./V2MobileCatalogSectionList";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? "",
  }),
}));

describe("V2MobileCatalogSectionList", () => {
  it("render các mục con trong children thành nút bấm hợp lệ và không tạo nút cho nhóm cha sub-*", () => {
    const onItemClick = vi.fn();
    const sections = [
      {
        id: "sec-settings",
        label: "HỆ THỐNG",
        items: [
          {
            id: "email-inbox",
            label: "Hộp thư",
            icon: Mail,
            href: "/email-inbox",
          },
          {
            id: "sub-access-control",
            label: "Quản lý truy cập",
            icon: Shield,
            href: "/users-management",
            children: [
              {
                id: "users-management",
                label: "Quản lý người dùng",
                icon: Users,
                href: "/users-management",
              },
              {
                id: "permission",
                label: "Phân quyền & Vai trò",
                icon: Shield,
                href: "/permission",
              },
            ],
          },
        ],
      },
    ];

    render(
      <V2MobileCatalogSectionList
        sections={sections}
        searchQuery=""
        onSearchChange={vi.fn()}
        isCustomizing={false}
        selectedIds={[]}
        activeNavId="permission"
        onItemClick={onItemClick}
      />,
    );

    expect(screen.getByText("Quản lý truy cập")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Quản lý truy cập" }),
    ).not.toBeInTheDocument();

    const permButton = screen.getByRole("button", {
      name: "Phân quyền & Vai trò",
    });
    fireEvent.click(permButton);

    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "permission", href: "/permission" }),
    );
  });
});
