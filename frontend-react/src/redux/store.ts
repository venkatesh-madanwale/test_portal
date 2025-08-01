import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import rolesReducer from './slices/rolesSlice';
import testReducer from './slices/test/testSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    roles: rolesReducer,
    test: testReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;