// src/pages/EditNewsPage/EditNewsPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage, db } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import './EditNewsPage.css';

function EditNewsPage() {
  // Obtener el ID de la noticia desde la URL
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Estados del formulario y datos actuales
  const [news, setNews] = useState(null); // Para la data original
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null); // Nueva imagen subida
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Efecto para Cargar la data original de la noticia
  useEffect(() => {
    const fetchNews = async () => {
      if (!currentUser) return;

      const docRef = doc(db, 'news', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // **Validación de rol (Solo el autor puede editar)**
        if (data.author !== currentUser.uid) {
             setError("No tienes permiso para editar esta noticia.");
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
    };
    fetchNews();
  }, [id, currentUser]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrl = news.imageUrl; // Usar la URL antigua por defecto

      // 2. Si se seleccionó una NUEVA IMAGEN, la subimos
      if (imageFile) {
        const storageRef = ref(storage, `news-images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      // 3. Crear el objeto con la data actualizada
      const updatedData = {
        title,
        subtitle,
        content,
        category,
        imageUrl,
        updatedAt: serverTimestamp(),
        // El estado se mantiene como "Edición" al editar
        status: news.status === 'Terminado' ? 'Edición' : news.status,
      };

      // 4. Actualizar el documento en Firestore
      const docRef = doc(db, 'news', id);
      await updateDoc(docRef, updatedData);

      setLoading(false);
      navigate('/dashboard'); // Volver al dashboard
    } catch (err) {
      setError('Error al actualizar la noticia: ' + err.message);
      setLoading(false);
      console.error(err);
    }
  };

  if (error && error !== "No tienes permiso para editar esta noticia.") {
    return <div className="loading-error">{error}</div>;
  }
  
  // Mostrar formulario
  return (
    <div className="edit-news-container">
      <h2>Editar Noticia: {title}</h2>
      
      {/* Mensaje de error de permiso */}
      {error && error === "No tienes permiso para editar esta noticia." && (
        <div className="permission-error">
            <p>{error}</p>
            <button onClick={() => navigate('/dashboard')}>Volver al Dashboard</button>
        </div>
      )}

      {/* Si la noticia no se ha cargado o hay un error de permiso, no mostrar el formulario */}
      {news && !error && (
        <form onSubmit={handleSubmit} className="edit-news-form">
          {/* Aquí va el formulario similar al de Crear Noticia */}
          
          <div className="form-group">
            <label>Título:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          
          {/* ... otros campos: Subtítulo, Categoría, Contenido ... (usar el código de CreateNewsPage) */}
          <div className="form-group">
            <label>Subtítulo (Bajante):</label>
            <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Categoría:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Tecnologia">Tecnología</option>
              <option value="Deportes">Deportes</option>
              <option value="Politica">Política</option>
              <option value="Cultura">Cultura</option>
            </select>
          </div>

          <div className="form-group">
            <label>Contenido:</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows="10" />
          </div>
          
          {/* Manejo de la imagen */}
          <div className="form-group current-image">
            <label>Imagen Actual:</label>
            <img src={news.imageUrl} alt="Actual" width="100"/>
            <input type="file" onChange={handleImageChange} accept="image/*" />
            <small>Selecciona un archivo si quieres reemplazar la imagen actual.</small>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar Noticia'}
          </button>
        </form>
      )}
    </div>
  );
}

export default EditNewsPage;