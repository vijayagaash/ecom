import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Admin from './pages/Admin';
import Home from './pages/Home';
import Shop from './pages/Shop';
import AdminDashboard from './pages/AdminDashboard';
import AddProduct from './pages/AddProduct';
import AddEmployee from './pages/AddEmployee';
import AdminLogin from './pages/AdminLogin';
import CustomerAuth from './pages/CustomerAuth';
import ViewCustomer from './pages/ViewCustomer';
import ListProduct from './pages/ListProduct';
import ListEmployee from './pages/ListEmployee';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/add-employee" element={<AddEmployee />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/customer-auth" element={<CustomerAuth />} />
        <Route path="/view-customer" element={<ViewCustomer />} />
        <Route path="/list-product" element={<ListProduct />} />
        <Route path="/list-employee" element={<ListEmployee />} />


      </Routes>
    </Router>
  );
}

export default App;
