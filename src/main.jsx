// src/main.jsx (Código Final)

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
// Contexto
import { AuthProvider } from "./context/AuthContext";
// Layout Principal
import App from "./App.jsx";
// Componentes
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
// Páginas
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage/DashboardPage.jsx";
import CreateNewsPage from "./pages/CreateNewsPage/CreateNewsPage.jsx";
import EditNewsPage from "./pages/EditNewsPage/EditNewsPage.jsx";
import SectionAdminPage from './pages/SectionAdminPage/SectionAdminPage.jsx';
// Front
import HomePage from "./pages/HomePage/HomePage.jsx";
import NewsDetailPage from "./pages/NewsDetailPage/NewsDetailPage.jsx";

// Definición de Rutas
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // --- RUTAS PÚBLICAS ---
      {
        path: "/",
        element: <HomePage />, // <-- CORREGIDO: Usar la página principal real
      },
      {
        path: "/noticia/:id",
        element: <NewsDetailPage />, // <-- CORREGIDO: Usar la página de detalle real
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/registro",
        element: <RegisterPage />,
      }, // --- RUTAS PRIVADAS (Panel Administrativo) ---

      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />{" "}
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/crear-noticia",
        element: (
          <ProtectedRoute>
            <CreateNewsPage />{" "}
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/editar-noticia/:id",
        element: (
          <ProtectedRoute>
            <EditNewsPage />{" "}
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard/secciones',
        element: (
          <ProtectedRoute>
            <SectionAdminPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

// Renderizado de la App
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {" "}
    <AuthProvider>
      <RouterProvider router={router} />{" "}
    </AuthProvider>{" "}
  </React.StrictMode>
);
