import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import Login from "./account/Login";
import Register from "./account/Register";
import Product from "./pages/Product";
import AddProduct from "./pages/admin/AddProduct";
import Products from "./pages/Product";
import AdminPanel from "./pages/admin/AdminPanel";
import Cart from "./pages/Cart";
import Navbar from "./navigate/Navbar";
import Success from "./pages/Success";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { user, logout, sessionExpired, setSessionExpired } = useContext(AuthContext);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("expired") === "true") {
      setSessionExpired(true);
  
      // Очистка параметра из URL без перезагрузки страницы
      urlParams.delete("expired");
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  return (
    <div>
      {/* {sessionExpired && (
        <div style={{
          background: "#ffe4e4",
          padding: "10px 20px",
          border: "1px solid red",
          color: "#a10000",
          marginBottom: "1rem",
          borderRadius: "8px",
          textAlign: "center"
        }}>
          ⚠️ Ваша сессия истекла. Пожалуйста, войдите снова.
        </div>
      )} */}

        < Navbar />
      {/* <div style={{ padding: "10px" }}>
        {user ? (
          <>
            <span>Вы вошли как: {user.username}</span>
            <button onClick={logout} style={{ marginLeft: "10px" }}>Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
          </>
        )}
      </div> */}



      <Routes>
        <Route path="/" element={<Navigate to="/product" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product" element={<Product />} />
        <Route path="/products" element={<Products />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </div>
  );
}

export default App;
