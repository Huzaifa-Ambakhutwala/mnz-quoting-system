"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function QuotePage({ params }) {
  const router = useRouter();
  const quoteId = params.id;
  
  const [isPreview, setIsPreview] = useState(false);
  const [data, setData] = useState({
    id: quoteId,
    customer: "",
    quotationType: "New Sign",
    signName: "",
    customerPhone: "",
    customerEmail: "",
    address: "",
    proposalFor: "proposal",
    customerName: "",
    items: [],
    note: "",
    isInvoice: false,
    taxRate: 8.25,
    discountValue: 0,
    date: new Date().toISOString().split('T')[0],
    deposit: 0,
    shopCompletion: 0,
    balance: 0,
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("mnz_quotations") || "[]");
    const existing = saved.find(q => q.id === quoteId);
    if (existing) {
      setData(existing);
    } else {
      setData(prev => ({ 
        ...prev, 
        items: [{ id: Date.now(), showImage: false, image: "", description: "", quantity: 1, unitPrice: 0 }] 
      }));
    }
  }, [quoteId]);

  const saveQuote = (e) => {
    if (e) e.preventDefault();
    const saved = JSON.parse(localStorage.getItem("mnz_quotations") || "[]");
    const updatedData = { ...data, ...calculateTotals() };
    
    const idx = saved.findIndex(q => q.id === quoteId);
    if (idx >= 0) {
      saved[idx] = updatedData;
    } else {
      saved.push(updatedData);
    }
    localStorage.setItem("mnz_quotations", JSON.stringify(saved));
    alert("Quotation saved successfully!");
  };

  const handleInputChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotals = () => {
    const subTotal = data.items.reduce((acc, item) => acc + (parseFloat(item.quantity) * parseFloat(item.unitPrice || 0)), 0);
    const totalWithoutTax = subTotal - parseFloat(data.discountValue || 0);
    const taxAmount = totalWithoutTax * (parseFloat(data.taxRate || 0) / 100);
    const grandTotal = totalWithoutTax + taxAmount;
    const remaining = grandTotal - parseFloat(data.deposit || 0) - parseFloat(data.shopCompletion || 0);
    
    return { subTotal, totalWithoutTax, taxAmount, grandTotal, remaining };
  };

  const totals = calculateTotals();

  // Item Handlers
  const addItem = () => {
    setData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), showImage: false, image: "", description: "", quantity: 1, unitPrice: 0 }]
    }));
  };

  const removeItem = (id) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateItem = (id, field, value) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleImageUpload = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateItem(id, 'image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isPreview) {
    return (
      <div className="preview-mode">
        <div className="no-print" style={{position: 'fixed', top: '10px', right: '10px', display: 'flex', gap: '10px'}}>
          <button className="btn btn-outline" onClick={() => setIsPreview(false)}>Back to Edit Mode</button>
          <button className="btn btn-primary" onClick={() => window.print()}>Print / Save PDF</button>
        </div>
        
        <div className="preview-container">
          <div className="preview-top-section" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem'}}>
             <div>
                <img src="/mnz-logo.jpg" alt="MNZ Signs & Prints Logo" style={{ maxWidth: '280px', display: 'block', margin: '0 0 1rem 0' }} />
                <h3 style={{fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0056b3', margin: 0}}>{data.isInvoice ? "Invoice" : "Quotation"}</h3>
             </div>
             <div className="meta-box details-box" style={{textAlign: 'right'}}>
                <div style={{fontSize: '16px', marginBottom: '0.25rem'}}><span style={{color: '#64748b'}}>{data.isInvoice ? "Invoice" : "Quotation"} No:</span> <strong style={{color: '#0056b3'}}>#{data.id}</strong></div>
                <div style={{fontSize: '14px'}}><span style={{color: '#64748b'}}>Date:</span> <strong>{new Date(data.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
             </div>
          </div>

          <div className="invoice-meta-container" style={{display: 'flex', gap: '2rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px'}}>
            <div className="meta-box client-box" style={{flex: 1}}>
              <span className="meta-label">Prepared For</span>
              <p className="meta-value"><strong>{data.customerName || "N/A"}</strong></p>
              <p style={{fontSize: '12px', color: '#555'}}>{data.address}</p>
              {data.customerEmail && <p style={{fontSize: '12px', color: '#555'}}>{data.customerEmail}</p>}
              {data.customerPhone && <p style={{fontSize: '12px', color: '#555'}}>{data.customerPhone}</p>}
            </div>
            <div className="meta-box project-box" style={{flex: 1}}>
              <span className="meta-label">Project Details</span>
              <p><strong>Re:</strong> {data.signName}</p>
              <p><strong>Attn:</strong> {data.customerName}</p>
            </div>
          </div>

          <div className="preview-thankyou" style={{marginBottom: '1rem', fontSize: '13px'}}>
            Thank you for your interest in MNZ SIGNS & PRINTS. We will provide the following products and services for <strong>{data.signName}</strong>:
          </div>

          <table className="preview-table">
            <thead>
              <tr>
                <th style={{width: '5%'}}>Item.</th>
                {data.items.some(i => i.showImage && i.image) && (
                  <th style={{width: '15%'}}>Image</th>
                )}
                <th>Description</th>
                <th style={{width: '5%'}} className="text-center">Qty</th>
                <th style={{width: '10%'}} className="text-right">Unit $</th>
                <th style={{width: '12%'}} className="text-right">Amount $</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  {data.items.some(i => i.showImage && i.image) && (
                    <td>
                      {item.showImage && item.image && (
                        <img src={item.image} alt="Item" style={{maxWidth: '100%', maxHeight: '60px', objectFit: 'contain'}} />
                      )}
                    </td>
                  )}
                  <td>{item.description}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right" style={{whiteSpace: 'nowrap'}}>$ {parseFloat(item.unitPrice || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td className="text-right" style={{whiteSpace: 'nowrap'}}>$ {(parseFloat(item.quantity) * parseFloat(item.unitPrice || 0)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={data.items.some(i => i.showImage && i.image) ? 4 : 3} style={{border: 'none'}}></td>
                <td className="text-right" style={{fontWeight: 'bold', padding: '6px 12px'}}>Sub Total</td>
                <td className="text-right" style={{whiteSpace: 'nowrap', padding: '6px 12px'}}>$ {totals.subTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
              </tr>
              {parseFloat(data.discountValue || 0) > 0 && (
                <tr>
                  <td colSpan={data.items.some(i => i.showImage && i.image) ? 4 : 3} style={{border: 'none'}}></td>
                  <td className="text-right" style={{fontWeight: 'bold', padding: '6px 12px'}}>Discount</td>
                  <td className="text-right" style={{whiteSpace: 'nowrap', padding: '6px 12px'}}>$ {parseFloat(data.discountValue || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
              )}
              <tr>
                <td colSpan={data.items.some(i => i.showImage && i.image) ? 4 : 3} style={{border: 'none'}}></td>
                <td className="text-right" style={{fontWeight: 'bold', padding: '6px 12px'}}>Tax</td>
                <td className="text-right" style={{whiteSpace: 'nowrap', padding: '6px 12px'}}>$ {totals.taxAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
              </tr>
              <tr>
                <td colSpan={data.items.some(i => i.showImage && i.image) ? 4 : 3} style={{border: 'none'}}></td>
                <td className="text-right" style={{fontWeight: 'bold', padding: '6px 12px', fontSize: '14px'}}>Grand Total</td>
                <td className="text-right" style={{whiteSpace: 'nowrap', padding: '6px 12px', fontSize: '14px', fontWeight: 'bold'}}>$ {totals.grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
              </tr>
              {data.isInvoice && (
                <>
                  <tr>
                    <td colSpan={data.items.some(i => i.showImage && i.image) ? 4 : 3} style={{border: 'none'}}></td>
                    <td className="text-right" style={{fontWeight: 'bold', padding: '6px 12px'}}>Deposit</td>
                    <td className="text-right" style={{whiteSpace: 'nowrap', padding: '6px 12px'}}>$ {parseFloat(data.deposit || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  </tr>
                  <tr>
                    <td colSpan={data.items.some(i => i.showImage && i.image) ? 4 : 3} style={{border: 'none'}}></td>
                    <td className="text-right" style={{fontWeight: 'bold', padding: '6px 12px'}}>Upon Completion of sign @ shop</td>
                    <td className="text-right" style={{whiteSpace: 'nowrap', padding: '6px 12px'}}>$ {parseFloat(data.shopCompletion || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  </tr>
                  <tr>
                    <td colSpan={data.items.some(i => i.showImage && i.image) ? 4 : 3} style={{border: 'none'}}></td>
                    <td className="text-right" style={{fontWeight: 'bold', padding: '6px 12px'}}>Balance at the Day of Installation</td>
                    <td className="text-right" style={{whiteSpace: 'nowrap', padding: '6px 12px'}}>$ {totals.remaining.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>

          {data.note && (
             <div className="mt-8">
               <b>Notes:</b>
               <p style={{whiteSpace: 'pre-wrap', fontSize: '10px'}}>{data.note}</p>
             </div>
          )}

          <div className="preview-footer">
            Any work done other than specified above would be charged seperately or added to the final invoice.
          </div>
        </div>
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="app-container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <button className="btn btn-outline mb-4" onClick={() => router.push('/')} style={{padding: '0.5rem 1rem'}}>
            &larr; Back to Dashboard
          </button>
          <h1 className="page-title" style={{marginBottom: 0}}>Edit {data.isInvoice ? "Invoice" : "Quotation"} {data.id}</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsPreview(true)} className="btn btn-outline">Preview & Print Document</button>
          <button onClick={saveQuote} className="btn btn-primary">Save Quotation</button>
        </div>
      </div>

      <div className="card mb-8">
        <h2 className="section-title">Quotation Details</h2>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Customer</label>
            <input type="text" className="form-control" value={data.customer} onChange={e => handleInputChange('customer', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Quotation Type</label>
            <input type="text" className="form-control" value={data.quotationType} onChange={e => handleInputChange('quotationType', e.target.value)} />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Sign Name</label>
            <input type="text" className="form-control" value={data.signName} onChange={e => handleInputChange('signName', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Customer Phone</label>
            <input type="text" className="form-control" value={data.customerPhone} onChange={e => handleInputChange('customerPhone', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Customer Email</label>
            <input type="email" className="form-control" value={data.customerEmail} onChange={e => handleInputChange('customerEmail', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Address</label>
            <input type="text" className="form-control" value={data.address} onChange={e => handleInputChange('address', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Proposal For</label>
            <input type="text" className="form-control" value={data.proposalFor} onChange={e => handleInputChange('proposalFor', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input type="text" className="form-control" value={data.customerName} onChange={e => handleInputChange('customerName', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="section-title" style={{marginBottom: 0, border: 'none'}}>Line Items</h2>
          <button onClick={addItem} className="btn btn-primary" style={{padding: '0.5rem 1rem'}}>+ Add Item</button>
        </div>

        {data.items.map((item, index) => (
          <div key={item.id} className="card mb-4" style={{background: 'var(--bg-secondary)', borderStyle: 'dashed'}}>
            <div className="flex justify-between items-center mb-4">
              <span style={{fontWeight: 'bold', color: 'var(--text-secondary)'}}>Item {index + 1}</span>
              <button onClick={() => removeItem(item.id)} className="btn btn-danger" style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem'}}>Remove Item</button>
            </div>
            
            <div className="toggle-group mt-4 mb-4">
              <input 
                type="checkbox" 
                id={`show-image-${item.id}`}
                className="toggle-input"
                checked={item.showImage}
                onChange={(e) => updateItem(item.id, 'showImage', e.target.checked)}
              />
              <label htmlFor={`show-image-${item.id}`} className="form-label" style={{margin: 0, cursor: 'pointer'}}>
                Show Image For This Item
              </label>
            </div>

            <div className="form-row" style={{gridTemplateColumns: 'minmax(250px, 2fr) minmax(150px, 1fr) minmax(150px, 1fr) minmax(150px, 1fr)'}}>
              {item.showImage && (
                <div className="form-group" style={{marginBottom: 0, gridColumn: '1 / -1'}}>
                  <label className="form-label">Image</label>
                  {item.image ? (
                    <div style={{position: 'relative', display: 'inline-block'}}>
                       <img src={item.image} alt="Upload Preview" className="item-image-preview" style={{width: '120px', height: '120px'}} />
                       <button onClick={() => updateItem(item.id, 'image', '')} className="btn btn-danger" style={{position: 'absolute', top: '-10px', right: '-10px', padding: '0.2rem 0.5rem', borderRadius: '50%'}}>×</button>
                    </div>
                  ) : (
                    <label className="image-upload" style={{width: '100%', maxWidth: '300px', height: '120px', display: 'flex', flexDirection: 'column'}}>
                       <span>Click to upload image</span>
                       <input type="file" accept="image/*" onChange={(e) => handleImageUpload(item.id, e)} style={{display: 'none'}} />
                    </label>
                  )}
                </div>
              )}
              <div className="form-group" style={{marginBottom: 0}}>
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  value={item.description} 
                  onChange={e => updateItem(item.id, 'description', e.target.value)}
                  style={{minHeight: '100px'}}
                />
              </div>
              <div className="form-group" style={{marginBottom: 0}}>
                <label className="form-label">Unit Price ($)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={item.unitPrice} 
                  onChange={e => updateItem(item.id, 'unitPrice', e.target.value)}
                />
              </div>
              <div className="form-group" style={{marginBottom: 0}}>
                <label className="form-label">Quantity</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={item.quantity} 
                  onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                />
              </div>
              <div className="form-group" style={{marginBottom: 0}}>
                <label className="form-label">Total Price</label>
                <div className="form-control" style={{background: 'rgba(0,0,0,0.2)', cursor: 'not-allowed', color: 'var(--success)'}}>
                  ${(parseFloat(item.quantity) * parseFloat(item.unitPrice || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-8">
        <h2 className="section-title">Summary & Details</h2>
        <div className="form-group">
          <label className="form-label">Note</label>
          <textarea 
            className="form-control" 
            value={data.note} 
            onChange={e => handleInputChange('note', e.target.value)}
            style={{minHeight: '120px'}}
            placeholder="Additional notes for the client..."
          />
        </div>

        <div className="form-row mt-6">
          <div className="form-group">
            <label className="form-label">Invoice Total Without Tax</label>
            <div className="form-control" style={{background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)'}}>
              ${totals.totalWithoutTax.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">TAX (%)</label>
            <input type="number" className="form-control" value={data.taxRate} onChange={e => handleInputChange('taxRate', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">TAX Amount</label>
            <div className="form-control" style={{background: 'rgba(0,0,0,0.2)', cursor: 'not-allowed'}}>
              ${totals.taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Discount Value ($)</label>
            <input type="number" className="form-control" value={data.discountValue} onChange={e => handleInputChange('discountValue', e.target.value)} />
          </div>
        </div>

        <div className="form-row mt-4">
          <div className="form-group">
            <label className="form-label">Invoice Total</label>
            <div className="form-control" style={{background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--success)', color: 'var(--success)', fontWeight: 'bold'}}>
              ${totals.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={data.date} onChange={e => handleInputChange('date', e.target.value)} />
          </div>
        </div>

        <h3 className="section-title mt-8" style={{fontSize: '1.1rem', border: 'none'}}>Payment Terms</h3>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Deposit upon signing the contract ($)</label>
            <input type="number" className="form-control" value={data.deposit} onChange={e => handleInputChange('deposit', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Upon Completion of sign @ shop ($)</label>
            <input type="number" className="form-control" value={data.shopCompletion} onChange={e => handleInputChange('shopCompletion', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Remaining Amount ($)</label>
            <div className="form-control" style={{background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)'}}>
              ${totals.remaining.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
         <button onClick={saveQuote} className="btn btn-primary" style={{padding: '1rem 2rem', fontSize: '1.1rem'}}>Confirm & Save Data</button>
      </div>

    </div>
  );
}
