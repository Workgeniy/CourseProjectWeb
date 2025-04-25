import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { useCart } from "../context/CartContext";
import "../App.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("accessToken");
  const { fetchCart } = useCart();

  const baseURL = import.meta.env.VITE_API_URL || "https://localhost:7118";

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

    useEffect(() => {
          // Добавить класс на <body>
          document.body.classList.add("body-product-background");
      
          // Удалить класс при размонтировании компонента
          return () => {
            document.body.classList.remove("body-product-background");
          };
        }, []);

  useEffect(() => {
    filterProducts();
  }, [search, categoryFilter, products]);

  const fetchProducts = () => {
    axiosInstance.get(`${baseURL}/api/products`)
      .then(res => {
        setProducts(res.data);
        setFiltered(res.data);
      })
      .catch(err => console.error("Ошибка загрузки товаров", err));
  };

  const fetchCategories = () => {
    axiosInstance.get(`${baseURL}/api/categories`)
      .then(res => setCategories(res.data))
      .catch(err => console.error("Ошибка загрузки категорий", err));
  };

  const filterProducts = () => {
    let filteredData = [...products];
    // Расширенный поиск
  if (search.trim()) {
    const searchLower = search.toLowerCase();
    filteredData = filteredData.filter(p =>
      p.name?.toLowerCase().includes(searchLower) ||
      p.categoryName?.toLowerCase().includes(searchLower) ||
      p.descriptionName?.toLowerCase().includes(searchLower)
    );
  }

  // Фильтрация по категории ID
  if (categoryFilter) {
    filteredData = filteredData.filter(p => String(p.categoryId) === String(categoryFilter));
  }

  setFiltered(filteredData);
};

  const addToCart = (productId) => {
    axiosInstance.post(`${baseURL}/api/cart/add`,
      { productId, quantity: 1 },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then(() => {
      alert("Товар добавлен в корзину");
      fetchCart();
    })
    .catch(err => {
      console.error("Ошибка при добавлении в корзину", err);
  
      if (err.response?.status === 401) {
        alert("Сессия истекла. Пожалуйста, войдите снова.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login?expired=true"); 
      }
    });
  };
  

  const handleDeleteProduct = (id) => {
    const confirmDelete = window.confirm("Вы уверены, что хотите удалить этот товар?");
    if (!confirmDelete) return;
  
    axiosInstance.delete(`${baseURL}/api/products/${id}`)
      .then(() => {
        setAlertMessage("🗑 Товар успешно удалён");
        setAlertType("success");
        fetchProducts();
  
        // Очистить сообщение через 3 секунды
        setTimeout(() => setAlertMessage(""), 3000);
      })
      .catch(err => {
        console.error("Ошибка при удалении товара", err);
        setAlertMessage("⚠️ Ошибка при удалении товара");
        setAlertType("error");
        setTimeout(() => setAlertMessage(""), 3000);
      });
  };

  console.log("User:", user);


  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1>Добро пожаловать</h1>
        {user?.roles[0]?.toLowerCase() === "admin" && (
          <button onClick={() => navigate("/admin")}>Управление пользователями</button>
        )}
      </div>

      <h2>📦 Список товаров</h2>

      {alertMessage && (
  <div className={`alert alert-${alertType}`}>
    {alertMessage}
    <button className="close-btn" onClick={() => setAlertMessage("")}>✖</button>
  </div>
)}

      {user?.roles[0]?.toLowerCase() === "admin" && (
        <button onClick={() => navigate("/add-product")} style={{ marginBottom: "1rem" }}>
          ➕ Добавить товар
        </button>
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="🔍 Поиск по названию"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">Все категории</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="products-wrapper">
  <div className="products-grid">
    {filtered.map(product => (
      <div key={product.id} className="product-card">
            {product.imagePath && (
             <img
             src={
               product.imagePath?.startsWith("http")
                 ? product.imagePath
                 : `${baseURL}/uploads/images/${product.imagePath}`
             }
             alt={product.name}
             className="product-image"
             onError={(e) => (e.target.style.display = "none")}
           />
            )}
            <h3>{product.name}</h3>
            <p><strong>Цена:</strong> {product.price}₽</p>
            <p><strong>Количество:</strong> {product.quantity}</p>
            <p><strong>Категория:</strong> {product.categoryName || "—"}</p>
            <p><strong>Поставщик:</strong> {product.descriptionName || "—"}</p>

            {user?.roles[0]?.toLowerCase() !== "admin" && (
              <button onClick={() => addToCart(product.id)} className="add-btn">
                🛒 В корзину
              </button>
            )}
            {user?.roles[0]?.toLowerCase() === "admin" && (
              <button onClick={() => handleDeleteProduct(product.id)} className="delete-btn">
                🗑 Удалить
              </button>
            )}
            
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

export default Products;
