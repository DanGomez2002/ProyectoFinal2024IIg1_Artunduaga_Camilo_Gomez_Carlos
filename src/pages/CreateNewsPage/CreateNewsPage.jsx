import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx'; 
import { storage, db } from '../../firebase.js'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import './CreateNewsPage.css'; 

function CreateNewsPage() {
  const { currentUser, userName, loading: authLoading } = useAuth(); 
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(''); 
  const [imageFile, setImageFile] = useState(null); 
  const [sections, setSections] = useState([]); 

  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState('');

  // Cargar secciones dinámicamente (RF-08)
  useEffect(() => {
    const sectionsColRef = collection(db, 'sections');
    const unsubscribe = onSnapshot(sectionsColRef, (snapshot) => {
        const sectionsData = snapshot.docs.map(doc => doc.data().name); 
        setSections(sectionsData);
        if (sectionsData.length > 0 && !category) {
            setCategory(sectionsData[0]); 
        }
    }, (err) => {
        // Mejor manejo de errores de lectura
        console.error("Error al cargar secciones (Revisa Reglas de Firestore): ", err);
        setError("Error al cargar las secciones. Por favor, revisa tus reglas de seguridad de Firestore.");
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
    if (!category) { 
        setError('Por favor, selecciona una categoría.');
        return;
    }

    setLoading(true);
    setError('');

    try {
      const storageRef = ref(storage, `news-images/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);

      const newsCollectionRef = collection(db, 'news');
      await addDoc(newsCollectionRef, {
        title,
        subtitle,
        content,
        category,
        imageUrl,
        author: currentUser.uid, 
        authorName: userName, 
        status: 'Edición', 
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

  if (authLoading) {
    return <p className="loading-message">Cargando datos de usuario...</p>;
  }

  return (
    <div className="form-page-container"> 
      <div className="form-card"> 
        <h2 className="form-title">Crear Nueva Noticia</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          
          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label htmlFor="title" className="form-label">Título:</label>
            <input
              id="title" type="text" value={title}
              onChange={(e) => setTitle(e.target.value)} required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="subtitle" className="form-label">Subtítulo (Bajante):</label>
            <input
              id="subtitle" type="text" value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)} required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category" className="form-label">Categoría:</label>
            <select 
              id="category" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              required
              className="form-input form-select"
            >
              {sections.length === 0 && !error ? (
                // Muestra "Cargando" solo si no hay error y no hay secciones
                <option value="" disabled>Cargando secciones...</option>
              ) : sections.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
              ))}
              {/* Si hay error, el campo queda vacío y el mensaje de error aparece arriba */}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="image" className="form-label">Imagen de Portada:</label>
            <input
              id="image" type="file"
              onChange={handleImageChange} required
              accept="image/*" 
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">Contenido:</label>
            <textarea
              id="content" value={content}
              onChange={(e) => setContent(e.target.value)} required
              rows="10"
              className="form-input form-textarea"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading || authLoading || sections.length === 0} // Deshabilitar si no hay secciones
            className="btn-primary btn-form-submit" 
          >
            {loading ? 'Guardando...' : 'Guardar Noticia (en Edición)'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateNewsPage;