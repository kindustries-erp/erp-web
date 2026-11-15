export const USER_VIEW_VISIBILITY = {
  overview: {
    email: true,
    employee: true,
    status: true,
    lastLoginAt: true,
    createdAt: false,
  },
  all: {
    email: true,
    employee: true,
    status: true,
    lastLoginAt: true,
    createdAt: true,
  },
} as const;
