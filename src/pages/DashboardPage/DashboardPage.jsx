import { useAuth } from "../../context/AuthContext"; 
import { useNavigate, Link } from "react-router-dom";
import NewsList from "../../components/NewsList/NewsList.jsx";
import "./DashboardPage.css"; 

function DashboardPage() {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Panel de Administración</h1>
        
        <div className="user-info-wrapper"> {/* Contenedor para el info de usuario y botón */}
          <div className="user-info-text-details">
            <h3 className="user-info-text">
              Hola, {currentUser?.email}
            </h3>
            <span className={`user-role-tag role-${userRole}`}>
              Rol: {userRole}
            </span>
          </div>
          
          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        
        {/* VISTA DEL REPORTERO */}
        {userRole === "Reportero" && (
          <div className="reportero-view">
            <div className="dashboard-actions">
              <h2>Mis Noticias</h2>
              <Link to="/dashboard/crear-noticia" className="create-news-link">
                + Crear Nueva Noticia
              </Link>
            </div>
            <NewsList mode="reporter" />
          </div>
        )}

        {/* VISTA DEL EDITOR */}
        {userRole === "Editor" && (
          <div className="editor-view">
            <div className="dashboard-actions">
              <h2>Todas las Noticias</h2>
              <Link to="/dashboard/secciones" className="admin-sections-link">
                Administrar Secciones
              </Link>
            </div>
            <NewsList mode="editor" />
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;