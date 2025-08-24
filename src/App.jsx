// estatecrm/src/App.jsx

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet, // Import Outlet from react-router-dom
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Sidebar from "./components/common/Sidebar";
import Login from "./components/auth/Login";
import SubscriptionLanding from "./components/subscription/SubscriptionLanding";
import AdminDashboard from "./components/admin/AdminDashboard";
import AgentDashboard from "./components/agent/AgentDashboard";
import LoadingSpinner from "./components/common/LoadingSpinner";
import "./index.css";

// Layout component for all authenticated users (includes Sidebar)
// It now renders an <Outlet /> for the child route components.
const AuthenticatedLayout = () => (
  <div className="flex h-screen bg-gray-50">
    <Sidebar />
    <main className="flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
);

// Component to handle the initial redirect logic (no changes here)
const InitialRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen={true} />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin" || user.role === "founding_member") {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/agent" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/pricing" element={<SubscriptionLanding />} />

          {/* Root path handles the intelligent redirect */}
          <Route path="/" element={<InitialRedirect />} />

          {/* --- UPDATED PROTECTED ROUTES --- */}
          {/* This parent route handles authentication and renders the layout */}
          <Route
            element={
              <ProtectedRoute>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            {/* Child routes render INSIDE the AuthenticatedLayout's <Outlet /> */}
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/agent/*" element={<AgentDashboard />} />
          </Route>

          {/* A catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
