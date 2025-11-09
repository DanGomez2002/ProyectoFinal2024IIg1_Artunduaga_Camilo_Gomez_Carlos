// src/pages/LoginPage/LoginPage.jsx

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Corregido a ../../
import { useNavigate, Link } from 'react-router-dom'; // Importamos Link
import './LoginPage.css'; // Importamos el CSS modular

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth(); // Traemos la función de login
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Llamamos a la función de login del context
      await login(email, password);
      
      // Si todo sale bien, lo mandamos al Dashboard
      navigate('/dashboard');
    } catch (err) {
      // Manejamos errores comunes de Firebase
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError('Error al iniciar sesión. Inténtalo de nuevo.');
      }
      console.error(err);
    }
  };

  return (
    <div className="login-container"> {/* Clase para el CSS */}
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="login-form">
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-button">Ingresar</button>
      </form>

      <p className="toggle-auth">
        ¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>
      </p>
    </div>
  );
}

export default LoginPage;