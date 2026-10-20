import type {
  GarageWorkflowFlow,
  GarageWorkflowText,
} from "./garageWorkflowTypes";
import { WORKFLOW_BUSINESS_COLORS } from "./workflowPalette";

const txt = (key: string, fallback: string): GarageWorkflowText => ({
  key,
  fallback,
});

/** Id các luồng tự động giữa module (A–D) và luồng thủ công (M). Dùng chung cho cả 2 sơ đồ. */
export const FLOW = {
  forecast: "forecast",
  opex: "opex",
  commission: "commission",
  receipt: "receipt",
  manual: "manual",
} as const;

/**
 * Màu luồng lấy từ bảng chart dashboard: thu xanh lá, chi cam, báo cáo tím, hệ thống teal.
 * Key i18n: workflow.flows.* (tên) và workflow.flowDescriptions.* (mô tả).
 */
export const GARAGE_AUTO_FLOWS: GarageWorkflowFlow[] = [
  {
    id: FLOW.forecast,
    letter: "A",
    color: WORKFLOW_BUSINESS_COLORS.income,
    title: txt("workflow.flows.forecast", "Phiếu Kết thúc → tự sinh Dự thu"),
    description: txt(
      "workflow.flowDescriptions.forecast",
      "Khi sync KGara thấy phiếu chuyển sang Kết thúc, hệ thống tự sinh phiếu thu Dự thu (EXPECTED) hạn +7 ngày; rời Kết thúc thì phiếu tự bị hủy.",
    ),
  },
  {
    id: FLOW.opex,
    letter: "B",
    color: WORKFLOW_BUSINESS_COLORS.expense,
    title: txt(
      "workflow.flows.opex",
      "Lưu phiếu chi HHBH / vật tư → tự ghi OPEX",
    ),
    description: txt(
      "workflow.flowDescriptions.opex",
      "Khi lưu phiếu chi nội dung HHBH hoặc Vật tư tiêu hao ở trạng thái Đã duyệt hoặc Đã chi, hệ thống tự ghi dòng chi phí vào OPEX trong cùng transaction.",
    ),
  },
  {
    id: FLOW.commission,
    letter: "C",
    color: WORKFLOW_BUSINESS_COLORS.report,
    title: txt(
      "workflow.flows.commission",
      "Mở báo cáo P&L → tự sinh phiếu hoa hồng",
    ),
    description: txt(
      "workflow.flowDescriptions.commission",
      "Khi mở báo cáo P&L, hệ thống chạy nền để sinh phiếu chi hoa hồng PENDING (và phiếu delta nếu P&L tăng sau khi đã chi); không có cron riêng.",
    ),
  },
  {
    id: FLOW.receipt,
    letter: "D",
    color: WORKFLOW_BUSINESS_COLORS.system,
    title: txt(
      "workflow.flows.receipt",
      "Lưu phiếu thu/chi gắn phiếu dịch vụ → tự cấn trừ, đặt lại Dự thu",
    ),
    description: txt(
      "workflow.flowDescriptions.receipt",
      "Khi lưu phiếu thu hoặc chi có gắn phiếu dịch vụ, hệ thống tự cấn trừ vào phiếu và đặt lại Dự thu theo số còn phải thu.",
    ),
  },
  {
    id: FLOW.manual,
    letter: "M",
    color: WORKFLOW_BUSINESS_COLORS.neutral,
    title: txt("workflow.flows.manual", "Thủ công (người dùng thao tác)"),
    description: txt(
      "workflow.flowDescriptions.manual",
      "Các thao tác người dùng chủ động làm: cập nhật trạng thái phiếu trên KGara, cấn trừ tay, nhập chi phí vận hành.",
    ),
  },
];
