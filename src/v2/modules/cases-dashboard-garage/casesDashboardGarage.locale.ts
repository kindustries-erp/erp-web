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
    vehiclesTitle: "Danh sách xe",
    close: "Đóng",
    previous: "Trước",
    next: "Sau",
    pageInfo: "Trang {{page}} / {{total}}",
    emptyVehicles: "Không có xe nào trong giai đoạn này.",
    columns: {
      plate: "Biển số",
      caseCount: "Số lệnh",
      caseCode: "Số phiếu",
      customer: "Khách hàng",
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
    vehiclesTitle: "Vehicles",
    close: "Close",
    previous: "Previous",
    next: "Next",
    pageInfo: "Page {{page}} / {{total}}",
    emptyVehicles: "No vehicles in this stage.",
    columns: {
      plate: "License plate",
      caseCount: "Cases",
      caseCode: "Case no.",
      customer: "Customer",
      amount: "Amount",
    },
  },
};

registerV2ModuleLocale("casesDashboardGarage", casesDashboardGarageLocale);
