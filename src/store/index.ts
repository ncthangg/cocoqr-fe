import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import heroFormReducer from "./slices/hero-form.slice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        heroForm: heroFormReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

