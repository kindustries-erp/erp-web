import re
import sys

def main():
    filepath = '/home/dev/repos-dev-1/erp/erp-web/src/modules/erp-invoices-core/components/ErpInvoicesTab.tsx'
    with open(filepath, 'r') as f:
        content = f.read()

    # Add imports
    if 'TableColumnHeaderFilter' not in content:
        import_stmt = 'import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";\n'
        content = content.replace('import { useMemo } from "react";', 'import { useMemo } from "react";\n' + import_stmt)

    # Add helper functions before columns
    helpers = """
  const getSortState = (key: string) => {
    if (listHook.tableState.sorts.includes(key)) return "asc";
    if (listHook.tableState.sorts.includes(`-${key}`)) return "desc";
    return "none";
  };
  const handleSortChange = (key: string, state: "asc" | "desc" | "none") => {
    listHook.tableState.setSort(key, state);
    listHook.setPage(1);
  };
  const handleSearchChange = (key: string, val: string) => {
    listHook.tableState.setColumnSearch(key, val);
    listHook.setPage(1);
  };
  const handleFilterChange = (key: string, vals: string[]) => {
    listHook.tableState.setColumnFilter(key, vals);
    listHook.setPage(1);
  };
"""
    if 'getSortState = (key: string)' not in content:
        content = content.replace('const columns: DataTableColumn<ErpInvoice>[] = useMemo(', helpers + '\n  const columns: DataTableColumn<ErpInvoice>[] = useMemo(')

    # Dictionary of column keys and their config
    col_config = {
        'invoiceDate': {'title': 't("invoiceDate", "Ngày HĐ")'},
        'serialNo': {'title': 't("serialNo", "Ký hiệu")'},
        'invoiceNo': {'title': 't("invoiceNo", "Số HĐ")'},
        'partner': {'title': 'direction === "IN" ? t("seller", "Bên bán") : t("buyer", "Bên mua")'},
        'taxCode': {'title': 't("taxCode", "MST")'},
        'description': {'title': 't("description", "Diễn giải")'},
        'preVatAmount': {'title': 't("preVatAmount", "Trước VAT")'},
        'vatAmount': {'title': 't("vatAmount", "Thuế VAT")'},
        'discountAmount': {'title': 't("discountAmount", "Chiết khấu")'},
        'totalAmount': {'title': 't("totalAmount", "Thành tiền")'},
        'settlementOrder': {'title': 't("settlementOrder", "Lệnh quyết toán")'},
        'licensePlate': {'title': 't("licensePlate", "Biển số xe")'},
        'netOffAmount': {'title': 't("invoice.columns.netOffAmount", "Đã cấn trừ")'},
        'remainingAmount': {'title': 't("invoice.columns.remainingAmount", "Còn lại")'},
        'branchId': {'title': 't("branch", "Chi nhánh")'} 
    }

    # Remove search from filterConfig
    content = re.sub(r'search:\s*\{[^}]+\},\s*', '', content)

    for key, conf in col_config.items():
        title = conf['title']
        search_key = key
        
        # We find `key: "xxx",` and replace everything up to `size: ` or `className: `
        # Wait, not all columns have `size: ` or `sortable: `. 
        # But we can just replace `header: ...` and optionally `sortable: ...` and `sortKey: ...`
        
        # Pattern to match: header: anything up to the next key like size, className, or cell
        pattern = r'(key:\s*"' + key + r'",\s*)header:\s*[\s\S]*?(?=(size:|className:|headerClassName:|cell:|sortable:|sortKey:))'
        
        def repl(m):
            if 'TableColumnHeaderFilter' in m.group(0):
                return m.group(0)
            
            replacement = f'''{m.group(1)}header: (
          <TableColumnHeaderFilter
            title={{{title}}}
            sortState={{getSortState("{search_key}")}}
            onSortChange={{(state) => handleSortChange("{search_key}", state)}}
            searchValue={{listHook.tableState.columnSearch["{search_key}"] || ""}}
            onSearchChange={{(val) => handleSearchChange("{search_key}", val)}}
            selectedFilters={{listHook.tableState.columnFilters["{search_key}"] || []}}
            onFilterChange={{(vals) => handleFilterChange("{search_key}", vals)}}
            align="center"
            columnKey="{search_key}"
            requireSearchToFetchOptions={{true}}
            allFilters={{listHook.tableState.columnFilters}}
          />
        ),
        '''
            return replacement

        content = re.sub(pattern, repl, content)
        # remove leftover sortable/sortKey
        content = re.sub(r'(key:\s*"' + key + r'",\s*header:\s*[\s\S]*?)(sortable:\s*(true|false),\s*)', r'\1', content)
        content = re.sub(r'(key:\s*"' + key + r'",\s*header:\s*[\s\S]*?)(sortKey:\s*.*?,[ \t]*\n?)', r'\1', content)

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == '__main__':
    main()
