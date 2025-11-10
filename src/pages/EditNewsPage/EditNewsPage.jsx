import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Rutas corregidas para compatibilidad
import { storage, db } from "../../firebase.js"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  collection,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext.jsx"; 
import "../CreateNewsPage/CreateNewsPage.css"; // Usamos el CSS del formulario de creación

function EditNewsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [news, setNews] = useState(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar datos y secciones
  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    const fetchNews = async () => {
      const docRef = doc(db, "news", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // **VALIDACIÓN DE ROL: Bloqueo de Reportero**
        if (
          data.author !== currentUser.uid &&
          currentUser.role === "Reportero"
        ) {
          setError(
            "No tienes permiso para editar esta noticia. Solo el autor o un Editor pueden modificarla."
          );
          setLoading(false);
          return;
        }

        setNews(data);
        setTitle(data.title);
        setSubtitle(data.subtitle);
        setContent(data.content);
        setCategory(data.category);
      } else {
        setError("Noticia no encontrada.");
      }
      setLoading(false);
    };
    fetchNews();

    // Cargar secciones dinámicamente
    const sectionsColRef = collection(db, "sections");
    const unsubscribe = onSnapshot(sectionsColRef, (snapshot) => {
      const sectionsData = snapshot.docs.map((doc) => doc.data().name);
      setSections(sectionsData);
    });
    return () => unsubscribe();
  }, [id, currentUser]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let imageUrl = news.imageUrl;

      if (imageFile) {
        const storageRef = ref(
          storage,
          `news-images/${Date.now()}_${imageFile.name}`
        );
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const updatedData = {
        title,
        subtitle,
        content,
        category,
        imageUrl,
        updatedAt: serverTimestamp(),
        // 🟢 Lógica de flujo de estado: Vuelve a 'Edición' si estaba Terminado (RF-07)
        status: news.status === "Terminado" ? "Edición" : news.status,
      };

      const docRef = doc(db, "news", id);
      await updateDoc(docRef, updatedData);

      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      setError("Error al actualizar la noticia: " + err.message);
      setLoading(false);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="form-page-container loading-message">
        Cargando formulario de edición...
      </div>
    );
  }

  // Manejo de error de permisos
  if (error) {
    return (
      <div className="form-page-container">
        <div className="form-card">
          <p className="error-message">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-primary btn-form-submit" // Usamos la clase de botón adaptada
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page-container">
      <div className="form-card">
        <h2 className="form-title">Editar Noticia: {title}</h2>

        <form onSubmit={handleSubmit} className="admin-form">
          {error && <p className="error-message">{error}</p>}

          {/* Grupo: Título */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">Título:</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="form-input"
            />
          </div>

          {/* Grupo: Subtítulo */}
          <div className="form-group">
            <label htmlFor="subtitle" className="form-label">Subtítulo (Bajante):</label>
            <input
              id="subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              required
              className="form-input"
            />
          </div>

          {/* Grupo: Categoría */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">Categoría:</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input form-select"
            >
              {sections.length > 0 ? (
                sections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))
              ) : (
                <option value={category}>{category || "Sin Categoría"}</option>
              )}
            </select>
          </div>

          {/* Manejo de la imagen */}
          <div className="form-group">
            <label className="form-label">Imagen Actual:</label>
            {news?.imageUrl && (
              <img
                src={news.imageUrl}
                alt="Imagen Actual"
                className="current-image-preview"
              />
            )}
            <small>
              Selecciona un archivo si quieres reemplazar la imagen actual.
            </small>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="form-input"
            />
          </div>

          {/* Grupo: Contenido */}
          <div className="form-group">
            <label htmlFor="content" className="form-label">Contenido:</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows="10"
              className="form-input form-textarea"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary btn-form-submit`}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Actualizando..." : "Actualizar Noticia"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditNewsPage;