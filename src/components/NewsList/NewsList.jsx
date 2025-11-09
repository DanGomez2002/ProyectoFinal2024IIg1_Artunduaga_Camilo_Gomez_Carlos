// src/components/NewsList/NewsList.jsx

import { useState, useEffect } from "react";
import { db, storage } from "../../firebase"; // 1. Importamos Storage
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore"; // 2. Importamos deleteDoc
import { ref, deleteObject } from "firebase/storage"; // 3. Importamos deleteObject
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import "./NewsList.css";

function NewsList({ mode }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userRole } = useAuth();

  // Función para cambiar el estado (ya la teníamos)
  const handleChangeStatus = async (newsId, newStatus) => {
    if (
      !window.confirm(`¿Estás seguro de cambiar el estado a "${newStatus}"?`)
    ) {
      return;
    }
    try {
      const docRef = doc(db, "news", newsId);
      await updateDoc(docRef, { status: newStatus });
      console.log(`Estado de noticia ${newsId} cambiado a ${newStatus}`);
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      alert("Hubo un error al cambiar el estado.");
    }
  };

  // 4. FUNCIÓN PARA ELIMINAR (DELETE)
  const handleDelete = async (newsId, imageUrl) => {
    if (
      !window.confirm(
        "¿Estás seguro de ELIMINAR permanentemente esta noticia? Esta acción es irreversible."
      )
    ) {
      return;
    }

    try {
      // 5. ELIMINAR el documento de Firestore
      const docRef = doc(db, "news", newsId);
      await deleteDoc(docRef);

      // 6. ELIMINAR la imagen de Storage
      if (imageUrl) {
        // Creamos la referencia al archivo usando la URL completa
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef).catch((storageError) => {
          // Capturamos el error si el archivo no existe (no es crítico)
          console.warn(
            "No se pudo eliminar el archivo de Storage. Probablemente ya no existe.",
            storageError
          );
        });
      }

      console.log(`Noticia y Storage eliminados: ${newsId}`);
    } catch (error) {
      console.error("Error al eliminar la noticia:", error);
      alert("Hubo un error al eliminar la noticia. Revisa la consola.");
    }
  };

  useEffect(() => {
    // ... (el useEffect de carga es el mismo) ...
    if (!currentUser) return;

    setLoading(true);
    const newsCollectionRef = collection(db, "news");
    let q;

    if (mode === "reporter") {
      q = query(
        newsCollectionRef,
        where("author", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
    } else if (mode === "editor") {
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
    return <p>Cargando noticias...</p>;
  }

  if (news.length === 0) {
    return <p>No hay noticias para mostrar.</p>;
  }

  return (
    <div className="news-list-container">
      {news.map((item) => (
        <div key={item.id} className="news-item">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="news-item-image"
          />
          <div className="news-item-content">
            <h3>{item.title}</h3>
            <p>Autor: {item.authorEmail}</p>
            <p>Categoría: {item.category}</p>
            <p>
              Estado:{" "}
              <span className={`status-${item.status}`}>{item.status}</span>
            </p>

            <div className="news-actions">
              {/* LÓGICA DEL REPORTERO */}
              {userRole === "Reportero" && item.author === currentUser.uid && (
                <>
                  {(item.status === "Edición" ||
                    item.status === "Desactivado") && (
                    <Link
                      to={`/dashboard/editar-noticia/${item.id}`}
                      className="action-link edit"
                    >
                      Editar
                    </Link>
                  )}
                  {item.status === "Edición" && (
                    <button
                      onClick={() => handleChangeStatus(item.id, "Terminado")}
                      className="action-button finish"
                    >
                      Terminar
                    </button>
                  )}
                  {/* BOTÓN DE ELIMINAR para Reportero (Solo si está en Edición/Desactivado) */}
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
                  {item.status === "Terminado" && (
                    <button
                      onClick={() => handleChangeStatus(item.id, "Publicado")}
                      className="action-button publish"
                    >
                      Publicar
                    </button>
                  )}

                  {item.status === "Publicado" && (
                    <button
                      onClick={() => handleChangeStatus(item.id, "Desactivado")}
                      className="action-button deactivate"
                    >
                      Desactivar
                    </button>
                  )}

                  {(item.status === "Desactivado" ||
                    item.status === "Terminado") && (
                    <button
                      onClick={() => handleChangeStatus(item.id, "Edición")}
                      className="action-button edit-back"
                    >
                      Enviar a Edición
                    </button>
                  )}

                  {/* El editor siempre puede eliminar, independientemente del estado */}
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
