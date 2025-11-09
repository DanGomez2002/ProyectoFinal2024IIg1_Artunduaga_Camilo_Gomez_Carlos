import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx"; // Asegura la extensión .jsx
import { useNavigate, Link } from "react-router-dom";
import "./RegisterPage.css"; // Asegúrate de que este archivo exista

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Reportero"); // Valor por defecto
  const [error, setError] = useState("");

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validación simple de contraseña
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      // Llama a la función de registro del context (RF-01, RF-03)
      await signup(email, password, role);

      // Si todo sale bien, lo manda al Dashboard (RF-04)
      navigate("/dashboard");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Este correo electrónico ya está en uso.");
      } else if (err.code === "auth/invalid-email") {
        setError("El formato del correo no es válido.");
      } else {
        setError("Error al crear la cuenta. Inténtalo de nuevo.");
      }
      console.error(err);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-card">
        <h2>Registro de Usuario</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
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
              className="auth-input"
            />
          </div>

          {/* Campo para seleccionar el rol (RF-03) */}
          <div className="form-group">
            <label htmlFor="role">Rol:</label>
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

          <button type="submit" className="btn-auth-submit">
            Registrar
          </button>
        </form>

        <p className="auth-toggle-link">
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
