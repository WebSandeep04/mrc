import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchBrands = createAsyncThunk('brands/fetchBrands', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/brands');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch brands');
    }
});

export const createBrand = createAsyncThunk('brands/createBrand', async (brandData, { rejectWithValue }) => {
    try {
        const response = await api.post('/brands', brandData);
        return response.data;
    } catch (error) {
        if (error.response?.data?.errors) {
            // Return validation errors as a single string
            return rejectWithValue(Object.values(error.response.data.errors).flat().join(' '));
        }
        return rejectWithValue(error.response?.data?.message || 'Failed to create brand');
    }
});

export const updateBrand = createAsyncThunk('brands/updateBrand', async ({ id, data }, { rejectWithValue }) => {
    try {
        // Use POST with _method=PUT workaround for Laravel multipart support
        const response = await api.post(`/brands/${id}`, data);
        return response.data;
    } catch (error) {
        if (error.response?.data?.errors) {
            return rejectWithValue(Object.values(error.response.data.errors).flat().join(' '));
        }
        return rejectWithValue(error.response?.data?.message || 'Failed to update brand');
    }
});

export const deleteBrand = createAsyncThunk('brands/deleteBrand', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/brands/${id}`);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete brand');
    }
});

const brandSlice = createSlice({
    name: 'brands',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBrands.pending, (state) => { state.loading = true; })
            .addCase(fetchBrands.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchBrands.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createBrand.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(updateBrand.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            .addCase(deleteBrand.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            });
    },
});

export default brandSlice.reducer;
