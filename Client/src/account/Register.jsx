import  { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

function Register() {
  const [formData, setFormData] = useState({
    login: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();
  const {login} = useContext(AuthContext);


  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    // Проверка совпадения паролей
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
  
    try {
      // Логируем данные, которые отправляем на сервер
      console.log(formData); // для отладки
  
      const response = await axios.post('https://localhost:7118/api/account/register', formData);
  
      console.log('Успешная регистрация:', response.data);
  
      const token = response.data.token;
  
      // Декодирование JWT
      const decoded = jwtDecode(token);
      const username = decoded?.name || "Пользователь";
      const role = decoded?.role || "user";
  
      // Логиним пользователя
      login(username, role, token);
  
      // Перенаправляем на главную страницу
      navigate('/');
  
    } catch (err) {
      console.error('Ошибка при регистрации:', err.response?.data); 
      const errors = err.response?.data;
  
      if (Array.isArray(errors)) {
        setError(errors.map(e => e.description).join(", "));
      } else if (typeof errors === 'string') {
        setError(errors);
      } else if (errors?.description) {
        setError(errors.description);
      } else {
        setError('Неизвестная ошибка при регистрации');
      }
    }
  };

  useEffect(() => {

    document.body.classList.add("body-register-background");

    // Удалить класс при размонтировании компонента
    return () => {
      document.body.classList.remove("body-register-background");
    };
  }, []);

  return (
    <div className='register-container'>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="login"
          placeholder="Логин"
          value={formData.login}
          onChange={handleChange}
          required
        /><br />

        <input
          type="email"
          name="email"
          placeholder="Почта"
          value={formData.email}
          onChange={handleChange}
          required
        /><br />

        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={handleChange}
          required
        /><br />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Повторите пароль"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        /><br />

        <button type="submit">Зарегистрироваться</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Register;
