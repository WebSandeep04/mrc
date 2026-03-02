import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import '../css/Admin.css';

const AdminHeader = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { adminUser } = useSelector((state) => state.auth);

    const handleLogout = async () => {
        await dispatch(adminLogout());
        toast.success('Admin Session Ended');
        navigate('/adminlogin');
    };

    return (
        <header className="admin-header">
            {/* Mobile Toggle Button */}
            <button className="mobile-toggle-btn" onClick={toggleSidebar}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>

            {/* Search Bar */}
            <div className="header-search-wrapper">
                {/* <div className="search-icon">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <input
                    type="text"
                    className="header-search-input"
                    placeholder="Search..."
                /> */}
            </div>

            {/* Right Side Actions */}
            <div className="header-right-actions">
                <button className="notification-btn">
                    <div className="notification-dot"></div>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </button>

                <button className="notification-btn logout-admin-btn" onClick={handleLogout} title="Logout Admin">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>

                <div className="admin-profile">
                    <div className="admin-info">
                        <span className="admin-name">{adminUser?.name || 'Super Admin'}</span>
                        <span className="admin-role">System Administrator</span>
                    </div>
                    <div className="admin-avatar">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;