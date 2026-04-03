import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>FinDash</h2>
      </div>

      <div className="navbar-links">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
          Dashboard
        </NavLink>

        {(user.role === "analyst" || user.role === "admin") && (
          <NavLink to="/records" className={({ isActive }) => (isActive ? "active" : "")}>
            Records
          </NavLink>
        )}

        {user.role === "admin" && (
          <NavLink to="/users" className={({ isActive }) => (isActive ? "active" : "")}>
            Users
          </NavLink>
        )}
      </div>

      <div className="navbar-user">
        <span className="user-info">
          {user.name} <span className="role-badge">{user.role}</span>
        </span>
        <button onClick={logout} className="btn btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
