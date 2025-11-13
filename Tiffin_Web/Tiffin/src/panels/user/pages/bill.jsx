import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Bill() {
  const navigate = useNavigate();
  const location = useLocation();

  const { 
    cartItems = [], 
    subtotal = 0, 
    gst = 0, 
    total = 0,
    orderId = `ORD${Date.now()}`,
    paymentMethod = "Cash on Delivery",
    customerInfo = {},
    isPreview = false
  } = location.state || {};

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const currentDate = new Date();

  // Enhanced Download Bill functionality
  const downloadBill = () => {
    const billHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - ${orderId} - TiffinZone</title>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.4;
            color: #1f2937;
            background: white;
            padding: 0;
            margin: 0;
            font-size: 12px;
          }
          .bill-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 15px;
          }
          .bill-header {
            background: linear-gradient(135deg, #06b6d4, #3b82f6);
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 15px;
            border-radius: 8px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .invoice-title {
            font-size: 20px;
            font-weight: bold;
            margin: 10px 0;
          }
          .bill-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          .detail-card {
            background: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          }
          .detail-card h3 {
            color: #1e293b;
            margin-bottom: 10px;
            font-size: 14px;
            border-bottom: 1px solid #06b6d4;
            padding-bottom: 3px;
          }
          .detail-item {
            margin-bottom: 5px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
          }
          .detail-label {
            color: #64748b;
            font-weight: 500;
          }
          .detail-value {
            color: #1e293b;
            font-weight: 600;
          }
          .bill-items {
            margin-bottom: 15px;
          }
          .bill-items h3 {
            color: #1e293b;
            margin-bottom: 10px;
            font-size: 14px;
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            font-size: 11px;
          }
          th {
            background: #f1f5f9;
            padding: 8px 5px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 1px solid #06b6d4;
          }
          td {
            padding: 6px 5px;
            border-bottom: 1px solid #f1f5f9;
          }
          .item-name {
            font-weight: 600;
            color: #1e293b;
          }
          .quantity {
            background: #f0fdf4;
            color: #065f46;
            padding: 2px 6px;
            border-radius: 10px;
            font-weight: 600;
            text-align: center;
            font-size: 10px;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .bill-total {
            background: #f8fafc;
            padding: 15px;
            text-align: right;
            border-radius: 6px;
            margin-bottom: 15px;
          }
          .total-container {
            max-width: 250px;
            margin-left: auto;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 11px;
          }
          .grand-total {
            font-size: 14px;
            font-weight: bold;
            color: #065f46;
            margin-top: 5px;
            padding-top: 5px;
            border-top: 1px solid #06b6d4;
          }
          .bill-footer {
            background: #f1f5f9;
            padding: 15px;
            text-align: center;
            color: #64748b;
            border-radius: 6px;
            font-size: 10px;
          }
          .thank-you {
            font-size: 12px;
            color: #065f46;
            margin-bottom: 5px;
            font-weight: 600;
          }
          .print-date {
            margin-top: 5px;
            color: #94a3b8;
          }
          @media print {
            body { 
              padding: 0; 
              margin: 0;
              -webkit-print-color-adjust: exact;
            }
            .bill-container { 
              width: 100%;
              margin: 0;
              padding: 10px;
            }
            .no-print {
              display: none !important;
            }
          }
          .page-break {
            page-break-after: always;
          }
        </style>
      </head>
      <body>
        <div class="bill-container">
          <div class="bill-header">
            <div class="company-name">TiffinZone</div>
            <div>Fresh Food Delivery Service</div>
            <div class="invoice-title">INVOICE</div>
            <div>Order ID: #${orderId}</div>
            <div>${formatDate(currentDate)}</div>
            <div>${isPreview ? "PREVIEW MODE" : "ORDER CONFIRMED"}</div>
          </div>
          
          <div class="bill-details">
            <div class="detail-card">
              <h3>Bill To</h3>
              <div class="detail-item">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${customerInfo.fullName || "Customer"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${customerInfo.email || "Not provided"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${customerInfo.phone || "Not provided"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Address:</span>
                <span class="detail-value">${customerInfo.address || "Not provided"}</span>
              </div>
            </div>
            
            <div class="detail-card">
              <h3>Order Details</h3>
              <div class="detail-item">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">#${orderId}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Order Date:</span>
                <span class="detail-value">${formatDate(currentDate)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${paymentMethod}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Items Count:</span>
                <span class="detail-value">${cartItems.length} items</span>
              </div>
            </div>
          </div>
          
          <div class="bill-items">
            <h3>Order Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Item Details</th>
                  <th class="text-center">Qty</th>
                  <th class="text-right">Price</th>
                  <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${cartItems.map((item, index) => `
                  <tr>
                    <td>
                      <div class="item-name">${item.menu_id?.menu_name || "Delicious Item"}</div>
                    </td>
                    <td class="text-center">
                      <span class="quantity">${item.qty}</span>
                    </td>
                    <td class="text-right">₹${item.menu_id?.menu_price || 0}</td>
                    <td class="text-right">₹${((item.menu_id?.menu_price || 0) * item.qty).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="bill-total">
            <div class="total-container">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${subtotal.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>GST (5%):</span>
                <span>₹${gst.toFixed(2)}</span>
              </div>
              <div class="grand-total">
                <span>Total Amount:</span>
                <span>₹${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div class="bill-footer">
            <div class="thank-you">Thank you for choosing TiffinZone!</div>
            <div>Your delicious food will be delivered within 30-45 minutes</div>
            <div>Contact: support@tiffinzone.com | +91 5674118567</div>
            <div class="print-date">Generated on ${new Date().toLocaleString()}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([billHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TiffinZone-Bill-${orderId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Enhanced Print functionality
  const printBill = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - ${orderId}</title>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.3;
            color: #1f2937;
            background: white;
            padding: 10mm;
            margin: 0;
            font-size: 11px;
            -webkit-print-color-adjust: exact;
          }
          .bill-container {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            background: white;
          }
          .bill-header {
            background: linear-gradient(135deg, #06b6d4, #3b82f6);
            color: white;
            padding: 15px 20px;
            text-align: center;
            margin-bottom: 15px;
            border-radius: 8px;
          }
          .company-name {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .invoice-title {
            font-size: 18px;
            font-weight: bold;
            margin: 8px 0;
          }
          .bill-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 15px;
          }
          .detail-card {
            background: #f8fafc;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          }
          .detail-card h3 {
            color: #1e293b;
            margin-bottom: 8px;
            font-size: 13px;
            border-bottom: 1px solid #06b6d4;
            padding-bottom: 3px;
          }
          .detail-item {
            margin-bottom: 4px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
          }
          .detail-label {
            color: #64748b;
            font-weight: 500;
          }
          .detail-value {
            color: #1e293b;
            font-weight: 600;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            font-size: 10px;
            margin: 10px 0;
          }
          th {
            background: #f1f5f9;
            padding: 6px 4px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 1px solid #06b6d4;
          }
          td {
            padding: 5px 4px;
            border-bottom: 1px solid #f1f5f9;
          }
          .item-name {
            font-weight: 600;
            color: #1e293b;
          }
          .quantity {
            background: #f0fdf4;
            color: #065f46;
            padding: 2px 5px;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            font-size: 9px;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .bill-total {
            background: #f8fafc;
            padding: 12px;
            text-align: right;
            border-radius: 6px;
            margin: 15px 0;
          }
          .total-container {
            max-width: 200px;
            margin-left: auto;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            padding-bottom: 4px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 10px;
          }
          .grand-total {
            font-size: 12px;
            font-weight: bold;
            color: #065f46;
            margin-top: 4px;
            padding-top: 4px;
            border-top: 1px solid #06b6d4;
          }
          .bill-footer {
            background: #f1f5f9;
            padding: 12px;
            text-align: center;
            color: #64748b;
            border-radius: 6px;
            font-size: 9px;
            margin-top: 15px;
          }
          .thank-you {
            font-size: 11px;
            color: #065f46;
            margin-bottom: 4px;
            font-weight: 600;
          }
          @media print {
            body { 
              padding: 5mm;
              margin: 0;
            }
            .bill-container {
              width: 100%;
              margin: 0;
            }
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="bill-container">
          <div class="bill-header">
            <div class="company-name">TiffinZone</div>
            <div>Fresh Food Delivery Service</div>
            <div class="invoice-title">INVOICE</div>
            <div>Order ID: #${orderId}</div>
            <div>${formatDate(currentDate)}</div>
            <div>${isPreview ? "PREVIEW MODE" : "ORDER CONFIRMED"}</div>
          </div>
          
          <div class="bill-details">
            <div class="detail-card">
              <h3>Bill To</h3>
              <div class="detail-item">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${customerInfo.fullName || "Customer"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${customerInfo.email || "Not provided"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${customerInfo.phone || "Not provided"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Address:</span>
                <span class="detail-value">${customerInfo.address || "Not provided"}</span>
              </div>
            </div>
            
            <div class="detail-card">
              <h3>Order Details</h3>
              <div class="detail-item">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">#${orderId}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Order Date:</span>
                <span class="detail-value">${formatDate(currentDate)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${paymentMethod}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Items Count:</span>
                <span class="detail-value">${cartItems.length} items</span>
              </div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item Details</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${cartItems.map(item => `
                <tr>
                  <td class="item-name">${item.menu_id?.menu_name || "Item"}</td>
                  <td class="text-center"><span class="quantity">${item.qty}</span></td>
                  <td class="text-right">₹${item.menu_id?.menu_price || 0}</td>
                  <td class="text-right">₹${((item.menu_id?.menu_price || 0) * item.qty).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="bill-total">
            <div class="total-container">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${subtotal.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>GST (5%):</span>
                <span>₹${gst.toFixed(2)}</span>
              </div>
              <div class="grand-total">
                <span>Total Amount:</span>
                <span>₹${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div class="bill-footer">
            <div class="thank-you">Thank you for choosing TiffinZone!</div>
            <div>Your delicious food will be delivered within 30-45 minutes</div>
            <div>Contact: support@tiffinzone.com | +91 5674118567</div>
            <div>Generated on ${new Date().toLocaleString()}</div>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => {
              if (window.opener) {
                window.close();
              }
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-slate-200">
          <button 
            onClick={() => navigate("/payment", { state: location.state })}
            className="flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            ← Back to Payment
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
              <h1 className="text-4xl font-black text-slate-800 bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                Invoice Bill
              </h1>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-slate-600 font-semibold">
              {isPreview ? "📋 Order Preview - Review before payment" : "✅ Order Confirmation Receipt"}
            </p>
          </div>
          
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white px-6 py-3 rounded-2xl font-bold hover:from-slate-600 hover:to-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            🏠 Home
          </button>
        </div>

        {/* Main Invoice Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-2 border-cyan-100">
          {/* Invoice Header */}
          <div className={`p-10 ${isPreview ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500'} text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-6 md:mb-0">
                <h2 className="text-4xl font-black mb-3 drop-shadow-lg">TiffinZone</h2>
                <p className="text-white/95 text-lg">🍛 Fresh Food Delivery Service</p>
                <p className="text-white/90">📧 contact@tiffinzone.com</p>
                <p className="text-white/90">📞 +91 5674118567</p>
              </div>
              
              <div className="text-center md:text-right bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-3xl font-black mb-2 drop-shadow-lg">INVOICE</h3>
                <p className="text-white/95 font-mono text-lg">#{orderId}</p>
                <p className="text-white/90 font-semibold">{formatDate(currentDate)}</p>
                <p className="text-white/95 font-semibold mt-2">
                  {paymentMethod === "Cash on Delivery" ? "💰 Cash on Delivery" : "💳 UPI Payment"}
                </p>
                <p className="text-white/95 font-semibold">
                  {isPreview ? "👁️ Preview Mode" : "✅ Order Confirmed"}
                </p>
              </div>
            </div>
          </div>

          {/* Customer & Order Details */}
          <div className="p-10 grid md:grid-cols-2 gap-8 border-b border-slate-200 bg-slate-50/50">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">👤 Bill To</h3>
              <div className="space-y-3">
                <div><p className="text-sm text-slate-500">Full Name</p><p className="font-semibold text-slate-900 text-lg">{customerInfo.fullName || "Customer"}</p></div>
                <div><p className="text-sm text-slate-500">Email</p><p className="font-medium text-slate-700">{customerInfo.email || "No email provided"}</p></div>
                <div><p className="text-sm text-slate-500">Phone</p><p className="font-medium text-slate-700">{customerInfo.phone || "No phone provided"}</p></div>
                <div><p className="text-sm text-slate-500">Delivery Address</p><p className="font-medium text-slate-700">{customerInfo.address || "No address provided"}</p></div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">📋 Order Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Order ID:</span>
                  <span className="font-bold text-cyan-600">#{orderId}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Order Date:</span>
                  <span className="font-semibold text-slate-800">{formatDate(currentDate)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Payment Method:</span>
                  <span className="font-semibold text-blue-600 capitalize">{paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Items Count:</span>
                  <span className="font-semibold text-slate-800">{cartItems.length} items</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="p-10">
            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">🍽️ Order Items</h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-lg">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-cyan-50 to-blue-50">
                    <th className="text-left p-4 font-black text-slate-700 text-lg">Item Details</th>
                    <th className="text-center p-4 font-black text-slate-700 text-lg">Quantity</th>
                    <th className="text-right p-4 font-black text-slate-700 text-lg">Unit Price</th>
                    <th className="text-right p-4 font-black text-slate-700 text-lg">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-slate-900 text-lg">{item.menu_id?.menu_name || "Delicious Item"}</p>
                          <p className="text-sm text-slate-500 mt-1">Fresh homemade tiffin • Premium quality</p>
                        </div>
                      </td>
                      <td className="text-center p-4">
                        <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full font-semibold">
                          {item.qty} {item.qty > 1 ? 'plates' : 'plate'}
                        </span>
                      </td>
                      <td className="text-right p-4 font-semibold text-slate-700">₹{item.menu_id?.menu_price || 0}</td>
                      <td className="text-right p-4 font-bold text-cyan-600 text-lg">
                        ₹{((item.menu_id?.menu_price || 0) * item.qty).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Section */}
          <div className="p-10 bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200">
            <div className="max-w-sm ml-auto space-y-4 bg-white rounded-2xl p-6 shadow-xl border border-cyan-100">
              <div className="flex justify-between items-center text-slate-600 pb-3 border-b border-slate-200">
                <span className="font-medium">Subtotal:</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pb-3 border-b border-slate-200">
                <span className="font-medium">GST (5%):</span>
                <span className="font-semibold">₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-2xl font-black text-slate-900 pt-4">
                <span>Total Amount:</span>
                <span className="text-cyan-600">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="p-10 bg-gradient-to-r from-slate-50 to-cyan-50 border-t border-slate-200">
            {isPreview ? (
              <div className="text-center">
                <p className="text-xl font-semibold text-slate-800 mb-4">Ready to place your order? 🚀</p>
                <button 
                  onClick={() => navigate("/payment", { state: location.state })}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {paymentMethod === "Cash on Delivery" ? "Place Order Now" : "Proceed to Payment 💳"}
                </button>
                <p className="text-sm text-slate-600 mt-4">Review your order details above before proceeding</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <p className="text-slate-700 text-lg font-semibold mb-2">Thank you for choosing TiffinZone! 🎉</p>
                <p className="text-slate-600">
                  {paymentMethod === "Cash on Delivery" 
                    ? "Your order has been placed successfully! Pay ₹" + total.toFixed(2) + " when delivered."
                    : "Payment successful! Your delicious food will be delivered within 30-45 minutes."
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          {!isPreview ? (
            <>
              <button 
                onClick={printBill}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🖨️ Print Bill
              </button>
              
              <button 
                onClick={downloadBill}
                className="flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                📥 Download Bill
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate("/cart")}
              className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🛒 Back to Cart
            </button>
          )}
          
          <button 
            onClick={() => navigate("/menu")}
            className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🍽️ Order More
          </button>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8 text-slate-600 text-sm">
          <p>Need help? Contact us at support@tiffinzone.com or call +91 5674118567</p>
          <p className="mt-2">📍 Serving with love since 2024</p>
        </div>
      </div>
    </div>
  );
}

export default Bill;