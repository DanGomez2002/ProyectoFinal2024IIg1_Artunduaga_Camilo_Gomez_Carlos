import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { storage, db } from '../../firebase.js'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import './CreateNewsPage.css'; // <-- Importa los nuevos estilos

function CreateNewsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Estados de datos
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(''); 
  const [imageFile, setImageFile] = useState(null); 
  const [sections, setSections] = useState([]); // Secciones dinámicas

  // Estados de control
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar secciones dinámicamente (RF-08)
  useEffect(() => {
    const sectionsColRef = collection(db, 'sections');
    const unsubscribe = onSnapshot(sectionsColRef, (snapshot) => {
        const sectionsData = snapshot.docs.map(doc => doc.data().name);
        setSections(sectionsData);
        // Inicializa la categoría seleccionada
        if (sectionsData.length > 0 && !category) {
            setCategory(sectionsData[0]); 
        }
    }, (err) => {
        setError("Error al cargar secciones: " + err.message);
    });
    return () => unsubscribe();
  }, [category]); 

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Por favor, selecciona una imagen para la noticia.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Subir la imagen a Firebase Storage (RF-06)
      const storageRef = ref(storage, `news-images/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);

      // 2. Guardar la noticia en Firestore (RF-06)
      const newsCollectionRef = collection(db, 'news');
      await addDoc(newsCollectionRef, {
        title,
        subtitle,
        content,
        category,
        imageUrl,
        author: currentUser.uid, 
        authorEmail: currentUser.email,
        status: 'Edición', // Estado inicial (RF-07)
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setLoading(false);
      navigate('/dashboard');

    } catch (err) {
      setError('Error al crear la noticia: ' + err.message);
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div className="form-page-container"> {/* <-- CLASE GLOBAL */}
      <div className="form-card"> {/* <-- CLASE DEL CONTENEDOR DE LA TARJETA */}
        <h2>Crear Nueva Noticia</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          
          {error && <p className="error-message">{error}</p>}

          {/* Grupo: Título */}
          <div className="form-group">
            <label htmlFor="title">Título:</label>
            <input
              id="title" type="text" value={title}
              onChange={(e) => setTitle(e.target.value)} required
              className="form-input"
            />
          </div>
          
          {/* Grupo: Subtítulo */}
          <div className="form-group">
            <label htmlFor="subtitle">Subtítulo (Bajante):</label>
            <input
              id="subtitle" type="text" value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)} required
              className="form-input"
            />
          </div>

          {/* Grupo: Categoría (Dinámica RF-10) */}
          <div className="form-group">
            <label htmlFor="category">Categoría:</label>
            <select 
              id="category" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="form-input form-select"
            >
              {sections.length > 0 ? (
                  sections.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                  ))
              ) : (
                  <option value="" disabled>Cargando Secciones...</option>
              )}
            </select>
          </div>

          {/* Grupo: Imagen (RF-06) */}
          <div className="form-group">
            <label htmlFor="image">Imagen de Portada:</label>
            <input
              id="image" type="file"
              onChange={handleImageChange} required
              accept="image/*" 
              className="form-input"
            />
          </div>

          {/* Grupo: Contenido */}
          <div className="form-group">
            <label htmlFor="content">Contenido:</label>
            <textarea
              id="content" value={content}
              onChange={(e) => setContent(e.target.value)} required
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
            {loading ? 'Guardando...' : 'Guardar Noticia (en Edición)'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateNewsPage;