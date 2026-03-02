import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, updateProduct } from '../../store/slices/productSlice';
import api from '../../services/api';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchBrands } from '../../store/slices/brandSlice';
import { fetchAttributes } from '../../store/slices/attributeSlice';
import toast from 'react-hot-toast';
import '../css/Admin.css';

const CreateProduct = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();

    const { loading: categoriesLoading, items: categories } = useSelector((state) => state.categories);
    const { items: brands } = useSelector((state) => state.brands);
    const { items: attributesList } = useSelector((state) => state.attributes);

    // Product State Let's keep it similar to WP
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [price, setPrice] = useState('');
    const [compareAtPrice, setCompareAtPrice] = useState('');
    const [sku, setSku] = useState('');
    const [barcode, setBarcode] = useState('');
    const [weight, setWeight] = useState('');
    const [dimensions, setDimensions] = useState('');
    const [stockQuantity, setStockQuantity] = useState('');
    const [status, setStatus] = useState('draft'); // Default correctly to draft based on schema
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [brandId, setBrandId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const [selectedAttributes, setSelectedAttributes] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchBrands());
        dispatch(fetchAttributes());
    }, [dispatch]);

    // Auto-generate slug from title
    useEffect(() => {
        if (title && !slug && !id) {
            setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [title, slug, id]);

    // Fetch product for edit
    useEffect(() => {
        if (id) {
            setIsLoadingData(true);
            api.get(`/products/${id}`)
                .then(response => {
                    const data = response.data;
                    setTitle(data.name || '');
                    setSlug(data.slug || '');
                    setDescription(data.long_description || '');
                    setShortDescription(data.short_description || '');
                    setStatus(data.status || 'draft');
                    setSeoTitle(data.seo_title || '');
                    setSeoDescription(data.seo_description || '');
                    setBrandId(data.brand_id || '');
                    if (data.category_id) setSelectedCategories([data.category_id]);

                    if (data.variants && data.variants.length > 0) {
                        const firstVariant = data.variants[0];
                        // Always populate the primary state from whatever min/first variant is to prevent empty variables on tab switching
                        setSku(firstVariant.sku || '');
                        setBarcode(firstVariant.barcode || '');
                        setPrice(data.variants.length === 1 ? (firstVariant.price || '') : (data.min_price || ''));
                        setCompareAtPrice(firstVariant.compare_at_price || '');
                        setStockQuantity(data.variants.reduce((sum, v) => sum + parseInt(v.stock_quantity || 0), 0));
                        setWeight(firstVariant.weight || '');
                        setDimensions(firstVariant.dimensions || '');

                        // Safely extract matched attributes for editing to map to UI
                        const uiAttrsMap = {};
                        data.variants.forEach(v => {
                            (v.attribute_values || []).forEach(av => {
                                if (!uiAttrsMap[av.attribute_id]) {
                                    uiAttrsMap[av.attribute_id] = new Set();
                                }
                                uiAttrsMap[av.attribute_id].add(av.id);
                            });
                        });
                        const remappedAttributes = Object.keys(uiAttrsMap).map(attrId => ({
                            id: parseInt(attrId),
                            name: 'Loaded Attribute', // Resolved in render
                            values: Array.from(uiAttrsMap[attrId])
                        }));
                        setSelectedAttributes(remappedAttributes);
                    }
                })
                .catch(err => {
                    toast.error("Failed to load product details");
                })
                .finally(() => {
                    setIsLoadingData(false);
                });
        }
    }, [id]);

    const handleCategoryChange = (categoryId) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const renderNestedCategories = (cats, depth = 0) => {
        return cats.map(cat => (
            <div key={cat.id} style={{ paddingLeft: `${depth * 16}px`, marginBottom: '8px' }}>
                <label className="custom-checkbox-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => handleCategoryChange(cat.id)}
                    />
                    <span className="checkbox-visual"></span>
                    <span style={{ fontSize: '13px', color: '#333' }}>{cat.name}</span>
                </label>
                {cat.children && cat.children.length > 0 && renderNestedCategories(cat.children, depth + 1)}
            </div>
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title) {
            toast.error("Product title is required.");
            return;
        }

        setIsSaving(true);
        try {
            const formData = {
                name: title,
                slug,
                long_description: description,
                short_description: shortDescription,
                brand_id: brandId || null,
                category_id: selectedCategories.length > 0 ? selectedCategories[0] : null, // WP allows multiple, but your DB might expect one. We send first for compatibility or adjust based on DB structure.
                status,
                seo_title: seoTitle,
                seo_description: seoDescription,
                type: 'simple',
                variants: [
                    {
                        sku: sku,
                        barcode: barcode,
                        price: price,
                        compare_at_price: compareAtPrice,
                        stock_quantity: stockQuantity,
                        weight: weight,
                        dimensions: dimensions,
                        attribute_values: selectedAttributes.flatMap(a => a.values)
                    }
                ]
            };

            if (id) {
                await dispatch(updateProduct({ id, data: formData }));
                toast.success("Product updated successfully");
            } else {
                await dispatch(createProduct(formData));
                toast.success("Product published successfully");
            }

            navigate('/admin/products');
        } catch (error) {
            toast.error(id ? "Failed to update product" : "Failed to create product");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="admin-loader-container">
                <div className="admin-loader"></div>
                <div className="admin-loader-text">Loading Product Data...</div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="wp-editor-layout">
            {/* Header */}
            <div className="editor-header">
                <div>
                    <h1 className="admin-page-title m-0">{id ? 'Edit Product' : 'Add New Product'}</h1>
                </div>
                <div className="editor-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/admin/products')}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={isSaving}>
                        {isSaving ? (
                            <><span className="spinner"></span>Publishing...</>
                        ) : 'Publish'}
                    </button>
                </div>
            </div>

            <div className="editor-body">
                {/* Main Content (70%) */}
                <div className="editor-main">
                    <div className="editor-card padding-card">
                        <div className="form-group mb-4">
                            <input
                                type="text"
                                className="title-input"
                                placeholder="Product Name"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="form-group d-flex align-items-center gap-2 mb-4" style={{ fontSize: '13px', color: '#666' }}>
                            <strong>Permalink:</strong> {window.location.host}/product/
                            <input
                                type="text"
                                className="slug-input"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="product-slug"
                            />
                        </div>

                        <div className="form-group mb-4">
                            <label className="editor-label">Product Description</label>
                            <textarea
                                className="editor-textarea"
                                rows="8"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter rich product description here..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="editor-card product-data-card">
                        <div className="product-data-header">
                            <h2 className="editor-card-title m-0">Product Data</h2>
                        </div>

                        <div className="product-data-body d-flex">
                            <div className="product-data-tabs">
                                <div className={`pd-tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General</div>
                                <div className={`pd-tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>Inventory</div>
                                <div className={`pd-tab ${activeTab === 'shipping' ? 'active' : ''}`} onClick={() => setActiveTab('shipping')}>Shipping</div>
                                <div className={`pd-tab ${activeTab === 'attributes' ? 'active' : ''}`} onClick={() => setActiveTab('attributes')}>Attributes</div>
                            </div>
                            <div className="product-data-content">
                                {activeTab === 'general' && (
                                    <div className="pd-panel">
                                        <div className="pd-row">
                                            <label>Selling price (₹)</label>
                                            <input type="number" className="editor-input" value={price} onChange={e => setPrice(e.target.value)} />
                                        </div>
                                        <div className="pd-row">
                                            <label>Compare at price (₹)</label>
                                            <input type="number" className="editor-input" value={compareAtPrice} onChange={e => setCompareAtPrice(e.target.value)} />
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'inventory' && (
                                    <div className="pd-panel">
                                        <div className="pd-row">
                                            <label>SKU</label>
                                            <input type="text" className="editor-input" value={sku} onChange={e => setSku(e.target.value)} />
                                        </div>
                                        <div className="pd-row">
                                            <label>Barcode</label>
                                            <input type="text" className="editor-input" value={barcode} onChange={e => setBarcode(e.target.value)} />
                                        </div>
                                        <div className="pd-row">
                                            <label>Stock quantity</label>
                                            <input type="number" className="editor-input" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} />
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'shipping' && (
                                    <div className="pd-panel">
                                        <div className="pd-row">
                                            <label>Weight (kg)</label>
                                            <input type="number" step="0.01" className="editor-input" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0.00" />
                                        </div>
                                        <div className="pd-row">
                                            <label>Dimensions (LxWxH)</label>
                                            <input type="text" className="editor-input" value={dimensions} onChange={e => setDimensions(e.target.value)} placeholder="e.g. 10x10x5 cm" />
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'attributes' && (
                                    <div className="pd-panel">
                                        <div className="d-flex align-items-center mb-4 gap-2">
                                            <select
                                                className="editor-select auto-width"
                                                id="attribute-to-add"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Custom product attribute</option>
                                                {attributesList.map(attr => (
                                                    <option key={attr.id} value={attr.id}>{attr.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                className="btn-secondary"
                                                onClick={() => {
                                                    const selectEl = document.getElementById('attribute-to-add');
                                                    const attrId = parseInt(selectEl.value);
                                                    if (attrId && !selectedAttributes.find(a => a.id === attrId)) {
                                                        const attr = attributesList.find(a => a.id === attrId);
                                                        setSelectedAttributes([...selectedAttributes, { id: attr.id, name: attr.name, values: [] }]);
                                                    }
                                                }}
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="attributes-list">
                                            {selectedAttributes.map((selectedAttr, idx) => {
                                                const globalAttr = attributesList.find(a => a.id === selectedAttr.id);
                                                return (
                                                    <div key={selectedAttr.id} className="editor-card mb-3 padding-card" style={{ background: '#f6f7f7' }}>
                                                        <div className="editor-card-title d-flex justify-content-between align-items-center mb-3" style={{ background: 'transparent', padding: 0, border: 'none' }}>
                                                            <strong style={{ fontSize: '14px', color: '#1d2327' }}>{globalAttr ? globalAttr.name : selectedAttr.name}</strong>
                                                            <button
                                                                type="button"
                                                                className="text-danger"
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                                                                onClick={() => setSelectedAttributes(selectedAttributes.filter(a => a.id !== selectedAttr.id))}
                                                            >Remove</button>
                                                        </div>
                                                        <div className="d-flex flex-wrap gap-4 mt-2">
                                                            {globalAttr?.values?.map(val => (
                                                                <label key={val.id} className="custom-checkbox-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedAttr.values.includes(val.id)}
                                                                        onChange={(e) => {
                                                                            const newAttrs = [...selectedAttributes];
                                                                            if (e.target.checked) {
                                                                                newAttrs[idx].values.push(val.id);
                                                                            } else {
                                                                                newAttrs[idx].values = newAttrs[idx].values.filter(v => v !== val.id);
                                                                            }
                                                                            setSelectedAttributes(newAttrs);
                                                                        }}
                                                                    />
                                                                    <span className="checkbox-visual"></span>
                                                                    <span style={{ fontSize: '13px', color: '#50575e' }}>{val.value}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                    <div className="editor-card padding-card">
                        <h2 className="editor-card-title m-0 mb-3" style={{ borderBottom: 'none', padding: 0 }}>Product Short Description</h2>
                        <textarea
                            className="editor-textarea"
                            rows="4"
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                            placeholder="Enter a brief excerpt..."
                        ></textarea>
                    </div>

                    <div className="editor-card padding-card">
                        <h2 className="editor-card-title m-0 mb-3" style={{ borderBottom: 'none', padding: 0 }}>SEO Meta Data</h2>
                        <div className="form-group mb-4">
                            <label className="editor-label">SEO Title</label>
                            <input
                                type="text"
                                className="title-input"
                                style={{ fontSize: '15px', padding: '6px 10px' }}
                                value={seoTitle}
                                onChange={(e) => setSeoTitle(e.target.value)}
                            />
                        </div>
                        <div className="form-group mb-4">
                            <label className="editor-label">SEO Description</label>
                            <textarea
                                className="editor-textarea"
                                rows="3"
                                value={seoDescription}
                                onChange={(e) => setSeoDescription(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Sidebar (30%) */}
                <div className="editor-sidebar">
                    <div className="editor-card sidebar-card">
                        <div className="sidebar-header">
                            <h3 className="editor-card-title m-0">Publish</h3>
                        </div>
                        <div className="sidebar-body">
                            <div className="sb-row">
                                <span className="sb-label">Status:</span>
                                <select className="editor-select" value={status} onChange={e => setStatus(e.target.value)}>
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                        </div>
                        <div className="sidebar-footer">
                            <button type="submit" className="btn-primary w-100" disabled={isSaving}>
                                {isSaving ? <><span className="spinner"></span>Publishing...</> : 'Publish'}
                            </button>
                        </div>
                    </div>

                    <div className="editor-card sidebar-card">
                        <div className="sidebar-header">
                            <h3 className="editor-card-title m-0">Product Categories</h3>
                        </div>
                        <div className="sidebar-body px-0" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <div className="category-tree px-3 pb-3">
                                {categoriesLoading ? 'Loading...' : renderNestedCategories(categories)}
                            </div>
                        </div>
                    </div>

                    <div className="editor-card sidebar-card">
                        <div className="sidebar-header">
                            <h3 className="editor-card-title m-0">Brand</h3>
                        </div>
                        <div className="sidebar-body">
                            <select className="editor-select" value={brandId} onChange={e => setBrandId(e.target.value)}>
                                <option value="">Select a brand...</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="editor-card sidebar-card">
                        <div className="sidebar-header">
                            <h3 className="editor-card-title m-0">Product Image</h3>
                        </div>
                        <div className="sidebar-body text-center">
                            <div className="image-upload-area">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '10px' }}>
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                <div>Click to browse or drop an image here</div>
                                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>PNG, JPG, WEBP up to 2MB</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default CreateProduct;
