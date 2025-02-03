import { Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import HomeLayout from "./layout/HomeLayout";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Tasks from "./pages/Tasks";
import Contact from "./pages/Contact";
import TextToSpeech from "./pages/Reader";
import Home from "./pages/Home";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import { CurrentUser } from "./api/auth";
import { setUserDetails } from "./redux/authSlice";
// ProtectedRoute Component
const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state: any) => state?.auth);

  // Redirect to login if no token is present
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { token, user } = useSelector((state: any) => state?.auth);

  // Redirect to login if no token is present
  return token && user?.role === "admin" ? children : <Navigate to="/home" />;
};

const App = () => {
  const { token, user } = useSelector((state: any) => state?.auth);

  console.log("token", token, "user", user);
  const dispatch = useDispatch();

  const getUser = async () => {
    const resp = await CurrentUser(token);
    console.log("my resp", resp);
    dispatch(setUserDetails(resp));
  };

  useEffect(() => {
    getUser();
  }, [token, dispatch]);

  console.log("bcccccccc", user);
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={!token ? <Register /> : <Navigate to={"/home"} />}
      />
      <Route
        path="/login"
        element={!token ? <Login /> : <Navigate to={"/home"} />}
      />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomeLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="chat/:id"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="contact"
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          }
        />
        <Route
          path="reader"
          element={
            <ProtectedRoute>
              <TextToSpeech />
            </ProtectedRoute>
          }
        />

        <Route
          path="dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default App;
