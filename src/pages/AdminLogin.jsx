import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogin } from '../store/slices/authSlice';
import '../admin/css/Admin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading: isLoading } = useSelector((state) => state.auth);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  useEffect(() => {
    document.title = 'Admin Login | MRC Management';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Secure admin access for MRC Management System.');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await dispatch(adminLogin(credentials));
    if (adminLogin.fulfilled.match(result)) {
      toast.success('Authentication Successful');
      navigate('/admin');
    } else {
      toast.error(result.payload || 'Unauthorized Access');
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-container">
        <header>
          <h1 className="login-logo" id="admin-login-title">MRC</h1>
          <p className="login-subtitle">Management Control</p>
        </header>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="admin-email">Admin Identifier</label>
            <input
              type="email"
              id="admin-email"
              className="login-input"
              placeholder="name@mrc.com"
              required
              autoComplete="email"
              value={credentials.email}
              onChange={e => setCredentials({ ...credentials, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Secure Password</label>
            <input
              type="password"
              id="admin-password"
              className="login-input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              value={credentials.password}
              onChange={e => setCredentials({ ...credentials, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            id="admin-login-submit"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>

        <footer className="login-footer">
          &copy; {new Date().getFullYear()} MRC Industrial Services
        </footer>
      </div>
    </div>
  );
}