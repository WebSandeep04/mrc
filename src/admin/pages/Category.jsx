import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../store/slices/categorySlice';
import DataTable from '../components/DataTable';
import toast from 'react-hot-toast';
import '../css/Admin.css';

const Category = () => {
    const dispatch = useDispatch();
    const { items, loading } = useSelector((state) => state.categories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', parent_id: '', description: '', is_active: true });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    // Flatten hierarchy recursively to handle infinite nesting
    const flattenCategories = (categories = [], depth = 0, result = []) => {
        categories.forEach(cat => {
            const prefix = depth > 0 ? '\u00A0\u00A0'.repeat(depth) + '↳ ' : '';
            result.push({
                ...cat,
                displayName: prefix + cat.name,
                depth: depth
            });
            if (cat.children && cat.children.length > 0) {
                flattenCategories(cat.children, depth + 1, result);
            }
        });
        return result;
    };

    const flattenedCategories = flattenCategories(items);

    const headers = [
        {
            key: 'displayName',
            label: 'Category Name',
            render: (val, row) => (
                <span style={{ paddingLeft: `${row.depth * 15}px`, fontWeight: row.depth === 0 ? '800' : '500', color: row.depth === 0 ? '#000' : '#444' }}>
                    {val}
                </span>
            )
        },
        { key: 'slug', label: 'Slug' },
        {
            key: 'is_active',
            label: 'Status',
            render: (val) => (
                <span className={`badge ${val ? 'badge-success' : 'badge-danger'}`}>
                    {val ? 'Active' : 'Inactive'}
                </span>
            )
        }
    ];

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                parent_id: category.parent_id || '',
                description: category.description || '',
                is_active: category.is_active
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', parent_id: '', description: '', is_active: true });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSend = {
                ...formData,
                parent_id: formData.parent_id === '' ? null : formData.parent_id
            };
            if (editingCategory) {
                await dispatch(updateCategory({ id: editingCategory.id, data: dataToSend }));
                toast.success('Category updated successfully');
            } else {
                await dispatch(createCategory(dataToSend));
                toast.success('Category created successfully');
            }
            dispatch(fetchCategories());
            handleCloseModal();
        } catch (err) {
            toast.error('Failed to save category');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (cat) => {
        if (window.confirm(`Delete "${cat.name}"? Child categories will be orphaned.`)) {
            dispatch(deleteCategory(cat.id));
            toast.success('Category deleted');
        }
    };

    return (
        <div className="category-page">
            <h1 className="admin-page-title">Categories Management</h1>
            <DataTable
                headers={headers}
                data={flattenedCategories}
                totalItems={flattenedCategories.length}
                itemsPerPage={20}
                loading={loading}
                onAdd={() => handleOpenModal()}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
            />

            {isModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="admin-form-group">
                                    <label>Category Name</label>
                                    <input
                                        type="text"
                                        className="admin-form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Electronics, Clothing"
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>Parent Category</label>
                                    <select
                                        className="admin-form-input"
                                        value={formData.parent_id}
                                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                    >
                                        <option value="">Root (No Parent)</option>
                                        {flattenedCategories.filter(cat => !editingCategory || cat.id !== editingCategory.id).map(opt => (
                                            <option key={opt.id} value={opt.id}>{opt.displayName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label>Description</label>
                                    <textarea
                                        className="admin-form-input"
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description of the category..."
                                    ></textarea>
                                </div>
                                <div className="admin-form-group">
                                    <label className="custom-checkbox-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        />
                                        <div className="checkbox-visual"></div>
                                        <span className="checkbox-label">Active Status</span>
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={isSaving || loading}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={isSaving || loading}>
                                    {isSaving ? (
                                        <><span className="spinner"></span> Saving...</>
                                    ) : (
                                        'Save Category'
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

export default Category;


