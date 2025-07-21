import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Admin from './pages/Admin';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderConfirmation from './pages/OrderConfirmation';
import Product from './pages/Product';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AddProduct from './pages/AddProduct';
import AddEmployee from './pages/AddEmployee';
import AdminLogin from './pages/AdminLogin';
import CustomerAuth from './pages/CustomerAuth';
import ViewCustomer from './pages/ViewCustomer';
import ListProduct from './pages/ListProduct';
import ListEmployee from './pages/ListEmployee';
import InvoiceEditor from './pages/InvoiceEditor';
import AIAssistant from './components/AIAssistant';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-orders" element={<AdminOrders />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/add-employee" element={<AddEmployee />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/customer-auth" element={<CustomerAuth />} />
        <Route path="/view-customer" element={<ViewCustomer />} />
        <Route path="/list-product" element={<ListProduct />} />
        <Route path="/list-employee" element={<ListEmployee />} />
        <Route path="/admin/invoice-editor" element={<InvoiceEditor />} />
      </Routes>
      
      {/* AI Assistant - Available on all pages */}
      <AIAssistant />
    </Router>
  );
}

export default App;
