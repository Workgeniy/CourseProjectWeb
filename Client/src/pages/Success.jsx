import React from "react";
import { Link } from "react-router-dom";

function Success() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>🎉 Спасибо за покупку!</h1>
      <p>Ваш заказ успешно оформлен. Мы скоро с вами свяжемся.</p>
      <Link to="/">Вернуться на главную</Link>
    </div>
  );
}

export default Success;
