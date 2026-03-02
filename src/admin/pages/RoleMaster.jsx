import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoles, createRole, updateRolePermissions, deleteRole } from '../../store/slices/roleSlice';
import { fetchPermissions } from '../../store/slices/permissionSlice';
import toast from 'react-hot-toast';
import '../css/Admin.css';

const RoleMaster = () => {
    const dispatch = useDispatch();
    const { list: roles, loading: rolesLoading } = useSelector((state) => state.roles);
    const { list: permissions, loading: permissionsLoading } = useSelector((state) => state.permissions);

    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [isAddingRole, setIsAddingRole] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');

    const selectedRole = useMemo(() =>
        roles.find(r => r.id === selectedRoleId),
        [roles, selectedRoleId]);

    useEffect(() => {
        dispatch(fetchRoles());
        dispatch(fetchPermissions());
    }, [dispatch]);

    useEffect(() => {
        if (selectedRole) {
            setSelectedPermissions(selectedRole.permissions ? selectedRole.permissions.map(p => p.id) : []);
        } else {
            setSelectedPermissions([]);
        }
    }, [selectedRole]);

    const handlePermissionToggle = (permissionId) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedPermissions(permissions.map(p => p.id));
        } else {
            setSelectedPermissions([]);
        }
    };

    const handleSavePermissions = async () => {
        if (!selectedRoleId) return;

        try {
            const result = await dispatch(updateRolePermissions({
                id: selectedRoleId,
                permissions: selectedPermissions
            }));

            if (updateRolePermissions.fulfilled.match(result)) {
                toast.success('Permissions updated successfully');
            } else {
                toast.error(result.payload || 'Failed to update permissions');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    const handleAddRole = async (e) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;

        try {
            const result = await dispatch(createRole({ name: newRoleName }));
            if (createRole.fulfilled.match(result)) {
                toast.success('Role created successfully');
                setNewRoleName('');
                setIsAddingRole(false);
                setSelectedRoleId(result.payload.id);
            } else {
                toast.error(result.payload || 'Failed to create role');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    const handleDeleteRole = async (e, role) => {
        e.stopPropagation(); // Prevent selecting the role when clicking delete

        if (window.confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
            try {
                const result = await dispatch(deleteRole(role.id));
                if (deleteRole.fulfilled.match(result)) {
                    toast.success('Role deleted successfully');
                    if (selectedRoleId === role.id) {
                        setSelectedRoleId(null);
                    }
                } else {
                    toast.error(result.payload || 'Failed to delete role');
                }
            } catch (error) {
                toast.error('An unexpected error occurred');
            }
        }
    };

    const isAllSelected = permissions.length > 0 && selectedPermissions.length === permissions.length;

    return (
        <div className="role-master-container">
            {/* Left Sidebar: Select Role */}
            <div className="role-selection-sidebar">
                <div className="sidebar-header-flex">
                    <div className="header-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        SELECT ROLE
                    </div>
                    <button className="add-role-btn" onClick={() => setIsAddingRole(true)} title="Add Role">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>

                {isAddingRole && (
                    <form onSubmit={handleAddRole} className="add-role-form">
                        <input
                            type="text"
                            className="role-input-small"
                            placeholder="Role Name..."
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            autoFocus
                        />
                        <div className="form-actions-small">
                            <button type="submit" className="btn-tiny-primary">Add</button>
                            <button type="button" className="btn-tiny-secondary" onClick={() => setIsAddingRole(false)}>Cancel</button>
                        </div>
                    </form>
                )}

                <div className="role-list">
                    {roles.map(role => (
                        <div
                            key={role.id}
                            className={`role-list-item ${selectedRoleId === role.id ? 'active' : ''}`}
                            onClick={() => setSelectedRoleId(role.id)}
                        >
                            <span>{role.name}</span>
                            <div className="role-item-actions">
                                <button
                                    className="role-delete-btn"
                                    onClick={(e) => handleDeleteRole(e, role)}
                                    title="Delete Role"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chevron-icon">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </div>
                        </div>
                    ))}
                    {roles.length === 0 && !rolesLoading && <div className="p-4 text-center text-gray-400 text-sm">No roles found</div>}
                </div>
            </div>

            {/* Right Main Content: Permissions */}
            <div className="permission-main-content">
                <div className="permission-header">
                    <div className="header-left">
                        Permissions for: <span className="text-primary font-bold">{selectedRole ? selectedRole.name : 'None Selected'}</span>
                    </div>
                    <div className="header-right">
                        <label className="select-all-label">
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                                disabled={!selectedRoleId}
                            />
                            SELECT ALL
                        </label>
                    </div>
                </div>

                <div className="permission-scroll-area">
                    <div className="permission-group-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                        SETUP
                    </div>

                    <div className="permission-cards-grid">
                        {permissions.map(permission => (
                            <div
                                key={permission.id}
                                className={`permission-card ${selectedPermissions.includes(permission.id) ? 'checked' : ''}`}
                                onClick={() => selectedRoleId && handlePermissionToggle(permission.id)}
                            >
                                <div className="checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes(permission.id)}
                                        readOnly
                                    />
                                </div>
                                <div className="permission-info">
                                    <div className="display-name">
                                        {permission.name.split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </div>
                                    <div className="slug-name">{permission.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedRoleId && (
                        <div className="save-action-footer">
                            <button className="btn-save-permissions" onClick={handleSavePermissions}>
                                Save Changes
                            </button>
                        </div>
                    )}

                    {!selectedRoleId && (
                        <div className="empty-state-permissions">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            <p>Select a role from the left to manage permissions</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoleMaster;
