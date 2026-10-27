import React, { useEffect } from 'react';
import Home from './pages/home/Home';
import Cart from './pages/cart/Cart';
import Account from './pages/account/Account';
import PurchaseJourney from './pages/purchaseJourney/PurchaseJourney';
import Dashboard from './pages/admin/dashborad/Dashboard';
import Signup from './pages/registration/Signup';
import Login from './pages/registration/Login';
import CustomerLogin from './pages/registration/CustomerLogin';
import NoPage from './pages/noPage/NoPage';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation
} from 'react-router-dom';
import MyState from './context/data/myState';
import AddProduct from './pages/admin/pages/AddProduct';
import UpdateProduct from './pages/admin/pages/UpdateProduct';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/ReactToastify.css';
import ProductInfo from './pages/product/productInfo';
import AllProducts from './pages/allProducts/AllProducts';
import Wishlist from './pages/wishlist/Wishlist';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => {
  return (
    <MyState>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Mandatory Auth Gate: All Storefront Routes Protected */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/order" element={<Navigate to="/purchase-journey" replace />} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/purchase-journey" element={<ProtectedRoute><PurchaseJourney /></ProtectedRoute>} />
          <Route path="/allproducts" element={<ProtectedRoute><AllProducts /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/productinfo/:id" element={<ProtectedRoute><ProductInfo /></ProtectedRoute>} />

          {/* Authentication Routes */}
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/admin-login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRouteForAdmin>
                <Dashboard />
              </ProtectedRouteForAdmin>
            }
          />
          <Route
            path="/addproduct"
            element={
              <ProtectedRouteForAdmin>
                <AddProduct />
              </ProtectedRouteForAdmin>
            }
          />
          <Route
            path="/updateproduct"
            element={
              <ProtectedRouteForAdmin>
                <UpdateProduct />
              </ProtectedRouteForAdmin>
            }
          />
          <Route path="/*" element={<NoPage />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </MyState>
  );
};

export default App;

export const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();
  const allowedAdmins = [
    "admin@gmail.com",
    "lakshmistoresonline@gmail.com",
    "admin@vastraa.com",
    "admin@lakshmistores.com",
    "aliali@gmail.com"
  ];

  if (user) {
    if (user.user && allowedAdmins.includes(user.user.email) && location.pathname === '/' && !location.search.includes('preview=true')) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export const ProtectedRouteForAdmin = ({ children }) => {
  const admin = JSON.parse(localStorage.getItem('user'));
  const allowedAdmins = [
    "admin@gmail.com",
    "lakshmistoresonline@gmail.com",
    "admin@vastraa.com",
    "admin@lakshmistores.com",
    "aliali@gmail.com"
  ];

  if (admin && admin.user && allowedAdmins.includes(admin.user.email)) {
    return children;
  } else {
    return <Navigate to="/admin-login" replace />;
  }
};
