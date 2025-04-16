import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import meetingReducer from './features/meetingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    meeting: meetingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 