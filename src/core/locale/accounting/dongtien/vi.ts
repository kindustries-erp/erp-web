export const dongtienVi = {
  title: "Tổng Hợp Dòng Tiền",
  desc: "Tổng hợp dòng tiền tất cả nguồn trong kỳ.",
  kpi: {
    totalBalance: "Tổng số dư",
    totalBalanceSub: "Tất cả nguồn",
    income: "Tổng thu",
    expense: "Tổng chi",
    net: "Lưu chuyển thuần",
  },
  sources: "Nguồn quỹ",
  channels: {
    cash: "Tiền mặt",
    vcb: "Tiền gửi – VCB",
    tcb: "Tiền gửi – TCB",
  },
  chart: {
    trend: "Xu hướng tổng hợp (6T)",
    incomeStructure: "Cơ cấu thu",
    expenseStructure: "Cơ cấu chi",
    income: "Thu",
    expense: "Chi",
  },
  donut: {
    sales: "Bán hàng",
    untDebt: "Thu TG nợ",
    other: "Khác",
    uncSupplier: "Chi TG NCC",
    uncSalary: "Chi TG lương",
    expense: "Chi phí",
  },
  summary: {
    title: "Tổng hợp theo nguồn quỹ",
    headers: ["Nguồn quỹ", "Đầu kỳ", "Tổng thu", "Tổng chi", "Cuối kỳ"],
    rows: {
      cash: "Tiền mặt (1111)",
      vcb: "Tiền gửi – VCB (1121)",
      tcb: "Tiền gửi – TCB (1122)",
      total: "Tổng cộng",
    },
  },
};
