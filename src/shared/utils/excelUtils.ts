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
 * Generates and downloads an Excel template with two sheets:
 * 1. "Template": Contains the headers for data entry.
 * 2. "Danh sach vat tu": Contains the reference items (SKU and Name).
 */
export function downloadInventoryTemplate(
  headers: string[],
  fileName: string,
  referenceItems: { sku: string; name: string }[],
) {
  const wb = XLSX.utils.book_new();

  // 1. Template sheet
  const templateSheet = XLSX.utils.aoa_to_sheet([headers]);

  // Set column widths for template
  const wscols = headers.map(() => ({ wch: 20 }));
  templateSheet["!cols"] = wscols;

  XLSX.utils.book_append_sheet(wb, templateSheet, "Template");

  // 2. Reference items sheet
  const refHeaders = ["Mã vật tư", "Tên vật tư"];
  const refData = referenceItems.map((item) => [item.sku, item.name]);
  const refSheet = XLSX.utils.aoa_to_sheet([refHeaders, ...refData]);

  // Set column widths for reference
  refSheet["!cols"] = [{ wch: 25 }, { wch: 50 }];

  XLSX.utils.book_append_sheet(wb, refSheet, "Danh sach vat tu");

  // Trigger download
  XLSX.writeFile(wb, fileName);
}
