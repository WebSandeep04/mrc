import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Dashboard from '../admin/pages/Dashboard';
import AdminLayout from '../admin/components/AdminLayout';
import User from '../admin/pages/User';
import RoleMaster from '../admin/pages/RoleMaster';
import Brand from '../admin/pages/Brand';
import Category from '../admin/pages/Category';
import Attribute from '../admin/pages/Attribute';
import Product from '../admin/pages/Product';
import CreateProduct from '../admin/pages/CreateProduct';
import AdminLogin from '../pages/AdminLogin';

// User Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { token } = useSelector((state) => state.userAuth);
    if (!token) {
        return <Navigate to="/" replace />;
    }
    return children;
};

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }) => {
    const { token } = useSelector((state) => state.auth);
    if (!token) {
        return <Navigate to="/adminlogin" replace />;
    }
    return children;
};

export default function AppRoutes() {
    const navigate = useNavigate();

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login onForgot={() => navigate('/forgot-password')} />} />
            <Route path="/adminlogin" element={<AdminLogin />} />
            <Route
                path="/forgot-password"
                element={<ForgotPassword onVerify={() => navigate('/home')} />}
            />

            {/* Protected User Routes */}
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/product-details" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />

            {/* Protected Admin Routes */}
            <Route
                path="/admin"
                element={
                    <AdminProtectedRoute>
                        <AdminLayout />
                    </AdminProtectedRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="users" element={<User />} />
                <Route path="roles" element={<RoleMaster />} />
                <Route path="products" element={<Product />} />
                <Route path="products/create" element={<CreateProduct />} />
                <Route path="products/edit/:id" element={<CreateProduct />} />
                <Route path="categories" element={<Category />} />
                <Route path="brands" element={<Brand />} />
                <Route path="attributes" element={<Attribute />} />
            </Route>

            {/* Redirect any unknown routes to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
