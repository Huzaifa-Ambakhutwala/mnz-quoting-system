"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../lib/firebase";
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default function Home() {
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const q = collection(db, "quotations");
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => b.id.localeCompare(a.id));
      setQuotes(data);
    });
    return () => unsub();
  }, []);

  const createNewQuote = () => {
    const newId = `Q-${Date.now().toString().slice(-6)}`;
    router.push(`/quote/${newId}`);
  };

  const deleteQuote = async (id) => {
    if (confirm("Are you sure you want to delete this quotation?")) {
      await deleteDoc(doc(db, "quotations", id));
    }
  };

  const convertToInvoice = async (id) => {
    if (confirm("Convert this Quote to an Invoice? The payment terms will now show.")) {
      await updateDoc(doc(db, "quotations", id), { isInvoice: true });
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
        <button onClick={createNewQuote} className="btn btn-primary">
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
