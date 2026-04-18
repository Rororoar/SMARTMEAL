import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Grocery from "./pages/Grocery";
import History from "./pages/History";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import RecipeDetail from "./pages/RecipeDetail";
import Recipes from "./pages/Recipes";
import Register from "./pages/Register";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <main className="loading-screen">Loading SmartMeal...</main>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="recipes/:id" element={<RecipeDetail />} />
        <Route path="grocery" element={<Grocery />} />
        <Route path="history" element={<History />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
