import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Chữ hiển thị của lõi chuyển khoản QR (`v2.transferQr.*`), song ngữ VI/EN. */
export const transferQrLocale = {
  vi: {
    title: "Tạo mã QR chuyển khoản",
    subtitle:
      "Đưa mã QR cho app ngân hàng quét, không phải nhập tay lệnh chuyển tiền.",
    privacyNote:
      "Mã QR được tạo ngay trên trình duyệt, thông tin tài khoản không gửi ra ngoài hệ thống.",
    modes: {
      pay: "Trả tiền nhà cung cấp",
      receive: "Nhận tiền từ khách",
    },
    sections: {
      recipient: "Người nhận",
      transfer: "Số tiền và nội dung",
      qrPreview: "Mã QR",
    },
    fields: {
      account: "Tài khoản nhận tiền của công ty",
      bank: "Ngân hàng",
      accountNumber: "Số tài khoản",
      accountName: "Tên chủ tài khoản",
      amount: "Số tiền (VND)",
      content: "Nội dung chuyển khoản",
    },
    placeholders: {
      account: "Chọn tài khoản",
      bank: "Chọn ngân hàng",
      accountNumber: "Ví dụ: 0123456789",
      accountName: "Ví dụ: NGUYEN VAN A",
      amount: "Để trống nếu khách tự nhập số tiền",
      content: "Ví dụ: Thanh toan don hang 123",
    },
    hints: {
      content:
        "Tối đa 95 ký tự, không dấu. Ký tự gạch nối (-) được giữ nguyên; ký tự đặc biệt khác như / ( ) # đổi thành dấu cách.",
      contentOnQr: "Nội dung trên QR:",
      receiveBankFallback:
        "Tài khoản này chưa khớp được ngân hàng, hãy chọn ngân hàng bên dưới.",
    },
    errors: {
      required: "Vui lòng nhập thông tin này",
      invalidAccountNumber: "Số tài khoản chỉ gồm chữ và số, tối đa 19 ký tự",
      invalidAmount: "Số tiền phải là số nguyên dương",
    },
    batch: {
      tabSingle: "Một mã QR",
      tabBatch: "Nhiều lệnh thanh toán",
      downloadFailed: "Không tải được file, vui lòng thử lại.",
      pasteTitle: "Dán từ Excel",
      pasteHint:
        "Copy các cột từ Excel theo thứ tự: Ngân hàng | Số tài khoản | Tên chủ tài khoản | Số tiền | Nội dung, rồi dán vào ô bên dưới.",
      pastePlaceholder: "Dán vùng dữ liệu từ Excel tại đây",
      pasteButton: "Thêm vào danh sách",
      tableHint: "Mỗi dòng là một lệnh thanh toán, tối đa 50 dòng.",
      tableLabel: "Danh sách lệnh thanh toán",
      addRow: "Thêm dòng",
      clearRows: "Xóa tất cả",
      removeRow: "Xóa dòng",
      emptyRows: "Chưa có lệnh nào. Thêm dòng hoặc dán từ Excel.",
      emptyGrid: "Chưa có lệnh hợp lệ nào để tạo mã QR.",
      amountFree: "Khách tự nhập",
      downloadRow: "Tải ảnh (PNG)",
      summaryValid: "Hợp lệ:",
      columns: {
        bank: "Ngân hàng",
        accountNumber: "Số tài khoản",
        accountName: "Tên chủ tài khoản",
        amount: "Số tiền",
        content: "Nội dung",
      },
      notice: {
        headerSkipped: "Đã bỏ dòng tiêu đề.",
        truncated: "Chỉ nhận tối đa 50 lệnh, phần còn lại đã bị bỏ.",
      },
      actions: {
        zip: "Tải ZIP tất cả",
        pdf: "Xuất PDF A4",
      },
      badgePay: "LỆNH THANH TOÁN",
      totalBatchAmount: "Tổng tiền:",
      orderCount: "lệnh",
    },
    preview: {
      title: "Xem trước mã QR",
      empty: "Điền đủ thông tin để tạo mã QR",
    },
    card: {
      brand: "VIETQR | NAPAS 247",
      badgeReceive: "THẺ NHẬN TIỀN",
      badgePay: "LỆNH THANH TOÁN",
      taxCode: "MST",
      accountNumber: "Số tài khoản",
      accountName: "Chủ tài khoản",
      recipientSupplier: "Người nhận (NCC)",
      bank: "Ngân hàng",
      amount: "Số tiền",
      content: "Nội dung",
      amountFree: "Người chuyển tự nhập số tiền",
      scanHint: "Quét mã bằng app ngân hàng bất kỳ để thanh toán nhanh 24/7",
      scanHintReceive:
        "Quét mã bằng app ngân hàng bất kỳ để thanh toán nhanh 24/7",
      scanHintPay:
        "Quét mã bằng app ngân hàng để chuyển khoản cho nhà cung cấp",
      copy: "Sao chép",
      copied: "Đã chép",
    },
    actions: {
      download: "Tải ảnh QR (PNG)",
      downloadCard: "Tải thẻ thanh toán (PNG)",
      downloadRaw: "Tải mã QR gốc",
    },
  },
  en: {
    title: "Create bank transfer QR",
    subtitle:
      "Let the banking app scan the QR instead of typing the transfer by hand.",
    privacyNote:
      "The QR is generated in your browser; account details are not sent outside the system.",
    modes: {
      pay: "Pay supplier",
      receive: "Receive from customer",
    },
    sections: {
      recipient: "Recipient",
      transfer: "Amount and content",
      qrPreview: "QR code",
    },
    fields: {
      account: "Company account to receive money",
      bank: "Bank",
      accountNumber: "Account number",
      accountName: "Account holder name",
      amount: "Amount (VND)",
      content: "Transfer note",
    },
    placeholders: {
      account: "Select account",
      bank: "Select bank",
      accountNumber: "e.g. 0123456789",
      accountName: "e.g. NGUYEN VAN A",
      amount: "Leave empty if the customer enters the amount",
      content: "e.g. Payment order 123",
    },
    hints: {
      content:
        "Up to 95 characters, no accents. Hyphens (-) are preserved; other special characters like / ( ) # become spaces.",
      contentOnQr: "Note on QR:",
      receiveBankFallback:
        "This account could not be matched to a bank. Choose the bank below.",
    },
    errors: {
      required: "Please fill in this field",
      invalidAccountNumber:
        "Account number may contain letters and digits only, up to 19 characters",
      invalidAmount: "Amount must be a positive whole number",
    },
    batch: {
      tabSingle: "Single QR",
      tabBatch: "Multiple payments",
      downloadFailed: "The file could not be downloaded. Please try again.",
      pasteTitle: "Paste from Excel",
      pasteHint:
        "Copy columns from Excel in this order: Bank | Account number | Account holder | Amount | Note, then paste below.",
      pastePlaceholder: "Paste the Excel data here",
      pasteButton: "Add to list",
      tableHint: "One row per payment, up to 50 rows.",
      tableLabel: "Payment list",
      addRow: "Add row",
      clearRows: "Clear all",
      removeRow: "Remove row",
      emptyRows: "No payments yet. Add a row or paste from Excel.",
      emptyGrid: "No valid payment yet to create QR codes.",
      amountFree: "Customer enters",
      downloadRow: "Download image (PNG)",
      summaryValid: "Valid:",
      columns: {
        bank: "Bank",
        accountNumber: "Account number",
        accountName: "Account holder",
        amount: "Amount",
        content: "Note",
      },
      notice: {
        headerSkipped: "Header row skipped.",
        truncated:
          "Only up to 50 payments are accepted; the rest were dropped.",
      },
      actions: {
        zip: "Download ZIP",
        pdf: "Export A4 PDF",
      },
      badgePay: "PAYMENT ORDER",
      totalBatchAmount: "Total amount:",
      orderCount: "payments",
    },
    preview: {
      title: "QR preview",
      empty: "Fill in the details to create the QR",
    },
    card: {
      brand: "VIETQR | NAPAS 247",
      badgeReceive: "PAYMENT RECEIPT",
      badgePay: "PAYMENT ORDER",
      taxCode: "Tax ID",
      accountNumber: "Account number",
      accountName: "Account holder",
      recipientSupplier: "Recipient",
      bank: "Bank",
      amount: "Amount",
      content: "Note",
      amountFree: "Sender enters amount",
      scanHint: "Scan with any banking app for instant 24/7 transfer",
      scanHintReceive: "Scan with any banking app for instant 24/7 payment",
      scanHintPay: "Scan with banking app to transfer to supplier",
      copy: "Copy",
      copied: "Copied",
    },
    actions: {
      download: "Download QR image (PNG)",
      downloadCard: "Download payment card (PNG)",
      downloadRaw: "Download raw QR",
    },
  },
};

registerV2ModuleLocale("transferQr", transferQrLocale);
