import jsPDF from 'jspdf';
import 'jspdf-autotable';

const InvoiceGenerator = () => {
  
  const validateOrderData = (orderData) => {
    if (!orderData) {
      throw new Error('Order data is required');
    }
    if (!orderData.id) {
      throw new Error('Order ID is required');
    }
    if (!orderData.orderDate) {
      orderData.orderDate = new Date().toISOString();
    }
    if (!orderData.totalAmount) {
      orderData.totalAmount = 0;
    }
    if (!orderData.orderItems) {
      orderData.orderItems = [];
    }
    if (!orderData.customerId) {
      orderData.customerId = 'N/A';
    }
    if (!orderData.customerEmail) {
      orderData.customerEmail = 'N/A';
    }
    if (!orderData.shippingAddress) {
      orderData.shippingAddress = 'N/A';
    }
    if (!orderData.status) {
      orderData.status = 'PENDING';
    }
    if (orderData.shippingCost === undefined) {
      orderData.shippingCost = 0;
    }
    if (orderData.tax === undefined) {
      orderData.tax = 0;
    }
    return orderData;
  };
  
  const generateInvoice = (orderData) => {
    orderData = validateOrderData(orderData);
    
    const doc = new jsPDF();
    
    // Company Information
    doc.setFontSize(20);
    doc.setTextColor(31, 41, 55);
    doc.text('E-COM STORE', 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('123 Business Street', 20, 35);
    doc.text('City, State 12345', 20, 42);
    doc.text('Phone: (555) 123-4567', 20, 49);
    doc.text('Email: support@ecomstore.com', 20, 56);
    doc.text('Website: www.ecomstore.com', 20, 63);
    
    // Invoice Title
    doc.setFontSize(24);
    doc.setTextColor(31, 41, 55);
    doc.text('INVOICE', 140, 25);
    
    // Invoice Details
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Invoice #: INV-${orderData.id.toString().padStart(6, '0')}`, 140, 40);
    doc.text(`Date: ${new Date(orderData.orderDate).toLocaleDateString()}`, 140, 47);
    doc.text(`Due Date: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}`, 140, 54);
    doc.text(`Status: ${orderData.status}`, 140, 61);
    
    // Customer Information
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.text('Bill To:', 20, 85);
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Customer ID: ${orderData.customerId}`, 20, 95);
    doc.text(`Email: ${orderData.customerEmail}`, 20, 102);
    doc.text(`Phone: ${orderData.customerPhone || 'N/A'}`, 20, 109);
    
    // Shipping Address
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.text('Ship To:', 20, 125);
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    const shippingLines = doc.splitTextToSize(orderData.shippingAddress, 80);
    let yPos = 135;
    shippingLines.forEach(line => {
      doc.text(line, 20, yPos);
      yPos += 7;
    });
    
    // Order Items Table
    const tableData = orderData.orderItems?.map(item => [
      item.productName || 'N/A',
      item.productDescription?.substring(0, 30) + '...' || 'N/A',
      (item.quantity || 0).toString(),
      `₹${(item.price || item.unitPrice || 0).toFixed(2)}`,
      `₹${(item.totalPrice || 0).toFixed(2)}`
    ]) || [];
    
    doc.autoTable({
      startY: yPos + 15,
      head: [['Product', 'Description', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [31, 41, 55],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [107, 114, 128]
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 60 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });
    
    // Calculate totals
    const subtotal = orderData.orderItems?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;
    const shippingCost = orderData.shippingCost || 0;
    const tax = orderData.tax || 0;
    const total = orderData.totalAmount || subtotal + shippingCost + tax;
    
    // Totals Section
    const finalY = doc.lastAutoTable.finalY + 20;
    const rightX = 140;
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('Subtotal:', rightX, finalY);
    doc.text(`₹${subtotal.toFixed(2)}`, rightX + 50, finalY, { align: 'right' });
    
    doc.text('Shipping:', rightX, finalY + 8);
    doc.text(`₹${shippingCost.toFixed(2)}`, rightX + 50, finalY + 8, { align: 'right' });
    
    doc.text('Tax:', rightX, finalY + 16);
    doc.text(`₹${tax.toFixed(2)}`, rightX + 50, finalY + 16, { align: 'right' });
    
    // Total line
    doc.setDrawColor(31, 41, 55);
    doc.line(rightX, finalY + 20, rightX + 50, finalY + 20);
    
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.setFont(undefined, 'bold');
    doc.text('Total:', rightX, finalY + 30);
    doc.text(`₹${total.toFixed(2)}`, rightX + 50, finalY + 30, { align: 'right' });
    
    // Payment Information
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.setFont(undefined, 'normal');
    doc.text('Payment Method:', 20, finalY + 30);
    doc.text(orderData.paymentMethod || 'N/A', 20, finalY + 37);
    
    if (orderData.trackingNumber) {
      doc.text('Tracking Number:', 20, finalY + 50);
      doc.text(orderData.trackingNumber, 20, finalY + 57);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text('Thank you for your business!', 20, 280);
    doc.text('For questions about this invoice, contact support@ecomstore.com', 20, 287);
    
    // Terms and Conditions
    doc.text('Terms: Payment is due within 30 days. Late payments may be subject to fees.', 20, 294);
    
    return doc;
  };
  
  const downloadInvoice = (orderData) => {
    const doc = generateInvoice(orderData);
    doc.save(`Invoice-${orderData.id}-${new Date().toISOString().split('T')[0]}.pdf`);
  };
  
  const previewInvoice = (orderData) => {
    const doc = generateInvoice(orderData);
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  };
  
  return {
    downloadInvoice,
    previewInvoice,
    generateInvoice
  };
};

export default InvoiceGenerator;
