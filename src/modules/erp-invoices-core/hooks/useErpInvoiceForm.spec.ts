import { renderHook, act } from '@testing-library/react';
import { useErpInvoiceForm } from './useErpInvoiceForm';
import { erpInvoicesCoreApi } from '../api/erpInvoicesCoreApi';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api/erpInvoicesCoreApi', () => ({
  erpInvoicesCoreApi: {
    update: vi.fn(),
    deletePdf: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback,
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useErpInvoiceForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add to pendingDeletedPdfs when setting form', () => {
    const { result } = renderHook(() => useErpInvoiceForm(vi.fn()));

    act(() => {
      result.current.setForm((prev) => ({
        ...prev,
        pendingDeletedPdfs: ['test-pdf.pdf'],
      }));
    });

    expect(result.current.form.pendingDeletedPdfs).toEqual(['test-pdf.pdf']);
  });

  it('should strip pendingDeletedPdfs and pendingAddedPdfs from payload when saving', async () => {
    const { result } = renderHook(() => useErpInvoiceForm(vi.fn()));

    // Setup mocks for handleSave
    vi.mocked(erpInvoicesCoreApi.update).mockResolvedValue({ id: 'inv-1', invoiceNo: 'INV-1' } as any);
    vi.mocked(erpInvoicesCoreApi.deletePdf).mockResolvedValue({ success: true } as any);
    vi.mocked(erpInvoicesCoreApi.get).mockResolvedValue({ id: 'inv-1', invoiceNo: 'INV-1', items: [] } as any);

    // Open detail invoice to simulate edit mode
    await act(async () => {
      await result.current.openInternal({ id: 'inv-1', invoiceNo: 'INV-1', items: [] } as any);
    });

    // Set pending PDFs and required fields
    act(() => {
      result.current.setForm((prev) => ({
        ...prev,
        invoiceNo: 'INV-1',
        invoiceDate: '2026-07-22',
        pendingDeletedPdfs: ['delete-me.pdf'],
        pendingAddedPdfs: [new File([], 'add-me.pdf')],
      }));
    });

    await act(async () => {
      await result.current.handleSave();
    });

    // Assert update was called WITHOUT pending fields
    expect(erpInvoicesCoreApi.update).toHaveBeenCalledTimes(1);
    const payload = vi.mocked(erpInvoicesCoreApi.update).mock.calls[0][1];
    expect(payload.pendingDeletedPdfs).toBeUndefined();
    expect(payload.pendingAddedPdfs).toBeUndefined();
    expect(payload.invoiceNo).toBe('INV-1');

    // Assert deletePdf was called with the pending file
    expect(erpInvoicesCoreApi.deletePdf).toHaveBeenCalledWith('inv-1', 'delete-me.pdf');
  });
});
