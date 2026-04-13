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

    // Product State 
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [compareAtPrice, setCompareAtPrice] = useState('');
    const [sku, setSku] = useState('');
    const [stockQuantity, setStockQuantity] = useState('');
    const [status, setStatus] = useState('draft'); // Default correctly to draft based on schema
    const [brandIds, setBrandIds] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [variants, setVariants] = useState([]); // Array of {sku, price, stock, attribute_values: []}

    const [selectedAttributes, setSelectedAttributes] = useState([]);
    const [productType, setProductType] = useState('simple');
    const [productImages, setProductImages] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState([]);
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
                    setStatus(data.status || 'draft');
                    setProductType(data.type || 'simple');
                    if (data.brands) setBrandIds(data.brands.map(b => b.id));
                    if (data.categories) {
                        setSelectedCategories(data.categories.map(c => c.id));
                    }

                    if (data.variants && data.variants.length > 0) {
                        const firstVariant = data.variants[0];
                        setSku(firstVariant.sku || '');
                        setPrice(firstVariant.price || '');
                        setCompareAtPrice(firstVariant.compare_at_price || '');
                        setStockQuantity(firstVariant.stock_quantity || '');

                        // Load the variants table for variable products
                        if (data.type === 'variable') {
                            const formattedVariants = data.variants.map(v => ({
                                id: v.id,
                                label: (v.attribute_values || []).map(av => av.value).join(', ') || 'Variant',
                                sku: v.sku,
                                price: v.price,
                                stock_quantity: v.stock_quantity,
                                file_path: v.images?.[0]?.file_path || '',
                                attribute_values: (v.attribute_values || []).map(av => av.id)
                            }));
                            setVariants(formattedVariants);
                            setActiveTab('attributes'); // Default to attributes for variable
                        }

                        // Reconstruct selectedAttributes for UI
                        const uiAttrsMap = {};
                        data.variants.forEach(v => {
                            (v.attribute_values || []).forEach(av => {
                                if (!uiAttrsMap[av.attribute_id]) {
                                    uiAttrsMap[av.attribute_id] = {
                                        id: av.attribute_id,
                                        name: av.attribute?.name || 'Attribute',
                                        values: new Set()
                                    };
                                }
                                uiAttrsMap[av.attribute_id].values.add(av.id);
                            });
                        });
                        const remappedAttributes = Object.values(uiAttrsMap).map(attr => ({
                            id: attr.id,
                            name: attr.name,
                            values: Array.from(attr.values)
                        }));
                        setSelectedAttributes(remappedAttributes);
                    }
                    if (data.images) {
                        setProductImages(data.images.filter(img => !img.variant_id).map(img => img.file_path));
                    }
                    setIsLoadingData(false);
                })
                .catch(err => {
                    toast.error("Failed to load product details");
                })
                .finally(() => {
                    setIsLoadingData(false);
                });
        }
    }, [id]);

    const generateVariants = () => {
        const selected = selectedAttributes.filter(a => a.values.length > 0);
        if (selected.length === 0) {
            toast.error("Please select at least one attribute value first.");
            return;
        }

        // Generate combinations
        const combinations = selected.reduce((acc, attr) => {
            const result = [];
            attr.values.forEach(valId => {
                const valObj = attributesList.find(a => a.id === attr.id).values.find(v => v.id === valId);
                if (acc.length === 0) {
                    result.push({
                        label: valObj.value,
                        attribute_values: [valId]
                    });
                } else {
                    acc.forEach(prev => {
                        result.push({
                            label: `${prev.label} / ${valObj.value}`,
                            attribute_values: [...prev.attribute_values, valId]
                        });
                    });
                }
            });
            return result;
        }, []);

        const newVariants = combinations.map(comb => ({
            label: comb.label,
            sku: `${sku || 'SKU'}-${comb.label.replace(/\s+/g, '').toUpperCase()}`,
            price: price || '',
            stock_quantity: stockQuantity || '',
            file_path: '', // NEW: Variant specific image
            attribute_values: comb.attribute_values
        }));

        setVariants(newVariants);
        setActiveTab('variants');
        toast.success(`Generated ${newVariants.length} variations.`);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const readers = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(readers).then(results => {
            setProductImages([...productImages, ...results]);
        });
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const toggleCategory = (categoryId, e) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const renderNestedCategories = (cats, depth = 0) => {
        return cats.map(cat => {
            const isExpanded = expandedCategories.includes(cat.id);
            const hasChildren = cat.children && cat.children.length > 0;

            return (
                <div key={cat.id} style={{ paddingLeft: `${depth * 14}px`, marginBottom: '4px' }}>
                    <div className="category-item-row" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {hasChildren ? (
                            <span
                                className={`category-toggle ${isExpanded ? 'active' : ''}`}
                                onClick={(e) => toggleCategory(cat.id, e)}
                                style={{ cursor: 'pointer', fontSize: '10px', width: '12px', display: 'flex', justifyContent: 'center', color: '#888' }}
                            >
                                {isExpanded ? '▼' : '▶'}
                            </span>
                        ) : (
                            <span style={{ width: '12px' }}></span>
                        )}
                        <label className="custom-checkbox-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(cat.id)}
                                onChange={() => handleCategoryChange(cat.id)}
                            />
                            <span className="checkbox-visual"></span>
                            <span style={{ fontSize: '13px', color: '#1d2327', fontWeight: depth === 0 ? '500' : '400' }}>{cat.name}</span>
                        </label>
                    </div>
                    {hasChildren && isExpanded && (
                        <div className="category-children">
                            {renderNestedCategories(cat.children, depth + 1)}
                        </div>
                    )}
                </div>
            );
        });
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
                brand_ids: brandIds,
                category_ids: selectedCategories,
                status,
                type: productType,
                images: productImages,
                variants: productType === 'simple' 
                    ? [{ sku, price, compare_at_price: compareAtPrice, stock_quantity: stockQuantity, attribute_values: [] }]
                    : variants
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
                        <div className="product-data-header d-flex align-items-center gap-3 p-2 border-bottom bg-light">
                            <h2 className="editor-card-title m-0 ps-2" style={{ fontSize: '14px', color: '#1d2327' }}>Product Data —</h2>
                            <select
                                className="editor-select auto-width"
                                style={{ border: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '14px', color: '#2271b1', cursor: 'pointer', outline: 'none' }}
                                value={productType}
                                onChange={e => {
                                    const newType = e.target.value;
                                    setProductType(newType);
                                    if (newType === 'variable') {
                                        setActiveTab('attributes');
                                    } else {
                                        setActiveTab('general');
                                    }
                                }}
                            >
                                <option value="simple">Simple product</option>
                                <option value="variable">Variable product</option>
                            </select>
                        </div>

                        <div className="product-data-body d-flex">
                            <div className="product-data-tabs">
                                {productType === 'simple' ? (
                                    <>
                                        <div className={`pd-tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General</div>
                                        <div className={`pd-tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>Inventory</div>
                                    </>
                                ) : (
                                    <>
                                        <div className={`pd-tab ${activeTab === 'attributes' ? 'active' : ''}`} onClick={() => setActiveTab('attributes')}>Attributes</div>
                                        <div className={`pd-tab ${activeTab === 'variants' ? 'active' : ''}`} onClick={() => setActiveTab('variants')}>Variations</div>
                                    </>
                                )}
                                <div className={`pd-tab ${activeTab === 'brand' ? 'active' : ''}`} onClick={() => setActiveTab('brand')}>Brand</div>
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
                                            <label>Stock quantity</label>
                                            <input type="number" className="editor-input" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'attributes' && (
                                    <div className="pd-panel">
                                        <div className="d-flex align-items-center gap-2 mb-4 p-2 bg-light border rounded">
                                            <select
                                                className="editor-select auto-width m-0"
                                                id="attribute-to-add"
                                                defaultValue=""
                                                style={{ height: '32px' }}
                                            >
                                                <option value="" disabled>Custom product attribute</option>
                                                {attributesList.map(attr => (
                                                    <option key={attr.id} value={attr.id}>{attr.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                className="btn-secondary btn-sm"
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
                                            
                                            <div className="ms-auto">
                                                {selectedAttributes.length > 0 && (
                                                    <button 
                                                        type="button" 
                                                        className="btn-primary btn-sm px-4" 
                                                        style={{ height: '32px', background: '#2271b1' }}
                                                        onClick={generateVariants}
                                                    >
                                                        Generate Variations
                                                    </button>
                                                )}
                                            </div>
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

                                {activeTab === 'variants' && (
                                    <div className="pd-panel">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h4 className="m-0" style={{ fontSize: '13px', color: '#1d2327' }}>Generated Variations ({variants.length})</h4>
                                            {variants.length > 0 && (
                                                <button type="button" className="text-danger border-0 bg-transparent p-0 small" style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setVariants([])}>Clear all variations</button>
                                            )}
                                        </div>
                                        
                                        {variants.length === 0 ? (
                                            <div className="text-center py-4 border border-dashed rounded" style={{ background: '#fcfcfc' }}>
                                                <p className="text-muted small mb-0">No variations generated. Configure attributes and click 'Generate'.</p>
                                            </div>
                                        ) : (
                                            <div className="variations-table-wrapper border rounded overflow-hidden">
                                                <table className="variations-table w-100" style={{ borderCollapse: 'collapse', fontSize: '12px' }}>
                                                    <thead style={{ background: '#f6f7f7', borderBottom: '1px solid #dcdcde' }}>
                                                        <tr>
                                                            <th className="p-2 text-start" style={{ width: '40px' }}>Img</th>
                                                            <th className="p-2 text-start" style={{ width: '130px' }}>Variation</th>
                                                            <th className="p-2 text-start">SKU</th>
                                                            <th className="p-2 text-start" style={{ width: '100px' }}>Price (₹)</th>
                                                            <th className="p-2 text-start" style={{ width: '80px' }}>Stock</th>
                                                            <th className="p-2 text-center" style={{ width: '40px' }}></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {variants.map((v, idx) => (
                                                            <tr key={idx} style={{ borderBottom: '1px solid #f0f0f1' }}>
                                                                <td className="p-2">
                                                                    <div 
                                                                        className="variant-image-placeholder border rounded d-flex align-items-center justify-content-center bg-light"
                                                                        style={{ width: '30px', height: '30px', cursor: 'pointer', overflow: 'hidden' }}
                                                                        onClick={() => {
                                                                            const input = document.createElement('input');
                                                                            input.type = 'file';
                                                                            input.onchange = (e) => {
                                                                                const file = e.target.files[0];
                                                                                const reader = new FileReader();
                                                                                reader.onloadend = () => {
                                                                                    const newV = [...variants];
                                                                                    newV[idx].file_path = reader.result;
                                                                                    setVariants(newV);
                                                                                };
                                                                                reader.readAsDataURL(file);
                                                                            };
                                                                            input.click();
                                                                        }}
                                                                    >
                                                                        {v.file_path ? (
                                                                            <img src={v.file_path.startsWith('data:') ? v.file_path : `http://localhost:8000/storage/${v.file_path}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                        ) : (
                                                                            <span style={{ fontSize: '18px', color: '#ccc' }}>+</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="p-2 fw-bold text-primary">{v.label}</td>
                                                                <td className="p-2">
                                                                    <input 
                                                                        type="text" 
                                                                        className="editor-input py-1 px-2 w-100" 
                                                                        style={{ fontSize: '12px', height: '28px' }}
                                                                        value={v.sku} 
                                                                        onChange={e => {
                                                                            const newV = [...variants];
                                                                            newV[idx].sku = e.target.value;
                                                                            setVariants(newV);
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td className="p-2">
                                                                    <input 
                                                                        type="number" 
                                                                        className="editor-input py-1 px-2 w-100" 
                                                                        style={{ fontSize: '12px', height: '28px' }}
                                                                        value={v.price} 
                                                                        onChange={e => {
                                                                            const newV = [...variants];
                                                                            newV[idx].price = e.target.value;
                                                                            setVariants(newV);
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td className="p-2">
                                                                    <input 
                                                                        type="number" 
                                                                        className="editor-input py-1 px-2 w-100" 
                                                                        style={{ fontSize: '12px', height: '28px' }}
                                                                        value={v.stock_quantity} 
                                                                        onChange={e => {
                                                                            const newV = [...variants];
                                                                            newV[idx].stock_quantity = e.target.value;
                                                                            setVariants(newV);
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td className="p-2 text-center">
                                                                    <button 
                                                                        type="button" 
                                                                        className="text-danger border-0 bg-transparent p-0"
                                                                        style={{ cursor: 'pointer', fontSize: '14px' }}
                                                                        onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                                                                    >×</button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {activeTab === 'brand' && (
                                    <div className="pd-panel">
                                        <div className="pd-row">

                                            <select
                                                className="editor-input"
                                                onChange={e => {
                                                    const id = parseInt(e.target.value);
                                                    if (id && !brandIds.includes(id)) {
                                                        setBrandIds([...brandIds, id]);
                                                    }
                                                    e.target.value = "";
                                                }}
                                            >
                                                <option value="">Choose Brands...</option>
                                                {brands.map(brand => (
                                                    <option key={brand.id} value={brand.id} disabled={brandIds.includes(brand.id)}>
                                                        {brand.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {brandIds.length > 0 && (
                                            <div className="pd-row align-items-start mt-3">
                                                <label>Selected Brands</label>
                                                <div className="d-flex flex-wrap gap-2" style={{ flex: 1 }}>
                                                    {brandIds.map(id => {
                                                        const brand = brands.find(b => b.id === id);
                                                        return brand && (
                                                            <div key={id} className="selected-tag">
                                                                <span>{brand.name}</span>
                                                                <button
                                                                    type="button"
                                                                    className="tag-remove"
                                                                    onClick={() => setBrandIds(brandIds.filter(bid => bid !== id))}
                                                                >×</button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
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
                            <h3 className="editor-card-title m-0">Feature Image</h3>
                        </div>
                        <div className="sidebar-body text-center">
                            <input
                                type="file"
                                multiple
                                id="product-images-input"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                            <div className="image-upload-area" onClick={() => document.getElementById('product-images-input').click()} style={{ cursor: 'pointer' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '10px' }}>
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                <div>Click to browse or drop an image here</div>
                                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>PNG, JPG, WEBP up to 2MB</div>
                            </div>
                            <div className="d-flex flex-wrap gap-2 mt-3">
                                {productImages.map((img, i) => (
                                    <div key={i} className="position-relative" style={{ width: '60px', height: '60px' }}>
                                        <img
                                            src={img.startsWith('data:') ? img : `http://localhost:8000/storage/${img}`}
                                            alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                        <button
                                            type="button"
                                            className="btn-close-small"
                                            style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '15px', height: '15px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setProductImages(productImages.filter((_, idx) => idx !== i));
                                            }}
                                        >x</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default CreateProduct;
