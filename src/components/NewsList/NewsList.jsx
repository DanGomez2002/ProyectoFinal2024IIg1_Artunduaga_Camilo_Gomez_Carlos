import { useState, useEffect } from "react";
// Se mantienen las importaciones limpias de tu compañero, pero asegurando el .js/jsx en las rutas relativas si es necesario
import { db, storage } from "../../firebase.js"; 
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
import { useAuth } from "../../context/AuthContext.jsx"; 
import { Link, useNavigate } from "react-router-dom"; // Mantenemos useNavigate
import "./NewsList.css";

function NewsList({ mode }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate(); // Inicializamos useNavigate

  // 🛠️ Función de Estado con Navegación Condicional (Tu funcionalidad)
  const handleChangeStatus = async (
    newsId,
    newStatus,
    shouldNavigate = false // Parámetro para saber si navegar después del cambio
  ) => {
    if (
      !window.confirm(`¿Estás seguro de cambiar el estado a "${newStatus}"?`)
    ) {
      return;
    }
    try {
      const docRef = doc(db, "news", newsId);
      await updateDoc(docRef, { status: newStatus });

      // Redirige al Reportero después de "Terminar y Revisar"
      if (shouldNavigate) {
        navigate(`/dashboard/editar-noticia/${newsId}`);
      }
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

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

    if (mode === "reporter") {
      q = query(
        newsCollectionRef,
        where("author", "==", currentUser.uid)
        // Usamos la ordenación aquí, asumiendo que el índice (author, createdAt) es requerido
        , orderBy("createdAt", "desc") 
      );
    } else if (mode === "editor") {
      // El Editor ve todas las noticias
      q = query(newsCollectionRef, orderBy("createdAt", "desc"));
    }

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
                "https://placehold.co/120x90/E0E0E0/333333?text=Sin+Imagen";
            }}
          />
          <div className="news-item-content">
            <h3>{item.title}</h3>
            <p className="news-meta">
              <span>Autor: {item.authorName || item.authorEmail}</span>
              <span>Categoría: {item.category}</span>
            </p>
            <p>
              Estado:
              {/* Usamos un tag span con la clase status-tag para el CSS */}
              <span className={`status-tag status-${item.status}`}>
                {item.status}
              </span>
            </p>

            <div className="news-actions">
              {/* ACCIONES DE REPORTERO */}
              {userRole === "Reportero" && item.author === currentUser.uid && (
                <>
                  {/* VER NOTICIA PUBLICADA (Link público) */}
                  {item.status === "Publicado" && (
                    <Link
                      to={`/noticia/${item.id}`} 
                      className="action-link view"
                      target="_blank"
                    >
                      Ver Publicación
                    </Link>
                  )}

                  {/* BOTÓN TERMINAR (Actualiza estado Y navega a edición) */}
                  {item.status === "Edición" && (
                    <button
                      onClick={() =>
                        // 🟢 AQUÍ: Usamos true para shouldNavigate para redirigir
                        handleChangeStatus(item.id, "Terminado", true) 
                      } 
                      className="action-button finish"
                    >
                      Terminar y Revisar
                    </button>
                  )}

                  {/* EDITAR (Link a edición/detalle) */}
                  {(item.status === "Edición" ||
                    item.status === "Desactivado" ||
                    item.status === "Terminado") && (
                    <Link
                      to={`/dashboard/editar-noticia/${item.id}`}
                      className="action-link edit"
                    >
                      {item.status === "Terminado" ? "Ver Detalles" : "Editar"}
                    </Link>
                  )}

                  {/* ELIMINAR */}
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

              {/* ACCIONES DE EDITOR */}
              {userRole === "Editor" && (
                <>
                  {/* VER NOTICIA PUBLICADA (Link público) */}
                  <Link
                    to={`/noticia/${item.id}`}
                    className="action-link view"
                    target="_blank"
                  >
                    Ver Publicación
                  </Link>

                  {/* PUBLICAR */}
                  {item.status === "Terminado" && (
                    <button
                      onClick={() => handleChangeStatus(item.id, "Publicado")}
                      className="action-button publish"
                    >
                      Publicar
                    </button>
                  )}

                  {/* DESACTIVAR */}
                  {item.status === "Publicado" && (
                    <button
                      onClick={() => handleChangeStatus(item.id, "Desactivado")}
                      className="action-button deactivate"
                    >
                      Desactivar
                    </button>
                  )}

                  {/* A EDICIÓN */}
                  {(item.status === "Desactivado" ||
                    item.status === "Terminado") && (
                    <button
                      onClick={() => handleChangeStatus(item.id, "Edición")}
                      className="action-button edit-back"
                    >
                      A Edición
                    </button>
                  )}

                  {/* EDITAR (Link a edición/detalle) */}
                  <Link
                    to={`/dashboard/editar-noticia/${item.id}`}
                    className="action-link edit-editor"
                  >
                    Editar
                  </Link>

                  {/* ELIMINAR */}
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