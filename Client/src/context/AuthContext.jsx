import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const userData = localStorage.getItem("user");
  
    if (accessToken && userData) {
      try {
        const decodedAccess = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;
  
        if (decodedAccess.exp && decodedAccess.exp < currentTime) {
          // accessToken истёк, пробуем обновить
          if (refreshToken) {
            refreshAccessToken(refreshToken, JSON.parse(userData));
          } else {
            logout(true);
          }
        } else {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error("Ошибка при декодировании токена", err);
        logout(true);
      }
    }
  }, []);
  

  const refreshAccessToken = async (refreshToken, user) => {
    try {
      const res = await fetch("https://localhost:7118/api/account/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: refreshToken }),
      });
  
      if (!res.ok) throw new Error("Ошибка при обновлении токена");
  
      const data = await res.json();
      const newAccessToken = data.accessToken;
  
      localStorage.setItem("accessToken", newAccessToken);
      setUser(user);
    } catch (err) {
      console.error("Не удалось обновить токен", err);
      logout(true);
    }
  };
  

  const login = ({ user, accessToken, refreshToken }) => {
    setUser(user);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
  };
  const logout = (expired = false) => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    if (expired) setSessionExpired(true);
    navigate("/login");
  };


  return (
    <AuthContext.Provider
      value={{ user, login, logout, sessionExpired, setSessionExpired }}
    >
      {children}
    </AuthContext.Provider>
  );
};
