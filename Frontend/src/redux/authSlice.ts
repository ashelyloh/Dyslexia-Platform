import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage
// let user = null;
// try {
//   const userFromStorage = localStorage.getItem("User");
//   user = userFromStorage ? JSON.parse(userFromStorage) : null; // Safely parse JSON or return null
// } catch (error) {
//   console.error("Error parsing user data from localStorage", error);
//   user = null; // Ensure user is null if there's an error
// }

const initialState = {
  token: localStorage.getItem("token") || "",
  user: "", // Use null if user data is not found or is invalid
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    getToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload); // Save token to localStorage
    },
    setUserDetails: (state, action) => {
      state.user = action.payload;
      //localStorage.setItem("User", JSON.stringify(action.payload)); // Save user to localStorage
    },
    clearAuth: (state: any) => {
      state.token = "";
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("User");
    },
  },
});

export const { getToken, setUserDetails, clearAuth } = authSlice.actions;

export default authSlice.reducer;
