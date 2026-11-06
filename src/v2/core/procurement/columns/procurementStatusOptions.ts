import type { V2FilterOption } from "@/v2/shared/types/v2-table";

type T = (key: string, fallback: string) => string;

/** Bộ lựa chọn lọc trạng thái đề nghị mua (PR). */
export const getRequestStatusOptions = (t: T): V2FilterOption[] => [
  { value: "DRAFT", label: t("v2.procurement.status.DRAFT", "Bản nháp") },
  {
    value: "PENDING_APPROVAL",
    label: t("v2.procurement.status.PENDING_APPROVAL", "Chờ duyệt"),
  },
  {
    value: "SUBMITTED",
    label: t("v2.procurement.status.SUBMITTED", "Chờ duyệt"),
  },
  { value: "APPROVED", label: t("v2.procurement.status.APPROVED", "Đã duyệt") },
  { value: "REJECTED", label: t("v2.procurement.status.REJECTED", "Từ chối") },
  { value: "CANCELLED", label: t("v2.procurement.status.CANCELLED", "Đã hủy") },
  { value: "CLOSED", label: t("v2.procurement.status.CLOSED", "Đã đóng") },
];

/** Bộ lựa chọn tiến độ đặt hàng của đề nghị mua (PR). */
export const getOrderingStatusOptions = (t: T): V2FilterOption[] => [
  { value: "NONE", label: t("v2.procurement.status.NONE", "Chưa đặt") },
  { value: "PARTIAL", label: t("v2.procurement.status.PARTIAL", "Đang đặt") },
  { value: "FULL", label: t("v2.procurement.status.FULL", "Đã đặt đủ") },
];

/** Bộ lựa chọn trạng thái đơn mua (PO). */
export const getOrderStatusOptions = (t: T): V2FilterOption[] => [
  { value: "DRAFT", label: t("v2.procurement.status.DRAFT", "Nháp") },
  {
    value: "PENDING_APPROVAL",
    label: t("v2.procurement.status.PENDING_APPROVAL", "Chờ duyệt"),
  },
  { value: "APPROVED", label: t("v2.procurement.status.APPROVED", "Đã duyệt") },
  { value: "ISSUED", label: t("v2.procurement.status.ISSUED", "Đã phát hành") },
  { value: "CLOSED", label: t("v2.procurement.status.CLOSED", "Đã đóng") },
  { value: "CANCELLED", label: t("v2.procurement.status.CANCELLED", "Đã hủy") },
];

/** Bộ lựa chọn trục nhận hàng của đơn mua (PO). */
export const getOrderFulfillmentOptions = (t: T): V2FilterOption[] => [
  { value: "NONE", label: t("v2.procurement.status.NONE", "Chưa nhận") },
  {
    value: "PARTIAL",
    label: t("v2.procurement.status.PARTIAL", "Nhận một phần"),
  },
  { value: "FULL", label: t("v2.procurement.status.FULL", "Đã nhận đủ") },
];

/** Bộ lựa chọn trạng thái thanh toán của đơn mua (PO). */
export const getPaymentStatusOptions = (t: T): V2FilterOption[] => [
  {
    value: "UNPAID",
    label: t("v2.procurement.status.UNPAID", "Chưa thanh toán"),
  },
  {
    value: "PARTIALLY_PAID",
    label: t("v2.procurement.status.PARTIALLY_PAID", "Thanh toán một phần"),
  },
  { value: "PAID", label: t("v2.procurement.status.PAID", "Đã thanh toán") },
];
