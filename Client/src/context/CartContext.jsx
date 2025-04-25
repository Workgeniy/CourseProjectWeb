import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import axiosInstance from "../utils/axiosInstance";


export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [cartCount, setCartCount] = useState(0);
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  const removeItemCompletely = async (itemId) => {
    try {
      await axiosInstance.delete(`/api/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      fetchCart(); // обновим корзину
    } catch (err) {
      console.error("Ошибка при удалении товара:", err);
    }
  };

  
  

  const removeOneFromCart = async (productId) => {
    try {
      await axiosInstance.post("/api/cart/decrease", {
        productId,
        quantity: 1,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      fetchCart(); // пересинхронизируем
    } catch (err) {
      console.error("Ошибка при уменьшении товара:", err);
    }
  };
  
  

  const fetchCart = async () => {
    if (!token || !user || user.role?.toLowerCase() === "admin") return;

    try {
      const res = await axiosInstance.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
      const total = res.data.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
      localStorage.setItem("cart", JSON.stringify(res.data));
    } catch (err) {
      console.error("Ошибка при загрузке корзины:", err);
      setCart({ items: [] });
      setCartCount(0);
    }

  };

  const clearCart = async () => {
    try {
      await axiosInstance.delete("/api/cart/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setCart({ items: [] });
      setCartCount(0);
      localStorage.removeItem("cart");
    } catch (err) {
      console.error("Ошибка при очистке корзины:", err);
    }
  };
  
  const checkout = async () => {
    if (!token) return;
  
    try {
      const res = await axiosInstance.post("/api/cart/checkout", null, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      alert("🎉 Заказ оформлен успешно!");
      clearCart();
      fetchCart(); // обновим состояние
    } catch (err) {
      console.error("Ошибка при оформлении заказа:", err);
      alert("❌ Ошибка при оформлении заказа");
    }
  };
 

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  return (
    <CartContext.Provider value={{ cart, cartCount, fetchCart, clearCart, checkout, removeOneFromCart, removeItemCompletely }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
export const useCart = () => useContext(CartContext);
