import { useState, useEffect } from "react";
import { db, storage } from "../../firebase"; // Importación limpia (sin extensión)
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { useAuth } from "../../context/AuthContext"; // Importación limpia (sin extensión)
import { Link } from "react-router-dom";
import "./NewsList.css"; // <-- Importación necesaria para el estilo

function NewsList({ mode }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userRole } = useAuth();

  // Función para cambiar el estado (RF-07)
  const handleChangeStatus = async (newsId, newStatus) => {
    if (
      !window.confirm(`¿Estás seguro de cambiar el estado a "${newStatus}"?`)
    ) {
      return;
    }
    try {
      const docRef = doc(db, "news", newsId);
      await updateDoc(docRef, { status: newStatus });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

  // Función para eliminar (D de CRUD)
  const handleDelete = async (newsId, imageUrl) => {
    if (
      !window.confirm(
        "¿Estás seguro de ELIMINAR permanentemente esta noticia? Esta acción es irreversible."
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "news", newsId));

      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef).catch((storageError) => {
          console.warn(
            "Error al eliminar la imagen de Storage (puede que no exista).",
            storageError
          );
        });
      }
    } catch (error) {
      console.error("Error al eliminar la noticia:", error);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const newsCollectionRef = collection(db, "news");
    let q;

    // Definir la consulta según el rol (RF-05)
    if (mode === "reporter") {
      // ⬅️ SOLUCIÓN TEMPORAL: Quitamos orderBy para evitar el error de índice.
      // Cuando crees el índice en Firebase, puedes volver a añadir la línea orderBy.
      q = query(
        newsCollectionRef,
        where("author", "==", currentUser.uid)
        // Descomenta la siguiente línea una vez que el índice esté creado en Firebase:
        // , orderBy('createdAt', 'desc')
      );
    } else if (mode === "editor") {
      // El Editor ve todas las noticias, ordenadas por fecha
      q = query(newsCollectionRef, orderBy("createdAt", "desc"));
    }

    // Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNews(newsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener noticias:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [mode, currentUser]);

  if (loading) {
    return <p className="loading-message">Cargando noticias...</p>;
  }

  if (news.length === 0) {
    return (
      <p className="no-news-message">
        No hay noticias para mostrar en este momento.
      </p>
    );
  }

  return (
    <div className="news-list-container">
      {news.map((item) => (
        <div key={item.id} className="news-item">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="news-item-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/180x180/E0E0E0/333333?text=Sin+Imagen";
            }} // Fallback
          />
          <div className="news-item-content">
            <h3>{item.title}</h3>
            <p className="news-meta">
              <span>Autor: {item.authorEmail}</span>
              <span>Categoría: {item.category}</span>
            </p>
            {/* Estado dinámico (RF-07) */}
            <p>
              Estado:
              <span className={`status-tag status-${item.status}`}>
                {item.status}
              </span>
            </p>

            {/* BOTONES DE ACCIÓN */}
            <div className="news-actions">
              {/* LÓGICA DEL REPORTERO */}
              {userRole === "Reportero" && item.author === currentUser.uid && (
                <>
                  {/* Editar y Eliminar (Solo si está en Edición/Desactivado/Terminado) */}
                  {(item.status === "Edición" ||
                    item.status === "Desactivado" ||
                    item.status === "Terminado") && (
                    <Link
                      to={`/dashboard/editar-noticia/${item.id}`}
                      className="action-link edit"
                    >
                      Editar
                    </Link>
                  )}

                  {/* Pasar a Terminado */}
                  {item.status === "Edición" && (
                    <button
                      onClick={() => handleChangeStatus(item.id, "Terminado")}
                      className="action-button finish"
                    >
                      Terminar
                    </button>
                  )}

                  {/* Eliminar (Solo si está en Edición/Desactivado) */}
                  {(item.status === "Edición" ||
                    item.status === "Desactivado") && (
                    <button
                      onClick={() => handleDelete(item.id, item.imageUrl)}
                      className="action-button delete"
                    >
                      Eliminar
                    </button>
                  )}
                </>
              )}

              {/* LÓGICA DEL EDITOR */}
              {userRole === "Editor" && (
                <>
                  {/* El Editor ve los botones de acción para todas las noticias */}
                  {/* Publicar (Solo si está Terminado) */}
                  {item.status === "Terminado" && (
                    <button
                      onClick={() => handleChangeStatus(item.id, "Publicado")}
                      className="action-button publish"
                    >
                      Publicar
                    </button>
                  )}

                  {/* Desactivar (Solo si está Publicado) */}
                  {item.status === "Publicado" && (
                    <button
                      onClick={() => handleChangeStatus(item.id, "Desactivado")}
                      className="action-button deactivate"
                    >
                      Desactivar
                    </button>
                  )}

                  {/* Enviar a Edición (Solo si está Desactivado o Terminado) */}
                  {(item.status === "Desactivado" ||
                    item.status === "Terminado") && (
                    <button
                      onClick={() => handleChangeStatus(item.id, "Edición")}
                      className="action-button edit-back"
                    >
                      A Edición
                    </button>
                  )}

                  {/* El editor puede editar o eliminar siempre (RF-03) */}
                  <Link
                    to={`/dashboard/editar-noticia/${item.id}`}
                    className="action-link edit-editor"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id, item.imageUrl)}
                    className="action-button delete-editor"
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NewsList;
