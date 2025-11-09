import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Esta llamada ahora es MÁS LENTA porque espera el rol (Paso 1).
      await login(email, password);

      // La navegación solo ocurre si la función login (con rol incluido) terminó con éxito.
      navigate("/dashboard");
    } catch (err) {
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Correo o contraseña incorrectos.");
      } else {
        setError("Error al iniciar sesión. Inténtalo de nuevo.");
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-card">
        <h2>Iniciar Sesión</h2>
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
              disabled={isSubmitting} // Deshabilitar durante el envío
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
              disabled={isSubmitting} // Deshabilitar durante el envío
            />
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={isSubmitting} // Deshabilitar durante el envío
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="auth-toggle-link">
          ¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
