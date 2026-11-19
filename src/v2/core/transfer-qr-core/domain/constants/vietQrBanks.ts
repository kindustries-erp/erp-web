/**
 * Danh sách ngân hàng cho VietQR (mã BIN Napas 247).
 * Đã đối chiếu 37 BIN với API công khai https://api.vietqr.io/v2/banks (2026-11-18):
 * BIN khớp 100%; mã viết tắt và tên ngắn theo VietQR. Tên cũ vẫn nằm trong aliases để khớp dữ liệu cũ.
 * Khi Napas đổi BIN hoặc thêm ngân hàng, đối chiếu lại với cùng API.
 */
export interface VietQrBank {
  /** Mã viết tắt, ví dụ VCB */
  code: string;
  /** Tên ngắn hiển thị */
  shortName: string;
  /** Tên đầy đủ hiển thị */
  name: string;
  /** Mã BIN Napas 6 chữ số, ví dụ 970436 */
  bin: string;
  /** Tên gọi khác để khớp dữ liệu tự do (không phân biệt dấu, hoa thường) */
  aliases: readonly string[];
  /** Link ảnh logo ngân hàng */
  logoUrl?: string | null;
}

/** URL gốc tải ảnh logo từ CDN VietQR */
export const VIETQR_CDN_IMAGE_BASE_URL = "https://api.vietqr.io/img";

/** Hàm helper tạo URL ảnh logo VietQR từ mã ngân hàng */
export const getVietQrCdnLogoUrl = (code: string): string =>
  `${VIETQR_CDN_IMAGE_BASE_URL}/${code.trim().toUpperCase()}.png`;

