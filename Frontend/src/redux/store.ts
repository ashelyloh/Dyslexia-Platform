import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import chatSlice from "./chatSlice";
import taskSlice from "./taskSlice";
export const store = configureStore({
  reducer: {
    auth: authSlice,
    chat: chatSlice,
    tasks: taskSlice,
  },
});
