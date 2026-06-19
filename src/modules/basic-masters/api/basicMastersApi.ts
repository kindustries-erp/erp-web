import axiosInstance from "@/core/api/axiosInstance";
import { dedupeRequest } from "@/shared/utils/requestCache";

export interface BasicMasterPartner {
  id: string;
  code: string;
  name: string;
  displayName?: string | null;
  partnerType: string;
}

export interface BasicMasterInventoryItem {
  id: string;
  sku: string;
  itemName: string;
  uom: string;
  itemType: string;
  status?: string | null;
}

export interface BasicMasterOption {
  id: string;
  code: string;
  name: string;
}

export interface BasicMasterErpInvoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  sellerName?: string | null;
  direction: "IN" | "OUT";
  status: string;
}

export interface BasicMasterEmployee {
  id: string;
  employeeCode: string;
  fullName: string;
  status: string;
}

export interface BasicMastersPayload {
  customers?: BasicMasterPartner[];
  suppliers?: BasicMasterPartner[];
  inventoryItems?: BasicMasterInventoryItem[];
  uoms?: BasicMasterOption[];
  itemTypes?: BasicMasterOption[];
  employees?: BasicMasterEmployee[];
  erpInvoices?: BasicMasterErpInvoice[];
}

interface BasicMastersResponse {
  items: BasicMastersPayload;
  meta: {
    search: string | null;
    limit: number;
    page: number;
    entities: string[];
  };
}

export const basicMastersApi = {
  list: async (params?: {
    search?: string;
    limit?: number;
    page?: number;
    entities?: string;
  }) => {
    const requestParams = {
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.limit ? { limit: params.limit } : {}),
      ...(params?.page ? { page: params.page } : {}),
      ...(params?.entities ? { entities: params.entities } : {}),
    };
    const key = `basic-masters:${JSON.stringify(requestParams)}`;
    return dedupeRequest(key, async () => {
      const { data } = await axiosInstance.get<BasicMastersResponse>(
        "/api/v1/basic-masters",
        { params: requestParams },
      );
      return data;
    });
  },
};
