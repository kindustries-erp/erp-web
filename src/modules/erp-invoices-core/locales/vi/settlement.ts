export const erpInvoicesViSettlement = {
  // Invoice Preview / Stamp
  "invoiceTemplate.buyerSigner": "NGƯỜI MUA HÀNG",
  "invoiceTemplate.sellerSigner": "NGƯỜI BÁN HÀNG",
  "invoiceTemplate.signerHint": "(Ký, ghi rõ họ tên)",
  "invoiceTemplate.stamp.valid": "ĐÃ KÝ SỐ HỢP LỆ",
  "invoiceTemplate.stamp.brand": "Hóa đơn điện tử",
  "invoiceTemplate.stamp.signedDate": "Ký ngày",
  "invoiceTemplate.stamp.invoiceNo": "Số hóa đơn",
  "invoiceTemplate.stamp.serialNo": "Ký hiệu",

  // Sinvoice Draft Sync - toasts & notifications
  "sinvoiceDraft.syncSuccess":
    "Đã cập nhật: +{{added}} mới, -{{removed}} đã xoá. Tổng: {{synced}}",
  "sinvoiceDraft.syncFail": "Đồng bộ thất bại",
  "sinvoiceDraft.notifyTitle": "Đồng bộ hóa đơn nháp thành công",
  "sinvoiceDraft.notifyMessage":
    "Danh sách hóa đơn nháp Viettel đã cập nhật: +{{added}} mới, -{{removed}} đã xoá. Tổng hiện tại: {{syncedCount}} nháp.",

  // Smart Net-Off & Settlement Suggestions
  "smartSuggestion.title": "Gợi ý Đối soát Thông minh",
  "smartSuggestion.searching": "Đang tìm kiếm...",
  "smartSuggestion.noMatch":
    "Chưa tìm thấy giao dịch khớp chính xác với hóa đơn này. Bạn có thể tìm kiếm thủ công trong danh sách bên dưới.",
  "smartSuggestion.accept": "Nhận gợi ý",
  "smartSuggestion.viewDetail": "Nhấn để xem chi tiết sao kê",
  "smartSuggestion.deleteTxn": "Xóa giao dịch này",
  "smartSuggestion.partner": "Đối tác:",
  "smartSuggestion.netOffLabel": "Cấn trừ:",
  "smartSuggestion.badge.perfect": "Tiền + Số HĐ/CT + Đối tác",
  "smartSuggestion.badge.high": "Tiền + Số HĐ/CT",
  "smartSuggestion.badge.likely": "Tiền + Tên đối tác",
  "smartSuggestion.badge.possible": "Chỉ khớp số tiền",
  "smartSuggestion.badge.noticeStrong": "Số HĐ/CT + Đối tác (khác tiền)",
  "smartSuggestion.badge.notice": "Khớp Số HĐ/CT (khác tiền)",
  "smartSuggestion.warning.possible": "Chỉ khớp số tiền, vui lòng kiểm tra kỹ",
  "smartSuggestion.warning.overRemaining":
    "Cảnh báo: Tổng tiền cấn trừ ({{current}}) đang vượt quá số tiền cần thanh toán của hóa đơn ({{target}}). Vui lòng điều chỉnh lại số tiền trước khi xác nhận.",

  // Line items (Diễn giải từng dòng HĐ)
  "tabs.headerView": "Hóa đơn tổng",
  "tabs.linesView": "Chi tiết dòng hàng",
  "tabs.allLines": "Tất cả dòng",
  "tabs.normalLines": "Hàng hóa",
  "tabs.discountLines": "Chiết khấu",
  inboundLinesTitle: "Bảng kê HHDV mua vào",
  inboundLinesDesc:
    "Theo dõi và đối soát từng dòng diễn giải, mặt hàng, số lượng và thuế suất của hóa đơn đầu vào",
  outboundLinesTitle: "Bảng kê HHDV bán ra",
  outboundLinesDesc:
    "Theo dõi và đối soát từng dòng diễn giải, mặt hàng, số lượng và thuế suất của hóa đơn đầu ra",
  "columns.invoiceNo": "Số hóa đơn",
  "columns.serialNo": "Ký hiệu",
  "columns.invoiceDate": "Ngày HĐ",
  "columns.sellerName": "Người bán",
  "columns.buyerName": "Người mua",
  "columns.taxCode": "Mã số thuế",
  "columns.itemCode": "Mã hàng",
  "columns.description": "Diễn giải / Hàng hóa",
  "columns.unit": "ĐVT",
  "columns.quantity": "Số lượng",
  "columns.unitPrice": "Đơn giá",
  "columns.preVatAmount": "Tiền trước thuế",
  "columns.vatRate": "Thuế suất",
  "columns.vatAmount": "Tiền thuế",
  "columns.discountAmount": "Chiết khấu",
  "columns.totalAmount": "Tổng tiền",
  "columns.subcategory": "Phân loại",
  "columns.status": "Trạng thái",
  "columns.postingStatus": "Ghi sổ",
  expandRightPanel: "Mở rộng hồ sơ đối tác & dòng tiền",
  collapseRightPanel: "Thu gọn hồ sơ đối tác & dòng tiền",

  // Settlement Tab & Modal Translation Keys
  settlementTabTitle: "Theo dõi Tiến độ Thanh toán & Cấn trừ Hóa đơn",
  settlementProgressIn: "Đối soát tiến độ thanh toán cho Nhà cung cấp",
  settlementProgressOut: "Đối soát tiến độ thu tiền từ Khách hàng",
  viewModeBadge: "Chế độ xem",
  purchaseDebtCard: "Công nợ Hóa đơn Mua vào",
  saleDebtCard: "Công nợ Hóa đơn Bán ra",
  invoiceNoLabel: "HĐ số:",
  paidFullBadge: "✓ ĐÃ THANH TOÁN ĐỦ (100%)",
  paidPartialBadge: "ĐÃ THANH TOÁN ({{percent}}%)",
  unpaidBadge: "CHƯA THANH TOÁN (0%)",
  paidAmountLabel: "Đã thanh toán:",
  collectedAmountLabel: "Đã thu tiền:",
  remainingToPayLabel: "Còn phải thanh toán:",
  remainingToCollectLabel: "Còn phải thu:",
  paymentVouchersIn: "Chứng từ thanh toán (Ủy nhiệm chi / Phiếu chi)",
  paymentVouchersOut: "Chứng từ thu tiền (Giấy báo có / Phiếu thu)",
  btnReconcileCashflow: "Đối soát Dòng tiền",
  noSettlementDocsIn:
    "Chưa có chứng từ thanh toán nào được cấn trừ cho hóa đơn này.",
  noSettlementDocsOut:
    "Chưa có chứng từ thu tiền nào được cấn trừ cho hóa đơn này.",
  pendingSaveBadge: "Chờ lưu",
  addBankPendingToast:
    "Đã thêm giao dịch ngân hàng vào danh sách cấn trừ (chờ Lưu thay đổi).",
  removeBankPendingToast:
    "Đã đánh dấu gỡ cấn trừ giao dịch (chờ Lưu thay đổi).",
};
