import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import NewsList from "../../components/NewsList/NewsList.jsx";
import "./DashboardPage.css";

function DashboardPage() {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Panel de Administración</h1>
        {/* Información del usuario debajo del título */}
        <h3 className="user-info-text">
          Hola, {currentUser?.email} {userRole}
        </h3>
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
