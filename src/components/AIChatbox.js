import React, { useState, useRef, useEffect } from 'react';
import './AIChatbox.css';

const AIChatbox = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your e-commerce assistant. I can help you with:\n• Product information\n• Order tracking\n• Account management\n• Shopping guidance\n• Technical support\n\nHow can I assist you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [isOpen]);

  const getAIResponse = async (userMessage) => {
    // Enhanced AI responses for e-commerce context with more specific help
    const responses = {
      // Order related
      'order': "I can help you with order-related queries! 📦\n\nYou can:\n• Track your order status in real-time\n• View complete order history\n• Cancel pending orders (if eligible)\n• Get delivery estimates\n• Download invoices\n• Contact support for order issues\n\n💡 Try asking: \"How do I track order #123?\" or \"Where is my order?\"",
      'track': "🔍 To track your order:\n\n1. Click 'View Orders' in the navigation menu\n2. Find your order in the list\n3. Check the status: Pending → Confirmed → Shipped → Delivered\n4. If shipped, you'll see tracking information\n5. Click on order details for more info\n\n📱 You'll also receive SMS/email updates!\n\nNeed help finding a specific order number?",
      'cancel': "❌ Order Cancellation Policy:\n\n✅ You CAN cancel if status is:\n• Pending (within 1 hour)\n• Confirmed (before shipping)\n\n❌ You CANNOT cancel if:\n• Already shipped\n• Out for delivery\n• Delivered\n\n🔄 For shipped orders, you can use our return policy instead.\n\nWant me to guide you through the cancellation process?",
      
      // Product related  
      'product': "🛍️ Product Information & Shopping Help:\n\nOur categories:\n• 👔 Formal wear (₹499-₹699)\n• 👕 Casual clothing (₹399-₹899)\n• 🏠 Home decor (₹299-₹1399)\n• 👜 Accessories & bags (₹649-₹1399)\n• 🎁 Seasonal collections\n\n🔍 Use filters to find exactly what you need!\nWhat type of product interests you?",
      'price': "💰 Our Pricing Structure:\n\n👕 T-shirts: ₹399-₹899\n👔 Formal wear: ₹499-₹699\n🏠 Home decor: ₹299-₹1399\n👜 Accessories: ₹649-₹1399\n\n✨ Special offers:\n• Free shipping on orders above ₹999\n• Bulk discounts available\n• Seasonal sales up to 50% off\n\n💳 All prices include taxes!\nLooking for something specific?",
      'size': "📏 Size Guide Help:\n\n👕 Clothing sizes: XS, S, M, L, XL, XXL\n📊 Each product has detailed size charts\n📐 Measurement guides available\n🔄 Easy exchanges if size doesn't fit\n\n💡 Pro tip: Check the 'Size Guide' tab on product pages!\n\nNeed help with a specific item's sizing?",
      
      // Account related
      'account': "👤 Account Management Help:\n\n🔧 You can:\n• Update profile information\n• Change password securely\n• Manage multiple addresses\n• View complete order history\n• Update payment methods\n• Set preferences\n• Subscribe/unsubscribe from emails\n\n🔐 Security tip: Use strong passwords and enable 2FA!\nWhat account feature needs assistance?",
      'login': "🔐 Login Troubleshooting:\n\n❓ Common issues & solutions:\n• Wrong password → Use 'Forgot Password'\n• Email not recognized → Check spelling\n• Account locked → Contact support\n• Caps lock enabled → Check keyboard\n• Browser issues → Clear cache/cookies\n\n🆔 Remember: Login with your registered email\nStill having trouble? I can guide you step by step!",
      'password': "🔑 Password Help:\n\n🔄 To reset your password:\n1. Click 'Forgot Password' on login page\n2. Enter your registered email\n3. Check your inbox for reset link\n4. Create a strong new password\n\n💪 Strong password tips:\n• Use 8+ characters\n• Mix letters, numbers, symbols\n• Avoid common words\n• Don't reuse old passwords\n\nNeed immediate assistance?",
      
      // Shopping related
      'cart': "🛒 Shopping Cart Features:\n\n✨ Cart benefits:\n• Items saved for 30 days\n• 'Save for Later' option\n• Easy quantity adjustments\n• Price calculations in real-time\n• Secure checkout process\n• Multiple payment options\n\n🔄 You can also:\n• Move items to wishlist\n• Share cart with others\n• Apply discount codes\n\nNeed help with your current cart?",
      'payment': "💳 Payment Options & Security:\n\n✅ We accept:\n• Credit/Debit cards (Visa, MasterCard, RuPay)\n• UPI payments (GPay, PhonePe, Paytm)\n• Net banking (all major banks)\n• Digital wallets\n• Cash on delivery (selected areas)\n\n🔒 Security features:\n• SSL encryption\n• PCI DSS compliance\n• 3D secure authentication\n• No card details stored\n\nPayment not working? Let me help!",
      'shipping': "🚚 Shipping & Delivery Info:\n\n📦 Delivery options:\n• Standard (3-7 business days) - FREE on ₹999+\n• Express (1-3 business days) - ₹99\n• Same day (selected cities) - ₹199\n\n📍 We deliver to:\n• 25,000+ pin codes across India\n• COD available in most areas\n• Real-time tracking provided\n\n📧 You'll get SMS/email updates at every step!\nWant to check delivery to your area?",
      
      // Support related
      'support': "🎧 Customer Support Options:\n\n💬 Live chat: 9 AM - 9 PM (I'm here 24/7!)\n📧 Email: support@ecom.com\n📞 Phone: 1800-123-4567 (toll-free)\n❓ FAQ section with 100+ answers\n\n⚡ For quick help:\n• Order issues → I can help immediately\n• Account problems → Reset options available\n• Product questions → Detailed info provided\n\nWhat specific support do you need?",
      'return': "🔄 Easy Returns Policy:\n\n✅ Return window: 30 days from delivery\n📋 Conditions:\n• Items must be unused/unworn\n• Original packaging required\n• Tags must be attached\n• No damage/stains\n\n🚚 Return process:\n1. Initiate return online\n2. Free pickup scheduled\n3. Quality check (1-2 days)\n4. Refund processed (5-7 days)\n\n💰 Refund goes to original payment method\nWant to start a return?",
      'refund': "💰 Refund Process & Timeline:\n\n⏰ Processing time:\n• Return received: 1-2 days quality check\n• Refund initiated: Instant notification\n• Money in account: 5-7 business days\n\n📧 You'll receive:\n• Return confirmation email\n• Refund initiation email\n• Bank credit notification\n\n💳 Refund methods:\n• Same as payment method\n• Account credit (faster option)\n• Bank transfer (for COD orders)\n\nTracking a specific refund?",
      
      // Invoice related
      'invoice': "📄 Invoice & Bill Generation:\n\n✅ Available features:\n• Download PDF invoices for all orders\n• Professional invoice format with company details\n• Complete order breakdown with taxes & shipping\n• Billing and shipping address details\n• Payment method information\n\n📥 How to access:\n1. Go to 'My Orders' page\n2. Find your order\n3. Click 'View Invoice' button\n4. Preview or download PDF\n\n💡 Invoices include:\n• Order number & date\n• Item details & quantities\n• Pricing breakdown\n• Tax calculations\n• Company information\n\nNeed help finding a specific invoice?",
      'bill': "💳 Billing & Invoice Information:\n\n📋 Our invoices contain:\n• Complete order summary\n• Itemized product list\n• Tax breakdown (GST included)\n• Shipping charges\n• Payment method used\n• Billing & shipping addresses\n\n📱 Access methods:\n• Online: View in 'My Orders'\n• PDF Download: High-quality format\n• Email: Sent automatically on order\n• Print-ready: Professional layout\n\n🔄 Re-download anytime:\n• All past orders available\n• No time limit on access\n• Same invoice format maintained\n\nWhich order invoice do you need?",
      'download': "⬇️ Download Options:\n\n📄 **Invoices:**\n• PDF format (recommended)\n• Print-ready quality\n• Instant download\n• No registration required\n\n💾 **How to download:**\n1. Visit 'My Orders' section\n2. Select your order\n3. Click 'View Invoice'\n4. Choose 'Download Invoice'\n5. PDF saves to your device\n\n✨ **Features:**\n• Professional formatting\n• Company letterhead\n• Complete order details\n• Tax compliant format\n• Multiple download attempts\n\n🔍 **File details:**\n• Format: PDF\n• Size: ~200KB average\n• Compatible: All devices\n• Quality: High resolution\n\nTrouble downloading? I can help!",
      
      // Technical help
      'website': "🌐 Website Help & Tips:\n\n🔍 Navigation tips:\n• Use search bar for quick finds\n• Filter products by price, size, color\n• Sort by popularity, price, ratings\n• Save favorites to wishlist\n\n📱 Mobile app available:\n• Faster checkout\n• Push notifications\n• Exclusive app-only deals\n• Offline browsing\n\nExperiencing any technical issues?",
      'mobile': "📱 Mobile Experience:\n\n📲 Download our app for:\n• 10% extra discount on first order\n• Push notifications for deals\n• Faster checkout with saved cards\n• Wishlist sync across devices\n• Offline product browsing\n\n🔧 Mobile website optimized for:\n• Touch-friendly interface\n• Fast loading\n• Secure mobile payments\n• Easy navigation\n\nApp not working properly?",
      
      // Default responses
      'hello': "👋 Hello! Welcome to our e-commerce store!\n\nI'm your AI shopping assistant, here 24/7 to help with:\n🛍️ Product recommendations\n📦 Order tracking & management\n👤 Account assistance\n💳 Payment & shipping queries\n🔧 Technical support\n\n✨ I know everything about our store and policies!\nWhat can I help you with today?",
      'hi': "Hi there! 😊\n\nI'm your personal shopping assistant! Whether you need help finding the perfect product, tracking an order, or have questions about our policies, I'm here to make your experience amazing!\n\n🎯 Popular questions I can answer:\n• \"What's your return policy?\"\n• \"How do I track my order?\"\n• \"Do you have size guides?\"\n• \"What payment methods do you accept?\"\n\nHow can I assist you?",
      'help': "🆘 I'm here to help! Here's what I can assist with:\n\n🛍️ **Shopping:**\n• Product search & recommendations\n• Size guides & fitting help\n• Price comparisons & deals\n\n📦 **Orders:**\n• Order tracking & status\n• Cancellation & modifications\n• Delivery information\n\n👤 **Account:**\n• Login issues & password reset\n• Profile updates\n• Address management\n\n💳 **Payments & Returns:**\n• Payment options & issues\n• Return process & refunds\n• Shipping information\n\nJust ask me anything!",
      'thanks': "You're absolutely welcome! 😊\n\nI'm always happy to help make your shopping experience smooth and enjoyable. Remember, I'm available 24/7 for any questions!\n\n🌟 Before you go:\n• Check out our current deals\n• Join our newsletter for exclusive offers\n• Download our mobile app for extra discounts\n\nAnything else I can help you with today?",
      'bye': "Goodbye and thank you for shopping with us! 👋\n\n🛍️ Don't forget to:\n• Complete any pending orders\n• Check your wishlist\n• Subscribe for deal notifications\n\n💬 I'm always here when you need assistance. Have a wonderful shopping experience!\n\n✨ Happy shopping! ✨"
    };

    // Advanced keyword matching with context
    const lowerMessage = userMessage.toLowerCase();
    
    // Priority matching for specific phrases
    if (lowerMessage.includes('track') && lowerMessage.includes('order')) {
      return responses['track'];
    }
    if (lowerMessage.includes('cancel') && lowerMessage.includes('order')) {
      return responses['cancel'];
    }
    if (lowerMessage.includes('return') || lowerMessage.includes('exchange')) {
      return responses['return'];
    }
    if (lowerMessage.includes('refund') || lowerMessage.includes('money back')) {
      return responses['refund'];
    }
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return responses['payment'];
    }
    if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      return responses['shipping'];
    }
    if (lowerMessage.includes('size') || lowerMessage.includes('fitting')) {
      return responses['size'];
    }
    if (lowerMessage.includes('login') || lowerMessage.includes('sign in')) {
      return responses['login'];
    }
    if (lowerMessage.includes('password') || lowerMessage.includes('forgot')) {
      return responses['password'];
    }
    
    // General keyword matching
    for (const [keyword, response] of Object.entries(responses)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }

    // Enhanced contextual default response
    return `🤔 I understand you're asking about: "${userMessage}"\n\n🎯 I'm specialized in helping with e-commerce queries! Here are some ways I can assist:\n\n🛍️ **Shopping Help:**\n• "Show me formal wear options"\n• "What's the price range for t-shirts?"\n• "Do you have size guides?"\n\n📦 **Order Management:**\n• "How do I track my order?"\n• "Can I cancel my order?"\n• "What's your delivery time?"\n\n💳 **Payments & Returns:**\n• "What payment methods do you accept?"\n• "How do I return an item?"\n• "When will I get my refund?"\n\n👤 **Account Support:**\n• "I can't log in to my account"\n• "How do I change my password?"\n• "How do I update my address?"\n\n💡 **Pro tip:** Try asking specific questions like "What's your return policy?" or "How do I track order #123?" for instant detailed answers!\n\nWhat specific help do you need today?`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI thinking time
    setTimeout(async () => {
      const aiResponse = await getAIResponse(inputMessage);
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Chat cleared! I'm still here to help you with any e-commerce questions. What can I assist you with?",
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chatbox-overlay">
      <div className="ai-chatbox">
        {/* Header */}
        <div className="chatbox-header">
          <div className="header-info">
            <div className="ai-avatar">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="ai-info">
              <h3>AI Assistant</h3>
              <span className="status">Online</span>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="clear-btn" 
              onClick={clearChat}
              title="Clear chat"
            >
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className="close-btn" 
              onClick={onClose}
              title="Close chat"
            >
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbox-messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-content">
                <div className="message-text">
                  {message.text.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
                <div className="message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message ai-message">
              <div className="message-content">
                <span>Thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chatbox-input">
          <div className="input-container">
            <input
              ref={chatInputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your shopping experience..."
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={!inputMessage.trim() || isLoading}
              className="send-btn"
            >
              {isLoading ? 'Sending...' : (
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <path d="m22 2-7 20-4-9-9-4 20-7z" fill="currentColor"/>
                </svg>
              )}
            </button>
          </div>
          <div className="input-footer">
            <small>💡 Try asking: "Track my order", "Return policy", "Product sizes"</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbox;
