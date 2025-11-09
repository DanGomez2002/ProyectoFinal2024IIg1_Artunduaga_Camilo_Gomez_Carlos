// src/pages/RegisterPage/RegisterPage.jsx

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Corregido a ../../
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css'; // Importamos el CSS modular

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Reportero'); // Valor por defecto
  const [error, setError] = useState('');
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiamos errores anteriores

    // Validación simple de contraseña
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      // Llamamos a la función de registro del context
      await signup(email, password, role);
      
      // Si todo sale bien, lo mandamos al Dashboard
      navigate('/dashboard');
    } catch (err) {
      // Manejamos errores comunes de Firebase
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
    <div className="register-container"> {/* Clase para el CSS */}
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit} className="register-form">
        
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

        {/* Campo para seleccionar el rol (RF-03) */}
        <div className="form-group">
          <label htmlFor="role">Rol:</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
            [cite_start]<option value="Reportero">Reportero</option> [cite: 11]
            [cite_start]<option value="Editor">Editor</option> [cite: 12]
          </select>
        </div>

        <button type="submit" className="submit-button">Registrar</button>
      </form>
    </div>
  );
}

export default RegisterPage;