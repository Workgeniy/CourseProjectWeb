import { useState } from 'react';
import axios from 'axios';
import "../App.css";

function AddProduct() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem('accessToken'); // JWT токен
       await axiosInstance.post(
        'http://localhost:7118/api/products',
        { name, price },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
       setMessage('Товар успешно добавлен!');
      setName('');
      setPrice('');
    } catch (error) {
      console.error('Ошибка при добавлении товара:', error);
      setMessage('Ошибка: ' + error.response?.data || error.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Добавить товар</h2>
      <input
        type="text"
        placeholder="Название"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 mr-2"
      />
      <input
        type="number"
        placeholder="Цена"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="border p-2 mr-2"
      />
      <button onClick={handleAdd} className="bg-blue-500 text-white p-2 rounded">
        Добавить
      </button>
      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
}

export default AddProduct;