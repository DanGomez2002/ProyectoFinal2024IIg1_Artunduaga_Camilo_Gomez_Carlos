import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css'; // Asegúrate de crear este archivo CSS

function NotFoundPage() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Página No Encontrada</h2>
        <p className="not-found-message">
          Lo sentimos, la URL que has solicitado no existe en nuestra aplicación.
        </p>
        <Link to="/" className="not-found-link">
          &larr; Volver a la página principal
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;