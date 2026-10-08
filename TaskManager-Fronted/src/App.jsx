import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import TaskForm from "./pages/TaskForm";
import Profile from "./pages/Profile";

export default function App() {

  return (
    <>
      <Navbar />

      <main className="page-container">

        <Routes>

          <Route
            path="/"
            element={<Navigate to="/tasks" replace />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route element={<ProtectedRoute />}>

            <Route
              path="/tasks"
              element={<Tasks />}
            />

            <Route
              path="/tasks/create"
              element={<TaskForm />}
            />

            <Route
              path="/tasks/:id"
              element={<TaskDetails />}
            />

            <Route
              path="/tasks/:id/edit"
              element={<TaskForm />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

          </Route>

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>

      </main>
    </>
  );
}