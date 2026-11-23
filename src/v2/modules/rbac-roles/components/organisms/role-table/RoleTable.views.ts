/** Chế độ xem hệ thống: cột hiển thị cho từng view. */
export const rolesViewVisibility = {
  overview: {
    name: true,
    description: true,
    users: true,
    isSystem: true,
    status: true,
    createdAt: false,
  },
  all: {
    name: true,
    description: true,
    users: true,
    isSystem: true,
    status: true,
    createdAt: true,
  },
} as const;
