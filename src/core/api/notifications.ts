import axiosInstance from "./axiosInstance";

/**
 * Loại thông báo hệ thống chuẩn ERP (khớp contract backend).
 * Tuân thủ chuẩn Phần D của /erp-ui-structure.
 */
export enum NotificationType {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
}

/**
 * Hành động điều hướng tương tác của chứng từ liên kết.
 */
export enum NotificationTargetAction {
  APPROVE = "APPROVE",
  VIEW = "VIEW",
}

/** Chứng từ liên quan để bấm thông báo mở đúng drawer/modal. */
export interface NotificationTarget {
  module: string;
  id: string;
  action: NotificationTargetAction | string | null;
}

export interface CoreNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType | `${NotificationType}`;
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
  /** Dữ liệu phụ của danh sách (không thuộc từng dòng). */
  extraData: { unreadCount: number };
}

export interface NotificationInboxResult {
  items: CoreNotification[];
  unreadCount: number;
}

const BASE_URL = "/api/v2/notifications-inbox";
const LIST_PAGE_SIZE = 50;

export const notificationsApi = {
  findAll: async (): Promise<CoreNotification[]> => {
    const res = await axiosInstance.get<NotificationListResponse>(BASE_URL, {
      params: { page: 1, pageSize: LIST_PAGE_SIZE },
    });
    return res.data.items;
  },
  findInbox: async (): Promise<NotificationInboxResult> => {
    const res = await axiosInstance.get<NotificationListResponse>(BASE_URL, {
      params: { page: 1, pageSize: LIST_PAGE_SIZE },
    });
    return {
      items: res.data.items,
      unreadCount: res.data.extraData?.unreadCount ?? 0,
    };
  },
  getUnreadCount: async (): Promise<number> => {
    const res = await axiosInstance.get<{ unreadCount: number }>(
      `${BASE_URL}/unread-count`,
    );
    return res.data.unreadCount;
  },
  markAsRead: async (id: string): Promise<void> => {
    const res = await axiosInstance.patch(`${BASE_URL}/${id}/read`, undefined, {
      _silentSuccess: true,
    });
    return res.data;
  },
  markAllAsRead: async (): Promise<void> => {
    const res = await axiosInstance.patch(`${BASE_URL}/read-all`, undefined, {
      _silentSuccess: true,
    });
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
