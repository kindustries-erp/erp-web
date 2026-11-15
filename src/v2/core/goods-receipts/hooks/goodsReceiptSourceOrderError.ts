import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";

/** Khóa lỗi nghiệp vụ khi lập phiếu từ đơn mua; khớp `v2.goodsReceipts.fromOrder.*` */
export const FROM_ORDER_CODES = ["notIssued", "fullyReceived", "noLines"];

type Translate = (key: string, fallback: string) => string;

/** Nội dung toast cho lỗi tải đơn mua nguồn: lỗi nghiệp vụ dịch theo khóa ngắn, lỗi API lấy từ server */
export function describeSourceOrderError(
  error: unknown,
  t: Translate,
): { title: string; description: string } {
  const code = error instanceof Error ? error.message : "";
  const title = t(
    "v2.goodsReceipts.fromOrder.error",
    "Không thể lập phiếu nhập từ đơn mua",
  );
  return {
    title,
    description: FROM_ORDER_CODES.includes(code)
      ? t(`v2.goodsReceipts.fromOrder.${code}`, code)
      : extractV2ApiError(error, title),
  };
}
