import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DataTable from '../components/DataTable';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../store/slices/userSlice';
import toast from 'react-hot-toast';

const User = () => {
    const dispatch = useDispatch();
    const { list: users, loading } = useSelector((state) => state.users);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [isSaving, setIsSaving] = useState(false);


    // Define headers for the user table
    const headers = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Full Name' },
        { key: 'email', label: 'Email Address' },
        {
            key: 'created_at',
            label: 'Registered',
            render: (value) => new Date(value).toLocaleDateString()
        }
    ];

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    const handleOpenModal = (user = null) => {
        if (user) {
            setCurrentUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '' // Keep empty for security
            });
        } else {
            setCurrentUser(null);
            setFormData({
                name: '',
                email: '',
                password: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
        setFormData({ name: '', email: '', password: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let result;
            if (currentUser) {
                result = await dispatch(updateUser({ id: currentUser.id, userData: formData }));
            } else {
                result = await dispatch(createUser(formData));
            }

            if (createUser.fulfilled.match(result) || updateUser.fulfilled.match(result)) {
                toast.success(`User ${currentUser ? 'updated' : 'created'} successfully`);
                handleCloseModal();
            } else {
                toast.error(result.payload || 'Failed to save user');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (user) => {
        if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
            const result = await dispatch(deleteUser(user.id));
            if (deleteUser.fulfilled.match(result)) {
                toast.success('User deleted successfully');
            } else {
                toast.error(result.payload || 'Failed to delete user');
            }
        }
    };

    return (
        <div className="user-page">
            <h1 className="admin-page-title">User Management</h1>
            <DataTable
                headers={headers}
                data={users}
                totalItems={users.length}
                itemsPerPage={10}
                loading={loading}
                onAdd={() => handleOpenModal()}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
            />

            {isModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">{currentUser ? 'Edit User' : 'Add New User'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="admin-form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="admin-form-input"
                                        placeholder="Enter full name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="admin-form-input"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label>{currentUser ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="admin-form-input"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required={!currentUser}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={isSaving || loading}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={isSaving || loading}>
                                    {isSaving ? (
                                        <><span className="spinner"></span> Processing...</>
                                    ) : (
                                        currentUser ? 'Update User' : 'Create User'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default User;