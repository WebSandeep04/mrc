import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const fetchRoles = createAsyncThunk('roles/fetchRoles', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_URL}/roles`, getAuthHeader());
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch roles');
    }
});

export const createRole = createAsyncThunk('roles/createRole', async (roleData, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_URL}/roles`, roleData, getAuthHeader());
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create role');
    }
});

export const updateRolePermissions = createAsyncThunk('roles/updateRolePermissions', async ({ id, permissions }, { rejectWithValue }) => {
    try {
        // We fetching current role name and updating it with new permissions
        const response = await axios.put(`${API_URL}/roles/${id}`, { permissions }, getAuthHeader());
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update permissions');
    }
});

export const deleteRole = createAsyncThunk('roles/deleteRole', async (id, { rejectWithValue }) => {
    try {
        await axios.delete(`${API_URL}/roles/${id}`, getAuthHeader());
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete role');
    }
});

const roleSlice = createSlice({
    name: 'roles',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoles.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createRole.fulfilled, (state, action) => {
                state.list.push(action.payload);
            })
            .addCase(updateRolePermissions.fulfilled, (state, action) => {
                const index = state.list.findIndex((role) => role.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
            })
            .addCase(deleteRole.fulfilled, (state, action) => {
                state.list = state.list.filter((role) => role.id !== action.payload);
            });
    },
});

export default roleSlice.reducer;
