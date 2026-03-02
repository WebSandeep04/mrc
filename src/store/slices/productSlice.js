import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get('/products', { params });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
});

export const createProduct = createAsyncThunk('products/createProduct', async (productData, { rejectWithValue }) => {
    try {
        const response = await api.post('/products', productData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
});

export const updateProduct = createAsyncThunk('products/updateProduct', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/products/${id}`, data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
});

export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/products/${id}`);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
});

const productSlice = createSlice({
    name: 'products',
    initialState: {
        items: [],
        pagination: {},
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => { state.loading = true; })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = {
                    current_page: action.payload.current_page,
                    last_page: action.payload.last_page,
                    total: action.payload.total,
                };
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default productSlice.reducer;
