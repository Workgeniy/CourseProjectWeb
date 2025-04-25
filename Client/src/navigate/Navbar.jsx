import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "../App.css";

function Header() {
  const { user, logout } = useContext(AuthContext);
  const isUser = user && user.roles[0]?.toLowerCase() !== "admin";
  const { cartCount } = useCart(); 
  const navigate = useNavigate();

  return (
    <div className="navbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>

        <p style={{fontSize:"18px", color:"white", fontWeight:"bold"}}>LOGO</p>
        {/* <img
          src="/images/Logo.png"
          alt="Логотип"
          style={{ height: "40px", cursor: "pointer" }}
          onClick={() => navigate("/")}
        /> */}
        <button className="nav-btn" onClick={() => navigate("/products")}>Товары</button>
        {isUser && (
          <button className="nav-btn" onClick={() => navigate("/cart")}>
            🛒 Корзина ({cartCount})
          </button>
        )}
      </div>

      <div className="nav-user-info">
        {user ? (
          <>
            👤 {user.userName}
            <button className="nav-btn" style={{marginRight : "50px"}} onClick={logout}>Выйти</button>
          </>
        ) : (
          <>
            <button className="nav-btn" onClick={() => navigate("/login")}>Вход</button>
            <button className="nav-btn" style={{marginRight : "50px"}} onClick={() => navigate("/register")}>Регистрация</button>
          </>
        )}
      </div>
    </div>
  );

}

export default Header;
