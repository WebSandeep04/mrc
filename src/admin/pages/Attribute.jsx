import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttributes, createAttribute, updateAttribute, deleteAttribute } from '../../store/slices/attributeSlice';
import DataTable from '../components/DataTable';
import toast from 'react-hot-toast';
import '../css/Admin.css';

const Attribute = () => {
    const dispatch = useDispatch();
    const { items: attributes, loading } = useSelector((state) => state.attributes);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAttr, setEditingAttr] = useState(null);
    const [formData, setFormData] = useState({ name: '', display_name: '', type: 'select', values: [] });
    const [newValue, setNewValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);


    useEffect(() => {
        dispatch(fetchAttributes());
    }, [dispatch]);

    const headers = [
        { key: 'name', label: 'Internal Name (Code)' },
        { key: 'display_name', label: 'Display Label' },
        {
            key: 'values',
            label: 'Configuration Values',
            render: (values) => (
                <div className="d-flex flex-wrap gap-1">
                    {values && values.slice(0, 5).map(v => (
                        <span className="chip" key={v.id}>{v.value}</span>
                    ))}
                    {values && values.length > 5 && (
                        <span className="text-muted small">+{values.length - 5} more</span>
                    )}
                </div>
            )
        },
        {
            key: 'type',
            label: 'Type',
            render: (val) => (
                <span className="badge badge-warning" style={{ fontSize: '9px' }}>{val.toUpperCase()}</span>
            )
        }
    ];

    const handleOpenModal = (attr = null) => {
        if (attr) {
            setEditingAttr(attr);
            setFormData({
                name: attr.name,
                display_name: attr.display_name,
                type: attr.type,
                values: attr.values ? attr.values.map(v => v.value) : []
            });
        } else {
            setEditingAttr(null);
            setFormData({ name: '', display_name: '', type: 'select', values: [] });
        }
        setNewValue('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAttr(null);
    };

    const addValueChip = () => {
        if (newValue.trim() && !formData.values.includes(newValue.trim())) {
            setFormData({ ...formData, values: [...formData.values, newValue.trim()] });
            setNewValue('');
        }
    };

    const removeValueChip = (val) => {
        setFormData({ ...formData, values: formData.values.filter(v => v !== val) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSend = {
                ...formData,
                values: formData.values.map(v => ({ value: v }))
            };
            if (editingAttr) {
                await dispatch(updateAttribute({ id: editingAttr.id, data: dataToSend }));
                toast.success('Attribute updated successfully');
            } else {
                await dispatch(createAttribute(dataToSend));
                toast.success('New attribute added successfully');
            }
            dispatch(fetchAttributes());
            handleCloseModal();
        } catch (err) {
            toast.error('Failed to save attribute');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (attr) => {
        if (window.confirm(`Delete attribute "${attr.display_name}"? This might impact product variants.`)) {
            dispatch(deleteAttribute(attr.id));
            toast.success('Attribute removed');
        }
    };

    return (
        <div className="attribute-page">
            <h1 className="admin-page-title">Configurable Attributes</h1>
            <DataTable
                headers={headers}
                data={attributes}
                totalItems={attributes.length}
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
                            <h2 className="modal-title">{editingAttr ? 'Edit Attribute' : 'Create New Attribute'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="admin-form-group">
                                    <label>Internal Name (Code)</label>
                                    <input
                                        type="text"
                                        className="admin-form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. storage_capacity"
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>Display Label</label>
                                    <input
                                        type="text"
                                        className="admin-form-input"
                                        value={formData.display_name}
                                        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                        placeholder="e.g. Storage Capacity"
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>Input Type</label>
                                    <select
                                        className="admin-form-input"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="select">Dropdown Select</option>
                                        <option value="text">Text Input</option>
                                        <option value="swatch">Color Swatch</option>
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label>Values Configuration</label>
                                    <div className="chip-input-container">
                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                            {formData.values.map(v => (
                                                <span className="chip" key={v}>
                                                    {v} <i className="ms-2 opacity-50 cursor-pointer" onClick={() => removeValueChip(v)}>&times;</i>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="input-group d-flex gap-2">
                                            <input
                                                type="text"
                                                className="admin-form-input"
                                                placeholder="Enter value and press enter"
                                                value={newValue}
                                                onChange={(e) => setNewValue(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addValueChip())}
                                            />
                                            <button type="button" className="btn-secondary px-3" onClick={addValueChip}>ADD</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={isSaving || loading}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={isSaving || loading}>
                                    {isSaving ? (
                                        <><span className="spinner"></span> Processing...</>
                                    ) : (
                                        'Save Attribute'
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

export default Attribute;


