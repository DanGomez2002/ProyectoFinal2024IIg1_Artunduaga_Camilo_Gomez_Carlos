// src/components/ProtectedRoute/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // <-- RUTA CORREGIDA


// Este componente recibirá "children", que son las rutas
// que queremos proteger (en este caso, el Dashboard).
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth(); // 1. Traemos al usuario actual

  // 2. Comprobamos si el usuario NO existe
  if (!currentUser) {
    // 3. Si no existe, lo redirigimos a /login
    return <Navigate to="/login" replace />; 
    // 'replace' evita que pueda volver atrás con la flecha del navegador
  }

  // 4. Si el usuario SÍ existe, mostramos el contenido
  // que estaba intentando ver.
  return children;
}

export default ProtectedRoute;