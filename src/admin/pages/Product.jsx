import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../store/slices/productSlice';
import { fetchBrands } from '../../store/slices/brandSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchAttributes } from '../../store/slices/attributeSlice';
import DataTable from '../components/DataTable';
import toast from 'react-hot-toast';
import '../css/Admin.css';

const Product = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, loading } = useSelector((state) => state.products);
    const brands = useSelector((state) => state.brands.items);
    const categories = useSelector((state) => state.categories.items);
    const attributes = useSelector((state) => state.attributes.items);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '', brand_id: '', category_ids: [], status: 'published',
        variants: [{ sku: '', price: '', stock_quantity: '', attribute_values: [] }]
    });
    const [isSaving, setIsSaving] = useState(false);

    const headers = [
        {
            key: 'name', label: 'Product', render: (val, row) => (
                <div className="product-info-cell">
                    <strong>{val}</strong>
                    <span className="text-muted small d-block">{row.slug}</span>
                </div>
            )
        },
        {
            key: 'category', label: 'Category / Brand', render: (_, row) => (
                <div className="text-sm">
                    <div className="mb-1 d-flex flex-wrap gap-1">
                        {row.categories && row.categories.length > 0 ? (
                            row.categories.map(cat => (
                                <span key={cat.id} className="badge badge-light" style={{ fontSize: '10px' }}>{cat.name}</span>
                            ))
                        ) : (
                            <span className="text-muted">Uncategorized</span>
                        )}
                    </div>
                    <div className="text-muted italic">{row.brand?.name || 'No Brand'}</div>
                </div>
            )
        },
        {
            key: 'min_price', label: 'Price Range', render: (val, row) => (
                <strong>₹{val} {val !== row.max_price && <span className="text-muted"> - ₹{row.max_price}</span>}</strong>
            )
        },
        {
            key: 'variants', label: 'Variants', render: (val) => (
                <span className="count-badge">{val?.length || 0} SKUs</span>
            )
        },
        {
            key: 'status', label: 'Status', render: (val) => (
                <span className={`badge ${val === 'published' ? 'badge-success' : 'badge-warning'}`}>
                    {val}
                </span>
            )
        }
    ];

    useEffect(() => {
        dispatch(fetchProducts());
        dispatch(fetchBrands());
        dispatch(fetchCategories());
        dispatch(fetchAttributes());
    }, [dispatch]);

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                brand_id: product.brand_id || '',
                category_ids: product.categories ? product.categories.map(c => c.id) : [],
                status: product.status,
                variants: product.variants.map(v => ({
                    id: v.id,
                    sku: v.sku,
                    price: v.price,
                    stock_quantity: v.stock_quantity,
                    attribute_values: v.attribute_values ? v.attribute_values.map(a => a.id) : []
                }))
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '', brand_id: '', category_ids: [], status: 'published',
                variants: [{ sku: '', price: '', stock_quantity: '', attribute_values: [] }]
            });
        }
        setIsModalOpen(true);
    };

    const handleAddVariant = () => {
        setFormData({
            ...formData,
            variants: [...formData.variants, { sku: '', price: '', stock_quantity: '', attribute_values: [] }]
        });
    };

    const handleRemoveVariant = (index) => {
        if (formData.variants.length > 1) {
            const newVariants = formData.variants.filter((_, i) => i !== index);
            setFormData({ ...formData, variants: newVariants });
        }
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index][field] = value;
        setFormData({ ...formData, variants: newVariants });
    };

    const handleAttributeToggle = (vIndex, attrValueId) => {
        const newVariants = [...formData.variants];
        const attrValues = newVariants[vIndex].attribute_values;
        if (attrValues.includes(attrValueId)) {
            newVariants[vIndex].attribute_values = attrValues.filter(id => id !== attrValueId);
        } else {
            newVariants[vIndex].attribute_values = [...attrValues, attrValueId];
        }
        setFormData({ ...formData, variants: newVariants });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingProduct) {
                await dispatch(updateProduct({ id: editingProduct.id, data: formData }));
                toast.success('Product updated successfully');
            } else {
                await dispatch(createProduct(formData));
                toast.success('Product published successfully');
            }
            setIsModalOpen(false);
            dispatch(fetchProducts());
        } catch (err) {
            toast.error('Failed to save product');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (prod) => {
        if (window.confirm(`Delete ${prod.name}? This will remove all variants.`)) {
            dispatch(deleteProduct(prod.id));
            toast.success('Product removed');
        }
    };

    return (
        <div className="product-page">
            <h1 className="admin-page-title">Products Catalogue</h1>

            <DataTable
                headers={headers}
                data={items}
                totalItems={items.length}
                itemsPerPage={10}
                loading={loading}
                onAdd={() => navigate('/admin/products/create')}
                onEdit={(item) => navigate(`/admin/products/edit/${item.id}`)}
                onDelete={handleDelete}
            />

            {isModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content large">
                        <div className="modal-header">
                            <h2 className="modal-title">{editingProduct ? 'Edit Product' : 'Create Performance Product'}</h2>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body scrollable">
                                <section className="form-section">
                                    <h4 className="form-section-title">Basic Information</h4>
                                    <div className="form-row">
                                        <div className="admin-form-group col-6">
                                            <label>Product Title</label>
                                            <input type="text" className="admin-form-input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Premium Cotton T-Shirt" />
                                        </div>
                                        <div className="admin-form-group col-3">
                                            <label>Brand</label>
                                            <select className="admin-form-input" value={formData.brand_id} onChange={e => setFormData({ ...formData, brand_id: e.target.value })}>
                                                <option value="">Select Brand</option>
                                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="admin-form-group col-3">
                                            <label>Categories</label>
                                            <div className="category-select-mini" style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid #eee', padding: '5px', borderRadius: '4px' }}>
                                                {categories.map(c => (
                                                    <label key={c.id} className="d-flex align-items-center gap-2 mb-1 cursor-pointer" style={{ fontSize: '11px' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={formData.category_ids.includes(c.id)} 
                                                            onChange={e => {
                                                                const ids = [...formData.category_ids];
                                                                if (e.target.checked) ids.push(c.id);
                                                                else ids.splice(ids.indexOf(c.id), 1);
                                                                setFormData({ ...formData, category_ids: ids });
                                                            }}
                                                        />
                                                        {c.name}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="form-section mt-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h4 className="form-section-title mb-0">Variants (SKUs)</h4>
                                        <button type="button" className="btn-add btn-sm" onClick={handleAddVariant}>+ ADD VARIANT</button>
                                    </div>
                                    {formData.variants.map((variant, vIdx) => (
                                        <div key={vIdx} className="variant-entry-box">
                                            <div className="d-flex justify-content-between mb-3">
                                                <span className="tiny-label">Variant #{vIdx + 1}</span>
                                                {formData.variants.length > 1 && (
                                                    <button type="button" className="text-danger border-0 bg-transparent small" onClick={() => handleRemoveVariant(vIdx)}>Remove</button>
                                                )}
                                            </div>
                                            <div className="form-row">
                                                <div className="admin-form-group col-4">
                                                    <label>SKU Code</label>
                                                    <input type="text" className="admin-form-input" placeholder="e.g. T-SHIRT-RED-L" value={variant.sku} onChange={e => handleVariantChange(vIdx, 'sku', e.target.value)} required />
                                                </div>
                                                <div className="admin-form-group col-4">
                                                    <label>Price (₹)</label>
                                                    <input type="number" className="admin-form-input" placeholder="0.00" value={variant.price} onChange={e => handleVariantChange(vIdx, 'price', e.target.value)} required />
                                                </div>
                                                <div className="admin-form-group col-4">
                                                    <label>Stock Qty</label>
                                                    <input type="number" className="admin-form-input" placeholder="Quantity" value={variant.stock_quantity} onChange={e => handleVariantChange(vIdx, 'stock_quantity', e.target.value)} required />
                                                </div>
                                            </div>
                                            <div className="attribute-selection mt-2">
                                                <label className="tiny-label">Choose Attributes for this Variant</label>
                                                <div className="d-flex flex-wrap gap-3">
                                                    {attributes.map(attr => (
                                                        <div key={attr.id} className="attr-group-mini">
                                                            <span className="tiny-label" style={{ fontSize: '9px' }}>{attr.display_name}:</span>
                                                            <div className="d-flex gap-1 mt-1">
                                                                {attr.values.map(val => (
                                                                    <button
                                                                        key={val.id}
                                                                        type="button"
                                                                        className={`btn-tag ${variant.attribute_values.includes(val.id) ? 'active' : ''}`}
                                                                        onClick={() => handleAttributeToggle(vIdx, val.id)}
                                                                    >
                                                                        {val.value}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </section>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSaving || loading}>Discard</button>
                                <button type="submit" className="btn-primary" disabled={isSaving || loading}>
                                    {isSaving ? (
                                        <><span className="spinner"></span> Processing...</>
                                    ) : (
                                        editingProduct ? 'Update Product' : 'Publish Product'
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

export default Product;


