import { useState, useEffect } from "react";
import axios from "axios";

function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
    descriptionId: "",
    categoryId: ""
  });

  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const baseURL = import.meta.env.VITE_API_URL || "https://localhost:7118";
  const token = localStorage.getItem("accessToken");

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  useEffect(() => {
    if (!token) {
      alert("❌ Вы не авторизованы!");
      return;
    }
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      const [catRes, descRes] = await Promise.all([
        axios.get(`${baseURL}/api/categories`),
        axios.get(`${baseURL}/api/descriptions`)
      ]);
      setCategories(catRes.data);
      setDescriptions(descRes.data);
    } catch (err) {
      console.error("Ошибка загрузки метаданных:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (image) formData.append("image", image);

    try {
      await axios.post(`${baseURL}/api/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("✅ Товар добавлен!");
      setForm({
        name: "",
        price: "",
        quantity: "",
        descriptionId: "",
        categoryId: ""
      });
      setImage(null);
    } catch (err) {
      console.error("Ошибка добавления:", err);
      alert("❌ Ошибка при добавлении товара.");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await axios.post(`${baseURL}/api/categories`, { name: newCategory }, authHeaders);
      setNewCategory("");
      fetchMeta();
      alert("✅ Категория добавлена!");
    } catch (err) {
      console.error("Ошибка при добавлении категории:", err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Удалить эту категорию?")) return;
    try {
      await axios.delete(`${baseURL}/api/categories/${id}`, authHeaders);
      fetchMeta();
      alert("✅ Категория удалена!");
    } catch (err) {
      console.error("Ошибка при удалении категории:", err);
    }
  };

  const handleAddDescription = async () => {
    if (!newDescription.trim()) return;
    try {
      await axios.post(`${baseURL}/api/descriptions`, { name: newDescription }, authHeaders);
      setNewDescription("");
      fetchMeta();
      alert("✅ Описание добавлено!");
    } catch (err) {
      console.error("Ошибка при добавлении описания:", err);
    }
  };

  const handleDeleteDescription = async (id) => {
    if (!window.confirm("Удалить это описание?")) return;
    try {
      await axios.delete(`${baseURL}/api/descriptions/${id}`, authHeaders);
      fetchMeta();
      alert("✅ Описание удалено!");
    } catch (err) {
      console.error("Ошибка при удалении описания:", err);
    }
  };

  return (
    <div className="page-wrapper" style={{ paddingTop: "200px" }}>
      <div className="card" style={{ maxWidth: "600px", margin: "auto" }}>
        <h2 style={{ textAlign: "center" }}>Добавить товар</h2>
        <form onSubmit={handleSubmit}>
          <div className="card">
            <label>Название</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="card">
            <label>Цена</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} required />
          </div>

          <div className="card">
            <label>Количество</label>
            <input name="quantity" type="number" value={form.quantity} onChange={handleChange} required />
          </div>

          <div className="card">
            <label>Изображение</label>
            <input type="file" onChange={handleImageChange} />
            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="Предпросмотр"
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  marginTop: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px"
                }}
              />
            )}
          </div>

          <div className="card">
            <label>Поставщик</label>
            <select name="descriptionId" value={form.descriptionId} onChange={handleChange}>
              <option value="">-- выберите поставщика --</option>
              {descriptions.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: "10px", marginTop: "0.5rem" }}>
              <input
                type="text"
                placeholder="Новый поставщик"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <button type="button" onClick={handleAddDescription}>➕</button>
            </div>
            <div className="card">
              <label>Удалить описание</label>
              <select
                value=""
                onChange={(e) => handleDeleteDescription(e.target.value)}
              >
                <option value="">-- выбрать для удаления --</option>
                {descriptions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card">
            <label>Категория</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange}>
              <option value="">-- выберите категорию --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: "10px", marginTop: "0.5rem" }}>
              <input
                type="text"
                placeholder="Новая категория"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button type="button" onClick={handleAddCategory}>➕</button>
            </div>
            <div className="card">
              <label>Удалить категорию</label>
              <select
                value=""
                onChange={(e) => handleDeleteCategory(e.target.value)}
              >
                <option value="">-- выбрать для удаления --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="add-btn" style={{ marginTop: "1rem" }}>
            Добавить товар
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
