/** Chuỗi của Cổng Thuế GDT: form đăng nhập, trạng thái token và đồng bộ */
export const erpInvoicesViPortal = {
  gdtLoginTitle: "Đăng nhập Cổng Hóa đơn điện tử",
  gdtUsernameLabel: "Mã số thuế / Tài khoản (*)",
  gdtUsernamePlaceholder: "Ví dụ: 0318334886 hoặc 0318334886-003",
  gdtUsernameRequired: "Vui lòng nhập Mã số thuế / Tên đăng nhập",
  gdtPasswordLabel: "Mật khẩu (*)",
  gdtPasswordSaved: "Đã lưu mật khẩu",
  gdtPasswordPlaceholder: "Nhập mật khẩu Cổng thuế...",
  gdtPasswordRequired: "Vui lòng nhập mật khẩu Cổng thuế",
  gdtCaptchaLabel: "Mã kiểm tra (Captcha) (*)",
  gdtCaptchaEmpty: "Trống",
  gdtCaptchaReloadTitle: "Tải lại mã khác",
  gdtCaptchaChangeCode: "Đổi mã",
  gdtCaptchaPlaceholder: "Nhập mã...",
  gdtCaptchaRequired: "Vui lòng nhập mã Captcha",
  gdtCaptchaMissing: "Chưa có mã Captcha hợp lệ, vui lòng tải lại",
  gdtCaptchaLoadFailed: "Không thể tải mã Captcha từ Cổng thuế",
  gdtCancel: "Hủy",
  gdtLoggingIn: "Đang đăng nhập...",
  gdtLoginSave: "Đăng nhập & Lưu",
  gdtLoginSuccess: "Đăng nhập Cổng Thuế thành công!",
  gdtLoginFailed:
    "Đăng nhập thất bại. Vui lòng kiểm tra lại mật khẩu hoặc mã Captcha.",
  gdtTokenConnected: "Đã có Token kết nối Cổng Thuế",
  gdtTokenMissing: "Chưa có Token đăng nhập Cổng Thuế",
  portalConfigSaved: "Đã lưu cấu hình portal thành công!",
  portalConfigSaveFailed: "Lưu cấu hình portal thất bại",
  portalSyncRangeRequired: "Vui lòng chọn từ ngày và đến ngày",
  portalSyncDateInvalid: "Ngày không hợp lệ",
  portalSyncRangeOrder: "Ngày đến không được nhỏ hơn ngày từ",
  portalSyncSuccess:
    "Đã đồng bộ {{imported}} HĐ mới, bỏ qua {{skipped}} trùng. Đang tải {{queued}} file XML...",
  portalSyncRelogin:
    "Token Cổng Thuế hết hạn và tự đăng nhập lại thất bại. Vui lòng đăng nhập lại.",
  portalSyncTaxpayerMismatch:
    "Token GDT đang đăng nhập khác mã số thuế công ty trên hệ thống. Vui lòng kiểm tra lại.",
  portalSyncTaxCodeNotConfigured:
    "Chưa cấu hình mã số thuế công ty trong hồ sơ doanh nghiệp, chưa thể đồng bộ GDT.",
  portalSyncProfileFetchFailed:
    "Không lấy được hồ sơ người nộp thuế từ GDT. Vui lòng thử lại.",
  portalSyncProfileMissingTaxCode:
    "Hồ sơ GDT không trả về mã số thuế hợp lệ để đối chiếu.",
  portalSyncFailed: "Có lỗi xảy ra khi đồng bộ từ TCT",
  gdtSyncResultTitle: "Đồng bộ thành công",
  gdtSyncImportedLabel: "hóa đơn mới",
  gdtSyncSkippedPrefix: "Bỏ qua",
  gdtSyncSkippedLabel: "hóa đơn trùng",
  gdtSyncQueuedPrefix: "Xếp hàng tải nền",
  gdtSyncQueuedLabel: "file XML",
};
