import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">FYP Meal Planner</p>
          <h1>SmartMeal</h1>
        </div>
        <nav className="main-nav">
          <NavLink to="/">Weekly Plan</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <NavLink to="/recipes">Recipes</NavLink>
          <NavLink to="/grocery">Grocery</NavLink>
          <NavLink to="/history">History</NavLink>
        </nav>
        <div className="account-panel">
          <span>{user?.name}</span>
          <button type="button" className="text-button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>
      <Outlet />
    </div>
  );
}

