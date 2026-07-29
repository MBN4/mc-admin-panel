import React, { forwardRef } from 'react';

const formatDate = (d) => {
  try { return new Date(d).toLocaleDateString('en-GB'); } catch { return ''; }
};

// Group an order's items by (quality|style|category|color|width). Each group's
// cells are the sizes that appear in that group, summed by quantity.
const groupItems = (items) => {
  const groups = new Map();
  for (const it of items) {
    const key = [it.quality, it.style, it.category, it.color, it.width || '']
      .join('|');
    if (!groups.has(key)) {
      groups.set(key, {
        quality: it.quality,
        style: it.style,
        category: it.category,
        color: it.color,
        width: it.width,
        sizes: new Map(),
        lineTotal: 0,
        totalQty: 0,
      });
    }
    const g = groups.get(key);
    const qty = Number(it.quantity) || 0;
    const price = Number(it.price_at_purchase) || 0;
    g.sizes.set(it.size, (g.sizes.get(it.size) || 0) + qty);
    g.totalQty += qty;
    g.lineTotal += qty * price;
  }
  return [...groups.values()];
};

const InvoicePrint = forwardRef(({ order }, ref) => {
  if (!order) return null;
  const items = order.items || [];
  const groups = groupItems(items);
  const totalQty = groups.reduce((a, g) => a + g.totalQty, 0);
  const grandTotal =
    Number(order.total_amount) ||
    groups.reduce((a, g) => a + g.lineTotal, 0);

  return (
    <div ref={ref} className="invoice-sheet">
      <style>{`
        .invoice-sheet {
          width: 210mm;
          min-height: 297mm;
          background: #ffffff;
          color: #000000;
          padding: 12mm 10mm;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          box-sizing: border-box;
        }
        .inv-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #000;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .inv-brand { font-size: 28px; font-weight: 900; letter-spacing: 2px; }
        .inv-brand-sub { font-size: 10px; font-weight: 700; letter-spacing: 3px; margin-top: 3px; }
        .inv-right { text-align: right; }
        .inv-urdu { font-family: "Jameel Noori Nastaleeq", "Noto Nastaliq Urdu", serif; font-size: 30px; font-weight: 900; direction: rtl; line-height: 1; }
        .inv-meta { margin-top: 6px; font-size: 11px; font-weight: 700; }
        .inv-meta div { margin-top: 2px; }

        .inv-customer {
          display: grid;
          grid-template-columns: 2fr 2fr 3fr;
          gap: 12px;
          border: 1.5px solid #000;
          padding: 8px 10px;
          margin-bottom: 14px;
        }
        .inv-field-label { font-size: 9px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #000; margin-bottom: 2px; }
        .inv-field-value { font-size: 12px; font-weight: 700; }

        .inv-group { margin-bottom: 12px; page-break-inside: avoid; }
        .inv-group-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 3px;
          font-size: 11px;
          font-weight: 700;
        }
        .inv-group-title {
          font-family: "Jameel Noori Nastaleeq", "Noto Nastaliq Urdu", "Arial", serif;
          direction: rtl;
          font-size: 15px;
          font-weight: 700;
        }
        .inv-group-meta { font-size: 10px; font-weight: 700; }

        .inv-grid {
          display: grid;
          border: 1.5px solid #000;
          grid-auto-rows: auto;
        }
        .inv-cell {
          border-right: 1px solid #000;
          text-align: center;
          font-size: 11px;
          font-weight: 700;
          overflow: hidden;
        }
        .inv-cell:last-child { border-right: none; }
        .inv-cell-head {
          padding: 3px 2px;
          border-bottom: 1px solid #000;
          background: #f0f0f0;
          font-size: 10px;
          font-weight: 900;
        }
        .inv-cell-body { min-height: 26px; padding: 4px 2px; }

        .inv-summary {
          margin-top: 16px;
          border: 2px solid #000;
        }
        .inv-summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 900;
          border-bottom: 1px solid #000;
        }
        .inv-summary-row:last-child { border-bottom: none; background: #f0f0f0; font-size: 14px; }

        .inv-footer {
          margin-top: 18px;
          border-top: 1.5px solid #000;
          padding-top: 8px;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 700;
        }
        .inv-footer-urdu {
          font-family: "Jameel Noori Nastaleeq", "Noto Nastaliq Urdu", serif;
          direction: rtl;
          font-size: 13px;
          text-align: center;
          margin-top: 12px;
        }

        @media print {
          @page { size: A4 portrait; margin: 8mm; }
          html, body { background: #ffffff !important; }
          body * { visibility: hidden !important; }
          .invoice-sheet, .invoice-sheet * { visibility: visible !important; }
          .invoice-sheet {
            position: absolute;
            left: 0; top: 0;
            width: 100%;
            padding: 0;
          }
        }
      `}</style>

      <div className="inv-header">
        <div>
          <div className="inv-brand">MADINA COLLAR</div>
          <div className="inv-brand-sub">FABRIC & COLLAR HOUSE</div>
        </div>
        <div className="inv-right">
          <div className="inv-urdu">انوائس</div>
          <div className="inv-meta">
            <div>Invoice #: SL_{10000 + order.id}</div>
            <div>Date: {formatDate(order.createdAt)}</div>
            <div>Status: {(order.status || '').toUpperCase()}</div>
          </div>
        </div>
      </div>

      <div className="inv-customer">
        <div>
          <div className="inv-field-label">Buyer</div>
          <div className="inv-field-value">{order.User?.username || 'Guest'}</div>
        </div>
        <div>
          <div className="inv-field-label">Phone</div>
          <div className="inv-field-value">{order.User?.phone || '-'}</div>
        </div>
        <div>
          <div className="inv-field-label">Bilti Details</div>
          <div className="inv-field-value">{order.bilti_info || '-'}</div>
        </div>
      </div>

      {groups.map((g, gi) => {
        const sizeEntries = [...g.sizes.entries()];
        const cols = Math.max(sizeEntries.length, 1);
        return (
          <div className="inv-group" key={gi}>
            <div className="inv-group-header">
              <div className="inv-group-meta">
                {g.category}{g.color ? ` / ${g.color}` : ''}{g.width ? ` / W:${g.width}` : ''} — Qty {g.totalQty}
              </div>
              <div className="inv-group-title">
                {g.style} {g.quality}
              </div>
            </div>
            <div className="inv-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {sizeEntries.map(([sizeVal, qty], i) => (
                <div className="inv-cell" key={`h-${i}`}>
                  <div className="inv-cell-head">{sizeVal}</div>
                  <div className="inv-cell-body">{qty}</div>
                </div>
              ))}
              {sizeEntries.length === 0 && (
                <div className="inv-cell">
                  <div className="inv-cell-head">—</div>
                  <div className="inv-cell-body"></div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {groups.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px', fontWeight: 700 }}>No items on this order.</div>
      )}

      <div className="inv-summary">
        <div className="inv-summary-row">
          <span>Total Lines</span>
          <span>{groups.length}</span>
        </div>
        <div className="inv-summary-row">
          <span>Total Quantity</span>
          <span>{totalQty} PCS</span>
        </div>
        <div className="inv-summary-row">
          <span>GRAND TOTAL</span>
          <span>Rs {Number(grandTotal).toLocaleString()}</span>
        </div>
      </div>

      <div className="inv-footer">
        <div>Printed: {formatDate(new Date())}</div>
        <div>Handler: Admin</div>
      </div>
      <div className="inv-footer-urdu">
        نوٹ: خریدا ہوا مال بل دکھا کر واپس یا تبدیل ہو سکتا ہے۔ شکریہ۔
      </div>
    </div>
  );
});

export default InvoicePrint;
