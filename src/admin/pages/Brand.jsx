import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBrands, createBrand, updateBrand, deleteBrand } from '../../store/slices/brandSlice';
import DataTable from '../components/DataTable';
import toast from 'react-hot-toast';
import '../css/Admin.css';

const Brand = () => {
    const dispatch = useDispatch();
    const { items: brands, loading } = useSelector((state) => state.brands);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', is_active: true });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);


    useEffect(() => {
        dispatch(fetchBrands());
    }, [dispatch]);

    const headers = [
        {
            key: 'name',
            label: 'Brand',
            render: (val, row) => (
                <div className="d-flex align-items-center gap-3">
                    {row.logo ? (
                        <div className="avatar-square overflow-hidden bg-white border">
                            <img src={row.logo} alt={val} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                    ) : (
                        <div className="avatar-square">{val.charAt(0)}</div>
                    )}
                    <div>
                        <strong>{val}</strong>
                        <div className="text-muted tiny-label">{row.slug}</div>
                    </div>
                </div>
            )
        },
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

    const handleOpenModal = (brand = null) => {
        if (brand) {
            setEditingBrand(brand);
            setFormData({ name: brand.name, description: brand.description || '', is_active: brand.is_active });
            setLogoPreview(brand.logo);
        } else {
            setEditingBrand(null);
            setFormData({ name: '', description: '', is_active: true });
            setLogoPreview(null);
        }
        setLogoFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBrand(null);
        setLogoPreview(null);
        setLogoFile(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('is_active', formData.is_active ? 1 : 0);
        if (logoFile) {
            data.append('logo', logoFile);
        }

        try {
            if (editingBrand) {
                // Laravel multipart workaround for PUT
                data.append('_method', 'PUT');
                await dispatch(updateBrand({ id: editingBrand.id, data })).unwrap();
                toast.success('Brand updated successfully');
            } else {
                await dispatch(createBrand(data)).unwrap();
                toast.success('Brand created successfully');
            }
            dispatch(fetchBrands());
            handleCloseModal();
        } catch (err) {
            console.error('Save error:', err);
            toast.error(typeof err === 'string' ? err : 'Failed to save brand');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (brand) => {
        if (window.confirm(`Are you sure you want to delete "${brand.name}"?`)) {
            dispatch(deleteBrand(brand.id));
            toast.success('Brand removed');
        }
    };

    return (
        <div className="brand-page">
            <h1 className="admin-page-title">Brands Management</h1>
            <DataTable
                headers={headers}
                data={brands}
                totalItems={brands.length}
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
                            <h2 className="modal-title">{editingBrand ? 'Edit Brand' : 'Add New Brand'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="brand-logo-upload-container">
                                    <div
                                        className="logo-preview-box"
                                        onClick={() => document.getElementById('logoInput').click()}
                                    >
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Preview" />
                                        ) : (
                                            <div className="upload-placeholder">
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                                <span>Upload Logo</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        id="logoInput"
                                        type="file"
                                        className="d-none"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    {logoFile && <div className="tiny-label text-success mt-2">✓ {logoFile.name}</div>}
                                </div>

                                <div className="admin-form-group">
                                    <label>Brand Name</label>
                                    <input
                                        type="text"
                                        className="admin-form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Nike, Apple, Samsung"
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>Description (Optional)</label>
                                    <textarea
                                        className="admin-form-input"
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief brand history or philosophy..."
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
                                        'Save Brand'
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

export default Brand;



