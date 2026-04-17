"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const savedQuotes = JSON.parse(localStorage.getItem("mnz_quotations") || "[]");
    setQuotes(savedQuotes);
  }, []);

  const handleCreate = () => {
    const id = `Q${Math.floor(Math.random() * 100000)}`;
    router.push(`/quote/${id}`);
  };

  const deleteQuote = (id) => {
    if (confirm("Are you sure you want to delete this quotation?")) {
      const newQuotes = quotes.filter((q) => q.id !== id);
      setQuotes(newQuotes);
      localStorage.setItem("mnz_quotations", JSON.stringify(newQuotes));
    }
  };

  const convertToInvoice = (id) => {
    if (confirm("Convert this Quote to an Invoice? The payment terms will now show.")) {
      const newQuotes = quotes.map((q) => q.id === id ? { ...q, isInvoice: true } : q);
      setQuotes(newQuotes);
      localStorage.setItem("mnz_quotations", JSON.stringify(newQuotes));
    }
  };

  const filteredQuotes = quotes.filter(q => 
    (q.customerName && q.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (q.id && q.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="app-container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="page-title" style={{marginBottom: 0}}>Quotations Dashboard</h1>
          <p style={{color: 'var(--text-secondary)'}}>Manage, search, and edit your quotations</p>
        </div>
        <button onClick={handleCreate} className="btn btn-primary">
          + Create New Quotation
        </button>
      </div>

      <div className="card mb-8">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by ID or Customer Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container" style={{ marginBottom: 0, border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Quote ID</th>
                <th>Date</th>
                <th>Customer Name</th>
                <th>Sign Name</th>
                <th>Total ($)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>
                    No quotations found. Click &quot;Create New Quotation&quot; to start.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id}>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold', 
                        background: quote.isInvoice ? '#ede9fe' : '#e0f2fe',
                        color: quote.isInvoice ? '#7c3aed' : '#0284c7'
                      }}>
                        {quote.isInvoice ? "INVOICE" : "QUOTE"}
                      </span>
                    </td>
                    <td style={{fontWeight: '600', color: 'var(--accent-primary)'}}>{quote.id}</td>
                    <td>{quote.date || "N/A"}</td>
                    <td>{quote.customerName || "N/A"}</td>
                    <td>{quote.signName || "N/A"}</td>
                    <td>${(quote.grandTotal || 0).toFixed(2)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => router.push(`/quote/${quote.id}`)} 
                          className="btn btn-outline"
                          style={{padding: '0.25rem 0.75rem', fontSize: '0.75rem'}}
                        >
                          Edit / View
                        </button>
                        {!quote.isInvoice && (
                          <button 
                            onClick={() => convertToInvoice(quote.id)} 
                            className="btn btn-primary"
                            style={{padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: '#10b981', borderColor: '#10b981'}}
                          >
                            Convert to Invoice
                          </button>
                        )}
                        <button 
                          onClick={() => deleteQuote(quote.id)} 
                          className="btn btn-danger"
                          style={{padding: '0.25rem 0.75rem', fontSize: '0.75rem'}}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
