import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type InvoiceTemplate = 'invoice' | 'quote';

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceData = {
  template: InvoiceTemplate;
  documentNumber: string;
  issueDate: string;
  dueDate?: string;
  fromName: string;
  toName: string;
  notes?: string;
  currency?: string;
  lineItems: InvoiceLineItem[];
};

const sumTotal = (lineItems: InvoiceLineItem[]): number =>
  lineItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0);

export const formatCurrency = (value: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
};

export const buildInvoicePdf = async (data: InvoiceData): Promise<Uint8Array> => {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);

  const currency = data.currency ?? 'USD';
  const total = sumTotal(data.lineItems);

  let y = 740;

  page.drawText(data.template === 'invoice' ? 'INVOICE' : 'QUOTE', {
    x: 48,
    y,
    size: 24,
    font: titleFont,
    color: rgb(0.12, 0.12, 0.12),
  });

  y -= 34;
  page.drawText(`Number: ${data.documentNumber || '-'}`, { x: 48, y, size: 11, font: bodyFont });
  y -= 16;
  page.drawText(`Issue date: ${data.issueDate || '-'}`, { x: 48, y, size: 11, font: bodyFont });

  if (data.template === 'invoice') {
    y -= 16;
    page.drawText(`Due date: ${data.dueDate || '-'}`, { x: 48, y, size: 11, font: bodyFont });
  }

  y -= 28;
  page.drawText(`From: ${data.fromName || '-'}`, { x: 48, y, size: 11, font: bodyFont });
  y -= 16;
  page.drawText(`Bill to: ${data.toName || '-'}`, { x: 48, y, size: 11, font: bodyFont });

  y -= 28;
  page.drawText('Description', { x: 48, y, size: 10, font: titleFont });
  page.drawText('Qty', { x: 368, y, size: 10, font: titleFont });
  page.drawText('Unit', { x: 418, y, size: 10, font: titleFont });
  page.drawText('Total', { x: 500, y, size: 10, font: titleFont });

  y -= 12;
  page.drawLine({ start: { x: 48, y }, end: { x: 564, y }, thickness: 0.8, color: rgb(0.7, 0.7, 0.7) });

  for (const item of data.lineItems) {
    y -= 18;
    const lineTotal = item.quantity * item.unitPrice;

    page.drawText(item.description || '-', { x: 48, y, size: 10, font: bodyFont, maxWidth: 300 });
    page.drawText(String(item.quantity), { x: 372, y, size: 10, font: bodyFont });
    page.drawText(formatCurrency(item.unitPrice, currency), { x: 418, y, size: 10, font: bodyFont });
    page.drawText(formatCurrency(lineTotal, currency), { x: 500, y, size: 10, font: bodyFont });
  }

  y -= 24;
  page.drawLine({ start: { x: 360, y }, end: { x: 564, y }, thickness: 0.8, color: rgb(0.7, 0.7, 0.7) });
  y -= 18;
  page.drawText('Grand total', { x: 418, y, size: 11, font: titleFont });
  page.drawText(formatCurrency(total, currency), { x: 500, y, size: 11, font: titleFont });

  if (data.notes) {
    y -= 32;
    page.drawText('Notes', { x: 48, y, size: 10, font: titleFont });
    y -= 16;
    page.drawText(data.notes, { x: 48, y, size: 10, font: bodyFont, maxWidth: 516, lineHeight: 13 });
  }

  return pdf.save();
};
