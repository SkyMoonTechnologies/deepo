'use client';

import { saveToolCard } from '@/lib/client-db';
import { notifyAction, notifyActionError } from '@/lib/action-feedback';
import { useToolRuntimeState } from '@/lib/tool-runtime-state';
import { buildInvoicePdf, type InvoiceData, type InvoiceLineItem } from '@deepo/tools-core';

import type { ToolPanel } from '@/components/tools/ToolPlaceholderClient';

type ToolClientProps = {
  panel: ToolPanel;
};

type InvoiceToolState = {
  template: 'invoice' | 'quote';
  documentNumber: string;
  issueDate: string;
  dueDate: string;
  fromName: string;
  toName: string;
  notes: string;
  currency: string;
  items: InvoiceLineItem[];
  includeCustomerDataOnSave: boolean;
  status: string | null;
};

const initialState: InvoiceToolState = {
  template: 'invoice',
  documentNumber: 'INV-1001',
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date().toISOString().slice(0, 10),
  fromName: 'Deepo LLC',
  toName: 'Client Name',
  notes: '',
  currency: 'USD',
  items: [{ description: 'Service work', quantity: 1, unitPrice: 1500 }],
  includeCustomerDataOnSave: false,
  status: null,
};

const lineTotal = (item: InvoiceLineItem) => item.quantity * item.unitPrice;

