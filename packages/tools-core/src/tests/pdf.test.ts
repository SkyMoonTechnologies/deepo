import { describe, expect, it } from 'vitest';

import { buildInvoicePdf, formatCurrency } from '../pdf';

describe('pdf invoice helpers', () => {
  it('formats currency', () => {
    expect(formatCurrency(12.5, 'USD')).toContain('$12.50');
  });

  it('builds PDF bytes', async () => {
    const bytes = await buildInvoicePdf({
      template: 'invoice',
      documentNumber: 'INV-1',
      issueDate: '2026-02-17',
      dueDate: '2026-03-01',
      fromName: 'Deepo LLC',
      toName: 'Acme Inc',
      lineItems: [{ description: 'Design work', quantity: 2, unitPrice: 1500 }],
    });

    expect(bytes.length).toBeGreaterThan(0);
  });
});
