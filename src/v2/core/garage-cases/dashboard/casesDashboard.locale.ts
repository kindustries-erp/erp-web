import {
  registerV2ModuleLocale,
  type V2ModuleLocale,
} from "@/v2/shared/locales";

/**
 * Chữ hiển thị của lõi dashboard garage (`v2.garageCasesDashboard.*`).
 * Đặt namespace riêng vì đăng ký locale ghi đè theo namespace, không gộp.
 */
export const garageCasesDashboardLocale: V2ModuleLocale = {
  vi: {
    kpi: {
      vehiclesUnit: "xe",
      casesUnit: "lệnh",
      amount: "Tiền",
      projectedNote: "Lệnh đang làm, chưa hoàn thành và chưa hủy",
    },
    stage: {
      intake: "Tiếp nhận",
      quotation: "Báo giá",
      inProgress: "Đang làm",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    },
    funnel: {
      title: "Phễu giai đoạn",
      vehicleNote:
        "Số xe đếm theo biển số khác nhau. Một xe ở nhiều giai đoạn được đếm ở từng giai đoạn.",
      rate: "Tỷ lệ",
    },
    classification: {
      title: "Theo phân loại",
      SUA_CHUA_CHUNG: "Sửa chữa chung",
      KY_GUI_NOI_BO: "Ký gửi / Nội bộ",
      OJ_NGOAI: "OJ Ngoài",
      KHAC: "Khác",
      columns: {
        classification: "Phân loại",
        vehicles: "Xe",
        cases: "Lệnh",
        amount: "Tiền",
      },
    },
  },
  en: {
    kpi: {
      vehiclesUnit: "vehicles",
      casesUnit: "cases",
      amount: "Amount",
      projectedNote: "Open cases, neither completed nor cancelled",
    },
    stage: {
      intake: "Intake",
      quotation: "Quotation",
      inProgress: "In progress",
      completed: "Completed",
      cancelled: "Cancelled",
    },
    funnel: {
      title: "Stage funnel",
      vehicleNote:
        "Vehicles are counted by distinct license plate. A vehicle in several stages is counted in each stage.",
      rate: "Rate",
    },
    classification: {
      title: "By classification",
      SUA_CHUA_CHUNG: "General repair",
      KY_GUI_NOI_BO: "Consignment / Internal",
      OJ_NGOAI: "OJ External",
      KHAC: "Other",
      columns: {
        classification: "Classification",
        vehicles: "Vehicles",
        cases: "Cases",
        amount: "Amount",
      },
    },
  },
};

registerV2ModuleLocale("garageCasesDashboard", garageCasesDashboardLocale);
