import re
import sys

def main():
    filepath = '/home/dev/repos-dev-1/erp/erp-web/src/modules/erp-invoices-core/components/ErpInvoicesTab.tsx'
    with open(filepath, 'r') as f:
        content = f.read()

    # Add erpInvoicesCoreApi to imports if needed
    if 'import { erpInvoicesCoreApi }' not in content:
        content = content.replace('import { useErpInvoicesList }', 'import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";\nimport { useErpInvoicesList }')

    # Define fetchInvoiceOptions inside the component
    fetch_options_fn = """
  const fetchInvoiceOptions = useCallback(
    async ({
      columnKey,
      search,
      pageParam,
      filtersStr,
    }: {
      columnKey: string;
      search: string;
      pageParam: number;
      filtersStr?: string;
    }) => {
      const res = await erpInvoicesCoreApi.getInvoiceColumnOptions(
        columnKey,
        search,
        pageParam,
        20,
        filtersStr,
        direction
      );
      return {
        items: res.items.map((i) => ({ label: i, value: i })),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [direction]
  );
"""
    if 'const fetchInvoiceOptions = useCallback(' not in content:
        content = content.replace('const handleFilterChange =', fetch_options_fn + '\n  const handleFilterChange =')

    # Add fetchOptions={fetchInvoiceOptions} to all TableColumnHeaderFilter elements
    content = re.sub(
        r'(<TableColumnHeaderFilter\s+[\s\S]*?)(\s*/>)',
        r'\1\n            fetchOptions={fetchInvoiceOptions}\2',
        content
    )

    # Need to add useCallback to imports if not there
    if 'useCallback' not in content:
        content = content.replace('import { useState, useMemo, useEffect } from "react";', 'import { useState, useMemo, useEffect, useCallback } from "react";')

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == '__main__':
    main()
