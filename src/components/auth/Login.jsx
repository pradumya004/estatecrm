// estatecrm/src/components/auth/Login.jsx

import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { signInWithGoogle } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
// import useAuth from "../../hooks/useAuth";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, loading: authLoading } = useAuth();

  console.log("User:", user);
  

  // Redirect if already authenticated - FIXED REDIRECT PATH
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // FIXED: Changed from '/agent' to '/agent/dashboard'
    const redirectPath = user.role === "admin" ? "/admin" : "/agent/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-500 cursor-pointer">
            {/* Animated background overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-400/20 via-white/30 to-gray-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm animate-pulse"></div>

            {/* Main content */}
            <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-inner">
                <div className="w-4 h-4 bg-black rounded-sm transform rotate-45 group-hover:rotate-90 transition-transform duration-500"></div>
              </div>
            </div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div
                className="absolute top-2 left-3 w-1 h-1 bg-white/50 rounded-full animate-ping"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="absolute bottom-3 right-2 w-1 h-1 bg-white/30 rounded-full animate-ping"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute top-4 right-4 w-0.5 h-0.5 bg-white/40 rounded-full animate-ping"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>
          </div>
          <h1 className="text-2xl font-normal text-gray-900 mb-2">
            Sign in to RealEstate CRM
          </h1>
          <p className="text-gray-600 text-sm">
            Use your Google account to continue
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Google Sign In Button */}
        <div className="mb-8">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-700 font-medium">Signing in...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-gray-700 font-medium">
                  Continue with Google
                </span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-8 text-sm">
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Help
            </a>
          </div>

          <p className="text-xs text-gray-500">
            Secure authentication powered by Google
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;