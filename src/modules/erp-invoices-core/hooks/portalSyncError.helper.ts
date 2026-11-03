/** Kết quả ánh xạ lỗi đồng bộ GDT sang khóa i18n */
export interface MappedPortalSyncError {
  /** Khóa dịch trong namespace `erpInvoices` */
  key: string;
  /** Chuỗi mặc định (tiếng Việt) khi chưa có khóa dịch */
  fallback: string;
  /** Lỗi cần người dùng đăng nhập lại Cổng Thuế */
  needsRelogin: boolean;
}

const RELOGIN_CODES = new Set([
  "GDT_TOKEN_EXPIRED",
  "GDT_TOKEN_EXPIRED_AND_RELOGIN_FAILED",
  "token is required",
]);

const CODE_KEYS: Record<string, { key: string; fallback: string }> = {
  GDT_TAXPAYER_MISMATCH: {
    key: "portalSyncTaxpayerMismatch",
    fallback:
      "Token GDT đang đăng nhập khác mã số thuế công ty trên hệ thống. Vui lòng kiểm tra lại.",
  },
  GDT_COMPANY_TAX_CODE_NOT_CONFIGURED: {
    key: "portalSyncTaxCodeNotConfigured",
    fallback:
      "Chưa cấu hình mã số thuế công ty trong hồ sơ doanh nghiệp, chưa thể đồng bộ GDT.",
  },
  GDT_PROFILE_FETCH_FAILED: {
    key: "portalSyncProfileFetchFailed",
    fallback: "Không lấy được hồ sơ người nộp thuế từ GDT. Vui lòng thử lại.",
  },
  GDT_PROFILE_MISSING_TAX_CODE: {
    key: "portalSyncProfileMissingTaxCode",
    fallback: "Hồ sơ GDT không trả về mã số thuế hợp lệ để đối chiếu.",
  },
};

const RELOGIN_MESSAGE =
  "Token Cổng Thuế hết hạn và tự đăng nhập lại thất bại. Vui lòng đăng nhập lại.";

/**
 * Ánh xạ lỗi từ API đồng bộ sang khóa i18n. Mã không nhận diện được thì dùng
 * thông điệp của server làm chuỗi mặc định, như trước.
 */
export function mapPortalSyncError(err: unknown): MappedPortalSyncError {
  const message = (err as { response?: { data?: { message?: string } } })
    ?.response?.data?.message;

  if (message && RELOGIN_CODES.has(message)) {
    return {
      key: "portalSyncRelogin",
      fallback: RELOGIN_MESSAGE,
      needsRelogin: true,
    };
  }
  if (message && CODE_KEYS[message]) {
    return { ...CODE_KEYS[message], needsRelogin: false };
  }
  return {
    key: "portalSyncFailed",
    fallback: message || "Có lỗi xảy ra khi đồng bộ từ TCT",
    needsRelogin: false,
  };
}
