import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser, sendOTP, loginWithOTP } from '../store/slices/userAuthSlice';
import '../css/Login.css';

export default function Login({ onForgot }) {
  const [loginMode, setLoginMode] = useState('password'); // 'password' or 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ email: 'User1@gmail.com', password: '', otp: '' });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.userAuth);

  useEffect(() => {
    document.title = 'Login | MRC Dealer Portal';
  }, []);

  const handleSendOTP = async () => {
    if (!credentials.email) {
      toast.error('Please enter email or phone number');
      return;
    }
    const result = await dispatch(sendOTP(credentials.email));
    if (sendOTP.fulfilled.match(result)) {
      setOtpSent(true);
      toast.success('OTP sent successfully (Use 123456)');
    } else {
      toast.error(result.payload || 'Failed to send OTP');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (loginMode === 'password') {
      if (!credentials.email || !credentials.password) {
        toast.error('Please fill in all fields');
        return;
      }

      const result = await dispatch(loginUser({
        email: credentials.email,
        password: credentials.password
      }));

      if (loginUser.fulfilled.match(result)) {
        toast.success('Login Successful');
        navigate('/home');
      } else {
        toast.error(result.payload || 'Invalid Credentials');
      }
    } else {
      // OTP Mode
      if (!otpSent) {
        handleSendOTP();
        return;
      }

      if (!credentials.otp) {
        toast.error('Please enter OTP');
        return;
      }

      const result = await dispatch(loginWithOTP({
        email: credentials.email,
        otp: credentials.otp
      }));

      if (loginWithOTP.fulfilled.match(result)) {
        toast.success('Login Successful');
        navigate('/home');
      } else {
        toast.error(result.payload || 'Invalid OTP');
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Left Form Area */}
        <form className="login-form-area" onSubmit={handleSignIn}>
          <h1 className="brand-logo">MRC</h1>

          <div className="welcome-text">
            <h2>Welcome back</h2>
            <p>Access your authorized dealer account to browse products, place orders, and track status.</p>
          </div>

          <div className="login-mode-selector">
            <label>Login with :</label>
            <div className="mode-btns">
              <button
                type="button"
                className={`mode-btn ${loginMode === 'password' ? 'active' : ''}`}
                onClick={() => { setLoginMode('password'); setOtpSent(false); }}
              >
                Password
              </button>
              <button
                type="button"
                className={`mode-btn ${loginMode === 'otp' ? 'active' : ''}`}
                onClick={() => setLoginMode('otp')}
              >
                OTP
              </button>
            </div>
          </div>

          <div className="field">
            <label>Email address / Phone No.</label>
            <input
              type="text"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              placeholder="user@example.com"
              required
            />
          </div>

          {loginMode === 'password' ? (
            <div className="field">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="eye-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ) : (
            otpSent && (
              <div className="field animation-fade-in">
                <label>Enter OTP</label>
                <input
                  type="text"
                  placeholder="6-digit OTP"
                  value={credentials.otp}
                  onChange={(e) => setCredentials({ ...credentials, otp: e.target.value })}
                  maxLength={6}
                  required
                />
              </div>
            )
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : (loginMode === 'otp' && !otpSent ? 'Get OTP' : 'Sign in')}
          </button>

          <div className="form-utils">
            <label className="checkbox-container">
              <input type="checkbox" /> Remember Me
            </label>
            <a href="#" className="forgot-link" onClick={(e) => {
              e.preventDefault();
              onForgot();
            }}>Forgot password</a>
          </div>
        </form>

        {/* Right Visual Area */}
        <div className="login-visual-area">
          <div className="image-container">
            <img src="./pipes.jpg" alt="Pipes" />
            <div className="carousel-indicators">
              <span className="indicator-bar active"></span>
              <span className="indicator-bar"></span>
              <span className="indicator-bar"></span>
              <span className="indicator-bar"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}