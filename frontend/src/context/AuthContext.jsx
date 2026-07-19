import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("sms_token");
    let savedUser = localStorage.getItem("sms_user");
    
    if (!savedUser || savedUser === "undefined") {
      savedUser = localStorage.getItem("sms_admin");
    }

    if (savedToken && savedToken !== "undefined" && savedUser && savedUser !== "undefined") {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Failed to parse user from local storage:", err);
        localStorage.removeItem("sms_token");
        localStorage.removeItem("sms_user");
        localStorage.removeItem("sms_admin");
      }
    }
    setLoading(false);
  }, []);

  const login = (tokenValue, userData) => {
    setToken(tokenValue);
    setUser(userData);
    localStorage.setItem("sms_token", tokenValue);
    localStorage.setItem("sms_user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("sms_token");
    localStorage.removeItem("sms_user");
    localStorage.removeItem("sms_admin");
  };

  return (
    <AuthContext.Provider value={{ user, admin: user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
