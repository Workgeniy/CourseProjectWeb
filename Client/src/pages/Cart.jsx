import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Cart() {
  const { cart, cartCount, clearCart, removeOneFromCart, removeItemCompletely, checkout } = useCart(); 
  const navigate = useNavigate();

  const handleCheckout = () => {
    checkout();
    navigate("/success");
  };

  // Подсчёт общей суммы
  const totalPrice = cart.items.reduce((sum, item) => {
    return sum + (item.price || 0) * item.quantity;
  }, 0);

  if (cartCount === 0) {
    return <div>Корзина пуста</div>;
  }

  console.log(cart);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🛒 Ваша корзина</h2>

      <div className="products-grid">
        {cart.items.map((item) => (
          <div key={item.productId} className="product-card">
            
            <h3>{item.productName || "Без названия"}</h3>
            <p><strong>Цена:</strong> {item.price?.toFixed(2) || "N/A"} ₽</p>
            <p><strong>Количество:</strong> {item.quantity} шт.</p>
            <p><strong>Сумма:</strong> {(item.price * item.quantity).toFixed(2)} ₽</p>
            <button
              onClick={() => removeOneFromCart(item.productId)}
              className="remove-btn"
              style={{ marginTop: "0.5rem" }}
            >
              ➖ Убрать 1 шт.
            </button>
            <button
              onClick={() => removeItemCompletely(item.itemId)}
              className="remove-btn"
              style={{ marginTop: "0.5rem", backgroundColor: "darkred", color: "white" }}
            >
              ❌ Удалить товар
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2rem", fontSize: "1.2rem" }}>
        <strong>Общая сумма:</strong> {totalPrice.toFixed(2)} ₽
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleCheckout} className="add-btn" style={{ marginRight: "1rem" }}>
          🛍 Оформить заказ
        </button>
        <button onClick={clearCart} className="remove-btn">
          🗑 Очистить корзину
        </button>
      </div>
    </div>
  );
}

export default Cart;
