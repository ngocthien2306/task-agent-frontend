import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and user data on app start
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setToken(savedToken);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("tokenType");
      }
    }
    setLoading(false);
  }, []);

  const login = async (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("tokenType", "bearer");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenType");
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // API helper function with authentication
  const authFetch = async (url, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized, logout user
    if (response.status === 401) {
      logout();
      throw new Error("Authentication failed");
    }

    return response;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    authFetch,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};