import axiosInstance from "./axiosInstance";

export interface CoreNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  isRead: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export const notificationsApi = {
  findAll: async (): Promise<CoreNotification[]> => {
    const res = await axiosInstance.get("/api/v1/notifications");
    return res.data;
  },
  markAsRead: async (id: string): Promise<void> => {
    const res = await axiosInstance.patch(`/api/v1/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async (): Promise<void> => {
    const res = await axiosInstance.patch("/api/v1/notifications/read-all");
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    const res = await axiosInstance.delete(`/api/v1/notifications/${id}`);
    return res.data;
  },
  deleteAll: async (): Promise<void> => {
    const res = await axiosInstance.delete("/api/v1/notifications/all");
    return res.data;
  },
};
