import { registerV2ModuleLocale } from "@/v2/shared/locales";

registerV2ModuleLocale("vinfastParts", {
  vi: {
    export: {
      title: "Xuất Excel tồn kho phụ tùng (FIFO)",
      subtitle:
        "File Excel trình bày theo phương pháp FIFO — giá vốn tính theo lô nhập cũ nhất. Sheet Tổng hợp xuất toàn bộ lịch sử, Sheet Chi tiết sẽ theo khoảng ngày đã chọn.",
      groups: {
        summary: "Tổng hợp tồn kho",
        ledger: "Sổ cái chi tiết FIFO",
      },
      columns: {
        stt: "STT",
        sku: "Mã phụ tùng",
        name: "Tên phụ tùng",
        uom: "ĐVT",
        qtyIn: "Tổng nhập",
        qtyOut: "Tổng xuất",
        qtyBalance: "Tồn kho",
        partSku: "Mã phụ tùng",
        partName: "Tên phụ tùng",
        transactionDate: "Ngày giao dịch",
        invoiceNo: "Số hóa đơn",
        direction: "Chiều",
        qty: "Số lượng",
        unitCost: "Đơn giá",
        amount: "Thành tiền",
        licensePlate: "Biển số xe",
        runningBalanceQty: "Tồn lũy kế",
        runningBalanceValue: "Giá trị tồn lũy kế",
      },
      filter: {
        vehicleType: "Loại xe",
        vehicleAll: "Tất cả",
        vehicleCar: "Ô tô",
        vehicleMotorbike: "Xe máy",
        keyword: "Từ khóa",
        noKeyword: "Không có",
      },
      progress: {
        failed: "Tạo file thất bại.",
        ready: "File đã sẵn sàng. Có thể tải xuống.",
        noJob: "Không có file nào đang sẵn sàng.",
      },
    },
  },
  en: {
    export: {
      title: "Export parts stock Excel (FIFO)",
      subtitle:
        "The Excel file is built with FIFO costing: cost is taken from the oldest purchase lots first. The summary sheet covers the full history; the detail sheet follows the selected date range.",
      groups: {
        summary: "Stock summary",
        ledger: "FIFO detail ledger",
      },
      columns: {
        stt: "No.",
        sku: "Part code",
        name: "Part name",
        uom: "Unit",
        qtyIn: "Total in",
        qtyOut: "Total out",
        qtyBalance: "Stock on hand",
        partSku: "Part code",
        partName: "Part name",
        transactionDate: "Transaction date",
        invoiceNo: "Invoice no.",
        direction: "Direction",
        qty: "Quantity",
        unitCost: "Unit cost",
        amount: "Amount",
        licensePlate: "License plate",
        runningBalanceQty: "Running qty",
        runningBalanceValue: "Running value",
      },
      filter: {
        vehicleType: "Vehicle type",
        vehicleAll: "All",
        vehicleCar: "Car",
        vehicleMotorbike: "Motorbike",
        keyword: "Keyword",
        noKeyword: "None",
      },
      progress: {
        failed: "File generation failed.",
        ready: "File is ready to download.",
        noJob: "No file is ready.",
      },
    },
  },
});
