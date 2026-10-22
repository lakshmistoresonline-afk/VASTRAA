import React, { useEffect } from 'react';
import Home from './pages/home/Home';
import Order from './pages/order/Order';
import Cart from './pages/cart/Cart';
import Account from './pages/account/Account';
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
          <Route path="/" element={<Home />} />
          <Route path="/order" element={<Order />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/allproducts" element={<AllProducts />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRouteForAdmin>
                <Dashboard />
              </ProtectedRouteForAdmin>
            }
          />
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/admin-login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/productinfo/:id" element={<ProductInfo />} />
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
  if (user) {
    return children;
  } else {
    return <Navigate to="/login" />;
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
    return <Navigate to="/admin-login" />;
  }
};
