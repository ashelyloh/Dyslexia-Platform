import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Initial state
const initialState = {
  chats: [],
  isPending: false,
  isError: false,
  isSuccess: false,
};

const token = localStorage.getItem("token");

// Async thunk to fetch chats
export const getChats = createAsyncThunk(
  "chat/getChats",
  async (search: string | undefined, thunkAPI) => {
    try {
      const url = search
        ? `/chat/chats?search=${encodeURIComponent(search)}`
        : "/chat/chats"; // If no search term, just hit the endpoint without the query param

      const resp = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return resp.data; // Return chats data
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle getChats
      .addCase(getChats.pending, (state) => {
        state.isPending = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(getChats.fulfilled, (state, action) => {
        state.isPending = false;
        state.isSuccess = true;
        state.chats = action.payload; // Set chats list
      })
      .addCase(getChats.rejected, (state, action) => {
        state.isPending = false;
        state.isError = true;
        console.error(action.payload); // Log error or display error message
      });
  },
});

export default chatSlice.reducer;
