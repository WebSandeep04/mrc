import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/users');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

export const createUser = createAsyncThunk(
    'users/createUser',
    async (userData, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post('/users', userData);
            dispatch(fetchUsers());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create user');
        }
    }
);

export const updateUser = createAsyncThunk(
    'users/updateUser',
    async ({ id, userData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.put(`/users/${id}`, userData);
            dispatch(fetchUsers());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update user');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            await api.delete(`/users/${id}`);
            dispatch(fetchUsers());
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default userSlice.reducer;
