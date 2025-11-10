import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx'; 
import './Navbar.css'; // Importa tu archivo de estilos

function Navbar() {
  const { currentUser, userRole, logout } = useAuth();

  const handleLogout = async () => {
    try {
        await logout();
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    // Usa la clase 'navbar-main' para aplicar estilos
    <nav className="navbar-main">
      <div className="navbar-container">
        
        {/* Logo y Enlace Público */}
        <div className="navbar-logo">
          <Link to="/" className="navbar-link-brand">
            CMS Noticias
          </Link>
        </div>

        {/* Enlaces y Acciones */}
        <div className="navbar-links-actions">
          
          {currentUser ? (
            // VISTA LOGUEADA
            <>
              <Link 
                to="/dashboard" 
                className="navbar-link dashboard-link"
              >
                Dashboard ({userRole})
              </Link>
              
              <button 
                onClick={handleLogout} 
                className="navbar-button-logout"
              >
                Salir
              </button>
            </>
          ) : (
            // VISTA NO LOGUEADA (PÚBLICA)
            <>
              <Link 
                to="/login" 
                className="navbar-link login-link"
              >
                Iniciar Sesión
              </Link>
              <Link 
                to="/registro" 
                className="navbar-button-register"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;