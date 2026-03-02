import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import userAuthReducer from './slices/userAuthSlice';
import roleReducer from './slices/roleSlice';
import permissionReducer from './slices/permissionSlice';
import brandReducer from './slices/brandSlice';
import categoryReducer from './slices/categorySlice';
import attributeReducer from './slices/attributeSlice';
import productReducer from './slices/productSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
        userAuth: userAuthReducer,
        roles: roleReducer,
        permissions: permissionReducer,
        brands: brandReducer,
        categories: categoryReducer,
        attributes: attributeReducer,
        products: productReducer,
    },
});


export default store;
