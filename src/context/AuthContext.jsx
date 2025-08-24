// estatecrm/src/context/AuthContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Refs to prevent duplicate operations
  const loginInProgress = useRef(false);
  const lastProcessedUid = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Prevent duplicate login attempts for the same user
        if (
          loginInProgress.current ||
          lastProcessedUid.current === firebaseUser.uid
        ) {
          console.log(
            "🔄 Login already processed or in progress for:",
            firebaseUser.email
          );
          setLoading(false);
          return;
        }

        loginInProgress.current = true;
        lastProcessedUid.current = firebaseUser.uid;

        try {
          // Get Firebase token
          const token = await firebaseUser.getIdToken();
          localStorage.setItem("token", token);

          console.log("🔑 Authenticating with backend:", firebaseUser.email);

          // Login to backend and get user profile
          //   const response = await authAPI.login({
          //     email: firebaseUser.email,
          //     firebaseUid: firebaseUser.uid,
          //   });
          //   const response = await authAPI.login();
          const response = await authAPI.login({
            email: firebaseUser.email,
            firebaseUid: firebaseUser.uid,
          });

          console.log("Backend response:", response);
          const userData = response.data.user;
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));

          console.log("✅ Authentication successful");
        } catch (error) {
          console.error(
            "❌ Backend authentication failed:",
            error.response?.data?.message || error.message
          );

          // If backend login fails, clear auth state
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          lastProcessedUid.current = null;
        } finally {
          loginInProgress.current = false;
        }
      } else {
        // User signed out
        console.log("👋 User signed out");
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        lastProcessedUid.current = null;
        loginInProgress.current = false;
      }

      setLoading(false);
    });

    // Check for stored user data on app start (only once)
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken && !user && !loginInProgress.current) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log("🔄 Restored user session:", userData.email);
      } catch (error) {
        console.error("❌ Failed to restore user session:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    return unsubscribe;
  }, []); // Empty dependency array to run only once

  const value = {
    user,
    firebaseUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isAgent: user?.role === "agent",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
