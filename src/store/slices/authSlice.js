import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
    token: localStorage.getItem('token') || null,
    adminUser: JSON.parse(localStorage.getItem('adminUser')) || null,
    permissions: JSON.parse(localStorage.getItem('permissions')) || [],
    loading: false,
    error: null,
};

export const adminLogin = createAsyncThunk(
    'auth/adminLogin',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/admin/login', credentials);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Authentication Failed');
        }
    }
);

export const adminLogout = createAsyncThunk(
    'auth/adminLogout',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/admin/logout');
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Logout Failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.token = null;
            state.adminUser = null;
            state.permissions = [];
            localStorage.removeItem('token');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('permissions');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(adminLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(adminLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.adminUser = action.payload.admin;
                state.permissions = action.payload.permissions || [];
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('adminUser', JSON.stringify(action.payload.admin));
                localStorage.setItem('permissions', JSON.stringify(action.payload.permissions || []));
            })
            .addCase(adminLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(adminLogout.fulfilled, (state) => {
                state.token = null;
                state.adminUser = null;
                state.permissions = [];
                localStorage.removeItem('token');
                localStorage.removeItem('adminUser');
                localStorage.removeItem('permissions');
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
