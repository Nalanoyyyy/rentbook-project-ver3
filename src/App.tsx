import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cartoon from './pages/Cartoon';
import BookDetail from './pages/BookDetail';
import Fiction from './pages/Fiction';
import GeneralBooks from './pages/GeneralBooks';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import RentalHistoryPage from './pages/RentalHistory';
import HowToRent from './pages/HowToRent';
import MyCoupons from './pages/MyCoupons';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminOrders from './pages/admin/AdminOrders';
import AdminInventory from './pages/admin/AdminInventory';
import ForgotPassword from './pages/ForgotPassword';
import AdminProducts from './pages/admin/AdminProducts';
import AdminReturns from './pages/admin/AdminReturns';
import AdminNav from './pages/admin/AdminNav';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminCustomers from './pages/admin/AdminCustomers';
import SearchResults from './pages/SearchResults';
import NotFound     from './pages/NotFound';
import WishlistPage from './pages/WishlistPage';
import GoTopButton from './components/GoTopButton';

// import หน้าอื่นๆ ที่สร้างไว้...

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-background-light dark:bg-background-dark font-display text-[#0d1b13] dark:text-white transition-colors duration-200 min-h-screen">
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cartoon" element={<Cartoon />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/fiction" element={<Fiction />} />
          <Route path="/general-books" element={<GeneralBooks />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/rental-history" element={<RentalHistoryPage />} />
          <Route path="/how-to-rent" element={<HowToRent />} />
          <Route path="/coupons" element={<MyCoupons />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/returns" element={<AdminReturns />} />
          <Route path="/admin/*" element={<AdminNav />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/coupons" element={<AdminCoupons />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="*"         element={<NotFound />} />
          {/* เพิ่ม Route สำหรับหน้าต่างๆ ที่สร้างไว้ */}
        </Routes>
      </div>
      <GoTopButton />
    </Router>
  );
};

export default App;