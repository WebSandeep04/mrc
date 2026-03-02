import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
    token: localStorage.getItem('userToken') || null,
    user: JSON.parse(localStorage.getItem('userData')) || null,
    loading: false,
    error: null,
};

export const loginUser = createAsyncThunk(
    'userAuth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/login', credentials);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login Failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'userAuth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/logout');
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Logout Failed');
        }
    }
);

export const sendOTP = createAsyncThunk(
    'userAuth/sendOTP',
    async (email, { rejectWithValue }) => {
        try {
            const response = await api.post('/send-otp', { email });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
        }
    }
);

export const loginWithOTP = createAsyncThunk(
    'userAuth/loginWithOTP',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/login-otp', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login Failed');
        }
    }
);

const userAuthSlice = createSlice({
    name: 'userAuth',
    initialState,
    reducers: {
        userLogout: (state) => {
            state.token = null;
            state.user = null;
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
                localStorage.setItem('userToken', action.payload.token);
                localStorage.setItem('userData', JSON.stringify(action.payload.user));
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.token = null;
                state.user = null;
                localStorage.removeItem('userToken');
                localStorage.removeItem('userData');
            })
            .addCase(loginWithOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginWithOTP.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
                localStorage.setItem('userToken', action.payload.token);
                localStorage.setItem('userData', JSON.stringify(action.payload.user));
            })
            .addCase(loginWithOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { userLogout } = userAuthSlice.actions;
export default userAuthSlice.reducer;
