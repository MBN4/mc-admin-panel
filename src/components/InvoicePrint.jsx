import React, { forwardRef } from 'react';

const InvoicePrint = forwardRef(({ order }, ref) => {
  if (!order) return null;
  const items = order.items || [];
  const formatDate = (date) => new Date(date).toLocaleDateString('en-GB');
  const calculateTotalPcs = () => items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <div ref={ref} className="p-10 bg-white text-black min-h-screen font-serif" style={{ width: '210mm' }}>
      <div className="border-t-4 border-b border-[#a12525] py-1 mb-6 flex justify-center items-center relative"><div className="w-4 h-4 bg-[#FFD700] rotate-45 absolute -top-2" /></div>
      <div className="flex justify-between items-start mb-10 px-4">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm"><span className="text-gray-400 font-black text-[8px] uppercase tracking-tighter text-center">MADINA<br/>COLLAR</span></div>
          <div className="h-20 w-[2px] bg-[#FFD700]" />
          <div><h1 className="text-5xl font-light text-[#a12525] leading-none mb-3" style={{ fontFamily: 'Brush Script MT, cursive' }}>Collar House</h1><div className="flex items-center gap-2 text-[#a12525]"><div className="w-3 h-3 bg-[#a12525] rounded-full flex items-center justify-center"><div className="w-1 h-1 bg-white rounded-full" /></div><p className="text-[11px] font-bold max-w-[220px] leading-tight">Shop # 06, Chaman Market, Mohalla Khudadad, Qissa Khawani Bazar, Peshawar.</p></div></div>
        </div>
        <div className="text-right space-y-3 pt-2">
          <div className="flex items-center justify-end gap-3"><p className="text-sm font-black text-gray-800">0304-7632727</p><div className="w-5 h-5 bg-[#a12525] rounded-full flex items-center justify-center shadow-sm"><div className="w-1.5 h-1.5 bg-white rounded-full" /></div></div>
          <div className="flex items-center justify-end gap-3"><p className="text-sm font-black text-gray-800">091-2562727</p><div className="w-5 h-5 bg-[#a12525] rounded-full flex items-center justify-center shadow-sm"><div className="w-1.5 h-1.5 bg-white rounded-full" /></div></div>
        </div>
      </div>
      <div className="flex justify-between text-xs font-black mb-6 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 uppercase tracking-widest shadow-inner"><p>Date: {formatDate(order.createdAt)}</p><p>InvNo: SL_{10000 + order.id}</p><p>Handler: Admin</p></div>
      <div className="bg-[#a12525] text-white text-center py-2.5 font-black text-sm tracking-[0.3em] mb-6 uppercase shadow-md">Customer identification</div>
      <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-sm mb-10 px-6">
        <div className="flex items-end gap-3"><span className="font-black text-[#a12525] uppercase text-[10px]">Name:</span><span className="border-b-2 border-gray-100 flex-1 pb-1 font-bold uppercase tracking-tight">{order.User?.username || 'Guest'}</span></div>
        <div className="flex items-end gap-3"><span className="font-black text-[#a12525] uppercase text-[10px]">Bilty:</span><span className="border-b-2 border-gray-100 flex-1 pb-1 font-bold"></span></div>
        <div className="flex items-end gap-3"><span className="font-black text-[#a12525] uppercase text-[10px]">Address:</span><span className="border-b-2 border-gray-100 flex-1 pb-1 font-bold">{order.bilti_info || '-'}</span></div>
        <div className="flex items-end gap-3"><span className="font-black text-[#a12525] uppercase text-[10px]">Logistics:</span><span className="border-b-2 border-gray-100 flex-1 pb-1 font-bold"></span></div>
        <div className="flex items-end gap-3"><span className="font-black text-[#a12525] uppercase text-[10px]">Phone:</span><span className="border-b-2 border-gray-100 flex-1 pb-1 font-bold">{order.User?.phone || '-'}</span></div>
        <div className="flex items-end gap-3"><span className="font-black text-[#a12525] uppercase text-[10px]">Weight:</span><span className="border-b-2 border-gray-100 flex-1 pb-1 font-bold"></span></div>
      </div>
      <table className="w-full border-collapse mb-10 text-[11px]">
        <thead><tr className="bg-[#a12525] text-white uppercase italic text-left"><th className="border border-black p-3 w-10 text-center">#</th><th className="border border-black p-3">Description</th><th className="border border-black p-3 w-28 text-center">Quantity</th><th className="border border-black p-3 w-24 text-center">Rate</th><th className="border border-black p-3 w-28 text-center">Total</th></tr></thead>
        <tbody>{items.map((item, idx) => (<tr key={idx} className="font-bold border-b border-gray-200"><td className="border border-black p-3 text-center bg-gray-50">{idx + 1}</td><td className="border border-black p-3 uppercase font-black tracking-tighter">{item.quality} {item.style} - {item.category} / {item.color} (S:{item.size}) {item.width ? `[W:${item.width}]` : ''}</td><td className="border border-black p-3 text-center bg-gray-50 font-black">{item.quantity} PCS</td><td className="border border-black p-3 text-center">{item.price_at_purchase}</td><td className="border border-black p-3 text-center bg-gray-50">{(item.price_at_purchase * item.quantity).toLocaleString()}</td></tr>))}</tbody>
      </table>
      <div className="flex justify-between items-start px-4">
        <div className="text-[11px] font-black space-y-2 py-4 px-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm"><div className="flex justify-between w-40 text-gray-500 uppercase tracking-tighter"><span>Lines:</span> <span className="text-black">{items.length}</span></div><div className="flex justify-between w-40 text-gray-500 uppercase tracking-tighter"><span>Volume:</span> <span className="text-black">{calculateTotalPcs()} PCS</span></div></div>
        <div className="w-72 space-y-1"><div className="flex justify-between text-xs font-black py-2 px-2"><span>Subtotal</span><span>PKR {order.total_amount.toLocaleString()}</span></div><div className="flex justify-between text-xs font-black py-2 px-2 border-t border-gray-100"><span>Tax</span><span>PKR 0</span></div><div className="bg-[#a12525] text-white p-4 mt-4 flex justify-between items-center font-black rounded-xl shadow-lg border border-[#800000]"><span className="text-sm tracking-[0.2em]">TOTAL</span><span className="text-2xl font-black tracking-tighter">PKR {order.total_amount.toLocaleString()}</span></div><div className="pt-4 space-y-2"><div className="flex justify-between text-[11px] font-black text-gray-400 px-2 uppercase tracking-tighter"><span>Status:</span> <span className="text-[#a12525]">PAID IN FULL</span></div></div></div>
      </div>
      <div className="mt-auto pt-32 pb-10">
        <div className="border-t-2 border-b-2 border-[#a12525] py-2 flex justify-center relative bg-gray-50/50"><div className="w-4 h-4 bg-[#FFD700] rotate-45 absolute -top-2" /><p className="text-xl font-bold py-6 text-center text-[#a12525] px-10 leading-relaxed" dir="rtl" style={{ fontFamily: 'Arial' }}>نوٹ: خریدا ہوا مال واپس یا تبدیل ہو جائے گا۔ (بل دکھا کے)  |  ہم دعا گو ہیں کہ ہم سے خریدا ہوا مال آپ کیلئے خیر و برکت کا باعث بنے۔ آمین</p><div className="w-4 h-4 bg-[#FFD700] rotate-45 absolute -bottom-2" /></div>
      </div>
    </div>
  );
});

export default InvoicePrint;