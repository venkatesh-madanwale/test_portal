// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import proctorReducer from './proctorSlice';

export const store = configureStore({
  reducer: {
    proctor: proctorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
