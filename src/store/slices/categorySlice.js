import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchCategories = createAsyncThunk('categories/fetchCategories', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/categories');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
});

export const createCategory = createAsyncThunk('categories/createCategory', async (categoryData, { rejectWithValue }) => {
    try {
        const response = await api.post('/categories', categoryData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
});

export const updateCategory = createAsyncThunk('categories/updateCategory', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/categories/${id}`, data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
});

export const deleteCategory = createAsyncThunk('categories/deleteCategory', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/categories/${id}`);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
});

const categorySlice = createSlice({
    name: 'categories',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => { state.loading = true; })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                // If it's a top-level category (no parent_id), add to root
                if (!action.payload.parent_id) {
                    state.items.unshift({ ...action.payload, children: [] });
                } else {
                    // Logic to add to the correct parent's children (refresh is easier for deep nesting)
                    // But for direct feedback, a simple refresh is often safer with tree structures
                }
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            });
    },
});

export default categorySlice.reducer;
