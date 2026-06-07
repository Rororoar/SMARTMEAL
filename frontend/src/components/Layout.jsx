import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Icon } from "./Icons";

const FOOTER_HEADING = "SmartMeal - Your healthy meal planning companion";
const FOOTER_TAGLINE = `Eat well, live well, reduce waste ${"\u{1F331}"}`;

const primaryLinks = [
  { to: "/", label: "Calendar", icon: "calendar", end: true },
  { to: "/recipes", label: "Recipes", icon: "recipes" },
  { to: "/grocery", label: "Grocery", icon: "grocery" },
  { to: "/meal-prep", label: "Meal Prep", icon: "prep" },
  { to: "/profile", label: "Profile", icon: "profile" }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <header className="top-header">
        <div className="header-bar">
          <div className="brand-lockup">
            <Icon name="leaf" className="brand-mark" />
            <div>
              <h1>SmartMeal</h1>
              <p>Plan healthy, eat happy</p>
            </div>
          </div>
          <div className="header-meta">
            <NavLink to="/history" className="header-action-button">
              <Icon name="history" className="mini-icon" />
              History
            </NavLink>
            <NavLink to="/profile" className="header-action-button user-chip">
              <Icon name="profile" className="mini-icon" />
              {user?.name}
            </NavLink>
            <button type="button" className="header-action-button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
        <nav className="top-nav" aria-label="Primary">
          {primaryLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              <Icon name={link.icon} className="mini-icon" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="app-main">
        <div className="page-frame">
          <Outlet />
        </div>
        <footer className="site-footer">
          <p>{FOOTER_HEADING}</p>
          <p>{FOOTER_TAGLINE}</p>
        </footer>
      </div>
    </div>
  );
}
