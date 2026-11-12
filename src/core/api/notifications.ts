import axiosInstance from "./axiosInstance";

export type NotificationType = "INFO" | "WARNING" | "ERROR" | "SUCCESS";

/** Chứng từ liên quan để bấm thông báo mở đúng drawer/modal. */
export interface NotificationTarget {
  module: string;
  id: string;
  action: string | null;
}

export interface CoreNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  extraData: Record<string, unknown>;
  target: NotificationTarget | null;
}

interface NotificationListResponse {
  items: CoreNotification[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    next: number | null;
    previous: number | null;
  };
  unreadCount: number;
}

const BASE_URL = "/api/v2/notifications";
const LIST_PAGE_SIZE = 50;

export const notificationsApi = {
  findAll: async (): Promise<CoreNotification[]> => {
    const res = await axiosInstance.get<NotificationListResponse>(BASE_URL, {
      params: { page: 1, pageSize: LIST_PAGE_SIZE },
    });
    return res.data.items;
  },
  markAsRead: async (id: string): Promise<void> => {
    const res = await axiosInstance.patch(`${BASE_URL}/${id}/read`);
    return res.data;
  },
  markAllAsRead: async (): Promise<void> => {
    const res = await axiosInstance.patch(`${BASE_URL}/read-all`);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    const res = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return res.data;
  },
  deleteAll: async (): Promise<void> => {
    const res = await axiosInstance.delete(`${BASE_URL}/all`);
    return res.data;
  },
};
