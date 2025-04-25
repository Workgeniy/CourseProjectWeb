import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const decoded = jwtDecode(token);
    const roles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    if (!(Array.isArray(roles) ? roles.includes("Admin") : roles === "Admin")) {
      navigate("/");
      return;
    }

    axios.get("https://localhost:7118/api/account/users", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setUsers(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [navigate, token]);

  const changeRole = (id, newRole) => {
    axios.post("https://localhost:7118/api/account/change-role", {
      userId: id,
      newRole: newRole
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      alert("Роль обновлена");
      // Обновим список
      setUsers(users =>
        users.map(u =>
          u.id === id ? { ...u, role: newRole } : u
        )
      );
    });
  };

  const deleteUser = (id) => {
    if (!window.confirm("Удалить пользователя?")) return;
    axios.delete(`https://localhost:7118/api/account/delete-user/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      setUsers(users.filter(u => u.id !== id));
    });
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Панель администратора</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "2rem" }}>
        <thead>
          <tr style={{ backgroundColor: "#eee" }}>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Логин</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Email</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Роль</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => {
            const isAdmin = user.role?.toLowerCase() === "admin";
            return (
              <tr key={user.id}>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{user.userName}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{user.email}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{user.role || "User"}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                  <button
                    className="change-btn"
                    onClick={() => changeRole(user.id, isAdmin ? "User" : "Admin")}
                  >
                    {isAdmin ? "Сделать User" : "Сделать Admin"}
                  </button>
                  <button
                    className="delete-btn"
                    style={{ marginLeft: "0.5rem" }}
                    onClick={() => deleteUser(user.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
