import { useState, useCallback, useMemo } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";

const AuthProvider = ({ children }) => {

  /* ================================
     INITIALIZE FROM LOCALSTORAGE
  ================================= */

  const [token, setToken] = useState(() => {
    return localStorage.getItem("access") || null;
  });

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  /* ================================
     LOGIN
  ================================= */

  const login = useCallback(async (credentials) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/token/",
        credentials
      );

      const { access, refresh } = response.data;

      // Save tokens
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // Decode JWT safely
      const base64Url = access.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(window.atob(base64));

      const userData = {
        username: decoded.username,
        role: decoded.role || "admin",
        team_name: decoded.team_name || "General"
      };

      localStorage.setItem("user", JSON.stringify(userData));

      setToken(access);
      setUser(userData);

    } catch (error) {
      throw error;
    }
  }, []);

  /* ================================
     LOGOUT
  ================================= */

  const logout = useCallback(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    login,
    logout
  }), [user, token, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;