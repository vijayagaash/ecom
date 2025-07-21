import React, { useState } from 'react';
import InvoiceGenerator from './InvoiceGenerator';
import './Invoice.css';

const Invoice = ({ order, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { downloadInvoice, previewInvoice } = InvoiceGenerator();
  
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
      downloadInvoice(order);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handlePreview = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      previewInvoice(order);
    } catch (error) {
      console.error('Error previewing invoice:', error);
      alert('Failed to preview invoice. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatCurrency = (amount) => {
    const value = amount || 0;
    return `₹${value.toFixed(2)}`;
  };
  
  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal">
        <div className="invoice-header">
          <h2>Invoice Details</h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="invoice-content">
          {/* Order Summary */}
          <div className="invoice-section">
            <h3>Order Summary</h3>
            <div className="order-info-grid">
              <div className="info-item">
                <span className="label">Order ID:</span>
                <span className="value">#{order.id}</span>
              </div>
              <div className="info-item">
                <span className="label">Date:</span>
                <span className="value">{formatDate(order.orderDate)}</span>
              </div>
              <div className="info-item">
                <span className="label">Status:</span>
                <span className={`value status-${order.status?.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Total Amount:</span>
                <span className="value total">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
          
          {/* Customer Information */}
          <div className="invoice-section">
            <h3>Customer Information</h3>
            <div className="customer-info">
              <p><strong>Email:</strong> {order.customerEmail}</p>
              {order.customerPhone && (
                <p><strong>Phone:</strong> {order.customerPhone}</p>
              )}
              <p><strong>Shipping Address:</strong></p>
              <p className="address">{order.shippingAddress}</p>
            </div>
          </div>
          
          {/* Order Items */}
          <div className="invoice-section">
            <h3>Order Items</h3>
            <div className="items-table">
              <div className="table-header">
                <span>Product</span>
                <span>Quantity</span>
                <span>Unit Price</span>
                <span>Total</span>
              </div>
              {order.orderItems?.map((item, index) => {
                const unitPrice = item.price || item.unitPrice || 0;
                const quantity = item.quantity || 0;
                const itemTotal = unitPrice * quantity;
                
                return (
                  <div key={index} className="table-row">
                    <div className="product-info">
                      <span className="product-name">{item.productName || 'N/A'}</span>
                      {item.productDescription && (
                        <span className="product-desc">{item.productDescription}</span>
                      )}
                    </div>
                    <span>{quantity}</span>
                    <span>{formatCurrency(unitPrice)}</span>
                    <span>{formatCurrency(itemTotal)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Totals */}
          <div className="invoice-section">
            <div className="totals-section">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.orderItems?.reduce((sum, item) => {
                  const unitPrice = item.price || item.unitPrice || 0;
                  const quantity = item.quantity || 0;
                  return sum + (unitPrice * quantity);
                }, 0))}</span>
              </div>
              {(order.shippingCost || 0) > 0 && (
                <div className="total-row">
                  <span>Shipping:</span>
                  <span>{formatCurrency(order.shippingCost)}</span>
                </div>
              )}
              {(order.tax || 0) > 0 && (
                <div className="total-row">
                  <span>Tax:</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
              )}
              <div className="total-row final-total">
                <span>Total:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="invoice-actions">
          <button 
            className="btn-secondary" 
            onClick={handlePreview}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <svg className="spinner" viewBox="0 0 24 24" width="16" height="16">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                  <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"/>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Preview Invoice
              </>
            )}
          </button>
          
          <button 
            className="btn-primary" 
            onClick={handleDownload}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <svg className="spinner" viewBox="0 0 24 24" width="16" height="16">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                  <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"/>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
