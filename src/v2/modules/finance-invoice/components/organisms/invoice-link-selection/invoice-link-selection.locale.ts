import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Nhãn modal ghép nối chứng từ vào hóa đơn, namespace `v2.invoiceLinkSelection.*` */
registerV2ModuleLocale("invoiceLinkSelection", {
  vi: {
    picker: { select: "Chọn", linked: "Đã liên kết" },
    salesOrder: {
      title: "Chọn đơn bán hàng (SO)",
      searchPlaceholder: "Tìm theo số SO hoặc khách hàng",
      empty: "Không có đơn bán hàng",
      loadError: "Không tải được danh sách đơn bán hàng",
      col: {
        soNo: "Số SO",
        customer: "Khách hàng",
        orderDate: "Ngày đặt",
        status: "Trạng thái",
      },
    },
    purchaseOrder: {
      title: "Chọn đơn mua hàng (PO)",
      select: "Chọn",
      linked: "Đã liên kết",
      searchPlaceholder: "Tìm theo số PO hoặc nhà cung cấp",
      empty: "Không có đơn mua hàng",
      loadError: "Không tải được danh sách đơn mua hàng",
      col: {
        poNo: "Số PO",
        supplier: "Nhà cung cấp",
        orderDate: "Ngày đặt",
        status: "Trạng thái",
      },
    },
  },
  en: {
    picker: { select: "Select", linked: "Linked" },
    salesOrder: {
      title: "Choose sales order (SO)",
      searchPlaceholder: "Search by SO no. or customer",
      empty: "No sales orders",
      loadError: "Could not load sales orders",
      col: {
        soNo: "SO no.",
        customer: "Customer",
        orderDate: "Order date",
        status: "Status",
      },
    },
    purchaseOrder: {
      title: "Choose purchase order (PO)",
      select: "Select",
      linked: "Linked",
      searchPlaceholder: "Search by PO no. or supplier",
      empty: "No purchase orders",
      loadError: "Could not load purchase orders",
      col: {
        poNo: "PO no.",
        supplier: "Supplier",
        orderDate: "Order date",
        status: "Status",
      },
    },
  },
});
