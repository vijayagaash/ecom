import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InvoiceEditor.css';

function InvoiceEditor() {
  const navigate = useNavigate();
  const [template, setTemplate] = useState({
    companyName: 'E-Com Store',
    companyLogo: '',
    companyAddress: '123 Business Street\nCity, State 12345\nPhone: (555) 123-4567',
    headerColor: '#2c3e50',
    primaryColor: '#3498db',
    secondaryColor: '#ecf0f1',
    showLogo: true,
    showCompanyAddress: true,
    showCustomerInfo: true,
    showItemDescription: true,
    showItemImages: false,
    footerText: 'Thank you for your business!',
    termsAndConditions: 'Payment is due within 30 days of invoice date.',
    fontSize: 12,
    fontFamily: 'Arial, sans-serif'
  });
  
  const [previewOrder, setPreviewOrder] = useState({
    id: 12345,
    orderDate: new Date().toISOString(),
    status: 'CONFIRMED',
    totalAmount: 1598.00,
    shippingCost: 0,
    tax: 0,
    customerEmail: 'customer@example.com',
    customerPhone: '(555) 123-4567',
    shippingAddress: '456 Customer Avenue\nCustomer City, State 54321',
    orderItems: [
      {
        id: 1,
        productName: 'Premium T-Shirt',
        quantity: 2,
        unitPrice: 699.00,
        price: 699.00
      },
      {
        id: 2,
        productName: 'Cotton Vest',
        quantity: 1,
        unitPrice: 200.00,
        price: 200.00
      }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/invoice-templates/current');
      if (response.data) {
        setTemplate(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.log('No existing template found, using defaults');
    }
  };

  const handleInputChange = (field, value) => {
    setTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveTemplate = async () => {
    setLoading(true);
    setSaveStatus('');
    
    try {
      await axios.post('http://localhost:8080/api/invoice-templates', template);
      setSaveStatus('Template saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('Error saving template: ' + error.message);
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const generatePreviewPDF = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/invoice-templates/preview', {
        template,
        order: previewOrder
      }, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('Error generating PDF preview. Please check the console for details.');
    }
  };

  return (
    <div className="invoice-editor-container">
      <div className="invoice-editor-header">
        <button onClick={() => navigate('/admin-dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>Invoice PDF Template Editor</h1>
        <div className="header-actions">
          <button onClick={generatePreviewPDF} className="preview-btn">
            Preview PDF
          </button>
          <button 
            onClick={handleSaveTemplate} 
            className="save-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className={`save-status ${saveStatus.includes('Error') ? 'error' : 'success'}`}>
          {saveStatus}
        </div>
      )}

      <div className="invoice-editor-content">
        <div className="editor-panel">
          <div className="editor-section">
            <h3>Company Information</h3>
            
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={template.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Company Logo URL</label>
              <input
                type="url"
                value={template.companyLogo}
                onChange={(e) => handleInputChange('companyLogo', e.target.value)}
                className="form-input"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="form-group">
              <label>Company Address</label>
              <textarea
                value={template.companyAddress}
                onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                className="form-textarea"
                rows="3"
              />
            </div>
          </div>

          <div className="editor-section">
            <h3>Colors & Styling</h3>
            
            <div className="form-group">
              <label>Header Color</label>
              <input
                type="color"
                value={template.headerColor}
                onChange={(e) => handleInputChange('headerColor', e.target.value)}
                className="form-color"
              />
            </div>

            <div className="form-group">
              <label>Primary Color</label>
              <input
                type="color"
                value={template.primaryColor}
                onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                className="form-color"
              />
            </div>

            <div className="form-group">
              <label>Secondary Color</label>
              <input
                type="color"
                value={template.secondaryColor}
                onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                className="form-color"
              />
            </div>

            <div className="form-group">
              <label>Font Size</label>
              <input
                type="number"
                value={template.fontSize}
                onChange={(e) => handleInputChange('fontSize', parseInt(e.target.value))}
                className="form-input"
                min="8"
                max="24"
              />
            </div>

            <div className="form-group">
              <label>Font Family</label>
              <select
                value={template.fontFamily}
                onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                className="form-select"
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Helvetica, sans-serif">Helvetica</option>
              </select>
            </div>
          </div>

          <div className="editor-section">
            <h3>Display Options</h3>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={template.showLogo}
                  onChange={(e) => handleInputChange('showLogo', e.target.checked)}
                />
                Show Company Logo
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={template.showCompanyAddress}
                  onChange={(e) => handleInputChange('showCompanyAddress', e.target.checked)}
                />
                Show Company Address
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={template.showCustomerInfo}
                  onChange={(e) => handleInputChange('showCustomerInfo', e.target.checked)}
                />
                Show Customer Information
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={template.showItemDescription}
                  onChange={(e) => handleInputChange('showItemDescription', e.target.checked)}
                />
                Show Item Descriptions
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={template.showItemImages}
                  onChange={(e) => handleInputChange('showItemImages', e.target.checked)}
                />
                Show Item Images
              </label>
            </div>
          </div>

          <div className="editor-section">
            <h3>Footer Content</h3>
            
            <div className="form-group">
              <label>Footer Text</label>
              <input
                type="text"
                value={template.footerText}
                onChange={(e) => handleInputChange('footerText', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Terms & Conditions</label>
              <textarea
                value={template.termsAndConditions}
                onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                className="form-textarea"
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="preview-panel">
          <h3>Live Preview</h3>
          <div className="invoice-preview" style={{
            fontFamily: template.fontFamily,
            fontSize: `${template.fontSize}px`,
            color: '#333'
          }}>
            <div className="invoice-header" style={{ backgroundColor: template.headerColor, color: 'white', padding: '20px' }}>
              <div className="header-content">
                {template.showLogo && template.companyLogo && (
                  <img src={template.companyLogo} alt="Company Logo" className="company-logo" />
                )}
                <h2 style={{ textAlign: 'left', margin: '0 0 10px 0' }}>{template.companyName}</h2>
                {template.showCompanyAddress && (
                  <div className="company-address" style={{ textAlign: 'left' }}>
                    {template.companyAddress.split('\n').map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="invoice-body" style={{ padding: '20px' }}>
              <div className="invoice-info">
                <h3 style={{ color: template.primaryColor }}>Invoice #{previewOrder.id}</h3>
                <p>Date: {new Date(previewOrder.orderDate).toLocaleDateString()}</p>
                <p>Status: <span style={{ color: template.primaryColor }}>{previewOrder.status}</span></p>
              </div>

              {template.showCustomerInfo && (
                <div className="customer-info" style={{ marginTop: '20px' }}>
                  <h4 style={{ color: template.primaryColor }}>Customer Information</h4>
                  <p>Email: {previewOrder.customerEmail}</p>
                  <p>Phone: {previewOrder.customerPhone}</p>
                  <p>Address: {previewOrder.shippingAddress}</p>
                </div>
              )}

              <div className="items-table" style={{ marginTop: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: template.secondaryColor }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Product</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Quantity</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Unit Price</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewOrder.orderItems.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '10px' }}>{item.productName}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>₹{item.unitPrice.toFixed(2)}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>₹{(item.unitPrice * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="invoice-total" style={{ marginTop: '20px', textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: template.primaryColor }}>
                  Total: ₹{previewOrder.totalAmount.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="invoice-footer" style={{ 
              padding: '20px', 
              backgroundColor: template.secondaryColor,
              textAlign: 'center',
              marginTop: '20px'
            }}>
              <p style={{ fontWeight: 'bold', color: template.primaryColor }}>{template.footerText}</p>
              <p style={{ fontSize: '10px', marginTop: '10px' }}>{template.termsAndConditions}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceEditor;
