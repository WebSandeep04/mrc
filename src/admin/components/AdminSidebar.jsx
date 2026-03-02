import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../css/Admin.css';

const AdminSidebar = ({ isCollapsed, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [currentView, setCurrentView] = React.useState('main'); // 'main' or 'setup'

    const { permissions } = useSelector((state) => state.auth);

    // Helper to determine active state
    const isActive = (path) => location.pathname === path;

    const mainItems = [
        {
            name: 'Dashboard',
            path: '/admin',
            permission: 'admin.dashboard',
            icon: <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zM3 14h7v7H3v-7z" />
        },
        {
            name: 'Users',
            path: '/admin/users',
            permission: 'user.index',
            icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        },
        {
            name: 'Products',
            path: '/admin/products',
            permission: 'product.index',
            icon: <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        }
    ];

    const setupItems = [
        {
            name: 'Role Master',
            path: '/admin/roles',
            permission: 'role_master.index',
            icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        },
        {
            name: 'Categories',
            path: '/admin/categories',
            permission: 'category.index',
            icon: <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        },
        {
            name: 'Brands',
            path: '/admin/brands',
            permission: 'brand.index',
            icon: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        },
        {
            name: 'Attributes',
            path: '/admin/attributes',
            permission: 'attribute.index',
            icon: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        },
    ];


    // Filter items based on permissions
    const filteredMainItems = mainItems.filter(item =>
        !item.permission || permissions.includes(item.permission)
    );


    const filteredSetupItems = setupItems.filter(item =>
        !item.permission || permissions.includes(item.permission)
    );

    const hasSetupAccess = filteredSetupItems.length > 0;

    return (
        <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span>MRC Admin</span>
                </div>
                <button className="nav-toggle-btn" onClick={toggleSidebar}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-content-container">
                    {currentView === 'main' ? (
                        /* Main Menu View */
                        <div className="nav-section main-menu-replaced">
                            {filteredMainItems.map((item) => (
                                <div
                                    key={item.name}
                                    className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                                    onClick={() => navigate(item.path)}
                                    title={isCollapsed ? item.name : ''}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: '20px' }}>
                                        {item.icon}
                                        {item.name === 'Users' && <circle cx="9" cy="7" r="4" />}
                                    </svg>
                                    <span>{item.name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Setup Menu View */
                        <div className="nav-section setup-menu-replaced">
                            <div
                                className="sidebar-item back-nav-button"
                                onClick={() => setCurrentView('main')}
                                title={isCollapsed ? 'Back' : ''}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: '20px' }}>
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                <span>Main Menu</span>
                            </div>
                            <div className="setup-header-label">SOFTWARE SETUP</div>
                            {filteredSetupItems.map((item) => (
                                <div
                                    key={item.name}
                                    className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                                    onClick={() => navigate(item.path)}
                                    title={isCollapsed ? item.name : ''}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: '20px' }}>
                                        {item.icon}
                                    </svg>
                                    <span>{item.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-auto">
                    {currentView === 'main' && hasSetupAccess && (
                        <div className="sidebar-setup-trigger-container">
                            <div
                                className="sidebar-item setup-switcher-btn"
                                onClick={() => setCurrentView('setup')}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: '20px' }}>
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                                </svg>
                                <span>Software Setup</span>
                                {!isCollapsed && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chevron-icon-right">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <div className="sidebar-footer">
            </div>
        </aside>
    );
};

export default AdminSidebar;