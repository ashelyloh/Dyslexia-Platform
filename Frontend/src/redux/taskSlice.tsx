import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Task type definition
interface Task {
  _id: string;
  title: string;
  progress: number;
  status: "Pending" | "Completed";
  deadline: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

// Initial state
const initialState = {
  tasks: [] as Task[],
  loading: false,
  error: null as string | null,
};

const token = localStorage.getItem("token");

// Add a new task

// Fetch all tasks
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/task", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response?.data?.tasks;
    } catch (error: any) {
      return rejectWithValue("Failed to fetch tasks");
    }
  }
);

// Slice
const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    deleteTask: (state: any, action: any) => {
      state.tasks = state.tasks.filter(
        (task: any) => task._id !== action.payload
      );
    },

    markComplete: (state: any, action: any) => {
      console.log("action", action.payload);
      state.tasks = state.tasks.map((task: any) => {
        if (task._id === action.payload) {
          return {
            ...task,
            status: "completed",
            progress: 100,
          };
        }
        return task;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state: any, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export the reducer
export default taskSlice.reducer;

export const { addTask, deleteTask, markComplete } = taskSlice.actions;
