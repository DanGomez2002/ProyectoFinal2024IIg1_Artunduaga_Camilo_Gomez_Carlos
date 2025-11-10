import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

// Contexto
import { AuthProvider } from "./context/AuthContext";
// Layout Principal (Tu App.jsx)
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

// Importar la página de Error (Asegúrate de que esta ruta exista)
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.jsx'; 

// Definición de Rutas
const router = createBrowserRouter([
  {
    // Ruta principal (Contiene el Layout: Navbar, Outlet, Footer)
    path: "/",
    element: <App />, 
    children: [
      // --- RUTAS PÚBLICAS DENTRO DEL LAYOUT ---
      {
        index: true, // Esto hace que "/" cargue HomePage
        element: <HomePage />, 
      },
      {
        path: "noticia/:id", // Rutas relativas
        element: <NewsDetailPage />, 
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "registro",
        element: <RegisterPage />,
      }, 

      // --- RUTAS PRIVADAS (Panel Administrativo) ---
      // Nota: Mantenemos el uso de rutas absolutas para compatibilidad con tu código.
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/crear-noticia",
        element: (
          <ProtectedRoute>
            <CreateNewsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/editar-noticia/:id",
        element: (
          <ProtectedRoute>
            <EditNewsPage />
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
  
  // --- RUTA GLOBAL DE ERROR (FUERA DEL LAYOUT) ---
  {
    path: "*", // Captura cualquier URL que no coincida con las anteriores
    element: <NotFoundPage />, // No estará envuelta por <App />
  },
]);

// Renderizado de la App
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);