import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAttributes = createAsyncThunk('attributes/fetchAttributes', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/attributes');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch attributes');
    }
});

export const createAttribute = createAsyncThunk('attributes/createAttribute', async (attributeData, { rejectWithValue }) => {
    try {
        const response = await api.post('/attributes', attributeData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create attribute');
    }
});

export const updateAttribute = createAsyncThunk('attributes/updateAttribute', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/attributes/${id}`, data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update attribute');
    }
});

export const deleteAttribute = createAsyncThunk('attributes/deleteAttribute', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/attributes/${id}`);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete attribute');
    }
});

const attributeSlice = createSlice({
    name: 'attributes',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAttributes.pending, (state) => { state.loading = true; })
            .addCase(fetchAttributes.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchAttributes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createAttribute.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(updateAttribute.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            .addCase(deleteAttribute.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            });
    },
});

export default attributeSlice.reducer;