export const VIETQR_BANKS: readonly VietQrBank[] = [
  {
    code: "VCB",
    shortName: "Vietcombank",
    name: "Ngân hàng TMCP Ngoại thương Việt Nam",
    bin: "970436",
    aliases: ["Vietcombank", "Ngoai thuong"],
  },
  {
    code: "ICB",
    shortName: "VietinBank",
    name: "Ngân hàng TMCP Công thương Việt Nam",
    bin: "970415",
    aliases: ["VietinBank", "Cong thuong"],
  },
  {
    code: "BIDV",
    shortName: "BIDV",
    name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
    bin: "970418",
    aliases: ["Dau tu va phat trien"],
  },
  {
    code: "VBA",
    shortName: "Agribank",
    name: "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam",
    bin: "970405",
    aliases: ["Agribank", "Nong nghiep"],
  },
  {
    code: "TCB",
    shortName: "Techcombank",
    name: "Ngân hàng TMCP Kỹ thương Việt Nam",
    bin: "970407",
    aliases: ["Techcombank", "Ky thuong"],
  },
  {
    code: "MB",
    shortName: "MBBank",
    name: "Ngân hàng TMCP Quân đội",
    bin: "970422",
    aliases: ["MBBank", "MB Bank", "Quan doi"],
  },
  {
    code: "ACB",
    shortName: "ACB",
    name: "Ngân hàng TMCP Á Châu",
    bin: "970416",
    aliases: ["A Chau"],
  },
  {
    code: "VPB",
    shortName: "VPBank",
    name: "Ngân hàng TMCP Việt Nam Thịnh Vượng",
    bin: "970432",
    aliases: ["VPBank", "Thinh vuong"],
  },
  {
    code: "TPB",
    shortName: "TPBank",
    name: "Ngân hàng TMCP Tiên Phong",
    bin: "970423",
    aliases: ["TPBank", "Tien phong"],
  },
  {
    code: "STB",
    shortName: "Sacombank",
    name: "Ngân hàng TMCP Sài Gòn Thương Tín",
    bin: "970403",
    aliases: ["Sacombank", "Sai gon thuong tin"],
  },
  {
    code: "VIB",
    shortName: "VIB",
    name: "Ngân hàng TMCP Quốc tế Việt Nam",
    bin: "970441",
    aliases: ["Quoc te"],
  },
  {
    code: "HDB",
    shortName: "HDBank",
    name: "Ngân hàng TMCP Phát triển TP. Hồ Chí Minh",
    bin: "970437",
    aliases: ["HDBank"],
  },
  {
    code: "SHB",
    shortName: "SHB",
    name: "Ngân hàng TMCP Sài Gòn - Hà Nội",
    bin: "970443",
    aliases: ["Sai gon Ha noi"],
  },
  {
    code: "OCB",
    shortName: "OCB",
    name: "Ngân hàng TMCP Phương Đông",
    bin: "970448",
    aliases: ["Phuong dong"],
  },
  {
    code: "MSB",
    shortName: "MSB",
    name: "Ngân hàng TMCP Hàng Hải Việt Nam",
    bin: "970426",
    aliases: ["Hang hai"],
  },
  {
    code: "SCB",
    shortName: "SCB",
    name: "Ngân hàng TMCP Sài Gòn",
    bin: "970429",
    aliases: ["Sai gon"],
  },
  {
    code: "EIB",
    shortName: "Eximbank",
    name: "Ngân hàng TMCP Xuất Nhập khẩu Việt Nam",
    bin: "970431",
    aliases: ["Eximbank", "Xuat nhap khau"],
  },
  {
    code: "SEAB",
    shortName: "SeABank",
    name: "Ngân hàng TMCP Đông Nam Á",
    bin: "970440",
    aliases: ["SeABank", "Dong Nam A"],
  },
  {
    code: "LPB",
    shortName: "LPBank",
    name: "Ngân hàng TMCP Lộc Phát Việt Nam",
    bin: "970449",
    aliases: ["LPBank", "LienVietPostBank", "Buu dien lien viet"],
  },
  {
    code: "PVCB",
    shortName: "PVcomBank",
    name: "Ngân hàng TMCP Đại chúng Việt Nam",
    bin: "970412",
    aliases: ["PVcomBank", "Dai chung"],
  },
  {
    code: "NAB",
    shortName: "NamABank",
    name: "Ngân hàng TMCP Nam Á",
    bin: "970428",
    aliases: ["NamABank", "Nam A Bank", "Nam A"],
  },
  {
    code: "BAB",
    shortName: "BacABank",
    name: "Ngân hàng TMCP Bắc Á",
    bin: "970409",
    aliases: ["BacABank", "Bac A"],
  },
  {
    code: "ABB",
    shortName: "ABBank",
    name: "Ngân hàng TMCP An Bình",
    bin: "970425",
    aliases: ["ABBank", "An Binh"],
  },
  {
    code: "KLB",
    shortName: "Kienlongbank",
    name: "Ngân hàng TMCP Kiên Long",
    bin: "970452",
    aliases: ["Kienlongbank", "Kien long"],
  },
  {
    code: "MBV",
    shortName: "MBV",
    name: "Ngân hàng TNHH MTV Việt Nam Hiện Đại",
    bin: "970414",
    aliases: ["MBV", "Oceanbank", "Dai duong", "Viet Nam Hien Dai"],
  },
  {
    code: "GPB",
    shortName: "GPBank",
    name: "Ngân hàng Thương mại TNHH MTV Dầu Khí Toàn Cầu",
    bin: "970408",
    aliases: ["GPBank", "Dau khi toan cau"],
  },
  {
    code: "BVB",
    shortName: "BaoVietBank",
    name: "Ngân hàng TMCP Bảo Việt",
    bin: "970438",
    aliases: ["BaoVietBank", "Bao viet"],
  },
  {
    code: "VCCB",
    shortName: "Vietcapitalbank",
    name: "Ngân hàng TMCP Bản Việt",
    bin: "970454",
    aliases: ["Vietcapitalbank", "Ban viet"],
  },
  {
    code: "PGB",
    shortName: "PGBank",
    name: "Ngân hàng TMCP Xăng dầu Petrolimex",
    bin: "970430",
    aliases: ["PGBank", "Petrolimex"],
  },
  {
    code: "VAB",
    shortName: "VietABank",
    name: "Ngân hàng TMCP Việt Á",
    bin: "970427",
    aliases: ["VietABank", "Viet A"],
  },
  {
    code: "NCB",
    shortName: "NCB",
    name: "Ngân hàng TMCP Quốc Dân",
    bin: "970419",
    aliases: ["Quoc dan"],
  },
  {
    code: "SGICB",
    shortName: "SaigonBank",
    name: "Ngân hàng TMCP Sài Gòn Công Thương",
    bin: "970400",
    aliases: ["SaigonBank", "Saigonbank", "Sai gon Cong thuong"],
  },
  {
    code: "IVB",
    shortName: "Indovinabank",
    name: "Ngân hàng TNHH Indovina",
    bin: "970434",
    aliases: ["Indovinabank", "Indovina"],
  },
  {
    code: "PBVN",
    shortName: "PublicBank",
    name: "Ngân hàng TNHH MTV Public Việt Nam",
    bin: "970439",
    aliases: ["PublicBank", "Public Bank"],
  },
  {
    code: "SHBVN",
    shortName: "ShinhanBank",
    name: "Ngân hàng TNHH MTV Shinhan Việt Nam",
    bin: "970424",
    aliases: ["ShinhanBank", "Shinhan Bank", "Shinhan"],
  },
  {
    code: "WVN",
    shortName: "Woori",
    name: "Ngân hàng TNHH MTV Woori Việt Nam",
    bin: "970457",
    aliases: ["Woori", "Woori Bank"],
  },
  {
    code: "UOB",
    shortName: "UnitedOverseas",
    name: "Ngân hàng United Overseas - Chi nhánh TP. Hồ Chí Minh",
    bin: "970458",
    aliases: ["UOB", "UnitedOverseas", "United Overseas"],
  },
];
