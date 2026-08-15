import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import { healthQuizApi } from "./api/healthQuizApi";

export const makeStore = () => {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      [healthQuizApi.reducerPath]: healthQuizApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        baseApi.middleware,
        healthQuizApi.middleware
      ),

    devTools: process.env.NODE_ENV !== "production",
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
