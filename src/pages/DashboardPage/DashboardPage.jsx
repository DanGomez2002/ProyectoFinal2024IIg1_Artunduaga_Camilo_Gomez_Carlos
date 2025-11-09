import { useAuth } from "../../context/AuthContext"; // Importación limpia
import { useNavigate, Link } from "react-router-dom";
import NewsList from "../../components/NewsList/NewsList.jsx";
import "./DashboardPage.css"; // Asegúrate de que este archivo exista

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
      {" "}
      {/* CLASE DEL CONTENEDOR PRINCIPAL */}{" "}
      <header className="dashboard-header">
        {" "}
        {/* CLASE DEL HEADER */} <h1>Panel de Administración</h1>
        {" "}
        <div className="user-info">
          {" "}
          {/* CLASE DE INFORMACIÓN DE USUARIO */}{" "}
          <div className="user-text-details">
            {" "}
            {/* Contenedor para alinear texto */}{" "}
            <span className="user-email">Hola, {currentUser?.email}</span>
            {" "}
            <span className={`user-role-tag role-${userRole}`}>
              {" "}
              {/* Clases de Rol Dinámico */}
              Rol: {userRole}
            </span>
            {" "}
          </div>
          {" "}
          <button onClick={handleLogout} className="logout-button">
            {" "}
            {/* CLASE DEL BOTÓN */} Cerrar Sesión {" "}
          </button>
          {" "}
        </div>
        {" "}
      </header>
      {" "}
      <main className="dashboard-content">
        {" "}
        {/* CLASE DEL CONTENEDOR DE CONTENIDO */}{" "}
        {/* VISTA DEL REPORTERO */}{" "}
        {userRole === "Reportero" && (
          <div className="reportero-view">
            {" "}
            <div className="dashboard-actions">
              {" "}
              {/* CLASE DE ACCIONES */} <h2>Mis Noticias</h2>
              {" "}
              <Link to="/dashboard/crear-noticia" className="create-news-link">
                {" "}
                {/* CLASE DE BOTÓN */} + Crear Nueva Noticia
                {" "}
              </Link>
             {" "}
            </div>
             <NewsList mode="reporter" />{" "}
          </div>
        )}
        {/* VISTA DEL EDITOR */}{" "}
        {userRole === "Editor" && (
          <div className="editor-view">
           {" "}
            <div className="dashboard-actions">
              {" "}
              {/* CLASE DE ACCIONES */} <h2>Todas las Noticias</h2>
              {" "}
              <Link to="/dashboard/secciones" className="admin-sections-link">
                {" "}
                {/* CLASE DE BOTÓN */} Administrar Secciones 
                {" "}
              </Link>
              {" "}
            </div>
             <NewsList mode="editor" />{" "}
          </div>
        )}
        {" "}
      </main>
      {" "}
    </div>
  );
}

export default DashboardPage;
