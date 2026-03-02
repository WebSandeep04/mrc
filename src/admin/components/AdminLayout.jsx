import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import '../css/Admin.css';

const AdminLayout = () => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    // Auto-collapse on mobile
    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsCollapsed(true);
            } else {
                setIsCollapsed(false);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="admin-layout">
            <AdminSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
            <div className="admin-main">
                <AdminHeader toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
