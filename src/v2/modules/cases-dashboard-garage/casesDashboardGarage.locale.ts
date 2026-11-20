import {
  registerV2ModuleLocale,
  type V2ModuleLocale,
} from "@/v2/shared/locales";

/** Chữ riêng của trang dashboard garage V2 (`v2.casesDashboardGarage.*`). */
export const casesDashboardGarageLocale: V2ModuleLocale = {
  vi: {
    title: "Dashboard Garage",
    subtitle: "Số xe đếm theo biển số; số lệnh và tiền cộng theo lệnh.",
    loading: "Đang tải dữ liệu...",
    loadError: "Không tải được dữ liệu dashboard.",
    periodTitle: "Theo kỳ",
    projectedTitle: "Dự thu",
    month: "Tháng này",
    week: "Tuần này",
    day: "Hôm nay",
    projectedToday: "Dự thu hôm nay",
    projectedMonth: "Dự thu cả tháng",
    casesTitle: "Danh sách lệnh",
    close: "Đóng",
    previous: "Trước",
    next: "Sau",
    pageInfo: "Trang {{page}} / {{total}}",
    emptyCases: "Không có lệnh nào trong giai đoạn này.",
    columns: {
      caseCode: "Số lệnh",
      plate: "Biển số",
      customer: "Khách hàng",
      stage: "Giai đoạn",
      amount: "Tiền",
    },
  },
  en: {
    title: "Garage Dashboard",
    subtitle:
      "Vehicles are counted by license plate; cases and amounts are counted per case.",
    loading: "Loading data...",
    loadError: "Could not load dashboard data.",
    periodTitle: "By period",
    projectedTitle: "Projected",
    month: "This month",
    week: "This week",
    day: "Today",
    projectedToday: "Projected today",
    projectedMonth: "Projected this month",
    casesTitle: "Cases",
    close: "Close",
    previous: "Previous",
    next: "Next",
    pageInfo: "Page {{page}} / {{total}}",
    emptyCases: "No cases in this stage.",
    columns: {
      caseCode: "Case no.",
      plate: "License plate",
      customer: "Customer",
      stage: "Stage",
      amount: "Amount",
    },
  },
};

registerV2ModuleLocale("casesDashboardGarage", casesDashboardGarageLocale);