export default function ToolClient({ panel }: ToolClientProps) {
  const [state, setState] = useToolRuntimeState<InvoiceToolState>('invoice-quote', initialState);

  const data: InvoiceData = {
    template: state.template,
    documentNumber: state.documentNumber,
    issueDate: state.issueDate,
    dueDate: state.template === 'invoice' ? state.dueDate : undefined,
    fromName: state.fromName,
    toName: state.toName,
    notes: state.notes,
    currency: state.currency,
    lineItems: state.items,
  };

  if (panel === 'input') {
    const updateItem = (index: number, key: keyof InvoiceLineItem, value: string) => {
      const nextItems = state.items.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        if (key === 'description') {
          return { ...item, description: value };
        }

        return { ...item, [key]: Number(value) || 0 };
      });

      setState({ ...state, items: nextItems });
    };

    const saveSettingsCard = async () => {
      const settingsPayload: Record<string, unknown> = {
        template: state.template,
        currency: state.currency,
        items: state.items,
      };

      if (state.includeCustomerDataOnSave) {
        settingsPayload.customer = {
          toName: state.toName,
          fromName: state.fromName,
          notes: state.notes,
          issueDate: state.issueDate,
          dueDate: state.dueDate,
          documentNumber: state.documentNumber,
        };
      }

      try {
        await saveToolCard({
          id: globalThis.crypto.randomUUID(),
          toolId: 'invoice-quote',
          title: `${state.template.toUpperCase()} ${state.documentNumber || 'draft'}`,
          payload: settingsPayload,
        });

        setState({ ...state, status: 'Card saved locally.' });
        notifyAction('save', 'Card saved locally.');
      } catch {
        notifyActionError('Save card');
      }
    };

    return (
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Template and details</h2>
        <label className="block space-y-1 text-sm">
          <span>Template</span>
          <select
            className="w-full rounded-md border border-input bg-background p-2 text-sm"
            value={state.template}
            onChange={(event) => setState({ ...state, template: event.target.value as 'invoice' | 'quote' })}
          >
            <option value="invoice">Invoice</option>
            <option value="quote">Quote</option>
          </select>
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Number</span>
            <input
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
              value={state.documentNumber}
              onChange={(event) => setState({ ...state, documentNumber: event.target.value })}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Currency</span>
            <input
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
              value={state.currency}
              onChange={(event) => setState({ ...state, currency: event.target.value.toUpperCase() || 'USD' })}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Issue date</span>
            <input
              type="date"
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
              value={state.issueDate}
              onChange={(event) => setState({ ...state, issueDate: event.target.value })}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Due date</span>
            <input
              type="date"
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
              value={state.dueDate}
              onChange={(event) => setState({ ...state, dueDate: event.target.value })}
            />
          </label>
        </div>
        <label className="block space-y-1 text-sm">
          <span>From</span>
          <input
            className="w-full rounded-md border border-input bg-background p-2 text-sm"
            value={state.fromName}
            onChange={(event) => setState({ ...state, fromName: event.target.value })}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>To</span>
          <input
            className="w-full rounded-md border border-input bg-background p-2 text-sm"
            value={state.toName}
            onChange={(event) => setState({ ...state, toName: event.target.value })}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Notes</span>
          <textarea
            className="h-20 w-full rounded-md border border-input bg-background p-2 text-sm"
            value={state.notes}
            onChange={(event) => setState({ ...state, notes: event.target.value })}
          />
        </label>
        <div className="space-y-2 rounded-md border border-border/70 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Line items</p>
          {state.items.map((item, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr]">
              <input
                className="rounded-md border border-input bg-background p-2 text-sm"
                value={item.description}
                onChange={(event) => updateItem(index, 'description', event.target.value)}
                placeholder="Description"
              />
              <input
                type="number"
                className="rounded-md border border-input bg-background p-2 text-sm"
                value={item.quantity}
                onChange={(event) => updateItem(index, 'quantity', event.target.value)}
                placeholder="Qty"
              />
              <input
                type="number"
                className="rounded-md border border-input bg-background p-2 text-sm"
                value={item.unitPrice}
                onChange={(event) => updateItem(index, 'unitPrice', event.target.value)}
                placeholder="Unit"
              />
            </div>
          ))}
          <button
            type="button"
            className="rounded border border-input px-2 py-1 text-xs"
            onClick={() => setState({ ...state, items: [...state.items, { description: '', quantity: 1, unitPrice: 0 }] })}
          >
            Add item
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={state.includeCustomerDataOnSave}
            onChange={(event) => setState({ ...state, includeCustomerDataOnSave: event.target.checked })}
          />
          Include customer data when saving card
        </label>
        <button type="button" className="rounded-md border border-input px-3 py-2 text-sm" onClick={() => void saveSettingsCard()}>
          Save card
        </button>
        {state.status ? <p className="text-xs text-muted-foreground">{state.status}</p> : null}
      </div>
    );
  }

  const grandTotal = state.items.reduce((total, item) => total + lineTotal(item), 0);

  const exportPdf = async () => {
    try {
      const bytes = await buildInvoicePdf(data);
      const byteView = new Uint8Array(bytes);
      const buffer = byteView.buffer.slice(byteView.byteOffset, byteView.byteOffset + byteView.byteLength);
      const blob = new globalThis.Blob([buffer], { type: 'application/pdf' });
      const url = globalThis.URL.createObjectURL(blob);
      const anchor = globalThis.document.createElement('a');
      anchor.href = url;
      anchor.download = `${state.template}-${state.documentNumber || 'draft'}.pdf`;
      anchor.click();
      globalThis.URL.revokeObjectURL(url);
      notifyAction('download', `${state.template}-${state.documentNumber || 'draft'}.pdf is ready.`);
    } catch {
      notifyActionError('Download PDF');
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Summary</h2>
      <div className="rounded-md border border-border/70 p-3 text-sm">
        <p><span className="font-medium">Type:</span> {state.template}</p>
        <p><span className="font-medium">Number:</span> {state.documentNumber}</p>
        <p><span className="font-medium">From:</span> {state.fromName}</p>
        <p><span className="font-medium">To:</span> {state.toName}</p>
      </div>
      <div className="rounded-md border border-border/70 p-3 text-sm">
        <p className="mb-2 font-medium">Line totals</p>
        <ul className="space-y-1">
          {state.items.map((item, index) => (
            <li key={`${item.description}-${index}`} className="flex justify-between gap-2 text-xs">
              <span>{item.description || 'Untitled item'}</span>
              <span>{lineTotal(item).toFixed(2)} {state.currency}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-border/70 pt-2 font-semibold">Grand total: {grandTotal.toFixed(2)} {state.currency}</p>
      </div>
      <button type="button" className="rounded-md border border-input px-3 py-2 text-sm" onClick={() => void exportPdf()}>
        Export PDF
      </button>
      <p className="text-xs text-muted-foreground">
        Sharing is disabled for this tool to reduce accidental exposure of customer PII.
      </p>
    </div>
  );
}
