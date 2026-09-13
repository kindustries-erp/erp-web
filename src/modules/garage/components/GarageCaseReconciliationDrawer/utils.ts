/**
 * Chuyển đổi số tiền thành chuỗi đọc Tiếng Việt chuẩn xác
 */
export function readVietnameseCurrency(num: number): string {
  if (!num || num <= 0 || isNaN(num)) return "";
  const digits = [
    "không",
    "một",
    "hai",
    "ba",
    "bốn",
    "năm",
    "sáu",
    "bảy",
    "tám",
    "chín",
  ];
  const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

  function readThreeDigits(n: number, isHighest: boolean): string {
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    const ten = Math.floor(remainder / 10);
    const one = remainder % 10;
    let res = "";

    if (hundred > 0 || !isHighest) {
      res += digits[hundred] + " trăm ";
    }

    if (ten > 1) {
      res += digits[ten] + " mươi ";
      if (one === 1) res += "mốt ";
      else if (one === 5) res += "lăm ";
      else if (one > 0) res += digits[one] + " ";
    } else if (ten === 1) {
      res += "mười ";
      if (one === 5) res += "lăm ";
      else if (one > 0) res += digits[one] + " ";
    } else if (ten === 0 && one > 0) {
      if (hundred > 0 || !isHighest) res += "lẻ ";
      res += digits[one] + " ";
    }

    return res.trim();
  }

  const s = Math.floor(num).toString();
  const groups: number[] = [];
  for (let i = s.length; i > 0; i -= 3) {
    groups.push(parseInt(s.substring(Math.max(0, i - 3), i), 10));
  }

  let result = "";
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g > 0) {
      const isHighest = i === groups.length - 1;
      const three = readThreeDigits(g, isHighest);
      result += three + " " + units[i] + " ";
    }
  }

  result = result.trim();
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
  }
  return result;
}
