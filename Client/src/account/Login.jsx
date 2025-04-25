import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../App.css";
import axiosInstance from "../utils/axiosInstance";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        try {
          const res = await axios.post("https://localhost:7118/api/account/login", {
            email,
            password,
          });
      
          console.log("Ответ от сервера:", res.data);
          const { accessToken , refreshToken, user } = res.data;
          login({ user, accessToken, refreshToken });
          navigate("/products");
        } catch (err) {
          setError("Неверный логин или пароль");
        }
      };

    useEffect(() => {
        // Добавить класс на <body>
        document.body.classList.add("body-login-background");
    
        // Удалить класс при размонтировании компонента
        return () => {
          document.body.classList.remove("body-login-background");
        };
      }, []);

    return (
        <div className="login-container">
            <h3>Авторизация</h3>
            <input type="email" placeholder="Логин" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleSubmit}>Войти</button>
            <a href="/register">Нет аккаунта? Зарегистрируйтесь</a>
            {error && <p color="red">{error}</p>}
        </div>
    );
};

export default Login;
