// src/pages/DashboardPage/DashboardPage.jsx

import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import NewsList from '../../components/NewsList/NewsList.jsx'; // <-- 1. IMPORTAR
import './DashboardPage.css';

function DashboardPage() {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Panel de Administración</h1>
        <div className="user-info">
          <span>Hola, {currentUser?.email}</span>
          <span>(Rol: {userRole})</span>
          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        
        {/* VISTA DEL REPORTERO */}
        {userRole === 'Reportero' && (
          <div className="reportero-view">
            <div className="dashboard-actions">
              <h2>Mis Noticias</h2>
              <Link to="/dashboard/crear-noticia" className="create-news-link">
                + Crear Nueva Noticia
              </Link>
            </div>
            {/* 2. REEMPLAZAR EL PÁRRAFO POR EL COMPONENTE */}
            <NewsList mode="reporter" />
          </div>
        )}

        {/* VISTA DEL EDITOR */}
        {userRole === 'Editor' && (
          <div className="editor-view">
            <h2>Todas las Noticias</h2>
            {/* 3. REEMPLAZAR EL PÁRRAFO POR EL COMPONENTE */}
            <NewsList mode="editor" />
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;