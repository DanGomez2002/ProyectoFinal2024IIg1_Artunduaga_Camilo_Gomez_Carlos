import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx'; 
import './RegisterPage.css'; // Asegúrate de que el CSS exista

function RegisterPage() {
  const [name, setName] = useState(''); // Estado para el nombre
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Reportero'); // Valor por defecto
  const [error, setError] = useState('');
  
  const { signup } = useAuth(); // Obtenemos la función de registro
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      // Pasamos 'name' como el cuarto argumento
      await signup(email, password, role, name); 
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está en uso.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo no es válido.');
      } else {
        setError('Error al crear la cuenta. Inténtalo de nuevo.');
      }
      console.error(err);
    }
  };

  return (
    // Usamos las clases de CSS Puro que definimos en Auth.css
    <div className="auth-page-container">
      <div className="auth-form-card">
        <h2 className="auth-title">Crear Cuenta</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          
          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {/* CAMPO "NOMBRE" AÑADIDO */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">Nombre Completo</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="auth-input"
            />
          </div>
          
          {/* Campo de Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </div>
          
          {/* Campo de Contraseña */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          {/* Campo de Rol */}
          <div className="form-group">
            <label htmlFor="role" className="form-label">Rol</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="auth-input auth-select"
            >
              <option value="Reportero">Reportero</option>
              <option value="Editor">Editor</option>
            </select>
          </div>

          <button 
            type="submit"
            className="btn-auth-submit"
          >
            Registrar
          </button>
        </form>

        <p className="auth-toggle-link">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;