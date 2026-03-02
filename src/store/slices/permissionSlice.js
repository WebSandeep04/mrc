import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const fetchPermissions = createAsyncThunk('permissions/fetchPermissions', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_URL}/permissions`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch permissions');
    }
});

const permissionSlice = createSlice({
    name: 'permissions',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPermissions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPermissions.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchPermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default permissionSlice.reducer;
