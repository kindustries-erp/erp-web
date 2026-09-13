import * as XLSX from "xlsx";

/**
 * Parses an Excel or CSV file and returns an array of objects based on the first sheet.
 * Assumes the first row is the header row.
 */
export async function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          return resolve([]);
        }
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          return resolve([]);
        }
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        const cleanJson = json.map((row: any) => {
          const cleanRow: any = {};
          for (const key in row) {
            let val = row[key];
            if (typeof val === "number") {
              val = Number(val.toFixed(10));
            }
            cleanRow[key] = val;
          }
          return cleanRow;
        });
        resolve(cleanJson);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Creates an Excel workbook instance with two sheets:
 * 1. "Template": Contains the headers and 1-2 example rows.
 * 2. "Danh sach vat tu": Contains the reference items (SKU and Name).
 */
export function createInventoryTemplateWorkbook(
  headers: string[],
  referenceItems: { sku: string; name: string }[] = [],
  sampleRows?: any[][],
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // If sampleRows is not provided, generate 1-2 default rows based on headers & referenceItems
  let rows: any[][] = [];
  if (sampleRows && sampleRows.length > 0) {
    rows = sampleRows;
  } else {
    const count =
      referenceItems.length > 0 ? Math.min(2, referenceItems.length) : 2;
    for (let i = 0; i < count; i++) {
      const ref = referenceItems[i] || {
        sku: i === 0 ? "LK-001" : "LK-002",
        name: i === 0 ? "Mô tơ điện 12V" : "Cảm biến tốc độ",
      };
      const row = headers.map((h) => {
        const headerLower = h.toLowerCase();
        if (headerLower.includes("mã")) return ref.sku;
        if (headerLower.includes("tên")) return ref.name;
        if (headerLower.includes("lượng")) return (i + 1) * 5;
        if (headerLower.includes("giá")) return 150000 + i * 50000;
        if (headerLower.includes("serial") || headerLower.includes("khung"))
          return `SN-${ref.sku}-00${i + 1}`;
        if (headerLower.includes("chú") || headerLower.includes("lý do"))
          return i === 0 ? "Hàng mới 100%" : "";
        return "";
      });
      rows.push(row);
    }
  }

  // 1. Template sheet (headers + 1-2 sample rows)
  const templateSheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wscols = headers.map(() => ({ wch: 22 }));
  templateSheet["!cols"] = wscols;
  XLSX.utils.book_append_sheet(wb, templateSheet, "Template");

  // 2. Reference items sheet
  const refHeaders = ["Mã vật tư", "Tên vật tư"];
  const refData = referenceItems.map((item) => [item.sku, item.name]);
  const refSheet = XLSX.utils.aoa_to_sheet([refHeaders, ...refData]);
  refSheet["!cols"] = [{ wch: 25 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, refSheet, "Danh sach vat tu");

  return wb;
}

/**
 * Generates and downloads an Excel template with two sheets:
 * 1. "Template": Contains the headers for data entry and 1-2 example rows.
 * 2. "Danh sach vat tu": Contains the reference items (SKU and Name).
 */
export function downloadInventoryTemplate(
  headers: string[],
  fileName: string,
  referenceItems: { sku: string; name: string }[] = [],
  sampleRows?: any[][],
) {
  const wb = createInventoryTemplateWorkbook(
    headers,
    referenceItems,
    sampleRows,
  );
  XLSX.writeFile(wb, fileName);
}
